import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GoogleAddressInput from './GoogleAddressInput';

describe('GoogleAddressInput component', () => {
  it('renders input with default placeholder and props', () => {
    render(
      <GoogleAddressInput
        value="San Martín 2450"
        onChange={() => {}}
      />
    );

    const input = screen.getByDisplayValue('San Martín 2450');
    expect(input).toBeInTheDocument();
  });

  it('triggers onChange when user types', () => {
    const handleChange = jest.fn();
    render(
      <GoogleAddressInput
        value=""
        onChange={handleChange}
        placeholder="Ingresá tu calle"
      />
    );

    const input = screen.getByPlaceholderText('Ingresá tu calle');
    fireEvent.change(input, { target: { value: 'Guemes 3100' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders Google Maps link when an address value is present', () => {
    render(
      <GoogleAddressInput
        value="Alberti 1500"
        onChange={() => {}}
      />
    );

    const mapLink = screen.getByTitle('Ver ubicación en Google Maps');
    expect(mapLink).toBeInTheDocument();
    expect(mapLink.getAttribute('href')).toContain('Alberti%201500%2C%20Mar%20del%20Plata');
  });

  it('clears input when clear button is clicked', () => {
    const handleChange = jest.fn();
    render(
      <GoogleAddressInput
        value="Rivadavia 2000"
        onChange={handleChange}
      />
    );

    const clearButton = screen.getByTitle('Limpiar dirección');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith({
      target: { name: 'address', value: '' }
    });
  });
});
