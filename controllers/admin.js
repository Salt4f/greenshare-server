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
        const reportInfo = await reportService(
            itemId,
            type,
            req.get('id'),
            message
        );
        const response = { id: reportInfo.id, createdAt: reportInfo.createdAt };
        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getAllReports = async (req, res, next) => {
    logger.log('Received getAllReports request', 1);
    try {
        const allReports = await getAllReportsService();
        res.status(StatusCodes.OK).json(allReports);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const deactivatePost = async (req, res, next) => {
    logger.log('Received deactivatePost request', 1);
    try {
        const postId = req.params.offerId || req.params.requestId;
        await deactivatePostService(postId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const solveReport = async (req, res, next) => {
    logger.log('Received solveReport request', 1);
    try {
        await solveReportService(req.params.reportId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const banUser = async (req, res, next) => {
    logger.log('Received banUser request', 1);
    try {
        await banUserService(req.params.userId);
        res.status(StatusCodes.OK).send();
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
