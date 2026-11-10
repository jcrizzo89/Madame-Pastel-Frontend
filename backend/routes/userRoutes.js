const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, isSuperAdmin } = require('../middleware/authMiddleware');

// Rutas básicas de usuario
// Nota: La mayor parte de la funcionalidad de usuario ya está en authRoutes.js
// Este archivo existe para manejar operaciones específicas de usuario como obtener perfiles, etc.

router.get('/profile', authMiddleware, (req, res) => {
  const { _id, name, email, role } = req.user;
  return res.json({ _id, name, email, role });
});

router.get('/all', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().select('username email role active lastLogin createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.role === 'superadmin') return res.status(403).json({ message: 'La cuenta superadmin se administra fuera de esta pantalla' });
    const { username, email, role, active, password } = req.body;
    if (role !== undefined && !['admin', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'El rol debe ser admin o staff' });
    }
    if (password !== undefined && password.length < 12) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 12 caracteres' });
    }
    if (active !== undefined && typeof active !== 'boolean') {
      return res.status(400).json({ message: 'El estado activo debe ser verdadero o falso' });
    }
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (active !== undefined) user.active = Boolean(active);
    if (password) user.password = password;
    await user.save();
    res.json({ _id: user._id, username: user.username, email: user.email, role: user.role, active: user.active });
  } catch (error) {
    res.status(400).json({ message: 'No se pudo actualizar el usuario', error: error.message });
  }
});

router.delete('/:id', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.role === 'superadmin') return res.status(403).json({ message: 'La cuenta superadmin no se puede eliminar desde esta pantalla' });
    await user.deleteOne();
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'No se pudo eliminar el usuario', error: error.message });
  }
});

module.exports = router;
