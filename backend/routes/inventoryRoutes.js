const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const inventoryController = require('../controllers/inventoryController');

// Rutas para inventario
router.get('/', inventoryController.getInventory);
router.get('/low', inventoryController.getLowInventory);
router.get('/pending-production', inventoryController.getPendingProduction);
router.get('/product/:productId', inventoryController.getInventoryByProduct);
router.post('/update', protect, isAdmin, inventoryController.updateInventory);
router.post('/restock', protect, isAdmin, inventoryController.restockInventory);
router.post('/sync-all', protect, isAdmin, inventoryController.syncAllProductsWithInventory);

module.exports = router;
