const { StatusCodes } = require('http-status-codes');

const registerRequest = async (email, password, nickname) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = {
        status: StatusCodes.CREATED,
        data: {
            id: 3,
            token: '3',
        },
    };
    return response;
};

const loginRequest = async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = {
        status: StatusCodes.CREATED,
        data: {
            id: 1,
            token: '1',
        },
    };
    return response;
};

const tokenValidationRequest = async (id, token) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = {
        status: StatusCodes.CREATED,
        data: {
            id,
            token,
        },
    };
    return response;
};

module.exports = { registerRequest, loginRequest, tokenValidationRequest };
