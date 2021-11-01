const { tokenValidationRequest } = require('../requests/user-service');
const logger = require('../utils/logger');

const authenticateUser = async (req, res, next) => {
    try {
        const response = await tokenValidationRequest(
            req.body.ownerId,
            req.body.token
        );
        if (response.status == StatusCodes.CREATED) {
            logger.log(`User successfuly validated, sending response...`, 1);

            next();
        } else {
            logger.log(`Invalid token or ownerId, sending response...`, 1);
            // res.status(StatusCodes.UNAUTHORIZED).send();
            throw new Error('UNAUTHORIZED');
        }
    } catch (error) {
        logger.log(error.message, 0);
    }
};

module.exports = authenticateUser;
