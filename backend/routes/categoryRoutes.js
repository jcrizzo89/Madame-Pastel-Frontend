const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../controllers/authController');
const { isAdmin } = require('../middleware/authMiddleware');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoryController');

// Rutas públicas
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Rutas protegidas (solo administradores)
router.post(
  '/', 
  [
    protect, 
    isAdmin,
    [
      check('name', 'El nombre de la categoría es requerido').not().isEmpty(),
    ]
  ], 
  createCategory
);

router.put(
  '/:id', 
  [
    protect, 
    isAdmin
  ], 
  updateCategory
);

router.delete('/:id', protect, isAdmin, deleteCategory);

// Estadísticas de categorías
router.get('/stats/summary', protect, isAdmin, getCategoryStats);

module.exports = router;
