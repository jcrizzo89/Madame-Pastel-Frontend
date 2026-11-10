import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { API_URL } from '../utils/constants';
import { buildWhatsAppOrderMessage, buildWhatsAppOrderUrl } from '../utils/whatsappOrder';
import { formatARS } from '../data/customCake';
import '../styles/CheckoutPage.css';

const DEFAULT_WHATSAPP = '5492235512021';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { config } = useConfig();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Mar del Plata',
    zipCode: '',
    deliveryDate: '',
    deliveryTime: '',
    paymentMethod: 'mercadopago',
    notes: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!cart.items.length) {
    return (
      <div className="checkout-page container">
        <h1>Tu carrito está vacío</h1>
        <p>No tenés productos agregados para coordinar la entrega.</p>
        <Link to="/productos" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Ver productos
        </Link>
      </div>
    );
  }

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleWhatsAppPayment = () => {
    const phone = config?.socialLinks?.whatsapp || config?.contactInfo?.phone || DEFAULT_WHATSAPP;
    const message = buildWhatsAppOrderMessage({ formData, cart });
    const targetUrl = buildWhatsAppOrderUrl(phone, message);

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    clearCart();
  };

  const handleMercadoPagoPayment = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Guardar la orden en la base de datos
      const orderPayload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city} (CP: ${formData.zipCode})`
        },
        products: cart.items.map((item) => ({
          productId: item.id || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        paymentMethod: 'mercadopago',
        pickupDate: formData.deliveryDate || new Date().toISOString(),
        notes: formData.notes
      };

      const orderRes = await axios.post(`${API_URL}/orders`, orderPayload);
      const createdOrder = orderRes.data;

      // 2. Generar la preferencia de pago en Mercado Pago
      const prefRes = await axios.post(`${API_URL}/payments/preference`, {
        orderId: createdOrder._id || createdOrder.id
      });

      if (prefRes.data && prefRes.data.initPoint) {
        clearCart();
        window.location.href = prefRes.data.initPoint;
        return;
      }

      throw new Error('No se recibió la URL de pago de Mercado Pago');
    } catch (err) {
      console.warn('Mercado Pago no disponible, activando WhatsApp fallback:', err);
      setErrorMsg(
        'El cobro automático directo con tarjeta no está activo en este momento. Te derivamos a WhatsApp para confirmar tu pedido y coordinar el pago sin perder tus datos.'
      );
      setIsProcessing(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.paymentMethod === 'mercadopago') {
      handleMercadoPagoPayment();
    } else {
      handleWhatsAppPayment();
    }
  };

  const minDeliveryDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];

  const fields = [
    { name: 'name', label: 'Nombre y apellido', type: 'text', required: true },
    { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
    { name: 'phone', label: 'Tu teléfono / WhatsApp', type: 'tel', required: true },
    { name: 'address', label: 'Dirección de entrega', type: 'text', required: true },
    { name: 'city', label: 'Localidad', type: 'text', required: false },
    { name: 'zipCode', label: 'Código postal', type: 'text', required: false },
    { name: 'deliveryDate', label: 'Fecha solicitada de entrega (mínimo 48 hs de anticipación)', type: 'date', required: true },
    { name: 'deliveryTime', label: 'Horario preferido', type: 'time', required: false }
  ];

  return (
    <div className="checkout-page container">
      <h1>Finalizar Pedido</h1>
      <p>Completá tus datos de entrega y elegí tu medio de pago preferido.</p>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Resumen del pedido</h2>
            <div className="checkout-items">
              {cart.items.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <strong>{formatARS(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <p>
              <strong>Subtotal de productos: {formatARS(cart.totalAmount)}</strong>
            </p>
            <p style={{ color: '#777', fontSize: '0.9rem' }}>
              El costo de envío se confirma según la zona de entrega en Mar del Plata.
            </p>
          </div>

          <div className="form-section">
            <h2>Datos de entrega y contacto</h2>
            <div className="checkout-fields">
              {fields.map(({ name, label, type, required }) => (
                <label key={name}>
                  {label} {required && <span aria-hidden="true" style={{ color: '#c94860' }}>*</span>}
                  <input
                    name={name}
                    type={type}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    min={name === 'deliveryDate' ? minDeliveryDate : undefined}
                  />
                </label>
              ))}

              <label>
                Medio de pago
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                  <option value="mercadopago">Mercado Pago (Tarjeta de Crédito / Débito / Dinero en cuenta)</option>
                  <option value="transfer">Transferencia bancaria directa</option>
                  <option value="cashOnDelivery">Efectivo contra entrega</option>
                </select>
              </label>

              <label className="checkout-wide">
                Notas adicionales o dedicatoria
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Detalles del timbre, horario especial o dedicatoria personalizada"
                />
              </label>
            </div>
          </div>

          {errorMsg && (
            <div
              style={{
                background: '#fff2f4',
                border: '1px solid #f8c2cc',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1rem 0',
                color: '#8b2034'
              }}
              role="alert"
            >
              <p style={{ margin: 0, marginBottom: '0.6rem' }}>{errorMsg}</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleWhatsAppPayment}
                style={{ cursor: 'pointer' }}
              >
                Continuar por WhatsApp ahora
              </button>
            </div>
          )}

          <button
            className="btn btn-primary checkout-button"
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing
              ? 'Procesando pago...'
              : formData.paymentMethod === 'mercadopago'
              ? 'Pagar con Mercado Pago'
              : 'Continuar por WhatsApp'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
