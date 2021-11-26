const { StatusCodes } = require('http-status-codes');
const db = require('../db/connect');
const validate = require('../utils/data-validation');
const logger = require('../utils/logger');
const { inspect } = require('util');
const { distanceBetweenPoints } = require('../utils/math');
const dataEncoding = require('../utils/data');
const sharp = require('sharp');
const { compressIcon, compressPhoto } = require('../utils/images');

const createOfferService = async (requestBody) => {
    const { id, name, description, terminateAt, location, icon, photos, tags } =
        requestBody;
    let status, infoMessage;

    logger.log('Starting data validation...', 1);
    const { passed, message } = validate.offer(
        id,
        name,
        description,
        terminateAt,
        location,
        icon,
        photos,
        tags
    );

    if (!passed) {
        logger.log(message, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = message;
        return { status, infoMessage };
    }
    logger.log(message, 1);

    logger.log('Parsing icon...', 1);
    const parsedIcon = dataEncoding.base64ToBuffer(icon);
    logger.log('Parsed icon', 1);

    logger.log('Compressing icon...', 1);
    const compressedIcon = await compressIcon(parsedIcon);
    logger.log('Compressed icon...', 1);

    logger.log('Creating offer...', 1);
    const offer = await db.offers.create({
        name,
        description,
        terminateAt,
        location,
        icon: compressedIcon,
        ownerId: id,
    });
    logger.log('Created offer, setting up photos...', 1);

    for (let photo of photos) {
        logger.log('Parsing photo...', 1);
        const parsedPhoto = dataEncoding.base64ToBuffer(photo);
        logger.log('Parsed photo', 1);
        logger.log('Compressing photo...', 1);
        const compressedPhoto = await compressPhoto(parsedPhoto);
        logger.log('Compressed photo...', 1);
        logger.log('Adding photo to database...', 1);
        await db.photos.create({
            image: compressedPhoto,
            offerId: offer.dataValues.id,
        });
        logger.log('Photo added to database...', 1);
    }

    logger.log('Setting up tags...', 1);
    for (const element of tags) {
        const [tag, created] = await db.tags.findOrCreate({
            where: {
                name: element.name,
            },
            defaults: {
                name: element.name,
                isOfficial: false,
                color: element.color != undefined ? element.color : null,
            },
        });

        logger.log(
            `Current tag's id: ${tag.id}, name: ${tag.name}, isOfficial: ${tag.isOfficial}, color: ${tag.color}`,
            1
        );
        logger.log('Adding tag to offer...', 1);
        await offer.addTag(tag);
        logger.log(
            `Added tag with id: ${tag.id} to offer with id: ${offer.id}`,
            1
        );
    }

    logger.log('Successfully created offer, sending response...', 1);
    status = StatusCodes.CREATED;
    infoMessage = {
        id: offer.id,
        createdAt: offer.createdAt,
    };
    return { status, infoMessage };
};

const createRequestService = async (requestBody) => {
    const { id, name, description, terminateAt, location, tags } = requestBody;
    let status, infoMessage;

    logger.log('Starting data validation...', 1);
    const { passed, message } = validate.request(
        id,
        name,
        description,
        terminateAt,
        location,
        tags
    );

    if (!passed) {
        logger.log(message, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = message;
        return { status, infoMessage };
    }
    logger.log(message, 1);
    logger.log('Creating request...', 1);
    const request = await db.requests.create({
        name,
        description,
        terminateAt,
        location,
        ownerId: id,
    });

    logger.log('Created request, setting up tags...', 1);
    for (const element of tags) {
        const [tag, created] = await db.tags.findOrCreate({
            where: {
                name: element.name,
            },
            defaults: {
                name: element.name,
                isOfficial: false,
                color: element.color != undefined ? element.color : null,
            },
        });

        logger.log(
            `Current tag's id: ${tag.id}, name: ${tag.name}, isOfficial: ${tag.isOfficial}, color: ${tag.color}`,
            1
        );
        logger.log('Adding tag to request...', 1);
        await request.addTag(tag);
        logger.log(
            `Added tag with id: ${tag.id} to request with id: ${request.id}`,
            1
        );
    }

    logger.log('Successfully created request, sending response...', 1);
    status = StatusCodes.CREATED;
    infoMessage = {
        id: request.id,
        createdAt: request.createdAt,
    };
    return { status, infoMessage };
};

const editRequestService = async (requestBody, requestId) => {
    const { id, name, description, terminateAt, location, tags } = requestBody;
    let status, infoMessage;

    logger.log('Starting data validation of id and requestId...', 1);
    if (!validate.id(id)) {
        infoMessage = `Invalid id`;
        status = StatusCodes.BAD_REQUEST;
        return { status, infoMessage };
    }

    if (!validate.id(requestId)) {
        infoMessage = `Invalid requestId`;
        status = StatusCodes.BAD_REQUEST;
        return { status, infoMessage };
    }
    logger.log(
        'Data validation of id and requestId passed, finding request..',
        1
    );
    const request = await db.requests.findOne({
        where: {
            id: requestId,
            active: true,
        },
    });

    if (request == undefined) {
        logger.log(
            `request with id: ${requestId} not found, sending response...`,
            1
        );
        infoMessage = `Request with given id not found`;
        status = StatusCodes.NOT_FOUND;
        return { status, infoMessage };
    }
    logger.log(`Request found, starting...`, 1);
    if (name != undefined) {
        if (validate.name(name)) {
            request.name = name;
        } else {
            infoMessage = `Invalid name`;
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (description != undefined) {
        if (validate.description(description)) {
            request.description = description;
        } else {
            infoMessage = `Invalid description`;
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (terminateAt != undefined) {
        if (validate.terminateAt(terminateAt)) {
            request.terminateAt = terminateAt;
        } else {
            infoMessage = `Invalid terminateAt date`;
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (location != undefined) {
        if (validate.location(location)) {
            request.location = location;
        } else {
            infoMessage = `Invalid location`;
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (tags != undefined) {
        if (validate.tags(tags)) var newTags = [];
        for (var newTagObject of tags) {
            const [newTag, created] = await db.tags.findOrCreate({
                where: {
                    name: newTagObject.name,
                },
                defaults: {
                    name: newTagObject.name,
                    color:
                        newTagObject.color != undefined
                            ? newTagObject.color
                            : null,
                    isOfficial: false,
                },
            });

            logger.log(
                `Current tag's id: ${newTag.id}, name: ${newTag.name}, isOfficial: ${newTag.isOfficial}`,
                1
            );
            newTags.push(newTag);
        }
        request.setTags(newTags);
    }
    request.save();
    infoMessage = `Successfully edited Request`;
    status = StatusCodes.OK;
    return { status, infoMessage };
};

const editOfferService = async (requestBody, offerId) => {
    const { id, name, description, terminateAt, location, tags, icon, photos } =
        requestBody;
    let status, infoMessage;
    logger.log('Starting data validation of id and offerId...', 1);

    if (!validate.id(id)) {
        infoMessage = { error: `Invalid id` };
        status = StatusCodes.BAD_REQUEST;
        return { status, infoMessage };
    }

    if (!validate.id(offerId)) {
        infoMessage = { error: `Invalid offerId` };
        status = StatusCodes.BAD_REQUEST;
        return { status, infoMessage };
    }

    logger.log('Data validation of id and offerId passed, finding Offer...', 1);
    const offer = await db.offers.findOne({
        where: {
            id: offerId,
            active: true,
        },
    });

    if (offer == undefined) {
        logger.log(
            `offer with id: ${offerId} not found, sending response...`,
            1
        );
        infoMessage = { error: `Offer with given id not found` };
        status = StatusCodes.NOT_FOUND;
        return { status, infoMessage };
    }
    logger.log('Found Offer, starting...', 1);

    if (name != undefined) {
        if (validate.name(name)) {
            offer.name = name;
        } else {
            infoMessage = `Invalid name`;
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (description != undefined) {
        if (validate.description(description)) {
            offer.description = description;
        } else {
            infoMessage = `Invalid description`;
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (terminateAt != undefined) {
        if (validate.terminateAt(terminateAt)) {
            offer.terminateAt = terminateAt;
        } else {
            infoMessage = `Invalid terminateAt date`;
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (location != undefined) {
        if (validate.location(location)) {
            offer.location = location;
        } else {
            var message = `Invalid location`;
            res.status(StatusCodes.BAD_REQUEST).json({
                error: message,
            });
            return;
        }
    }

    if (tags != undefined) {
        if (validate.tags(tags)) var newTags = [];
        for (var newTagObject of tags) {
            const [newTag, created] = await db.tags.findOrCreate({
                where: {
                    name: newTagObject.name,
                },
                defaults: {
                    name: newTagObject.name,
                    color:
                        newTagObject.color != undefined
                            ? newTagObject.color
                            : null,
                    isOfficial: false,
                },
            });

            logger.log(
                `Current tag's id: ${newTag.id}, name: ${newTag.name}, isOfficial: ${newTag.isOfficial}`,
                1
            );
            newTags.push(newTag);
        }
        offer.setTags(newTags);
    }
    if (photos != undefined) {
        if (validate.photos(photos)) {
            offer.photos = photos;
        } else {
            var message = `missing photos`;
            res.status(StatusCodes.BAD_REQUEST).json({
                error: message,
            });
            return;
        }
    }
    if (icon != undefined) {
        if (validate.icon(icon)) {
            logger.log('Parsing icon...', 1);
            const parsedIcon = dataEncoding.base64ToBuffer(icon);
            logger.log('Parsed icon', 1);

            logger.log('Compressing icon...', 1);
            let compressedIcon;
            compressedIcon = await sharp(parsedIcon);
            const { width, height } = compressedIcon.metadata();
            if (height < width) {
                compressedIcon = compressedIcon
                    .resize({
                        width: height,
                        height: height,
                    })
                    .toFormat('jpg', { quality: 15 })
                    .toBuffer();
            } else {
                compressedIcon = compressedIcon
                    .resize({
                        width: width,
                        height: width,
                    })
                    .toFormat('jpg', { quality: 15 })
                    .toBuffer();
            }
            logger.log('Compressed icon...', 1);

            offer.icon = compressedIcon;
        } else {
            var message = `missing icon`;
            res.status(StatusCodes.BAD_REQUEST).json({
                error: message,
            });
            return;
        }
    }

    logger.log('Updating offer...', 1);
    offer.save();
    res.send('Offer updated');
    return;
};

const getOfferByIdService = async (requestBody) => {};

const getRequestByIdService = async (requestBody) => {};

const getOffersByQueryService = async (requestBody) => {};

const getRequestByQueryService = async (requestBody) => {};

const requestOfferService = async (requestBody) => {};

module.exports = {
    createOfferService,
    createRequestService,
    editRequestService,
    editOfferService,
    getOfferByIdService,
    getRequestByIdService,
    getOffersByQueryService,
    getRequestByQueryService,
    requestOfferService,
};
