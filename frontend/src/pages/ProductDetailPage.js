import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { API_URL } from '../utils/constants';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/products/${id}`)
      .then(({ data }) => {
        if (active) setProduct(data);
      })
      .catch(() => {
        if (active) setProduct(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <p className="loading-message">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container not-found-container">
          <h2>Producto no encontrado</h2>
          <p>No encontramos ese producto en el catálogo disponible.</p>
          <Link to="/productos" className="btn">
            <FaArrowLeft className="icon-left" /> Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const rawPrice = Number(product.price);
  const isOnPromotion = Boolean(
    product.isPromotion || (product.seasonalPromotion && product.isPromotionActive)
  );
  const discountedPrice =
    isOnPromotion && product.discountPercentage > 0 && Number.isFinite(rawPrice)
      ? rawPrice * (1 - product.discountPercentage / 100)
      : rawPrice;

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: product._id || product.id,
      price: discountedPrice,
      originalPrice: isOnPromotion ? rawPrice : undefined,
      isOnPromotion,
      quantity
    });
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Navegación secundaria">
          <Link to="/">Inicio</Link> / <Link to="/productos">Productos</Link> / <span>{product.name}</span>
        </nav>

        <div className="product-detail-container">
          <div className="product-image-container">
            <img
              className="product-image-bg"
              src={product.image || '/logo-madame-pastel.jpeg'}
              alt={product.name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo-madame-pastel.jpeg';
              }}
            />
            {isOnPromotion && (
              <span className="product-badge" style={{ position: 'absolute', top: '15px', right: '15px' }}>
                {product.discountPercentage || 0}% OFF
              </span>
            )}
          </div>

          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            <div className="product-category">
              {product.category}
              {product.illustrativeImage && ' · Imagen ilustrativa'}
            </div>

            <div className="product-price">
              {Number.isFinite(rawPrice) ? (
                isOnPromotion ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span className="original-price" style={{ textDecoration: 'line-through', color: '#888', fontSize: '1.1rem' }}>
                      ${formatPrice(rawPrice)}
                    </span>
                    <span className="discount-price" style={{ color: 'var(--accent-color, #c94860)', fontSize: '1.6rem', fontWeight: 700 }}>
                      ${formatPrice(discountedPrice)}
                    </span>
                  </div>
                ) : (
                  <span className="current-price" style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                    ${formatPrice(rawPrice)}
                  </span>
                )
              ) : (
                'Precio a consultar'
              )}
            </div>

            <div className="product-description">{product.description}</div>

            {(product.ingredients?.length > 0 || product.allergens?.length > 0 || product.preparationTime) && (
              <div className="product-meta">
                {product.ingredients?.length > 0 && (
                  <div className="meta-item">
                    <h3>Ingredientes</h3>
                    <ul className="ingredients-list">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={`${ingredient}-${index}`}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="meta-item">
                  {product.preparationTime && (
                    <p>
                      <strong>Preparación:</strong> {product.preparationTime} horas
                    </p>
                  )}
                  {product.allergens?.length > 0 && (
                    <p>
                      <strong>Alérgenos:</strong> {product.allergens.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {product.madeToOrder ? (
              <div className="add-to-cart-container">
                <Link
                  className="btn add-to-cart-btn"
                  to={`/armar-torta?size=${encodeURIComponent(product.customCakeSizeId || '')}`}
                >
                  Personalizar y pedir por WhatsApp
                </Link>
              </div>
            ) : (
              <div className="add-to-cart-container">
                <div className="quantity-selector">
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    aria-label="Restar una unidad"
                  >
                    <FaMinus aria-hidden="true" />
                  </button>
                  <span className="quantity" aria-live="polite">{quantity}</span>
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => setQuantity((value) => value + 1)}
                    aria-label="Sumar una unidad"
                  >
                    <FaPlus aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <FaShoppingCart className="icon-left" aria-hidden="true" />{' '}
                  {product.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="back-navigation">
          <Link to="/productos" className="back-link">
            <FaArrowLeft className="icon-left" aria-hidden="true" /> Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
