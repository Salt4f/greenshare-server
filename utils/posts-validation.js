const logger = require('../utils/logger');
const { inspect } = require('util');
const db = require('../db/connect');

const postsValidation = async (offerId, requestId) => {
    let statusValidation, messageValidation;
    logger.log(`Searching Offer and Request in db...`, 1);
    const request = await db.requests.findOne({
        where: { id: requestId },
        include: { model: db.offers },
    });
    const offer = await db.offers.findOne({
        where: { id: offerId },
        include: { model: db.requests },
    });
    logger.log(`Checking if they exist...`, 1);
    if (!request || !offer) {
        logger.log(`Invalid requestId or offerId`, 1);
        statusValidation = false;
        messageValidation = `Invalid requestId or offerId`;
        return { statusValidation, messageValidation };
    }
    logger.log(`Checking if user is requesting its own Offer...`, 1);
    if (request.ownerId === offer.ownerId) {
        logger.log(`User is requesting its own Offer`, 1);
        statusValidation = false;
        messageValidation = `User is requesting its own Offer`;
        return { statusValidation, messageValidation };
    }
    statusValidation = true;
    messageValidation = `Posts validation passed`;
    return { statusValidation, messageValidation, request, offer };
};

module.exports = { postsValidation };
