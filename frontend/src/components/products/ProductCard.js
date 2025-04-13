import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  // Verificar si el producto está en promoción
  const isOnPromotion = product.isPromotion || 
    (product.seasonalPromotion && product.isPromotionActive);
  
  // Calcular el precio con descuento si está en promoción
  const discountedPrice = isOnPromotion ? 
    product.price * (1 - (product.discountPercentage / 100)) : 
    product.price;
  
  // Formatear precio para mostrar
  const formatPrice = (price) => {
    return price.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

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
        <Link to={`/productos/${product._id || product.id}`} className="image-link">
          <img src={product.image} alt={product.name} />
        </Link>
        
        {/* Botones de acción */}
        <div className="product-actions">
          <button onClick={handleAddToCart} className="add-to-cart-btn" title="Agregar al carrito">
            <FaShoppingCart /> <span>Agregar</span>
          </button>
          <Link to={`/productos/${product._id || product.id}`} className="view-details-btn" title="Ver detalles">
            <FaEye /> <span>Ver</span>
          </Link>
        </div>
      </div>
      
      {/* Contenido inferior */}
      <div className="product-content">
        <div className="product-info">
          <span className="product-category">{product.category}</span>
          <h3 className="product-title">
            <Link to={`/productos/${product._id || product.id}`}>{product.name}</Link>
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
