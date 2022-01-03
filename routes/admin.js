// initialize
const express = require('express');
const router = express.Router();

// controller
const { getAllReports, solveReport } = require('../controllers/admin');

router.route('/reports').get(getAllReports);

router.route('/reports/:reportId').post(solveReport);

module.exports = router;
