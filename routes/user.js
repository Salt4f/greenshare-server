// initialize
const express = require('express');
const router = express.Router();

// controller
const { getUser, getUserPosts } = require('../controllers/user');
const { authenticateUser } = require('../middlewares/authentication');

router.route('/:userId').get(getUser);

router.route('/:userId/posts').get(authenticateUser, getUserPosts);

module.exports = router;
