import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../../styles/admin/ReportsNavigation.css';

/**
 * Componente para navegación rápida entre diferentes reportes
 */
const ReportsNavigation = () => {
  const location = useLocation();
  
  // Reportes disponibles
  const reports = [
    {
      id: 'summary',
      path: '/admin/reports',
      exact: true,
      icon: 'fa-home',
      label: 'Resumen'
    },
    {
      id: 'sales',
      path: '/admin/reports/sales',
      icon: 'fa-chart-line',
      label: 'Ventas por Período'
    },
    {
      id: 'top-products',
      path: '/admin/reports/top-products',
      icon: 'fa-trophy',
      label: 'Productos Más Vendidos'
    },
    {
      id: 'categories',
      path: '/admin/reports/categories',
      icon: 'fa-tags',
      label: 'Ventas por Categoría'
    },
    {
      id: 'inventory',
      path: '/admin/reports/inventory',
      icon: 'fa-boxes',
      label: 'Inventario y Stock'
    },
    {
      id: 'trends',
      path: '/admin/reports/trends',
      icon: 'fa-chart-pie',
      label: 'Tendencias y Comparaciones'
    }
  ];

  // Verificar si una ruta está activa
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="reports-navigation">
      <div className="reports-nav-title">
        <i className="fas fa-chart-bar"></i>
        <span>Informes</span>
      </div>
      
      <div className="reports-nav-links">
        {reports.map(report => (
          <Link 
            key={report.id}
            to={report.path}
            className={`reports-nav-link ${isActive(report.path, report.exact) ? 'active' : ''}`}
            title={report.label}
          >
            <i className={`fas ${report.icon}`}></i>
            <span>{report.label}</span>
          </Link>
        ))}
      </div>
      
      <div className="reports-nav-help">
        <Link to="/admin/help/reports" className="reports-help-link">
          <i className="fas fa-question-circle"></i>
          <span>Ayuda con informes</span>
        </Link>
      </div>
    </div>
  );
};

export default ReportsNavigation;
