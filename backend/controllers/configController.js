const Configuration = require('../models/Configuration');
const { validationResult } = require('express-validator');

// @desc    Obtener la configuración activa
// @route   GET /api/config
// @access  Public
exports.getActiveConfig = async (req, res) => {
  try {
    let config = await Configuration.findOne({ isDefault: true });
    
    // Si no hay configuración predeterminada, crear una
    if (!config) {
      config = new Configuration({ isDefault: true });
      await config.save();
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ message: 'Error del servidor al obtener configuración' });
  }
};

// @desc    Obtener todas las configuraciones
// @route   GET /api/config/all
// @access  Private/Admin
exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await Configuration.find({}).sort({ createdAt: -1 });
    res.json(configs);
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    res.status(500).json({ message: 'Error del servidor al obtener configuraciones' });
  }
};

// @desc    Crear nueva configuración
// @route   POST /api/config
// @access  Private/Admin
exports.createConfig = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const configData = {
      ...req.body,
      isDefault: req.body.isDefault || false
    };
    
    const newConfig = new Configuration(configData);
    const savedConfig = await newConfig.save();
    
    res.status(201).json(savedConfig);
  } catch (error) {
    console.error('Error al crear configuración:', error);
    res.status(500).json({ message: 'Error del servidor al crear configuración' });
  }
};

// @desc    Actualizar configuración
// @route   PUT /api/config/:id
// @access  Private/Admin
exports.updateConfig = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const config = await Configuration.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    
    // Actualizar cada campo que exista en el cuerpo de la solicitud
    Object.keys(req.body).forEach(key => {
      // Manejar campos anidados
      if (typeof req.body[key] === 'object' && req.body[key] !== null) {
        config[key] = { ...config[key], ...req.body[key] };
      } else {
        config[key] = req.body[key];
      }
    });
    
    const updatedConfig = await config.save();
    res.json(updatedConfig);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar configuración' });
  }
};

// @desc    Establecer configuración predeterminada
// @route   PUT /api/config/:id/set-default
// @access  Private/Admin
exports.setDefaultConfig = async (req, res) => {
  try {
    const config = await Configuration.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    
    // Primero eliminar la configuración predeterminada existente
    await Configuration.updateMany({}, { isDefault: false });
    
    // Establecer la nueva configuración predeterminada
    config.isDefault = true;
    const updatedConfig = await config.save();
    
    res.json(updatedConfig);
  } catch (error) {
    console.error('Error al establecer configuración predeterminada:', error);
    res.status(500).json({ message: 'Error del servidor al establecer configuración predeterminada' });
  }
};

// @desc    Eliminar configuración
// @route   DELETE /api/config/:id
// @access  Private/Admin
exports.deleteConfig = async (req, res) => {
  try {
    const config = await Configuration.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    
    // No permitir eliminar la configuración predeterminada
    if (config.isDefault) {
      return res.status(400).json({ message: 'No se puede eliminar la configuración predeterminada' });
    }
    
    await config.remove();
    res.json({ message: 'Configuración eliminada' });
  } catch (error) {
    console.error('Error al eliminar configuración:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar configuración' });
  }
};
