// initialize
const express = require('express');
const router = express.Router();

const {
    authenticateUser,
    offerOwnerAuth,
    requestOwnerAuth,
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
    cancelRequest,
    cancelOffer,
} = require('../controllers/posts');

const { deactivatePost } = require('../controllers/admin');

const { report } = require('../controllers/admin');
// OFFERS
router.route('/offers').post(createOffer).get(getOffersByQuery);

router
    .route('/offers/:offerId')
    .put(offerOwnerAuth, editOffer)
    .get(getOfferById);

router
    .route('/offers/:offerId/deactivate')
    .post(offerOwnerAuth, deactivatePost);

// A Request is requesting to an Offer
router
    .route('/offers/:offerId/request/:requestId')
    .post(requestOwnerAuth, requestOffer)
    .put(requestOwnerAuth, cancelRequest);

// An Offer accepts a Request from its pendingRequests
router
    .route('/offers/:offerId/request/:requestId/accept')
    .post(offerOwnerAuth, acceptRequest);

// An Offer rejects a Request from its pendingRequests
router.route('/offers/:offerId/request/:requestId/reject').post(rejectRequest);

// A Request confirms end of transaction (completed)
router
    .route('/offers/:offerId/request/:requestId/completed')
    .post(requestOwnerAuth, completeRequest);

// REQUESTS
router.route('/requests').post(createRequest).get(getRequestsByQuery);

router
    .route('/requests/:requestId')
    .put(requestOwnerAuth, editRequest)
    .get(getRequestById);

router
    .route('/requests/:requestId/deactivate')
    .post(requestOwnerAuth, deactivatePost);

// An Offer is offering to a Request
router
    .route('/requests/:requestId/offer/:offerId')
    .post(offerOwnerAuth, offerRequest)
    .put(offerOwnerAuth, cancelOffer);

// Accept an Offer of pendingOffers from a Request
router
    .route('/requests/:requestId/offer/:offerId/accept')
    .post(requestOwnerAuth, acceptOffer);

// A Request rejects an Offer from its pendingOffers
router
    .route('/requests/:requestId/offer/:offerId/reject')
    .post(requestOwnerAuth, rejectOffer);

// REPORT
router.route('/:postId/report').post(report);

module.exports = router;
