import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/admin/SideBar.css';

const SideBar = () => {
  const location = useLocation();
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  // Función para verificar si el enlace está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Madame Pastel</h2>
        <p>Panel Admin</p>
      </div>
      
      <div className="admin-user-info">
        <div className="admin-avatar">
          {adminUser.username ? adminUser.username.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="admin-user-details">
          <p className="admin-username">{adminUser.username || 'Admin'}</p>
          <p className="admin-role">{adminUser.role || 'Administrador'}</p>
        </div>
      </div>
      
      <nav className="admin-sidebar-nav">
        <ul>
          <li>
            <Link 
              to="/admin/dashboard" 
              className={isActive('/admin/dashboard') ? 'active' : ''}
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/products" 
              className={isActive('/admin/products') ? 'active' : ''}
            >
              <i className="fas fa-birthday-cake"></i>
              Productos
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/categories" 
              className={isActive('/admin/categories') ? 'active' : ''}
            >
              <i className="fas fa-tags"></i>
              Categorías
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/orders" 
              className={isActive('/admin/orders') ? 'active' : ''}
            >
              <i className="fas fa-shopping-bag"></i>
              Pedidos
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/inventory" 
              className={isActive('/admin/inventory') ? 'active' : ''}
            >
              <i className="fas fa-warehouse"></i>
              Inventario
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/reports" 
              className={isActive('/admin/reports') ? 'active' : ''}
            >
              <i className="fas fa-chart-pie"></i>
              Reportes
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/statistics" 
              className={isActive('/admin/statistics') ? 'active' : ''}
            >
              <i className="fas fa-chart-line"></i>
              Estadísticas
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/settings" 
              className={isActive('/admin/settings') ? 'active' : ''}
            >
              <i className="fas fa-cog"></i>
              Configuración
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="admin-sidebar-footer">
        <Link to="/admin/logout" className="admin-logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          Cerrar sesión
        </Link>
      </div>
    </div>
  );
};

export default SideBar;
