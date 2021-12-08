const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        // set default
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || `Something went wrong, try again later`,
    };

    if (err.name == 'SequelizeUniqueConstraintError') {
        customError.msg = `Duplicate value entered for ${err.errors[0].path} field`;
        customError.statusCode = 400;
    }

    return res.status(customError.statusCode).json({ error: customError.msg });
};

module.exports = errorHandlerMiddleware;
