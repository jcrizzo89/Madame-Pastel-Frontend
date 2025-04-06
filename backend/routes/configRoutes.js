const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../controllers/authController');
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
router.post('/', protect, isAdmin, createConfig);
router.put('/:id', protect, isAdmin, updateConfig);
router.put('/:id/set-default', protect, isAdmin, setDefaultConfig);
router.delete('/:id', protect, isAdmin, deleteConfig);

module.exports = router;
