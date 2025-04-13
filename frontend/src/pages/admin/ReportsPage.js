import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin/ReportsPage.css';

// Importar componentes de reportes
import SalesReportComponent from '../../components/admin/reports/SalesReportComponent';
import TopProductsReportComponent from '../../components/admin/reports/TopProductsReportComponent';
import CategorySalesReportComponent from '../../components/admin/reports/CategorySalesReportComponent';
import InventoryReportComponent from '../../components/admin/reports/InventoryReportComponent';
import TrendsReportComponent from '../../components/admin/reports/TrendsReportComponent';

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('summary');
  
  // Fechas para filtrado de reportes
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    from: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString().split('T')[0], // Un mes atrás
    to: today.toISOString().split('T')[0] // Hoy
  });

  // Manejar cambio de fechas
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  // Renderizar el componente de reporte activo
  const renderActiveReport = () => {
    switch (activeReport) {
      case 'sales':
        return <SalesReportComponent dateRange={dateRange} />;
      case 'top-products':
        return <TopProductsReportComponent dateRange={dateRange} />;
      case 'categories':
        return <CategorySalesReportComponent dateRange={dateRange} />;
      case 'inventory':
        return <InventoryReportComponent />;
      case 'trends':
        return <TrendsReportComponent dateRange={dateRange} />;
      case 'summary':
      default:
        // Para el resumen, mostrar mini-tarjetas de cada reporte
        return (
          <div className="reports-summary">
            <div className="report-summary-header">
              <h2>Resumen de Informes</h2>
              <p>Selecciona un período y explora informes detallados para analizar el rendimiento de tu negocio.</p>
            </div>

            <div className="report-cards">
              <div className="report-card" onClick={() => setActiveReport('sales')}>
                <div className="report-card-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="report-card-content">
                  <h3>Ventas por Período</h3>
                  <p>Analiza tus ventas diarias, semanales y mensuales con gráficos detallados.</p>
                </div>
                <div className="report-card-action">
                  <button>Ver Informe</button>
                </div>
              </div>

              <div className="report-card" onClick={() => setActiveReport('top-products')}>
                <div className="report-card-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="report-card-content">
                  <h3>Productos Más Vendidos</h3>
                  <p>Descubre qué productos generan más ventas e ingresos.</p>
                </div>
                <div className="report-card-action">
                  <button>Ver Informe</button>
                </div>
              </div>

              <div className="report-card" onClick={() => setActiveReport('categories')}>
                <div className="report-card-icon">
                  <i className="fas fa-tags"></i>
                </div>
                <div className="report-card-content">
                  <h3>Ventas por Categoría</h3>
                  <p>Compara el rendimiento de diferentes categorías de productos.</p>
                </div>
                <div className="report-card-action">
                  <button>Ver Informe</button>
                </div>
              </div>

              <div className="report-card" onClick={() => setActiveReport('inventory')}>
                <div className="report-card-icon">
                  <i className="fas fa-boxes"></i>
                </div>
                <div className="report-card-content">
                  <h3>Inventario y Stock</h3>
                  <p>Controla tus niveles de inventario y productos con stock bajo.</p>
                </div>
                <div className="report-card-action">
                  <button>Ver Informe</button>
                </div>
              </div>

              <div className="report-card" onClick={() => setActiveReport('trends')}>
                <div className="report-card-icon">
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div className="report-card-content">
                  <h3>Tendencias y Comparaciones</h3>
                  <p>Analiza tendencias y compara períodos de ventas anteriores.</p>
                </div>
                <div className="report-card-action">
                  <button>Ver Informe</button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-reports-page">
      <div className="admin-page-header">
        <h1>Informes y Estadísticas</h1>
        
        <div className="reports-date-filter">
          <div className="date-field">
            <label>Desde:</label>
            <input 
              type="date" 
              name="from" 
              value={dateRange.from}
              onChange={handleDateChange}
            />
          </div>
          <div className="date-field">
            <label>Hasta:</label>
            <input 
              type="date" 
              name="to" 
              value={dateRange.to}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      <div className="reports-container">
        <div className="reports-sidebar">
          <button 
            className={`report-nav-button ${activeReport === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveReport('summary')}
          >
            <i className="fas fa-home"></i>
            <span>Resumen</span>
          </button>
          <button 
            className={`report-nav-button ${activeReport === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveReport('sales')}
          >
            <i className="fas fa-chart-line"></i>
            <span>Ventas por Período</span>
          </button>
          <button 
            className={`report-nav-button ${activeReport === 'top-products' ? 'active' : ''}`}
            onClick={() => setActiveReport('top-products')}
          >
            <i className="fas fa-trophy"></i>
            <span>Productos Más Vendidos</span>
          </button>
          <button 
            className={`report-nav-button ${activeReport === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveReport('categories')}
          >
            <i className="fas fa-tags"></i>
            <span>Ventas por Categoría</span>
          </button>
          <button 
            className={`report-nav-button ${activeReport === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveReport('inventory')}
          >
            <i className="fas fa-boxes"></i>
            <span>Inventario y Stock</span>
          </button>
          <button 
            className={`report-nav-button ${activeReport === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveReport('trends')}
          >
            <i className="fas fa-chart-pie"></i>
            <span>Tendencias y Comparaciones</span>
          </button>
          
          <div className="reports-sidebar-footer">
            <Link to="/admin/dashboard" className="back-to-dashboard">
              <i className="fas fa-arrow-left"></i>
              <span>Volver al Dashboard</span>
            </Link>
          </div>
        </div>
        
        <div className="reports-content">
          {renderActiveReport()}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
