const User = require('../models/User');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
    next();
};

module.exports = auth;
