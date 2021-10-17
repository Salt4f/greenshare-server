const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

const registerRequest = async (email, password, nickname) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'users.greensharebcn.com/users',
            responseType: 'json',
            data: {
                email,
                password,
                nickname,
            },
        });
        return response;
    } catch (e) {
        throw new Error(e);
    }
};

const loginRequest = async (email, password) => {
    return axios({
        method: 'get',
        url: 'users.greensharebcn.com/login',
        responseType: 'json',
        data: {
            email,
            password,
        },
    });
};

module.exports = {
    registerRequest,
    loginRequest,
};
