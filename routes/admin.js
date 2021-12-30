// initialize
const express = require('express');
const router = express.Router();

// controller
const { login, getAllReports } = require('../controllers/admin');
const { authenticateAdmin } = require('../middlewares/authentication');

router.route('/login').post(login);

router.route('/reports').get(authenticateAdmin, getAllReports);

module.exports = router;
