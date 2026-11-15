import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { useConfig } from '../../context/ConfigContext';
import { toast } from 'react-toastify';
import '../../styles/admin/SettingsPage.css';

const SettingsPage = () => {
  const { reloadConfig } = useConfig();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('brand');
  const [config, setConfig] = useState(null);
  const [initialConfig, setInitialConfig] = useState(null);
  const [useFreeformBank, setUseFreeformBank] = useState(false);
  
  // Token de autenticación
  const token = localStorage.getItem('adminToken');

  // Obtener configuración actual
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/config`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConfig(response.data);
        setInitialConfig(JSON.stringify(response.data));
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar la configuración:', err);
        setError('Error al cargar la configuración del sistema');
        setLoading(false);
      }
    };

    fetchConfig();
  }, [token]);

  // Detección de cambios no guardados (Dirty state)
  const isDirty = useMemo(() => {
    if (!initialConfig || !config) return false;
    return JSON.stringify(config) !== initialConfig;
  }, [config, initialConfig]);

  // Alerta de seguridad al intentar cerrar la pestaña con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e, section = null, subsection = null) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    if (section && subsection) {
      setConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: {
            ...prev[section][subsection],
            [name]: inputValue
          }
        }
      }));
    } else if (section) {
      setConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: inputValue
        }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [name]: inputValue
      }));
    }
  };

  // Guardar configuración
  const handleSaveConfig = useCallback(async () => {
    if (!config || saving) return;
    try {
      setSaving(true);
      const response = await axios.put(
        `${API_URL}/config/${config._id}`,
        config,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const updated = response.data || config;
      setConfig(updated);
      setInitialConfig(JSON.stringify(updated));
      if (reloadConfig) reloadConfig();
      setSaving(false);
      toast.success('Configuración guardada exitosamente');
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setSaving(false);
      const msg = err.response?.data?.message || 'Error al guardar la configuración';
      toast.error(msg);
    }
  }, [config, saving, token, reloadConfig]);

  // Descartar cambios y restaurar estado inicial
  const handleDiscardChanges = () => {
    if (initialConfig) {
      setConfig(JSON.parse(initialConfig));
      toast.info('Cambios descartados');
    }
  };

  // Atajo de teclado global: Ctrl+S o Cmd+S para guardar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isDirty && !saving) {
          handleSaveConfig();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, saving, handleSaveConfig]);

  // Presets para horarios de atención de la pastelería
  const applyWeekdaySchedule = (open = '09:00', close = '18:00') => {
    setConfig(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        monday: { open, close, closed: false },
        tuesday: { open, close, closed: false },
        wednesday: { open, close, closed: false },
        thursday: { open, close, closed: false },
        friday: { open, close, closed: false }
      }
    }));
    toast.info('Horario de lunes a viernes aplicado');
  };

  const applyWeekendClosed = () => {
    setConfig(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        saturday: { ...prev.businessHours.saturday, closed: true },
        sunday: { ...prev.businessHours.sunday, closed: true }
      }
    }));
    toast.info('Fines de semana marcados como cerrados');
  };

  // Parser y formateador para datos bancarios estructurados
  const parseBankDetails = (text = '') => {
    const lines = text.split('\n');
    const details = { banco: '', titular: '', cbu: '', alias: '' };
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length > 1) {
        const key = parts[0].trim().toLowerCase();
        const val = parts.slice(1).join(':').trim();
        if (key.includes('banco')) details.banco = val;
        else if (key.includes('titular')) details.titular = val;
        else if (key.includes('cbu') || key.includes('cvu')) details.cbu = val;
        else if (key.includes('alias')) details.alias = val;
      }
    });
    return details;
  };

  const handleBankFieldChange = (field, value) => {
    const current = parseBankDetails(config.paymentOptions?.bankTransfer?.accountDetails || '');
    current[field] = value;
    const formatted = `Banco: ${current.banco || ''}\nTitular: ${current.titular || ''}\nCBU/CVU: ${current.cbu || ''}\nAlias: ${current.alias || ''}`.trim();
    
    setConfig(prev => ({
      ...prev,
      paymentOptions: {
        ...prev.paymentOptions,
        bankTransfer: {
          ...prev.paymentOptions.bankTransfer,
          accountDetails: formatted
        }
      }
    }));
  };

  // Renderizado condicional por pestañas
  const renderTabContent = () => {
    if (!config) return null;

    switch (activeTab) {
      // Pestaña 1: Marca y Tienda
      case 'brand':
        return (
          <div className="settings-tab-content">
            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-store"></i>
                <div>
                  <h3>Identidad de la Tienda</h3>
                  <p>Nombre, logotipo y datos visibles para tus clientes.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="storeName">Nombre de la Tienda</label>
                  <input
                    type="text"
                    id="storeName"
                    name="storeName"
                    value={config.storeName || ''}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="Madame Pastel"
                  />
                  <small className="form-hint">Aparece en la cabecera, comprobantes y mensajes de WhatsApp.</small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="logoUrl">URL del Logotipo</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="logoUrl"
                      name="logoUrl"
                      value={config.logoUrl || ''}
                      onChange={(e) => handleInputChange(e)}
                      placeholder="/logo-madame-pastel.jpeg o URL externa"
                    />
                  </div>
                  <small className="form-hint">Recomendado: imagen cuadrada o rectangular con fondo transparente o claro (PNG/JPG).</small>
                  
                  {config.logoUrl && (
                    <div className="logo-preview-box">
                      <span className="preview-label">Vista previa del logotipo:</span>
                      <div className="logo-preview-frame">
                        <img 
                          src={config.logoUrl} 
                          alt="Logo preview" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-palette"></i>
                <div>
                  <h3>Colores de la Marca</h3>
                  <p>Personaliza los tonos principales del sitio web.</p>
                </div>
              </div>

              <div className="color-grid">
                <div className="color-field-card">
                  <label htmlFor="primaryColor">Color Primario</label>
                  <p className="color-field-desc">Botones de compra, enlaces activos y destacados.</p>
                  <div className="color-input-combo">
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={config.primaryColor || '#d94f70'}
                      onChange={(e) => handleInputChange(e)}
                      aria-label="Selector visual de color primario"
                    />
                    <input
                      type="text"
                      name="primaryColor"
                      value={config.primaryColor || '#d94f70'}
                      onChange={(e) => handleInputChange(e)}
                      placeholder="#d94f70"
                    />
                  </div>
                </div>

                <div className="color-field-card">
                  <label htmlFor="secondaryColor">Color Secundario</label>
                  <p className="color-field-desc">Banners, fondos suaves y tarjetas de producto.</p>
                  <div className="color-input-combo">
                    <input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      value={config.secondaryColor || '#f8d7da'}
                      onChange={(e) => handleInputChange(e)}
                      aria-label="Selector visual de color secundario"
                    />
                    <input
                      type="text"
                      name="secondaryColor"
                      value={config.secondaryColor || '#f8d7da'}
                      onChange={(e) => handleInputChange(e)}
                      placeholder="#f8d7da"
                    />
                  </div>
                </div>
              </div>

              {/* Previsualización en vivo de la paleta */}
              <div className="live-palette-preview">
                <span className="preview-label">Demostración en vivo de contraste:</span>
                <div 
                  className="mock-palette-banner" 
                  style={{ backgroundColor: config.secondaryColor || '#f8d7da' }}
                >
                  <div className="mock-palette-content">
                    <span className="mock-palette-title" style={{ color: '#333' }}>
                      {config.storeName || 'Madame Pastel'}
                    </span>
                    <span className="mock-palette-text" style={{ color: '#555' }}>
                      Pastelería artesanal hecha con amor en Mar del Plata
                    </span>
                  </div>
                  <button 
                    type="button"
                    className="mock-palette-btn" 
                    style={{ backgroundColor: config.primaryColor || '#d94f70', color: '#fff' }}
                  >
                    Hacer Pedido
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-address-book"></i>
                <div>
                  <h3>Contacto y Redes del Atelier</h3>
                  <p>Canales donde tus clientes pueden comunicarse con Madame Pastel.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="whatsapp">WhatsApp de Pedidos</label>
                  <div className="input-with-icon">
                    <i className="fab fa-whatsapp"></i>
                    <input
                      type="text"
                      id="whatsapp"
                      name="whatsapp"
                      value={config.socialLinks?.whatsapp || ''}
                      onChange={(e) => handleInputChange(e, 'socialLinks')}
                      placeholder="+54 9 223 551-2021"
                    />
                  </div>
                  <small className="form-hint">Número con código de área (ej. +549223...)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="instagram">Instagram</label>
                  <div className="input-with-icon">
                    <i className="fab fa-instagram"></i>
                    <input
                      type="text"
                      id="instagram"
                      name="instagram"
                      value={config.socialLinks?.instagram || ''}
                      onChange={(e) => handleInputChange(e, 'socialLinks')}
                      placeholder="https://www.instagram.com/madamepastelmdp"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="facebook">Facebook</label>
                  <div className="input-with-icon">
                    <i className="fab fa-facebook"></i>
                    <input
                      type="text"
                      id="facebook"
                      name="facebook"
                      value={config.socialLinks?.facebook || ''}
                      onChange={(e) => handleInputChange(e, 'socialLinks')}
                      placeholder="https://www.facebook.com/madamepastel"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono de Línea</label>
                  <div className="input-with-icon">
                    <i className="fas fa-phone"></i>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={config.contactInfo?.phone || ''}
                      onChange={(e) => handleInputChange(e, 'contactInfo')}
                      placeholder="+54 223 456-7890"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="email">Email de Contacto</label>
                  <div className="input-with-icon">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={config.contactInfo?.email || ''}
                      onChange={(e) => handleInputChange(e, 'contactInfo')}
                      placeholder="contacto@madamepastel.com"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">Dirección del Taller / Retiro</label>
                  <div className="input-with-icon">
                    <i className="fas fa-map-marker-alt"></i>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={config.contactInfo?.address || ''}
                      onChange={(e) => handleInputChange(e, 'contactInfo')}
                      placeholder="Mar del Plata, Provincia de Buenos Aires, Argentina"
                    />
                  </div>
                  <small className="form-hint">Visible en la sección de contacto y confirmación de retiros.</small>
                </div>
              </div>
            </div>
          </div>
        );

      // Pestaña 2: Contenido y SEO
      case 'content':
        return (
          <div className="settings-tab-content">
            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-feather-alt"></i>
                <div>
                  <h3>Textos de la Portada</h3>
                  <p>Mensajes y propuesta de valor que reciben al visitante en la página principal.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="homepageTitle">Título Principal de la Portada</label>
                  <input
                    type="text"
                    id="homepageTitle"
                    name="homepageTitle"
                    value={config.siteSettings?.homepageTitle || ''}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    placeholder="Madame Pastel"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="homepageDescription">Subtítulo / Bajada de la Portada</label>
                  <textarea
                    id="homepageDescription"
                    name="homepageDescription"
                    value={config.siteSettings?.homepageDescription || ''}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    rows="2"
                    placeholder="Armá tu torta personalizada y coordiná el envío por WhatsApp."
                  ></textarea>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="homepageHeroImage">Imagen Destacada de la Portada</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="homepageHeroImage"
                      name="homepageHeroImage"
                      value={config.siteSettings?.homepageHeroImage || ''}
                      onChange={(e) => handleInputChange(e, 'siteSettings')}
                      placeholder="/images/torta-personalizada-ilustrativa.png o URL externa"
                    />
                    <button
                      type="button"
                      className="btn-quick-preset"
                      onClick={() => {
                        handleInputChange(
                          { target: { name: 'homepageHeroImage', value: '/images/torta-personalizada-ilustrativa.png', type: 'text' } },
                          'siteSettings'
                        );
                      }}
                      title="Restablecer imagen predeterminada de portada"
                    >
                      <i className="fas fa-undo"></i> Predeterminada
                    </button>
                  </div>
                  <small className="form-hint">Imagen principal que acompaña la propuesta en la portada (formato cuadrado o 4:3).</small>
                  {config.siteSettings?.homepageHeroImage && (
                    <div className="logo-preview-box" style={{ marginTop: '0.75rem' }}>
                      <span className="preview-label">Vista previa imagen de portada:</span>
                      <div className="logo-preview-frame">
                        <img
                          src={config.siteSettings?.homepageHeroImage}
                          alt="Hero preview"
                          style={{ maxHeight: '110px', objectFit: 'cover', borderRadius: '6px' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="homepageAboutTitle">Título de la sección "Nuestra propuesta"</label>
                  <input
                    type="text"
                    id="homepageAboutTitle"
                    name="homepageAboutTitle"
                    value={config.siteSettings?.homepageAboutTitle || ''}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    placeholder="Una torta hecha para tu momento"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="homepageAboutDescription">Texto descriptivo de "Nuestra propuesta"</label>
                  <textarea
                    id="homepageAboutDescription"
                    name="homepageAboutDescription"
                    value={config.siteSettings?.homepageAboutDescription || ''}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    rows="3"
                    placeholder="Elegí tamaño, sabor de bizcochuelo, dos rellenos y decoración..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-images"></i>
                <div>
                  <h3>Banner de la Página de Productos</h3>
                  <p>Imagen y encabezado visual que se muestra en la sección de catálogo de productos.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="productsBannerImage">URL de la Imagen del Banner</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="productsBannerImage"
                      name="productsBannerImage"
                      value={config.siteSettings?.productsBannerImage || ''}
                      onChange={(e) => handleInputChange(e, 'siteSettings')}
                      placeholder="/images/products-banner.jpg o URL externa"
                    />
                    <button
                      type="button"
                      className="btn-quick-preset"
                      onClick={() => {
                        handleInputChange(
                          { target: { name: 'productsBannerImage', value: '/images/products-banner.jpg', type: 'text' } },
                          'siteSettings'
                        );
                      }}
                      title="Restablecer imagen predeterminada de pastelería"
                    >
                      <i className="fas fa-undo"></i> Predeterminada
                    </button>
                  </div>
                  <small className="form-hint">
                    Recomendado: imagen horizontal panorámica (1920x400 o proporción 16:9). Puedes usar una ruta local como <code>/images/products-banner.jpg</code> o cualquier URL externa (https://...).
                  </small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="productsBannerTitle">Título del Banner</label>
                  <input
                    type="text"
                    id="productsBannerTitle"
                    name="productsBannerTitle"
                    value={config.siteSettings?.productsBannerTitle ?? 'Nuestros productos'}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    placeholder="Nuestros productos"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="productsBannerSubtitle">Subtítulo / Bajada del Banner</label>
                  <input
                    type="text"
                    id="productsBannerSubtitle"
                    name="productsBannerSubtitle"
                    value={config.siteSettings?.productsBannerSubtitle ?? 'Consultá disponibilidad y coordiná el envío por WhatsApp.'}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    placeholder="Consultá disponibilidad y coordiná el envío por WhatsApp."
                  />
                </div>
              </div>

              {/* Vista previa en vivo del Banner */}
              <div className="banner-preview-card">
                <span className="preview-label">Vista previa del banner en la tienda:</span>
                <div
                  className="banner-preview-frame"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("${config.siteSettings?.productsBannerImage || '/images/products-banner.jpg'}")`
                  }}
                >
                  <h4>{config.siteSettings?.productsBannerTitle || 'Nuestros productos'}</h4>
                  <p>{config.siteSettings?.productsBannerSubtitle || 'Consultá disponibilidad y coordiná el envío por WhatsApp.'}</p>
                </div>
              </div>
            </div>

            {/* Banner de Promociones */}
            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-tag"></i>
                <div>
                  <h3>Banner de la Página de Promociones</h3>
                  <p>Imagen y encabezado visual que se muestra en la sección de ofertas especiales.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="promotionsBannerImage">URL de la Imagen del Banner de Promociones</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="promotionsBannerImage"
                      name="promotionsBannerImage"
                      value={config.siteSettings?.promotionsBannerImage || ''}
                      onChange={(e) => handleInputChange(e, 'siteSettings')}
                      placeholder="/images/promotions-banner.jpg o URL externa"
                    />
                    <button
                      type="button"
                      className="btn-quick-preset"
                      onClick={() => {
                        handleInputChange(
                          { target: { name: 'promotionsBannerImage', value: '/images/promotions-banner.jpg', type: 'text' } },
                          'siteSettings'
                        );
                      }}
                      title="Restablecer imagen festiva predeterminada de promociones"
                    >
                      <i className="fas fa-undo"></i> Predeterminada
                    </button>
                  </div>
                  <small className="form-hint">
                    Recomendado: imagen panorámica horizontal (1920x400 o proporción 16:9).
                  </small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="promotionsBannerTitle">Título del Banner</label>
                  <input
                    type="text"
                    id="promotionsBannerTitle"
                    name="promotionsBannerTitle"
                    value={config.siteSettings?.promotionsBannerTitle ?? 'Promociones Especiales'}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    placeholder="Promociones Especiales"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="promotionsBannerSubtitle">Subtítulo / Bajada del Banner</label>
                  <input
                    type="text"
                    id="promotionsBannerSubtitle"
                    name="promotionsBannerSubtitle"
                    value={config.siteSettings?.promotionsBannerSubtitle ?? 'Aprovechá nuestras ofertas y promociones exclusivas en pastelería artesanal'}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    placeholder="Aprovechá nuestras ofertas y promociones exclusivas en pastelería artesanal"
                  />
                </div>
              </div>

              <div className="banner-preview-card">
                <span className="preview-label">Vista previa del banner de promociones:</span>
                <div
                  className="banner-preview-frame"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("${config.siteSettings?.promotionsBannerImage || '/images/promotions-banner.jpg'}")`
                  }}
                >
                  <h4>{config.siteSettings?.promotionsBannerTitle || 'Promociones Especiales'}</h4>
                  <p>{config.siteSettings?.promotionsBannerSubtitle || 'Aprovechá nuestras ofertas y promociones exclusivas en pastelería artesanal'}</p>
                </div>
              </div>
            </div>

            {/* Banner de Contacto */}
            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-envelope-open-text"></i>
                <div>
                  <h3>Banner de la Página de Contacto</h3>
                  <p>Imagen y encabezado visual que se muestra en la sección de contacto y atención al cliente.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="contactBannerImage">URL de la Imagen del Banner de Contacto</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="contactBannerImage"
                      name="contactBannerImage"
                      value={config.siteSettings?.contactBannerImage || ''}
                      onChange={(e) => handleInputChange(e, 'siteSettings')}
                      placeholder="/images/contact-banner.jpg o URL externa"
                    />
                    <button
                      type="button"
                      className="btn-quick-preset"
                      onClick={() => {
                        handleInputChange(
                          { target: { name: 'contactBannerImage', value: '/images/contact-banner.jpg', type: 'text' } },
                          'siteSettings'
                        );
                      }}
                      title="Restablecer imagen de taller/pastelería predeterminada"
                    >
                      <i className="fas fa-undo"></i> Predeterminada
                    </button>
                  </div>
                  <small className="form-hint">
                    Recomendado: imagen panorámica horizontal (1920x400 o proporción 16:9).
                  </small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="contactBannerTitle">Título del Banner</label>
                  <input
                    type="text"
                    id="contactBannerTitle"
                    name="contactBannerTitle"
                    value={config.siteSettings?.contactBannerTitle ?? 'Contáctanos'}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    placeholder="Contáctanos"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="contactBannerSubtitle">Subtítulo / Bajada del Banner</label>
                  <input
                    type="text"
                    id="contactBannerSubtitle"
                    name="contactBannerSubtitle"
                    value={config.siteSettings?.contactBannerSubtitle ?? 'Estamos aquí para responder tus consultas y crear algo delicioso para ti'}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    placeholder="Estamos aquí para responder tus consultas y crear algo delicioso para ti"
                  />
                </div>
              </div>

              <div className="banner-preview-card">
                <span className="preview-label">Vista previa del banner de contacto:</span>
                <div
                  className="banner-preview-frame"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("${config.siteSettings?.contactBannerImage || '/images/contact-banner.jpg'}")`
                  }}
                >
                  <h4>{config.siteSettings?.contactBannerTitle || 'Contáctanos'}</h4>
                  <p>{config.siteSettings?.contactBannerSubtitle || 'Estamos aquí para responder tus consultas y crear algo delicioso para ti'}</p>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-search"></i>
                <div>
                  <h3>SEO y Posicionamiento en Buscadores</h3>
                  <p>Controla cómo aparece tu pastelería en Google y cuando compartes el link en WhatsApp.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <div className="label-with-badge">
                    <label htmlFor="metaDescription">Meta Descripción (Google)</label>
                    <span className={`char-badge ${(config.siteSettings?.metaDescription?.length || 0) > 160 ? 'warning' : ''}`}>
                      {config.siteSettings?.metaDescription?.length || 0} / 160 caracteres
                    </span>
                  </div>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={config.siteSettings?.metaDescription || ''}
                    onChange={(e) => handleInputChange(e, 'siteSettings')}
                    rows="3"
                    placeholder="Pastelería artesanal en Mar del Plata. Tortas personalizadas, tartas y macarons."
                  ></textarea>
                  <small className="form-hint">Recomendado entre 140 y 160 caracteres para evitar que Google recorte el texto.</small>
                </div>
              </div>

              {/* Previsualización del snippet de Google */}
              <div className="google-preview-card">
                <span className="preview-label">Así se verá en los resultados de Google:</span>
                <div className="google-snippet">
                  <div className="snippet-url">https://madamepastel.com</div>
                  <div className="snippet-title">
                    {config.siteSettings?.homepageTitle || config.storeName || 'Madame Pastel'} — Pastelería Artesanal en Mar del Plata
                  </div>
                  <div className="snippet-desc">
                    {config.siteSettings?.metaDescription || 'Pastelería artesanal en Mar del Plata. Tortas personalizadas, tartas dulces y repostería para momentos especiales.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // Pestaña 3: Horarios de Atención
      case 'hours':
        return (
          <div className="settings-tab-content">
            <div className="settings-card">
              <div className="card-header-with-actions">
                <div className="card-header-info">
                  <i className="fas fa-clock"></i>
                  <div>
                    <h3>Horarios de Atención y Recepción</h3>
                    <p>Días y horarios en que el taller atiende consultas y elabora pedidos.</p>
                  </div>
                </div>
                
                {/* Atajos rápidos para la pastelera */}
                <div className="quick-actions-bar">
                  <button 
                    type="button" 
                    className="btn-quick-preset"
                    onClick={() => applyWeekdaySchedule('09:00', '18:00')}
                    title="Aplica 09:00 a 18:00 de Lunes a Viernes"
                  >
                    <i className="fas fa-magic"></i> Lun a Vie (9 a 18h)
                  </button>
                  <button 
                    type="button" 
                    className="btn-quick-preset secondary"
                    onClick={applyWeekendClosed}
                    title="Cierra Sábado y Domingo"
                  >
                    <i className="fas fa-store-slash"></i> Fines de semana cerrado
                  </button>
                </div>
              </div>

              <div className="business-hours-table">
                {Object.entries(config.businessHours || {}).map(([day, hours]) => {
                  const dayLabels = {
                    monday: 'Lunes',
                    tuesday: 'Martes',
                    wednesday: 'Miércoles',
                    thursday: 'Jueves',
                    friday: 'Viernes',
                    saturday: 'Sábado',
                    sunday: 'Domingo'
                  };

                  return (
                    <div key={day} className={`hours-row ${hours.closed ? 'is-closed' : 'is-open'}`}>
                      <div className="day-badge-col">
                        <span className="day-name-text">{dayLabels[day] || day}</span>
                      </div>

                      <div className="day-status-toggle">
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            name="closed"
                            checked={!hours.closed}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              handleInputChange({
                                target: { name: 'closed', value: !isChecked, type: 'checkbox', checked: !isChecked }
                              }, 'businessHours', day);
                            }}
                            aria-label={`Estado de atención día ${dayLabels[day]}`}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        <span className={`status-pill ${hours.closed ? 'pill-closed' : 'pill-open'}`}>
                          {hours.closed ? 'Cerrado' : 'Abierto'}
                        </span>
                      </div>

                      <div className="day-inputs-col">
                        {!hours.closed ? (
                          <div className="time-range-group">
                            <span className="time-label">De:</span>
                            <input
                              type="time"
                              name="open"
                              value={hours.open || '09:00'}
                              onChange={(e) => handleInputChange(e, 'businessHours', day)}
                              aria-label={`Hora de apertura ${dayLabels[day]}`}
                            />
                            <span className="time-separator">hasta:</span>
                            <input
                              type="time"
                              name="close"
                              value={hours.close || '18:00'}
                              onChange={(e) => handleInputChange(e, 'businessHours', day)}
                              aria-label={`Hora de cierre ${dayLabels[day]}`}
                            />
                          </div>
                        ) : (
                          <span className="closed-caption">Sin atención al público ni entregas programadas</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      // Pestaña 4: Envíos y Retiro
      case 'shipping':
        return (
          <div className="settings-tab-content">
            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-shopping-bag"></i>
                <div>
                  <h3>Retiro en Taller / Tienda</h3>
                  <p>Permite al cliente buscar su pedido directamente en Mar del Plata sin costo de envío.</p>
                </div>
              </div>

              <div className="method-switch-row">
                <div className="switch-info">
                  <strong>Habilitar opción de Retiro en Tienda</strong>
                  <span>El cliente verá la opción "Retiro en taller" durante el checkout.</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={config.deliveryOptions?.pickup?.enabled || false}
                    onChange={(e) => handleInputChange(e, 'deliveryOptions', 'pickup')}
                    aria-label="Habilitar retiro en tienda"
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {config.deliveryOptions?.pickup?.enabled && (
                <div className="dependent-settings-box">
                  <div className="form-group full-width">
                    <label htmlFor="pickupMessage">Instrucciones o mensaje para Retiro</label>
                    <textarea
                      id="pickupMessage"
                      name="message"
                      value={config.deliveryOptions?.pickup?.message || ''}
                      onChange={(e) => handleInputChange(e, 'deliveryOptions', 'pickup')}
                      rows="2"
                      placeholder="Coordinamos el horario exacto por WhatsApp. Dirección: Mar del Plata."
                    ></textarea>
                    <small className="form-hint">Este mensaje se muestra en el carrito y en la confirmación del pedido.</small>
                  </div>
                </div>
              )}
            </div>

            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-truck"></i>
                <div>
                  <h3>Envíos a Domicilio</h3>
                  <p>Tarifas, promociones de envío gratis y zonas de entrega.</p>
                </div>
              </div>

              <div className="method-switch-row">
                <div className="switch-info">
                  <strong>Habilitar Envíos a Domicilio</strong>
                  <span>Calcula o informa el costo de envío a los pedidos de los clientes.</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={config.deliveryOptions?.delivery?.enabled || false}
                    onChange={(e) => handleInputChange(e, 'deliveryOptions', 'delivery')}
                    aria-label="Habilitar envíos a domicilio"
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {config.deliveryOptions?.delivery?.enabled && (
                <div className="dependent-settings-box">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="deliveryFee">Costo Fijo de Envío ($)</label>
                      <div className="input-with-icon">
                        <i className="fas fa-dollar-sign"></i>
                        <input
                          type="number"
                          id="deliveryFee"
                          name="fee"
                          value={config.deliveryOptions?.delivery?.fee ?? 0}
                          onChange={(e) => handleInputChange(e, 'deliveryOptions', 'delivery')}
                          min="0"
                          placeholder="0"
                        />
                      </div>
                      <small className="form-hint">Si es $0, se informa que la cotización se confirma por WhatsApp.</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="freeOver">Envío Gratis a partir de ($)</label>
                      <div className="input-with-icon">
                        <i className="fas fa-gift"></i>
                        <input
                          type="number"
                          id="freeOver"
                          name="freeOver"
                          value={config.deliveryOptions?.delivery?.freeOver ?? 0}
                          onChange={(e) => handleInputChange(e, 'deliveryOptions', 'delivery')}
                          min="0"
                          placeholder="0"
                        />
                      </div>
                      <small className="form-hint">Establece 0 para no ofrecer envío gratis automático.</small>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="deliveryMessage">Mensaje informativo sobre las zonas de envío</label>
                      <textarea
                        id="deliveryMessage"
                        name="message"
                        value={config.deliveryOptions?.delivery?.message || ''}
                        onChange={(e) => handleInputChange(e, 'deliveryOptions', 'delivery')}
                        rows="2"
                        placeholder="Costo y zona de envío a confirmar por WhatsApp según ubicación en Mar del Plata."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // Pestaña 5: Pagos y Pedidos
      case 'payments':
        return (
          <div className="settings-tab-content">
            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-credit-card"></i>
                <div>
                  <h3>Métodos de Pago Aceptados</h3>
                  <p>Activa o desactiva las opciones de cobro para tus clientes.</p>
                </div>
              </div>

              {/* Mercado Pago */}
              <div className="payment-method-card">
                <div className="payment-method-top">
                  <div className="payment-icon-title">
                    <i className="fab fa-cc-visa text-brand"></i>
                    <div>
                      <h4>Mercado Pago</h4>
                      <p>Tarjetas de crédito, débito, dinero en cuenta y cuotas.</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={config.paymentOptions?.mercadoPago?.enabled || false}
                      onChange={(e) => handleInputChange(e, 'paymentOptions', 'mercadoPago')}
                      aria-label="Habilitar Mercado Pago"
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {config.paymentOptions?.mercadoPago?.enabled && (
                  <div className="integration-status-pill success">
                    <i className="fas fa-shield-alt"></i>
                    <span>Pasarela integrada y activa en el checkout de la tienda</span>
                  </div>
                )}
              </div>

              {/* Transferencia Bancaria */}
              <div className="payment-method-card">
                <div className="payment-method-top">
                  <div className="payment-icon-title">
                    <i className="fas fa-university text-brand"></i>
                    <div>
                      <h4>Transferencia Bancaria</h4>
                      <p>Permite a los clientes transferir a tu cuenta bancaria o billetera virtual.</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={config.paymentOptions?.bankTransfer?.enabled || false}
                      onChange={(e) => handleInputChange(e, 'paymentOptions', 'bankTransfer')}
                      aria-label="Habilitar Transferencia Bancaria"
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {config.paymentOptions?.bankTransfer?.enabled && (
                  <div className="bank-config-box">
                    <div className="mode-toggle-line">
                      <span>Formato de datos bancarios:</span>
                      <button
                        type="button"
                        className="btn-text-link"
                        onClick={() => setUseFreeformBank(!useFreeformBank)}
                      >
                        {useFreeformBank ? 'Usar campos guiados (Recomendado)' : 'Cambiar a texto libre'}
                      </button>
                    </div>

                    {!useFreeformBank ? (
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="bankName">Banco o Billetera</label>
                          <input
                            type="text"
                            id="bankName"
                            value={parseBankDetails(config.paymentOptions?.bankTransfer?.accountDetails).banco}
                            onChange={(e) => handleBankFieldChange('banco', e.target.value)}
                            placeholder="Ej. Banco Galicia / Mercado Pago"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="accountHolder">Titular de la Cuenta</label>
                          <input
                            type="text"
                            id="accountHolder"
                            value={parseBankDetails(config.paymentOptions?.bankTransfer?.accountDetails).titular}
                            onChange={(e) => handleBankFieldChange('titular', e.target.value)}
                            placeholder="Nombre completo o Razón Social"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="cbuNumber">CBU / CVU (22 dígitos)</label>
                          <input
                            type="text"
                            id="cbuNumber"
                            value={parseBankDetails(config.paymentOptions?.bankTransfer?.accountDetails).cbu}
                            onChange={(e) => handleBankFieldChange('cbu', e.target.value)}
                            placeholder="0000000000000000000000"
                            maxLength="22"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="accountAlias">Alias</label>
                          <input
                            type="text"
                            id="accountAlias"
                            value={parseBankDetails(config.paymentOptions?.bankTransfer?.accountDetails).alias}
                            onChange={(e) => handleBankFieldChange('alias', e.target.value)}
                            placeholder="ej. madame.pastel.mdp"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="form-group full-width">
                        <label htmlFor="accountDetails">Datos Bancarios (Texto libre)</label>
                        <textarea
                          id="accountDetails"
                          name="accountDetails"
                          value={config.paymentOptions?.bankTransfer?.accountDetails || ''}
                          onChange={(e) => handleInputChange(e, 'paymentOptions', 'bankTransfer')}
                          rows="4"
                          placeholder="Banco: ... | Titular: ... | CBU: ... | Alias: ..."
                        ></textarea>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Efectivo */}
              <div className="payment-method-card">
                <div className="payment-method-top">
                  <div className="payment-icon-title">
                    <i className="fas fa-money-bill-wave text-brand"></i>
                    <div>
                      <h4>Efectivo contra Entrega</h4>
                      <p>Cobro al momento de retirar en el taller o al recibir el pedido.</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={config.paymentOptions?.cashOnDelivery?.enabled || false}
                      onChange={(e) => handleInputChange(e, 'paymentOptions', 'cashOnDelivery')}
                      aria-label="Habilitar Efectivo contra entrega"
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Reglas de Pedidos */}
            <div className="settings-card">
              <div className="card-header">
                <i className="fas fa-birthday-cake"></i>
                <div>
                  <h3>Políticas y Reglas de Pedidos</h3>
                  <p>Anticipación de elaboración de tortas y montos mínimos de compra.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="preOrderDays">Días de Anticipación Mínima</label>
                  <div className="input-with-icon">
                    <i className="fas fa-calendar-alt"></i>
                    <input
                      type="number"
                      id="preOrderDays"
                      name="preOrderDays"
                      value={config.orderSettings?.preOrderDays ?? 3}
                      onChange={(e) => handleInputChange(e, 'orderSettings')}
                      min="0"
                      max="30"
                    />
                  </div>
                  <small className="form-hint">Días mínimos requeridos en el calendario para agendar tortas artesanales.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="minimumOrderAmount">Monto Mínimo de Pedido ($)</label>
                  <div className="input-with-icon">
                    <i className="fas fa-tag"></i>
                    <input
                      type="number"
                      id="minimumOrderAmount"
                      name="minimumOrderAmount"
                      value={config.orderSettings?.minimumOrderAmount ?? 0}
                      onChange={(e) => handleInputChange(e, 'orderSettings')}
                      min="0"
                    />
                  </div>
                  <small className="form-hint">Establece 0 para no exigir un monto mínimo de compra.</small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="orderNotificationEmail">Email para Notificaciones de Pedidos</label>
                  <div className="input-with-icon">
                    <i className="fas fa-inbox"></i>
                    <input
                      type="email"
                      id="orderNotificationEmail"
                      name="orderNotificationEmail"
                      value={config.orderSettings?.orderNotificationEmail || ''}
                      onChange={(e) => handleInputChange(e, 'orderSettings')}
                      placeholder="pedidos@madamepastel.com"
                    />
                  </div>
                  <small className="form-hint">A este correo llegarán los avisos inmediatos de cada compra confirmada.</small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="termsAndConditions">Términos y Condiciones de Pastelería</label>
                  <textarea
                    id="termsAndConditions"
                    name="termsAndConditions"
                    value={config.orderSettings?.termsAndConditions || ''}
                    onChange={(e) => handleInputChange(e, 'orderSettings')}
                    rows="4"
                    placeholder="Políticas de cancelación, señas para pedidos personalizados y refrigeración recomendada..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="pastry-spinner"></div>
        <p className="loading-text">Cargando configuración de Madame Pastel...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="admin-error-container">
        <div className="error-icon-box">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2>No pudimos cargar la configuración</h2>
        <p>{error || 'Hubo un inconveniente al conectar con el servidor.'}</p>
        <button className="btn-retry" onClick={() => window.location.reload()}>
          <i className="fas fa-redo"></i> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="admin-settings-layout">
      {/* Cabecera del Panel */}
      <header className="settings-page-header">
        <div className="header-titles">
          <h1>Configuración de la Tienda</h1>
          <p className="header-subtitle">
            Administra la identidad de marca, horarios, tarifas de envío y métodos de pago de Madame Pastel.
          </p>
        </div>

        {/* Botón de guardado rápido en cabecera */}
        <div className="header-actions">
          <button
            type="button"
            className={`btn-save-header ${isDirty ? 'has-unsaved' : ''}`}
            onClick={handleSaveConfig}
            disabled={saving || !isDirty}
            title={isDirty ? 'Guardar cambios (Ctrl+S)' : 'No hay cambios pendientes'}
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                <span>{isDirty ? 'Guardar Cambios' : 'Al día'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Contenedor Principal: Tabs + Contenido */}
      <div className="settings-main-wrapper">
        {/* Navegación lateral por dominios */}
        <nav className="settings-domain-nav" aria-label="Secciones de configuración">
          <button
            type="button"
            className={`nav-domain-item ${activeTab === 'brand' ? 'active' : ''}`}
            onClick={() => setActiveTab('brand')}
          >
            <i className="fas fa-store"></i>
            <div className="nav-item-text">
              <span className="nav-title">Marca y Tienda</span>
              <span className="nav-caption">Logo, colores y contacto</span>
            </div>
          </button>

          <button
            type="button"
            className={`nav-domain-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <i className="fas fa-globe"></i>
            <div className="nav-item-text">
              <span className="nav-title">Contenido y SEO</span>
              <span className="nav-caption">Portada y buscadores</span>
            </div>
          </button>

          <button
            type="button"
            className={`nav-domain-item ${activeTab === 'hours' ? 'active' : ''}`}
            onClick={() => setActiveTab('hours')}
          >
            <i className="fas fa-clock"></i>
            <div className="nav-item-text">
              <span className="nav-title">Horarios de Atención</span>
              <span className="nav-caption">Días y horas de apertura</span>
            </div>
          </button>

          <button
            type="button"
            className={`nav-domain-item ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            <i className="fas fa-truck"></i>
            <div className="nav-item-text">
              <span className="nav-title">Envíos y Retiro</span>
              <span className="nav-caption">Retiro en local y entregas</span>
            </div>
          </button>

          <button
            type="button"
            className={`nav-domain-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <i className="fas fa-credit-card"></i>
            <div className="nav-item-text">
              <span className="nav-title">Pagos y Pedidos</span>
              <span className="nav-caption">Mercado Pago, bancos y reglas</span>
            </div>
          </button>
        </nav>

        {/* Panel de Contenido de la pestaña */}
        <main className="settings-content-viewport">
          {renderTabContent()}
        </main>
      </div>

      {/* Barra Flotante de Guardado (ActionBar) al detectar cambios sin guardar */}
      {isDirty && (
        <aside className="floating-save-bar" aria-live="polite">
          <div className="floating-bar-info">
            <span className="dirty-indicator-dot"></span>
            <div className="dirty-texts">
              <strong>Tienes cambios sin guardar</strong>
              <small>Presiona guardar o usa el atajo Ctrl + S</small>
            </div>
          </div>
          <div className="floating-bar-actions">
            <button
              type="button"
              className="btn-discard"
              onClick={handleDiscardChanges}
              disabled={saving}
            >
              <i className="fas fa-undo"></i> Descartar
            </button>
            <button
              type="button"
              className="btn-save-floating"
              onClick={handleSaveConfig}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="btn-spinner white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default SettingsPage;
