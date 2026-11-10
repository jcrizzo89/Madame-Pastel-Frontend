const express = require('express');
const router = express.Router();
const { protect, isAdmin, isStaffOrAdmin } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

// Rutas públicas para pedidos
router.post('/', orderController.createOrder);

// Rutas protegidas (solo administradores)
router.get('/', protect, isStaffOrAdmin, orderController.getOrders);
router.get('/:id', protect, isStaffOrAdmin, orderController.getOrderById);
router.patch('/:id/status', protect, isStaffOrAdmin, orderController.updateOrderStatus);
router.patch('/:id/payment', protect, isAdmin, orderController.updatePaymentStatus);
router.patch('/:id/cancel', protect, isAdmin, orderController.cancelOrder);

// Rutas de reportes y estadísticas (solo administradores)
router.get('/reports/sales-stats', protect, isAdmin, cacheMiddleware(600), orderController.getSalesStats);
router.get('/reports/most-sold', protect, isAdmin, cacheMiddleware(600), orderController.getMostSoldProducts);
router.get('/reports/sales-by-category', protect, isAdmin, cacheMiddleware(600), orderController.getSalesByCategory);
router.get('/reports/dashboard-summary', protect, isAdmin, cacheMiddleware(300), orderController.getDashboardSummary);

module.exports = router;
