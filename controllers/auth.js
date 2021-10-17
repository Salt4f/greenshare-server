const { StatusCodes } = require('http-status-codes');
const {
    BadRequestError,
    UnauthenticatedError,
    InternalServerError,
} = require('../errors');
const {
    registerRequest,
    loginRequest,
} = require('../requests/stubs/user-service'); // remove '/stubs' for prod
const { createUser } = require('../db/users');
const { request } = require('express');
const validate = require('../utils/data-validation');

const register = async (req, res) => {
    const { email, password, nickname } = req.body;

    if (
        !validate.email(email) ||
        !validate.nickname(nickname) ||
        !validate.password(password)
    ) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters`,
        });
        return;
    }
    try {
        const response = await registerRequest(email, password, nickname);
        if (response.status == StatusCodes.OK) {
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

    if (!validate.email(email) || !validate.password(password)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: `Wrong parameters`,
        });

        return;
    }
    try {
        const response = await loginRequest(email, password);
        if (response.status == StatusCodes.OK) {
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

module.exports = {
    register,
    login,
};
