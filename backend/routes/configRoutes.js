const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const { isAdmin, isSuperAdmin } = require('../middleware/authMiddleware');
const {
  getActiveConfig,
  getAllConfigs,
  createConfig,
  updateConfig,
  setDefaultConfig,
  deleteConfig
} = require('../controllers/configController');

// Rutas públicas
router.get('/', getActiveConfig);

// Rutas protegidas (solo administradores)
router.get('/all', protect, isAdmin, getAllConfigs);
router.post('/', protect, isSuperAdmin, createConfig);
router.put('/:id', protect, isSuperAdmin, updateConfig);
router.put('/:id/set-default', protect, isSuperAdmin, setDefaultConfig);
router.delete('/:id', protect, isSuperAdmin, deleteConfig);

module.exports = router;
