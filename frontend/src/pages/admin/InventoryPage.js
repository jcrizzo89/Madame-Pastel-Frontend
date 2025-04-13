import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import '../../styles/admin/InventoryPage.css';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    currentStock: 0,
    initialStock: 0,
    reorderLevel: 5,
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [syncingInventory, setSyncingInventory] = useState(false);
  
  // Token de autenticación
  const token = localStorage.getItem('adminToken');

  // Función para cargar los datos de inventario
  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      // Obtener productos e inventario
      const productsResponse = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const inventoryResponse = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Combinar datos de productos e inventario
      const combinedData = productsResponse.data.map(product => {
        const inventoryItem = inventoryResponse.data.find(item => 
          item.product && item.product._id === product._id
        );
        
        // Asegurarse de que se utilice el stock del producto si no hay registro de inventario
        // o si el stock del inventario es 0 cuando el producto tiene stock
        const currentStock = 
          (inventoryItem?.currentStock === 0 && product.stock > 0) ? 
            product.stock : 
            (inventoryItem ? inventoryItem.currentStock : product.stock);
        
        return {
          _id: product._id,
          name: product.name,
          category: product.category,
          image: product.image,
          price: product.price,
          initialStock: inventoryItem ? inventoryItem.initialStock : product.stock,
          currentStock: currentStock,
          reorderLevel: inventoryItem ? inventoryItem.reorderLevel : 5,
          pendingProduction: inventoryItem ? inventoryItem.pendingProduction : 0,
          lastRestocked: inventoryItem ? inventoryItem.lastRestocked : null,
          notes: inventoryItem ? inventoryItem.notes : '',
          inventoryId: inventoryItem ? inventoryItem._id : null
        };
      });
      
      setInventory(combinedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError('Error al cargar el inventario');
      setLoading(false);
    }
  };

  // Obtener inventario
  useEffect(() => {
    fetchInventory();
  }, [token]);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'notes' ? value : parseInt(value, 10) || 0
    });
  };

  // Abrir modal para actualizar inventario
  const openUpdateModal = (item) => {
    setCurrentItem(item);
    setFormData({
      currentStock: item.currentStock,
      initialStock: item.initialStock,
      reorderLevel: item.reorderLevel,
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Guardar cambios en el inventario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        productId: currentItem._id,
        initialStock: formData.initialStock,
        currentStock: formData.currentStock,
        reorderLevel: formData.reorderLevel,
        notes: formData.notes
      };
      
      // Actualizar el inventario
      let response;
      if (currentItem.inventoryId) {
        // Actualizar inventario existente
        response = await axios.post(
          `${API_URL}/inventory/update`,
          data,
          { headers: { Authorization: `Bearer ${token}` }}
        );
      } else {
        // Crear nuevo registro de inventario
        response = await axios.post(
          `${API_URL}/inventory/update`,
          data,
          { headers: { Authorization: `Bearer ${token}` }}
        );
      }
      
      // Actualizar también el stock del producto
      await axios.put(
        `${API_URL}/products/${currentItem._id}`,
        { stock: formData.currentStock },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Actualizar la UI
      setInventory(prevInventory => 
        prevInventory.map(item => 
          item._id === currentItem._id 
            ? { 
                ...item, 
                currentStock: formData.currentStock,
                initialStock: formData.initialStock,
                reorderLevel: formData.reorderLevel,
                notes: formData.notes,
                inventoryId: response.data._id 
              } 
            : item
        )
      );
      
      setShowModal(false);
      
      // Mostrar mensaje de éxito
      alert('Inventario actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
      alert('Error al actualizar el inventario. Por favor, inténtalo de nuevo.');
    }
  };

  // Reordenar stock (añadir a pendingProduction)
  const handleReorder = async (item) => {
    const reorderAmount = window.prompt('Ingrese la cantidad para reordenar:', '10');
    
    if (reorderAmount === null) return; // Usuario canceló
    
    const amount = parseInt(reorderAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un número válido mayor que 0');
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/inventory/reorder`,
        {
          product: item._id,
          quantity: amount
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Actualizar estado del inventario
      setInventory(inventory.map(invItem => 
        invItem._id === item._id
          ? { 
              ...invItem, 
              pendingProduction: (invItem.pendingProduction || 0) + amount,
              inventoryId: response.data._id || invItem.inventoryId
            }
          : invItem
      ));
      
      // Mensaje de éxito
      alert(`Se han reordenado ${amount} unidades de ${item.name}`);
    } catch (err) {
      console.error("Error reordering inventory:", err);
      alert('Error al reordenar el inventario');
    }
  };

  // Recibir stock pendiente
  const handleReceiveStock = async (item) => {
    if (!item.pendingProduction || item.pendingProduction <= 0) {
      alert('No hay producción pendiente para recibir');
      return;
    }
    
    const receiveAmount = window.prompt(
      `Cantidad pendiente: ${item.pendingProduction}. ¿Cuántas unidades recibidas?`, 
      item.pendingProduction.toString()
    );
    
    if (receiveAmount === null) return; // Usuario canceló
    
    const amount = parseInt(receiveAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > item.pendingProduction) {
      alert('Por favor ingrese un número válido entre 1 y ' + item.pendingProduction);
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/inventory/receive`,
        {
          product: item._id,
          quantity: amount
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Actualizar estado del inventario
      setInventory(inventory.map(invItem => 
        invItem._id === item._id
          ? { 
              ...invItem, 
              currentStock: invItem.currentStock + amount,
              pendingProduction: invItem.pendingProduction - amount,
              lastRestocked: new Date(),
              inventoryId: response.data._id || invItem.inventoryId
            }
          : invItem
      ));
      
      // Mensaje de éxito
      alert(`Se han recibido ${amount} unidades de ${item.name}`);
    } catch (err) {
      console.error("Error receiving inventory:", err);
      alert('Error al recibir el inventario');
    }
  };

  // Función para sincronizar todo el inventario con los productos
  const syncAllInventory = async () => {
    try {
      setSyncingInventory(true);
      
      // Llamada a la API para sincronizar productos e inventario
      const response = await axios.post(
        `${API_URL}/inventory/sync-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Recargar los datos después de la sincronización
      await fetchInventory();
      
      // Mostrar mensaje de éxito
      alert(`Sincronización completada exitosamente. ${response.data.totalSynchronized} productos actualizados.`);
      setSyncingInventory(false);
    } catch (error) {
      console.error('Error al sincronizar inventario:', error);
      alert('Error al sincronizar el inventario. Por favor, inténtalo de nuevo.');
      setSyncingInventory(false);
    }
  };

  // Filtrar inventario según términos de búsqueda y filtros
  const filteredInventory = inventory.filter(item => {
    // Filtro de búsqueda
    const searchMatch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de stock
    let stockMatch = true;
    if (stockFilter === 'low') {
      stockMatch = item.currentStock <= item.reorderLevel;
    } else if (stockFilter === 'out') {
      stockMatch = item.currentStock === 0;
    } else if (stockFilter === 'pending') {
      stockMatch = item.pendingProduction > 0;
    }
    
    return searchMatch && stockMatch;
  });

  // Obtener el estado del stock
  const getStockStatus = (item) => {
    if (item.currentStock === 0) {
      return { status: 'out', label: 'Sin stock', color: '#f44336' };
    } else if (item.currentStock <= item.reorderLevel) {
      return { status: 'low', label: 'Stock bajo', color: '#ff9800' };
    } else {
      return { status: 'ok', label: 'En stock', color: '#4caf50' };
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando inventario...</p>
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
    <div className="admin-inventory-page">
      <div className="admin-page-header">
        <h1>Gestión de Inventario</h1>
        <div className="admin-inventory-summary">
          <div className="admin-stat-pill">
            <i className="fas fa-boxes"></i>
            <span>{inventory.length} productos</span>
          </div>
          <div className="admin-stat-pill">
            <i className="fas fa-exclamation-triangle"></i>
            <span>
              {inventory.filter(item => item.currentStock <= item.reorderLevel).length} con stock bajo
            </span>
          </div>
        </div>
        <button 
          className="admin-button-sync"
          onClick={syncAllInventory}
          disabled={syncingInventory}
        >
          {syncingInventory ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-sync-alt"></i>
          )}
          Sincronizar Inventario
        </button>
      </div>

      <div className="admin-filters">
        <div className="admin-filter-group">
          <select 
            className="admin-filter-select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">Todos los productos</option>
            <option value="low">Stock bajo</option>
            <option value="out">Sin stock</option>
            <option value="pending">Con producción pendiente</option>
          </select>
        </div>
        
        <div className="admin-filter-group admin-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredInventory.length === 0 ? (
        <div className="admin-no-results">
          <i className="fas fa-boxes"></i>
          <p>No se encontraron productos que coincidan con tus filtros</p>
          <button onClick={() => {
            setSearchTerm('');
            setStockFilter('all');
          }}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="admin-inventory-table-container">
          <table className="admin-inventory-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Nivel Mínimo</th>
                <th>Stock Pendiente</th>
                <th>Última Reposición</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                const stockStatus = getStockStatus(item);
                
                return (
                  <tr key={item._id}>
                    <td className="admin-product-info">
                      <div className="admin-product-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="admin-product-placeholder">
                            <i className="fas fa-cookie"></i>
                          </div>
                        )}
                      </div>
                      <div className="admin-product-name">{item.name}</div>
                    </td>
                    <td className="admin-product-category">{item.category}</td>
                    <td className="admin-product-stock">
                      <span className="admin-stock-badge" style={{ backgroundColor: stockStatus.color }}>
                        {item.currentStock}
                      </span>
                      <span className="admin-stock-status">{stockStatus.label}</span>
                    </td>
                    <td className="admin-reorder-level">{item.reorderLevel}</td>
                    <td className="admin-pending-stock">
                      {item.pendingProduction > 0 ? (
                        <span className="admin-pending-badge">
                          <i className="fas fa-truck-loading"></i> {item.pendingProduction}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="admin-last-restocked">
                      {formatDate(item.lastRestocked)}
                    </td>
                    <td className="admin-inventory-actions">
                      <button 
                        className="admin-action-button update-stock"
                        onClick={() => openUpdateModal(item)}
                        title="Actualizar inventario"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="admin-action-button reorder"
                        onClick={() => handleReorder(item)}
                        title="Reordenar"
                      >
                        <i className="fas fa-plus-circle"></i>
                      </button>
                      {item.pendingProduction > 0 && (
                        <button 
                          className="admin-action-button receive"
                          onClick={() => handleReceiveStock(item)}
                          title="Recibir stock"
                        >
                          <i className="fas fa-check-circle"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de actualización de inventario */}
      {showModal && currentItem && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Actualizar Inventario: {currentItem.name}</h2>
              <button className="admin-modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-inventory-form">
              <div className="admin-form-group">
                <label htmlFor="currentStock">Stock Actual</label>
                <input
                  type="number"
                  id="currentStock"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="initialStock">Stock Inicial</label>
                <input
                  type="number"
                  id="initialStock"
                  name="initialStock"
                  value={formData.initialStock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
                <p className="admin-form-note">Cantidad con la que se inició el inventario</p>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="reorderLevel">Nivel de Reposición</label>
                <input
                  type="number"
                  id="reorderLevel"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
                <p className="admin-form-note">Cantidad mínima para considerar stock bajo</p>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="notes">Notas</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Información adicional sobre este producto"
                ></textarea>
              </div>
              
              <div className="admin-inventory-summary">
                <div className="admin-summary-item">
                  <h4>Estado actual:</h4>
                  <p>
                    <span 
                      className="admin-stock-dot" 
                      style={{ backgroundColor: getStockStatus({
                        currentStock: formData.currentStock,
                        reorderLevel: formData.reorderLevel
                      }).color }}
                    ></span>
                    {formData.currentStock === 0
                      ? 'Sin stock'
                      : formData.currentStock <= formData.reorderLevel
                        ? 'Stock bajo'
                        : 'En stock'
                    }
                  </p>
                </div>
                
                {currentItem.pendingProduction > 0 && (
                  <div className="admin-summary-item">
                    <h4>Producción pendiente:</h4>
                    <p>{currentItem.pendingProduction} unidades</p>
                  </div>
                )}
              </div>

              <div className="admin-form-buttons">
                <button type="button" className="admin-button-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="admin-button-save">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
