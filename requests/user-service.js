const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

require('dotenv').config();

const registerRequest = async (email, password, nickname) => {
    try {
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
        throw new Error(e);
    }
};

const loginRequest = async (email, password) => {
    try {
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
        throw new Error(e);
    }
};

const tokenValidationRequest = async (id, token) => {
    try {
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
        throw new Error(e);
    }
};

module.exports = {
    registerRequest,
    loginRequest,
    tokenValidationRequest,
};
