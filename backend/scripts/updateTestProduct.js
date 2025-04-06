const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

// Cargar variables de entorno
dotenv.config();

// ID del producto a actualizar
const productId = '67f2b952f76a0d74618cda15';

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/madame-pastel')
  .then(async () => {
    console.log('MongoDB conectado. Actualizando producto...');
    
    try {
      // Actualizar el producto
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          price: 4200,
          stock: 15,
          isPromotion: true,
          discountPercentage: 10
        },
        { new: true }
      );
      
      if (!updatedProduct) {
        console.log('Producto no encontrado');
        process.exit(1);
      }
      
      console.log('Producto actualizado con éxito:', updatedProduct);
      process.exit(0);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  });
