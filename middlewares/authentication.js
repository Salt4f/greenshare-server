const { StatusCodes } = require('http-status-codes');
const { tokenValidationRequest } = require('../requests/user-service');
const logger = require('../utils/logger');
const db = require('../db/connect');

const authenticateUser = async (req, res, next) => {
    logger.log(`Validating user...`, 1);
    try {
        logger.log(`Checking if user exists in back-end database...`, 1);
        const user = await db.users.findOne({ where: { id: req.body.id } });
        if (user != null) {
            logger.log(
                `Got user, sending request to tokenValidation of UserService...`,
                1
            );
            const response = await tokenValidationRequest(
                req.body.id,
                req.body.token
            );
            if (response.status == StatusCodes.CREATED) {
                logger.log(
                    `User successfuly validated, sending response...`,
                    1
                );

                next();
            } else {
                logger.log(
                    `Invalid token or id on UserService, sending response...`,
                    1
                );
                res.status(StatusCodes.UNAUTHORIZED).send();
                throw new Error('UNAUTHORIZED');
            }
        } else {
            logger.log(
                `No user with id: ${req.body.id} in back-end, sending response...`,
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

        if (offer === null) {
            res.status(StatusCodes.NOT_FOUND).json({
                error: `Offer with id ${offerId} not exists in back-end db`,
            });
            throw new Error('NOT FOUND');
        }

        if (offer.dataValues.ownerId == req.body.id) {
            logger.log(`OfferOwnerAuth validated..`, 1);
            next();
        } else {
            logger.log(
                `User with id: ${req.body.id} is trying to edit someone else's Offer..`,
                1
            );
            res.status(StatusCodes.UNAUTHORIZED).json({
                error: `User with id: ${req.body.id} is trying with someone else's Offer..`,
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

        if (request === null) {
            res.status(StatusCodes.NOT_FOUND).json({
                error: `Request with id ${requestId} not exists in back-end db`,
            });
            throw new Error('NOT FOUND');
        }

        if (request.dataValues.ownerId == req.body.id) {
            logger.log(`requestOwnerAuth validated..`, 1);
            next();
        } else {
            logger.log(
                `User with id: ${req.body.id} is trying to edit someone else's Request..`,
                1
            );
            res.status(StatusCodes.UNAUTHORIZED).json({
                error: `User with id: ${req.body.id} is trying with someone else's Request..`,
            });
            throw new Error('UNAUTHORIZED');
        }
    } catch (error) {
        logger.log(error.message, 0);
    }
};

module.exports = { authenticateUser, offerOwnerAuth, requestOwnerAuth };
