require('dotenv').config;
const { StatusCodes } = require('http-status-codes');
const { tokenValidationRequest } = require('../requests/stubs/user-service');
const logger = require('../utils/logger');
const { checkBannedUser } = require('../utils/banned');
const db = require('../db/connect');
const {
    UnauthenticatedError,
    NotFoundError,
    ForbidenError,
} = require('../errors');

const authenticateUser = async (req, res, next) => {
    logger.log(`Starting authenticateUser...`, 1);
    logger.log(`Validating user...`, 1);
    try {
        if (
            req.get('id') === process.env.ADMIN_ID &&
            req.get('token') === process.env.ADMIN_TOKEN
        ) {
            logger.log(`Successfully authenticated Admin`, 1);
            next();
        } else {
            logger.log(`Checking if user exists in back-end database...`, 1);
            const user = await db.users.findOne({
                where: { id: req.get('id') },
            });
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
                `Offer with id ${offerId} does not exists in back-end db`
            );
        }

        if (
            req.get('id') === process.env.ADMIN_ID &&
            req.get('token') === process.env.ADMIN_TOKEN
        ) {
            logger.log(`Successfully authenticated Admin`, 1);
            next();
        } else {
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
        const request = await db.requests.findOne({
            where: { id: requestId },
        });

        if (request === null) {
            throw new NotFoundError(
                `Request with id ${requestId} does not exists in back-end db`
            );
        }

        if (
            req.get('id') === process.env.ADMIN_ID &&
            req.get('token') === process.env.ADMIN_TOKEN
        ) {
            logger.log(`Successfully authenticated Admin`, 1);
            next();
        } else {
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
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const headersCheck = async (req, res, next) => {
    logger.log(`Checking if request has headers...`, 1);
    try {
        if (req.get('id')) {
            logger.log(`Request has headers`, 1);
            await authenticateUser(req, res, next);
        } else {
            logger.log(`Request doesn't have headers`, 1);
            next();
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const authenticateAdmin = async (req, res, next) => {
    try {
        if (
            req.get('id') === process.env.ADMIN_ID &&
            req.get('token') === process.env.ADMIN_TOKEN
        ) {
            logger.log(`Successfully authenticated Admin`, 1);
            next();
        } else {
            throw new ForbidenError(`Forbidden access`);
        }
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const bannedCheck = async (req, res, next) => {
    try {
        if (req.get('id')) {
            if (await checkBannedUser(req.get('id')))
                throw new ForbidenError(`User banned`);
        } else if (req.body.email) {
            if (await checkBannedUser(req.body.email))
                throw new ForbidenError(`User banned`);
        }
        next();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = {
    authenticateUser,
    offerOwnerAuth,
    requestOwnerAuth,
    headersCheck,
    authenticateAdmin,
    bannedCheck,
};
