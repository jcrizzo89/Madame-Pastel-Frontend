// Datos iniciales de productos tradicionales de Madame Pastel

const categories = [
  {
    name: 'Tortas',
    description: 'Tortas clásicas, cheesecakes y tartas artesanales para tus momentos dulces.',
    image: '/images/products/torta-marquise.jpg'
  },
  {
    name: 'Box Dulces',
    description: 'Cajas especiales de degustación y desayunos completos para regalar.',
    image: '/images/products/box-degustacion.jpg'
  },
  {
    name: 'Cookies',
    description: 'Cookies estilo New York y alfajores marplatenses artesanales.',
    image: '/images/products/cookies-nyc.jpg'
  },
  {
    name: 'Cupcakes',
    description: 'Cupcakes individuales con rellenos intensos y coberturas suaves.',
    image: '/images/products/cupcakes-vainilla.jpg'
  },
  {
    name: 'Postres',
    description: 'Tartas individuales, postres clásicos y vasitos de degustación.',
    image: '/images/products/tarta-tofi.jpg'
  },
  {
    name: 'Tortas personalizadas',
    description: 'Diseños a medida con bizcochuelos, rellenos y decoraciones elegidos por vos.',
    image: '/images/torta-personalizada-ilustrativa.png'
  }
];

const products = [
  // --- TORTAS ---
  {
    seedKey: 'trad-torta-marquise',
    filename: 'torta-marquise.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
    name: 'Torta Marquise de Chocolate con Frutos Rojos',
    description: 'Base húmeda de chocolate belga sin harina, abundante dulce de leche repostero premium, suave crema chantilly y corona de frutos rojos frescos de estación.',
    price: 34000,
    category: 'Tortas',
    stock: 10,
    featured: true,
    isPromotion: false,
    ingredients: ['Chocolate semiamargo', 'Dulce de leche repostero', 'Crema chantilly', 'Frutillas', 'Arándanos', 'Huevos'],
    allergens: ['Huevo', 'Lácteos'],
    preparationTime: 24
  },
  {
    seedKey: 'trad-lemon-pie',
    filename: 'lemon-pie.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=800&auto=format&fit=crop&q=80',
    name: 'Lemon Pie Madame Pastel',
    description: 'Clásica masa sableé crocante de manteca, suave curd de limón natural de textura aterciopelada, coronado con merengue italiano gratinado al soplete.',
    price: 28000,
    category: 'Tortas',
    stock: 12,
    featured: true,
    isPromotion: false,
    ingredients: ['Limón natural', 'Manteca', 'Harina', 'Azúcar', 'Huevos', 'Merengue italiano'],
    allergens: ['Gluten', 'Huevo', 'Lácteos'],
    preparationTime: 24
  },
  {
    seedKey: 'trad-rogel-tradicional',
    filename: 'rogel-tradicional.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop&q=80',
    name: 'Rogel Tradicional Argentino',
    description: 'Ocho finas capas de masa crocante artesanal intercaladas con abundante dulce de leche colonial, cubierto con merengue italiano sedoso.',
    price: 32000,
    category: 'Tortas',
    stock: 8,
    featured: true,
    isPromotion: false,
    ingredients: ['Dulce de leche colonial', 'Masa crocante casera', 'Merengue italiano'],
    allergens: ['Gluten', 'Huevo', 'Lácteos'],
    preparationTime: 24
  },
  {
    seedKey: 'trad-cheesecake-frutos-rojos',
    filename: 'cheesecake-frutos-rojos.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
    name: 'Cheesecake New York con Frutos del Bosque',
    description: 'Receta auténtica horneada a baño María, base crocante de galletas especiadas y queso crema suave, decorado con coulis artesanal de frutos del bosque.',
    price: 36000,
    category: 'Tortas',
    stock: 6,
    featured: false,
    isPromotion: false,
    ingredients: ['Queso crema', 'Galletitas', 'Manteca', 'Frutos rojos', 'Azúcar'],
    allergens: ['Gluten', 'Lácteos', 'Huevo'],
    preparationTime: 24
  },
  {
    seedKey: 'trad-chocotorta-especial',
    filename: 'chocotorta-especial.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
    name: 'Chocotorta Especial Madame Pastel',
    description: 'La emblemática torta argentina elevada con nuestro toque: capas de galletitas Chocolinas embebidas con suave crema de dulce de leche y queso crema.',
    price: 30000,
    category: 'Tortas',
    stock: 10,
    featured: false,
    isPromotion: false,
    ingredients: ['Chocolinas', 'Dulce de leche repostero', 'Queso crema', 'Cacao'],
    allergens: ['Gluten', 'Lácteos'],
    preparationTime: 24
  },

  // --- BOX DULCES ---
  {
    seedKey: 'trad-box-degustacion',
    filename: 'box-degustacion.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80',
    name: 'Box Degustación Madame Pastel',
    description: 'La selección perfecta para compartir o regalar: 2 mini brownies con nuez y dulce de leche, 2 mini lemon pies, 4 alfajorcitos de maicena y 2 cookies rellenas de Nutella.',
    price: 26000,
    category: 'Box Dulces',
    stock: 15,
    featured: true,
    isPromotion: true,
    discountPercentage: 15,
    ingredients: ['Mini brownies', 'Mini lemon pies', 'Alfajores de maicena', 'Cookies'],
    allergens: ['Gluten', 'Lácteos', 'Huevo', 'Frutos secos'],
    preparationTime: 24
  },
  {
    seedKey: 'trad-box-desayuno',
    filename: 'box-desayuno.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    name: 'Box Desayuno / Merienda Especial',
    description: 'Presentado en caja de regalo con visor y cinta: 1 mini cake a elección, 2 alfajores marplatenses de chocolate, 2 scones de queso parmesano, 2 cookies con chips y jugo natural.',
    price: 38000,
    category: 'Box Dulces',
    stock: 8,
    featured: true,
    isPromotion: false,
    ingredients: ['Mini cake', 'Alfajores artesanales', 'Scones de queso', 'Cookies', 'Jugo natural'],
    allergens: ['Gluten', 'Lácteos', 'Huevo'],
    preparationTime: 48
  },

  // --- COOKIES & ALFAJORES ---
  {
    seedKey: 'trad-cookies-nyc',
    filename: 'cookies-nyc.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80',
    name: 'Cookies NYC con Chips y Nueces (Pack x 4)',
    description: 'Cookies estilo New York de 120g cada una: crocantes en los bordes, centro suave y fundente, repletas de chocolate semiamargo y nueces tostadas.',
    price: 12000,
    category: 'Cookies',
    stock: 20,
    featured: false,
    isPromotion: true,
    discountPercentage: 10,
    ingredients: ['Chocolate belga', 'Nueces tostadas', 'Manteca', 'Azúcar rubia', 'Harina'],
    allergens: ['Gluten', 'Frutos secos', 'Huevo', 'Lácteos'],
    preparationTime: 12
  },
  {
    seedKey: 'trad-cookies-red-velvet',
    filename: 'cookies-red-velvet.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
    name: 'Cookies Red Velvet & Chocolate Blanco (Pack x 4)',
    description: 'Galletas suaves y aterciopeladas de Red Velvet con abundante chocolate blanco premium y notas de vainilla.',
    price: 12500,
    category: 'Cookies',
    stock: 15,
    featured: false,
    isPromotion: false,
    ingredients: ['Cacao', 'Chocolate blanco', 'Extracto de vainilla', 'Manteca'],
    allergens: ['Gluten', 'Lácteos', 'Huevo'],
    preparationTime: 12
  },
  {
    seedKey: 'trad-alfajores-marplatenses',
    filename: 'alfajores-marplatenses.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80',
    name: 'Alfajores Marplatenses Artesanales (Caja x 6)',
    description: 'Tapas suaves de chocolate y notas cítricas, rellenas con 50 gramos de dulce de leche repostero premium y bañadas en fino chocolate semiamargo templado.',
    price: 14000,
    category: 'Cookies',
    stock: 25,
    featured: true,
    isPromotion: false,
    ingredients: ['Dulce de leche colonial', 'Chocolate semiamargo', 'Miel', 'Cacao'],
    allergens: ['Gluten', 'Lácteos', 'Huevo'],
    preparationTime: 12
  },

  // --- CUPCAKES ---
  {
    seedKey: 'trad-cupcakes-vainilla',
    filename: 'cupcakes-vainilla.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&auto=format&fit=crop&q=80',
    name: 'Pack x 6 Cupcakes Vainilla & Buttercream Pastel',
    description: 'Muffins esponjosos con vainilla natural, corazón de confitura casera de frambuesas y suave copo de buttercream suizo con perlas comestibles.',
    price: 16000,
    category: 'Cupcakes',
    stock: 12,
    featured: false,
    isPromotion: false,
    ingredients: ['Vainilla', 'Frambuesas', 'Manteca', 'Harina', 'Huevos', 'Buttercream'],
    allergens: ['Gluten', 'Lácteos', 'Huevo'],
    preparationTime: 24
  },
  {
    seedKey: 'trad-cupcakes-chocolate',
    filename: 'cupcakes-chocolate.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&auto=format&fit=crop&q=80',
    name: 'Pack x 6 Cupcakes Doble Chocolate & DDL',
    description: 'Bizcochuelo de cacao amargo holandés con centro líquido de dulce de leche y cobertura de ganache batida de chocolate.',
    price: 17000,
    category: 'Cupcakes',
    stock: 12,
    featured: false,
    isPromotion: true,
    discountPercentage: 10,
    ingredients: ['Cacao amargo', 'Dulce de leche', 'Crema', 'Chocolate'],
    allergens: ['Gluten', 'Lácteos', 'Huevo'],
    preparationTime: 24
  },

  // --- POSTRES ---
  {
    seedKey: 'trad-tarta-tofi',
    filename: 'tarta-tofi.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80',
    name: 'Tarta Tofi Artesanal',
    description: 'Masa sableé crocante, generoso colchón de dulce de leche repostero y cobertura de ganache espejo de chocolate semiamargo.',
    price: 26000,
    category: 'Postres',
    stock: 10,
    featured: false,
    isPromotion: false,
    ingredients: ['Chocolate semiamargo', 'Dulce de leche', 'Harina', 'Manteca'],
    allergens: ['Gluten', 'Lácteos'],
    preparationTime: 24
  },
  {
    seedKey: 'trad-tiramisu-copa',
    filename: 'tiramisu-copa.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80',
    name: 'Tiramisú Tradicional en Copa Individual',
    description: 'Vainillas artesanales embebidas en café espresso y licor de café, crema suave de queso mascarpone y lluvia fina de cacao amargo.',
    price: 9500,
    category: 'Postres',
    stock: 18,
    featured: false,
    isPromotion: false,
    ingredients: ['Queso mascarpone', 'Café espresso', 'Cacao amargo', 'Vainillas caseras'],
    allergens: ['Gluten', 'Lácteos', 'Huevo'],
    preparationTime: 12
  }
];

module.exports = { categories, products };
