// Constants para la aplicación

// Rutas de imágenes de marcadores de posición
export const PLACEHOLDER_IMAGES = {
  PRODUCT_SMALL: '/images/placeholders/product-300x300.jpg',
  PRODUCT_LARGE: '/images/placeholders/product-600x400.jpg',
  PROMO: '/images/placeholders/promo-600x400.jpg',
  INSTAGRAM: '/images/placeholders/instagram-300x300.jpg',
  ABOUT: '/images/placeholders/about-600x400.jpg'
};

// URLs para API
export const API_URL = 'http://localhost:5000/api';
export const API_BASE_URL = API_URL;  // Para mantener compatibilidad con código existente
export const API_ENDPOINTS = {
  PRODUCTS: `${API_URL}/products`,
  ORDERS: `${API_URL}/orders`,
  PAYMENTS: {
    PREFERENCE: `${API_URL}/payments/preference`,
    TRANSFER: `${API_URL}/payments/transfer`,
    WEBHOOK: `${API_URL}/payments/webhook`
  },
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    VERIFY: `${API_URL}/auth/verify`
  },
  STATISTICS: {
    SUMMARY: `${API_URL}/statistics/summary`,
    MOST_VIEWED: `${API_URL}/statistics/most-viewed`,
    MOST_SOLD: `${API_URL}/statistics/most-sold`,
    PAGE_VISIT: `${API_URL}/statistics/page-visit`,
    PRODUCT_VIEW: `${API_URL}/statistics/product-view`,
    DEVICE_TYPE: `${API_URL}/statistics/device-type`
  },
  INVENTORY: `${API_URL}/inventory`
};

// Datos de contacto
export const CONTACT_INFO = {
  PHONE: '(+54) 9 223 551-2021',
  WHATSAPP: '+5492235512021',
  EMAIL: 'contacto@madamepastel.com',
  ADDRESS: 'Buenos Aires 1234, Mar del Plata, Argentina',
  INSTAGRAM: 'https://www.instagram.com/madamepastelmdp',
  BUSINESS_HOURS: [
    { day: 'Lunes a Viernes', hours: '9:00 - 19:00' },
    { day: 'Sábados', hours: '9:00 - 14:00' },
    { day: 'Domingos', hours: 'Cerrado' }
  ]
};

// Categorías de productos
export const PRODUCT_CATEGORIES = [
  'Tortas',
  'Cupcakes',
  'Cookies',
  'Postres',
  'Box Dulces',
  'Eventos Especiales'
];

// Métodos de pago
export const PAYMENT_METHODS = {
  MERCADO_PAGO: 'mercadopago',
  TRANSFER: 'transfer'
};

// Opciones de entrega
export const DELIVERY_OPTIONS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery'
};
