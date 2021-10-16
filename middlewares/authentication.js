const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
    //check header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication invalid');
    }
    // we get the token
    const token = authHeader.split(' ')[1];
    try {
        // verify if the token is still valid or not
        //(...)

        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid');
    }
};

module.exports = auth;
