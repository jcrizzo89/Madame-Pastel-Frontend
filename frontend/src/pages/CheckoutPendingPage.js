import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHourglassHalf, FaHome, FaWhatsapp } from 'react-icons/fa';
import '../styles/CheckoutResult.css';

const CheckoutPendingPage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="checkout-result-page pending">
      <div className="container">
        <div className="result-card">
          <div className="result-icon">
            <FaHourglassHalf />
          </div>
          <h1>Pago en Proceso</h1>
          
          <div className="result-message">
            <p>
              Tu pago está siendo procesado. Esto puede tomar unos minutos.
            </p>
            <p>
              Una vez que recibamos la confirmación del pago, procesaremos tu pedido y 
              te enviaremos un correo electrónico con los detalles.
            </p>
            <p>
              Si después de 24 horas no has recibido confirmación, por favor comunícate con nosotros:
            </p>
            <p className="contact-info">
              <strong>WhatsApp:</strong> (+54) 9 223 551-2021
            </p>
          </div>
          
          <div className="whatsapp-button">
            <a 
              href="https://wa.me/+5492235512021?text=Hola!%20Realicé%20un%20pedido%20y%20quiero%20consultar%20el%20estado%20del%20pago."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <FaWhatsapp /> Consultar Estado
            </a>
          </div>
          
          <div className="result-actions">
            <Link to="/" className="btn-primary">
              <FaHome /> Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPendingPage;
