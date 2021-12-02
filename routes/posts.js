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
    completePost,
    rejectRequest,
} = require('../controllers/posts');

router
    .route('/offers')
    .post(authenticateUser, createOffer)
    .get(getOffersByQuery);
router
    .route('/offers/:offerId')
    .put(authenticateUser, offerOwnerAuth, editOffer)
    .get(getOfferById);

router
    .route('/offers/:offerId/request/:requestId')
    .post(authenticateUser, requestOwnerAuth, requestOffer);

router
    .route('/offers/:offerId/request/:requestId/accept')
    .post(authenticateUser, offerOwnerAuth, acceptRequest);

router
    .route('/offers/:offerId/request/:requestId/reject')
    .post(authenticateUser, offerOwnerAuth, rejectRequest);

router
    .route('/offers/:offerId/request/:requestId/completed')
    .post(authenticateUser, requestOwnerAuth, completePost);

router
    .route('/requests')
    .post(authenticateUser, createRequest)
    .get(getRequestsByQuery);
router
    .route('/requests/:requestId')
    .put(authenticateUser, requestOwnerAuth, editRequest)
    .get(getRequestById);

module.exports = router;
