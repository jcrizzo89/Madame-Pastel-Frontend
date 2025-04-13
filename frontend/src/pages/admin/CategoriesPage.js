import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import '../../styles/admin/CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [formMode, setFormMode] = useState('add'); // 'add' o 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Token de autenticación
  const token = localStorage.getItem('adminToken');

  // Obtener categorías únicas de los productos
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los productos para extraer las categorías
        const response = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Extraer categorías únicas
        const uniqueCategories = [...new Set(response.data.map(product => product.category))];
        
        // Crear objetos de categoría con conteo de productos
        const categoriesWithCount = uniqueCategories.map(category => {
          const productsInCategory = response.data.filter(product => product.category === category);
          
          // Obtener una imagen representativa de la categoría
          const representativeImage = productsInCategory.length > 0 ? 
            productsInCategory[0].image : '';
          
          return {
            name: category,
            count: productsInCategory.length,
            description: `Categoría de productos: ${category}`,
            image: representativeImage
          };
        });
        
        setCategories(categoriesWithCount);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError('Error al cargar las categorías');
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Abrir modal para añadir categoría
  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      image: ''
    });
    setFormMode('add');
    setShowModal(true);
  };

  // Abrir modal para editar categoría
  const openEditModal = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setFormMode('edit');
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Guardar categoría
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'add') {
        // Verificar si la categoría ya existe
        if (categories.some(cat => cat.name.toLowerCase() === formData.name.toLowerCase())) {
          alert('Esta categoría ya existe');
          return;
        }
        
        // En un sistema real, aquí se crearía la categoría en la API
        // Por ahora, solo la agregamos a nuestro estado local
        const newCategory = {
          ...formData,
          count: 0
        };
        
        setCategories([...categories, newCategory]);
        
        // Mensaje de éxito
        alert('Categoría añadida. Los productos pueden asignarse a esta categoría.');
      } else {
        // Actualizar categoría existente
        // En un sistema real, aquí se actualizaría la categoría en la API
        // Por ahora, actualizamos nuestro estado local
        
        const updatedCategories = categories.map(cat =>
          cat.name === currentCategory.name ? { ...formData, count: cat.count } : cat
        );
        
        setCategories(updatedCategories);
        
        // Mensaje de éxito
        alert('Categoría actualizada.');
      }
      
      // Cerrar modal
      setShowModal(false);
    } catch (err) {
      console.error("Error saving category:", err);
      alert('Error al guardar la categoría');
    }
  };

  // Eliminar categoría (confirmación previa)
  const handleDeleteCategory = (categoryName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${categoryName}"? Esto puede afectar a los productos asociados.`)) {
      // En un sistema real, aquí se eliminaría la categoría en la API
      // Por ahora, solo la eliminamos de nuestro estado local
      setCategories(categories.filter(cat => cat.name !== categoryName));
      
      // Mensaje de éxito
      alert('Categoría eliminada. Deberás reasignar los productos afectados a otra categoría.');
    }
  };

  // Filtrar categorías según el término de búsqueda
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando categorías...</p>
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
    <div className="admin-categories-page">
      <div className="admin-page-header">
        <h1>Gestión de Categorías</h1>
        <button className="admin-add-button" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Añadir Categoría
        </button>
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="admin-no-results">
          <i className="fas fa-tags"></i>
          <p>No se encontraron categorías</p>
          {searchTerm ? (
            <button onClick={() => setSearchTerm('')}>
              Limpiar búsqueda
            </button>
          ) : (
            <button onClick={openAddModal}>
              Crear primera categoría
            </button>
          )}
        </div>
      ) : (
        <div className="admin-categories-grid">
          {filteredCategories.map((category, index) => (
            <div key={index} className="admin-category-card">
              {category.image ? (
                <div className="admin-category-image">
                  <img src={category.image} alt={category.name} />
                </div>
              ) : (
                <div className="admin-category-image admin-category-placeholder">
                  <i className="fas fa-cookie"></i>
                </div>
              )}
              
              <div className="admin-category-info">
                <h3>{category.name}</h3>
                {category.description && (
                  <p className="admin-category-description">{category.description}</p>
                )}
                <p className="admin-category-count">
                  {category.count} {category.count === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              
              <div className="admin-category-actions">
                <button 
                  className="admin-category-edit"
                  onClick={() => openEditModal(category)}
                  title="Editar categoría"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="admin-category-delete"
                  onClick={() => handleDeleteCategory(category.name)}
                  title="Eliminar categoría"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario para añadir/editar categoría */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{formMode === 'add' ? 'Añadir Categoría' : 'Editar Categoría'}</h2>
              <button className="admin-modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-category-form">
              <div className="admin-form-group">
                <label htmlFor="name">Nombre de Categoría *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={formMode === 'edit'}
                />
                {formMode === 'edit' && (
                  <p className="admin-form-note">El nombre de la categoría no se puede cambiar para mantener la integridad de los datos.</p>
                )}
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="image">URL de Imagen Representativa</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="admin-form-note">Opcional: Una imagen que represente esta categoría</p>
              </div>

              <div className="admin-form-buttons">
                <button type="button" className="admin-button-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="admin-button-save">
                  {formMode === 'add' ? 'Añadir Categoría' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
