const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, protect, isAdmin } = require('../controllers/authController');

// Rutas públicas
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Ruta protegida para verificar token
router.get('/verify', protect, (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;
