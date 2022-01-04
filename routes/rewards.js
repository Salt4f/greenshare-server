// initialize
const express = require('express');
const router = express.Router();

// middlewares
const {
    authenticateAdmin,
    authenticateUser,
} = require('../middlewares/authentication');

// controller
const { getAllRewards, createReward } = require('../controllers/rewards');

router
    .route('/')
    .get(authenticateUser, getAllRewards)
    .post(authenticateAdmin, createReward);

module.exports = router;
