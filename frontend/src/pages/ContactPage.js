import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { FaInstagram, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhone, FaClock, FaFacebook } from 'react-icons/fa';
import '../styles/ContactPage.css';

const DEFAULT_WHATSAPP = '5492235512021';

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
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Por favor completá los campos obligatorios (nombre, email y mensaje).'
      });
      return;
    }

    const phone = config?.socialLinks?.whatsapp || config?.contactInfo?.phone || DEFAULT_WHATSAPP;
    const cleanPhone = String(phone).replace(/\D/g, '');

    const lines = [
      'Hola Madame Pastel, les escribo desde el formulario de contacto:',
      '',
      `• Nombre: ${formData.name}`,
      `• Email: ${formData.email}`,
      formData.phone ? `• Teléfono: ${formData.phone}` : null,
      formData.subject ? `• Asunto: ${formData.subject}` : null,
      '',
      `Mensaje: ${formData.message}`
    ].filter(Boolean).join('\n');

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setFormStatus({
      submitted: true,
      success: true,
      message: '¡Gracias! Abrimos WhatsApp con tu consulta para coordinar rápidamente con vos.'
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  // Función para comprobar si está abierto ahora
  const isOpenNow = () => {
    if (!config?.businessHours) return false;

    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (config.businessHours[dayOfWeek]?.closed) return false;

    const openTime = config.businessHours[dayOfWeek]?.open || '00:00';
    const closeTime = config.businessHours[dayOfWeek]?.close || '00:00';

    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    return currentTime >= openMinutes && currentTime <= closeMinutes;
  };

  const formatBusinessHours = (day) => {
    if (!config?.businessHours) return 'No disponible';

    const dayData = config.businessHours[day];
    if (!dayData) return 'No disponible';

    if (dayData.closed) return 'Cerrado';

    return `${dayData.open || '00:00'} - ${dayData.close || '00:00'}`;
  };

  const primaryColor = config?.primaryColor || 'var(--primary-color)';

  const styles = {
    banner: {
      backgroundColor: config?.secondaryColor || 'var(--secondary-color)'
    },
    button: config?.primaryColor
      ? { backgroundColor: config.primaryColor, borderColor: config.primaryColor }
      : undefined,
    socialIcons: {
      color: primaryColor
    },
    openBadge: {
      backgroundColor: isOpenNow() ? 'var(--success-color)' : '#d32f2f'
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
            <p>Podés contactarnos a través de los siguientes medios o enviándonos tu consulta directa.</p>

            <div className="contact-details">
              {config?.contactInfo?.address && (
                <div className="contact-detail">
                  <FaMapMarkerAlt className="contact-icon" aria-hidden="true" />
                  <div>
                    <h3>Ubicación</h3>
                    <p>{config.contactInfo.address}</p>
                  </div>
                </div>
              )}

              {(config?.contactInfo?.phone || config?.socialLinks?.whatsapp) && (
                <div className="contact-detail">
                  <FaPhone className="contact-icon" aria-hidden="true" />
                  <div>
                    <h3>Teléfono</h3>
                    <p>{config?.contactInfo?.phone || `(+54) ${config?.socialLinks?.whatsapp}`}</p>
                  </div>
                </div>
              )}

              {config?.contactInfo?.email && (
                <div className="contact-detail">
                  <FaEnvelope className="contact-icon" aria-hidden="true" />
                  <div>
                    <h3>Email</h3>
                    <p>{config.contactInfo.email}</p>
                  </div>
                </div>
              )}

              <div className="contact-detail">
                <FaClock className="contact-icon" aria-hidden="true" />
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
                    aria-label="Instagram de Madame Pastel"
                  >
                    <FaInstagram aria-hidden="true" />
                  </a>
                )}

                {config?.socialLinks?.whatsapp && (
                  <a
                    href={`https://wa.me/${String(config.socialLinks.whatsapp).replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    style={styles.socialIcons}
                    aria-label="WhatsApp de Madame Pastel"
                  >
                    <FaWhatsapp aria-hidden="true" />
                  </a>
                )}

                {config?.socialLinks?.facebook && (
                  <a
                    href={config.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    style={styles.socialIcons}
                    aria-label="Facebook de Madame Pastel"
                  >
                    <FaFacebook aria-hidden="true" />
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
              <div className={`form-message ${formStatus.success ? 'success' : 'error'}`} role="status">
                {formStatus.message}
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  Nombre <span className="required">*</span>
                </label>
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
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
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
                <label htmlFor="message">
                  Mensaje <span className="required">*</span>
                </label>
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
                Enviar por WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="location-section">
        <div className="container">
          <h2 className="section-title">Nuestra Ubicación</h2>
          <div className="map-container">
            <div className="map-placeholder">
              <FaMapMarkerAlt className="marker-icon" aria-hidden="true" />
              <p>Mar del Plata, Buenos Aires — {config?.contactInfo?.address || 'Envíos a domicilio'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
