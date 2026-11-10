import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import '../../styles/admin/ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' o 'edit'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: '',
    madeToOrder: false,
    isPromotion: false,
    discountPercentage: '0',
    featured: false,
    ingredients: '',
    allergens: '',
    preparationTime: '24'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Token de autenticación
  const token = localStorage.getItem('adminToken');

  // Obtener lista de productos y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener productos
        const productsResponse = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Extraer categorías únicas de los productos
        const uniqueCategories = [...new Set(productsResponse.data.map(product => product.category))];
        
        setProducts(productsResponse.data);
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Error al cargar los productos');
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Abrir modal para añadir producto
  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: categories.length > 0 ? categories[0] : '',
      stock: '',
      madeToOrder: false,
      isPromotion: false,
      discountPercentage: '0',
      featured: false,
      ingredients: '',
      allergens: '',
      preparationTime: '24'
    });
    setFormMode('add');
    setShowModal(true);
  };

  // Abrir modal para editar producto
  const openEditModal = (product) => {
    console.log('Abriendo modal para editar producto:', product);
    try {
      setCurrentProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        image: product.image || '',
        category: product.category || '',
        stock: product.stock ? product.stock.toString() : '0',
        madeToOrder: Boolean(product.madeToOrder),
        isPromotion: Boolean(product.isPromotion),
        discountPercentage: product.discountPercentage ? product.discountPercentage.toString() : '0',
        featured: Boolean(product.featured),
        ingredients: product.ingredients ? product.ingredients.join(', ') : '',
        allergens: product.allergens ? product.allergens.join(', ') : '',
        preparationTime: product.preparationTime != null ? product.preparationTime.toString() : '24'
      });
      setFormMode('edit');
      setShowModal(true);
      console.log('Modal abierto correctamente, estado showModal:', true);
    } catch (error) {
      console.error('Error al abrir el modal de edición:', error);
      alert('Error al abrir el editor de producto. Por favor, intenta de nuevo.');
    }
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Guardar producto (añadir o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convertir ingredientes y alérgenos de string a array
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        discountPercentage: parseInt(formData.discountPercentage),
        preparationTime: parseInt(formData.preparationTime),
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(item => item.trim()) : [],
        allergens: formData.allergens ? formData.allergens.split(',').map(item => item.trim()) : []
      };
      
      let response;
      
      if (formMode === 'add') {
        // Añadir nuevo producto
        response = await axios.post(`${API_URL}/products`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProducts([...products, response.data]);
      } else {
        // Actualizar producto existente
        response = await axios.put(`${API_URL}/products/${currentProduct._id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Actualizar la lista de productos
        setProducts(
          products.map(p => (p._id === currentProduct._id ? response.data : p))
        );
      }
      
      // Actualizar categorías si es nueva
      if (!categories.includes(productData.category)) {
        setCategories([...categories, productData.category]);
      }
      
      // Cerrar modal
      setShowModal(false);
      
      // Mostrar mensaje de éxito (podría implementarse con un sistema de notificaciones)
      alert(formMode === 'add' ? 'Producto añadido con éxito' : 'Producto actualizado con éxito');
    } catch (err) {
      console.error("Error saving product:", err);
      alert(`Error: ${err.response?.data?.message || 'No se pudo guardar el producto'}`);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await axios.delete(`${API_URL}/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Actualizar la lista de productos
        setProducts(products.filter(p => p._id !== productId));
        
        // Mostrar mensaje de éxito
        alert('Producto eliminado con éxito');
      } catch (err) {
        console.error("Error deleting product:", err);
        alert(`Error: ${err.response?.data?.message || 'No se pudo eliminar el producto'}`);
      }
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    // Filtro por búsqueda (nombre o descripción)
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por categoría
    const matchesCategory = 
      filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Formatear precio a moneda local
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="admin-products-page">
      <div className="admin-page-header">
        <h1>Gestión de Productos</h1>
        <button className="admin-add-button" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Añadir Producto
        </button>
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="admin-category-filter">
          <label htmlFor="categoryFilter">Categoría:</label>
          <select 
            id="categoryFilter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="admin-no-results">
          <i className="fas fa-search"></i>
          <p>No se encontraron productos</p>
          {searchTerm || filterCategory !== 'all' ? (
            <button onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}>
              Limpiar filtros
            </button>
          ) : null}
        </div>
      ) : (
        <div className="admin-products-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="admin-product-card">
              <div className="admin-product-image">
                <img src={product.image} alt={product.name} />
                {product.isPromotion && (
                  <span className="admin-product-badge admin-promotion-badge">
                    -{product.discountPercentage}%
                  </span>
                )}
                {product.featured && (
                  <span className="admin-product-badge admin-featured-badge">
                    Destacado
                  </span>
                )}
              </div>
              
              <div className="admin-product-info">
                <h3 title={product.name}>{product.name}</h3>
                <span className="admin-product-category">{product.category}</span>
                <p className="admin-product-price">
                  {formatCurrency(product.price)}
                </p>
                <p className="admin-product-stock">
                  Stock: <span className={product.stock > 0 || product.madeToOrder ? 'in-stock' : 'out-of-stock'}>
                    {product.madeToOrder ? 'A pedido' : product.stock > 0 ? product.stock : 'Agotado'}
                  </span>
                </p>
              </div>
              
              <div className="admin-product-actions">
                <button 
                  className="admin-product-edit"
                  onClick={() => openEditModal(product)}
                  title="Editar producto"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="admin-product-delete"
                  onClick={() => handleDeleteProduct(product._id)}
                  title="Eliminar producto"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario para añadir/editar producto */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{formMode === 'add' ? 'Añadir Producto' : 'Editar Producto'}</h2>
              <button className="admin-modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-product-form">
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="name">Nombre *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label htmlFor="price">Precio *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label htmlFor="category">Categoría *</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    list="categoriesList"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                  <datalist id="categoriesList">
                    {categories.map((category, index) => (
                      <option key={index} value={category} />
                    ))}
                  </datalist>
                </div>
                
                <div className="admin-form-group">
                  <label htmlFor="stock">Stock *</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="admin-form-group admin-form-span-2">
                  <label htmlFor="image">URL de la imagen *</label>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                  />
                  {formData.image && (
                    <div className="admin-image-preview">
                      <img src={formData.image} alt="Vista previa" />
                    </div>
                  )}
                </div>
                
                <div className="admin-form-group admin-form-span-2">
                  <label htmlFor="description">Descripción *</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                
                <div className="admin-form-group">
                  <label>Promociones</label>
                  <div className="admin-form-checkbox">
                    <input
                      type="checkbox"
                      id="isPromotion"
                      name="isPromotion"
                      checked={formData.isPromotion}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="isPromotion">Es promoción</label>
                  </div>
                </div>
                
                <div className="admin-form-group">
                  <label htmlFor="discountPercentage">Descuento (%)</label>
                  <input
                    type="number"
                    id="discountPercentage"
                    name="discountPercentage"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    disabled={!formData.isPromotion}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Destacado</label>
                  <div className="admin-form-checkbox">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="featured">Producto destacado</label>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Disponibilidad</label>
                  <div className="admin-form-checkbox">
                    <input type="checkbox" id="madeToOrder" name="madeToOrder" checked={formData.madeToOrder} onChange={handleInputChange} />
                    <label htmlFor="madeToOrder">Se prepara a pedido</label>
                  </div>
                </div>
                
                <div className="admin-form-group">
                  <label htmlFor="preparationTime">Tiempo preparación (horas)</label>
                  <input
                    type="number"
                    id="preparationTime"
                    name="preparationTime"
                    min="0"
                    value={formData.preparationTime}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="admin-form-group admin-form-span-2">
                  <label htmlFor="ingredients">Ingredientes (separados por comas)</label>
                  <textarea
                    id="ingredients"
                    name="ingredients"
                    rows="2"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                <div className="admin-form-group admin-form-span-2">
                  <label htmlFor="allergens">Alérgenos (separados por comas)</label>
                  <textarea
                    id="allergens"
                    name="allergens"
                    rows="2"
                    value={formData.allergens}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="admin-form-buttons">
                <button type="button" className="admin-button-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="admin-button-save">
                  {formMode === 'add' ? 'Añadir Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
