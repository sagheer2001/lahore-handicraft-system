const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');


router.get('/', ctrl.listOrders);
router.get('/:id', ctrl.getOrder);
router.post('/', ctrl.createOrder);
router.post('/:id/cancel', ctrl.cancelOrder);

module.exports = router;
