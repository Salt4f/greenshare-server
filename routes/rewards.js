// initialize
const express = require('express');
const router = express.Router();

// middlewares
const {
    authenticateAdmin,
    authenticateUser,
} = require('../middlewares/authentication');

// controller
const {
    getAllRewards,
    createReward,
    editReward,
    deactivateReward,
} = require('../controllers/rewards');

router
    .route('/')
    .get(authenticateUser, getAllRewards)
    .post(authenticateAdmin, createReward);

router
    .route('/:rewardId')
    .put(authenticateAdmin, editReward)
    .post(authenticateAdmin, deactivateReward);

module.exports = router;
