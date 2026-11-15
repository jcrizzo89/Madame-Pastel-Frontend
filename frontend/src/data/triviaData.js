// Banco de preguntas y categorías para la Trivia Pastelera de Madame Pastel
// Preguntas redactadas con encanto boutique, curiosidades culinarias y secretos de pastelería.

export const TRIVIA_QUESTIONS = [
  {
    id: 1,
    category: 'Pastelería Francesa',
    categoryIcon: '🥐',
    question: '¿Cuál es el ingrediente base que le da su textura esponjosa y crujiente al macaron francés tradicional?',
    options: [
      'Harina de trigo leudante',
      'Harina de almendras y claras batidas',
      'Fécula de maíz y yemas',
      'Harina de avena tostada'
    ],
    correctIndex: 1,
    explanation: 'El auténtico macaron francés se elabora con tant pour tant (partes iguales de harina de almendras finamente tamizada y azúcar glas) junto con merengue.'
  },
  {
    id: 2,
    category: 'Mundo del Chocolate',
    categoryIcon: '🍫',
    question: '¿Cómo se llama la técnica de fundir y enfriar el chocolate para que quede brillante y crujiente al morderlo?',
    options: [
      'Caramelizado',
      'Templado o atemperado',
      'Emulsión láctea',
      'Glaseado espejado'
    ],
    correctIndex: 1,
    explanation: 'El templado alinea los cristales de manteca de cacao en su forma beta más estable, otorgándole brillo sedoso y ese "crack" irresistible.'
  },
  {
    id: 3,
    category: 'Secretos de Horneo',
    categoryIcon: '🧁',
    question: '¿Por qué nunca se debe abrir el horno durante los primeros 20 minutos al hornear un bizcochuelo?',
    options: [
      'Porque el vapor escapa y la masa pierde estructura antes de cuajar',
      'Porque el molde se descalibra con el aire frío',
      'Porque el azúcar se carameliza demasiado rápido',
      'Porque cambia el color del glaseado'
    ],
    correctIndex: 0,
    explanation: 'El golpe de aire frío reduce la presión y temperatura dentro del horno, haciendo que las burbujas de gas colapsen antes de que las proteínas del huevo y el almidón fijen la estructura.'
  },
  {
    id: 4,
    category: 'Pastelería Clásica',
    categoryIcon: '🍰',
    question: '¿Qué famosa crema pastelera enriquecida con manteca pomada se utiliza típicamente en la clásica tarta Fraisier?',
    options: [
      'Crema Diplomata',
      'Crema Mousseline',
      'Crema Chantilly',
      'Crema Chiboust'
    ],
    correctIndex: 1,
    explanation: 'La crema Mousseline es una base de pastelera emulsionada con manteca de excelente calidad, logrando una textura aterciopelada y firme para sostener frutillas.'
  },
  {
    id: 5,
    category: 'Sabores & Maridajes',
    categoryIcon: '🍓',
    question: '¿Qué fruta cítrica y aromática es la compañera perfecta para equilibrar la dulzura del chocolate blanco?',
    options: [
      'Banana madura',
      'Fruta de la pasión (Maracuyá) o frambuesa',
      'Manzana roja dulce',
      'Higo en almíbar'
    ],
    correctIndex: 1,
    explanation: 'La acidez viva y los aromas exóticos del maracuyá o la frambuesa cortan y equilibran la untuosidad y dulzor de la manteca de cacao del chocolate blanco.'
  },
  {
    id: 6,
    category: 'Masa & Hojaldre',
    categoryIcon: '🥐',
    question: '¿Cuántas capas de masa y manteca puede llegar a tener un hojaldre francés clásico tras sus 6 vueltas simples?',
    options: [
      'Apenas 12 capas',
      'Más de 700 finas capas superpuestas',
      'Exactamente 50 capas',
      '24 capas gruesas'
    ],
    correctIndex: 1,
    explanation: 'Gracias al doblado geométrico sucesivo, un hojaldre tradicional alcanza entre 729 y más de 1.000 micro-láminas separadas por finas capas de manteca.'
  },
  {
    id: 7,
    category: 'Historia Dulce',
    categoryIcon: '👑',
    question: '¿En honor a qué célebre bailarina rusa se creó el delicado postre de merengue crujiente y frutos rojos?',
    options: [
      'Maya Plisétskaya',
      'Anna Pávlova',
      'Galina Ulánova',
      'Olga Spessívtseva'
    ],
    correctIndex: 1,
    explanation: 'La Pavlova fue creada en la década de 1920 durante una gira de la bailarina Anna Pávlova por Oceanía, inspirada en la levedad y blancura de su tutú.'
  },
  {
    id: 8,
    category: 'Técnicas de Pastelería',
    categoryIcon: '🍋',
    question: '¿Cuál es el secreto para lograr un merengue suizo brillante y sin granos de azúcar?',
    options: [
      'Disolver el azúcar con las claras a baño María hasta que no se sientan cristales antes de batir',
      'Batir las claras congeladas con azúcar impalpable',
      'Agregar jugo de limón antes de prender el fuego',
      'Hornear las claras líquidas directamente'
    ],
    correctIndex: 0,
    explanation: 'El merengue suizo calienta las claras con el azúcar a baño María (aprox. 55°C-60°C) para disolver completamente los cristales y pasteurizar las claras antes de montarlo a picos firmes.'
  },
  {
    id: 9,
    category: 'Masa Choux',
    categoryIcon: '✨',
    question: '¿Qué delicia clásica de la pastelería francesa se elabora cocinando dos veces la masa (primero en cacerola y luego en horno)?',
    options: [
      'Los Profiteroles y Éclairs (Masa Choux)',
      'El Panettone',
      'El Brownie con nueces',
      'El Alfajor de maicena'
    ],
    correctIndex: 0,
    explanation: 'La masa choux es única porque primero se seca en olla al fuego para gelatinizar el almidón y luego se hornea a alta temperatura para que el vapor la infle por dentro.'
  },
  {
    id: 10,
    category: 'Arte en Chocolate',
    categoryIcon: '🍫',
    question: '¿Qué es una Ganache en su versión clásica?',
    options: [
      'Una mezcla emulsionada de chocolate picado y crema de leche caliente',
      'Una mermelada reducida con cacao amargo',
      'Una mousse congelada con gelatina',
      'Un almíbar espeso con licor'
    ],
    correctIndex: 0,
    explanation: 'La ganache clásica es una emulsión sedosa de crema tibia vertida sobre chocolate cobertura, ideal para rellenos, coberturas y trufas.'
  },
  {
    id: 11,
    category: 'Ingredientes Nobles',
    categoryIcon: '🌿',
    question: '¿De dónde proviene la verdadera vainilla Bourbon utilizada en la alta repostería?',
    options: [
      'De la orquídea Vanilla planifolia cultivada en Madagascar y las islas del Índico',
      'De las raíces secas de un árbol de eucalipto',
      'De semillas tostadas de cacao blanco',
      'De un licor destilado de cerezas'
    ],
    correctIndex: 0,
    explanation: 'La vainilla es el fruto curado de una orquídea tropical trepadora. Madagascar y la isla de Reunión (antigua Île Bourbon) son las mayores cunas de esta especia preciosa.'
  },
  {
    id: 12,
    category: 'Secretos de Horneo',
    categoryIcon: '🌡️',
    question: 'A la hora de hacer un cheesecake horneado estilo New York, ¿cuál es el mejor método para evitar grietas en la superficie?',
    options: [
      'Hornearlo a fuego máximo durante 15 minutos',
      'Cocinarlo a baño María a baja temperatura y dejarlo enfriar dentro del horno apagado',
      'Pincharlo con un tenedor cada 10 minutos',
      'Desmoldarlo inmediatamente al sacarlo del horno'
    ],
    correctIndex: 1,
    explanation: 'El baño María proporciona calor suave y humedad constante, y el enfriamiento lento en el horno apagado previene el choque térmico que causa las rajaduras.'
  },
  {
    id: 13,
    category: 'Pastelería Clásica',
    categoryIcon: '🎂',
    question: '¿Qué postre tradicional francés lleva capas de bizcocho Joconde embebido en café, ganache y crema de manteca al café?',
    options: [
      'Torta Ópera',
      'Selva Negra',
      'Saint-Honoré',
      'Tarta Tatin'
    ],
    correctIndex: 0,
    explanation: 'La Torta Ópera, creada por la prestigiosa pastelería Dalloyau en París, fue bautizada así en tributo a la Ópera Garnier de París.'
  },
  {
    id: 14,
    category: 'Curiosidades Dulces',
    categoryIcon: '🍎',
    question: '¿Cómo nació la famosa Tarta Tatin de manzanas caramelizadas?',
    options: [
      'Fue creada por un chef real para Luis XIV',
      'Por un delicioso error fortuito de las hermanas Tatin en su hotel francés',
      'En un concurso de cocina en Lyon en 1950',
      'Fue un encargo de la emperatriz Josefina'
    ],
    correctIndex: 1,
    explanation: 'Stéphanie Tatin cocinaba manzanas con manteca y azúcar; al notar que se pasaban de cocción, colocó masa por encima para salvarlas y las horneó al revés. ¡Nació un ícono mundial!'
  },
  {
    id: 15,
    category: 'Química Repostera',
    categoryIcon: '🧪',
    question: '¿Cuál es la diferencia principal entre el bicarbonato de sodio y el polvo de hornear?',
    options: [
      'El bicarbonato necesita un ácido para activarse; el polvo de hornear ya contiene su propio ácido',
      'El bicarbonato es dulce y el polvo de hornear salado',
      'El polvo de hornear solo funciona en masas frías',
      'No hay ninguna diferencia, son exactamente lo mismo'
    ],
    correctIndex: 0,
    explanation: 'El bicarbonato requiere un componente ácido (limón, yogur, cacao natural) para generar dióxido de carbono; el polvo de hornear es una mezcla de bicarbonato con sales ácidas lista para actuar.'
  },
  {
    id: 16,
    category: 'Pastelería Moderna',
    categoryIcon: '✨',
    question: '¿Qué ingrediente es fundamental para lograr el brillo de espejo en un glaseado "mirror glaze" de tortas modernas?',
    options: [
      'Gelatina hidratada, glucosa y chocolate blanco o leche condensada',
      'Claras a nieve con maicena',
      'Aceite de coco puro sin calentar',
      'Azúcar morena reducida'
    ],
    correctIndex: 0,
    explanation: 'La gelatina con glucosa y chocolate crea una película elástica, ultra reflectante y brillante que sella la torta congelada como una gema pulida.'
  },
  {
    id: 17,
    category: 'Tradición & Fiestas',
    categoryIcon: '🎄',
    question: '¿Qué tronco dulce relleno tradicional se sirve en Francia durante la cena de Nochebuena?',
    options: [
      'Bûche de Noël (Tronco de Navidad)',
      'Galette des Rois',
      'Canelé de Bordeaux',
      'Madeleines'
    ],
    correctIndex: 0,
    explanation: 'El Bûche de Noël evoca el antiguo leño de madera que las familias quemaban en el hogar para atraer salud y prosperidad al nuevo año.'
  },
  {
    id: 18,
    category: 'Sabores Madame Pastel',
    categoryIcon: '🍋',
    question: '¿Qué es el "Lemon Curd" tan utilizado en tartaletas finas y rellenos de macarons?',
    options: [
      'Una crema suave inglesa emulsionada con jugo y ralladura de limón, azúcar, manteca y huevos',
      'Un licor de limón espesado con harina',
      'Una jalea transparente sin huevo ni manteca',
      'Helado de limón derretido'
    ],
    correctIndex: 0,
    explanation: 'El lemon curd es una crema untuosa y brillante donde el jugo y la cáscara del limón aportan un balance cítrico intenso suavizado con manteca fría al final.'
  },
  {
    id: 19,
    category: 'Ingredientes Nobles',
    categoryIcon: '🌰',
    question: '¿Qué es el "Praliné" en la pastelería fina?',
    options: [
      'Una pasta untuosa de frutos secos (avellanas/almendras) caramelizados y triturados a piedra',
      'Chocolate blanco teñido con colorante verde',
      'Un merengue seco con canela molida',
      'Un jarabe espeso a base de vino dulce'
    ],
    correctIndex: 0,
    explanation: 'El praliné combina frutos secos tostados envueltos en caramelo rubio que se procesan hasta que los aceites naturales forman una pasta cremosa y aromática inigualable.'
  },
  {
    id: 20,
    category: 'Curiosidades Dulces',
    categoryIcon: '🧁',
    question: '¿Por qué los Canelés de Burdeos tienen esa forma estriada y corteza crocante caramelizada?',
    options: [
      'Se hornean en moldes de cobre tradicionales untados con cera de abeja y manteca',
      'Se fríen en aceite de almendras',
      'Se sumergen en almíbar hirviendo tras salir del horno',
      'Se moldean a mano con azúcar quemada'
    ],
    correctIndex: 0,
    explanation: 'Los moldes estriados de cobre conducen el calor de forma perfecta y la cera de abejas comestible crea esa corteza crujiente y aroma a vainilla y ron inolvidable.'
  }
];

