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
    completeOffer,
} = require('../controllers/posts');

router
    .route('/offers')
    .post(authenticateUser, createOffer)
    .get(getOffersByQuery);
router
    .route('/offers/:offerId')
    .put(authenticateUser, offerOwnerAuth, editOffer)
    .get(getOfferById);

// REQUEST AN OFFER FROM A REQUEST
router
    .route('/offers/:offerId/request/:requestId')
    .post(authenticateUser, requestOwnerAuth, requestOffer);
// ACCEPT A REQUEST OF PENDINGREQUESTS FROM AN OFFER
router
    .route('/offers/:offerId/request/:requestId/accept')
    .post(authenticateUser, offerOwnerAuth, acceptRequest);
// REJECT A REQUEST FROM AN OFFER
router
    .route('/offers/:offerId/request/:requestId/reject')
    .post(authenticateUser, offerOwnerAuth, rejectRequest);
// CONFIRM END OF TRANSACTION FROM A REQUEST
router
    .route('/offers/:offerId/request/:requestId/completed')
    .post(authenticateUser, requestOwnerAuth, completeRequest);

router
    .route('/requests')
    .post(authenticateUser, createRequest)
    .get(getRequestsByQuery);
router
    .route('/requests/:requestId')
    .put(authenticateUser, requestOwnerAuth, editRequest)
    .get(getRequestById);
// OFFER TO A REQUEST FROM AN OFFER
router
    .route('/requests/:requestId/offer/:offerId')
    .post(authenticateUser, offerOwnerAuth, offerRequest);
router
    .route('/requests/:requestId/offer/:offerId/accept')
    .post(authenticateUser, requestOwnerAuth, acceptOffer);
router
    .route('/requests/:requestId/offer/:offerId/reject')
    .post(authenticateUser, requestOwnerAuth, rejectOffer);
router
    .route('/requests/:requestId/offer/:offerId/completed')
    .post(authenticateUser, offerOwnerAuth, completeOffer);

module.exports = router;
