const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Configuración del JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'madamepastelsecret',
    { expiresIn: '1d' }
  );
};

// Registrar un nuevo administrador
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password,
      role: role || 'admin'
    });

    const savedUser = await user.save();
    
    // Generar token
    const token = generateToken(savedUser);
    
    res.status(201).json({
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      token
    });
  } catch (error) {
    console.error('Error al registrar administrador:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Iniciar sesión de administrador
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Actualizar último login
    user.lastLogin = Date.now();
    await user.save();
    
    // Generar token
    const token = generateToken(user);
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Verificar token (middleware para rutas protegidas)
exports.protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'madamepastelsecret');
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ message: 'Acceso no autorizado' });
  }
};

// Verificar rol de administrador
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado, se requiere rol de administrador' });
  }
};
