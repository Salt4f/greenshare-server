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

module.exports = { getUserAllInfo, getUserNickname };
