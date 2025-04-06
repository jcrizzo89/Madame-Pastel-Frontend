const Category = require('../models/Category');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error del servidor al obtener categorías' });
  }
};

// @desc    Obtener una categoría por ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error al obtener la categoría:', error);
    res.status(500).json({ message: 'Error del servidor al obtener la categoría' });
  }
};

// @desc    Crear una nueva categoría
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, image } = req.body;

  try {
    // Verificar si la categoría ya existe
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Esta categoría ya existe' });
    }

    // Crear nueva categoría
    const category = new Category({
      name,
      description,
      image
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ message: 'Error del servidor al crear categoría' });
  }
};

// @desc    Actualizar una categoría
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { description, image } = req.body;

  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Actualizar campos
    category.description = description || category.description;
    category.image = image || category.image;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar categoría' });
  }
};

// @desc    Eliminar una categoría
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar si hay productos con esta categoría
    const productsWithCategory = await Product.countDocuments({ category: category.name });
    
    if (productsWithCategory > 0) {
      return res.status(400).json({ 
        message: `No se puede eliminar esta categoría porque tiene ${productsWithCategory} productos asociados` 
      });
    }

    await category.remove();
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar categoría' });
  }
};

// @desc    Obtener estadísticas de categorías
// @route   GET /api/categories/stats
// @access  Private/Admin
exports.getCategoryStats = async (req, res) => {
  try {
    // Obtener todas las categorías
    const categories = await Category.find({});
    
    // Preparar estadísticas de categorías
    const statsPromises = categories.map(async (category) => {
      // Contar productos por categoría
      const productCount = await Product.countDocuments({ category: category.name });
      
      // Calcular precio promedio de productos en la categoría
      const priceStats = await Product.aggregate([
        { $match: { category: category.name } },
        { $group: {
            _id: null,
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]);
      
      // Si no hay productos, establecer valores predeterminados
      const priceData = priceStats.length > 0 ? priceStats[0] : { avgPrice: 0, minPrice: 0, maxPrice: 0 };
      
      return {
        _id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        productCount,
        avgPrice: priceData.avgPrice,
        minPrice: priceData.minPrice,
        maxPrice: priceData.maxPrice
      };
    });
    
    const categoryStats = await Promise.all(statsPromises);
    
    res.json(categoryStats);
  } catch (error) {
    console.error('Error al obtener estadísticas de categorías:', error);
    res.status(500).json({ message: 'Error del servidor al obtener estadísticas' });
  }
};
