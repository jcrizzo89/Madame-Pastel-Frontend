import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>Lo sentimos, la página que estás buscando no existe.</p>
        <div className="not-found-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/productos" className="btn">
            Explorar catálogo
          </Link>
          <Link to="/armar-torta" className="btn btn-outline">
            Armá tu torta
          </Link>
          <Link to="/" className="btn btn-secondary">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
