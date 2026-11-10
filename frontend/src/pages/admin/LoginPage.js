import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { API_URL } from '../../utils/constants';
import '../../styles/admin/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si ya hay una sesión activa
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify({
          id: response.data._id,
          username: response.data.username,
          email: response.data.email,
          role: response.data.role
        }));
        navigate('/admin/dashboard');
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    } catch (err) {
      setError(
        err.response && err.response.data.message 
          ? err.response.data.message 
          : 'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Madame Pastel</h1>
          <h2>Panel de Administración</h2>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
            <Link to="/" style={{ color: '#888', fontSize: '0.88rem', textDecoration: 'none' }}>
              ← Volver a la tienda
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
