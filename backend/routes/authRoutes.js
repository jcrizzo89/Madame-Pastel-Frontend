const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, protect } = require('../controllers/authController');
const { protect: authenticate, isSuperAdmin } = require('../middleware/authMiddleware');

// El alta de administradores solo puede iniciarla un administrador existente.
router.post('/register', authenticate, isSuperAdmin, registerAdmin);
// Inicio de sesión público.
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
