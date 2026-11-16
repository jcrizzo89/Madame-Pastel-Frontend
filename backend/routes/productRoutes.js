const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cacheMiddleware');
const productController = require('../controllers/productController');

// Rutas para productos
router.get('/', cacheMiddleware(300), productController.getProducts);
router.get('/promotions', cacheMiddleware(300), productController.getPromotions);
router.get('/featured', cacheMiddleware(300), productController.getFeaturedProducts);
router.get('/category/:category', cacheMiddleware(300), productController.getProductsByCategory);
router.get('/:id', cacheMiddleware(300), productController.getProductById);
router.post('/', protect, isAdmin, productController.createProduct);
router.put('/:id', protect, isAdmin, productController.updateProduct);
router.delete('/:id', protect, isAdmin, productController.deleteProduct);

module.exports = router;
