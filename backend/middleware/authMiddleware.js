const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../config/authConfig');

// Middleware para verificar si el usuario está autenticado
const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.active) {
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
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

const superAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de superadmin' });
  }
  next();
};

const staffOrAdmin = (req, res, next) => {
  if (!['superadmin', 'admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
};

// Mantener compatibilidad con nombres alternativos
const authMiddleware = protect;
const adminMiddleware = admin;
const isAdmin = admin;
const isSuperAdmin = superAdmin;
const isStaffOrAdmin = staffOrAdmin;

module.exports = { protect, admin, superAdmin, staffOrAdmin, authMiddleware, adminMiddleware, isAdmin, isSuperAdmin, isStaffOrAdmin };
