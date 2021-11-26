const { StatusCodes } = require('http-status-codes');
const db = require('../db/connect');
const logger = require('../utils/logger');
const { authenticateUser } = require('../middlewares/authentication');

const getUserService = async (userId, requestBody) => {
    const { id, token } = requestBody;
    let user, status, infoMessage;

    if (id != undefined && token != undefined) {
        logger.log(`Authenticating user info....`, 1);
        await authenticateUser(req, res);
        logger.log(`User authenticated, checking id's....`, 1);
        if (req.body.id == userId) {
            user = await db.users.findOne({
                where: {
                    id: userId,
                },
            });
        } else {
            logger.log(
                `User with id ${req.body.id} trying to get someone else's info...`,
                1
            );
            status = StatusCodes.UNAUTHORIZED;
            return status;
        }
    } else {
        user = await db.users.findOne({
            where: {
                id: userId,
            },
            attributes: ['nickname'],
        });
    }
    logger.log(`Got user with id: ${userId}, sending response...`, 1);
    infoMessage = user;
    status = StatusCodes.OK;
    return { status, infoMessage };
};

module.exports = { getUserService };
