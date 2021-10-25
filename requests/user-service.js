const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

const registerRequest = async (email, password, nickname) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'http://users.vgafib.org/users/',
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
            url: 'http://users.vgafib.org/login/',
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
            url: 'http://users.vgafib.org/verify-user/',
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
