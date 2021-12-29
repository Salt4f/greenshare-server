// initialize
const express = require('express');
const router = express.Router();

// controller
const { login } = require('../controllers/admin');
const { authenticateAdmin } = require('../middlewares/authentication');

router.route('/login').post(login);

module.exports = router;
