// initialize
const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    offerOwnerAuth,
    requestOwnerAuth,
    headersCheck,
} = require('../middlewares/authentication');

// controller
const {
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
    completeRequest,
    rejectRequest,
    offerRequest,
    acceptOffer,
    rejectOffer,
} = require('../controllers/posts');

const { report } = require('../controllers/admin');
// OFFERS
router
    .route('/offers')
    .post(authenticateUser, createOffer)
    .get(headersCheck, getOffersByQuery);
router
    .route('/offers/:offerId')
    .put(authenticateUser, offerOwnerAuth, editOffer)
    .get(getOfferById);

// A Request is requesting to an Offer
router
    .route('/offers/:offerId/request/:requestId')
    .post(authenticateUser, requestOwnerAuth, requestOffer);

// An Offer accepts a Request from its pendingRequests
router
    .route('/offers/:offerId/request/:requestId/accept')
    .post(authenticateUser, offerOwnerAuth, acceptRequest);

// An Offer rejects a Request from its pendingRequests
router
    .route('/offers/:offerId/request/:requestId/reject')
    .post(authenticateUser, offerOwnerAuth, rejectRequest);

// A Request confirms end of transaction (completed)
router
    .route('/offers/:offerId/request/:requestId/completed')
    .post(authenticateUser, requestOwnerAuth, completeRequest);

// REQUESTS
router
    .route('/requests')
    .post(authenticateUser, createRequest)
    .get(headersCheck, getRequestsByQuery);

router
    .route('/requests/:requestId')
    .put(authenticateUser, requestOwnerAuth, editRequest)
    .get(getRequestById);

// An Offer is offering to a Request
router
    .route('/requests/:requestId/offer/:offerId')
    .post(authenticateUser, offerOwnerAuth, offerRequest);

// Accept an Offer of pendingOffers from a Request
router
    .route('/requests/:requestId/offer/:offerId/accept')
    .post(authenticateUser, requestOwnerAuth, acceptOffer);

// A Request rejects an Offer from its pendingOffers
router
    .route('/requests/:requestId/offer/:offerId/reject')
    .post(authenticateUser, requestOwnerAuth, rejectOffer);

// REPORT
router.route('/:postId/report').post(authenticateUser, report);

module.exports = router;
