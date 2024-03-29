const { StatusCodes } = require('http-status-codes');
const {
    registerRequest,
    loginRequest,
    tokenValidationRequest,
} = require('../requests/user-service');
const db = require('../db/connect');
const validate = require('../utils/data-validation');
const logger = require('../utils/logger');
const { inspect } = require('util');
const {
    BadRequestError,
    UnauthenticatedError,
    InternalServerError,
} = require('../errors');

const registerService = async (requestBody) => {
    const { email, password, nickname, dni, birthDate, fullName } = requestBody;

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
        throw new BadRequestError(message);
    }
    logger.log(message, 1);

    logger.log('Sending register request to UserService...', 1);
    const response = await registerRequest(email, password, nickname);
    logger.log('Received register response from UserService, checking...', 1);

    if (response.status === StatusCodes.CREATED) {
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
        return response.data;
    } else if (response.status === StatusCodes.BAD_REQUEST) {
        throw new BadRequestError(`Email already registered`);
    } else {
        throw new InternalServerError(`User Service error`);
    }
};

const loginService = async (requestBody) => {
    const { email, password } = requestBody;
    /////////////// VALIDATION ///////////////
    logger.log(`Starting validation...`, 1);
    const { passed, message } = validate.login(email, password);

    if (!passed) {
        throw new BadRequestError(message);
    }
    logger.log(message, 1);

    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        logger.log(`Admin successfully logged in`, 1);
        const credentials = {
            id: process.env.ADMIN_ID,
            token: process.env.ADMIN_TOKEN,
        };
        return credentials;
    }

    logger.log('Checking if user exists in back-end db...', 1);
    const user = await db.users.findOne({ where: { email: email } });
    if (!user) {
        throw new UnauthenticatedError('User does not exist in back-end');
    }

    logger.log('Sending loginRequest...', 1);
    const response = await loginRequest(email, password);
    logger.log('Received loginRequest, checking response...', 1);

    if (response.status === StatusCodes.CREATED) {
        logger.log('Successfully logged in, sending response...', 1);
        const credentials = {
            id: response.data.id,
            token: response.data.token,
        };
        return credentials;
    } else {
        throw new UnauthenticatedError('Login failed, invalid credentials');
    }
};

const tokenValidationService = async (id, token) => {
    /////////////// VALIDATION ///////////////
    logger.log(`Starting token validation...`, 1);
    const { passed, message } = validate.tokenValidation(id, token);

    if (!passed) throw new BadRequestError(message);

    logger.log(message, 1);

    if (id === process.env.ADMIN_ID && token === process.env.ADMIN_TOKEN) {
        logger.log(`Admin successfully validated`, 1);
        return;
    }

    logger.log('Checking if user exists in back-end db...', 1);
    const user = await db.users.findOne({ where: { id: id } });
    if (!user) {
        throw new UnauthenticatedError('User does not exist in back-end');
    }

    logger.log(`Sending tokenValidationRequest...`, 1);
    const response = await tokenValidationRequest(id, token);
    logger.log(`Received tokenValidationRequest response, checking...`, 1);

    if (response.status === StatusCodes.CREATED) {
        logger.log(`Token successfuly validated, sending response...`, 1);
        return;
    } else {
        throw new UnauthenticatedError('Invalid token,');
    }
};

module.exports = { registerService, loginService, tokenValidationService };
