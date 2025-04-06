const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas para productos
router.get('/', productController.getProducts);
router.get('/promotions', productController.getPromotions);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
