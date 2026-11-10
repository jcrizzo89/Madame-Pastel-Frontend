import {
  CUSTOM_CAKE_SIZES,
  EXTRA_SPONGE_PRICE,
  getCustomCakePrice,
  getCustomCakeSizeFromSearch
} from './customCake';
import { buildCustomCakeWhatsAppMessage } from '../utils/whatsappOrder';

describe('custom cake catalog', () => {
  it('keeps the five size prices from the bakery guide', () => {
    expect(CUSTOM_CAKE_SIZES.map(option => option.price)).toEqual([
      55000, 72000, 85000, 95000, 110000
    ]);
  });

  it('adds the extra sponge price to the selected size', () => {
    expect(EXTRA_SPONGE_PRICE).toBe(16000);
    expect(getCustomCakePrice({ size: 'mini', extraSponge: true })).toBe(71000);
  });

  it('selects a catalog size from the custom cake link', () => {
    expect(getCustomCakeSizeFromSearch('?size=chica')).toBe('chica');
    expect(getCustomCakeSizeFromSearch('?size=invalid')).toBe('');
  });

  it('marks personalized decoration for a WhatsApp quote', () => {
    const message = buildCustomCakeWhatsAppMessage({
      size: 'mini',
      sponge: 'Chocolate',
      fillings: ['Nutella', 'Frutilla'],
      decoration: 'personalized',
      extraSponge: true,
      customer: { name: 'Ana', phone: '2235551234', address: 'Calle 1', city: 'Mar del Plata', zipCode: '7600' },
      deliveryDate: '2026-12-10',
      deliveryTime: '15:30',
      paymentMethod: 'transfer'
    });

    expect(message).toContain('Mini (14 cm, 5 a 10 porciones)');
    expect(message).toContain('Chocolate');
    expect(message).toContain('Nutella, Frutilla');
    expect(message).toContain('Bizcochuelo extra: $16.000');
    expect(message).toContain('Decoración personalizada: cotizar');
    expect(message).toContain('Precio base: $55.000');
    expect(message).toContain('Subtotal estimado: $71.000');
  });
});
