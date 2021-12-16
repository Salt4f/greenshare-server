const validate = require('../utils/data-validation');
const logger = require('../utils/logger');
const { inspect } = require('util');
const { distanceBetweenPoints } = require('../utils/math');
const dataEncoding = require('../utils/data');
const sharp = require('sharp');
const { compressIcon, compressPhoto } = require('../utils/images');
const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { postsValidation } = require('../utils/posts-validation');
const {
    BadRequestError,
    UnauthenticatedError,
    InternalServerError,
    NotFoundError,
} = require('../errors');

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
        throw new BadRequestError(message);
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

const editOfferService = async (requestBody, offerId) => {
    const { id, name, description, terminateAt, location, tags, icon, photos } =
        requestBody;
    let status, infoMessage;
    logger.log('Starting data validation of id and offerId...', 1);

    if (!validate.id(id)) {
        throw new BadRequestError(`Invalid id`);
    }

    if (!validate.id(offerId)) {
        throw new BadRequestError(`Invalid offerId`);
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
        throw new NotFoundError(`Offer with given id not found`);
    }
    logger.log('Found Offer, starting...', 1);

    if (name != undefined) {
        if (validate.name(name)) {
            offer.name = name;
        } else {
            throw new BadRequestError(`Invalid name`);
        }
    }

    if (description != undefined) {
        if (validate.description(description)) {
            offer.description = description;
        } else {
            throw new BadRequestError('Invalid description');
        }
    }

    if (terminateAt != undefined) {
        if (validate.terminateAt(terminateAt)) {
            offer.terminateAt = terminateAt;
        } else {
            throw new BadRequestError(`Invalid terminateAt date`);
        }
    }

    if (location != undefined) {
        if (validate.location(location)) {
            offer.location = location;
        } else {
            throw new BadRequestError(`Invalid location`);
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
            logger.log('Setting new tags', 1);
            offer.setTags(newTags);
        }
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
            throw new BadRequestError(`Missing photos`);
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
            throw new BadRequestError(`Missing icon`);
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
        throw new NotFoundError(`Offer with id: ${offerId} not found`);
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

    offersFinal.sort((a, b) => {
        return b.dataValues.distance - a.dataValues.distance;
    });

    let offersSlice = [];

    if (quantity !== undefined) {
        offersSlice = offersFinal.slice(0, quantity);
    } else {
        offersSlice = offersFinal;
    }

    if (offersSlice.length === 0) {
        logger.log(
            `There's no offer(s) with such parameters, sending back an empty array`,
            1
        );
    } else {
        logger.log(`Got offer(s), sending back response...`, 1);
    }

    status = StatusCodes.OK;
    infoMessage = offersSlice;
    return { status, infoMessage };
};

const offerRequestService = async (requestId, offerId) => {
    let status, infoMessage;
    logger.log(`Starting postsValidation...`, 1);
    const { statusValidation, messageValidation, request, offer } =
        await postsValidation(offerId, requestId);

    if (statusValidation == false) {
        throw new BadRequestError(messageValidation);
    }
    logger.log(messageValidation, 1);
    logger.log(
        `Checking if request already has offer as 'pendingOffers'...`,
        1
    );
    for (let off of request.Offers) {
        if (off.dataValues.id == offerId) {
            throw new BadRequestError(
                `Offer with id: ${offerId} already offered to Request with id: ${requestId}`
            );
        }
    }
    logger.log(`Validating status...`, 1);
    if (request.status != 'idle' || offer.status != 'idle') {
        throw new BadRequestError(
            `Invalid request.status or offer.status (not idle)`
        );
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

const acceptRequestService = async (offerId, requestId) => {
    let status, infoMessage;
    logger.log(`Starting postsValidation...`, 1);
    const { statusValidation, messageValidation, offer } =
        await postsValidation(offerId, requestId);
    if (statusValidation == false) {
        throw new BadRequestError(messageValidation);
    }
    logger.log(messageValidation, 1);
    logger.log(`Checking if offer is already accepted...`, 1);
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
        throw new BadRequestError(`This offer is already accepted`);
    }
    logger.log(
        `Offer with id: ${offerId} accepted Request with id: ${requestId}`,
        1
    );
    logger.log(`Updating others request' status from pendingRequests...`, 1);
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
            logger.log('Deactivating request...', 1);
            await request.update({ active: false });
            request.save();
            logger.log('Request deactivated...', 1);
        }
    }
    logger.log('Deactivating offer...', 1);
    await offer.update({ active: false });
    offer.save();
    logger.log('Offer deactivated...', 1);

    status = StatusCodes.OK;
    infoMessage = `Offer with id: ${offerId} accepted Request with id: ${requestId}`;
    return { status, infoMessage };
};

const rejectRequestService = async (offerId, requestId) => {
    let status, infoMessage;
    logger.log(`Starting postsValidation...`, 1);
    const { statusValidation, messageValidation, offer } =
        await postsValidation(offerId, requestId);
    if (statusValidation == false) {
        throw new BadRequestError(`This offer is already accepted`);
    }
    logger.log(messageValidation, 1);
    logger.log(`Got offer, checking its pendingRequests...`, 1);
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
        throw new BadRequestError(
            `Offer with id: ${offerId} doesn't have Request with id: ${requestId} as pending`
        );
    }

    offer.setRequests(newPendingRequests);
    logger.log(`Updated Offers' pending requests, sending response...`, 1);

    status = StatusCodes.OK;
    infoMessage = `Offer with id: ${offerId} rejected Request with id: ${requestId}`;
    return { status, infoMessage };
};

const completeRequestService = async (requestId, offerId, valoration) => {
    let status, infoMessage;

    const acceptedPost = await db.acceptedPosts.findOne({
        where: {
            offerId: offerId,
        },
    });
    logger.log(`Checking if AcceptedPost is valid...`, 1);
    if (acceptedPost === null) {
        throw new BadRequestError(`Not accepted yet`);
    }
    const [completedPost, created] = await db.completedPosts.findOrCreate({
        where: {
            acceptedPostId: acceptedPost.id,
        },
        defaults: {
            acceptedPostId: acceptedPost.id,
        },
    });
    if (!created) {
        throw new BadRequestError(`This post is already completed`);
    }
    if (valoration) {
        logger.log(`Adding valoration to completedPost`, 1);
        await completedPost.update({ valoration: valoration });
        completedPost.save();
        logger.log(`Added valoration to completedPost`, 1);
    }
    logger.log('Created completedPost', 1);
    status = StatusCodes.OK;
    infoMessage = `Request with id: ${requestId} confirmed transaction`;
    return { status, infoMessage };
};

module.exports = {
    createOfferService,
    editOfferService,
    getOfferByIdService,
    getOffersByQueryService,
    offerRequestService,
    acceptRequestService,
    rejectRequestService,
    completeRequestService,
};
