import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { FaInstagram, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhone, FaClock, FaFacebook } from 'react-icons/fa';
import '../styles/ContactPage.css';

const ContactPage = () => {
  const { config } = useConfig();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Por favor completa todos los campos requeridos.'
      });
      return;
    }
    
    // En una implementación real, aquí enviaríamos el formulario a la API
    // Por ahora, simulamos una respuesta exitosa
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Tu mensaje ha sido enviado con éxito. Te responderemos a la brevedad.'
      });
      
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  // Función para comprobar si está abierto ahora
  const isOpenNow = () => {
    if (!config?.businessHours) return false;
    
    const now = new Date();
    // Corregido: 'lowercase' no es un valor válido, usamos 'long' y luego .toLowerCase()
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Si el día está marcado como cerrado, retorna false
    if (config.businessHours[dayOfWeek]?.closed) return false;
    
    // Obtener horarios de apertura y cierre
    const openTime = config.businessHours[dayOfWeek]?.open || '00:00';
    const closeTime = config.businessHours[dayOfWeek]?.close || '00:00';
    
    // Convertir a minutos desde medianoche
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    // Comprobar si el tiempo actual está dentro del horario de apertura
    return currentTime >= openMinutes && currentTime <= closeMinutes;
  };
  
  // Función para formatear los horarios en formato legible
  const formatBusinessHours = (day) => {
    if (!config?.businessHours) return 'No disponible';
    
    const dayData = config.businessHours[day];
    if (!dayData) return 'No disponible';
    
    if (dayData.closed) return 'Cerrado';
    
    return `${dayData.open || '00:00'} - ${dayData.close || '00:00'}`;
  };

  // Colores desde la configuración
  const primaryColor = config?.primaryColor || '#d94f70';
  
  // Estilos dinámicos
  const styles = {
    banner: {
      backgroundColor: config?.secondaryColor || '#f8d7da',
    },
    button: {
      backgroundColor: primaryColor,
      borderColor: primaryColor,
    },
    socialIcons: {
      color: primaryColor,
    },
    openBadge: {
      backgroundColor: isOpenNow() ? '#4BB543' : '#d32f2f',
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-banner" style={styles.banner}>
        <div className="container">
          <h1>Contáctanos</h1>
          <p>Estamos aquí para responder tus consultas y crear algo delicioso para ti</p>
        </div>
      </div>
      
      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Información de Contacto</h2>
            <p>Puedes contactarnos a través de los siguientes medios o completando el formulario.</p>
            
            <div className="contact-details">
              {config?.contactInfo?.address && (
                <div className="contact-detail">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div>
                    <h3>Ubicación</h3>
                    <p>{config.contactInfo.address}</p>
                  </div>
                </div>
              )}
              
              {(config?.contactInfo?.phone || config?.socialLinks?.whatsapp) && (
                <div className="contact-detail">
                  <FaPhone className="contact-icon" />
                  <div>
                    <h3>Teléfono</h3>
                    <p>{config?.contactInfo?.phone || `(+54) ${config?.socialLinks?.whatsapp}`}</p>
                  </div>
                </div>
              )}
              
              {config?.contactInfo?.email && (
                <div className="contact-detail">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <h3>Email</h3>
                    <p>{config.contactInfo.email}</p>
                  </div>
                </div>
              )}
              
              <div className="contact-detail">
                <FaClock className="contact-icon" />
                <div>
                  <h3>Estado</h3>
                  <div className="open-status">
                    <span className="status-badge" style={styles.openBadge}>
                      {isOpenNow() ? 'Abierto Ahora' : 'Cerrado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="social-media-contact">
              <h3>Síguenos en Redes Sociales</h3>
              <div className="social-icons">
                {config?.socialLinks?.instagram && (
                  <a 
                    href={config.socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon" 
                    style={styles.socialIcons}
                  >
                    <FaInstagram />
                  </a>
                )}
                
                {config?.socialLinks?.whatsapp && (
                  <a 
                    href={`https://wa.me/${config.socialLinks.whatsapp}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon"
                    style={styles.socialIcons}
                  >
                    <FaWhatsapp />
                  </a>
                )}
                
                {config?.socialLinks?.facebook && (
                  <a 
                    href={config.socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon"
                    style={styles.socialIcons}
                  >
                    <FaFacebook />
                  </a>
                )}
              </div>
            </div>
            
            <div className="business-hours">
              <h3>Horarios de Atención</h3>
              <ul>
                <li>
                  <span>Lunes:</span> {formatBusinessHours('monday')}
                  {config?.businessHours?.monday?.closed && <span className="closed-badge">Cerrado</span>}
                </li>
                <li>
                  <span>Martes:</span> {formatBusinessHours('tuesday')}
                  {config?.businessHours?.tuesday?.closed && <span className="closed-badge">Cerrado</span>}
                </li>
                <li>
                  <span>Miércoles:</span> {formatBusinessHours('wednesday')}
                  {config?.businessHours?.wednesday?.closed && <span className="closed-badge">Cerrado</span>}
                </li>
                <li>
                  <span>Jueves:</span> {formatBusinessHours('thursday')}
                  {config?.businessHours?.thursday?.closed && <span className="closed-badge">Cerrado</span>}
                </li>
                <li>
                  <span>Viernes:</span> {formatBusinessHours('friday')}
                  {config?.businessHours?.friday?.closed && <span className="closed-badge">Cerrado</span>}
                </li>
                <li>
                  <span>Sábado:</span> {formatBusinessHours('saturday')}
                  {config?.businessHours?.saturday?.closed && <span className="closed-badge">Cerrado</span>}
                </li>
                <li>
                  <span>Domingo:</span> {formatBusinessHours('sunday')}
                  {config?.businessHours?.sunday?.closed && <span className="closed-badge">Cerrado</span>}
                </li>
              </ul>
            </div>
          </div>
          
          <div className="contact-form-container">
            <h2>Envíanos un Mensaje</h2>
            
            {formStatus.submitted && (
              <div className={`form-message ${formStatus.success ? 'success' : 'error'}`}>
                {formStatus.message}
              </div>
            )}
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre <span className="required">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Asunto</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Mensaje <span className="required">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-control"
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="btn submit-btn" style={styles.button}>
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="location-section">
        <div className="container">
          <h2 className="section-title">Nuestra Ubicación</h2>
          <div className="map-container">
            {/* Aquí se puede integrar un mapa con Google Maps u otra API */}
            <div className="map-placeholder">
              <FaMapMarkerAlt className="marker-icon" />
              <p>Mapa de ubicación - {config?.contactInfo?.address || 'Mar del Plata, Buenos Aires'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
