const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');

router.get('/low-stock', ctrl.lowStock);
router.get('/sales-summary', ctrl.salesSummary);

module.exports = router;
