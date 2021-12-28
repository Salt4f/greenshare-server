// initialize
const express = require('express');
const router = express.Router();

// controller
const {
    getUser,
    getUserPosts,
    getUserValorations,
} = require('../controllers/user');
const { authenticateUser } = require('../middlewares/authentication');

router.route('/:userId').get(getUser);

router.route('/:userId/posts').get(authenticateUser, getUserPosts);

router.route('/:userId/valorations').get(getUserValorations);

module.exports = router;
