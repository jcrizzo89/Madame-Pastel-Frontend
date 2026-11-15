// Banco de frases de la fortuna, recompensas diarias y macarons para el ritual diario
// Diseñado para construir el hábito de retorno (retention loop) de clientes en Madame Pastel.

export const MACARON_VARIETIES = [
  {
    id: 'framboise',
    name: 'Framboise Royale',
    sub: 'Frambuesa & Brillo Rosa',
    colorTop: '#E85D75',
    colorFilling: '#FFF0F3',
    colorBottom: '#D84964',
    glowColor: 'rgba(232, 93, 117, 0.4)',
    accent: '#B83B5E'
  },
  {
    id: 'pistache',
    name: 'Pistache Dorée',
    sub: 'Pistacho & Toque Dorado',
    colorTop: '#8EAF9D',
    colorFilling: '#FFF9E6',
    colorBottom: '#7A9E8A',
    glowColor: 'rgba(212, 175, 55, 0.45)',
    accent: '#D4AF37'
  },
  {
    id: 'lavande',
    name: 'Vanille & Lavande',
    sub: 'Vainilla Bourbon & Violeta Suave',
    colorTop: '#B8A9C9',
    colorFilling: '#FFFDF0',
    colorBottom: '#A291B7',
    glowColor: 'rgba(184, 169, 201, 0.4)',
    accent: '#735C94'
  }
];

export const FORTUNE_QUOTES = [
  {
    quote: 'Hoy es un día ideal para celebrar lo que sos. Regaláte un momento de dulzura sin culpas ni prisas.',
    author: 'Madame Pastel',
    theme: 'Amor Propio'
  },
  {
    quote: 'Las cosas más hermosas de la vida se hornean con paciencia, fuego suave y mucho amor.',
    author: 'Proverbio Pastelero',
    theme: 'Calma & Paciencia'
  },
  {
    quote: 'Una buena charla y una porción de algo delicioso tienen el poder de transformar cualquier día gris en sol.',
    author: 'El Atelier',
    theme: 'Encuentros'
  },
  {
    quote: 'En los pequeños detalles vive la verdadera elegancia. No dejes de mirar con ojos curiosos.',
    author: 'Madame Pastel',
    theme: 'Inspiración'
  },
  {
    quote: 'Tu energía positiva es contagiosa. Compartí una sonrisa y un dulce con quien más lo necesite hoy.',
    author: 'El Rincón Dulce',
    theme: 'Generosidad'
  },
  {
    quote: 'El secreto de la felicidad no está en esperar el gran festejo, sino en celebrar los pequeños logros cotidianos.',
    author: 'Madame Pastel',
    theme: 'Celebración'
  },
  {
    quote: 'Permitite saborear cada instante. La vida, como un buen macaron, es una mezcla perfecta de texturas y contrastes.',
    author: 'Notas del Chef',
    theme: 'Disfrute Pleno'
  },
  {
    quote: 'Nuevos comienzos dulces se asoman en tu horizonte. Mantené tu corazón abierto a la sorpresa.',
    author: 'Madame Pastel',
    theme: 'Esperanza'
  },
  {
    quote: 'No hay nada que un aroma a vainilla y chocolate tibio no pueda reconfortar en tu alma.',
    author: 'El Atelier',
    theme: 'Refugio'
  },
  {
    quote: 'Hacé de tu día una obra de arte. Vos sos quien elige con qué colores y sabores decorarlo.',
    author: 'Madame Pastel',
    theme: 'Creatividad'
  }
];

export const DAILY_PERKS = [
  {
    title: 'Dulzura en Casa: 15% OFF en tu pedido',
    code: 'SUERTE15',
    discount: '15% de descuento',
    badge: '★ PREMIO MAYOR ★',
    terms: 'Válido para compras superiores a $10.000 en la tienda online o WhatsApp.'
  },
  {
    title: 'Degustación de Macarons: 10% OFF',
    code: 'MACARONLOVE',
    discount: '10% de descuento',
    badge: '★ FAVORITO DEL CHEF ★',
    terms: 'Válido para cualquier producto artesanal de Madame Pastel.'
  },
  {
    title: 'Envío Bonificado / Mimo Especial',
    code: 'ENVIODULCE',
    discount: 'Envío Bonificado',
    badge: '★ BENEFICIO EXCLUSIVO ★',
    terms: 'Canjeable en tu próxima compra consultando zona de entrega por WhatsApp.'
  },
  {
    title: 'Bocadito Extra de Regalo con tu pedido',
    code: 'REGALODULCE',
    discount: 'Obsequio Sorpresa',
    badge: '★ MIMO DE LA CASA ★',
    terms: 'Presentá este cupón en tu pedido para sumar 2 macarons de cortesía.'
  }
];

// Obtener la fecha en formato YYYY-MM-DD
export const getTodayDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calcular horas y minutos restantes hasta la medianoche
export const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diffMs = midnight - now;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}h ${minutes}m ${seconds}s`
  };
};

// Generar o recuperar la fortuna del día de forma determinista para que no cambie al refrescar
export const getFortuneForDate = (dateKey) => {
  // Convertir dateKey en un número de semilla
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) {
    seed += dateKey.charCodeAt(i) * (i + 1);
  }

  const quoteIdx = seed % FORTUNE_QUOTES.length;
  const perkIdx = seed % DAILY_PERKS.length;

  return {
    quote: FORTUNE_QUOTES[quoteIdx],
    perk: DAILY_PERKS[perkIdx]
  };
};
