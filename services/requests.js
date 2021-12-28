const validate = require('../utils/data-validation');
const logger = require('../utils/logger');
const { inspect } = require('util');
const { distanceBetweenPoints } = require('../utils/math');
const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { postsValidation } = require('../utils/posts-validation');
const { BadRequestError, NotFoundError } = require('../errors');
const { Op } = require('sequelize');

const createRequestService = async (userId, requestBody) => {
    const { name, description, terminateAt, location, tags } = requestBody;
    let status, infoMessage;

    logger.log('Starting data validation...', 1);
    const { passed, message } = validate.request(
        userId,
        name,
        description,
        terminateAt,
        location,
        tags
    );

    if (!passed) {
        throw new BadRequestError(message);
    }
    logger.log(message, 1);
    logger.log('Creating request...', 1);
    const request = await db.requests.create({
        name,
        description,
        terminateAt,
        location,
        ownerId: userId,
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
    const { name, description, terminateAt, location, tags } = requestBody;
    let status, infoMessage;

    logger.log('Starting data validation of requestId...', 1);
    if (!validate.id(requestId)) {
        throw new BadRequestError(`Invalid requestId`);
    }
    logger.log('Data validation of requestId passed, finding request..', 1);
    const request = await db.requests.findOne({
        where: {
            id: requestId,
            active: true,
        },
    });

    if (request == undefined) {
        throw new BadRequestError(
            `Request with id: ${requestId} not found, sending response...`
        );
    }
    logger.log(`Request found, starting...`, 1);
    if (name != undefined) {
        if (validate.name(name)) {
            request.name = name;
        } else {
            throw new BadRequestError(`Invalid name`);
        }
    }

    if (description != undefined) {
        if (validate.description(description)) {
            request.description = description;
        } else {
            throw new BadRequestError(`Invalid description`);
        }
    }

    if (terminateAt != undefined) {
        if (validate.terminateAt(terminateAt)) {
            request.terminateAt = terminateAt;
        } else {
            throw new BadRequestError(`Invalid terminateAt date`);
        }
    }

    if (location != undefined) {
        if (validate.location(location)) {
            request.location = location;
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
            logger.log(`Setting new tags`, 1);
            request.setTags(newTags);
        }
    }
    request.save();
    logger.log(`Successfully edited Request`, 1);
    infoMessage = `Successfully edited Request`;
    status = StatusCodes.OK;
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
        throw new NotFoundError(`Request with id: ${requestId} not found`);
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

const getRequestsByQueryService = async (requestQuery, userId) => {
    const { location, owner, quantity, q } = requestQuery;
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

    if (q) {
        logger.log(`This is a search request, q = ${q}`, 1);
        whereObject.name = {
            [Op.substring]: q,
        };
    }

    logger.log(
        `Query params are: location: ${location}, distance: ${distance}, tags: ${tagsArray}, owner: ${owner}, quantity: ${quantity}, q: ${q}`,
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
        if (userId && request.ownerId == userId) {
            logger.log(
                `Excluding current Request because it belongs to request user`,
                1
            );
            continue;
        }
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

    requestsFinal.sort((a, b) => {
        return b.dataValues.distance - a.dataValues.distance;
    });

    let requestsSlice = [];

    if (quantity !== undefined) {
        requestsSlice = requestsFinal.slice(0, quantity);
    } else {
        requestsSlice = requestsFinal;
    }

    if (requestsSlice.length === 0) {
        logger.log(
            `There's no request(s) with such parameters, sending back an empty array`,
            1
        );
    } else {
        logger.log(`Got request(s), sending back response...`, 1);
    }

    status = StatusCodes.OK;
    infoMessage = requestsSlice;
    return { status, infoMessage };
};

const requestOfferService = async (requestId, offerId) => {
    let status, infoMessage;
    logger.log(`Starting postsValidation...`, 1);
    const { statusValidation, messageValidation, request, offer } =
        await postsValidation(offerId, requestId);

    if (statusValidation == false) {
        throw new BadRequestError(messageValidation);
    }
    logger.log(messageValidation, 1);
    logger.log(
        `Checking if offer already has request as 'pendingRequests'...`,
        1
    );
    for (let req of offer.Requests) {
        if (req.dataValues.id == requestId) {
            throw new BadRequestError(
                `Request with id: ${requestId} already requested to Offer with id: ${offerId}`
            );
        }
    }
    logger.log(`Validating status...`, 1);
    if (request.status != 'idle' || offer.status != 'idle') {
        throw new BadRequestError(
            `Invalid request.status or offer.status (not idle)`
        );
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
    infoMessage = `Added Request with id: ${requestId} to Offer with id: ${offerId}`;
    return { status, infoMessage };
};

const acceptOfferService = async (requestId, offerId) => {
    let status, infoMessage;
    logger.log(`Starting postsValidation...`, 1);
    const { statusValidation, messageValidation, request } =
        await postsValidation(offerId, requestId);

    if (statusValidation == false) {
        throw new BadRequestError(messageValidation);
    }
    logger.log(messageValidation, 1);
    const [acceptedPost, created] = await db.acceptedPosts.findOrCreate({
        where: {
            requestId: requestId,
        },
        defaults: {
            offerId: offerId,
            requestId: requestId,
        },
    });
    if (!created) {
        throw new BadRequestError(`This request is already accepted`);
    }
    logger.log(
        `Request with id: ${requestId} accepted Offer with id: ${offerId}`,
        1
    );
    logger.log(`Updating others offer' status from pendingOffers...`, 1);
    for (let off of request.Offers) {
        const offer = await db.offers.findOne({
            where: { id: off.dataValues.id },
        });
        if (offer.id != offerId) {
            await offer.update({ status: 'rejected' });
            offer.save();
        } else {
            await offer.update({ status: 'accepted' });
            offer.save();
            logger.log('Deactivating offer...', 1);
            await offer.update({ active: false });
            offer.save();
            logger.log('Offer deactivated...', 1);
        }
    }
    logger.log('Deactivating Request...', 1);
    await request.update({ active: false });
    request.save();
    logger.log('Request deactivated...', 1);

    status = StatusCodes.OK;
    infoMessage = `Request with id: ${requestId} accepted Offer with id: ${offerId}`;
    return { status, infoMessage };
};

const rejectOfferService = async (requestId, offerId) => {
    let status, infoMessage;
    logger.log(`Starting postsValidation...`, 1);
    const { statusValidation, messageValidation, request } =
        await postsValidation(offerId, requestId);

    if (statusValidation == false) {
        throw new BadRequestError(messageValidation);
    }
    logger.log(messageValidation, 1);
    logger.log(`Checking Request's pendingOffers...`, 1);
    let found = false;
    let newPendingOffers = [];
    for (let off of request.Offers) {
        if (off.dataValues.id == offerId) {
            found = true;
            const offer = await db.offers.findOne({
                where: { id: off.dataValues.id },
            });
            await offer.update({ status: 'rejected' });
            offer.save();
            logger.log(
                `Updated Offer with id: ${off.dataValues.id} to 'rejected'`,
                1
            );
        } else {
            newPendingOffers.push(off);
        }
    }

    if (!found) {
        throw new BadRequestError(
            `Request with id: ${requestId} doesn't have Offer with id: ${offerId} as pending`
        );
    }

    request.setOffers(newPendingOffers);
    logger.log(`Updated Request's pending Offers, sending response...`, 1);

    status = StatusCodes.OK;
    infoMessage = `Request with id: ${requestId} rejected Offer with id: ${offerId}`;
    return { status, infoMessage };
};

module.exports = {
    createRequestService,
    editRequestService,
    getRequestByIdService,
    getRequestsByQueryService,
    requestOfferService,
    acceptOfferService,
    rejectOfferService,
};
