const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    
    // Crear automáticamente un registro de inventario para el nuevo producto
    if (savedProduct) {
      const initialStock = savedProduct.stock || 0;
      const inventoryData = {
        product: savedProduct._id,
        initialStock: initialStock,
        currentStock: initialStock,
        reorderLevel: 5, // Valor predeterminado
        notes: `Inventario inicial creado automáticamente para el producto ${savedProduct.name}`
      };
      
      // Crear o actualizar el registro de inventario
      const existingInventory = await Inventory.findOne({ product: savedProduct._id });
      
      if (existingInventory) {
        // Si ya existe un registro de inventario, actualizarlo
        existingInventory.initialStock = initialStock;
        existingInventory.currentStock = initialStock;
        await existingInventory.save();
      } else {
        // Si no existe, crear uno nuevo
        await new Inventory(inventoryData).save();
      }
    }
    
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

// Actualizar un producto existente
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Si el stock ha sido actualizado, sincronizar con el inventario
    if (req.body.stock !== undefined) {
      // Buscar el registro de inventario
      let inventory = await Inventory.findOne({ product: updatedProduct._id });
      
      if (inventory) {
        // Actualizar inventario existente
        inventory.currentStock = req.body.stock;
        await inventory.save();
      } else {
        // Crear nuevo registro de inventario si no existe
        inventory = new Inventory({
          product: updatedProduct._id,
          initialStock: req.body.stock,
          currentStock: req.body.stock,
          reorderLevel: 5,
          notes: `Inventario creado automáticamente al actualizar el producto ${updatedProduct.name}`
        });
        await inventory.save();
      }
    }
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Eliminar también el registro de inventario asociado
    await Inventory.findOneAndDelete({ product: req.params.id });
    
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

// Obtener productos por categoría
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos por categoría', error: error.message });
  }
};

// Obtener productos en promoción
exports.getPromotions = async (req, res) => {
  try {
    // Obtener productos que son promociones regulares O promociones estacionales
    const promotions = await Product.find({
      $or: [
        { isPromotion: true },
        { seasonalPromotion: true }
      ]
    });
    
    // Verificar que haya promociones
    if (!promotions || promotions.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las promociones', error: error.message });
  }
};

// Obtener productos destacados
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true });
    res.status(200).json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos destacados', error: error.message });
  }
};
