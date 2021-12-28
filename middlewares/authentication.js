const { StatusCodes } = require('http-status-codes');
const { tokenValidationRequest } = require('../requests/stubs/user-service');
const logger = require('../utils/logger');
const db = require('../db/connect');
const { UnauthenticatedError, NotFoundError } = require('../errors');

const authenticateUser = async (req, res, next) => {
    logger.log(`Starting authenticateUser...`, 1);
    logger.log(`Validating user...`, 1);
    try {
        logger.log(`Checking if user exists in back-end database...`, 1);
        const user = await db.users.findOne({ where: { id: req.get('id') } });
        if (user != null) {
            logger.log(
                `Got user, sending request to tokenValidation of UserService...`,
                1
            );
            const response = await tokenValidationRequest(
                req.get('id'),
                req.get('token')
            );
            if (response.status == StatusCodes.CREATED) {
                logger.log(
                    `User successfuly validated, sending response...`,
                    1
                );

                next();
            } else {
                throw new UnauthenticatedError(
                    'Invalid token or id on UserService'
                );
            }
        } else {
            throw new UnauthenticatedError(
                `No user with id: ${req.get('id')} in back-end`
            );
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const offerOwnerAuth = async (req, res, next) => {
    logger.log(`Validating offerOwnerAuth...`, 1);
    try {
        const offerId = req.params.offerId;
        const offer = await db.offers.findOne({ where: { id: offerId } });

        if (offer === null) {
            throw new NotFoundError(
                `Offer with id ${offerId} not exists in back-end db`
            );
        }

        if (offer.dataValues.ownerId == req.get('id')) {
            logger.log(`OfferOwnerAuth validated..`, 1);
            next();
        } else {
            throw new UnauthenticatedError(
                `User with id: ${req.get(
                    'id'
                )} is trying to edit someone else's Offer`
            );
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const requestOwnerAuth = async (req, res, next) => {
    logger.log(`Validating requestOwnerAuth...`, 1);
    try {
        const requestId = req.params.requestId;
        const request = await db.requests.findOne({ where: { id: requestId } });

        if (request === null) {
            throw new NotFoundError(
                `Request with id ${requestId} not exists in back-end db`
            );
        }

        if (request.dataValues.ownerId == req.get('id')) {
            logger.log(`requestOwnerAuth validated..`, 1);
            next();
        } else {
            throw new UnauthenticatedError(
                `User with id: ${req.get(
                    'id'
                )} is trying to edit someone else's Request`
            );
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = { authenticateUser, offerOwnerAuth, requestOwnerAuth };
