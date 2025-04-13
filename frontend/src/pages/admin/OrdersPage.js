import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import '../../styles/admin/OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    search: ''
  });
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Token de autenticación
  const token = localStorage.getItem('adminToken');

  // Obtener pedidos
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Ordenar por fecha (más recientes primero)
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setOrders(sortedOrders);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('Error al cargar los pedidos');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Aplicar filtros
  const filteredOrders = orders.filter(order => {
    // Filtro por estado
    if (filters.status !== 'all' && order.status !== filters.status) {
      return false;
    }
    
    // Filtro por fecha
    if (filters.date !== 'all') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      
      if (filters.date === 'today') {
        if (orderDate.getDate() !== today.getDate() || 
            orderDate.getMonth() !== today.getMonth() || 
            orderDate.getFullYear() !== today.getFullYear()) {
          return false;
        }
      } else if (filters.date === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        if (orderDate < weekAgo) {
          return false;
        }
      } else if (filters.date === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        if (orderDate < monthAgo) {
          return false;
        }
      }
    }
    
    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const customerNameLower = `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase();
      const orderIdLower = order._id.toLowerCase();
      
      if (!customerNameLower.includes(searchLower) && 
          !orderIdLower.includes(searchLower) && 
          !order.customer.email.toLowerCase().includes(searchLower) &&
          !order.customer.phone.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  // Manejar filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Ver detalles del pedido
  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  // Cerrar modal de detalles
  const handleCloseOrderDetail = () => {
    setShowOrderDetail(false);
  };

  // Actualizar estado del pedido
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Actualizar la lista de pedidos
      setOrders(orders.map(order => 
        order._id === orderId
          ? { ...order, status: newStatus }
          : order
      ));
      
      // Actualizar el pedido seleccionado si está abierto
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      // Mensaje de éxito
      alert(`Estado del pedido actualizado a: ${newStatus}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      alert('Error al actualizar el estado del pedido');
    }
  };

  // Obtener el total del pedido
  const getOrderTotal = (order) => {
    return order.products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
  };

  // Estados para la interfaz de usuario
  const statusLabels = {
    pending: { label: 'Pendiente', color: '#f9a825', icon: 'fa-clock' },
    processing: { label: 'En proceso', color: '#2196f3', icon: 'fa-cog' },
    shipped: { label: 'Enviado', color: '#9c27b0', icon: 'fa-truck' },
    delivered: { label: 'Entregado', color: '#4caf50', icon: 'fa-check-circle' },
    cancelled: { label: 'Cancelado', color: '#f44336', icon: 'fa-times-circle' }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando pedidos...</p>
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
    <div className="admin-orders-page">
      <div className="admin-page-header">
        <h1>Gestión de Pedidos</h1>
        <div className="admin-orders-stats">
          <div className="admin-stat-pill">
            <i className="fas fa-shopping-bag"></i>
            <span>{orders.length} pedidos totales</span>
          </div>
          <div className="admin-stat-pill">
            <i className="fas fa-clock"></i>
            <span>
              {orders.filter(order => order.status === 'pending').length} pendientes
            </span>
          </div>
        </div>
      </div>

      <div className="admin-filters">
        <div className="admin-filter-group">
          <select 
            name="status" 
            value={filters.status}
            onChange={handleFilterChange}
            className="admin-filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="processing">En proceso</option>
            <option value="shipped">Enviados</option>
            <option value="delivered">Entregados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
        
        <div className="admin-filter-group">
          <select 
            name="date" 
            value={filters.date}
            onChange={handleFilterChange}
            className="admin-filter-select"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </div>
        
        <div className="admin-filter-group admin-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            name="search"
            placeholder="Buscar por cliente, ID..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="admin-no-results">
          <i className="fas fa-shopping-bag"></i>
          <p>No se encontraron pedidos que coincidan con tus filtros</p>
          <button onClick={() => setFilters({ status: 'all', date: 'all', search: '' })}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="admin-orders-table-container">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className="admin-order-id">
                    #{order._id.substring(order._id.length - 8)}
                  </td>
                  <td className="admin-order-customer">
                    <div className="admin-customer-name">
                      {order.customer.firstName} {order.customer.lastName}
                    </div>
                    <div className="admin-customer-email">
                      {order.customer.email}
                    </div>
                  </td>
                  <td className="admin-order-date">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="admin-order-total">
                    ${getOrderTotal(order).toFixed(2)}
                  </td>
                  <td className="admin-order-status">
                    <span className="admin-status-badge" style={{ backgroundColor: statusLabels[order.status].color }}>
                      <i className={`fas ${statusLabels[order.status].icon}`}></i>
                      {statusLabels[order.status].label}
                    </span>
                  </td>
                  <td className="admin-order-payment">
                    <span className={`admin-payment-badge ${order.paymentStatus}`}>
                      {order.paymentStatus === 'paid' ? (
                        <>
                          <i className="fas fa-check-circle"></i>
                          Pagado
                        </>
                      ) : order.paymentStatus === 'pending' ? (
                        <>
                          <i className="fas fa-clock"></i>
                          Pendiente
                        </>
                      ) : (
                        <>
                          <i className="fas fa-times-circle"></i>
                          Fallido
                        </>
                      )}
                    </span>
                  </td>
                  <td className="admin-order-actions">
                    <button 
                      className="admin-action-button"
                      onClick={() => handleViewOrderDetail(order)}
                      title="Ver detalles"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles del pedido */}
      {showOrderDetail && selectedOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-order-detail-modal">
            <div className="admin-modal-header">
              <h2>Detalles del Pedido #{selectedOrder._id.substring(selectedOrder._id.length - 8)}</h2>
              <button className="admin-modal-close" onClick={handleCloseOrderDetail}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="admin-order-detail-content">
              <div className="admin-order-info-section">
                <div className="admin-info-card">
                  <h3>Información del Cliente</h3>
                  <p><strong>Nombre:</strong> {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                  <p><strong>Teléfono:</strong> {selectedOrder.customer.phone}</p>
                </div>
                
                <div className="admin-info-card">
                  <h3>Información de Entrega</h3>
                  <p><strong>Dirección:</strong> {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.number}</p>
                  <p><strong>Ciudad:</strong> {selectedOrder.shippingAddress.city}</p>
                  <p><strong>Código Postal:</strong> {selectedOrder.shippingAddress.postalCode}</p>
                  <p><strong>Notas:</strong> {selectedOrder.notes || 'Sin notas'}</p>
                </div>
                
                <div className="admin-info-card">
                  <h3>Información del Pago</h3>
                  <p><strong>Método:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Estado:</strong> {
                    selectedOrder.paymentStatus === 'paid' ? 'Pagado' :
                    selectedOrder.paymentStatus === 'pending' ? 'Pendiente' : 'Fallido'
                  }</p>
                  {selectedOrder.paymentId && (
                    <p><strong>ID de Pago:</strong> {selectedOrder.paymentId}</p>
                  )}
                </div>
              </div>
              
              <div className="admin-order-status-update">
                <h3>Estado del Pedido</h3>
                <div className="admin-status-buttons">
                  {Object.keys(statusLabels).map(status => (
                    <button
                      key={status}
                      className={`admin-status-button ${selectedOrder.status === status ? 'active' : ''}`}
                      style={{ 
                        backgroundColor: selectedOrder.status === status ? statusLabels[status].color : 'transparent',
                        color: selectedOrder.status === status ? 'white' : statusLabels[status].color,
                        borderColor: statusLabels[status].color
                      }}
                      onClick={() => handleUpdateOrderStatus(selectedOrder._id, status)}
                      disabled={selectedOrder.status === status}
                    >
                      <i className={`fas ${statusLabels[status].icon}`}></i>
                      {statusLabels[status].label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="admin-order-products">
                <h3>Productos</h3>
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products.map((product, index) => (
                      <tr key={index}>
                        <td className="admin-product-info">
                          <div className="admin-product-image">
                            {product.image ? (
                              <img src={product.image} alt={product.name} />
                            ) : (
                              <div className="admin-product-placeholder">
                                <i className="fas fa-cookie"></i>
                              </div>
                            )}
                          </div>
                          <div className="admin-product-details">
                            <div className="admin-product-name">{product.name}</div>
                            {product.options && product.options.length > 0 && (
                              <div className="admin-product-options">
                                {product.options.map((option, i) => (
                                  <span key={i} className="admin-option-tag">
                                    {option.name}: {option.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="admin-product-price">${product.price.toFixed(2)}</td>
                        <td className="admin-product-quantity">{product.quantity}</td>
                        <td className="admin-product-subtotal">${(product.price * product.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="admin-order-total-label">Total</td>
                      <td className="admin-order-total-value">${getOrderTotal(selectedOrder).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="admin-order-actions-footer">
                <button className="admin-button-print" onClick={() => window.print()}>
                  <i className="fas fa-print"></i> Imprimir Pedido
                </button>
                <button className="admin-button-cancel" onClick={handleCloseOrderDetail}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
