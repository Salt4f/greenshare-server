const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const { getUserAllInfo, getUserNickname } = require('../services/user');
const { authenticateUser } = require('../middlewares/authentication');
const { tokenValidationService } = require('../services/auth');

const getUser = async (req, res) => {
    logger.log(`Received getUser request`, 1);
    const { id, token } = req.body;
    try {
        if (id != undefined && token != undefined) {
            logger.log(`Authenticating user info....`, 1);
            const response = await tokenValidationService(req.body);
            if (response.status != StatusCodes.OK) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: `invalid user`,
                });
                return;
            }
            logger.log(`User authenticated, checking id's....`, 1);
            const { status, infoMessage } = await getUserAllInfo(
                id,
                req.params.userId
            );
            res.status(status).json(infoMessage);
        } else {
            const { status, infoMessage } = await getUserNickname(
                req.params.userId
            );
            res.status(status).json(infoMessage);
        }
    } catch (error) {
        logger.log(error.message, 0);
    }
};

module.exports = { getUser };
