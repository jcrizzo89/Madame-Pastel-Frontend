const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// Obtener todo el inventario
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('product');
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el inventario', error: error.message });
  }
};

// Obtener inventario por ID de producto
exports.getInventoryByProduct = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ product: req.params.productId }).populate('product');
    if (!inventory) {
      return res.status(404).json({ message: 'Inventario no encontrado para este producto' });
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el inventario', error: error.message });
  }
};

// Crear o actualizar inventario para un producto
exports.updateInventory = async (req, res) => {
  try {
    const { productId, initialStock, currentStock, reorderLevel, notes } = req.body;
    
    // Verificar que existe el producto
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Buscar si ya existe un registro de inventario para este producto
    let inventory = await Inventory.findOne({ product: productId });
    
    if (inventory) {
      // Actualizar inventario existente
      inventory.initialStock = initialStock || inventory.initialStock;
      inventory.currentStock = currentStock !== undefined ? currentStock : inventory.currentStock;
      inventory.reorderLevel = reorderLevel || inventory.reorderLevel;
      inventory.notes = notes || inventory.notes;
      inventory.lastRestocked = new Date();
      
      await inventory.save();
    } else {
      // Crear nuevo registro de inventario
      inventory = new Inventory({
        product: productId,
        initialStock,
        currentStock: currentStock || initialStock,
        reorderLevel,
        notes
      });
      
      await inventory.save();
    }
    
    // Actualizar el stock del producto
    product.stock = inventory.currentStock;
    await product.save();
    
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el inventario', error: error.message });
  }
};

// Registrar reabastecimiento de inventario
exports.restockInventory = async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Se requiere un producto válido y una cantidad positiva' });
    }
    
    // Buscar inventario del producto
    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventario no encontrado para este producto' });
    }
    
    // Actualizar inventario
    inventory.currentStock += quantity;
    inventory.lastRestocked = new Date();
    if (notes) inventory.notes = notes;
    await inventory.save();
    
    // Actualizar stock del producto
    const product = await Product.findById(productId);
    if (product) {
      product.stock = inventory.currentStock;
      await product.save();
    }
    
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error al reabastecer el inventario', error: error.message });
  }
};

// Obtener productos con bajo inventario
exports.getLowInventory = async (req, res) => {
  try {
    const lowInventory = await Inventory.find().populate('product');
    
    // Filtrar productos con stock por debajo del nivel de reorden
    const lowStockItems = lowInventory.filter(item => 
      item.currentStock <= item.reorderLevel
    );
    
    res.status(200).json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos con bajo inventario', error: error.message });
  }
};

// Obtener reporte de producción pendiente
exports.getPendingProduction = async (req, res) => {
  try {
    const inventory = await Inventory.find({ pendingProduction: { $gt: 0 } }).populate('product');
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la producción pendiente', error: error.message });
  }
};

// Sincronizar todos los productos con el inventario
exports.syncAllProductsWithInventory = async (req, res) => {
  try {
    // Obtener todos los productos
    const products = await Product.find();
    let syncResults = [];
    
    // Para cada producto, crear o actualizar su registro de inventario
    for (const product of products) {
      let inventory = await Inventory.findOne({ product: product._id });
      
      if (inventory) {
        // Si existe, actualizar el inventario con el stock del producto
        inventory.currentStock = product.stock;
        await inventory.save();
        syncResults.push({ 
          productId: product._id, 
          productName: product.name, 
          status: 'updated', 
          stock: product.stock 
        });
      } else {
        // Si no existe, crear un nuevo registro de inventario
        inventory = new Inventory({
          product: product._id,
          initialStock: product.stock,
          currentStock: product.stock,
          reorderLevel: 5,
          notes: `Inventario creado automáticamente durante la sincronización`
        });
        await inventory.save();
        syncResults.push({ 
          productId: product._id, 
          productName: product.name, 
          status: 'created', 
          stock: product.stock 
        });
      }
    }
    
    res.status(200).json({ 
      message: 'Sincronización completada correctamente', 
      totalSynchronized: syncResults.length,
      results: syncResults 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al sincronizar productos con inventario', error: error.message });
  }
};
