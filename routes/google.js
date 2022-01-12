// initialize
const express = require('express');
const router = express.Router();

// controller
const { login, loginPost, loginStatus, callback } = require('../controllers/google');

router.route('/login').get(login).post(loginPost);
router.route('/login-status').get(loginStatus);
router.route('/callback').post(callback);

module.exports = router;
