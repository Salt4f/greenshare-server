const {
    StatusCodes
} = require('http-status-codes');
const {
    BadRequestError,
    UnauthenticatedError
} = require('../errors');
const {
    registerRequest,
    loginRequest
} = require('../requests/stubs/user-service'); // remove '/stubs' for prod
const {
    createUser
} = require('../db/users');
const {
    request
} = require('express');

const register = (req, res) => {
    const {
        email,
        password,
        nickname
    } = req.body;

    registerRequest(email, password, nickname)
        .then((response) => {
            if (response.status == StatusCodes.OK) {
                createUser(response.data.id, email, nickname)
                    .then(() => {
                        console.log('Successfully created user, sending response...');
                        res.status(StatusCodes.CREATED).json({
                            id: response.data.id,
                            token: response.data.token
                        });
                    })
                    .catch(error => {
                        console.log("Couldn't create user, sending bad response");
                        console.log(`ERROR: ${error}`);
                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                            error: `Couldn't save user in database`
                        });
                    });
            } else {
                res.status(StatusCodes.BAD_REQUEST).send();
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

const login = (req, res) => {

    const {
        email,
        password
    } = req.body;

    loginRequest(email, password)
        .then(function (response) {
            if (response.status == StatusCodes.OK) {
                res.status(StatusCodes.OK).json({
                    id: response.data.id,
                    token: response.data.token
                });
            } else {
                res.status(StatusCodes.UNAUTHORIZED);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
};

module.exports = {
    register,
    login
};