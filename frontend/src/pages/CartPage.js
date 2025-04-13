import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import '../styles/CartPage.css';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
      removeFromCart(productId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
      clearCart();
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <h1>Tu carrito está vacío</h1>
            <p>No hay productos en tu carrito de compras.</p>
            <Link to="/productos" className="btn">
              <FaArrowLeft className="icon-left" /> Explorar productos
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
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-product-details">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
                
                <div className="cart-price">${item.price.toLocaleString()}</div>
                
                <div className="cart-quantity">
                  <div className="quantity-control">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                
                <div className="cart-total">${(item.price * item.quantity).toLocaleString()}</div>
                
                <div className="cart-actions">
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Eliminar producto"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>Resumen del pedido</h2>
            
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${cart.totalAmount.toLocaleString()}</span>
            </div>
            
            <div className="summary-row">
              <span>Envío:</span>
              <span>A coordinar</span>
            </div>
            
            <div className="summary-row total">
              <span>Total:</span>
              <span>${cart.totalAmount.toLocaleString()}</span>
            </div>
            
            <Link to="/checkout" className="btn checkout-btn">
              Proceder al pago
            </Link>
            
            <button 
              className="btn btn-outline clear-cart-btn"
              onClick={handleClearCart}
            >
              Vaciar carrito
            </button>
            
            <Link to="/productos" className="back-to-shopping">
              <FaArrowLeft className="icon-left" /> Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
