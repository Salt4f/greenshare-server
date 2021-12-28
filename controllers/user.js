const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const {
    getUserAllInfo,
    getUserNickname,
    getUserOffers,
    getUserRequests,
    getUserValorationsService,
} = require('../services/user');
const { tokenValidationService } = require('../services/auth');
const { BadRequestError } = require('../errors');

const getUser = async (req, res, next) => {
    logger.log(`Received getUser request`, 1);
    const id = req.get('id');
    const token = req.get('token');
    try {
        if (id != undefined && token != undefined) {
            logger.log(`Authenticating user info....`, 1);
            const response = await tokenValidationService(id, token);
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

const getUserPosts = async (req, res, next) => {
    logger.log(`Received getUserPosts request`, 1);
    try {
        logger.log(`Checking type...`, 1);
        if (req.query.type === 'offers') {
            const { status, infoMessage } = await getUserOffers(
                req.params.userId
            );
            res.status(status).json(infoMessage);
        } else if (req.query.type === 'requests') {
            const { status, infoMessage } = await getUserRequests(
                req.params.userId
            );
            res.status(status).json(infoMessage);
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getUserValorations = async (req, res, next) => {
    logger.log(`Received getUserValorations request`, 1);
    try {
        const { status, infoMessage } = await getUserValorationsService(
            req.params.userId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = { getUser, getUserPosts, getUserValorations };
