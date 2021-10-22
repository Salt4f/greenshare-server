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
const { createUser } = require('../db/users');
const { request } = require('express');
const validate = require('../utils/data-validation');

const register = async (req, res) => {
    const { email, password, nickname } = req.body;

    if (!validate.email(email)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing email`,
        });
        return;
    }
    if (!validate.nickname(nickname)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing nickname`,
        });
        return;
    }
    if (!validate.password(password)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing password`,
        });
        return;
    }
    try {
        const response = await registerRequest(email, password, nickname);
        if (response.status == StatusCodes.CREATED) {
            await createUser(response.data.id, email, nickname);
            console.log('Successfully created user, sending response...');
            res.status(StatusCodes.CREATED).json({
                id: response.data.id,
                token: response.data.token,
            });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: `User service error`,
            });
        }
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: `Internal server error`,
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!validate.email(email)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing email`,
        });
        return;
    }
    if (!validate.password(password)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing password`,
        });
        return;
    }
    try {
        const response = await loginRequest(email, password);
        if (response.status == StatusCodes.CREATED) {
            console.log('Successfully logged in, sending response...');
            res.status(StatusCodes.OK).json({
                id: response.data.id,
                token: response.data.token,
            });
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({
                error: `Invalid credentials`,
            });
        }
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: `Internal server error`,
        });
    }
};

const tokenValidation = async (req, res) => {
    const { id, token } = req.body;
    console.log(`Starting token validation...`);
    if (!validate.id(id)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing id`,
        });
        return;
    }
    if (!validate.token(token)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters: invalid or missing token`,
        });
        return;
    }
    try {
        const response = await tokenValidationRequest(id, token);
        if (response.status == StatusCodes.CREATED) {
            console.log('Token validated');
            res.status(StatusCodes.OK).send();
        } else {
            console.log('Token invalid');
            res.status(StatusCodes.FORBIDDEN).send();
        }
    } catch (e) {
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
