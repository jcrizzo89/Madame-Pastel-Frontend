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
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setError('No estás autenticado');
          setLoading(false);
          return;
        }

        // Obtener productos
        const productsResponse = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filtrar productos en promoción
        const promoProducts = productsResponse.data.filter(product => product.isPromotion);
        setPromotionProducts(promoProducts);

        // Obtener estadísticas generales
        const statsResponse = await axios.get(`${API_URL}/statistics/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener productos más vendidos
        const topProductsResponse = await axios.get(`${API_URL}/statistics/most-sold`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener órdenes recientes (limitadas a 5)
        const recentOrdersResponse = await axios.get(`${API_URL}/orders/recent?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStats(statsResponse.data);
        setTopProducts(topProductsResponse.data.slice(0, 5));
        setRecentOrders(recentOrdersResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Error al cargar los datos del dashboard');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Formatear precio a moneda local
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
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
        {/* Nueva sección de Promociones */}
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
                      ? Math.round(promotionProducts.reduce((acc, product) => acc + product.discountPercentage, 0) / promotionProducts.length) 
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
                    <div className="promo-col promo-col-actions">Acciones</div>
                  </div>
                  
                  {promotionProducts.map(product => (
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
                        {formatCurrency(product.price * (1 - product.discountPercentage / 100))}
                      </div>
                      <div className="promo-col promo-col-actions">
                        <a href={`/admin/products/edit/${product._id}`} className="promo-edit-btn" title="Editar promoción">
                          <i className="fas fa-edit"></i>
                        </a>
                        <button className="promo-remove-btn" title="Quitar promoción" onClick={() => {
                          if (window.confirm(`¿Estás seguro de que deseas quitar la promoción de ${product.name}?`)) {
                            // Aquí iría la lógica para quitar la promoción
                            alert('Función de quitar promoción no implementada aún.');
                          }
                        }}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="promo-actions">
                <button className="add-promo-btn" onClick={() => {
                  window.location.href = '/admin/products';
                }}>
                  <i className="fas fa-plus"></i>
                  Agregar Nueva Promoción
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Actividad Reciente</h2>
          </div>
          <div className="recent-activity">
            <div className="activity-item">
              <div className="activity-icon order">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">Nuevo pedido recibido</div>
                <div className="activity-subtitle">Pedido #2458 - $3,850.00</div>
                <div className="activity-time">Hace 25 minutos</div>
              </div>
              <div className="activity-actions">
                <a href="/admin/orders/2458" className="view-button">Ver</a>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon product">
                <i className="fas fa-birthday-cake"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">Producto con stock bajo</div>
                <div className="activity-subtitle">Torta de Chocolate - 3 unidades restantes</div>
                <div className="activity-time">Hace 2 horas</div>
              </div>
              <div className="activity-actions">
                <a href="/admin/inventory" className="view-button">Ver</a>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon payment">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">Pago recibido</div>
                <div className="activity-subtitle">Pedido #2455 - $2,300.00</div>
                <div className="activity-time">Hace 5 horas</div>
              </div>
              <div className="activity-actions">
                <a href="/admin/orders/2455" className="view-button">Ver</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Pedidos Pendientes</h2>
            <a href="/admin/orders?status=pending" className="view-all-link">
              Ver todos
              <i className="fas fa-chevron-right"></i>
            </a>
          </div>
          <div className="pending-orders">
            <div className="order-item">
              <div className="order-id">#2458</div>
              <div className="order-info">
                <div className="order-customer">María González</div>
                <div className="order-details">3 productos - $3,850.00</div>
              </div>
              <div className="order-date">6 Abr 2025</div>
              <div className="order-status pending">Pendiente</div>
              <div className="order-actions">
                <a href="/admin/orders/2458" className="view-button">Ver</a>
              </div>
            </div>
            
            <div className="order-item">
              <div className="order-id">#2457</div>
              <div className="order-info">
                <div className="order-customer">Juan Pérez</div>
                <div className="order-details">1 producto - $850.00</div>
              </div>
              <div className="order-date">6 Abr 2025</div>
              <div className="order-status processing">En proceso</div>
              <div className="order-actions">
                <a href="/admin/orders/2457" className="view-button">Ver</a>
              </div>
            </div>
            
            <div className="order-item">
              <div className="order-id">#2456</div>
              <div className="order-info">
                <div className="order-customer">Laura Martínez</div>
                <div className="order-details">2 productos - $1,750.00</div>
              </div>
              <div className="order-date">5 Abr 2025</div>
              <div className="order-status pending">Pendiente</div>
              <div className="order-actions">
                <a href="/admin/orders/2456" className="view-button">Ver</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
