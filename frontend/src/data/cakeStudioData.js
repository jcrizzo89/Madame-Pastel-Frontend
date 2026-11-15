// Datos y configuración para el Taller Interactivo 'Crea tu Pastel' de Madame Pastel

export const CAKE_TIERS = [
  {
    id: 1,
    name: '1 Piso Clásico',
    subtitle: '18 cm · 10 a 12 porciones',
    layers: 1,
    basePrice: 16500,
    icon: '🎂'
  },
  {
    id: 2,
    name: '2 Pisos Escalonados',
    subtitle: '22 cm + 15 cm · 22 a 25 porciones',
    layers: 2,
    basePrice: 28500,
    icon: '🍰'
  },
  {
    id: 3,
    name: '3 Pisos de Gala',
    subtitle: '26 cm + 20 cm + 14 cm · 35 a 40 porciones',
    layers: 3,
    basePrice: 42000,
    icon: '🏰'
  }
];

export const FROSTING_COLORS = [
  {
    id: 'pink',
    name: 'Rosa Madame',
    color: '#F8B4C4',
    darkColor: '#E990A6',
    shadowColor: '#D87A93',
    textColor: '#87324B'
  },
  {
    id: 'chocolate',
    name: 'Chocolate Belga',
    color: '#5C3828',
    darkColor: '#432619',
    shadowColor: '#2F180F',
    textColor: '#FFEAD4'
  },
  {
    id: 'cream',
    name: 'Crema Vainilla',
    color: '#FFF6E0',
    darkColor: '#EEDCBD',
    shadowColor: '#DCBA94',
    textColor: '#6B4E38'
  },
  {
    id: 'pistachio',
    name: 'Pistacho & Matcha',
    color: '#C6E2B5',
    darkColor: '#ABC997',
    shadowColor: '#8CAE77',
    textColor: '#365324'
  },
  {
    id: 'cloud',
    name: 'Celeste Nube',
    color: '#BFE3F7',
    darkColor: '#9DCFE9',
    shadowColor: '#7BB3D1',
    textColor: '#1E4C6D'
  },
  {
    id: 'lavender',
    name: 'Lavanda Pastel',
    color: '#E0CEF7',
    darkColor: '#C4ABE6',
    shadowColor: '#A88DCE',
    textColor: '#4B316D'
  }
];

export const DRIP_STYLES = [
  { id: 'none', name: 'Sin Drip', color: 'transparent' },
  { id: 'choco', name: 'Drip Chocolate', color: '#3A1E11', highlight: '#5A321E' },
  { id: 'berry', name: 'Drip Frutos Rojos', color: '#9B1138', highlight: '#C41F4E' },
  { id: 'caramel', name: 'Drip Dulce de Leche', color: '#B36B2B', highlight: '#D88A42' },
  { id: 'white', name: 'Drip Chocolate Blanco', color: '#FFF8EB', highlight: '#FFFFFF' }
];

export const TOPPING_CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'madame', name: 'Madame Pastel' },
  { id: 'fruits', name: 'Frutas' },
  { id: 'celebration', name: 'Velas & Cartel' },
  { id: 'decorations', name: 'Flores & Dulces' }
];

