const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const { tokenValidationService } = require('../services/auth');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const {
    createRewardService,
    getAllRewardsService,
    editRewardService,
    deactivateRewardService,
    getRewardByIdService,
} = require('../services/rewards');

const getAllRewards = async (req, res, next) => {
    logger.log(`Received getAllRewards request...`, 1);
    try {
        const rewards = await getAllRewardsService();
        res.status(StatusCodes.OK).json(rewards);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const createReward = async (req, res, next) => {
    logger.log(`Received createReward request...`, 1);
    try {
        const reward = await createRewardService(req.body);
        res.status(StatusCodes.CREATED).json({
            id: reward.id,
            createdAt: reward.createdAt,
        });
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getRewardById = async (req, res, next) => {
    logger.log(`Received getRewardById request...`, 1);
    try {
        const reward = await getRewardByIdService(req.params.rewardId);
        res.status(StatusCodes.OK).json(reward);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const editReward = async (req, res, next) => {
    logger.log(`Received editReward request...`, 1);
    try {
        await editRewardService(req.params.rewardId, req.body);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const deactivateReward = async (req, res, next) => {
    logger.log(`Received deactivateReward request...`, 1);
    try {
        await deactivateRewardService(req.params.rewardId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = {
    getAllRewards,
    createReward,
    editReward,
    deactivateReward,
    getRewardById,
};
