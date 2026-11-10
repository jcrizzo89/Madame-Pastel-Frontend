import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { toast } from 'react-toastify';
import '../../styles/admin/SettingsPage.css';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState(null);
  
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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching configuration:", err);
        setError('Error al cargar la configuración');
        setLoading(false);
      }
    };

    fetchConfig();
  }, [token]);

  // Manejar cambios en los campos de formulario
  const handleInputChange = (e, section = null, subsection = null) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    if (section && subsection) {
      // Campo dentro de un subsección anidada
      setConfig({
        ...config,
        [section]: {
          ...config[section],
          [subsection]: {
            ...config[section][subsection],
            [name]: inputValue
          }
        }
      });
    } else if (section) {
      // Campo dentro de una sección
      setConfig({
        ...config,
        [section]: {
          ...config[section],
          [name]: inputValue
        }
      });
    } else {
      // Campo de nivel superior
      setConfig({
        ...config,
        [name]: inputValue
      });
    }
  };

  // Guardar configuración
  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      
      await axios.put(
        `${API_URL}/config/${config._id}`,
        config,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSaving(false);
      toast.success('Configuración guardada correctamente');
    } catch (err) {
      console.error("Error saving configuration:", err);
      setSaving(false);
      toast.error('Error al guardar la configuración');
    }
  };

  // Renderizar distintas secciones según la pestaña activa
  const renderTabContent = () => {
    if (!config) return null;

    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-tab-content">
            <div className="settings-section">
              <h3>Información General</h3>
              
              <div className="form-group">
                <label htmlFor="storeName">Nombre de la Tienda</label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={config.storeName}
                  onChange={(e) => handleInputChange(e)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="logoUrl">URL del Logo</label>
                <input
                  type="text"
                  id="logoUrl"
                  name="logoUrl"
                  value={config.logoUrl}
                  onChange={(e) => handleInputChange(e)}
                />
                {config.logoUrl && (
                  <div className="logo-preview">
                    <img src={config.logoUrl} alt="Logo preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="settings-section">
              <h3>Colores Principales</h3>
              
              <div className="form-group color-picker">
                <label htmlFor="primaryColor">Color Primario</label>
                <div className="color-inputs">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={config.primaryColor}
                    onChange={(e) => handleInputChange(e)}
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={config.primaryColor}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
              </div>
              
              <div className="form-group color-picker">
                <label htmlFor="secondaryColor">Color Secundario</label>
                <div className="color-inputs">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={config.secondaryColor}
                    onChange={(e) => handleInputChange(e)}
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={config.secondaryColor}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
              </div>
              
              <div className="color-preview">
                <div className="color-sample" style={{ backgroundColor: config.primaryColor }}>
                  <span style={{ color: '#fff' }}>Primario</span>
                </div>
                <div className="color-sample" style={{ backgroundColor: config.secondaryColor }}>
                  <span style={{ color: '#333' }}>Secundario</span>
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>SEO y Metadatos</h3>
              
              <div className="form-group">
                <label htmlFor="homepageTitle">Título de la Página Principal</label>
                <input
                  type="text"
                  id="homepageTitle"
                  name="homepageTitle"
                  value={config.siteSettings.homepageTitle}
                  onChange={(e) => handleInputChange(e, 'siteSettings')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="homepageDescription">Descripción de la Página Principal</label>
                <textarea
                  id="homepageDescription"
                  name="homepageDescription"
                  value={config.siteSettings.homepageDescription}
                  onChange={(e) => handleInputChange(e, 'siteSettings')}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="homepageAboutTitle">Título de la sección Nuestra propuesta</label>
                <input
                  type="text"
                  id="homepageAboutTitle"
                  name="homepageAboutTitle"
                  value={config.siteSettings.homepageAboutTitle || ''}
                  onChange={(e) => handleInputChange(e, 'siteSettings')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="homepageAboutDescription">Texto de la sección Nuestra propuesta</label>
                <textarea
                  id="homepageAboutDescription"
                  name="homepageAboutDescription"
                  value={config.siteSettings.homepageAboutDescription || ''}
                  onChange={(e) => handleInputChange(e, 'siteSettings')}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="metaDescription">Meta Descripción</label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={config.siteSettings.metaDescription}
                  onChange={(e) => handleInputChange(e, 'siteSettings')}
                  rows="3"
                ></textarea>
                <small>Descripción que aparecerá en los resultados de búsqueda</small>
              </div>
            </div>
          </div>
        );
        
      case 'social':
        return (
          <div className="settings-tab-content">
            <div className="settings-section">
              <h3>Redes Sociales</h3>
              
              <div className="form-group">
                <label htmlFor="instagram">Instagram</label>
                <div className="input-with-icon">
                  <i className="fab fa-instagram"></i>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={config.socialLinks.instagram}
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
                    value={config.socialLinks.facebook}
                    onChange={(e) => handleInputChange(e, 'socialLinks')}
                    placeholder="https://www.facebook.com/madamepastel"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp</label>
                <div className="input-with-icon">
                  <i className="fab fa-whatsapp"></i>
                  <input
                    type="text"
                    id="whatsapp"
                    name="whatsapp"
                    value={config.socialLinks.whatsapp}
                    onChange={(e) => handleInputChange(e, 'socialLinks')}
                    placeholder="https://wa.me/5492235123456"
                  />
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Información de Contacto</h3>
              
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={config.contactInfo.phone}
                  onChange={(e) => handleInputChange(e, 'contactInfo')}
                  placeholder="+54 9 223 123-4567"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={config.contactInfo.email}
                  onChange={(e) => handleInputChange(e, 'contactInfo')}
                  placeholder="info@madamepastel.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <textarea
                  id="address"
                  name="address"
                  value={config.contactInfo.address}
                  onChange={(e) => handleInputChange(e, 'contactInfo')}
                  rows="2"
                  placeholder="Mar del Plata, Argentina"
                ></textarea>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Horarios de Atención</h3>
              
              {Object.entries(config.businessHours).map(([day, hours]) => {
                const dayNames = {
                  monday: 'Lunes',
                  tuesday: 'Martes',
                  wednesday: 'Miércoles',
                  thursday: 'Jueves',
                  friday: 'Viernes',
                  saturday: 'Sábado',
                  sunday: 'Domingo'
                };
                
                return (
                  <div key={day} className="business-hours-row">
                    <div className="day-name">{dayNames[day]}</div>
                    
                    <div className="hours-controls">
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="closed"
                          checked={hours.closed}
                          onChange={(e) => handleInputChange(e, 'businessHours', day)}
                        />
                        <span className="slider round"></span>
                      </label>
                      <span className="status-text">
                        {hours.closed ? 'Cerrado' : 'Abierto'}
                      </span>
                      
                      {!hours.closed && (
                        <div className="hours-inputs">
                          <input
                            type="time"
                            name="open"
                            value={hours.open}
                            onChange={(e) => handleInputChange(e, 'businessHours', day)}
                            disabled={hours.closed}
                          />
                          <span>a</span>
                          <input
                            type="time"
                            name="close"
                            value={hours.close}
                            onChange={(e) => handleInputChange(e, 'businessHours', day)}
                            disabled={hours.closed}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
        
      case 'shipping':
        return (
          <div className="settings-tab-content">
            <div className="settings-section">
              <h3>Opciones de Retiro en Tienda</h3>
              
              <div className="form-group switch-group">
                <label>Habilitar Retiro en Tienda</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={config.deliveryOptions.pickup.enabled}
                    onChange={(e) => handleInputChange(e, 'deliveryOptions', 'pickup')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              
              <div className="form-group">
                <label htmlFor="pickupMessage">Mensaje para Retiro en Tienda</label>
                <textarea
                  id="pickupMessage"
                  name="message"
                  value={config.deliveryOptions.pickup.message}
                  onChange={(e) => handleInputChange(e, 'deliveryOptions', 'pickup')}
                  rows="2"
                  disabled={!config.deliveryOptions.pickup.enabled}
                ></textarea>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Opciones de Envío a Domicilio</h3>
              
              <div className="form-group switch-group">
                <label>Habilitar Envío a Domicilio</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={config.deliveryOptions.delivery.enabled}
                    onChange={(e) => handleInputChange(e, 'deliveryOptions', 'delivery')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              
              <div className="form-group">
                <label htmlFor="deliveryFee">Costo de Envío ($)</label>
                <input
                  type="number"
                  id="deliveryFee"
                  name="fee"
                  value={config.deliveryOptions.delivery.fee}
                  onChange={(e) => handleInputChange(e, 'deliveryOptions', 'delivery')}
                  min="0"
                  disabled={!config.deliveryOptions.delivery.enabled}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="freeOver">Envío Gratis a partir de ($)</label>
                <input
                  type="number"
                  id="freeOver"
                  name="freeOver"
                  value={config.deliveryOptions.delivery.freeOver}
                  onChange={(e) => handleInputChange(e, 'deliveryOptions', 'delivery')}
                  min="0"
                  disabled={!config.deliveryOptions.delivery.enabled}
                />
                <small>Establece 0 para nunca ofrecer envío gratis</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="deliveryMessage">Mensaje para Envío a Domicilio</label>
                <textarea
                  id="deliveryMessage"
                  name="message"
                  value={config.deliveryOptions.delivery.message}
                  onChange={(e) => handleInputChange(e, 'deliveryOptions', 'delivery')}
                  rows="2"
                  disabled={!config.deliveryOptions.delivery.enabled}
                ></textarea>
              </div>
            </div>
          </div>
        );
        
      case 'payment':
        return (
          <div className="settings-tab-content">
            <div className="settings-section">
              <h3>Métodos de Pago</h3>
              
              <div className="payment-method">
                <div className="payment-method-header">
                  <div className="payment-method-title">
                    <i className="fab fa-cc-visa"></i>
                    <h4>Mercado Pago</h4>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={config.paymentOptions.mercadoPago.enabled}
                      onChange={(e) => handleInputChange(e, 'paymentOptions', 'mercadoPago')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <p className="payment-method-description">
                  Permite a tus clientes pagar con tarjetas de crédito, débito y otros métodos a través de Mercado Pago.
                </p>
                {config.paymentOptions.mercadoPago.enabled && (
                  <div className="payment-method-note">
                    <p>
                      Nota: La configuración de Mercado Pago se realiza en el archivo .env del backend.
                      Contacta al administrador del sistema para actualizar tus credenciales.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="payment-method">
                <div className="payment-method-header">
                  <div className="payment-method-title">
                    <i className="fas fa-university"></i>
                    <h4>Transferencia Bancaria</h4>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={config.paymentOptions.bankTransfer.enabled}
                      onChange={(e) => handleInputChange(e, 'paymentOptions', 'bankTransfer')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <p className="payment-method-description">
                  Permite a tus clientes pagar mediante transferencia bancaria.
                </p>
                {config.paymentOptions.bankTransfer.enabled && (
                  <div className="form-group">
                    <label htmlFor="accountDetails">Datos Bancarios</label>
                    <textarea
                      id="accountDetails"
                      name="accountDetails"
                      value={config.paymentOptions.bankTransfer.accountDetails}
                      onChange={(e) => handleInputChange(e, 'paymentOptions', 'bankTransfer')}
                      rows="4"
                      placeholder="Banco: | Titular: | CBU: | Alias:"
                    ></textarea>
                  </div>
                )}
              </div>
              
              <div className="payment-method">
                <div className="payment-method-header">
                  <div className="payment-method-title">
                    <i className="fas fa-money-bill"></i>
                    <h4>Efectivo en Entrega</h4>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={config.paymentOptions.cashOnDelivery.enabled}
                      onChange={(e) => handleInputChange(e, 'paymentOptions', 'cashOnDelivery')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <p className="payment-method-description">
                  Permite a tus clientes pagar en efectivo al momento de recibir su pedido.
                </p>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Configuración de Pedidos</h3>
              
              <div className="form-group">
                <label htmlFor="minimumOrderAmount">Monto Mínimo de Pedido ($)</label>
                <input
                  type="number"
                  id="minimumOrderAmount"
                  name="minimumOrderAmount"
                  value={config.orderSettings.minimumOrderAmount}
                  onChange={(e) => handleInputChange(e, 'orderSettings')}
                  min="0"
                />
                <small>Establece 0 para no requerir un monto mínimo</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="preOrderDays">Días de Anticipación para Pedidos</label>
                <input
                  type="number"
                  id="preOrderDays"
                  name="preOrderDays"
                  value={config.orderSettings.preOrderDays}
                  onChange={(e) => handleInputChange(e, 'orderSettings')}
                  min="0"
                />
                <small>Cuántos días de anticipación requieres para preparar pedidos especiales</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="orderNotificationEmail">Email para Notificaciones de Pedidos</label>
                <input
                  type="email"
                  id="orderNotificationEmail"
                  name="orderNotificationEmail"
                  value={config.orderSettings.orderNotificationEmail}
                  onChange={(e) => handleInputChange(e, 'orderSettings')}
                  placeholder="pedidos@madamepastel.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="termsAndConditions">Términos y Condiciones</label>
                <textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  value={config.orderSettings.termsAndConditions}
                  onChange={(e) => handleInputChange(e, 'orderSettings')}
                  rows="6"
                ></textarea>
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
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando configuración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="admin-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>No se pudo cargar la configuración</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-page-header">
        <h1>Configuración</h1>
        <button 
          className="admin-save-button"
          onClick={handleSaveConfig}
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="small-spinner"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="fas fa-cog"></i>
            <span>General</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            <i className="fas fa-share-alt"></i>
            <span>Social y Contacto</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            <i className="fas fa-truck"></i>
            <span>Envíos</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <i className="fas fa-credit-card"></i>
            <span>Pagos y Pedidos</span>
          </button>
        </div>

        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
