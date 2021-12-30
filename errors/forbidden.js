const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api');

class ForbidenError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.FORBIDDEN;
    }
}

module.exports = ForbidenError;
