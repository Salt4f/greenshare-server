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
    getOfferByQuery,
    getRequestByQuery,
} = require('../controllers/posts');

router.route('/offers').post(authMiddleware, createOffer).get(getOfferByQuery);
router
    .route('/offers/:offerId')
    .put(authMiddleware, editOffer)
    .get(getOfferById);

router
    .route('/requests')
    .post(authMiddleware, createRequest)
    .get(getRequestByQuery);
router
    .route('/requests/:requestId')
    .put(authMiddleware, editRequest)
    .get(getRequestById);

module.exports = router;
