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

    /////////////// VALIDATION ///////////////
    logger.log(`Starting validation...`, 1);
    let status, infoMessage;

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
        infoMessage = `Email already registered`;
        return { status, infoMessage };
    } else {
        status = StatusCodes.INTERNAL_SERVER_ERROR;
        infoMessage = `User service error`;
        return { status, infoMessage };
    }
};

module.exports = { registerService };
