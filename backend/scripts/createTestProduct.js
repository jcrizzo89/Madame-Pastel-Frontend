const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/madame-pastel')
  .then(async () => {
    console.log('MongoDB conectado. Creando producto de prueba...');
    
    try {
      // Crear producto de prueba
      const testProduct = new Product({
        name: 'Torta de Chocolate',
        description: 'Deliciosa torta de chocolate con ganache',
        price: 3500,
        image: 'chocolate-cake.jpg',
        category: 'Tortas',
        stock: 10,
        isPromotion: false,
        featured: true,
        ingredients: ['chocolate', 'harina', 'azúcar', 'huevos'],
        allergens: ['gluten', 'huevos', 'lácteos']
      });
      
      await testProduct.save();
      console.log('Producto de prueba creado con éxito:', testProduct);
      process.exit(0);
    } catch (error) {
      console.error('Error al crear producto de prueba:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  });
