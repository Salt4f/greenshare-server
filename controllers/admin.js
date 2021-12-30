const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const { loginService, reportService } = require('../services/admin');
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

const report = async (req, res, next) => {
    logger.log('Received report request', 1);
    try {
        let type, itemId;
        if (req.params.postId) {
            type = 'post';
            itemId = req.params.postId;
        } else {
            type = 'user';
            itemId = req.params.userId;
        }
        const { message } = req.body;
        const { status, infoMessage } = await reportService(
            itemId,
            type,
            req.get('id'),
            message
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = { login, report };
