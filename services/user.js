require('dotenv').config();
const { StatusCodes } = require('http-status-codes');
const db = require('../db/connect');
const logger = require('../utils/logger');
const { UnauthenticatedError, NotFoundError } = require('../errors');

const getUserAllInfo = async (requestUserId, paramsUserId) => {
    let user;
    if (
        requestUserId === paramsUserId ||
        requestUserId === process.env.ADMIN_ID
    ) {
        user = await db.users.findOne({
            where: {
                id: paramsUserId,
            },
        });
        if (!user)
            throw new NotFoundError(
                `User with id ${paramsUserId} does not exist`
            );
    } else {
        throw new UnauthenticatedError(
            `User with id ${requestUserId} is trying to get someone else's info`
        );
    }

    logger.log(`Calculating user average valoration..`, 1);
    const valoration = await getUserValorationsService(paramsUserId);
    user.dataValues.valoration = valoration;
    logger.log(`Got user average valoration..`, 1);

    logger.log(`Got user with id: ${paramsUserId}, sending response...`, 1);
    return user;
};

const getUserNickname = async (userId) => {
    const user = await db.users.findOne({
        where: {
            id: userId,
        },
        attributes: ['nickname'],
    });
    if (!user) {
        throw new NotFoundError(`No user with id: ${userId} in back-end`);
    }
    logger.log(`Got user with id: ${userId}, sending response...`, 1);
    return user;
};

const getUserOffers = async (userId) => {
    logger.log(`Searching offers...`, 1);
    const offers = await db.offers.findAll({
        where: { ownerId: userId },
        attributes: ['id', 'active', 'name', 'description', 'status'],
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial', 'color'],
            },
        ],
    });
    if (offers.length === 0) {
        logger.log(`User hasn't created any offer yet`, 1);
    } else {
        logger.log('Cleaning up tags...', 1);
        for (const offer of offers) {
            for (let t of offer.tags) {
                delete t.dataValues.OfferTag;
            }
        }
        logger.log('Tags cleaned...', 1);
        logger.log(`Got offer(s), sending back...`, 1);
    }
    return offers;
};

const getUserRequests = async (userId) => {
    logger.log(`Searching requests...`, 1);
    const requests = await db.requests.findAll({
        where: { ownerId: userId },
        attributes: ['id', 'active', 'name', 'description', 'status'],
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial', 'color'],
            },
        ],
    });
    if (requests.length === 0) {
        logger.log(`User hasn't created any request yet`, 1);
    } else {
        logger.log('Cleaning up tags...', 1);
        for (const request of requests) {
            for (let t of request.tags) {
                delete t.dataValues.RequestTag;
            }
        }
        logger.log('Tags cleaned...', 1);
        logger.log(`Got request(s), sending back...`, 1);
    }
    return requests;
};

const getUserValorationsService = async (userId) => {
    let valorationsArray = [];

    const completedPosts = await db.completedPosts.findAll({
        attributes: ['acceptedPostId', 'valoration'],
    });

    for (const completedPost of completedPosts) {
        const acceptedPost = await db.acceptedPosts.findOne({
            where: { id: completedPost.acceptedPostId },
        });
        const offer = await db.offers.findOne({
            where: { id: acceptedPost.dataValues.offerId },
        });
        if (offer.dataValues.ownerId == userId) {
            valorationsArray.push(completedPost.valoration);
        }
    }
    let sum;
    if (valorationsArray.length === 0) {
        sum = 0;
    } else {
        sum =
            valorationsArray.reduce((a, b) => a + b, 0) /
            valorationsArray.length;
        logger.log(`Average valoration of user ${userId} is ${sum}`, 1);
    }

    return sum;
};

const updateUserEcoScoreService = async (userId, ecoScore) => {
    const user = await db.users.findOne({ where: { id: userId } });
    if (!user)
        throw new NotFoundError(
            `User with id ${userId} does not exist in backend db`
        );
    await user.update({ ecoScore: ecoScore });
    user.save();
    logger.log(`Successfully udpated user's ecoScore`, 1);
    return;
};

const getIncomingPendingPosts = async (userId) => {
    let pendingPosts = [];

    logger.log(`Getting Offers...`, 1);
    const offers = await db.offers.findAll({
        where: { active: true, status: 'idle', ownerId: userId },
        attributes: ['id', 'name'],
        include: [
            {
                model: db.requests,
                attributes: ['id', 'name', 'ownerId'],
            },
        ],
    });
    logger.log(`Checking Offers...`, 1);
    for (const offer of offers) {
        if (offer.dataValues.Requests.length > 0) {
            let post = {};
            post.ownPostId = offer.id;
            post.postName = offer.name;
            post.posts = [];
            const requests = offer.dataValues.Requests;
            for (let request of requests) {
                let pendingRequest = {};
                const user = await db.users.findOne({
                    where: { id: request.ownerId },
                    attributes: ['nickname'],
                });
                pendingRequest.postId = request.id;
                pendingRequest.postName = request.name;
                pendingRequest.postType = 'request';
                pendingRequest.nickname = user.nickname;
                pendingRequest.userId = request.ownerId;
                post.posts.push(pendingRequest);
            }
            pendingPosts.push(post);
        }
    }
    logger.log(`Getting Requests...`, 1);
    const requests = await db.requests.findAll({
        where: { active: true, status: 'idle', ownerId: userId },
        attributes: ['id', 'name'],
        include: [
            {
                model: db.offers,
                attributes: ['id', 'name', 'ownerId'],
            },
        ],
    });
    logger.log(`Checking Requests...`, 1);
    for (const request of requests) {
        if (request.dataValues.Offers.length > 0) {
            let post = {};
            post.ownPostId = request.id;
            post.postName = request.name;
            post.posts = [];
            const offers = request.dataValues.Offers;
            for (let offer of offers) {
                let pendingOffer = {};
                const user = await db.users.findOne({
                    where: { id: offer.ownerId },
                    attributes: ['nickname'],
                });
                pendingOffer.postId = offer.id;
                pendingOffer.postName = offer.name;
                pendingOffer.postType = 'offer';
                pendingOffer.nickname = user.nickname;
                pendingOffer.userId = offer.ownerId;
                post.posts.push(pendingOffer);
            }
            pendingPosts.push(post);
        }
    }
    logger.log(
        `Got all Incoming Pending Posts of user: ${userId}, sending back...`,
        1
    );
    return pendingPosts;
};

