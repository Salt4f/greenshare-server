const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');

const {
    createOfferService,
    editOfferService,
    getOfferByIdService,
    getOffersByQueryService,
    offerRequestService,
    acceptRequestService,
    rejectRequestService,
    completeRequestService,
} = require('../services/offers');

const {
    createRequestService,
    editRequestService,
    getRequestByIdService,
    getRequestsByQueryService,
    requestOfferService,
    acceptOfferService,
    rejectOfferService,
    completeOfferService,
} = require('../services/requests');

const createOffer = async (req, res, next) => {
    logger.log('Received createOffer request...', 1);

    try {
        const { status, infoMessage } = await createOfferService(req.body);
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const createRequest = async (req, res, next) => {
    logger.log('Received createRequest request...', 1);

    try {
        const { status, infoMessage } = await createRequestService(
            req.get('id'),
            req.body
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const editOffer = async (req, res, next) => {
    logger.log('Received editOffer request, editing...', 1);

    try {
        const { status, infoMessage } = await editOfferService(
            req.body,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const editRequest = async (req, res, next) => {
    logger.log('Received editRequest request, editing...', 1);

    try {
        const { status, infoMessage } = await editRequestService(
            req.body,
            req.params.requestId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getOfferById = async (req, res, next) => {
    logger.log(`Received getOfferById request`, 1);

    try {
        const { status, infoMessage } = await getOfferByIdService(
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getRequestById = async (req, res, next) => {
    logger.log(`Received getRequestById request`, 1);

    try {
        const { status, infoMessage } = await getRequestByIdService(
            req.params.requestId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getOffersByQuery = async (req, res, next) => {
    logger.log(`Received getOffersByQuery request`, 1);
    try {
        const { status, infoMessage } = await getOffersByQueryService(
            req.query
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getRequestsByQuery = async (req, res, next) => {
    logger.log(`Received getRequestsByQuery request`, 1);
    try {
        const { status, infoMessage } = await getRequestsByQueryService(
            req.query
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const requestOffer = async (req, res, next) => {
    logger.log('Received requestOffer request...', 1);
    try {
        const { status, infoMessage } = await requestOfferService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const acceptRequest = async (req, res, next) => {
    logger.log('Received acceptRequest request...', 1);
    try {
        const { status, infoMessage } = await acceptRequestService(
            req.params.offerId,
            req.params.requestId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const rejectRequest = async (req, res, next) => {
    logger.log('Received rejectRequest request...', 1);
    try {
        const { status, infoMessage } = await rejectRequestService(
            req.params.offerId,
            req.params.requestId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const completeRequest = async (req, res, next) => {
    logger.log('Received completeRequest request...', 1);
    try {
        const { valoration } = req.body;
        const { status, infoMessage } = await completeRequestService(
            req.params.requestId,
            req.params.offerId,
            valoration
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const offerRequest = async (req, res, next) => {
    logger.log('Received offerRequest request...', 1);
    try {
        const { status, infoMessage } = await offerRequestService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const acceptOffer = async (req, res, next) => {
    logger.log('Received acceptOffer request...', 1);
    try {
        const { status, infoMessage } = await acceptOfferService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const rejectOffer = async (req, res, next) => {
    logger.log('Received rejectOffer request...', 1);
    try {
        const { status, infoMessage } = await rejectOfferService(
            req.params.requestId,
            req.params.offerId
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const completeOffer = async (req, res, next) => {
    logger.log('Received completeOffer request...', 1);
    try {
        const { valoration } = req.body;
        const { status, infoMessage } = await completeOfferService(
            req.params.requestId,
            req.params.offerId,
            valoration
        );
        res.status(status).json(infoMessage);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
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
