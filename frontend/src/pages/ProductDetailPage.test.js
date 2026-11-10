import React from 'react';
jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ id: 'not-in-catalog' }), Link: 'a' }));
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { CartProvider } from '../context/CartContext';
import ProductDetailPage from './ProductDetailPage';

describe('ProductDetailPage', () => {
  beforeEach(() => {
    axios.get.mockRejectedValue(new Error('not found'));
  });

  it('does not invent a product when the API has no matching item', async () => {
    render(<CartProvider><ProductDetailPage /></CartProvider>);
    await waitFor(() => expect(screen.getByText('Producto no encontrado')).toBeInTheDocument());
    expect(screen.queryByText('Huevo Kinder')).not.toBeInTheDocument();
  });
});
