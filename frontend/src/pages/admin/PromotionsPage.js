import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../utils/constants';
import '../../styles/admin/PromotionsPage.css';

const PromotionsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    isPromotion: true,
    seasonalPromotion: true,
    discountPercentage: 10,
    promotionStartDate: '',
    promotionEndDate: '',
    promotionName: '',
    promotionDescription: ''
  });
  
  // Token de autenticación
  const token = localStorage.getItem('adminToken');
  
  // Obtener productos y promociones al cargar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los productos
        const productsResponse = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const allProducts = productsResponse.data;
        
        // Filtrar productos que están en promoción temporal
        const activePromotions = allProducts.filter(product => 
          product.seasonalPromotion && product.promotionStartDate && product.promotionEndDate
        );
        
        setProducts(allProducts);
        setPromotions(activePromotions);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        toast.error('Error al cargar los productos y promociones');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);
  
  // Verificar si una promoción está actualmente activa
  const isPromotionActive = (promotion) => {
    const now = new Date();
    const startDate = promotion.promotionStartDate ? new Date(promotion.promotionStartDate) : null;
    const endDate = promotion.promotionEndDate ? new Date(promotion.promotionEndDate) : null;
    
    if (!startDate || !endDate) return false;
    return now >= startDate && now <= endDate;
  };
  
  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-AR', options);
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para checkboxes usamos checked, para otros inputs usamos value
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Abrir modal para crear nueva promoción
  const handleCreatePromotion = () => {
    setCurrentPromotion(null);
    setFormData({
      productId: '',
      isPromotion: true,
      seasonalPromotion: true,
      discountPercentage: 10,
      promotionStartDate: new Date().toISOString().split('T')[0],
      promotionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días después
      promotionName: '',
      promotionDescription: ''
    });
    setShowModal(true);
  };
  
  // Abrir modal para editar promoción existente
  const handleEditPromotion = (promotion) => {
    setCurrentPromotion(promotion);
    setFormData({
      productId: promotion._id,
      isPromotion: promotion.isPromotion,
      seasonalPromotion: promotion.seasonalPromotion,
      discountPercentage: promotion.discountPercentage,
      promotionStartDate: promotion.promotionStartDate ? new Date(promotion.promotionStartDate).toISOString().split('T')[0] : '',
      promotionEndDate: promotion.promotionEndDate ? new Date(promotion.promotionEndDate).toISOString().split('T')[0] : '',
      promotionName: promotion.promotionName || '',
      promotionDescription: promotion.promotionDescription || ''
    });
    setShowModal(true);
  };
  
  // Guardar promoción (crear o actualizar)
  const handleSavePromotion = async (e) => {
    e.preventDefault();
    
    try {
      const isUpdate = !!currentPromotion;
      const productId = isUpdate ? currentPromotion._id : formData.productId;
      
      if (!productId) {
        toast.error('Por favor selecciona un producto');
        return;
      }
      
      const promotionData = {
        isPromotion: formData.isPromotion,
        seasonalPromotion: formData.seasonalPromotion,
        discountPercentage: Number(formData.discountPercentage),
        promotionStartDate: formData.promotionStartDate,
        promotionEndDate: formData.promotionEndDate,
        promotionName: formData.promotionName,
        promotionDescription: formData.promotionDescription
      };
      
      // Actualizar producto con información de promoción
      await axios.put(
        `${API_URL}/products/${productId}`,
        promotionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar la UI
      if (isUpdate) {
        // Actualizar promoción existente en la lista
        setPromotions(prevPromotions => 
          prevPromotions.map(promo => 
            promo._id === productId 
              ? { ...promo, ...promotionData } 
              : promo
          )
        );
        
        toast.success('Promoción actualizada exitosamente');
      } else {
        // Buscar el producto completo
        const updatedProduct = products.find(p => p._id === productId);
        if (updatedProduct) {
          // Añadir producto con promoción a la lista
          const updatedPromotion = { ...updatedProduct, ...promotionData };
          setPromotions(prevPromotions => [...prevPromotions, updatedPromotion]);
        }
        
        toast.success('Promoción creada exitosamente');
      }
      
      // Cerrar modal
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar la promoción:', error);
      toast.error('Error al guardar la promoción');
    }
  };
  
  // Eliminar promoción
  const handleDeletePromotion = async (promotionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta promoción?')) return;
    
    try {
      // Actualizar producto para quitar la promoción
      await axios.put(
        `${API_URL}/products/${promotionId}`,
        {
          isPromotion: false,
          seasonalPromotion: false,
          discountPercentage: 0,
          promotionStartDate: null,
          promotionEndDate: null,
          promotionName: '',
          promotionDescription: ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Eliminar de la lista de promociones
      setPromotions(prevPromotions => 
        prevPromotions.filter(promo => promo._id !== promotionId)
      );
      
      toast.success('Promoción eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar la promoción:', error);
      toast.error('Error al eliminar la promoción');
    }
  };
  
  // Calcular días restantes para una promoción
  const getRemainingDays = (endDateString) => {
    if (!endDateString) return 0;
    
    const now = new Date();
    const endDate = new Date(endDateString);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Obtener estado de una promoción
  const getPromotionStatus = (promotion) => {
    if (!promotion.promotionStartDate || !promotion.promotionEndDate) {
      return { status: 'indefinida', className: 'status-undefined' };
    }
    
    const now = new Date();
    const startDate = new Date(promotion.promotionStartDate);
    const endDate = new Date(promotion.promotionEndDate);
    
    if (now < startDate) {
      return { status: 'programada', className: 'status-scheduled' };
    } else if (now > endDate) {
      return { status: 'finalizada', className: 'status-ended' };
    } else {
      return { status: 'activa', className: 'status-active' };
    }
  };

  return (
    <div className="admin-promotions-page">
      <div className="admin-page-header">
        <h1>Gestión de Promociones por Temporada</h1>
        <button 
          className="admin-create-button"
          onClick={handleCreatePromotion}
        >
          <i className="fas fa-plus"></i>
          <span>Nueva Promoción</span>
        </button>
      </div>
      
      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Cargando promociones...</p>
        </div>
      ) : (
        <div className="promotions-container">
          <div className="promotions-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-tag"></i>
              </div>
              <div className="stat-info">
                <div className="stat-value">{promotions.length}</div>
                <div className="stat-label">Promociones Totales</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <div className="stat-value">
                  {promotions.filter(promo => isPromotionActive(promo)).length}
                </div>
                <div className="stat-label">Promociones Activas</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-calendar"></i>
              </div>
              <div className="stat-info">
                <div className="stat-value">
                  {promotions.filter(promo => 
                    new Date(promo.promotionStartDate) > new Date()
                  ).length}
                </div>
                <div className="stat-label">Programadas</div>
              </div>
            </div>
          </div>
          
          {promotions.length === 0 ? (
            <div className="no-promotions">
              <div className="no-data-icon">
                <i className="fas fa-tag"></i>
              </div>
              <h3>No hay promociones por temporada</h3>
              <p>Crea una nueva promoción haciendo clic en el botón "Nueva Promoción"</p>
            </div>
          ) : (
            <div className="promotions-list">
              <div className="list-header">
                <div className="header-product">Producto</div>
                <div className="header-promotion">Promoción</div>
                <div className="header-dates">Fechas</div>
                <div className="header-status">Estado</div>
                <div className="header-actions">Acciones</div>
              </div>
              
              {promotions.map(promotion => {
                const { status, className } = getPromotionStatus(promotion);
                const remainingDays = getRemainingDays(promotion.promotionEndDate);
                
                return (
                  <div className="promotion-item" key={promotion._id}>
                    <div className="promotion-product">
                      <div className="product-image">
                        {promotion.image ? (
                          <img src={promotion.image} alt={promotion.name} />
                        ) : (
                          <div className="image-placeholder">
                            <i className="fas fa-image"></i>
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <div className="product-name">{promotion.name}</div>
                        <div className="product-price">
                          <span className="original-price">${promotion.price}</span>
                          <span className="discount">-{promotion.discountPercentage}%</span>
                          <span className="final-price">
                            ${(promotion.price * (1 - promotion.discountPercentage / 100)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="promotion-info">
                      <div className="promotion-name">{promotion.promotionName || 'Sin nombre'}</div>
                      <div className="promotion-description">
                        {promotion.promotionDescription || 'Sin descripción'}
                      </div>
                    </div>
                    
                    <div className="promotion-dates">
                      <div className="date-item">
                        <span className="date-label">Inicio:</span>
                        <span className="date-value">{formatDate(promotion.promotionStartDate)}</span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">Fin:</span>
                        <span className="date-value">{formatDate(promotion.promotionEndDate)}</span>
                      </div>
                      {status === 'activa' && (
                        <div className="remaining-days">
                          {remainingDays} {remainingDays === 1 ? 'día' : 'días'} restantes
                        </div>
                      )}
                    </div>
                    
                    <div className="promotion-status">
                      <span className={`status-badge ${className}`}>{status}</span>
                    </div>
                    
                    <div className="promotion-actions">
                      <button 
                        className="edit-button" 
                        onClick={() => handleEditPromotion(promotion)}
                        title="Editar promoción"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDeletePromotion(promotion._id)}
                        title="Eliminar promoción"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Modal para crear/editar promoción */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="promotion-modal">
            <div className="modal-header">
              <h2>{currentPromotion ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSavePromotion}>
              <div className="modal-body">
                {/* Selector de producto (solo para nuevas promociones) */}
                {!currentPromotion && (
                  <div className="form-group">
                    <label htmlFor="productId">Producto</label>
                    <select 
                      id="productId" 
                      name="productId" 
                      value={formData.productId} 
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    >
                      <option value="">Selecciona un producto</option>
                      {products
                        .filter(p => !p.seasonalPromotion) // Mostrar solo productos sin promoción temporal
                        .map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} - ${product.price}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                
                {/* Detalles de la promoción */}
                <div className="form-group">
                  <label htmlFor="promotionName">Nombre de la Promoción</label>
                  <input 
                    type="text" 
                    id="promotionName" 
                    name="promotionName" 
                    value={formData.promotionName} 
                    onChange={handleInputChange}
                    placeholder="Ej: Promo Verano, Black Friday, etc."
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="promotionDescription">Descripción (opcional)</label>
                  <textarea 
                    id="promotionDescription" 
                    name="promotionDescription" 
                    value={formData.promotionDescription} 
                    onChange={handleInputChange}
                    placeholder="Describe brevemente la promoción"
                    className="form-control"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="discountPercentage">Descuento (%)</label>
                    <input 
                      type="number" 
                      id="discountPercentage" 
                      name="discountPercentage" 
                      value={formData.discountPercentage} 
                      onChange={handleInputChange}
                      min="1" 
                      max="99"
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="isPromotion">Estado de Promoción</label>
                    <div className="checkbox-container">
                      <input 
                        type="checkbox" 
                        id="isPromotion" 
                        name="isPromotion" 
                        checked={formData.isPromotion} 
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isPromotion" className="checkbox-label">
                        Promoción activa
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="promotionStartDate">Fecha de Inicio</label>
                    <input 
                      type="date" 
                      id="promotionStartDate" 
                      name="promotionStartDate" 
                      value={formData.promotionStartDate} 
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="promotionEndDate">Fecha de Fin</label>
                    <input 
                      type="date" 
                      id="promotionEndDate" 
                      name="promotionEndDate" 
                      value={formData.promotionEndDate} 
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      min={formData.promotionStartDate}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  {currentPromotion ? 'Actualizar' : 'Crear'} Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
