import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useConfig } from '../context/ConfigContext';
import { API_URL, PLACEHOLDER_IMAGES } from '../utils/constants';
import ProductCard from '../components/products/ProductCard';
import InstagramFeed from '../components/instagram/InstagramFeed';
import '../styles/HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { config } = useConfig();

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/products`)
      .then(({ data }) => {
        if (!active) return;
        const mapProduct = (item) => ({
          id: item._id,
          _id: item._id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image || PLACEHOLDER_IMAGES.PRODUCT_SMALL,
          category: item.category,
          inStock: item.stock > 0 || item.madeToOrder,
          madeToOrder: item.madeToOrder,
          customCakeSizeId: item.customCakeSizeId,
          isPromotion: item.isPromotion,
          discountPercentage: item.discountPercentage
        });

        setProducts(data.filter((item) => item.featured).map(mapProduct));
        setPromotions(data.filter((item) => item.isPromotion).map(mapProduct));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const primary = config?.primaryColor;
  const styles = config?.secondaryColor ? { backgroundColor: config.secondaryColor } : undefined;

  return (
    <div className="home-page">
      <section className="hero-banner" style={styles}>
        <div className="container">
          <div className="hero-content">
            <h1>{config?.siteSettings?.homepageTitle || 'Madame Pastel'}</h1>
            <p>
              {config?.siteSettings?.homepageDescription ||
                'Diseñá tu torta personalizada en cuatro pasos y coordiná el envío por WhatsApp.'}
            </p>
            <div className="hero-actions">
              <Link to="/armar-torta" className="btn btn-primary" style={primary ? { backgroundColor: primary } : undefined}>
                Armá tu torta
              </Link>
              <Link to="/productos" className="btn btn-outline">
                Ver productos
              </Link>
            </div>
          </div>
          <figure className="hero-image">
            <img
              src="/images/torta-personalizada-ilustrativa.png"
              alt="Torta personalizada artesanal Madame Pastel"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo-madame-pastel.jpeg';
              }}
            />
            <figcaption>Imagen ilustrativa</figcaption>
          </figure>
        </div>
      </section>

      <section className="section featured-products">
        <div className="container">
          <h2 className="section-title">Productos destacados</h2>
          {loading ? (
            <p className="loading-message">Cargando productos destacados...</p>
          ) : error ? (
            <p className="no-products-message">
              El catálogo se está preparando. Mientras tanto, podés armar tu torta personalizada.
            </p>
          ) : products.length ? (
            <div className="products-grid">
              {products.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <p className="no-products-message">Pronto vas a encontrar acá nuestros productos destacados.</p>
          )}
          <div className="text-center mt-4">
            <Link to="/productos" className="btn" style={{ backgroundColor: primary }}>
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      {promotions.length > 0 && (
        <section className="section promotions">
          <div className="container">
            <h2 className="section-title">Promociones</h2>
            <div className="products-grid">
              {promotions.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section about-section">
        <div className="container about-grid">
          <div className="about-content">
            <h2>{config?.siteSettings?.homepageAboutTitle || 'Una torta hecha para tu momento'}</h2>
            <p>
              {config?.siteSettings?.homepageAboutDescription ||
                'Elegí tamaño, sabor de bizcochuelo, dos rellenos y decoración. La decoración personalizada se cotiza por WhatsApp.'}
            </p>
            <Link to="/armar-torta" className="btn" style={{ backgroundColor: primary }}>
              Crear mi torta
            </Link>
          </div>
        </div>
      </section>

      <section className="section instagram-section">
        <div className="container">
          <h2 className="section-title">Seguinos en Instagram</h2>
          <InstagramFeed />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
