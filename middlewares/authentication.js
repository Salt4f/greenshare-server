const { StatusCodes } = require('http-status-codes');
const { tokenValidationRequest } = require('../requests/stubs/user-service');
const logger = require('../utils/logger');
const db = require('../db/connect');

const authenticateUser = async (req, res, next) => {
    logger.log(`Validating user...`, 1);
    try {
        logger.log(`Sending request to tokenValidation...`, 1);
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
            } else {
                logger.log(
                    `No user with id: ${req.body.id} in back-end, sending response...`,
                    1
                );
                res.status(StatusCodes.UNAUTHORIZED).send();
                throw new Error('UNAUTHORIZED');
            }
        } else {
            logger.log(
                `Invalid token or id on UserService, sending response...`,
                1
            );
            res.status(StatusCodes.UNAUTHORIZED).send();
            throw new Error('UNAUTHORIZED');
        }
    } catch (error) {
        logger.log(error.message, 0);
    }
};

const offerOwnerAuth = async (req, res, next) => {
    logger.log(`Validating offerOwnerAuth...`, 1);
    try {
        const offerId = req.params.offerId;
        const offer = await db.offers.findOne({ where: { id: offerId } });

        if (offer.dataValues.ownerId == req.body.id) {
            logger.log(`OfferOwnerAuth validated..`, 1);
            next();
        } else {
            logger.log(
                `User with id: ${req.body.id} is trying to edit someone else's offer..`,
                1
            );
            res.status(StatusCodes.UNAUTHORIZED).json({
                error: `User with id: ${req.body.id} is trying with someone else's offer..`,
            });
            throw new Error('UNAUTHORIZED');
        }
    } catch (error) {
        logger.log(error.message, 0);
    }
};

const requestOwnerAuth = async (req, res, next) => {
    logger.log(`Validating user...`, 1);
    try {
        const requestId = req.params.requestId;
        const request = await db.requests.findOne({ where: { id: requestId } });

        if (request.dataValues.ownerId == req.body.id) {
            logger.log(`requestOwnerAuth validated..`, 1);
            next();
        } else {
            logger.log(
                `User with id: ${req.body.id} is trying to edit someone else's request..`,
                1
            );
            res.status(StatusCodes.UNAUTHORIZED).json({
                error: `User with id: ${req.body.id} is trying with someone else's request..`,
            });
            throw new Error('UNAUTHORIZED');
        }
    } catch (error) {
        logger.log(error.message, 0);
    }
};

module.exports = { authenticateUser, offerOwnerAuth, requestOwnerAuth };
