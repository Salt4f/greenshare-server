const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

const logger = require('../utils/logger');

const registerRequest = async (email, password, nickname) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'http://users.vgafib.org/users/',
            responseType: 'json',
            data: {
                email: email,
                password: password,
                nickName: nickname,
            },
        });
        return response;
    } catch (e) {
        logger.log(e.message, 0);

        throw new Error(e);
    }
};

const loginRequest = async (email, password) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'http://users.vgafib.org/login/',
            responseType: 'json',
            data: {
                email: email,
                password: password,
            },
        });
        return response;
    } catch (e) {
        logger.log(e.message, 0);

        throw new Error(e);
    }
};

const tokenValidationRequest = async (id, token) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'http://users.vgafib.org/verify-user/',
            responseType: 'json',
            data: {
                id: id,
                token: token,
            },
        });
        return response;
    } catch (e) {
        logger.log(e.message, 0);

        console.log(
            `[WARNING]: Returning false at token validation because caught exception. This should be caused by a 404 response if token is invalid (please response to a 400 in user validation).`
        );
        return {
            status: 400,
        };
    }
};

module.exports = {
    registerRequest,
    loginRequest,
    tokenValidationRequest,
};
