// initialize
const express = require('express');
const router = express.Router();

// controller
const { login, register, tokenValidation } = require('../controllers/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/validate').post(tokenValidation);

module.exports = router;
