const image = '/images/torta-personalizada-ilustrativa.png';
const descriptions = {
  mini: 'Torta personalizada de 14 cm, rinde de 5 a 10 porciones. Elegí bizcochuelo de vainilla o chocolate y dos rellenos. Bizcochuelo extra opcional: $16.000. Imagen ilustrativa; envío e importe final se confirman por WhatsApp.',
  chica: 'Torta personalizada de 16 cm, rinde de 10 a 15 porciones. Elegí bizcochuelo de vainilla o chocolate y dos rellenos. Bizcochuelo extra opcional: $16.000. Imagen ilustrativa; envío e importe final se confirman por WhatsApp.',
  mediana: 'Torta personalizada de 18 cm, rinde de 15 a 20 porciones. Elegí bizcochuelo de vainilla o chocolate y dos rellenos. Bizcochuelo extra opcional: $16.000. Imagen ilustrativa; envío e importe final se confirman por WhatsApp.',
  grande: 'Torta personalizada de 20 cm, rinde de 20 a 25 porciones. Elegí bizcochuelo de vainilla o chocolate y dos rellenos. Bizcochuelo extra opcional: $16.000. Imagen ilustrativa; envío e importe final se confirman por WhatsApp.',
  'extra-grande': 'Torta personalizada de 22 cm, rinde de 25 a 30 porciones. Elegí bizcochuelo de vainilla o chocolate y dos rellenos. Bizcochuelo extra opcional: $16.000. Imagen ilustrativa; envío e importe final se confirman por WhatsApp.'
};

module.exports = [
  { id: 'mini', name: 'Mini', diameter: 14, portions: '5 a 10', price: 55000 },
  { id: 'chica', name: 'Chica', diameter: 16, portions: '10 a 15', price: 72000 },
  { id: 'mediana', name: 'Mediana', diameter: 18, portions: '15 a 20', price: 85000 },
  { id: 'grande', name: 'Grande', diameter: 20, portions: '20 a 25', price: 95000 },
  { id: 'extra-grande', name: 'Extra Grande', diameter: 22, portions: '25 a 30', price: 110000 }
].map(size => ({
  seedKey: `custom-cake-${size.id}`,
  name: `Torta personalizada ${size.name}`,
  description: descriptions[size.id],
  price: size.price,
  image,
  category: 'Tortas personalizadas',
  stock: 0,
  madeToOrder: true,
  customCakeSizeId: size.id,
  illustrativeImage: true,
  isPromotion: false,
  seasonalPromotion: false,
  featured: true,
  ingredients: [],
  allergens: [],
  preparationTime: 0
}));
