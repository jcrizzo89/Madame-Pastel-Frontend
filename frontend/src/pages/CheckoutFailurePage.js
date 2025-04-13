import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle, FaShoppingCart, FaWhatsapp } from 'react-icons/fa';
import '../styles/CheckoutResult.css';

const CheckoutFailurePage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="checkout-result-page failure">
      <div className="container">
        <div className="result-card">
          <div className="result-icon">
            <FaTimesCircle />
          </div>
          <h1>Hubo un problema con tu pago</h1>
          
          <div className="result-message">
            <p>
              Lo sentimos, pero ha ocurrido un problema al procesar tu pago. No te preocupes, 
              no se ha realizado ningún cargo en tu cuenta.
            </p>
            <p>
              Puedes intentar nuevamente o elegir otro método de pago. Si el problema persiste, 
              por favor contáctanos directamente.
            </p>
            <p>
              Nuestro equipo está disponible para ayudarte a resolver cualquier inconveniente:
            </p>
            <p className="contact-info">
              <strong>WhatsApp:</strong> (+54) 9 223 551-2021
            </p>
          </div>
          
          <div className="whatsapp-button">
            <a 
              href="https://wa.me/+5492235512021?text=Hola!%20Tuve%20un%20problema%20con%20mi%20pago%20en%20la%20web.%20¿Podrían%20ayudarme?"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <FaWhatsapp /> Contactar por WhatsApp
            </a>
          </div>
          
          <div className="result-actions">
            <Link to="/checkout" className="btn-primary">
              <FaShoppingCart /> Intentar nuevamente
            </Link>
            <Link to="/" className="btn-secondary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailurePage;
