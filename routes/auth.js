// initialize
const express = require('express');
const router = express.Router();

// controller
const {
    login,
    register
} = require('../controllers/auth');

router.route('/register').post(register);
router.route('/login').get(login);

module.exports = router;