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
    cancelOfferService,
} = require('../services/offers');
const {
    createRequestService,
    editRequestService,
    getRequestByIdService,
    getRequestsByQueryService,
    requestOfferService,
    acceptOfferService,
    rejectOfferService,
    cancelRequestService,
} = require('../services/requests');
const { StatusCodes } = require('http-status-codes');

const createOffer = async (req, res, next) => {
    logger.log('Received createOffer request...', 1);
    try {
        const offer = await createOfferService(req.get('id'), req.body);
        res.status(StatusCodes.CREATED).json({
            id: offer.id,
            createdAt: offer.createdAt,
        });
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const createRequest = async (req, res, next) => {
    logger.log('Received createRequest request...', 1);
    try {
        const request = await createRequestService(req.get('id'), req.body);
        res.status(StatusCodes.CREATED).json({
            id: request.id,
            createdAt: request.createdAt,
        });
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const editOffer = async (req, res, next) => {
    logger.log('Received editOffer request, editing...', 1);
    try {
        await editOfferService(req.body, req.params.offerId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const editRequest = async (req, res, next) => {
    logger.log('Received editRequest request, editing...', 1);
    try {
        await editRequestService(req.body, req.params.requestId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getOfferById = async (req, res, next) => {
    logger.log(`Received getOfferById request`, 1);
    try {
        const offer = await getOfferByIdService(req.params.offerId);
        res.status(StatusCodes.OK).json(offer);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getRequestById = async (req, res, next) => {
    logger.log(`Received getRequestById request`, 1);
    try {
        const request = await getRequestByIdService(req.params.requestId);
        res.status(StatusCodes.OK).json(request);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getOffersByQuery = async (req, res, next) => {
    logger.log(`Received getOffersByQuery request`, 1);
    try {
        const userId = req.get('id');
        const offers = await getOffersByQueryService(req.query, userId);
        res.status(StatusCodes.OK).json(offers);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const getRequestsByQuery = async (req, res, next) => {
    logger.log(`Received getRequestsByQuery request`, 1);
    try {
        const userId = req.get('id');
        const requests = await getRequestsByQueryService(req.query, userId);
        res.status(StatusCodes.OK).json(requests);
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const requestOffer = async (req, res, next) => {
    logger.log('Received requestOffer request...', 1);
    try {
        await requestOfferService(req.params.requestId, req.params.offerId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const cancelRequest = async (req, res, next) => {
    logger.log('Received cancelRequest request...', 1);
    try {
        await cancelRequestService(req.params.requestId, req.params.offerId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const acceptRequest = async (req, res, next) => {
    logger.log('Received acceptRequest request...', 1);
    try {
        await acceptRequestService(req.params.offerId, req.params.requestId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const rejectRequest = async (req, res, next) => {
    logger.log('Received rejectRequest request...', 1);
    try {
        await rejectRequestService(req.params.offerId, req.params.requestId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const completeRequest = async (req, res, next) => {
    logger.log('Received completeRequest request...', 1);
    try {
        const { valoration } = req.body;
        await completeRequestService(
            req.params.requestId,
            req.params.offerId,
            valoration
        );
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const offerRequest = async (req, res, next) => {
    logger.log('Received offerRequest request...', 1);
    try {
        await offerRequestService(req.params.requestId, req.params.offerId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const cancelOffer = async (req, res, next) => {
    logger.log('Received cancelRequest request...', 1);
    try {
        await cancelOfferService(req.params.requestId, req.params.offerId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const acceptOffer = async (req, res, next) => {
    logger.log('Received acceptOffer request...', 1);
    try {
        await acceptOfferService(req.params.requestId, req.params.offerId);
        res.status(StatusCodes.OK).send();
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
};

const rejectOffer = async (req, res, next) => {
    logger.log('Received rejectOffer request...', 1);
    try {
        await rejectOfferService(req.params.requestId, req.params.offerId);
        res.status(StatusCodes.OK).send();
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
    cancelRequest,
    cancelOffer,
};
