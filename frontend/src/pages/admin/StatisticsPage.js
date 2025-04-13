import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import '../../styles/admin/StatisticsPage.css';

const StatisticsPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [mostViewedProducts, setMostViewedProducts] = useState([]);
  const [mostSoldProducts, setMostSoldProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChart, setSelectedChart] = useState('sales');
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setError('No estás autenticado');
          setLoading(false);
          return;
        }

        // Obtener estadísticas generales
        const statsResponse = await axios.get(`${API_URL}/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener productos más vistos
        const viewedResponse = await axios.get(`${API_URL}/statistics/most-viewed`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener productos más vendidos
        const soldResponse = await axios.get(`${API_URL}/statistics/most-sold`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStatistics(statsResponse.data);
        setMostViewedProducts(viewedResponse.data);
        setMostSoldProducts(soldResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError('Error al cargar las estadísticas');
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Formatear precio a moneda local
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  // Generar datos para los gráficos según el rango de fechas seleccionado
  const getChartData = () => {
    if (!statistics || !statistics.dailySales) return [];

    let salesData = [];
    const now = new Date();
    
    if (dateRange === 'week') {
      // Últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const sale = statistics.dailySales.find(s => 
          new Date(s.date).toISOString().split('T')[0] === date.toISOString().split('T')[0]
        );
        
        salesData.push({
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('es-AR', { weekday: 'short' }),
          count: sale ? sale.count : 0,
          revenue: sale ? sale.revenue : 0
        });
      }
    } else if (dateRange === 'month') {
      // Últimos 30 días, agrupados por semana
      const weeks = [[], [], [], []];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const sale = statistics.dailySales.find(s => 
          new Date(s.date).toISOString().split('T')[0] === date.toISOString().split('T')[0]
        );
        
        const weekIndex = Math.floor((29 - i) / 7);
        weeks[weekIndex].push({
          count: sale ? sale.count : 0,
          revenue: sale ? sale.revenue : 0
        });
      }
      
      salesData = weeks.map((week, index) => {
        const totalCount = week.reduce((sum, day) => sum + day.count, 0);
        const totalRevenue = week.reduce((sum, day) => sum + day.revenue, 0);
        
        return {
          label: `Semana ${index + 1}`,
          count: totalCount,
          revenue: totalRevenue
        };
      });
    } else if (dateRange === 'year') {
      // Últimos 12 meses
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthlySales = statistics.dailySales.filter(s => {
          const saleDate = new Date(s.date);
          return saleDate >= monthStart && saleDate <= monthEnd;
        });
        
        const totalCount = monthlySales.reduce((sum, sale) => sum + sale.count, 0);
        const totalRevenue = monthlySales.reduce((sum, sale) => sum + sale.revenue, 0);
        
        months.push({
          label: date.toLocaleDateString('es-AR', { month: 'short' }),
          count: totalCount,
          revenue: totalRevenue
        });
      }
      
      salesData = months;
    }
    
    return salesData;
  };

  // Obtener datos para el gráfico seleccionado
  const chartData = getChartData();

  // Obtener el valor máximo para el gráfico
  const getMaxValue = () => {
    if (chartData.length === 0) return 1;
    
    if (selectedChart === 'sales') {
      return Math.max(...chartData.map(item => item.count)) || 1;
    } else {
      return Math.max(...chartData.map(item => item.revenue)) || 1;
    }
  };

  // Calcular el total de visitas por página
  const calculateTotalVisits = () => {
    if (!statistics || !statistics.pageVisits) return 0;
    
    return Object.values(statistics.pageVisits).reduce((total, count) => total + count, 0);
  };

  // Calcular porcentaje de visitas para cada página
  const calculateVisitPercentage = (pageName) => {
    if (!statistics || !statistics.pageVisits) return 0;
    
    const totalVisits = calculateTotalVisits();
    if (totalVisits === 0) return 0;
    
    return ((statistics.pageVisits[pageName] || 0) / totalVisits) * 100;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
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
    <div className="admin-statistics-page">
      <h1>Estadísticas</h1>
      <p className="admin-statistics-subtitle">
        Análisis de ventas, visitas y productos populares
      </p>

      {/* Selector de rango de fechas */}
      <div className="admin-stats-date-range">
        <button 
          className={dateRange === 'week' ? 'active' : ''} 
          onClick={() => setDateRange('week')}
        >
          Semana
        </button>
        <button 
          className={dateRange === 'month' ? 'active' : ''} 
          onClick={() => setDateRange('month')}
        >
          Mes
        </button>
        <button 
          className={dateRange === 'year' ? 'active' : ''} 
          onClick={() => setDateRange('year')}
        >
          Año
        </button>
      </div>

      {/* Gráfico principal */}
      <div className="admin-stats-chart-container">
        <div className="admin-stats-chart-header">
          <h2>
            {selectedChart === 'sales' ? 'Tendencia de Ventas' : 'Ingresos Generados'}
          </h2>
          <div className="admin-chart-selector">
            <button 
              className={selectedChart === 'sales' ? 'active' : ''} 
              onClick={() => setSelectedChart('sales')}
            >
              Ventas
            </button>
            <button 
              className={selectedChart === 'revenue' ? 'active' : ''} 
              onClick={() => setSelectedChart('revenue')}
            >
              Ingresos
            </button>
          </div>
        </div>

        <div className="admin-stats-chart">
          {chartData.length > 0 ? (
            <>
              <div className="admin-chart-y-axis">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index} className="admin-chart-y-label">
                    {selectedChart === 'sales' 
                      ? Math.round(getMaxValue() * (4 - index) / 4) 
                      : formatCurrency(getMaxValue() * (4 - index) / 4)}
                  </div>
                ))}
              </div>
              <div className="admin-chart-content">
                {chartData.map((item, index) => (
                  <div key={index} className="admin-chart-column">
                    <div 
                      className="admin-chart-bar"
                      style={{ 
                        height: `${Math.max(
                          (selectedChart === 'sales' ? item.count : item.revenue) / getMaxValue() * 100, 
                          2
                        )}%` 
                      }}
                    >
                      <span className="admin-chart-tooltip">
                        {selectedChart === 'sales' 
                          ? `${item.count} ventas` 
                          : formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="admin-chart-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="admin-chart-no-data">
              <i className="fas fa-chart-line"></i>
              <p>No hay datos suficientes para mostrar el gráfico</p>
            </div>
          )}
        </div>
      </div>

      <div className="admin-stats-grid">
        {/* Productos más vistos */}
        <div className="admin-stats-card">
          <h2>Productos Más Vistos</h2>
          {mostViewedProducts.length > 0 ? (
            <ul className="admin-stats-product-list">
              {mostViewedProducts.slice(0, 5).map((product, index) => (
                <li key={index} className="admin-stats-product-item">
                  <div className="admin-stats-product-rank">{index + 1}</div>
                  <div className="admin-stats-product-image">
                    <img src={product.productId.image} alt={product.productId.name} />
                  </div>
                  <div className="admin-stats-product-info">
                    <h4>{product.productId.name}</h4>
                    <p>{product.productId.category}</p>
                  </div>
                  <div className="admin-stats-product-views">
                    <span>{product.count}</span>
                    <small>vistas</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-stats-no-data">
              <p>No hay datos de productos vistos</p>
            </div>
          )}
        </div>

        {/* Productos más vendidos */}
        <div className="admin-stats-card">
          <h2>Productos Más Vendidos</h2>
          {mostSoldProducts.length > 0 ? (
            <ul className="admin-stats-product-list">
              {mostSoldProducts.slice(0, 5).map((product, index) => (
                <li key={index} className="admin-stats-product-item">
                  <div className="admin-stats-product-rank">{index + 1}</div>
                  <div className="admin-stats-product-image">
                    <img src={product.productId.image} alt={product.productId.name} />
                  </div>
                  <div className="admin-stats-product-info">
                    <h4>{product.productId.name}</h4>
                    <p>{formatCurrency(product.revenue)}</p>
                  </div>
                  <div className="admin-stats-product-views">
                    <span>{product.count}</span>
                    <small>vendidos</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-stats-no-data">
              <p>No hay datos de productos vendidos</p>
            </div>
          )}
        </div>
      </div>

      {/* Visitas por página */}
      <div className="admin-stats-card">
        <h2>Distribución de Visitas por Página</h2>
        {statistics && statistics.pageVisits ? (
          <div className="admin-page-visits-chart">
            {Object.entries(statistics.pageVisits).map(([page, count], index) => (
              <div key={index} className="admin-page-visit-stat">
                <div className="admin-page-visit-info">
                  <div className="admin-page-name">{page}</div>
                  <div className="admin-page-visits">{count} visitas</div>
                </div>
                <div className="admin-page-visit-bar-container">
                  <div 
                    className="admin-page-visit-bar" 
                    style={{ width: `${calculateVisitPercentage(page)}%` }}
                  ></div>
                </div>
                <div className="admin-page-visit-percentage">
                  {calculateVisitPercentage(page).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-stats-no-data">
            <p>No hay datos de visitas por página</p>
          </div>
        )}
      </div>

      {/* Datos demográficos (dispositivos) */}
      {statistics && statistics.demographics && (
        <div className="admin-stats-card">
          <h2>Dispositivos Utilizados</h2>
          <div className="admin-devices-chart">
            {Object.entries(statistics.demographics.devices).map(([device, count], index) => {
              const total = Object.values(statistics.demographics.devices).reduce((sum, c) => sum + c, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={index} className="admin-device-stat">
                  <div className="admin-device-icon">
                    <i className={`fas fa-${device === 'mobile' ? 'mobile-alt' : device === 'desktop' ? 'desktop' : 'tablet'}`}></i>
                  </div>
                  <div className="admin-device-info">
                    <h4>{device === 'mobile' ? 'Móvil' : device === 'desktop' ? 'Escritorio' : 'Tablet'}</h4>
                    <div className="admin-device-bar-container">
                      <div 
                        className="admin-device-bar" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="admin-device-stats">
                    <span className="admin-device-count">{count}</span>
                    <span className="admin-device-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