// Rangos y Cupones según el puntaje obtenido (sobre 5 o 6 preguntas)
export const getTriviaRankAndReward = (score, total) => {
  const percentage = (score / total) * 100;

  if (percentage === 100) {
    return {
      rankTitle: 'Gran Maître Pâtissier 👑',
      badge: 'PUNTAJE PERFECTO',
      description: '¡Impresionante! Tenés la precisión, el paladar y el conocimiento de un auténtico maestro de la alta pastelería francesa.',
      couponCode: 'MAESTRO15',
      discountLabel: '15% de Descuento',
      minSpend: 'Válido para tu próxima compra en Madame Pastel.',
      stars: 5,
      level: 'expert'
    };
  }

  if (percentage >= 65) {
    return {
      rankTitle: 'Chef Pâtissier Aficionado 🧁',
      badge: 'NIVEL DESTACADO',
      description: '¡Excelente desempeño! Demostraste un gran ojo para los secretos de repostería y la combinación de sabores nobles.',
      couponCode: 'SOUSCHEF10',
      discountLabel: '10% de Descuento',
      minSpend: 'Válido para cualquier producto de la tienda.',
      stars: 4,
      level: 'intermediate'
    };
  }

  return {
    rankTitle: 'Aprendiz de la Dulzura 🥐',
    badge: 'ESPÍRITU PASTELERO',
    description: '¡Buen intento! Cada gran pastelero empezó con harina en las manos y curiosidad en el corazón. ¡Te regalamos un mimo dulce!',
    couponCode: 'PASTELERO5',
    discountLabel: '5% de Descuento',
    minSpend: 'Válido para tentar tu paladar con Madame Pastel.',
    stars: 3,
    level: 'beginner'
  };
};

// Obtener un set aleatorio de preguntas
export const getRandomTriviaQuestions = (count = 5) => {
  const shuffled = [...TRIVIA_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
