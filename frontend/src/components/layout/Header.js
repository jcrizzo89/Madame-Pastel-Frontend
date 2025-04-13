import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';
import { FaShoppingCart, FaInstagram, FaWhatsapp, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { cart } = useCart();
  const { config } = useConfig();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Controlar el cambio de estilo al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil al cambiar de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt={config?.storeName || 'Madame Pastel'} className="logo-image" />
            ) : (
              <h1>{config?.storeName || 'Madame Pastel'}</h1>
            )}
          </Link>
        </div>

        <div className={`mobile-menu-button ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <nav className={`navigation ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul>
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Inicio</Link></li>
            <li><Link to="/productos" className={location.pathname.includes('/productos') ? 'active' : ''}>Productos</Link></li>
            <li><Link to="/promociones" className={location.pathname === '/promociones' ? 'active' : ''}>Promociones</Link></li>
            <li><Link to="/contacto" className={location.pathname === '/contacto' ? 'active' : ''}>Contacto</Link></li>
          </ul>
        </nav>

        <div className="header-actions">
          {config?.socialLinks?.instagram && (
            <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
              <FaInstagram />
            </a>
          )}
          
          {config?.socialLinks?.whatsapp && (
            <a href={`https://wa.me/${config.socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer" className="social-link">
              <FaWhatsapp />
            </a>
          )}
          
          <Link to="/carrito" className="cart-icon">
            <FaShoppingCart />
            {cart.totalItems > 0 && <span className="cart-badge">{cart.totalItems}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
