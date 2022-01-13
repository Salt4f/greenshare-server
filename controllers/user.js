const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const {
    getUserAllInfo,
    editUserInfoService,
    getUserNickname,
    getUserOffers,
    getUserRequests,
    getIncomingPendingPosts,
    getOutgoingPendingPosts,
    getIncomingAcceptedPosts,
    getOutgoingAcceptedPosts,
    updateUserEcoScoreService,
    exchangeEcoPoints,
    redeemReward,
} = require('../services/user');
const { tokenValidationService } = require('../services/auth');
const {
    BadRequestError,
    UnauthenticatedError,
    ForbidenError,
} = require('../errors');
const { default: axios } = require('axios');

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
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const editUserInfo = async (req, res, next) => {
    logger.log(`Received editUserInfo request...`, 1);
    try {
        if (req.get('id') !== req.params.userId)
            throw new ForbidenError(
                `User ${req.get('id')} is trying to edit someone else info`
            );
        await editUserInfoService(req.params.userId, req.body);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
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

const getEcoScoreForm = async (req, res, next) => {
    logger.log(`Received getEcoScoreForm request`, 1);
    try {
        logger.log(`Sending request to raul's endpoint...`, 1);
        const form = await axios.get(
            'http://raulplesa.online:12345/api/ecoquiz/preguntes-i-respostes/es'
        );
        logger.log(`Got eco-score form, sending back...`, 1);
        res.status(StatusCodes.OK).json(form.data);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const updateEcoScore = async (req, res, next) => {
    logger.log(`Received updateEcoScore request`, 1);
    try {
        logger.log(`Sending request to raul's endpoint...`, 1);
        const form = req.body;
        const response = await axios.post(
            'http://raulplesa.online:12345/api/ecoquiz/es',
            form
        );
        logger.log(`Got ecoScore`, 1);
        await updateUserEcoScoreService(
            req.params.userId,
            response.data.EcoPunts
        );
        res.status(StatusCodes.OK).send();
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

const redeem = async (req, res, next) => {
    logger.log('Received redeem request...', 1);
    try {
        if (req.get('id') !== req.params.userId)
            throw new UnauthenticatedError(
                `User with id ${req.get(
                    'id'
                )} is trying to redeem someone else' Rewards`
            );
        const action = req.query.action;
        if (action === 'rewards') {
            const { rewardId } = req.body;
            const code = await redeemReward(req.params.userId, rewardId);
            res.status(StatusCodes.OK).json({ code: code });
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = {
    getUser,
    editUserInfo,
    getUserPosts,
    getPendingPosts,
    getAcceptedPosts,
    getEcoScoreForm,
    updateEcoScore,
    redeem,
};
