// initialize
const express = require('express');
const router = express.Router();

// controller
const {
    getAllReports,
    solveReport,
    terminateAtCheck,
    exchangeEcoPoints,
} = require('../controllers/admin');

router.route('/reports').get(getAllReports);

router.route('/reports/:reportId').post(solveReport);

router.route('/check').put(terminateAtCheck);

router.route('/exchange').post(exchangeEcoPoints);

module.exports = router;
