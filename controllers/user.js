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
            const user = await getUserAllInfo(req.get('id'), req.params.userId);
            res.status(StatusCodes.OK).json(user);
        } else {
            const nickname = await getUserNickname(req.params.userId);
            res.status(StatusCodes.OK).json(nickname);
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
            const offers = await getUserOffers(req.params.userId);
            res.status(StatusCodes.OK).json(offers);
        } else if (req.query.type === 'requests') {
            const requests = await getUserRequests(req.params.userId);
            res.status(StatusCodes.OK).json(requests);
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
            const incomingPendingPosts = await getIncomingPendingPosts(
                req.params.userId
            );
            res.status(StatusCodes.OK).json(incomingPendingPosts);
        }
        if (type === 'outgoing') {
            const outgoingPendingPosts = await getOutgoingPendingPosts(
                req.params.userId
            );
            res.status(StatusCodes.OK).json(outgoingPendingPosts);
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
            const incomingAcceptedPosts = await getIncomingAcceptedPosts(
                req.params.userId
            );
            res.status(StatusCodes.OK).json(incomingAcceptedPosts);
        }
        if (type === 'outgoing') {
            const outgoingAcceptedPosts = await getOutgoingAcceptedPosts(
                req.params.userId
            );
            res.status(StatusCodes.OK).json(outgoingAcceptedPosts);
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = { getUser, getUserPosts, getPendingPosts, getAcceptedPosts };
