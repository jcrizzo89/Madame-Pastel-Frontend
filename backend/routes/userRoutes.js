const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Rutas básicas de usuario
// Nota: La mayor parte de la funcionalidad de usuario ya está en authRoutes.js
// Este archivo existe para manejar operaciones específicas de usuario como obtener perfiles, etc.

router.get('/profile', authMiddleware, (req, res) => {
  const { _id, name, email, role } = req.user;
  return res.json({ _id, name, email, role });
});

router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Esta ruta normalmente obtendría todos los usuarios de la base de datos
    // Aquí devolvemos un mensaje indicando que la funcionalidad debe implementarse
    res.json({ message: 'Funcionalidad para obtener todos los usuarios pendiente de implementar' });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
