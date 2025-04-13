import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/admin/AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => {
    return currentPath === path;
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <img src="/logo-madame-pastel.png" alt="Madame Pastel" />
        </div>
        <h2>Panel Admin</h2>
      </div>
      
      <nav className="admin-menu">
        <ul>
          <li>
            <Link to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>
              <i className="fas fa-cookie-bite"></i>
              <span>Productos</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/categories" className={isActive('/admin/categories') ? 'active' : ''}>
              <i className="fas fa-tags"></i>
              <span>Categorías</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>
              <i className="fas fa-shopping-bag"></i>
              <span>Pedidos</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/inventory" className={isActive('/admin/inventory') ? 'active' : ''}>
              <i className="fas fa-boxes"></i>
              <span>Inventario</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/promotions" className={isActive('/admin/promotions') ? 'active' : ''}>
              <i className="fas fa-percentage"></i>
              <span>Promociones</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/notifications" className={isActive('/admin/notifications') ? 'active' : ''}>
              <i className="fas fa-bell"></i>
              <span>Notificaciones</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/statistics" className={isActive('/admin/statistics') ? 'active' : ''}>
              <i className="fas fa-chart-line"></i>
              <span>Estadísticas</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="admin-sidebar-footer">
        <Link to="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''}>
          <i className="fas fa-cog"></i>
          <span>Configuración</span>
        </Link>
        <Link to="/admin/logout">
          <i className="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
