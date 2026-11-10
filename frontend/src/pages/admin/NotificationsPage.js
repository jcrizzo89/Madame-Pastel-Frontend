import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../utils/constants';
import '../../styles/admin/NotificationsPage.css';

const NotificationsPage = () => {
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('order-confirmation');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [sendingStatus, setSendingStatus] = useState({
    inProgress: false,
    success: 0,
    total: 0
  });

  // Token de autenticación
  const token = localStorage.getItem('adminToken');
  
  // Cargar promociones y pedidos recientes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener promociones activas
        const promotionsResponse = await axios.get(`${API_URL}/products?seasonalPromotion=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Obtener pedidos recientes
        const ordersResponse = await axios.get(`${API_URL}/orders?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPromotions(promotionsResponse.data);
        setOrders(ordersResponse.data);
        
        if (promotionsResponse.data.length > 0) {
          setSelectedPromotion(promotionsResponse.data[0]._id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar promociones y pedidos');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);
  
  // Enviar correo de prueba
  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    
    if (!testEmail) {
      toast.error('Ingresa un email válido para la prueba');
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.post(
        `${API_URL}/notifications/test-email`,
        {
          email: testEmail,
          template: selectedTemplate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Correo de prueba enviado exitosamente');
      setLoading(false);
    } catch (error) {
      console.error('Error al enviar correo de prueba:', error);
      toast.error('Error al enviar correo de prueba');
      setLoading(false);
    }
  };
  
  // Enviar notificación de promoción a segmento de usuarios
  const handleSendPromotionNotification = async (e) => {
    e.preventDefault();
    
    if (!selectedPromotion) {
      toast.error('Selecciona una promoción para enviar');
      return;
    }
    
    try {
      setSendingStatus({
        inProgress: true,
        success: 0,
        total: 0
      });
      
      const response = await axios.post(
        `${API_URL}/notifications/send-promotion`,
        {
          promotionId: selectedPromotion,
          userSegment: selectedSegment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar el estado de envío
      setSendingStatus({
        inProgress: false,
        success: response.data.totalUsers,
        total: response.data.totalUsers
      });
      
      toast.success('Notificaciones de promoción enviadas exitosamente');
    } catch (error) {
      console.error('Error al enviar notificaciones de promoción:', error);
      toast.error('Error al enviar notificaciones de promoción');
      
      setSendingStatus({
        inProgress: false,
        success: 0,
        total: 0
      });
    }
  };
  
  // Enviar notificación de actualización de estado de pedido
  const handleSendOrderNotification = async (orderId, notificationType) => {
    try {
      setLoading(true);
      
      await axios.post(
        `${API_URL}/notifications/order-notification`,
        {
          orderId,
          notificationType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Notificación de pedido enviada exitosamente');
      setLoading(false);
    } catch (error) {
      console.error('Error al enviar notificación de pedido:', error);
      toast.error('Error al enviar notificación de pedido');
      setLoading(false);
    }
  };
  
  // Formatear la fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-AR', options);
  };

  return (
    <div className="admin-notifications-page">
      <div className="admin-page-header">
        <h1>Gestión de Notificaciones</h1>
      </div>
      
      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      ) : (
        <div className="notifications-container">
          {/* Panel de prueba de correos */}
          <div className="notification-card">
            <h2>Prueba de Notificaciones</h2>
            <p className="notification-description">
              Envía correos de prueba para verificar el formato y contenido de las notificaciones.
            </p>
            
            <form onSubmit={handleSendTestEmail} className="notification-form">
              <div className="form-group">
                <label htmlFor="testEmail">Email de Prueba</label>
                <input 
                  type="email" 
                  id="testEmail" 
                  value={testEmail} 
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="selectedTemplate">Plantilla</label>
                <select 
                  id="selectedTemplate" 
                  value={selectedTemplate} 
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="form-control"
                >
                  <option value="order-confirmation">Confirmación de Pedido</option>
                  <option value="promotion-notification">Oferta Promocional</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Prueba'}
              </button>
            </form>
          </div>
          
          {/* Panel de envío de notificaciones de promoción */}
          <div className="notification-card">
            <h2>Promociones por Email</h2>
            <p className="notification-description">
              Envía notificaciones masivas sobre promociones activas a diferentes segmentos de clientes.
            </p>
            
            {promotions.length === 0 ? (
              <div className="no-data-message">
                <p>No hay promociones activas disponibles para enviar.</p>
                <a href="/admin/promotions" className="text-link">Crear Promoción</a>
              </div>
            ) : (
              <form onSubmit={handleSendPromotionNotification} className="notification-form">
                <div className="form-group">
                  <label htmlFor="selectedPromotion">Seleccionar Promoción</label>
                  <select 
                    id="selectedPromotion" 
                    value={selectedPromotion} 
                    onChange={(e) => setSelectedPromotion(e.target.value)}
                    className="form-control"
                    required
                  >
                    {promotions.map(promo => (
                      <option key={promo._id} value={promo._id}>
                        {promo.promotionName || promo.name} - {promo.discountPercentage}% descuento
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="selectedSegment">Segmento de Clientes</label>
                  <select 
                    id="selectedSegment" 
                    value={selectedSegment} 
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    className="form-control"
                  >
                    <option value="all">Todos los usuarios</option>
                    <option value="customers">Clientes con compras previas</option>
                    <option value="subscribers">Suscriptores al newsletter</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={sendingStatus.inProgress}
                >
                  {sendingStatus.inProgress ? 'Enviando...' : 'Enviar Promoción'}
                </button>
                
                {sendingStatus.success > 0 && (
                  <div className="sending-status">
                    <p>Notificaciones enviadas: {sendingStatus.success} de {sendingStatus.total}</p>
                  </div>
                )}
              </form>
            )}
          </div>
          
          {/* Panel de notificaciones para pedidos */}
          <div className="notification-card full-width">
            <h2>Notificaciones de Pedidos</h2>
            <p className="notification-description">
              Envía notificaciones sobre actualizaciones de estado de pedidos a los clientes.
            </p>
            
            {orders.length === 0 ? (
              <div className="no-data-message">
                <p>No hay pedidos recientes para enviar notificaciones.</p>
              </div>
            ) : (
              <div className="orders-table">
                <div className="table-header">
                  <div className="header-id">ID Pedido</div>
                  <div className="header-customer">Cliente</div>
                  <div className="header-date">Fecha</div>
                  <div className="header-status">Estado</div>
                  <div className="header-actions">Acciones</div>
                </div>
                
                {orders.map(order => (
                  <div className="order-row" key={order._id}>
                    <div className="order-id">#{order._id.slice(-8).toUpperCase()}</div>
                    <div className="order-customer">
                      {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                    </div>
                    <div className="order-date">{formatDate(order.createdAt)}</div>
                    <div className={`order-status status-${order.status}`}>
                      {getOrderStatusText(order.status)}
                    </div>
                    <div className="order-actions">
                      <button 
                        className="btn-notification"
                        onClick={() => handleSendOrderNotification(order._id, 'confirmation')}
                        title="Enviar Confirmación"
                      >
                        <i className="fas fa-envelope"></i> Confirmación
                      </button>
                      <button 
                        className="btn-notification"
                        onClick={() => handleSendOrderNotification(order._id, 'status_update')}
                        title="Enviar Actualización"
                      >
                        <i className="fas fa-bell"></i> Estado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para obtener el texto de estado de pedido
function getOrderStatusText(status) {
  const statusMap = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmado',
    'preparing': 'En preparación',
    'ready': 'Listo para retirar',
    'shipped': 'En camino',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
  
  return statusMap[status] || 'Desconocido';
}

export default NotificationsPage;
