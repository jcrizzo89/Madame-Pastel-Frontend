const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar si el usuario está autenticado
const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'madamepastelsecret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ message: 'Por favor autentíquese correctamente' });
  }
};

// Middleware para verificar si el usuario es administrador
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

// Mantener compatibilidad con nombres alternativos
const authMiddleware = protect;
const adminMiddleware = admin;
const isAdmin = admin;

module.exports = { protect, admin, authMiddleware, adminMiddleware, isAdmin };
