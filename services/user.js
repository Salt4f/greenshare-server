const { StatusCodes } = require('http-status-codes');
const db = require('../db/connect');
const logger = require('../utils/logger');
const {
    BadRequestError,
    UnauthenticatedError,
    InternalServerError,
    NotFoundError,
} = require('../errors');

const getUserAllInfo = async (requestUserId, paramsUserId) => {
    let user, status, infoMessage;

    if (requestUserId == paramsUserId) {
        user = await db.users.findOne({
            where: {
                id: paramsUserId,
            },
        });
    } else {
        throw new UnauthenticatedError(
            `User with id ${requestUserId} is trying to get someone else's info`
        );
    }
    logger.log(`Got user with id: ${paramsUserId}, sending response...`, 1);
    infoMessage = user;
    status = StatusCodes.OK;
    return { status, infoMessage };
};

const getUserNickname = async (userId) => {
    let status, infoMessage;
    const user = await db.users.findOne({
        where: {
            id: userId,
        },
        attributes: ['nickname'],
    });
    if (user === null) {
        throw new NotFoundError(`No user with id: ${userId} in back-end`);
    }
    logger.log(`Got user with id: ${userId}, sending response...`, 1);
    infoMessage = user;
    status = StatusCodes.OK;
    return { status, infoMessage };
};

const getUserOffers = async (userId) => {
    let status, infoMessage;

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
    status = StatusCodes.OK;
    infoMessage = offers;
    return { status, infoMessage };
};

const getUserRequests = async (userId) => {
    let status, infoMessage;

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
    status = StatusCodes.OK;
    infoMessage = requests;
    return { status, infoMessage };
};

module.exports = {
    getUserAllInfo,
    getUserNickname,
    getUserOffers,
    getUserRequests,
};
