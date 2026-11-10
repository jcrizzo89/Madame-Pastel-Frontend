const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

// Rutas para productos
router.get('/', productController.getProducts);
router.get('/promotions', productController.getPromotions);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.post('/', protect, isAdmin, productController.createProduct);
router.put('/:id', protect, isAdmin, productController.updateProduct);
router.delete('/:id', protect, isAdmin, productController.deleteProduct);

module.exports = router;
