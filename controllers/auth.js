const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const axios = require('axios');
const pool = require('../db/connect');

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
            if (response.status == StatusCodes.OK) {
                // store data to our DB (everything except pw)
                // mariaDB structure
                try {
                    // sqlQuery: pretty self-explanatory
                    const sqlQuery = '';
                    // .query: we'll input the values of the sqlQuery
                    const result = await pool.query(sqlQuery, '');
                } catch (error) {
                    throw error;
                }

                // send response to frontend
                res.status(StatusCodes.CREATED).json({
                    // still needs to handler the response (username, token)
                });
            }
            // error registering user
            else if (response.status == StatusCodes.BAD_REQUEST) {
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
            if (response.status == StatusCodes.OK) {
                // send response to frontend (token)
                res.status(StatusCodes.OK).json({ token: response.data.token });
            }
            // error registering user
            else if (response.status == StatusCodes.UNAUTHORIZED) {
                res.status(StatusCodes.UNAUTHORIZED);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
};

module.exports = { register, login };
