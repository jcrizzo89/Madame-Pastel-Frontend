import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../../styles/admin/DashboardStats.css';

const DashboardStats = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/reports/dashboard-summary');
      setStatsData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar estadísticas del dashboard:', error);
      setError('No se pudieron cargar las estadísticas. Intente nuevamente más tarde.');
      toast.error('Error al cargar las estadísticas del dashboard');
      setLoading(false);
    }
  };

  // Datos para el gráfico
  const chartData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Ventas',
        data: [12000, 15000, 18000, 16000, 20000, 22000],
        borderColor: '#d94f70',
        backgroundColor: 'rgba(217, 79, 112, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Opciones para el gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-stats-loading">
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-stats-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={fetchDashboardStats}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="dashboard-stats">
      <div className="dashboard-summary-row">
        <div className="dashboard-stat-card">
          <div className="stat-card-title">Ventas del Mes</div>
          <div className="stat-card-value">
            {statsData ? 
              new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(statsData.currentMonth.sales) 
              : '$0'}
          </div>
          <div className={`stat-card-change ${statsData && statsData.percentChange.sales > 0 ? 'positive' : statsData && statsData.percentChange.sales < 0 ? 'negative' : ''}`}>
            {statsData && (
              <>
                {statsData.percentChange.sales > 0 && <i className="fas fa-arrow-up"></i>}
                {statsData.percentChange.sales < 0 && <i className="fas fa-arrow-down"></i>}
                {statsData.percentChange.sales === 0 && <i className="fas fa-equals"></i>}
                {Math.abs(statsData.percentChange.sales).toFixed(1)}% vs. mes anterior
              </>
            )}
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-title">Pedidos del Mes</div>
          <div className="stat-card-value">
            {statsData ? statsData.currentMonth.orders : 0}
          </div>
          <div className={`stat-card-change ${statsData && statsData.percentChange.orders > 0 ? 'positive' : statsData && statsData.percentChange.orders < 0 ? 'negative' : ''}`}>
            {statsData && (
              <>
                {statsData.percentChange.orders > 0 && <i className="fas fa-arrow-up"></i>}
                {statsData.percentChange.orders < 0 && <i className="fas fa-arrow-down"></i>}
                {statsData.percentChange.orders === 0 && <i className="fas fa-equals"></i>}
                {Math.abs(statsData.percentChange.orders).toFixed(1)}% vs. mes anterior
              </>
            )}
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-title">Ventas de Hoy</div>
          <div className="stat-card-value">
            {statsData ? 
              new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(statsData.today.sales) 
              : '$0'}
          </div>
          <div className="stat-card-subtitle">
            {statsData ? statsData.today.orders : 0} pedidos hoy
          </div>
        </div>

        <div className="dashboard-stat-card alert-card">
          <div className="stat-card-title">Pendientes</div>
          <div className="stat-card-value">
            {statsData ? statsData.pendingOrders : 0}
          </div>
          <div className="stat-card-subtitle">
            pedidos por procesar
          </div>
          <Link to="/admin/orders?status=pending" className="stat-card-action">
            Ver pedidos
          </Link>
        </div>
      </div>

      <div className="dashboard-charts-row">
        <div className="dashboard-chart-card">
          <div className="chart-card-header">
            <h3>Tendencia de Ventas</h3>
            <Link to="/admin/reports/sales" className="view-details-link">
              Ver detalles
              <i className="fas fa-chevron-right"></i>
            </Link>
          </div>
          <div className="chart-container" style={{ height: '240px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="dashboard-top-products">
          <div className="chart-card-header">
            <h3>Productos Más Vendidos</h3>
            <Link to="/admin/reports/top-products" className="view-details-link">
              Ver detalles
              <i className="fas fa-chevron-right"></i>
            </Link>
          </div>
          
          {statsData && statsData.topProducts && statsData.topProducts.length > 0 ? (
            <div className="top-products-list">
              {statsData.topProducts.slice(0, 4).map((product, index) => (
                <div className="top-product-item" key={product._id}>
                  <div className="top-product-rank">#{index + 1}</div>
                  <div className="top-product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="placeholder-image">
                        <i className="fas fa-birthday-cake"></i>
                      </div>
                    )}
                  </div>
                  <div className="top-product-info">
                    <div className="top-product-name">{product.name}</div>
                    <div className="top-product-stats">
                      <span>{product.totalSold} vendidos</span>
                      <span>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <p>No hay datos de ventas disponibles</p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-quick-actions">
        <Link to="/admin/reports" className="quick-action-card">
          <div className="quick-action-icon">
            <i className="fas fa-chart-pie"></i>
          </div>
          <div className="quick-action-content">
            <h3>Reportes Completos</h3>
            <p>Accede a todos los informes detallados de ventas e inventario</p>
          </div>
        </Link>
        
        <Link to="/admin/inventory?filter=low" className="quick-action-card alert">
          <div className="quick-action-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="quick-action-content">
            <h3>Stock Bajo</h3>
            <p>{statsData ? statsData.lowStockProducts : 0} productos requieren reposición</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardStats;
