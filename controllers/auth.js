const logger = require('../utils/logger');
const { inspect } = require('util');
const {
    registerService,
    loginService,
    tokenValidationService,
} = require('../services/auth');

const register = async (req, res, next) => {
    logger.log('Received register request', 1);

    try {
        const { status, infoMessage } = await registerService(req.body);
        res.status(status).json(infoMessage);
    } catch (e) {
        logger.log(e.message, 0);
        next(e);
    }
};

const login = async (req, res, next) => {
    logger.log('Received login request', 1);

    try {
        const { status, infoMessage } = await loginService(req.body);
        res.status(status).json(infoMessage);
    } catch (e) {
        logger.log(e.message, 0);
        next(e);
    }
};

const tokenValidation = async (req, res, next) => {
    logger.log('Received tokenValidation request', 1);

    try {
        const { status, infoMessage } = await tokenValidationService(
            req.get('id'),
            req.get('token')
        );
        res.status(status).json(infoMessage);
    } catch (e) {
        logger.log(e.message, 0);
        next(e);
    }
};

module.exports = {
    register,
    login,
    tokenValidation,
};
