const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../controllers/authController');
const {
  getStatistics,
  recordPageVisit,
  recordProductView,
  recordPurchase,
  getMostViewedProducts,
  getMostSoldProducts,
  getStatisticsSummary,
  recordDeviceType
} = require('../controllers/statisticController');

// Rutas públicas (para registrar eventos)
router.post('/page-visit', recordPageVisit);
router.post('/product-view', recordProductView);
router.post('/device-type', recordDeviceType);

// Rutas protegidas (solo administradores)
router.get('/', protect, isAdmin, getStatistics);
router.get('/summary', protect, isAdmin, getStatisticsSummary);
router.get('/most-viewed', protect, isAdmin, getMostViewedProducts);
router.get('/most-sold', protect, isAdmin, getMostSoldProducts);

// Ruta para registrar compras (se puede llamar desde el controlador de pagos)
router.post('/purchase', protect, recordPurchase);

module.exports = router;
