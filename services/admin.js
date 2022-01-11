require('dotenv').config;
const { StatusCodes } = require('http-status-codes');
const db = require('../db/connect');
const logger = require('../utils/logger');
const {
    UnauthenticatedError,
    NotFoundError,
    BadRequestError,
    ForbidenError,
} = require('../errors');

const reportService = async (itemId, type, reporterId, message) => {
    logger.log(`Starting report validation...`, 1);
    if (!message) {
        throw new BadRequestError(`Message is mandatory`);
    }
    let customType = '';
    if (type === 'user') {
        customType = 'user';
        if (reporterId === itemId) {
            throw new BadRequestError(
                `User with id ${reporterId} is reporting himself`
            );
        }
    } else {
        const post = await db.posts.findOne({ where: { id: itemId } });
        if (post.type === 'offer') {
            customType = 'offer';
            const offer = await db.offers.findOne({ where: { id: itemId } });
            if (offer.ownerId == reporterId) {
                throw new BadRequestError(
                    `User with id ${reporterId} is reporting his own offer`
                );
            }
        } else {
            customType = 'request';
            const request = await db.requests.findOne({
                where: { id: itemId },
            });
            if (request.ownerId == reporterId) {
                throw new BadRequestError(
                    `User with id ${reporterId} is reporting his own request`
                );
            }
        }
    }
    logger.log(`Successfully validated report`, 1);
    logger.log(`Creating report...`, 1);
    logger.log(
        `Report info: itemId ${itemId}, type ${type}, reporterId ${reporterId}, message ${message}`,
        1
    );
    const report = await db.reports.create({
        type: customType,
        itemId,
        reporterId,
        message,
    });
    logger.log(`Successfully created report with id: ${report.id}`, 1);
    return report;
};

const getAllReportsService = async () => {
    logger.log(`Getting all reports...`, 1);
    const reports = await db.reports.findAll({ where: { solved: false } });
    if (reports.length === 0) logger.log(`There's no reports yet`, 1);

    for (const report of reports) {
        if (report.type === 'user') {
            const user = await db.users.findOne({
                where: { id: report.itemId },
            });
            report.dataValues.itemName = user.nickname;
        } else if (report.type === 'offer') {
            const offer = await db.offers.findOne({
                where: { id: report.itemId },
            });
            report.dataValues.itemName = offer.name;
        } else if (report.type === 'request') {
            const request = await db.requests.findOne({
                where: { id: report.itemId },
            });
            report.dataValues.itemName = request.name;
        }
    }
    return reports;
};

const deactivatePostService = async (postId) => {
    logger.log(`Current report type is Post`, 1);
    const post = await db.posts.findOne({ where: { id: postId } });
    if (post.type === 'offer') {
        logger.log(`Deactivating Offer with id: ${post.id}...`, 1);
        const offer = await db.offers.findOne({
            where: { id: post.id, active: true },
        });
        if (!offer) {
            throw new BadRequestError(
                `Offer with id: ${post.id} is already deactivated`
            );
        }
        await offer.update({ active: false });
        offer.save();
    } else {
        logger.log(`Deactivating Request with id: ${post.id}...`, 1);
        const request = await db.requests.findOne({
            where: { id: post.id, active: true },
        });
        if (!request) {
            throw new BadRequestError(
                `Request with id: ${post.id} is already deactivated`
            );
        }
        await request.update({ active: false });
        request.save();
    }
    logger.log(
        `Successfully deactivated Post with id: ${post.id}, type: ${post.type}`,
        1
    );
    return post;
};

const solveReportService = async (reportId) => {
    logger.log(`Finding report...`, 1);
    const report = await db.reports.findOne({ where: { id: reportId } });
    logger.log(`Updating Report with id: ${report.id} as solved...`, 1);
    await report.update({ solved: true });
    report.save();
    logger.log(`Report with id: ${report.id} solved`, 1);
    return report;
};

const banUserService = async (userId) => {
    logger.log(`Checking user...`, 1);
    const user = await db.users.findOne({ where: { id: userId } });
    if (!user)
        throw new NotFoundError(`User with id ${userId} does not exist in db`);
    if (user.banned === true)
        throw new BadRequestError(`User with id ${userId} is already banned`);

    logger.log(`Deactivating Offers...`, 1);
    const offers = await db.offers.findAll({ where: { ownerId: userId } });
    for (const offer of offers) {
        if (offer.status === 'pending') {
            let request = await db.requests.findOne({
                where: { id: offer.RequestId },
                include: [
                    {
                        model: db.offers,
                        attributes: ['id'],
                    },
                ],
            });
            const newPendingOffers = request.dataValues.Offers.filter(
                (e) => e.id != offer.id
            );
            await request.setOffers(newPendingOffers);
        }
        await offer.update({ active: false });
        offer.save();
    }
    logger.log(`Offers deactivated...`, 1);
    logger.log(`Deactivating Requests...`, 1);
    const requests = await db.requests.findAll({ where: { ownerId: userId } });
    for (const request of requests) {
        if (request.status === 'pending') {
            let offer = await db.offers.findOne({
                where: { id: request.OfferId },
                include: [
                    {
                        model: db.requests,
                        attributes: ['id'],
                    },
                ],
            });
            const newPendingRequests = offer.dataValues.Requests.filter(
                (e) => e.id != request.id
            );
            await offer.setRequests(newPendingRequests);
        }
        await request.update({ active: false });
        request.save();
    }
    logger.log(`Requests deactivated...`, 1);

    logger.log(`Banning user...`, 1);
    await user.update({ banned: true });
    user.save();
    logger.log(`Successfully banned user with id: ${userId}`, 1);

    return user;
};

module.exports = {
    reportService,
    getAllReportsService,
    solveReportService,
    deactivatePostService,
    banUserService,
};
