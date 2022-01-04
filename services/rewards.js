const { StatusCodes } = require('http-status-codes');
const db = require('../db/connect');
const validate = require('../utils/data-validation');
const logger = require('../utils/logger');
const { inspect } = require('util');
const {
    BadRequestError,
    UnauthenticatedError,
    InternalServerError,
} = require('../errors');

const createRewardService = async (requestBody) => {
    const { name, description, sponsorName, greenCoins } = requestBody;
    logger.log(`Validating Reward...`, 1);
    const { passed, message } = validate.reward(
        name,
        description,
        sponsorName,
        greenCoins
    );
    if (!passed) throw new BadRequestError(message);
    logger.log(message, 1);
    logger.log(`Creating Reward...`, 1);
    const reward = await db.rewards.create({
        name,
        description,
        sponsorName,
        greenCoins,
    });
    logger.log(`Created Reward with id: ${reward.id}...`, 1);
    return reward;
};

const getAllRewardsService = async () => {
    logger.log(`Getting all rewards...`, 1);
    const rewards = await db.rewards.findAll({
        where: { active: true },
        attributes: ['id', 'name', 'description', 'sponsorName', 'greenCoins'],
    });
    return rewards;
};

module.exports = { createRewardService, getAllRewardsService };
