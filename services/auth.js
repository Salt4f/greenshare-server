const { StatusCodes } = require('http-status-codes');
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

const registerService = async (requestBody) => {
    const { email, password, nickname, dni, birthDate, fullName } = requestBody;
    let status, infoMessage;

    /////////////// VALIDATION ///////////////
    logger.log(`Starting validation...`, 1);

    const { passed, message } = validate.register(
        email,
        password,
        nickname,
        dni,
        birthDate,
        fullName
    );

    if (!passed) {
        logger.log(message, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = message;
        return { status, infoMessage };
    }
    logger.log(message, 1);

    logger.log('Sending register request to UserService...', 1);
    const response = await registerRequest(email, password, nickname);
    logger.log('Received register response from UserService, checking...', 1);

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

        status = StatusCodes.CREATED;
        infoMessage = {
            id: response.data.id,
            token: response.data.token,
        };
        return { status, infoMessage };
    } else if (response.status == StatusCodes.BAD_REQUEST) {
        status = StatusCodes.BAD_REQUEST;
        infoMessage = { error: `Email already registered` };
        return { status, infoMessage };
    } else {
        status = StatusCodes.INTERNAL_SERVER_ERROR;
        infoMessage = { error: `User service error` };
        return { status, infoMessage };
    }
};

const loginService = async (requestBody) => {
    const { email, password } = requestBody;
    let status, infoMessage;

    /////////////// VALIDATION ///////////////
    logger.log(`Starting validation...`, 1);
    const { passed, message } = validate.login(email, password);

    if (!passed) {
        logger.log(message, 1);
        status = StatusCodes.BAD_REQUEST;
        infoMessage = message;
        return { status, infoMessage };
    }
    logger.log(message, 1);

    logger.log('Sending loginRequest...', 1);
    const response = await loginRequest(email, password);
    logger.log('Received loginRequest, checking response...', 1);

    if (response.status == StatusCodes.CREATED) {
        logger.log('Successfully logged in, sending response...', 1);

        status = StatusCodes.OK;
        infoMessage = {
            id: response.data.id,
            token: response.data.token,
        };
        return { status, infoMessage };
    } else {
        logger.log('Login failed, invalid credentials, sending response...', 1);
        status = StatusCodes.UNAUTHORIZED;
        infoMessage = {
            error: `Invalid credentials`,
        };
        return { status, infoMessage };
    }
};

const tokenValidationService = async (requestBody) => {
    const { id, token } = requestBody;
    let status;

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
        status = StatusCodes.OK;
        return { status };
    } else {
        logger.log(`Invalid token, sending response...`, 1);
        status = StatusCodes.UNAUTHORIZED;
        return { status };
    }
};
module.exports = { registerService, loginService, tokenValidationService };
