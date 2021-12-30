// initialize
const express = require('express');
const router = express.Router();

// controller
const { getAllReports, solveReport } = require('../controllers/admin');
const {
    authenticateUser,
    authenticateAdmin,
} = require('../middlewares/authentication');

router.route('/reports').get(authenticateAdmin, getAllReports);

router.route('/reports/:reportId').post(authenticateAdmin, solveReport);

module.exports = router;
