const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // Usamos puerto 5001 para evitar conflictos

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Rutas esenciales para el panel de administrador
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Madame Pastel Admin API is running...');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Admin Server running on port ${PORT}`);
  console.log(`Panel de administrador: http://localhost:3000/admin/login`);
});
