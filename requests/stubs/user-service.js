const { StatusCodes } = require('http-status-codes');

const registerRequest = (email, password, nickname) => {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            response = {
                status: StatusCodes.OK,
                data: {
                    id: 1,
                    token: "21092381098"
                }
            }
            resolve(response);
        }, 500);
    })
}

const loginRequest = (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            response = {
                status: StatusCodes.OK,
                data: {
                    id: 1,
                    token: "21092381098"
                }
            }
            resolve(response);
        }, 500);
    })
}

module.exports = { registerRequest, loginRequest };