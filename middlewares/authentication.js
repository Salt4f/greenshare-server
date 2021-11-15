const { tokenValidationRequest } = require('../requests/user-service');
const logger = require('../utils/logger');
const db = require('../db/connect');

const authenticateUser = async (req, res, next) => {
    try {
        const response = await tokenValidationRequest(
            req.body.id,
            req.body.token
        );
        if (response.status == StatusCodes.CREATED) {
            // check id in our db
            const user = await db.users.findOne({ where: { id: req.body.id } });
            if (user != null) {
                logger.log(
                    `User successfuly validated, sending response...`,
                    1
                );

                next();
            }
        } else {
            logger.log(`Invalid token or ownerId, sending response...`, 1);
            throw new Error('UNAUTHORIZED');
        }
    } catch (error) {
        logger.log(error.message, 0);
    }
};

module.exports = authenticateUser;
