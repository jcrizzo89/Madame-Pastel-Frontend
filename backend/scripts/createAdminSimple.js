const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Cargar variables de entorno
dotenv.config();

// Definir el esquema de usuario directamente aquí para evitar dependencias
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'admin'
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB conectado. Creando usuario administrador...');
    
    // Crear modelo de usuario
    const User = mongoose.model('User', UserSchema);
    
    try {
      // Comprobar si ya existe un usuario admin
      const adminExists = await User.findOne({ role: 'admin' });
      
      if (adminExists) {
        console.log('Ya existe un usuario administrador.');
        console.log(`Nombre de usuario: ${adminExists.username}`);
        console.log(`Email: ${adminExists.email}`);
        mongoose.connection.close();
        process.exit(0);
      }
      
      // Hashear la contraseña manualmente
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Crear nuevo usuario admin
      const newAdmin = new User({
        username: 'admin',
        email: 'admin@madamepastel.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdmin.save();
      
      console.log('Usuario administrador creado con éxito:');
      console.log('Nombre de usuario: admin');
      console.log('Email: admin@madamepastel.com');
      console.log('Contraseña: admin123');
      console.log('\nIMPORTANTE: Por seguridad, cambia esta contraseña después del primer inicio de sesión.');
      
      mongoose.connection.close();
      process.exit(0);
    } catch (error) {
      console.error('Error al crear el usuario administrador:', error);
      mongoose.connection.close();
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });
