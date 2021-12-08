const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const { getUserAllInfo, getUserNickname } = require('../services/user');
const { tokenValidationService } = require('../services/auth');
const {
    BadRequestError,
    UnauthenticatedError,
    InternalServerError,
    NotFoundError,
} = require('../errors');

const getUser = async (req, res, next) => {
    logger.log(`Received getUser request`, 1);
    const { id, token } = req.body;
    try {
        if (id != undefined && token != undefined) {
            logger.log(`Authenticating user info....`, 1);
            const response = await tokenValidationService(req.body);
            if (response.status != StatusCodes.OK) {
                throw new BadRequestError('Invalid user');
            }
            logger.log(`User authenticated, checking id's....`, 1);
            const { status, infoMessage } = await getUserAllInfo(
                id,
                req.params.userId
            );
            res.status(status).json(infoMessage);
        } else {
            const { status, infoMessage } = await getUserNickname(
                req.params.userId
            );
            res.status(status).json(infoMessage);
        }
    } catch (e) {
        logger.log(e.message, 0);
        next(e);
    }
};

module.exports = { getUser };
