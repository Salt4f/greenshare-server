const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const { getUserService } = require('../services/user');

const getUser = async (req, res) => {
    logger.log(`Received getUser request`, 1);
    try {
        const { status, infoMessage } = await getUserService(
            req.params.userId,
            req.body
        );
        if (status == StatusCodes.UNAUTHORIZED) {
            res.status(status).send();
            throw new Error('UNAUTHORIZED');
        }
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
    }
};

module.exports = { getUser };
