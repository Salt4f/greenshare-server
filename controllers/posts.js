const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');

const {
    createOfferService,
    createRequestService,
    editRequestService,
    editOfferService,
    getOfferByIdService,
    getRequestByIdService,
    getOffersByQueryService,
    getRequestsByQueryService,
    requestOfferService,
    acceptRequestService,
    rejectRequestService,
    offerRequestService,
    completeRequestService,
    acceptOfferService,
    rejectOfferService,
    completeOfferService,
} = require('../services/posts');

const createOffer = async (req, res) => {
    logger.log('Received createOffer request...', 1);

    try {
        const { status, infoMessage } = await createOfferService(req.body);
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const createRequest = async (req, res) => {
    logger.log('Received createRequest request...', 1);

    try {
        const { status, infoMessage } = await createRequestService(req.body);
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const editOffer = async (req, res) => {
    logger.log('Received editOffer request, editing...', 1);

    try {
        const { status, infoMessage } = await editOfferService(
            req.body,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const editRequest = async (req, res) => {
    logger.log('Received editRequest request, editing...', 1);

    try {
        const { status, infoMessage } = await editRequestService(
            req.body,
            req.params.requestId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const getOfferById = async (req, res) => {
    logger.log(`Received getOfferById request`, 1);

    try {
        const { status, infoMessage } = await getOfferByIdService(
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const getRequestById = async (req, res) => {
    logger.log(`Received getRequestById request`, 1);

    try {
        const { status, infoMessage } = await getRequestByIdService(
            req.params.requestId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const getOffersByQuery = async (req, res) => {
    logger.log(`Received getOffersByQuery request`, 1);
    try {
        const { status, infoMessage } = await getOffersByQueryService(
            req.query
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const getRequestsByQuery = async (req, res) => {
    logger.log(`Received getRequestsByQuery request`, 1);
    try {
        const { status, infoMessage } = await getRequestsByQueryService(
            req.query
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const requestOffer = async (req, res) => {
    logger.log('Received requestOffer request...', 1);
    try {
        const { status, infoMessage } = await requestOfferService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const acceptRequest = async (req, res) => {
    logger.log('Received acceptRequest request...', 1);
    try {
        const { status, infoMessage } = await acceptRequestService(
            req.params.offerId,
            req.params.requestId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const rejectRequest = async (req, res) => {
    logger.log('Received rejectRequest request...', 1);
    try {
        const { status, infoMessage } = await rejectRequestService(
            req.params.offerId,
            req.params.requestId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const completeRequest = async (req, res) => {
    logger.log('Received completeRequest request...', 1);
    try {
        const { status, infoMessage } = await completeRequestService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const offerRequest = async (req, res) => {
    logger.log('Received offerRequest request...', 1);
    try {
        const { status, infoMessage } = await offerRequestService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const acceptOffer = async (req, res) => {
    logger.log('Received acceptOffer request...', 1);
    try {
        const { status, infoMessage } = await acceptOfferService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const rejectOffer = async (req, res) => {
    logger.log('Received rejectOffer request...', 1);
    try {
        const { status, infoMessage } = await rejectOfferService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const completeOffer = async (req, res) => {
    logger.log('Received completeOffer request...', 1);
    try {
        const { status, infoMessage } = await completeOfferService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

module.exports = {
    createOffer,
    createRequest,
    editRequest,
    editOffer,
    getOfferById,
    getRequestById,
    getOffersByQuery,
    getRequestsByQuery,
    requestOffer,
    acceptRequest,
    rejectRequest,
    completeRequest,
    offerRequest,
    acceptOffer,
    rejectOffer,
    completeOffer,
};
