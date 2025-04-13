import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial del carrito
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

// Crear el contexto
const CartContext = createContext();

// Definir acciones del reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      
      if (existingItemIndex > -1) {
        // El producto ya existe en el carrito, actualizar cantidad
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + action.payload.quantity,
          totalAmount: state.totalAmount + (action.payload.price * action.payload.quantity)
        };
      } else {
        // Añadir nuevo producto al carrito
        return {
          ...state,
          items: [...state.items, action.payload],
          totalItems: state.totalItems + action.payload.quantity,
          totalAmount: state.totalAmount + (action.payload.price * action.payload.quantity)
        };
      }
    }
      
    case 'REMOVE_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload);
      
      if (!existingItem) return state;
      
      if (existingItem.quantity === 1) {
        // Eliminar producto por completo si la cantidad es 1
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload),
          totalItems: state.totalItems - 1,
          totalAmount: state.totalAmount - existingItem.price
        };
      } else {
        // Reducir la cantidad del producto
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
          totalItems: state.totalItems - 1,
          totalAmount: state.totalAmount - existingItem.price
        };
      }
    }
      
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (!item) return state;
      
      const quantityDifference = quantity - item.quantity;
      const amountDifference = item.price * quantityDifference;
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        ),
        totalItems: state.totalItems + quantityDifference,
        totalAmount: state.totalAmount + amountDifference
      };
    }
      
    case 'CLEAR_CART':
      return initialState;
      
    default:
      return state;
  }
};

// Proveedor del contexto
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Persistir carrito en localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('madamepastel_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Inicializar el estado con los datos guardados
        Object.keys(parsedCart).forEach(key => {
          if (key !== 'items') {
            return;
          }
          parsedCart.items.forEach(item => {
            dispatch({
              type: 'ADD_ITEM',
              payload: item
            });
          });
        });
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('madamepastel_cart', JSON.stringify(state));
  }, [state]);
  
  // Funciones de utilidad
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, quantity }
    });
  };
  
  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId
    });
  };
  
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, quantity }
    });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para acceder al contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
};
