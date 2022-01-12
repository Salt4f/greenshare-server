// initialize
const express = require('express');
const router = express.Router();

// controller
const {
    getUser,
    editUserInfo,
    getUserPosts,
    getPendingPosts,
    getAcceptedPosts,
    getEcoScoreForm,
    updateEcoScore,
    redeem,
} = require('../controllers/user');
const { report, banUser } = require('../controllers/admin');

// middlewares
const {
    authenticateUser,
    authenticateAdmin,
} = require('../middlewares/authentication');

router.route('/:userId').get(getUser).put(authenticateUser, editUserInfo);

router.route('/:userId/report').post(authenticateUser, report);

router.route('/:userId/posts').get(authenticateUser, getUserPosts);

// 3rd PARTY SERVICE
router
    .route('/:userId/eco-score')
    .get(getEcoScoreForm)
    .post(authenticateUser, updateEcoScore);

// PENDING POSTS
router.route('/:userId/pending-posts').get(authenticateUser, getPendingPosts);

// ACCEPTEDPOSTS
router.route('/:userId/accepted-posts').get(authenticateUser, getAcceptedPosts);

// BAN USER
router.route('/:userId/ban').post(authenticateAdmin, banUser);

// REDEEM
router.route('/:userId/redeem').post(authenticateUser, redeem);

module.exports = router;
