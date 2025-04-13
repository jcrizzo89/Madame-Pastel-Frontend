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

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
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
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Redirección por defecto para rutas no encontradas dentro de /admin */}
      <Route path="*" element={<Navigate to="/admin/dashboard" />} />
    </Routes>
  );
};

export default AdminRoutes;
