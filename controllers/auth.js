const { StatusCodes } = require('http-status-codes');
const {
    BadRequestError,
    UnauthenticatedError,
    InternalServerError,
} = require('../errors');
const {
    registerRequest,
    loginRequest,
    tokenValidationRequest,
} = require('../requests/user-service');
// const { createUser } = require('../db/models/users');
const db = require('../db/connect');
const validate = require('../utils/data-validation');
const logger = require('../utils/logger');
const { inspect } = require('util');
const { registerService } = require('../services/auth');

const register = async (req, res) => {
    logger.log('Received register request', 1);

    const { email, password, nickname, dni, birthDate, fullName } = req.body;

    try {
        const { status, infoMessage } = await registerService(
            email,
            password,
            nickname,
            dni,
            birthDate,
            fullName
        );

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

    const { email, password } = req.body;

    /////////////// VALIDATION ///////////////
    logger.log(`Starting validation...`, 1);

    const { passed, message } = validate.login(email, password);

    if (!passed) {
        logger.log(message, 1);
        res.status(StatusCodes.BAD_REQUEST).json({
            error: message,
        });
        return;
    }

    logger.log(message, 1);

    try {
        logger.log('Sending loginRequest...', 1);
        const response = await loginRequest(email, password);
        logger.log('Received loginRequest, checking response...', 1);

        if (response.status == StatusCodes.CREATED) {
            logger.log('Successfully logged in, sending response...', 1);

            res.status(StatusCodes.OK).json({
                id: response.data.id,
                token: response.data.token,
            });
        } else {
            logger.log(
                'Login failed, invalid credentials, sending response...',
                1
            );

            res.status(StatusCodes.UNAUTHORIZED).json({
                error: `Invalid credentials`,
            });
        }
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

    const { id, token } = req.body;

    /////////////// VALIDATION ///////////////

    logger.log(`Starting token validation...`, 1);
    const { passed, message } = validate.tokenValidation(id, token);

    if (!passed) {
        logger.log(message, 1);
        res.status(StatusCodes.BAD_REQUEST).json({
            error: message,
        });
        return;
    }

    logger.log(message, 1);

    try {
        logger.log(`Sending tokenValidationRequest...`, 1);
        const response = await tokenValidationRequest(id, token);
        logger.log(`Received tokenValidationRequest response, checking...`, 1);

        // logger.log(
        //     `Received login response from UserService, checking... ${inspect(
        //         response,
        //         false,
        //         null,
        //         false
        //     )}`,
        //     2
        // );

        if (response.status == StatusCodes.CREATED) {
            logger.log(`Token successfuly validated, sending response...`, 1);

            res.status(StatusCodes.OK).send();
        } else {
            logger.log(`Invalid token, sending response...`, 1);
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
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
