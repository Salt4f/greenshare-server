// initialize
const express = require('express');
const router = express.Router();

// controller
const {
    getAllReports,
    solveReport,
    terminateAtCheck,
} = require('../controllers/admin');

router.route('/reports').get(getAllReports);

router.route('/reports/:reportId').post(solveReport);

router.route('/check').put(terminateAtCheck);

module.exports = router;
