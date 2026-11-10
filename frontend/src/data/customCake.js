export const CUSTOM_CAKE_SIZES = [
  { id: 'mini', name: 'Mini', diameter: 14, portions: '5 a 10', price: 55000 },
  { id: 'chica', name: 'Chica', diameter: 16, portions: '10 a 15', price: 72000 },
  { id: 'mediana', name: 'Mediana', diameter: 18, portions: '15 a 20', price: 85000 },
  { id: 'grande', name: 'Grande', diameter: 20, portions: '20 a 25', price: 95000 },
  { id: 'extra-grande', name: 'Extra Grande', diameter: 22, portions: '25 a 30', price: 110000 }
];

export const SPONGE_FLAVORS = ['Vainilla', 'Chocolate'];

export const CUSTOM_CAKE_FILLINGS = [
  'Ganache de chocolate semiamargo',
  'Ganache de chocolate con leche',
  'Ganache de chocolate blanco',
  'Ganache de pistacho',
  'Frutos rojos',
  'Frutilla',
  'Bon o Bon / Marroc',
  'Nutella',
  'Crema Bariloche (ganache y dulce de leche)',
  'Dulce de leche (con merenguitos, chips o nueces)'
];

export const EXTRA_SPONGE_PRICE = 16000;

export const getCustomCakeSizeFromSearch = (search) => {
  const requestedSize = new URLSearchParams(search).get('size');
  return CUSTOM_CAKE_SIZES.some(option => option.id === requestedSize) ? requestedSize : '';
};

export const getCustomCakePrice = ({ size, extraSponge = false }) => {
  const selectedSize = CUSTOM_CAKE_SIZES.find(option => option.id === size);
  if (!selectedSize) return null;
  return selectedSize.price + (extraSponge ? EXTRA_SPONGE_PRICE : 0);
};

export const formatARS = (amount) => `$${Number(amount || 0).toLocaleString('es-AR')}`;
