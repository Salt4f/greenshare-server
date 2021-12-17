// initialize
const express = require('express');
const router = express.Router();

// controller
const { getUser, getUserPosts } = require('../controllers/user');

router.route('/:userId').get(getUser);

router.route('/:userId/posts').get(getUserPosts);

module.exports = router;
