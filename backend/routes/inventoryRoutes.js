const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Rutas para inventario
router.get('/', inventoryController.getInventory);
router.get('/low', inventoryController.getLowInventory);
router.get('/pending-production', inventoryController.getPendingProduction);
router.get('/product/:productId', inventoryController.getInventoryByProduct);
router.post('/update', inventoryController.updateInventory);
router.post('/restock', inventoryController.restockInventory);
router.post('/sync-all', inventoryController.syncAllProductsWithInventory);

module.exports = router;
