import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { FaInstagram, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const { config } = useConfig();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">{config?.storeName || 'Madame Pastel'}</h3>
            <p>{config?.siteSettings?.homepageDescription || 'Deliciosas creaciones artesanales para endulzar tus momentos especiales.'}</p>
            <div className="social-links">
              {config?.socialLinks?.instagram && (
                <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
              )}
              
              {config?.socialLinks?.whatsapp && (
                <a href={`https://wa.me/${config.socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp />
                </a>
              )}
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Enlaces</h3>
            <ul className="footer-links">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/productos">Productos</Link></li>
              <li><Link to="/promociones">Promociones</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Contacto</h3>
            <ul className="contact-list">
              {config?.contactInfo?.address && (
                <li>
                  <FaMapMarkerAlt />
                  <span>{config.contactInfo.address}</span>
                </li>
              )}
              
              {config?.contactInfo?.phone || config?.socialLinks?.whatsapp && (
                <li>
                  <FaWhatsapp />
                  <span>{config?.contactInfo?.phone || `+${config?.socialLinks?.whatsapp}`}</span>
                </li>
              )}
              
              {config?.contactInfo?.email && (
                <li>
                  <FaEnvelope />
                  <span>{config.contactInfo.email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {config?.storeName || 'Madame Pastel'}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
