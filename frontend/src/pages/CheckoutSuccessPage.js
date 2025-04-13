import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaWhatsapp } from 'react-icons/fa';
import '../styles/CheckoutResult.css';

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const { orderId, paymentMethod } = location.state || {};

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="checkout-result-page success">
      <div className="container">
        <div className="result-card">
          <div className="result-icon">
            <FaCheckCircle />
          </div>
          <h1>¡Pedido Confirmado!</h1>
          
          {orderId ? (
            <p className="order-number">Número de pedido: <strong>{orderId}</strong></p>
          ) : (
            <p className="order-number">Tu pedido ha sido registrado correctamente</p>
          )}
          
          <div className="result-message">
            <p>
              ¡Gracias por tu compra en Madame Pastel! Hemos recibido tu pedido y pronto comenzaremos a prepararlo.
            </p>
            
            {paymentMethod === 'transfer' ? (
              <div className="payment-instructions">
                <p>
                  <strong>Información importante sobre tu pago por transferencia:</strong>
                </p>
                <p>
                  Tu pedido ha sido registrado, pero no será procesado hasta que recibamos la confirmación
                  de tu transferencia bancaria. Por favor, envíanos una captura de la transferencia
                  a nuestro WhatsApp para agilizar el proceso.
                </p>
                <div className="whatsapp-button">
                  <a 
                    href="https://wa.me/+5492235512021?text=Hola!%20Acabo%20de%20realizar%20un%20pedido%20y%20quiero%20enviar%20el%20comprobante%20de%20transferencia."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                  >
                    <FaWhatsapp /> Enviar Comprobante
                  </a>
                </div>
              </div>
            ) : (
              <p>
                Te enviaremos un correo electrónico con los detalles de tu pedido y te notificaremos
                cuando esté listo para retirar o cuando se envíe, según la opción que hayas elegido.
              </p>
            )}
            
            <p>
              Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:
            </p>
            <p className="contact-info">
              <strong>WhatsApp:</strong> (+54) 9 223 551-2021
            </p>
          </div>
          
          <div className="result-actions">
            <Link to="/" className="btn-primary">
              Volver al inicio
            </Link>
            <Link to="/productos" className="btn-secondary">
              <FaShoppingBag /> Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
