const nodeCron = require('node-cron');
const db = require('../db/connect');
const { exchangeEcoPointsService } = require('../services/admin');

const job = nodeCron.schedule('*/30 * * * *', async () => {
    const offers = await db.offers.findAll({ where: { active: true } });
    for (const offer of offers) {
        const offerTerminateAt = new Date(offer.terminateAt);
        const now = new Date();
        if (offerTerminateAt < now) {
            await offer.update({ active: false });
            offer.save();
        }
    }
    const requests = await db.requests.findAll({ where: { active: true } });
    for (const request of requests) {
        const requestTerminateAt = new Date(request.terminateAt);
        const now = new Date();
        if (requestTerminateAt < now) {
            await request.update({ active: false });
            request.save();
        }
    }
});

const exchangeJobFirst = nodeCron.schedule('0 0 1 * *', async () => {
    await exchangeEcoPointsService();
});

const exchangeJobSecond = nodeCron.schedule('0 0 15 * *', async () => {
    await exchangeEcoPointsService();
});

module.exports = { job, exchangeJobFirst, exchangeJobSecond };
