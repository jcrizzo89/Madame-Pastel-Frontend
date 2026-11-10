import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // Verificar si el producto está en promoción
  const isOnPromotion = Boolean(
    product.isPromotion || (product.seasonalPromotion && product.isPromotionActive)
  );

  // Calcular el precio con descuento si está en promoción
  const discountedPrice = isOnPromotion && product.discountPercentage > 0
    ? product.price * (1 - (product.discountPercentage / 100))
    : product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({
      ...product,
      id: product._id || product.id,
      price: discountedPrice,
      originalPrice: isOnPromotion ? product.price : undefined,
      isOnPromotion
    });
  };

  // Formatear precio para mostrar
  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const productId = product._id || product.id;

  return (
    <div className="product-card">
      {/* Badge de promoción */}
      {isOnPromotion && (
        <div className="product-badge">
          {product.discountPercentage || 0}% OFF
        </div>
      )}

      {/* Imagen principal */}
      <div className="product-image">
        <Link to={`/productos/${productId}`} className="image-link" aria-label={`Ver detalles de ${product.name}`}>
          <img
            src={product.image || '/logo-madame-pastel.jpeg'}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo-madame-pastel.jpeg';
            }}
          />
        </Link>

        {/* Botones de acción */}
        <div className="product-actions">
          {product.madeToOrder ? (
            <Link
              to={`/armar-torta?size=${encodeURIComponent(product.customCakeSizeId || '')}`}
              className="add-to-cart-btn"
              aria-label={`Personalizar ${product.name}`}
            >
              <span>Personalizar</span>
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              className="add-to-cart-btn"
              title="Agregar al carrito"
              aria-label={`Agregar ${product.name} al carrito`}
              type="button"
            >
              <FaShoppingCart aria-hidden="true" /> <span>Agregar</span>
            </button>
          )}
          <Link
            to={`/productos/${productId}`}
            className="view-details-btn"
            title="Ver detalles"
            aria-label={`Ver detalles de ${product.name}`}
          >
            <FaEye aria-hidden="true" /> <span>Ver</span>
          </Link>
        </div>
      </div>

      {/* Contenido inferior */}
      <div className="product-content">
        <div className="product-info">
          <span className="product-category">{product.category}</span>
          {product.madeToOrder && <span className="product-category">A pedido · imagen ilustrativa</span>}
          <h3 className="product-title">
            <Link to={`/productos/${productId}`}>{product.name}</Link>
          </h3>
        </div>

        <div className="product-bottom">
          <div className="product-price">
            {isOnPromotion ? (
              <>
                <span className="original-price">${formatPrice(product.price)}</span>
                <span className="discount-price">${formatPrice(discountedPrice)}</span>
              </>
            ) : (
              <span className="current-price">${formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
