const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getOrders);
router.get('/my-published', authMiddleware, orderController.getMyPublishedOrders);
router.get('/my-accepted', authMiddleware, orderController.getMyAcceptedOrders);
router.post('/:id/accept', authMiddleware, orderController.acceptOrder);
router.post('/:id/complete', authMiddleware, orderController.completeOrder);

module.exports = router;
