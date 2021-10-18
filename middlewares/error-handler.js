const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        // set default
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || `Something went wrong, try again later`,
    };

    if (err.name == 'CastError') {
        customError.msg = `No item found with id: ${err.vallue}`;
        customError.statusCode = 404;
    }

    if (err.name == 'ValidationError') {
        // we iterate on each error and grab the error message and then join them
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(', ');
        customError.statusCode = 400;
    }

    // duplicate value
    // the 11000 value is extracted on the mongoose db error, so if there's an
    // error and its value is equal to 11000, it means that we are introducing a
    // duplicate value
    if (err.code && err.code == 11000) {
        // we are using Object.keys because its an Object[object] in order to
        // access the key value of the error
        customError.msg = `Duplicate value entered for ${Object.keys(
            err.keyValue
        )} field, please choose another value`;
        customError.statusCode = 400;
    }

    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
