const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const {
    reportService,
    getAllReportsService,
    deactivatePostService,
    solveReportService,
    banUserService,
} = require('../services/admin');
const { BadRequestError } = require('../errors');

const report = async (req, res, next) => {
    logger.log('Received report request', 1);
    try {
        let type, itemId;
        if (req.params.postId) {
            type = 'post';
            itemId = req.params.postId;
        } else {
            type = 'user';
            itemId = req.params.userId;
        }
        const { message } = req.body;
        const { status, infoMessage } = await reportService(
            itemId,
            type,
            req.get('id'),
            message
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getAllReports = async (req, res, next) => {
    logger.log('Received getAllReports request', 1);
    try {
        const { status, infoMessage } = await getAllReportsService();
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const deactivatePost = async (req, res, next) => {
    logger.log('Received deactivatePost request', 1);
    try {
        const postId = req.params.offerId || req.params.requestId;
        console.log(postId);

        const { status, infoMessage } = await deactivatePostService(postId);
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const solveReport = async (req, res, next) => {
    logger.log('Received solveReport request', 1);
    try {
        const { status, infoMessage } = await solveReportService(
            req.params.reportId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const banUser = async (req, res, next) => {
    logger.log('Received banUser request', 1);
    try {
        const { status, infoMessage } = await banUserService(req.params.userId);
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

module.exports = {
    report,
    getAllReports,
    deactivatePost,
    solveReport,
    banUser,
};
