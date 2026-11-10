import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import '../styles/CartPage.css';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <h1>Tu carrito está vacío</h1>
            <p>No hay productos en tu carrito de compras.</p>
            <Link to="/productos" className="btn">
              <FaArrowLeft className="icon-left" aria-hidden="true" /> Explorar productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Tu Carrito de Compras</h1>

        <div className="cart-container">
          <div className="cart-items">
            <div className="cart-header">
              <div className="cart-product">Producto</div>
              <div className="cart-price">Precio</div>
              <div className="cart-quantity">Cantidad</div>
              <div className="cart-total">Total</div>
              <div className="cart-actions">Acciones</div>
            </div>

            {cart.items.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-product">
                  <div className="cart-product-image">
                    <img
                      src={item.image || '/logo-madame-pastel.jpeg'}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/logo-madame-pastel.jpeg';
                      }}
                    />
                  </div>
                  <div className="cart-product-details">
                    <h3>{item.name}</h3>
                    {item.description && <p>{item.description}</p>}
                    {item.isOnPromotion && (
                      <span className="product-badge" style={{ display: 'inline-block', fontSize: '0.75rem', padding: '2px 8px', marginTop: '4px' }}>
                        En promoción
                      </span>
                    )}
                  </div>
                </div>

                <div className="cart-price">${formatPrice(item.price)}</div>

                <div className="cart-quantity">
                  <div className="quantity-control">
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Restar una unidad de ${item.name}`}
                    >
                      <FaMinus aria-hidden="true" />
                    </button>
                    <span className="quantity" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      aria-label={`Sumar una unidad de ${item.name}`}
                    >
                      <FaPlus aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="cart-total">${formatPrice(item.price * item.quantity)}</div>

                <div className="cart-actions">
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Eliminar producto"
                    aria-label={`Eliminar ${item.name} del carrito`}
                  >
                    <FaTrash aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Resumen del pedido</h2>

            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${formatPrice(cart.totalAmount)}</span>
            </div>

            <div className="summary-row">
              <span>Envío:</span>
              <span>A coordinar</span>
            </div>

            <div className="summary-row total">
              <span>Total:</span>
              <span>${formatPrice(cart.totalAmount)}</span>
            </div>

            <Link to="/checkout" className="btn checkout-btn">
              Proceder al pedido
            </Link>

            {showClearConfirm ? (
              <div
                style={{
                  padding: '0.8rem',
                  background: '#fff0ee',
                  border: '1px solid #f8c2cc',
                  borderRadius: '10px',
                  margin: '0.8rem 0',
                  textAlign: 'center'
                }}
              >
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#8b2034', fontWeight: 600 }}>
                  ¿Vaciar todos los productos?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    onClick={handleClearCart}
                  >
                    Sí, vaciar
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline clear-cart-btn"
                onClick={() => setShowClearConfirm(true)}
              >
                Vaciar carrito
              </button>
            )}

            <Link to="/productos" className="back-to-shopping">
              <FaArrowLeft className="icon-left" aria-hidden="true" /> Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
