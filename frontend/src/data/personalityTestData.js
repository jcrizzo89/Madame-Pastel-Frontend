// Banco de preguntas y perfiles para el Test de Personalidad: "¿Qué dulce de Madame Pastel sos?"
// Orientado al marketing emocional, la empatía y la viralidad en redes sociales (Instagram Stories / WhatsApp).

export const PERSONALITY_PROFILES = {
  matilda: {
    id: 'matilda',
    name: 'Torta Matilda de Chocolate',
    archetype: 'El Abrazo Intenso & Apasionado',
    emoji: '🍫',
    tagline: 'Profundo, reconfortante y sin medias tintas.',
    description:
      'Tenés una personalidad generosa, leal y de una fuerza magnética irresistible. No te andás con rodeos: cuando querés a alguien, lo hacés con el corazón entero. Para tus amigos sos ese refugio cálido y seguro donde siempre hay consuelo y alegría.',
    traits: ['Apasionado/a', 'Leal hasta el final', 'Presencia imponente', 'Generoso/a'],
    palette: {
      primary: '#4A2511',
      secondary: '#8B4513',
      bgGradient: 'linear-gradient(145deg, #2c160b 0%, #4a2511 60%, #6e371a 100%)',
      textColor: '#FFFFFF',
      accentColor: '#FFD700'
    },
    pairing: 'Chocolate semi-amargo 70%, dulce de leche artesanal y café tostado intenso.',
    productLink: '/productos',
    productName: 'Torta Matilda Húmeda de Chocolate',
    couponCode: 'MATILDA10',
    couponDiscount: '10% OFF en tu pedido dulce'
  },
  pavlova: {
    id: 'pavlova',
    name: 'Pavlova de Frutos Rojos',
    archetype: 'El Alma Soñadora & Luminosa',
    emoji: '🍓',
    tagline: 'Etérea, delicada y con un encanto inolvidable.',
    description:
      'Sensible, intuitivo/a y con un sentido estético innato. Te fascinan las conversaciones sinceras a la luz de las velas y encontrás belleza en las cosas simples. Tu levedad exterior esconde una ternura profunda que conmueve a todos.',
    traits: ['Soñador/a', 'Sensible & empático/a', 'Estilo etéreo', 'Amante del arte'],
    palette: {
      primary: '#B83B5E',
      secondary: '#E87A90',
      bgGradient: 'linear-gradient(145deg, #781832 0%, #a82e4f 50%, #d85c7d 100%)',
      textColor: '#FFFFFF',
      accentColor: '#FFE4E6'
    },
    pairing: 'Merengue francés crocante por fuera y suave por dentro, frutos rojos frescos y chantilly.',
    productLink: '/productos',
    productName: 'Pavlova Silvestre con Frutos Rojos',
    couponCode: 'PAVLOVA10',
    couponDiscount: '10% OFF en tu pedido dulce'
  },
  macaron: {
    id: 'macaron',
    name: 'Macaron Francés de Pistacho',
    archetype: 'La Esencia Chic & Sofisticada',
    emoji: '🥐',
    tagline: 'Elegante, cosmopolita y devoto/a de los detalles.',
    description:
      'Sabés que la verdadera magia vive en la armonía de los pequeños detalles. Tenés un gusto exquisito, te gusta viajar con el paladar y valorás lo artesanal por sobre lo masivo. Tu compañía siempre es una lección de buen gusto y conversación cautivante.',
    traits: ['Detallista', 'Cosmopolita', 'Gusto refinado', 'Misterioso/a'],
    palette: {
      primary: '#3F6144',
      secondary: '#6E9374',
      bgGradient: 'linear-gradient(145deg, #223825 0%, #3a5c3e 50%, #5d8262 100%)',
      textColor: '#FFFFFF',
      accentColor: '#F5DEB3'
    },
    pairing: 'Harina fina de almendras, ganache sedosa de pistacho puro y corazón de frambuesa.',
    productLink: '/productos',
    productName: 'Caja Degustación de Macarons Franceses',
    couponCode: 'MACARON10',
    couponDiscount: '10% OFF en tu pedido dulce'
  },
  lemonpie: {
    id: 'lemonpie',
    name: 'Lemon Pie Clásico Merengado',
    archetype: 'La Chispa Radiante & Espontánea',
    emoji: '🍋',
    tagline: 'Vibrante, fresco y lleno de energía contagiosa.',
    description:
      'Sos un rayo de sol para quienes te rodean. Tu sentido del humor, espontaneidad y entusiasmo transforman cualquier día gris en una fiesta. Sabés equilibrar la agudeza y la dulzura a la perfección, dejando siempre sonrisas a tu paso.',
    traits: ['Optimista incansable', 'Espontáneo/a', 'Risas garantizadas', 'Energía positiva'],
    palette: {
      primary: '#855E00',
      secondary: '#B8860B',
      bgGradient: 'linear-gradient(145deg, #4d3600 0%, #7a5704 50%, #a67c12 100%)',
      textColor: '#FFFFFF',
      accentColor: '#FFF3B0'
    },
    pairing: 'Masa sablée crocante de manteca, curd cítrico intenso y merengue flameado.',
    productLink: '/productos',
    productName: 'Lemon Pie Artesanal con Merengue Tostado',
    couponCode: 'LEMON10',
    couponDiscount: '10% OFF en tu pedido dulce'
  },
  cheesecake: {
    id: 'cheesecake',
    name: 'Cheesecake de Frutos del Bosque',
    archetype: 'El Equilibrio Perfecto & Cálido',
    emoji: '🫐',
    tagline: 'Armonioso/a, sereno/a y amigable.',
    description:
      'Sos la persona equilibrada y sensata a la que todos recurren en busca de un buen consejo. Amás la tranquilidad, los encuentros íntimos y las charlas largas. Tu presencia transmite paz, consistencia y una ternura genuina.',
    traits: ['Equilibrado/a', 'Gran consejero/a', 'Cálido/a y paciente', 'Hogar andante'],
    palette: {
      primary: '#4B3869',
      secondary: '#735C94',
      bgGradient: 'linear-gradient(145deg, #2b1f3d 0%, #473263 50%, #684f8c 100%)',
      textColor: '#FFFFFF',
      accentColor: '#E6DDF2'
    },
    pairing: 'Base de galleta especiada, crema de queso horneada suave y coulis silvestre casero.',
    productLink: '/productos',
    productName: 'New York Cheesecake con Frutos del Bosque',
    couponCode: 'CHEESECAKE10',
    couponDiscount: '10% OFF en tu pedido dulce'
  }
};

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: '¿Cuál es tu momento ideal para disfrutar de una pausa?',
    subtitle: 'Elige el instante que mejor describe tu ritmo interior',
    options: [
      {
        text: 'Noche de festejo íntimo, velas encendidas y buena música',
        icon: '🌙',
        profile: 'matilda'
      },
      {
        text: 'Tarde templada al aire libre, contemplando el atardecer',
        icon: '🌅',
        profile: 'pavlova'
      },
      {
        text: 'Mañana elegante en un café escondido leyendo algo inspirador',
        icon: '☕',
        profile: 'macaron'
      },
      {
        text: 'Reunión improvisada con amigos donde no paran las risas',
        icon: '🎉',
        profile: 'lemonpie'
      },
      {
        text: 'Domingo de relax total con una infusión y mantita',
        icon: '🛋️',
        profile: 'cheesecake'
      }
    ]
  },
  {
    id: 2,
    question: '¿Cómo te describirían tus personas más cercanas?',
    subtitle: 'Tu mayor huella en quienes te rodean',
    options: [
      {
        text: 'Intenso/a, apasionado/a y con un corazón enorme que protege a los suyos',
        icon: '❤️',
        profile: 'matilda'
      },
      {
        text: 'Sensible, creativo/a y con una calidez suave que reconforta el alma',
        icon: '✨',
        profile: 'pavlova'
      },
      {
        text: 'Sofisticado/a, observador/a y con un gusto impecable para cada detalle',
        icon: '💎',
        profile: 'macaron'
      },
      {
        text: 'La chispa del grupo, siempre con ocurrencias y energía radiante',
        icon: '⚡',
        profile: 'lemonpie'
      },
      {
        text: 'Paz absoluta, confiable, el mejor hombro y consejero/a',
        icon: '🌿',
        profile: 'cheesecake'
      }
    ]
  },
  {
    id: 3,
    question: 'Si tuvieras un pasaje abierto hoy, ¿dónde te gustaría despertar?',
    subtitle: 'El paisaje que conecta con tus emociones',
    options: [
      {
        text: 'Una cabaña de madera en un bosque nevado con fuego de leña crepitante',
        icon: '🌲',
        profile: 'matilda'
      },
      {
        text: 'Un campo de flores silvestres en los Alpes durante la primavera',
        icon: '🌸',
        profile: 'pavlova'
      },
      {
        text: 'Un balcón de hierro forjado en París con vistas al río Sena',
        icon: '🗼',
        profile: 'macaron'
      },
      {
        text: 'Una costa mediterránea bañada por el sol con aromas a limoneros',
        icon: '🍋',
        profile: 'lemonpie'
      },
      {
        text: 'Una casa de té vintage en un pueblito pintoresco de campiña',
        icon: '🏡',
        profile: 'cheesecake'
      }
    ]
  },
  {
    id: 4,
    question: '¿Qué tipo de sabores provocan un flechazo inmediato en vos?',
    subtitle: 'La combinación que hace sonreír a tu paladar',
    options: [
      {
        text: 'Mucho chocolate oscuro, capas untuosas y dulzura intensa y envolvente',
        icon: '🍫',
        profile: 'matilda'
      },
      {
        text: 'Texturas crocantes combinadas con frutas frescas y cremas livianas',
        icon: '🍓',
        profile: 'pavlova'
      },
      {
        text: 'Frutos secos nobles, toques florales y contrastes agridulces sutiles',
        icon: '🌰',
        profile: 'macaron'
      },
      {
        text: 'Acidez refrescante, notas cítricas vivas y un dulce tostado',
        icon: '🍋',
        profile: 'lemonpie'
      },
      {
        text: 'La cremosidad aterciopelada y el balance perfecto entre dulce y suave',
        icon: '🫐',
        profile: 'cheesecake'
      }
    ]
  },
  {
    id: 5,
    question: '¿Cuál de estas frases resuena más con tu forma de ver la vida?',
    subtitle: 'Tu pequeño manifiesto personal',
    options: [
      {
        text: '"Todo lo que hagas, hacelo con el corazón completo y sin miedo."',
        icon: '🔥',
        profile: 'matilda'
      },
      {
        text: '"La belleza existe para quienes saben mirar con ternura."',
        icon: '🕊️',
        profile: 'pavlova'
      },
      {
        text: '"La elegancia no es hacerse notar, sino ser inolvidable."',
        icon: '👑',
        profile: 'macaron'
      },
      {
        text: '"Sonreír es un superpoder que transforma cualquier situación."',
        icon: '☀️',
        profile: 'lemonpie'
      },
      {
        text: '"La verdadera riqueza es la calma y los vínculos genuinos."',
        icon: '🌱',
        profile: 'cheesecake'
      }
    ]
  }
];

// Algoritmo de cálculo del resultado según las respuestas
export const calculatePersonalityResult = (answers) => {
  const counts = {
    matilda: 0,
    pavlova: 0,
    macaron: 0,
    lemonpie: 0,
    cheesecake: 0
  };

  answers.forEach((profileKey) => {
    if (counts[profileKey] !== undefined) {
      counts[profileKey] += 1;
    }
  });

  // Encontrar el perfil con más votos; en caso de empate, el primero ponderado
  let maxProfile = 'pavlova';
  let maxCount = -1;

  Object.entries(counts).forEach(([profile, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxProfile = profile;
    }
  });

  return PERSONALITY_PROFILES[maxProfile] || PERSONALITY_PROFILES.pavlova;
};
