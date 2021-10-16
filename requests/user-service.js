const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

const registerRequest = (email, password, nickname) => {
    return axios({
        method: 'post',
        url: 'users.greensharebcn.com/users',
        responseType: 'json',
        data: { email, password, nickname }
    })
}

const loginRequest = (email, password) => {
    return axios({
        method: 'get',
        url: 'users.greensharebcn.com/login',
        responseType: 'json',
        data: { email, password }
    })
}

module.exports = { registerRequest, loginRequest };