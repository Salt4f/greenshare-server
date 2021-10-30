const { StatusCodes } = require('http-status-codes');

const registerRequest = async (email, password, nickname) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = {
        status: StatusCodes.CREATED,
        data: {
            id: 1,
            token: '21092381098',
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
            token: '21092381098',
        },
    };
    return response;
};

module.exports = { registerRequest, loginRequest };
