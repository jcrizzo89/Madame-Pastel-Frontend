import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import '../styles/CheckoutPage.css';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';
import { API_URL } from '../utils/constants';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { config } = useConfig();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    deliveryOption: 'pickup', // pickup o delivery
    deliveryDate: '',
    deliveryTime: '',
    paymentMethod: 'mercadopago', // mercadopago, transfer o cashOnDelivery
    transferDetails: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  
  // Calcular costo de envío según la configuración
  const deliveryFee = formData.deliveryOption === 'delivery' 
    ? (cart.totalAmount >= (config?.deliveryOptions?.delivery?.freeOver || 5000) 
        ? 0 
        : (config?.deliveryOptions?.delivery?.fee || 500))
    : 0;
  
  // Total final con envío incluido
  const finalTotal = cart.totalAmount + deliveryFee;

  useEffect(() => {
    // Inicializar Mercado Pago con la clave pública
    initMercadoPago('TEST-123e5e81-a619-441f-af9a-b44e7ea9ff25');
  }, []);

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/carrito');
    }
    
    // Establecer valores predeterminados según la configuración
    if (config) {
      // Si pickup está deshabilitado, configurar delivery como predeterminado
      if (config.deliveryOptions?.pickup?.enabled === false && 
          config.deliveryOptions?.delivery?.enabled === true) {
        setFormData(prev => ({ ...prev, deliveryOption: 'delivery' }));
      }
      
      // Si mercadoPago está deshabilitado, configurar transferencia como predeterminado
      if (config.paymentOptions?.mercadoPago?.enabled === false &&
          config.paymentOptions?.bankTransfer?.enabled === true) {
        setFormData(prev => ({ ...prev, paymentMethod: 'transfer' }));
      }
    }
  }, [cart, navigate, config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Limpiar error cuando el usuario comienza a corregir el campo
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validaciones básicas
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.email.trim()) errors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email inválido';
    if (!formData.phone.trim()) errors.phone = 'El teléfono es requerido';
    
    // Si es delivery, validar dirección
    if (formData.deliveryOption === 'delivery') {
      if (!formData.address.trim()) errors.address = 'La dirección es requerida para delivery';
      if (!formData.city.trim()) errors.city = 'La ciudad es requerida para delivery';
      if (!formData.zipCode.trim()) errors.zipCode = 'El código postal es requerido para delivery';
    }
    
    // Validar fecha y hora de entrega
    if (!formData.deliveryDate) errors.deliveryDate = 'La fecha de entrega es requerida';
    if (!formData.deliveryTime) errors.deliveryTime = 'La hora de entrega es requerida';
    
    // Si es transferencia, validar que ingresó los detalles
    if (formData.paymentMethod === 'transfer' && !formData.transferDetails.trim()) {
      errors.transferDetails = 'Por favor ingrese los detalles de la transferencia';
    }
    
    // Verificar monto mínimo de pedido desde la configuración
    const minimumOrderAmount = config?.orderSettings?.minimumOrderAmount || 0;
    if (cart.totalAmount < minimumOrderAmount) {
      errors.orderAmount = `El monto mínimo de pedido es $${minimumOrderAmount}`;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createOrder = async () => {
    try {
      // Si el backend no está disponible, simulamos una respuesta
      return 'ORDER_' + Math.floor(Math.random() * 1000000);
      
      /*
      const orderData = {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.deliveryOption === 'delivery' ? {
            street: formData.address,
            city: formData.city,
            zipCode: formData.zipCode
          } : null
        },
        products: cart.items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: cart.totalAmount,
        deliveryFee: deliveryFee,
        finalTotal: finalTotal,
        deliveryOption: formData.deliveryOption,
        deliveryDateTime: `${formData.deliveryDate} ${formData.deliveryTime}`,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        status: 'pending'
      };

      const response = await axios.post(`${API_URL}/orders`, orderData);
      return response.data._id;
      */
    } catch (error) {
      console.error('Error al crear la orden:', error);
      throw error;
    }
  };

  const createPaymentPreference = async (orderId) => {
    try {
      return "TEST-123456789";
      
      /*
      const response = await axios.post(`${API_URL}/payments/preference`, {
        orderId,
        items: cart.items.map(item => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price
        })),
        deliveryFee,
        finalTotal
      });
      return response.data.id;
      */
    } catch (error) {
      console.error('Error al crear preferencia de pago:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll al primer error
      const firstErrorField = Object.keys(formErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Crear la orden
      const newOrderId = await createOrder();
      setOrderId(newOrderId);
      
      // 2. Si el método de pago es Mercado Pago, crear preferencia
      if (formData.paymentMethod === 'mercadopago') {
        const prefId = await createPaymentPreference(newOrderId);
        setPreferenceId(prefId);
      } else {
        // Si es otro método, redirigir a página de éxito
        clearCart();
        navigate('/checkout/success', { 
          state: { 
            orderId: newOrderId,
            paymentMethod: formData.paymentMethod
          } 
        });
      }
    } catch (error) {
      console.error('Error en el proceso de checkout:', error);
      // Mostrar mensaje de error
    } finally {
      setLoading(false);
    }
  };
  
  // Colores desde la configuración
  const primaryColor = config?.primaryColor || '#d94f70';
  
  // Estilos dinámicos
  const styles = {
    button: {
      backgroundColor: primaryColor,
      borderColor: primaryColor,
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Finalizar Compra</h1>
        
        {cart.items.length === 0 ? (
          <div className="empty-cart-message">
            <p>No hay productos en tu carrito.</p>
            <button 
              onClick={() => navigate('/productos')}
              className="btn"
            >
              Ver Productos
            </button>
          </div>
        ) : (
          <div className="checkout-grid">
            <div className="checkout-form-container">
              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-section">
                  <h2>Datos de Contacto</h2>
                  <div className="form-group">
                    <label htmlFor="name">Nombre Completo <span className="required">*</span></label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                    />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email <span className="required">*</span></label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      />
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Teléfono <span className="required">*</span></label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                      />
                      {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h2>Método de Entrega</h2>
                  <div className="delivery-options">
                    {/* Opción de retiro en tienda - mostrar solo si está habilitado en la configuración */}
                    {config?.deliveryOptions?.pickup?.enabled !== false && (
                      <div className="delivery-option">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            id="pickup" 
                            name="deliveryOption" 
                            value="pickup" 
                            checked={formData.deliveryOption === 'pickup'} 
                            onChange={handleChange} 
                            className="form-check-input"
                          />
                          <label htmlFor="pickup">Retiro en Tienda</label>
                          {config?.deliveryOptions?.pickup?.message && (
                            <p className="delivery-message">{config.deliveryOptions.pickup.message}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Opción de envío a domicilio - mostrar solo si está habilitado en la configuración */}
                    {config?.deliveryOptions?.delivery?.enabled !== false && (
                      <div className="delivery-option">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            id="delivery" 
                            name="deliveryOption" 
                            value="delivery" 
                            checked={formData.deliveryOption === 'delivery'} 
                            onChange={handleChange} 
                            className="form-check-input"
                          />
                          <label htmlFor="delivery">Envío a Domicilio</label>
                          <div className="delivery-info">
                            <p className="delivery-fee">
                              {cart.totalAmount >= (config?.deliveryOptions?.delivery?.freeOver || 5000) 
                                ? 'Envío gratis' 
                                : `Costo de envío: $${config?.deliveryOptions?.delivery?.fee || 500}`}
                            </p>
                            {config?.deliveryOptions?.delivery?.message && (
                              <p className="delivery-message">{config.deliveryOptions.delivery.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Campos de dirección - Solo mostrar si la opción de envío está seleccionada */}
                  {formData.deliveryOption === 'delivery' && (
                    <div className="address-fields">
                      <div className="form-group">
                        <label htmlFor="address">Dirección <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="address" 
                          name="address" 
                          value={formData.address} 
                          onChange={handleChange} 
                          className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                        />
                        {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="city">Ciudad <span className="required">*</span></label>
                          <input 
                            type="text" 
                            id="city" 
                            name="city" 
                            value={formData.city} 
                            onChange={handleChange} 
                            className={`form-control ${formErrors.city ? 'is-invalid' : ''}`}
                          />
                          {formErrors.city && <div className="invalid-feedback">{formErrors.city}</div>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="zipCode">Código Postal <span className="required">*</span></label>
                          <input 
                            type="text" 
                            id="zipCode" 
                            name="zipCode" 
                            value={formData.zipCode} 
                            onChange={handleChange} 
                            className={`form-control ${formErrors.zipCode ? 'is-invalid' : ''}`}
                          />
                          {formErrors.zipCode && <div className="invalid-feedback">{formErrors.zipCode}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-section">
                  <h2>Fecha y Hora de Entrega</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="deliveryDate">Fecha <span className="required">*</span></label>
                      <input 
                        type="date" 
                        id="deliveryDate" 
                        name="deliveryDate" 
                        value={formData.deliveryDate} 
                        onChange={handleChange} 
                        className={`form-control ${formErrors.deliveryDate ? 'is-invalid' : ''}`}
                        min={new Date(Date.now() + (config?.orderSettings?.preOrderDays || 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      />
                      {formErrors.deliveryDate && <div className="invalid-feedback">{formErrors.deliveryDate}</div>}
                      <small className="form-text text-muted">
                        Necesitamos mínimo {config?.orderSettings?.preOrderDays || 2} días de anticipación para preparar tu pedido.
                      </small>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="deliveryTime">Hora <span className="required">*</span></label>
                      <input 
                        type="time" 
                        id="deliveryTime" 
                        name="deliveryTime" 
                        value={formData.deliveryTime} 
                        onChange={handleChange} 
                        className={`form-control ${formErrors.deliveryTime ? 'is-invalid' : ''}`}
                      />
                      {formErrors.deliveryTime && <div className="invalid-feedback">{formErrors.deliveryTime}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h2>Método de Pago</h2>
                  <div className="payment-options">
                    {/* Opción de Mercado Pago - mostrar solo si está habilitado en la configuración */}
                    {config?.paymentOptions?.mercadoPago?.enabled !== false && (
                      <div className="payment-option">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            id="mercadopago" 
                            name="paymentMethod" 
                            value="mercadopago" 
                            checked={formData.paymentMethod === 'mercadopago'} 
                            onChange={handleChange} 
                            className="form-check-input"
                          />
                          <label htmlFor="mercadopago">Mercado Pago</label>
                        </div>
                      </div>
                    )}
                    
                    {/* Opción de Transferencia Bancaria - mostrar solo si está habilitado en la configuración */}
                    {config?.paymentOptions?.bankTransfer?.enabled !== false && (
                      <div className="payment-option">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            id="transfer" 
                            name="paymentMethod" 
                            value="transfer" 
                            checked={formData.paymentMethod === 'transfer'} 
                            onChange={handleChange} 
                            className="form-check-input"
                          />
                          <label htmlFor="transfer">Transferencia Bancaria</label>
                        </div>
                      </div>
                    )}
                    
                    {/* Opción de Efectivo al Entregar - solo mostrar si está habilitado y el método de entrega es delivery */}
                    {config?.paymentOptions?.cashOnDelivery?.enabled !== false && formData.deliveryOption === 'delivery' && (
                      <div className="payment-option">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            id="cashOnDelivery" 
                            name="paymentMethod" 
                            value="cashOnDelivery" 
                            checked={formData.paymentMethod === 'cashOnDelivery'} 
                            onChange={handleChange} 
                            className="form-check-input"
                          />
                          <label htmlFor="cashOnDelivery">Efectivo al Entregar</label>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {formData.paymentMethod === 'transfer' && (
                    <div className="form-group">
                      <label htmlFor="transferDetails">Detalles de la Transferencia <span className="required">*</span></label>
                      <textarea 
                        id="transferDetails" 
                        name="transferDetails" 
                        value={formData.transferDetails} 
                        onChange={handleChange} 
                        className={`form-control ${formErrors.transferDetails ? 'is-invalid' : ''}`} 
                        placeholder="Nombre del titular, último 4 dígitos de la cuenta, fecha de transferencia"
                      ></textarea>
                      {formErrors.transferDetails && <div className="invalid-feedback">{formErrors.transferDetails}</div>}
                      <div className="transfer-info">
                        <p>Datos para transferencia:</p>
                        {config?.paymentOptions?.bankTransfer?.accountDetails ? (
                          <div dangerouslySetInnerHTML={{ __html: config.paymentOptions.bankTransfer.accountDetails.replace(/\n/g, '<br>') }} />
                        ) : (
                          <>
                            <p><strong>Banco:</strong> Banco Nación</p>
                            <p><strong>Titular:</strong> Madame Pastel</p>
                            <p><strong>CBU:</strong> 0110123456789012345678</p>
                            <p><strong>Alias:</strong> MADAME.PASTEL</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-section">
                  <h2>Notas Adicionales</h2>
                  <div className="form-group">
                    <label htmlFor="notes">¿Alguna indicación especial?</label>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleChange} 
                      className="form-control"
                      placeholder="Instrucciones adicionales, alergias, mensajes para tarjetas, etc."
                    ></textarea>
                  </div>
                </div>
                
                {/* Términos y condiciones */}
                {config?.orderSettings?.termsAndConditions && (
                  <div className="form-section terms-section">
                    <h2>Términos y Condiciones</h2>
                    <div className="terms-container">
                      <div dangerouslySetInnerHTML={{ 
                        __html: config.orderSettings.termsAndConditions.replace(/\n/g, '<br>') 
                      }} />
                    </div>
                  </div>
                )}
                
                {formErrors.orderAmount && (
                  <div className="alert alert-danger">{formErrors.orderAmount}</div>
                )}
                
                {!preferenceId && (
                  <button 
                    type="submit" 
                    className="btn-primary checkout-button"
                    disabled={loading}
                    style={styles.button}
                  >
                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
                  </button>
                )}
              </form>
              
              {preferenceId && (
                <div className="mercadopago-container">
                  <h3>Finaliza tu pago con Mercado Pago</h3>
                  <div id="wallet_container">
                    <Wallet 
                      initialization={{ preferenceId }} 
                      customization={{ texts: { valueProp: 'smart_option' } }} 
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="order-summary">
              <h2>Resumen del Pedido</h2>
              <div className="cart-items">
                {cart.items.map(item => (
                  <div key={item.id} className="cart-item-summary">
                    <div className="item-summary-details">
                      <span className="item-summary-name">{item.name}</span>
                      <span className="item-summary-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-summary-price">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              {formData.deliveryOption === 'delivery' && (
                <div className="delivery-fee-line">
                  <span>Costo de envío</span>
                  <span>
                    {deliveryFee === 0 
                      ? 'Gratis' 
                      : `$${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
              )}
              
              <div className="order-total">
                <div className="total-line">
                  <span>Total</span>
                  <span className="total-price">${finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
