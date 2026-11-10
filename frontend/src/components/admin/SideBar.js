import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBirthdayCake,
  FaTags,
  FaShoppingBag,
  FaBoxes,
  FaPercentage,
  FaChartPie,
  FaChartLine,
  FaCog,
  FaUsersCog,
  FaSignOutAlt
} from 'react-icons/fa';
import '../../styles/admin/SideBar.css';
import { canAccessAdminPath } from '../../utils/adminAccess';

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
        <img className="admin-brand-logo" src="/logo-madame-pastel.jpeg" alt="" />
        <h2>Madame Pastel</h2>
        <p>Panel Admin</p>
      </div>
      
      <div className="admin-user-info">
        <div className="admin-avatar">
          {adminUser.username ? adminUser.username.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="admin-user-details">
          <p className="admin-username">{adminUser.username || 'Admin'}</p>
          <p className="admin-role">{{ superadmin: 'Propietaria', admin: 'Administrador', staff: 'Personal' }[adminUser.role] || 'Sin rol'}</p>
        </div>
      </div>
      
      <nav className="admin-sidebar-nav">
        <ul>
          {canAccessAdminPath(adminUser.role, '/admin/dashboard') && <li>
            <Link 
              to="/admin/dashboard" 
              className={isActive('/admin/dashboard') ? 'active' : ''}
            >
              <FaTachometerAlt aria-hidden="true" />
              <span>Dashboard</span>
            </Link>
          </li>}
          {canAccessAdminPath(adminUser.role, '/admin/products') && <li>
            <Link to="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>
              <FaBirthdayCake aria-hidden="true" />
              <span>Productos</span>
            </Link>
          </li>}
          {canAccessAdminPath(adminUser.role, '/admin/categories') && <li>
            <Link 
              to="/admin/categories" 
              className={isActive('/admin/categories') ? 'active' : ''}
            >
              <FaTags aria-hidden="true" />
              <span>Categorías</span>
            </Link>
          </li>}
          <li>
            <Link 
              to="/admin/orders" 
              className={isActive('/admin/orders') ? 'active' : ''}
            >
              <FaShoppingBag aria-hidden="true" />
              <span>Pedidos</span>
            </Link>
          </li>
          {canAccessAdminPath(adminUser.role, '/admin/inventory') && <li>
            <Link 
              to="/admin/inventory" 
              className={isActive('/admin/inventory') ? 'active' : ''}
            >
              <FaBoxes aria-hidden="true" />
              <span>Inventario</span>
            </Link>
          </li>}
          {canAccessAdminPath(adminUser.role, '/admin/promotions') && <li>
            <Link to="/admin/promotions" className={isActive('/admin/promotions') ? 'active' : ''}>
              <FaPercentage aria-hidden="true" />
              <span>Promociones</span>
            </Link>
          </li>}
          {canAccessAdminPath(adminUser.role, '/admin/reports') && <li>
            <Link 
              to="/admin/reports" 
              className={isActive('/admin/reports') ? 'active' : ''}
            >
              <FaChartPie aria-hidden="true" />
              <span>Reportes</span>
            </Link>
          </li>}
          {canAccessAdminPath(adminUser.role, '/admin/statistics') && <li>
            <Link 
              to="/admin/statistics" 
              className={isActive('/admin/statistics') ? 'active' : ''}
            >
              <FaChartLine aria-hidden="true" />
              <span>Estadísticas</span>
            </Link>
          </li>}
          {canAccessAdminPath(adminUser.role, '/admin/settings') && <li>
            <Link 
              to="/admin/settings" 
              className={isActive('/admin/settings') ? 'active' : ''}
            >
              <FaCog aria-hidden="true" />
              <span>Configuración</span>
            </Link>
          </li>}
          {canAccessAdminPath(adminUser.role, '/admin/users') && <li>
            <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>
              <FaUsersCog aria-hidden="true" />
              <span>Equipo</span>
            </Link>
          </li>}
        </ul>
      </nav>
      
      <div className="admin-sidebar-footer">
        <Link to="/admin/logout" className="admin-logout-btn">
          <FaSignOutAlt aria-hidden="true" />
          <span>Cerrar sesión</span>
        </Link>
      </div>
    </div>
  );
};

export default SideBar;
