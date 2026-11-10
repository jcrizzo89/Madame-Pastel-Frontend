import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Componentes de administración
import AdminLayout from '../components/admin/AdminLayout';
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import ProductsPage from '../pages/admin/ProductsPage';
import StatisticsPage from '../pages/admin/StatisticsPage';
import LogoutPage from '../pages/admin/LogoutPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import OrdersPage from '../pages/admin/OrdersPage';
import InventoryPage from '../pages/admin/InventoryPage';
import ReportsPage from '../pages/admin/ReportsPage';
import SettingsPage from '../pages/admin/SettingsPage';
import PromotionsPage from '../pages/admin/PromotionsPage';
import NotificationsPage from '../pages/admin/NotificationsPage';
import UsersPage from '../pages/admin/UsersPage';
import { canAccessAdminPath, getDefaultAdminPath } from '../utils/adminAccess';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

const RoleProtectedRoute = ({ path, children }) => {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  return canAccessAdminPath(user.role, path) ? children : <Navigate to={getDefaultAdminPath(user.role)} replace />;
};

const AdminHomeRedirect = () => {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  return <Navigate to={getDefaultAdminPath(user.role)} replace />;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      
      {/* Rutas protegidas con AdminLayout como wrapper */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHomeRedirect />} />
        <Route path="dashboard" element={<RoleProtectedRoute path="/admin/dashboard"><DashboardPage /></RoleProtectedRoute>} />
        <Route path="products" element={<RoleProtectedRoute path="/admin/products"><ProductsPage /></RoleProtectedRoute>} />
        <Route path="statistics" element={<RoleProtectedRoute path="/admin/statistics"><StatisticsPage /></RoleProtectedRoute>} />
        <Route path="categories" element={<RoleProtectedRoute path="/admin/categories"><CategoriesPage /></RoleProtectedRoute>} />
        <Route path="orders" element={<RoleProtectedRoute path="/admin/orders"><OrdersPage /></RoleProtectedRoute>} />
        <Route path="inventory" element={<RoleProtectedRoute path="/admin/inventory"><InventoryPage /></RoleProtectedRoute>} />
        <Route path="promotions" element={<RoleProtectedRoute path="/admin/promotions"><PromotionsPage /></RoleProtectedRoute>} />
        <Route path="notifications" element={<RoleProtectedRoute path="/admin/notifications"><NotificationsPage /></RoleProtectedRoute>} />
        <Route path="reports" element={<RoleProtectedRoute path="/admin/reports"><ReportsPage /></RoleProtectedRoute>} />
        <Route path="settings" element={<RoleProtectedRoute path="/admin/settings"><SettingsPage /></RoleProtectedRoute>} />
        <Route path="users" element={<RoleProtectedRoute path="/admin/users"><UsersPage /></RoleProtectedRoute>} />
      </Route>
      
      {/* Redirección por defecto para rutas no encontradas dentro de /admin */}
      <Route path="*" element={<Navigate to="/admin/dashboard" />} />
    </Routes>
  );
};

export default AdminRoutes;
