// initialize
const express = require('express');
const router = express.Router();

// middlewares
const { authenticateAdmin } = require('../middlewares/authentication');

// controller
const { getAllRewards, createReward } = require('../controllers/rewards');

router.route('/').get(getAllRewards).post(authenticateAdmin, createReward);

module.exports = router;
