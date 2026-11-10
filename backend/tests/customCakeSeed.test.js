const seedProducts = require('../data/customCakeSeedData');
const Product = require('../models/Product');

describe('custom cake seed data', () => {
  it('contains only confirmed sizes and prices from the bakery guide', () => {
    expect(seedProducts.map(product => product.price)).toEqual([55000, 72000, 85000, 95000, 110000]);
    expect(seedProducts.map(product => product.customCakeSizeId)).toEqual(['mini', 'chica', 'mediana', 'grande', 'extra-grande']);
  });

  it('marks custom cakes as made to order with illustrative images', () => {
    expect(seedProducts).toHaveLength(5);
    expect(seedProducts.every(product => product.madeToOrder && product.illustrativeImage)).toBe(true);
    expect(seedProducts.every(product => product.image.startsWith('/images/'))).toBe(true);
    expect(Product.schema.path('madeToOrder')).toBeDefined();
  });
});