export const AVAILABLE_TOPPINGS = [
  // Delicias de Madame Pastel
  {
    id: 'macaron-pink',
    name: 'Macaron Frambuesa',
    category: 'madame',
    type: 'macaron',
    color: '#E87A90',
    filling: '#FFF0F5',
    size: 40,
    emoji: '🍥'
  },
  {
    id: 'macaron-pistachio',
    name: 'Macaron Pistacho',
    category: 'madame',
    type: 'macaron',
    color: '#A2C987',
    filling: '#5F8C43',
    size: 40,
    emoji: '🍵'
  },
  {
    id: 'macaron-choco',
    name: 'Macaron Chocolate',
    category: 'madame',
    type: 'macaron',
    color: '#5C3317',
    filling: '#361D0C',
    size: 40,
    emoji: '🍪'
  },
  {
    id: 'mini-meringue',
    name: 'Mini Merengue Suizo',
    category: 'madame',
    type: 'meringue',
    color: '#FFFDF7',
    shadow: '#EADFC7',
    size: 34,
    emoji: '🧁'
  },
  {
    id: 'choco-truffle',
    name: 'Trufa con Hoja de Oro',
    category: 'madame',
    type: 'truffle',
    color: '#3B1E12',
    gold: true,
    size: 32,
    emoji: '🍫'
  },

  // Frutas frescas
  {
    id: 'strawberry',
    name: 'Frutilla Fresca',
    category: 'fruits',
    type: 'strawberry',
    size: 38,
    emoji: '🍓'
  },
  {
    id: 'raspberry',
    name: 'Frambuesa',
    category: 'fruits',
    type: 'raspberry',
    size: 32,
    emoji: '🫐'
  },
  {
    id: 'blueberry',
    name: 'Arándano Silvestre',
    category: 'fruits',
    type: 'blueberry',
    size: 24,
    emoji: '🫐'
  },
  {
    id: 'orange-slice',
    name: 'Rodaja Cítrica Deshidratada',
    category: 'fruits',
    type: 'citrus',
    color: '#E68A2E',
    size: 42,
    emoji: '🍊'
  },

  // Fiesta y velas
  {
    id: 'birthday-candle',
    name: 'Vela de Cumpleaños',
    category: 'celebration',
    type: 'candle',
    color: '#FF70A6',
    size: 52,
    emoji: '🕯️'
  },
  {
    id: 'sparkle-candle',
    name: 'Vela Estrellada',
    category: 'celebration',
    type: 'candle',
    color: '#FFD166',
    size: 52,
    emoji: '✨'
  },
  {
    id: 'topper-sign',
    name: 'Topper con Texto Libre',
    category: 'celebration',
    type: 'topper',
    size: 64,
    emoji: '🏷️'
  },

  // Decoraciones extras
  {
    id: 'sugar-flower',
    name: 'Rosa de Azúcar',
    category: 'decorations',
    type: 'flower',
    color: '#F28482',
    size: 36,
    emoji: '🌸'
  },
  {
    id: 'white-flower',
    name: 'Jazmín Comestible',
    category: 'decorations',
    type: 'flower',
    color: '#FFFFFA',
    size: 32,
    emoji: '🌼'
  },
  {
    id: 'gold-flakes',
    name: 'Sprinkles y Perlas Doradas',
    category: 'decorations',
    type: 'sprinkles',
    size: 36,
    emoji: '⭐'
  }
];

// Algoritmo de evaluación y veredicto de Madame Pastel
export const evaluateCakeCreation = ({ tier, frosting, drip, toppings, customText }) => {
  const count = toppings.length;
  const categoriesPresent = new Set(toppings.map((t) => t.category));
  const hasMacarons = toppings.some((t) => t.type === 'macaron');
  const hasFruits = toppings.some((t) => t.type === 'strawberry' || t.type === 'raspberry' || t.type === 'blueberry');
  const hasCandle = toppings.some((t) => t.type === 'candle');
  const hasCustomTopper = toppings.some((t) => t.type === 'topper') || Boolean(customText && customText.trim());

  let title = 'Aprendiz de Repostería Creativa';
  let badge = '🧁';
  let stars = 4;
  let critique = '';
  let couponCode = 'MADAMECHEF10';
  let discountDescription = '10% de descuento en tu pastel personalizado o cualquier compra en Madame Pastel';

  if (count >= 7 && categoriesPresent.size >= 3) {
    title = 'Gran Maestro/a Pastelero/a de Honor';
    badge = '👑';
    stars = 5;
    critique = '¡Una obra maestra de alta pastelería! El equilibrio visual, la abundancia de texturas y el refinamiento digno de la vidriera parisina de Madame Pastel.';
    couponCode = 'GRANMAESTRO15';
    discountDescription = '15% de descuento especial por creación excepcional';
  } else if (hasMacarons && hasFruits) {
    title = 'Artista del Macaron & Patisserie';
    badge = '✨';
    stars = 5;
    critique = 'Combinación sublime entre la frescura frutal y la sofisticación del macaron francés. Madame Pastel aprueba con honores tu sensibilidad de diseño.';
    couponCode = 'MADAMECHEF10';
  } else if (frosting.id === 'chocolate' && drip.id === 'choco') {
    title = 'Conde/sa del Cacao Belga';
    badge = '🍫';
    stars = 5;
    critique = '¡Pura tentación e intensidad! Una arquitectura de chocolate que derretiría a cualquier crítico gastronómico.';
    couponCode = 'CHOCOLOVER10';
  } else if (hasCandle || hasCustomTopper) {
    title = 'Celebrante Estrella de Cumpleaños';
    badge = '🎉';
    stars = 5;
    critique = '¡El pastel soñado para cualquier festejo inolvidable! Lleno de calidez, alegría y estilo festivo.';
    couponCode = 'FIESTAPASTEL10';
  } else {
    title = 'Diseñador/a Pastelero/a Chic';
    badge = '🌸';
    stars = 5;
    critique = 'Estilo minimalista, elegante y armónico. Una composición donde cada detalle tiene su protagonismo justo.';
    couponCode = 'MADAMECHEF10';
  }

  return {
    title,
    badge,
    stars,
    critique,
    couponCode,
    discountDescription,
    score: Math.min(100, 70 + count * 4 + (tier.layers > 1 ? 10 : 0))
  };
};
