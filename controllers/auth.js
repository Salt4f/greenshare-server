const { StatusCodes } = require('http-status-codes');
const {
    BadRequestError,
    UnauthenticatedError,
    InternalServerError,
} = require('../errors');
const logger = require('../utils/logger');
const { inspect } = require('util');
const {
    registerService,
    loginService,
    tokenValidationService,
} = require('../services/auth');

const register = async (req, res) => {
    logger.log('Received register request', 1);

    try {
        const { status, infoMessage } = await registerService(req.body);
        res.status(status).json(infoMessage);
    } catch (e) {
        logger.log(e.message, 0);

        // logger.log(
        //     `Register request error, checking... ${inspect(
        //         e,
        //         false,
        //         null,
        //         false
        //     )}`,
        //     2
        // );

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: `Internal server error`,
        });
    }
};

const login = async (req, res) => {
    logger.log('Received login request', 1);

    try {
        const { status, infoMessage } = await loginService(req.body);
        res.status(status).json(infoMessage);
    } catch (e) {
        logger.log(e.message, 0);

        // logger.log(
        //     `Login request error, checking... ${inspect(
        //         e,
        //         false,
        //         null,
        //         false
        //     )}`,
        //     2
        // );

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: `Internal server error`,
        });
    }
};

const tokenValidation = async (req, res) => {
    logger.log('Received tokenValidation request', 1);

    try {
        const { status } = await tokenValidationService(req.body);
        res.status(status);
    } catch (e) {
        logger.log(e.message, 0);

        // logger.log(
        //     `TokenValidation request error, checking... ${inspect(
        //         e,
        //         false,
        //         null,
        //         false
        //     )}`,
        //     2
        // );

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: `Internal server error`,
        });
    }
};

module.exports = {
    register,
    login,
    tokenValidation,
};
