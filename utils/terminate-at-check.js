const db = require('../db/connect');
const logger = require('./logger');

const check = async () => {
    const offers = await db.offers.findAll({ where: { active: true } });
    for (const offer of offers) {
        const offerTerminateAt = new Date(offer.terminateAt);
        const now = new Date();
        if (offerTerminateAt < now) {
            logger.log(`Deactivating offer with id: ${offer.id}...`, 1);
            await offer.update({ active: false });
            offer.save();
            logger.log(
                `Successfully deactivated offer with id: ${offer.id}...`,
                1
            );
        }
    }
    const requests = await db.requests.findAll({ where: { active: true } });
    for (const request of requests) {
        const requestTerminateAt = new Date(request.terminateAt);
        const now = new Date();
        if (requestTerminateAt < now) {
            logger.log(`Deactivating request with id: ${request.id}...`, 1);
            await request.update({ active: false });
            request.save();
            logger.log(
                `Successfully deactivated request with id: ${request.id}...`,
                1
            );
        }
    }
};

module.exports = { check };
