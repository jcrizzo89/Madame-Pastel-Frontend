const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/madame-pastel')
  .then(async () => {
    console.log('MongoDB conectado. Creando usuario administrador...');
    
    try {
      // Comprobar si ya existe un usuario admin
      const adminExists = await User.findOne({ role: 'admin' });
      
      if (adminExists) {
        console.log('Ya existe un usuario administrador.');
        console.log(`Nombre de usuario: ${adminExists.username}`);
        console.log(`Email: ${adminExists.email}`);
        process.exit(0);
      }
      
      // Crear nuevo usuario admin
      const newAdmin = new User({
        username: 'admin',
        email: 'admin@madamepastel.com',
        password: 'admin123',  // Esta contraseña se hasheará automáticamente (ver modelo User.js)
        role: 'admin'
      });
      
      await newAdmin.save();
      
      console.log('Usuario administrador creado con éxito:');
      console.log('Nombre de usuario: admin');
      console.log('Email: admin@madamepastel.com');
      console.log('Contraseña: admin123');
      console.log('\nIMPORTANTE: Por seguridad, cambia esta contraseña después del primer inicio de sesión.');
      
      process.exit(0);
    } catch (error) {
      console.error('Error al crear el usuario administrador:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });
