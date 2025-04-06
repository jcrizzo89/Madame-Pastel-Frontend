const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cacheMiddleware');

/**
 * @route   GET /api/reports/dashboard
 * @desc    Obtener resumen para el dashboard
 * @access  Private/Admin
 */
router.get('/dashboard-summary', protect, admin, cacheMiddleware(300), reportController.getDashboardSummary);

/**
 * @route   GET /api/reports/recent-activity
 * @desc    Obtener actividad reciente
 * @access  Private/Admin
 */
router.get('/recent-activity', protect, admin, cacheMiddleware(60), reportController.getRecentActivity);

/**
 * @route   GET /api/reports/sales-trends
 * @desc    Obtener tendencias de ventas de los últimos meses
 * @access  Private/Admin
 */
router.get('/sales-trends', protect, admin, cacheMiddleware(600), reportController.getSalesTrends);

/**
 * @route   GET /api/reports/category-sales
 * @desc    Obtener distribución de ventas por categoría para el mes actual
 * @access  Private/Admin
 */
router.get('/category-sales', protect, admin, cacheMiddleware(300), reportController.getCurrentCategorySales);

module.exports = router;
