import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import DashboardStats from '../../components/admin/dashboard/DashboardStats';
import '../../styles/admin/DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalSales: 0,
    totalRevenue: 0,
    lastWeekSales: [],
    pageVisitsSummary: {}
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          if (active) {
            setError('No estás autenticado');
            setLoading(false);
          }
          return;
        }

        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
        const [productsRes, statsRes, topRes, ordersRes] = await Promise.allSettled([
          axios.get(`${API_URL}/products`, authHeaders),
          axios.get(`${API_URL}/statistics/summary`, authHeaders),
          axios.get(`${API_URL}/statistics/most-sold`, authHeaders),
          axios.get(`${API_URL}/orders/recent?limit=5`, authHeaders)
        ]);

        if (!active) return;

        if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value.data)) {
          setPromotionProducts(productsRes.value.data.filter((p) => p.isPromotion));
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.data) {
          setStats(statsRes.value.data);
        }

        if (topRes.status === 'fulfilled' && Array.isArray(topRes.value.data)) {
          setTopProducts(topRes.value.data.slice(0, 5));
        }

        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value.data)) {
          setRecentOrders(ordersRes.value.data);
        }

        setLoading(false);
      } catch (err) {
        if (active) {
          console.error('Error fetching dashboard data:', err);
          setError('Error al cargar los datos del dashboard');
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      active = false;
    };
  }, []);

  // Formatear precio a moneda local
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando información del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  const pendingOrders = recentOrders.filter(
    (order) => order.status === 'pending' || order.status === 'processing'
  );

  return (
    <div className="admin-dashboard-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <div className="admin-header-actions">
          <button className="refresh-button" onClick={() => window.location.reload()}>
            <i className="fas fa-sync-alt"></i>
            Actualizar
          </button>
        </div>
      </div>
      
      <DashboardStats />
      
      <div className="dashboard-sections">
        {/* Sección de Promociones */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Gestión de Promociones</h2>
            <a href="/admin/products" className="view-all-link">
              Gestionar productos
              <i className="fas fa-chevron-right"></i>
            </a>
          </div>
          <div className="promo-management">
            <div className="promo-stats">
              <div className="promo-stat-card">
                <div className="stat-icon">
                  <i className="fas fa-tag"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{promotionProducts.length}</div>
                  <div className="stat-label">Productos en promoción</div>
                </div>
              </div>
              <div className="promo-stat-card">
                <div className="stat-icon">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {promotionProducts.length > 0 
                      ? Math.round(promotionProducts.reduce((acc, product) => acc + (product.discountPercentage || 0), 0) / promotionProducts.length) 
                      : 0}%
                  </div>
                  <div className="stat-label">Descuento promedio</div>
                </div>
              </div>
            </div>
            
            <div className="promo-products-list">
              <h3>Productos en promoción</h3>
              {promotionProducts.length === 0 ? (
                <p className="no-promos-message">No hay productos en promoción actualmente.</p>
              ) : (
                <div className="promo-products-table">
                  <div className="promo-table-header">
                    <div className="promo-col promo-col-product">Producto</div>
                    <div className="promo-col promo-col-price">Precio Original</div>
                    <div className="promo-col promo-col-discount">Descuento</div>
                    <div className="promo-col promo-col-final">Precio Final</div>
                  </div>
                  
                  {promotionProducts.map((product) => (
                    <div key={product._id} className="promo-table-row">
                      <div className="promo-col promo-col-product">
                        <div className="promo-product-info">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="promo-product-img" />
                          ) : (
                            <div className="promo-product-placeholder">
                              <i className="fas fa-birthday-cake"></i>
                            </div>
                          )}
                          <div>
                            <div className="promo-product-name">{product.name}</div>
                            <div className="promo-product-category">{product.category}</div>
                          </div>
                        </div>
                      </div>
                      <div className="promo-col promo-col-price">{formatCurrency(product.price)}</div>
                      <div className="promo-col promo-col-discount">{product.discountPercentage}%</div>
                      <div className="promo-col promo-col-final">
                        {formatCurrency(product.price * (1 - (product.discountPercentage || 0) / 100))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="promo-actions">
                <a href="/admin/products" className="add-promo-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-plus"></i>
                  Gestionar en Catálogo
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actividad Reciente (Órdenes reales) */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Actividad Reciente</h2>
            <a href="/admin/orders" className="view-all-link">
              Ver pedidos
              <i className="fas fa-chevron-right"></i>
            </a>
          </div>
          <div className="recent-activity">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div className="activity-item" key={order._id}>
                  <div className="activity-icon order">
                    <i className="fas fa-shopping-bag"></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Pedido #{order.orderNumber || (order._id ? order._id.slice(-4) : '---')}</div>
                    <div className="activity-subtitle">
                      {order.customer?.name || 'Cliente'} — {formatCurrency(order.totalAmount || order.total || 0)}
                    </div>
                    <div className="activity-time">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="activity-actions">
                    <a href="/admin/orders" className="view-button">Ver</a>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: '20px', color: '#777', margin: 0 }}>No hay pedidos recientes registrados.</p>
            )}
          </div>
        </div>
        
        {/* Pedidos Pendientes */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Pedidos Pendientes</h2>
            <a href="/admin/orders?status=pending" className="view-all-link">
              Ver todos
              <i className="fas fa-chevron-right"></i>
            </a>
          </div>
          <div className="pending-orders">
            {pendingOrders && pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <div className="order-item" key={order._id}>
                  <div className="order-id">#{order.orderNumber || (order._id ? order._id.slice(-4) : '---')}</div>
                  <div className="order-info">
                    <div className="order-customer">{order.customer?.name || 'Cliente'}</div>
                    <div className="order-details">
                      {order.products?.length || 0} {order.products?.length === 1 ? 'producto' : 'productos'} - {formatCurrency(order.totalAmount || order.total || 0)}
                    </div>
                  </div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className={`order-status ${order.status || 'pending'}`}>
                    {order.status === 'processing' ? 'En proceso' : 'Pendiente'}
                  </div>
                  <div className="order-actions">
                    <a href="/admin/orders" className="view-button">Ver</a>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: '20px', color: '#777', margin: 0 }}>No hay pedidos pendientes de entrega en este momento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
