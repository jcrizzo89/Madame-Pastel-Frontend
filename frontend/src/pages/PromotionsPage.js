import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, PLACEHOLDER_IMAGES } from '../utils/constants';
import ProductCard from '../components/products/ProductCard';
import '../styles/PromotionsPage.css';

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/products/promotions`);

      if (response.data && response.data.length > 0) {
        const formattedPromotions = response.data.map((product) => ({
          ...product,
          id: product._id,
          _id: product._id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          image: product.image || PLACEHOLDER_IMAGES.PRODUCT_SMALL,
          category: product.category,
          isPromotion: true,
          discountPercentage: product.discountPercentage || 0,
          inStock: product.stock > 0 || product.madeToOrder,
          madeToOrder: product.madeToOrder,
          customCakeSizeId: product.customCakeSizeId
        }));
        setPromotions(formattedPromotions);
      } else {
        setPromotions([]);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('No pudimos cargar las promociones en este momento. Por favor, intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return (
    <div className="promotions-page">
      <div className="promotions-banner">
        <div className="container">
          <h1>Promociones Especiales</h1>
          <p>Aprovechá nuestras ofertas y promociones exclusivas en pastelería artesanal</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px' }}>
        {loading ? (
          <p className="loading-message">Cargando promociones...</p>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchPromotions} className="btn" type="button" style={{ marginTop: '1rem' }}>
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <>
            {promotions.length > 0 ? (
              <div className="products-grid">
                {promotions.map((promo) => (
                  <ProductCard key={promo.id} product={promo} />
                ))}
              </div>
            ) : (
              <div className="no-promotions text-center" style={{ padding: '60px 20px' }}>
                <h2>No hay promociones activas por el momento</h2>
                <p style={{ margin: '15px 0 25px', color: '#666' }}>
                  Te invitamos a explorar nuestro catálogo de tortas y productos artesanales.
                </p>
                <Link to="/productos" className="btn btn-primary">
                  Ver catálogo de productos
                </Link>
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
              <p>
                Los descuentos se aplican automáticamente sobre el valor de lista del producto al momento de agregarlo a tu carrito.
              </p>
            </div>
            <div className="info-item">
              <h3>Envíos y entregas</h3>
              <p>
                Coordinamos los envíos a domicilio en Mar del Plata vía WhatsApp para asegurar la frescura de cada preparación.
              </p>
            </div>
            <div className="info-item">
              <h3>Tortas a pedido</h3>
              <p>
                Podés armar y personalizar tu torta eligiendo tamaño, bizcochuelo y dos rellenos en nuestra sección de personalización.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;
