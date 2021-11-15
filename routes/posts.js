// initialize
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authentication');

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
} = require('../controllers/posts');

// need to add auth middleware to createOffer
router.route('/offers').post(createOffer).get(getOffersByQuery);
router
    .route('/offers/:offerId')
    .put(authMiddleware, editOffer)
    .get(getOfferById);

router
    .route('/requests')
    .post(authMiddleware, createRequest)
    .get(getRequestsByQuery);
router
    .route('/requests/:requestId')
    .put(authMiddleware, editRequest)
    .get(getRequestById);

module.exports = router;
