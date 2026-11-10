import { buildWhatsAppOrderMessage, buildWhatsAppOrderUrl } from './whatsappOrder';

describe('WhatsApp order handoff', () => {
  const order = {
    formData: {
      name: 'Ana Pérez',
      phone: '223 555 1234',
      address: 'Calle 1 123',
      city: 'Mar del Plata',
      zipCode: '7600',
      deliveryDate: '2026-12-10',
      deliveryTime: '15:30',
      paymentMethod: 'transfer',
      notes: 'Tocar timbre B'
    },
    cart: {
      items: [{ name: 'Torta de prueba', quantity: 2, price: 4500 }],
      totalAmount: 9000
    }
  };

  it('includes the order details and clearly marks shipping and total as unconfirmed', () => {
    const message = buildWhatsAppOrderMessage(order);

    expect(message).toContain('Ana Pérez');
    expect(message).toContain('2 × Torta de prueba');
    expect(message).toContain('Transferencia');
    expect(message).toContain('Envío: a confirmar');
    expect(message).toContain('Total final: a confirmar');
    expect(message).toContain('Tocar timbre B');
  });

  it('builds a WhatsApp link with a country-code phone and encoded message', () => {
    const url = buildWhatsAppOrderUrl('+54 9 223 551-2021', 'Pedido: torta & cupcakes');
    const parsedUrl = new URL(url);

    expect(parsedUrl.hostname).toBe('wa.me');
    expect(parsedUrl.pathname).toBe('/5492235512021');
    expect(parsedUrl.searchParams.get('text')).toBe('Pedido: torta & cupcakes');
  });
});
