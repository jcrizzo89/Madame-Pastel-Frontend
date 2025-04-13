import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useConfig } from '../context/ConfigContext';
import { FaArrowRight } from 'react-icons/fa';
import { API_URL, PLACEHOLDER_IMAGES } from '../utils/constants';
import ProductCard from '../components/products/ProductCard';
import InstagramFeed from '../components/instagram/InstagramFeed';
import '../styles/HomePage.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { config } = useConfig();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener productos destacados y promociones desde la API
        const productsResponse = await axios.get(`${API_URL}/products`);
        const productsData = productsResponse.data;
        
        // Filtrar productos destacados
        const featuredProducts = productsData
          .filter(product => product.featured)
          .map(product => ({
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image || PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            category: product.category,
            inStock: product.stock > 0
          }));
        
        // Filtrar productos en promoción
        const promotionProducts = productsData
          .filter(product => product.isPromotion)
          .map(product => ({
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            discountPrice: product.price * (1 - product.discountPercentage / 100),
            image: product.image || PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            category: product.category,
            discountPercentage: product.discountPercentage
          }));
        
        setFeaturedProducts(featuredProducts);
        setPromotions(promotionProducts);
        setLoading(false);
        
        console.log('Productos destacados:', featuredProducts);
        console.log('Productos en promoción:', promotionProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        
        // Fallback a datos de muestra en caso de error
        const sampleProducts = [
          {
            id: '1',
            name: 'Torta de Chocolate',
            description: 'Deliciosa torta de chocolate con ganache',
            price: 4500,
            image: 'https://via.placeholder.com/300x300',
            category: 'tortas'
          },
          {
            id: '2',
            name: 'Cupcakes de Vainilla',
            description: 'Pack de 6 cupcakes de vainilla con frosting',
            price: 2500,
            image: 'https://via.placeholder.com/300x300',
            category: 'cupcakes'
          },
          {
            id: '3',
            name: 'Macarons Surtidos',
            description: 'Pack de 12 macarons en variedad de sabores',
            price: 3000,
            image: 'https://via.placeholder.com/300x300',
            category: 'macarons'
          },
          {
            id: '4',
            name: 'Torta Red Velvet',
            description: 'Torta Red Velvet con frosting de queso crema',
            price: 5000,
            image: 'https://via.placeholder.com/300x300',
            category: 'tortas'
          }
        ];
        
        const samplePromotions = [
          {
            id: '5',
            name: 'Box Dulce Tentación',
            description: 'Box con variedad de dulces: brownies, cookies y mini tortas',
            price: 6000,
            discountPrice: 5000,
            image: 'https://via.placeholder.com/300x300',
            category: 'boxes'
          },
          {
            id: '6',
            name: 'Promo Cumpleaños',
            description: 'Torta personalizada + 12 cupcakes',
            price: 8000,
            discountPrice: 7000,
            image: 'https://via.placeholder.com/300x300',
            category: 'promos'
          }
        ];

        setFeaturedProducts(sampleProducts);
        setPromotions(samplePromotions);
      }
    };

    fetchData();
  }, []);
  
  // Valores de color desde la configuración o valores por defecto
  const primaryColor = config?.primaryColor || '#d94f70';
  const secondaryColor = config?.secondaryColor || '#f8d7da';
  
  // Aplicar colores dinámicamente usando estilos en línea
  const styles = {
    heroBanner: {
      backgroundColor: secondaryColor,
    },
    btnPrimary: {
      backgroundColor: primaryColor,
      borderColor: primaryColor,
    },
    sectionHighlight: {
      backgroundColor: primaryColor,
      color: '#fff'
    },
    ctaButton: {
      backgroundColor: primaryColor,
      color: '#fff',
      border: `2px solid ${primaryColor}`
    }
  };

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner" style={styles.heroBanner}>
        <div className="container">
          <div className="hero-content">
            <h1>{config?.siteSettings?.homepageTitle || 'Madame Pastel'}</h1>
            <p>{config?.siteSettings?.homepageDescription || 'Pastelería artesanal con los mejores ingredientes y sabores únicos.'}</p>
            <div className="hero-actions">
              <Link to="/productos" className="btn btn-primary" style={styles.btnPrimary}>Ver Productos</Link>
              <Link to="/contacto" className="btn btn-outline">Contacto</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://via.placeholder.com/600x400" alt="Madame Pastel" />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured-products">
        <div className="container">
          <h2 className="section-title">Productos Destacados</h2>
          {loading ? (
            <p className="loading-message">Cargando productos...</p>
          ) : (
            <div className="products-grid">
              {featuredProducts.length > 0 ? (
                featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className="no-products-message">No hay productos destacados en este momento.</p>
              )}
            </div>
          )}
          <div className="text-center mt-4">
          <Link to="/productos" className="btn" style={styles.btnPrimary}>Ver Todas los Productos</Link>

          </div>
        </div>
      </section>

      {/* Promotions */}
      <section className="section promotions">
        <div className="container">
          <h2 className="section-title">Promociones Especiales</h2>
          {loading ? (
            <p className="loading-message">Cargando promociones...</p>
          ) : (
            <div className="promotions-grid">
              {promotions.length > 0 ? (
                promotions.map(promo => (
                  <div className="promo-card" key={promo.id}>
                    <div className="promo-image">
                      <img src={promo.image} alt={promo.name} />
                      <div className="discount-badge" style={styles.sectionHighlight}>¡Oferta!</div>
                    </div>
                    <div className="promo-content">
                      <h3>{promo.name}</h3>
                      <p>{promo.description}</p>
                      <div className="promo-price">
                        <span className="original-price">${promo.price}</span>
                        <span className="discount-price" style={{color: primaryColor}}>${promo.discountPrice}</span>
                      </div>
                      <Link to={`/productos/${promo.id}`} className="btn" style={styles.ctaButton}>Ver Detalle</Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-products-message">No hay promociones activas en este momento.</p>
              )}
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/promociones" className="btn" style={styles.btnPrimary}>Ver Todas las Promociones</Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <img src="https://via.placeholder.com/600x400" alt={config?.storeName || "Madame Pastel"} />
            </div>
            <div className="about-content">
              <h2>Sobre {config?.storeName || "Madame Pastel"}</h2>
              <p>En {config?.storeName || "Madame Pastel"}, nos dedicamos a crear delicias artesanales con los ingredientes de la más alta calidad. Cada producto es elaborado con pasión y atención meticulosa a los detalles.</p>
              <p>Nos especializamos en tortas personalizadas, cupcakes, macarons y todo tipo de dulces para eventos especiales y antojos dulces cotidianos.</p>
              <Link to="/contacto" className="btn" style={styles.btnPrimary}>Contáctanos</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="section instagram-section">
        <div className="container">
          <h2 className="section-title">Síguenos en Instagram</h2>
          <InstagramFeed limit={4} />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
