import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import '../../styles/admin/AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar si hay token de admin almacenado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <div className="admin-layout">
      <SideBar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
