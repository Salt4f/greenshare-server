const axios = require('axios');
const logger = require('../utils/logger');
const { BadRequestError } = require('../errors');

require('dotenv').config();

const registerRequest = async (email, password, nickname) => {
    try {
        logger.log('Sending register request to UserService with axios...', 1);
        const response = await axios({
            method: 'post',
            url: process.env.USERSERVICE_REGISTER_URL,
            responseType: 'json',
            data: {
                email: email,
                password: password,
                nickname: nickname,
            },
        });
        return response;
    } catch (e) {
        throw new BadRequestError(`Email already registered in User Service`);
    }
};

const loginRequest = async (email, password) => {
    try {
        logger.log('Sending login request to UserService with axios...', 1);

        const response = await axios({
            method: 'post',
            url: process.env.USERSERVICE_LOGIN_URL,
            responseType: 'json',
            data: {
                email: email,
                password: password,
            },
        });
        return response;
    } catch (e) {
        throw new BadRequestError('Login failed, invalid credentials');
    }
};

const tokenValidationRequest = async (id, token) => {
    try {
        logger.log(
            'Sending tokenValidation request to UserService with axios...',
            1
        );

        const response = await axios({
            method: 'post',
            url: process.env.USERSERVICE_TOKEN_VALIDATION_URL,
            responseType: 'json',
            data: {
                id: id,
                token: token,
            },
        });
        return response;
    } catch (e) {
        throw new BadRequestError('Invalid token');
    }
};

module.exports = {
    registerRequest,
    loginRequest,
    tokenValidationRequest,
};
