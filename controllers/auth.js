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
} = require('../requests/stubs/user-service');
// const { createUser } = require('../db/models/users');
const db = require('../db/connect');
const validate = require('../utils/data-validation');
const logger = require('../utils/logger');
const { inspect } = require('util');

const register = async (req, res) => {
    logger.log('Received register request', 1);

    const { email, password, nickname, dni, birthDate, fullName } = req.body;

    /////////////// VALIDATION ///////////////
    logger.log(`Starting validation...`, 1);

    if (!validate.email(email)) {
        logger.log('Email validation failed', 1);

        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing email`,
        });
        return;
    }
    if (!validate.nickname(nickname)) {
        logger.log('Nickname validation failed', 1);

        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing nickname`,
        });
        return;
    }
    if (!validate.password(password)) {
        logger.log('Password validation failed', 1);

        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing password`,
        });
        return;
    }
    logger.log('Validation passed', 1);

    try {
        logger.log('Sending register request to UserService...', 1);
        const response = await registerRequest(email, password, nickname);
        logger.log(
            'Received register response from UserService, checking...',
            1
        );

        // logger.log(
        //     `Received register response from UserService, checking... ${inspect(
        //         response,
        //         false,
        //         null,
        //         false
        //     )}`,
        //     2
        // );

        if (response.status == StatusCodes.CREATED) {
            logger.log(
                'UserService successfully registered user, creating user...',
                1
            );

            // CREATE USER TO OUR DATABSE
            // await createUser(response.data.id, email, nickname);
            await db.users.create({
                id: response.data.id,
                email,
                password,
                nickname,
                dni,
                birthDate: new Date(birthDate),
                fullName,
            });

            logger.log(
                'Successfully created user, sending response with id and token...',
                1
            );

            res.status(StatusCodes.CREATED).json({
                id: response.data.id,
                token: response.data.token,
            });
        } else if (response.status == StatusCodes.BAD_REQUEST) {
            res.status(StatusCodes.BAD_REQUEST).json({
                error: `Email already registered`,
            });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: `User service error`,
            });
        }
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

    if (!validate.email(email)) {
        logger.log('Email validation failed', 1);

        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing email`,
        });
        return;
    }
    if (!validate.password(password)) {
        logger.log('Password validation failed', 1);

        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing password`,
        });
        return;
    }
    logger.log('Validation passed', 1);

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
    if (!validate.id(id)) {
        logger.log(`id validation failed, invalid or missing id`, 1);

        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing id`,
        });
        return;
    }
    if (!validate.token(token)) {
        logger.log(`token validation failed, invalid or missing token`, 1);

        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing token`,
        });
        return;
    }

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
