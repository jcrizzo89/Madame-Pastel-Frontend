import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar el token y los datos del usuario del localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Redirigir al login
    navigate('/admin/login');
  }, [navigate]);

  // No renderizamos nada, ya que este componente solo realiza la lógica de cierre de sesión
  return null;
};

export default LogoutPage;
