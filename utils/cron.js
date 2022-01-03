const nodeCron = require('node-cron');
const db = require('../db/connect');

const job = nodeCron.schedule('0 0 * * 0', async () => {
    const offers = await db.offers.findAll({ where: { active: true } });
    for (const offer of offers) {
        const offerTerminateAt = new Date(offer.terminateAt);
        const now = new Date();
        if (offerTerminateAt < now) {
            await offer.update({ active: false });
        }
    }
    const requests = await db.requests.findAll({ where: { active: true } });
    for (const request of requests) {
        const requestTerminateAt = new Date(request.terminateAt);
        const now = new Date();
        if (requestTerminateAt < now) {
            await request.update({ active: false });
        }
    }
});

module.exports = job;
