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
    let status, infoMessage;
    logger.log(`Starting report validation...`, 1);
    if (!message) {
        throw new BadRequestError(`Message is mandatory`);
    }

    if (type === 'user') {
        if (reporterId === itemId) {
            throw new BadRequestError(
                `User with id ${reporterId} is reporting himself`
            );
        }
    } else {
        const post = await db.posts.findOne({ where: { id: itemId } });
        if (post.type === 'offer') {
            const offer = await db.offers.findOne({ where: { id: itemId } });
            if (offer.ownerId == reporterId) {
                throw new BadRequestError(
                    `User with id ${reporterId} is reporting his own offer`
                );
            }
        } else {
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
        `Report info: itemId ${itemId}, type ${type}, reporterId ${reporterId}, message ${message}`
    );
    const report = await db.reports.create({
        type,
        itemId,
        reporterId,
        message,
    });
    logger.log(`Successfully created report with id: ${report.id}`, 1);
    status = StatusCodes.CREATED;
    infoMessage = { id: report.id, createdAt: report.createdAt };
    return { status, infoMessage };
};

const adminLoginService = async (requestBody) => {
    let status, infoMessage;
    const { email, password } = requestBody;

    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        logger.log(`Admin successfully logged in`, 1);
        status = StatusCodes.OK;
        infoMessage = {
            id: process.env.ADMIN_ID,
            token: process.env.ADMIN_TOKEN,
        };
        return { status, infoMessage };
    }
    throw new ForbidenError(`Forbidden access`);
};

const getAllReportsService = async () => {
    let status, infoMessage;
    logger.log(`Getting all reports...`, 1);
    const reports = await db.reports.findAll({ where: { solved: false } });

    if (!reports) {
        status = StatusCodes.OK;
        infoMessage = [];
        return { status, infoMessage };
    }

    status = StatusCodes.OK;
    infoMessage = reports;
    return { status, infoMessage };
};

module.exports = { reportService, adminLoginService, getAllReportsService };
