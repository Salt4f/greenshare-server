const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');

const register = async (req, res) => {
    res.send('user registered');

    const { nickname, email, password } = req.body;

    // send data to the user service to register user in their DB
    // (...)
    // do we need to save it in our DB? yes, but only username and email (NO PW)

    // create new user with the info from req.body
    const user = await User.create({ ...req.body });
    // user has been created successfully and we send back its
    // username and token
    res.status(StatusCodes.CREATED).json({
        user: { email: user.getUsername().email },
        // token,
    });
};

const login = async (req, res) => {
    res.send('user logged');
};

module.exports = { register, login };
