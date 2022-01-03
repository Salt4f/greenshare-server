const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const {
    getUserAllInfo,
    getUserNickname,
    getUserOffers,
    getUserRequests,
    getIncomingPendingPosts,
    getOutgoingPendingPosts,
    getIncomingAcceptedPosts,
    getOutgoingAcceptedPosts,
} = require('../services/user');
const { tokenValidationService } = require('../services/auth');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const getUser = async (req, res, next) => {
    logger.log(`Received getUser request`, 1);
    try {
        if (req.get('id') && req.get('token')) {
            logger.log(`Authenticating user info....`, 1);
            await tokenValidationService(req.get('id'), req.get('token'));
            logger.log(`User authenticated, checking id's....`, 1);
            const { status, infoMessage } = await getUserAllInfo(
                req.get('id'),
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

const getPendingPosts = async (req, res, next) => {
    logger.log('Received getPendingPosts request...', 1);
    try {
        if (req.get('id') !== req.params.userId)
            throw new UnauthenticatedError(
                `User with id ${req.get(
                    'id'
                )} is trying to get someone else' pendingPosts`
            );

        const type = req.query.type;
        if (type === 'incoming') {
            const { status, infoMessage } = await getIncomingPendingPosts(
                req.params.userId
            );
            res.status(status).json(infoMessage);
        }
        if (type === 'outgoing') {
            const { status, infoMessage } = await getOutgoingPendingPosts(
                req.params.userId
            );
            res.status(status).json(infoMessage);
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getAcceptedPosts = async (req, res, next) => {
    logger.log('Received getAcceptedPosts request...', 1);
    try {
        if (req.get('id') !== req.params.userId)
            throw new UnauthenticatedError(
                `User with id ${req.get(
                    'id'
                )} is trying to get someone else' acceptedPosts`
            );

        const type = req.query.type;
        if (type === 'incoming') {
            const { status, infoMessage } = await getIncomingAcceptedPosts(
                req.params.userId
            );
            res.status(status).json(infoMessage);
        }
        if (type === 'outgoing') {
            const { status, infoMessage } = await getOutgoingAcceptedPosts(
                req.params.userId
            );
            res.status(status).json(infoMessage);
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = { getUser, getUserPosts, getPendingPosts, getAcceptedPosts };
