const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const { tokenValidationService } = require('../services/auth');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const { createRewardService } = require('../services/rewards');

const getAllRewards = async (req, res, next) => {};

const createReward = async (req, res, next) => {
    logger.log(`Received createReward request...`, 1);
    try {
        console.log(req.body);
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

module.exports = { getAllRewards, createReward };
