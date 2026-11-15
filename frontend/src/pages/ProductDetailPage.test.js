import React from 'react';
jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'prod-123' }),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import { CartProvider, useCart } from '../context/CartContext';
import ProductDetailPage from './ProductDetailPage';

describe('ProductDetailPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('does not invent a product when the API has no matching item', async () => {
    axios.get.mockRejectedValueOnce(new Error('not found'));
    render(<CartProvider><ProductDetailPage /></CartProvider>);
    await waitFor(() => expect(screen.getByText('Producto no encontrado')).toBeInTheDocument());
    expect(screen.queryByText('Huevo Kinder')).not.toBeInTheDocument();
  });

  it('adds selected quantity to cart when clicking Agregar al carrito', async () => {
    const mockProduct = {
      _id: 'prod-1',
      name: 'Torta Chocolate',
      description: 'Rica torta',
      price: 5000,
      stock: 10,
      category: 'Tortas'
    };
    axios.get.mockResolvedValueOnce({ data: mockProduct });

    const CartTracker = () => {
      const { cart } = useCart();
      return (
        <div>
          <span data-testid="cart-total-items">{cart.totalItems}</span>
          <span data-testid="cart-total-amount">{cart.totalAmount}</span>
        </div>
      );
    };

    render(
      <CartProvider>
        <ProductDetailPage />
        <CartTracker />
      </CartProvider>
    );

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Torta Chocolate' })).toBeInTheDocument()
    );

    const plusBtn = screen.getByLabelText('Sumar una unidad');
    fireEvent.click(plusBtn);
    fireEvent.click(plusBtn); // quantity is now 3

    expect(screen.getByText('3')).toBeInTheDocument();

    const addToCartBtn = screen.getByRole('button', { name: /agregar al carrito/i });
    fireEvent.click(addToCartBtn);

    expect(screen.getByTestId('cart-total-items').textContent).toBe('3');
    expect(screen.getByTestId('cart-total-amount').textContent).toBe('15000');
  });

  it('renders the product image with correct source and class', async () => {
    const mockProduct = {
      _id: 'prod-1',
      name: 'Torta Chocolate',
      description: 'Rica torta',
      price: 5000,
      stock: 10,
      category: 'Tortas',
      image: '/images/torta.jpg'
    };
    axios.get.mockResolvedValueOnce({ data: mockProduct });

    render(
      <CartProvider>
        <ProductDetailPage />
      </CartProvider>
    );

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Torta Chocolate' })).toBeInTheDocument()
    );

    const img = screen.getByRole('img', { name: 'Torta Chocolate' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/torta.jpg');
    expect(img).toHaveClass('product-detail-image');
  });

  it('displays "Desde" and does not render stray "0" for custom cakes with 0 preparationTime and empty ingredients', async () => {
    const mockCustomCake = {
      _id: 'custom-cake-mediana',
      name: 'Torta personalizada Mediana',
      description: 'Torta personalizada de 18 cm',
      price: 85000,
      stock: 0,
      category: 'Tortas personalizadas',
      madeToOrder: true,
      customCakeSizeId: 'mediana',
      ingredients: [],
      allergens: [],
      preparationTime: 0
    };
    axios.get.mockResolvedValueOnce({ data: mockCustomCake });

    const { container } = render(
      <CartProvider>
        <ProductDetailPage />
      </CartProvider>
    );

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Torta personalizada Mediana' })).toBeInTheDocument()
    );

    // Should show "Desde $85.000"
    expect(screen.getByText(/Desde \$85\.000/)).toBeInTheDocument();

    // Should NOT have stray text "0" rendered anywhere
    const productInfoEl = container.querySelector('.product-info');
    // Check that there is no orphan "0" text node or element in product-info
    const textContents = Array.from(productInfoEl.querySelectorAll('*')).map(el => el.textContent.trim());
    expect(textContents).not.toContain('0');
  });
});
