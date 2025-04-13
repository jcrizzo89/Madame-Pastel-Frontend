import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import '../styles/PromotionsPage.css';

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        
        // Obtener productos en promoción desde la API
        const response = await axios.get(`${API_URL}/products/promotions`);
        
        if (response.data && response.data.length > 0) {
          // Formatear los datos para mostrarlos correctamente
          const formattedPromotions = response.data.map(product => {
            const discountPrice = product.isPromotion || product.seasonalPromotion 
              ? product.price * (1 - (product.discountPercentage / 100)) 
              : product.price;
              
            return {
              id: product._id,
              name: product.name,
              description: product.description,
              price: product.price,
              discountPrice: parseFloat(discountPrice.toFixed(2)),
              image: product.image || 'https://via.placeholder.com/600x400',
              category: product.category,
              discountPercentage: product.discountPercentage
            };
          });
          
          setPromotions(formattedPromotions);
        } else {
          setPromotions([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setError('No pudimos cargar las promociones. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };
    
    fetchPromotions();
  }, []);

  return (
    <div className="promotions-page">
      <div className="promotions-banner">
        <div className="container">
          <h1>Promociones Especiales</h1>
          <p>Aprovecha nuestras ofertas y promociones exclusivas</p>
        </div>
      </div>
      
      <div className="container">
        {loading ? (
          <p className="loading-message">Cargando promociones...</p>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn">
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <>
            {promotions.length > 0 ? (
              <div className="promotions-grid">
                {promotions.map(promo => (
                  <div className="promo-card" key={promo.id}>
                    <div className="promo-image">
                      <img src={promo.image} alt={promo.name} />
                      <div className="discount-badge">
                        {promo.discountPercentage}% OFF
                      </div>
                    </div>
                    <div className="promo-content">
                      <h3>{promo.name}</h3>
                      <p>{promo.description}</p>
                      <div className="promo-price">
                        <span className="original-price">${promo.price.toLocaleString('es-AR')}</span>
                        <span className="discount-price">${promo.discountPrice.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="promo-actions">
                        <Link to={`/productos/${promo.id}`} className="btn">Ver Detalle</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-promotions">
                <h2>No hay promociones disponibles</h2>
                <p>Actualmente no tenemos promociones activas, pero te invitamos a explorar nuestros productos regulares.</p>
                <Link to="/productos" className="btn">Ver Productos</Link>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="promo-info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-item">
              <h3>¿Cómo funcionan nuestras promociones?</h3>
              <p>Nuestras promociones están disponibles por tiempo limitado. Te recomendamos aprovecharlas cuanto antes. Las promociones no son acumulables con otros descuentos.</p>
            </div>
            <div className="info-item">
              <h3>Promociones personalizadas</h3>
              <p>Para eventos especiales y pedidos corporativos, contáctanos para conocer nuestras promociones personalizadas y descuentos por volumen.</p>
            </div>
            <div className="info-item">
              <h3>Próximas promociones</h3>
              <p>Síguenos en nuestras redes sociales para enterarte de nuestras promociones antes que nadie. ¡Tenemos sorpresas cada mes!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;