const getOutgoingPendingPosts = async (userId) => {
    let pendingPosts = [];

    logger.log(`Getting Offers...`, 1);
    const offers = await db.offers.findAll({
        where: { active: true, status: 'pending', ownerId: userId },
        attributes: ['id', 'name', 'RequestId'],
    });
    logger.log(`Checking Offers...`, 1);
    for (const offer of offers) {
        let pendingPost = {};
        const request = await db.requests.findOne({
            where: { id: offer.RequestId },
            attributes: ['id', 'name', 'ownerId'],
        });
        const user = await db.users.findOne({
            where: { id: request.ownerId },
            attributes: ['nickname'],
        });
        pendingPost.ownPostId = offer.id;
        pendingPost.ownPostName = offer.name;
        pendingPost.postId = request.id;
        pendingPost.postName = request.name;
        pendingPost.postType = 'request';
        pendingPost.userId = request.ownerId;
        pendingPost.nickname = user.nickname;
        pendingPosts.push(pendingPost);
    }

    logger.log(`Getting Requests...`, 1);
    const requests = await db.requests.findAll({
        where: { active: true, status: 'pending', ownerId: userId },
        attributes: ['id', 'name', 'OfferId'],
    });
    logger.log(`Checking Requests...`, 1);
    for (const request of requests) {
        let pendingPost = {};
        const offer = await db.offers.findOne({
            where: { id: request.OfferId },
            attributes: ['id', 'name', 'ownerId'],
        });
        const user = await db.users.findOne({
            where: { id: offer.ownerId },
            attributes: ['nickname'],
        });
        pendingPost.ownPostId = request.id;
        pendingPost.ownPostName = request.name;
        pendingPost.postId = offer.id;
        pendingPost.postName = offer.name;
        pendingPost.postType = 'offer';
        pendingPost.userId = offer.ownerId;
        pendingPost.nickname = user.nickname;
        pendingPosts.push(pendingPost);
    }
    logger.log(
        `Got all Outgoing Pending Posts of user: ${userId}, sending back...`,
        1
    );
    return pendingPosts;
};

const getIncomingAcceptedPosts = async (userId) => {
    let pendingAcceptedPosts = [];

    logger.log(`Getting acceptedPosts...`, 1);
    const acceptedPosts = await db.acceptedPosts.findAll({
        attributes: ['offerId', 'requestId'],
    });
    logger.log(`Checking acceptedPosts...`, 1);
    for (const acceptedPost of acceptedPosts) {
        const request = await db.requests.findOne({
            where: { id: acceptedPost.requestId },
        });
        if (request.ownerId == userId) {
            const offer = await db.offers.findOne({
                where: { id: acceptedPost.offerId },
                attributes: ['name', 'ownerId'],
            });
            const user = await db.users.findOne({
                where: { id: offer.ownerId },
                attributes: ['nickname'],
            });
            offer.dataValues.nickname = user.nickname;

            acceptedPost.dataValues.offer = offer;
            pendingAcceptedPosts.push(acceptedPost);
        }
    }
    logger.log(
        `Got all incoming pending acceptedPosts of user ${userId}, sending back...`,
        1
    );
    return pendingAcceptedPosts;
};

const getOutgoingAcceptedPosts = async (userId) => {
    let pendingAcceptedPosts = [];

    logger.log(`Getting acceptedPosts...`, 1);
    const acceptedPosts = await db.acceptedPosts.findAll({
        attributes: ['offerId', 'requestId'],
    });
    logger.log(`Checking acceptedPosts...`, 1);
    for (const acceptedPost of acceptedPosts) {
        const offer = await db.offers.findOne({
            where: { id: acceptedPost.offerId },
            attributes: ['name', 'ownerId'],
        });
        if (offer.ownerId == userId) {
            const request = await db.requests.findOne({
                where: { id: acceptedPost.requestId },
                attributes: ['ownerId'],
            });
            const user = await db.users.findOne({
                where: { id: request.ownerId },
                attributes: ['nickname'],
            });
            acceptedPost.dataValues.name = offer.name;
            acceptedPost.dataValues.nickname = user.nickname;
            pendingAcceptedPosts.push(acceptedPost);
        }
    }
    logger.log(
        `Got all outgoing pending acceptedPosts of user ${userId}, sending back...`,
        1
    );
    return pendingAcceptedPosts;
};

module.exports = {
    getUserAllInfo,
    getUserNickname,
    getUserOffers,
    getUserRequests,
    getIncomingPendingPosts,
    getOutgoingPendingPosts,
    getIncomingAcceptedPosts,
    getOutgoingAcceptedPosts,
    updateUserEcoScoreService,
};
