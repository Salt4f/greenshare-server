const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const axios = require('axios');

const register = async (req, res) => {
    // password from req is already hashed
    const { email, password } = req.body;
    // send data to the user service to register user in their DB
    axios({
        // maybe we'll need to change the method
        method: 'get',
        url: '',
        responseType: 'json',
        // we are sending the email and pw from the request to the UserService
        data: { email, password },
    })
        .then(function (response) {
            // user successfully registered
            if (response.status == '200') {
                // store data to our DB (everything except pw) with the info
                // from req.body

                // send response to frontend
                res.status(StatusCodes.CREATED).json({
                    // falta configurar la respuesta (username, token)
                });
            }
            // error registering user
            else if (response.status == '401') {
                res.status(StatusCodes.BAD_REQUEST);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
};

const login = async (req, res) => {
    // password from req is already hashed
    const { email, password } = req.body;

    axios({
        // maybe we'll need to change the method
        method: 'get',
        url: '',
        responseType: 'json',
        data: {
            email,
            password,
        },
    })
        .then(function (response) {
            // user successfully logged in
            if (response.status == '200') {
                // send response to frontend (token)
                res.status(StatusCodes.OK).json({ token: response.data.token });
            }
            // error registering user
            else if (response.status == '401') {
                res.status(StatusCodes.UNAUTHORIZED);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
};

module.exports = { register, login };
