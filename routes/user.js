// initialize
const express = require('express');
const router = express.Router();

// controller
const {
    getUser,
    getUserPosts,
    getPendingPosts,
    getAcceptedPosts,
} = require('../controllers/user');
const { report, banUser } = require('../controllers/admin');

// middlewares
const {
    authenticateUser,
    authenticateAdmin,
} = require('../middlewares/authentication');

router.route('/:userId').get(getUser);

router.route('/:userId/report').post(authenticateUser, report);

router.route('/:userId/posts').get(authenticateUser, getUserPosts);

// PENDING POSTS
router.route('/:userId/pending-posts').get(authenticateUser, getPendingPosts);

router.route('/:userId/accepted-posts').get(authenticateUser, getAcceptedPosts);

// ACCEPTEDPOSTS

router.route('/:userId/ban').post(authenticateAdmin, banUser);

module.exports = router;
