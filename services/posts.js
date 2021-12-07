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
    const buff = Buffer.from(icon, 'base64');
    logger.log('Parsed icon', 1);
    logger.log('Compressing icon...', 1);
    const compressedIcon = await compressIcon(buff);
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
        const buff = Buffer.from(photo, 'base64');
        logger.log('Parsed photo', 1);
        logger.log('Compressing photo...', 1);
        const compressedPhoto = await compressPhoto(buff);
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

    logger.log('Successfully created offer, sending back response...', 1);
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

    logger.log('Successfully created request, sending back response...', 1);
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
        logger.log(`Invalid id`, 1);
        infoMessage = { error: `Invalid id` };
        status = StatusCodes.BAD_REQUEST;
        return { status, infoMessage };
    }

    if (!validate.id(requestId)) {
        logger.log(`Invalid requestId`, 1);
        infoMessage = { error: `Invalid requestId` };
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
            `Request with id: ${requestId} not found, sending response...`,
            1
        );
        infoMessage = { error: `Request with given id not found` };
        status = StatusCodes.NOT_FOUND;
        return { status, infoMessage };
    }
    logger.log(`Request found, starting...`, 1);
    if (name != undefined) {
        if (validate.name(name)) {
            request.name = name;
        } else {
            logger.log(`Invalid name`, 1);
            infoMessage = { error: `Invalid name` };
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (description != undefined) {
        if (validate.description(description)) {
            request.description = description;
        } else {
            logger.log(`Invalid description`, 1);
            infoMessage = { error: `Invalid description` };
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (terminateAt != undefined) {
        if (validate.terminateAt(terminateAt)) {
            request.terminateAt = terminateAt;
        } else {
            logger.log(`Invalid terminateAt date`, 1);
            infoMessage = { error: `Invalid terminateAt date` };
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (location != undefined) {
        if (validate.location(location)) {
            request.location = location;
        } else {
            logger.log(`Invalid location`, 1);
            infoMessage = { error: `Invalid location` };
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (tags != undefined) {
        if (validate.tags(tags)) {
            let newTags = [];
            for (let newTagObject of tags) {
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
        }
        logger.log(`Setting new tags`, 1);
        request.setTags(newTags);
    }
    request.save();
    logger.log(`Successfully edited Request`, 1);
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
        logger.log('Invalid id', 1);
        infoMessage = { error: `Invalid id` };
        status = StatusCodes.BAD_REQUEST;
        return { status, infoMessage };
    }

    if (!validate.id(offerId)) {
        logger.log('Invalid offerId', 1);
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
            logger.log('Invalid name', 1);
            infoMessage = { error: `Invalid name` };
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (description != undefined) {
        if (validate.description(description)) {
            offer.description = description;
        } else {
            logger.log('Invalid description', 1);
            infoMessage = `Invalid description`;
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (terminateAt != undefined) {
        if (validate.terminateAt(terminateAt)) {
            offer.terminateAt = terminateAt;
        } else {
            logger.log(`Invalid terminateAt date`, 1);
            infoMessage = { error: `Invalid terminateAt date` };
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (location != undefined) {
        if (validate.location(location)) {
            offer.location = location;
        } else {
            logger.log(`Invalid location`, 1);
            infoMessage = { error: `Invalid location` };
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }

    if (tags != undefined) {
        if (validate.tags(tags)) {
            let newTags = [];
            for (let newTagObject of tags) {
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
        }
        logger.log('Setting new tags', 1);
        offer.setTags(newTags);
    }
    if (photos != undefined) {
        if (validate.photos(photos)) {
            let newPhotos = [];
            for (let newPhotoObject of photos) {
                logger.log('Parsing photo...', 1);
                const buff = Buffer.from(newPhotoObject, 'base64');
                logger.log('Parsed photo', 1);
                logger.log('Compressing photo...', 1);
                const compressedPhoto = await compressPhoto(buff);
                logger.log('Compressed photo...', 1);
                logger.log('Adding photo to database...', 1);
                const newPhoto = await db.photos.create({
                    image: compressedPhoto,
                    offerId: offer.dataValues.id,
                });
                logger.log('Photo added to database...', 1);
                newPhotos.push(newPhoto);
            }
            offer.setPhotos(newPhotos);
            logger.log(`Photos updated`, 1);
        } else {
            logger.log(`Missing photos`, 1);
            infoMessage = { error: `Missing photos` };
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }
    if (icon != undefined) {
        if (validate.icon(icon)) {
            logger.log('Parsing icon...', 1);
            const parsedIcon = dataEncoding.base64ToBuffer(icon);
            logger.log('Parsed icon', 1);

            logger.log('Compressing icon...', 1);
            const compressedIcon = await compressIcon(parsedIcon);
            offer.icon = compressedIcon;
        } else {
            logger.log(`Missing icon`, 1);
            infoMessage = { error: `missing icon` };
            status = StatusCodes.BAD_REQUEST;
            return { status, infoMessage };
        }
    }
    offer.save();
    logger.log('Offer updated, sending response...', 1);
    infoMessage = 'Offer updated';
    status = StatusCodes.OK;
    return { status, infoMessage };
};

const getOfferByIdService = async (offerId) => {
    logger.log(`The offerId is: ${offerId}`, 1);
    let status, infoMessage;

    logger.log(`Looking for offer in db...`, 1);
    const offer = await db.offers.findOne({
        where: { id: offerId },
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial', 'color'],
            },
            {
                model: db.photos,
                attributes: ['image'],
            },
            {
                model: db.requests,
                attributes: ['id', 'location', 'name', 'ownerId'],
            },
        ],
    });

    if (offer == null) {
        logger.log(
            `Offer with id: ${offerId} not found, sending response...`,
            1
        );
        status = StatusCodes.NOT_FOUND;
        infoMessage = { error: `Offer with id: ${offerId} not found` };
        return { status, infoMessage };
    }
    logger.log(`Got offer with id: ${offerId}`, 1);

    const user = await db.users.findOne({
        where: { id: offer.ownerId },
        attributes: ['nickname'],
    });
    offer.dataValues.author = user.nickname;

    logger.log('Cleaning up tags...', 1);
    for (let t of offer.tags) {
        delete t.dataValues.OfferTag;
    }
    logger.log('Encoding icon to base64...', 1);
    offer.icon = dataEncoding.bufferToBase64(offer.icon);
    logger.log('Encoded icon to base64', 1);

    let photosArray = [];

    logger.log('Encoding photos to base64...', 1);
    for (let photo of offer.Photos) {
        photosArray.push(dataEncoding.bufferToBase64(photo.dataValues.image));
    }
    logger.log('Encoded photos to base64...', 1);
    offer.dataValues.photos = photosArray;
    delete offer.dataValues.Photos;
    logger.log(`Sending back offer with id: ${offerId}...`, 1);

    status = StatusCodes.OK;
    infoMessage = offer;
    return { status, infoMessage };
};

const getRequestByIdService = async (requestId) => {
    logger.log(`The requestId is: ${requestId}`, 1);
    let status, infoMessage;

    logger.log(`Looking for request in db...`, 1);
    const request = await db.requests.findOne({
        where: { id: requestId },
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial', 'color'],
            },
            {
                model: db.offers,
                attributes: ['id', 'location', 'name', 'ownerId'],
            },
        ],
    });

    if (request == null) {
        logger.log(
            `request with id: ${requestId} not found, sending response...`,
            1
        );
        status = StatusCodes.NOT_FOUND;
        infoMessage = { error: `request with id: ${requestId} not found` };
        return { status, infoMessage };
    }

    logger.log('Cleaning up tags...', 1);
    for (let t of request.tags) {
        delete t.dataValues.RequestTag;
    }
    logger.log(`Got request with id: ${requestId}, sending back...`, 1);
    status = StatusCodes.OK;
    infoMessage = request;
    return { status, infoMessage };
};

const getOffersByQueryService = async (requestQuery) => {
    const { location, owner, quantity } = requestQuery;
    let { tags, distance } = requestQuery;
    let tagsArray = [];
    let whereObject = {
        active: true,
    };
    let status, infoMessage;

    if (tags !== undefined) {
        tagsArray = tags.split(';');
    }

    if (owner !== undefined) {
        whereObject.ownerId = owner;
    }

    logger.log(
        `Query params are: location: ${location}, distance: ${distance}, tags: ${tagsArray}, owner: ${owner}, quantity: ${quantity}`,
        1
    );

    logger.log(`Selecting query...`, 1);

    const offersFinal = [];

    const offers = await db.offers.findAll({
        where: whereObject,
        attributes: ['id', 'location', 'name', 'icon', 'ownerId'],
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial', 'color'],
            },
            {
                model: db.photos,
                attributes: ['image'],
            },
        ],
    });

    const queryLocation = location.replace(',', '.').split(';');

    let numTags = tagsArray.length;
    logger.log(`Checking tags...`, 1);
    for (const offer of offers) {
        let count = 0;
        for (const tag of offer.tags) {
            for (const tagQuery of tagsArray) {
                if (tagQuery.name == tag.name) count++;
            }
        }

        if (numTags == count) {
            logger.log('Cleaning up tags...', 1);
            for (let t of offer.tags) {
                delete t.dataValues.OfferTag;
            }
            logger.log('Tags cleaned...', 1);

            const user = await db.users.findOne({
                where: { id: offer.ownerId },
                attributes: ['nickname'],
            });

            offer.dataValues.author = user.nickname;

            logger.log(`Checking location...`, 1);
            let offerLocation = offer.location.replace(',', '.').split(';');
            const dist = distanceBetweenPoints(
                parseFloat(offerLocation[0]),
                parseFloat(offerLocation[1]),
                parseFloat(queryLocation[0]),
                parseFloat(queryLocation[1])
            );
            logger.log(`Checking distance...`, 1);
            if (distance === undefined || dist <= parseInt(distance)) {
                offer.dataValues.distance = dist;
                logger.log('Encoding icon to base64...', 1);
                offer.dataValues.icon = dataEncoding.bufferToBase64(
                    offer.dataValues.icon
                );
                logger.log('Encoded icon to base64', 1);

                let photoArray = [];
                logger.log('Encoding photos to base64...', 1);
                for (let photo of offer.Photos) {
                    photoArray.push(
                        dataEncoding.bufferToBase64(photo.dataValues.image)
                    );
                }
                logger.log('Encoded photos to base64...', 1);
                offer.dataValues.photos = photoArray;
                delete offer.dataValues.Photos;
                offersFinal.push(offer);
            }
        }
    }

    if (offersFinal.length === 0) {
        logger.log(`There's no offer(s) with such parameters`, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = `There's no offer(s) with such parameters`;
        return { status, infoMessage };
    }

    offersFinal.sort((a, b) => {
        return b.dataValues.distance - a.dataValues.distance;
    });

    let offersSlice = [];

    if (quantity !== undefined) {
        offersSlice = offersFinal.slice(0, quantity);
    } else {
        offersSlice = offersFinal;
    }
    logger.log(`Got offer(s), sending back response...`, 1);
    status = StatusCodes.OK;
    infoMessage = offersSlice;
    return { status, infoMessage };
};

const getRequestsByQueryService = async (requestQuery) => {
    const { location, owner, quantity } = requestQuery;
    let { tags, distance } = requestQuery;
    let tagsArray = [];
    let whereObject = {
        active: true,
    };
    let status, infoMessage;

    if (tags !== undefined) {
        tagsArray = tags.split(';');
    }

    if (owner !== undefined) {
        whereObject.ownerId = owner;
    }

    logger.log(
        `Query params are: location: ${location}, distance: ${distance}, tags: ${tagsArray}, owner: ${owner}, quantity: ${quantity}`,
        1
    );

    logger.log(`Selecting query...`, 1);

    const requestsFinal = [];

    const requests = await db.requests.findAll({
        where: whereObject,
        attributes: ['id', 'location', 'name', 'ownerId'],
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial', 'color'],
            },
        ],
    });

    const queryLocation = location.replace(',', '.').split(';');

    let numTags = tagsArray.length;
    logger.log(`Checking tags...`, 1);
    for (const request of requests) {
        let count = 0;
        for (const tag of request.tags) {
            for (const tagQuery of tagsArray) {
                if (tagQuery.name == tag.name) count++;
            }
        }
        if (numTags == count) {
            logger.log('Cleaning up tags...', 1);
            for (let t of request.tags) {
                delete t.dataValues.OfferTag;
            }
            logger.log('Tags cleaned...', 1);

            const user = await db.users.findOne({
                where: { id: request.ownerId },
                attributes: ['nickname'],
            });
            request.dataValues.nickname = user.nickname;
            logger.log(`Checking location...`, 1);
            let requestLocation = request.location.replace(',', '.').split(';');
            const dist = distanceBetweenPoints(
                parseFloat(requestLocation[0]),
                parseFloat(requestLocation[1]),
                parseFloat(queryLocation[0]),
                parseFloat(queryLocation[1])
            );
            logger.log(`Checking distance...`, 1);
            if (distance === undefined || dist <= parseInt(distance)) {
                request.dataValues.distance = dist;
                requestsFinal.push(request);
            }
        }
    }

    if (requestsFinal === null) {
        logger.log(`There's no request(s) with such parameters`, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = `There's no request(s) with such parameters`;
        return { status, infoMessage };
    }

    requestsFinal.sort((a, b) => {
        return b.dataValues.distance - a.dataValues.distance;
    });

    let requestsSlice = [];

    if (quantity !== undefined) {
        requestsSlice = requestsFinal.slice(0, quantity);
    } else {
        requestsSlice = requestsFinal;
    }
    logger.log(`Got request(s), sending back response...`, 1);
    status = StatusCodes.OK;
    infoMessage = requestsSlice;
    return { status, infoMessage };
};

const requestOfferService = async (requestId, offerId) => {
    let status, infoMessage;
    // 1. find offer & request
    logger.log(`Searching Offer and Request in db...`, 1);
    const request = await db.requests.findOne({
        where: { id: requestId },
        include: { model: db.offers },
    });
    const offer = await db.offers.findOne({
        where: { id: offerId },
        include: { model: db.requests },
    });
    logger.log(`Checking if they exist...`, 1);
    if (request === null || offer === null) {
        logger.log(`Invalid requestId or offerId`, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = { error: `Invalid requestId or offerId` };
        return { status, infoMessage };
    }
    logger.log(`Checking if user is requesting its own Offer...`, 1);
    if (request.ownerId === offer.ownerId) {
        logger.log(`User is requesting its own Offer`, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = {
            error: `User is requesting its own Offer`,
        };
        return { status, infoMessage };
    }
    logger.log(
        `Checking if offer already has request as 'pendingRequests'...`,
        1
    );
    for (let req of offer.Requests) {
        if (req.dataValues.id == requestId) {
            logger.log(
                `Request with id: ${requestId} already requested to Offer with id: ${offerId}`,
                1
            );
            status = StatusCodes.BAD_REQUEST;
            infoMessage = {
                error: `Request with id: ${requestId} already requested to Offer with id: ${offerId}`,
            };
            return { status, infoMessage };
        }
    }
    logger.log('Adding request to Offer...', 1);
    await offer.addRequest(request);
    logger.log('Added request to Offer...', 1);
    logger.log(`Updating request' status to pending...`, 1);
    await request.update({ status: 'pending' });
    request.save();
    logger.log(`Updated Request' status`, 1);
    logger.log(
        `Added request with id: ${requestId} to offer with id: ${offerId}`,
        1
    );
    status = StatusCodes.OK;
    infoMessage = `Added request with id: ${requestId} to offer with id: ${offerId}`;
    return { status, infoMessage };
};

const acceptRequestService = async (offerId, requestId) => {
    let status, infoMessage;

    const [acceptedPost, created] = await db.acceptedPosts.findOrCreate({
        where: {
            offerId: offerId,
        },
        defaults: {
            offerId: offerId,
            requestId: requestId,
        },
    });
    if (!created) {
        status = StatusCodes.BAD_REQUEST;
        infoMessage = { error: `This offer is already accepted` };
        return { status, infoMessage };
    }
    logger.log(
        `Offer with id: ${offerId} accepted Request with id: ${requestId}`,
        1
    );

    const offer = await db.offers.findOne({
        where: { id: offerId },
        include: { model: db.requests },
    });

    for (let req of offer.Requests) {
        const request = await db.requests.findOne({
            where: { id: req.dataValues.id },
        });
        if (request.id != requestId) {
            await request.update({ status: 'rejected' });
            request.save();
        } else {
            await request.update({ status: 'accepted' });
            request.save();
        }
    }

    status = StatusCodes.OK;
    infoMessage = `Offer with id: ${offerId} accepted Request with id: ${requestId}`;
    return { status, infoMessage };
};

const rejectRequestService = async (offerId, requestId) => {
    let status, infoMessage;
    logger.log(`Searching offer...`, 1);
    const offer = await db.offers.findOne({
        where: { id: offerId },
        include: { model: db.requests },
    });
    logger.log(`Got offer, checking its pending requests...`, 1);
    let found = false;
    let newPendingRequests = [];
    for (let req of offer.Requests) {
        if (req.dataValues.id == requestId) {
            found = true;
            const request = await db.requests.findOne({
                where: { id: req.dataValues.id },
            });
            await request.update({ status: 'rejected' });
            request.save();
            logger.log(
                `Updated Request with id: ${req.dataValues.id} to 'rejected'`,
                1
            );
        } else {
            newPendingRequests.push(req);
        }
    }

    if (!found) {
        status = StatusCodes.BAD_REQUEST;
        infoMessage = {
            error: `Offer with id: ${offerId} doesn't have Request with id: ${requestId} as pending`,
        };
        return { status, infoMessage };
    }

    offer.setRequests(newPendingRequests);
    logger.log(`Updated Offers' pending requests, sending response...`, 1);

    status = StatusCodes.OK;
    infoMessage = `Offer with id: ${offerId} rejected Request with id: ${requestId}`;
    return { status, infoMessage };
};

const offerRequestService = async (requestId, offerId) => {
    let status, infoMessage;
    // 1. find offer & request
    logger.log(`Searching Request and Offer in db...`, 1);
    const request = await db.requests.findOne({
        where: { id: requestId },
        include: { model: db.offers },
    });
    const offer = await db.offers.findOne({
        where: { id: offerId },
        include: { model: db.requests },
    });
    logger.log(`Checking if they exist...`, 1);
    if (request === null || offer === null) {
        logger.log(`Invalid requestId or offerId`, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = { error: `Invalid requestId or offerId` };
        return { status, infoMessage };
    }
    logger.log(`Checking if user is requesting its own Offer...`, 1);
    if (request.ownerId === offer.ownerId) {
        logger.log(`User is offering its own Request`, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = {
            error: `User is offering its own Request`,
        };
        return { status, infoMessage };
    }
    logger.log(
        `Checking if request already has offer as 'pendingOffers'...`,
        1
    );
    for (let off of request.Offers) {
        if (off.dataValues.id == offerId) {
            logger.log(
                `Offer with id: ${offerId} already offered to Request with id: ${requestId}`,
                1
            );
            status = StatusCodes.BAD_REQUEST;
            infoMessage = {
                error: `Offer with id: ${offerId} already offered to Request with id: ${requestId}`,
            };
            return { status, infoMessage };
        }
    }
    logger.log('Adding offer to Request...', 1);
    await request.addOffer(offer);
    logger.log('Added offer to Request...', 1);
    logger.log(`Updating offers' status to pending...`, 1);
    await offer.update({ status: 'pending' });
    offer.save();
    logger.log(`Updated Offer' status`, 1);
    logger.log(
        `Added offer with id: ${offerId} to request with id: ${requestId}`,
        1
    );
    status = StatusCodes.OK;
    infoMessage = `Added offer with id: ${offerId} to request with id: ${requestId}`;
    return { status, infoMessage };
};

const completePostService = async (requestId, offerId) => {
    let status, infoMessage;

    const acceptedPost = await db.acceptedPosts.findOne({
        where: {
            offerId: offerId,
        },
    });
    if (acceptedPost === null) {
        status = StatusCodes.BAD_REQUEST;
        infoMessage = `Not accepted yet`;
        return { status, infoMessage };
    }
    const [competedPost, created] = await db.completedPosts.findOrCreate({
        where: {
            acceptedPostId: acceptedPost.id,
        },
        defaults: {
            acceptedPostId: acceptedPost.id,
        },
    });
    if (!created) {
        status = StatusCodes.BAD_REQUEST;
        infoMessage = { error: `This post is already completed` };
        return { status, infoMessage };
    }
    logger.log('Deactivating offer...', 1);
    const offer = await db.offers.findOne({
        where: { id: offerId },
    });
    await offer.update({ active: false });
    logger.log('Offer deactivated...', 1);
    logger.log('Deactivating request...', 1);
    const request = await db.requests.findOne({
        where: { id: requestId },
    });
    await request.update({ active: false });
    logger.log('Request deactivated...', 1);

    logger.log('Created completedPost', 1);
    status = StatusCodes.OK;
    infoMessage = `Request with id: ${requestId} confirmed transaction`;
    return { status, infoMessage };
};

module.exports = {
    createOfferService,
    createRequestService,
    editRequestService,
    editOfferService,
    getOfferByIdService,
    getRequestByIdService,
    getOffersByQueryService,
    getRequestsByQueryService,
    requestOfferService,
    acceptRequestService,
    rejectRequestService,
    offerRequestService,
    completePostService,
};
