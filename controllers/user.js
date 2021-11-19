const { StatusCodes } = require('http-status-codes');
const db = require('../db/connect');
const logger = require('../utils/logger');
const { authenticateUser } = require('../middlewares/authentication');

const getUser = async (req, res) => {
    logger.log(`Received getUser request`, 1);

    const userId = req.params.userId;
    const { id, token } = req.body;
    let user;

    try {
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
                res.status(StatusCodes.UNAUTHORIZED).send();
                throw new Error('UNAUTHORIZED');
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
        res.status(StatusCodes.OK).json(user);
    } catch (error) {
        logger.log(error.message, 0);
    }
};

module.exports = { getUser };
