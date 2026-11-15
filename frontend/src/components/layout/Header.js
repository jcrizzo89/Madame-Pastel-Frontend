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
  const [gamesDropdownOpen, setGamesDropdownOpen] = useState(false);

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
    setGamesDropdownOpen(false);
  }, [location]);

  // Manejar click en pestaña/enlace: si ya estamos en esa página, hacer scroll suave al inicio
  const handleNavClick = (targetPath) => {
    const isCurrentPage =
      location.pathname === targetPath ||
      (targetPath === '/productos' && location.pathname.startsWith('/productos'));

    if (isCurrentPage) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo">
          <Link to="/" onClick={() => handleNavClick('/')} aria-label="Madame Pastel - Ir al inicio">
            {config?.logoUrl ? (
              <img
                src={config.logoUrl}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/logo-madame-pastel.jpeg';
                }}
                alt={config?.storeName || 'Madame Pastel'}
                className="logo-image"
              />
            ) : (
              <h1>{config?.storeName || 'Madame Pastel'}</h1>
            )}
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={mobileMenuOpen}
          className={`mobile-menu-button ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>

        <nav className={`navigation ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Menú principal">
          <ul>
            <li>
              <Link
                to="/"
                onClick={() => handleNavClick('/')}
                className={location.pathname === '/' ? 'active' : ''}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                to="/productos"
                onClick={() => handleNavClick('/productos')}
                className={location.pathname.startsWith('/productos') ? 'active' : ''}
              >
                Productos
              </Link>
            </li>
            <li>
              <Link
                to="/armar-torta"
                onClick={() => handleNavClick('/armar-torta')}
                className={location.pathname === '/armar-torta' ? 'active' : ''}
              >
                Armá tu torta
              </Link>
            </li>
            <li
              className="nav-dropdown-item"
              onMouseEnter={() => setGamesDropdownOpen(true)}
              onMouseLeave={() => setGamesDropdownOpen(false)}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger ${
                  ['/crea-tu-pastel', '/trivia', '/que-dulce-sos', '/macaron-de-la-suerte'].includes(location.pathname)
                    ? 'active'
                    : ''
                }`}
                onClick={() => setGamesDropdownOpen((prev) => !prev)}
                aria-expanded={gamesDropdownOpen}
                aria-haspopup="true"
              >
                <span>🎮 Juegos & Tests</span>
                <span className="nav-dropdown-caret">▾</span>
              </button>
              <ul className={`nav-dropdown-menu ${gamesDropdownOpen ? 'show' : ''}`}>
                <li>
                  <Link
                    to="/macaron-de-la-suerte"
                    onClick={() => handleNavClick('/macaron-de-la-suerte')}
                    className={location.pathname === '/macaron-de-la-suerte' ? 'active' : ''}
                  >
                    <span className="dropdown-link-main">🥠 Macaron de la Suerte</span>
                    <span className="dropdown-subtag">Ritual & beneficio diario</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/que-dulce-sos"
                    onClick={() => handleNavClick('/que-dulce-sos')}
                    className={location.pathname === '/que-dulce-sos' ? 'active' : ''}
                  >
                    <span className="dropdown-link-main">🍓 ¿Qué Dulce Sos?</span>
                    <span className="dropdown-subtag">Test de personalidad</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/crea-tu-pastel"
                    onClick={() => handleNavClick('/crea-tu-pastel')}
                    className={location.pathname === '/crea-tu-pastel' ? 'active' : ''}
                  >
                    <span className="dropdown-link-main">🎂 Diseñá tu Pastel</span>
                    <span className="dropdown-subtag">Taller creativo</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trivia"
                    onClick={() => handleNavClick('/trivia')}
                    className={location.pathname === '/trivia' ? 'active' : ''}
                  >
                    <span className="dropdown-link-main">🎯 Trivia Pastelera</span>
                    <span className="dropdown-subtag">Desafío 15s</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                to="/promociones"
                onClick={() => handleNavClick('/promociones')}
                className={location.pathname === '/promociones' ? 'active' : ''}
              >
                Promociones
              </Link>
            </li>
            <li>
              <Link
                to="/contacto"
                onClick={() => handleNavClick('/contacto')}
                className={location.pathname === '/contacto' ? 'active' : ''}
              >
                Contacto
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          {config?.socialLinks?.instagram && (
            <a
              href={config.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Perfil de Instagram de Madame Pastel"
            >
              <FaInstagram aria-hidden="true" />
            </a>
          )}

          {config?.socialLinks?.whatsapp && (
            <a
              href={`https://wa.me/${String(config.socialLinks.whatsapp).replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Escribinos por WhatsApp"
            >
              <FaWhatsapp aria-hidden="true" />
            </a>
          )}

          <Link
            to="/carrito"
            onClick={() => handleNavClick('/carrito')}
            className="cart-icon"
            aria-label={`Carrito de compras (${cart.totalItems} ${cart.totalItems === 1 ? 'producto' : 'productos'})`}
          >
            <FaShoppingCart aria-hidden="true" />
            {cart.totalItems > 0 && <span className="cart-badge">{cart.totalItems}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
