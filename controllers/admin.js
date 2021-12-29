const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const { loginService } = require('../services/admin');
const { BadRequestError } = require('../errors');

const login = async (req, res, next) => {
    logger.log('Received login request', 1);
    try {
        const { status, infoMessage } = await loginService(req.get('api-key'));
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = { login };
