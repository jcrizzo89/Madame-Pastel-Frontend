const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

// Cargar variables de entorno
dotenv.config();

// ID del producto a eliminar
const productId = '67f2b952f76a0d74618cda15';

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/madame-pastel')
  .then(async () => {
    console.log('MongoDB conectado. Eliminando producto...');
    
    try {
      // Eliminar el producto
      const deletedProduct = await Product.findByIdAndDelete(productId);
      
      if (!deletedProduct) {
        console.log('Producto no encontrado');
        process.exit(1);
      }
      
      console.log('Producto eliminado con éxito:', deletedProduct);
      
      // Verificar que se eliminó correctamente
      const productCount = await Product.countDocuments();
      console.log(`Total de productos en la base de datos: ${productCount}`);
      
      process.exit(0);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  });
