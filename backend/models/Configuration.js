const mongoose = require('mongoose');

const ConfigurationSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'Madame Pastel'
  },
  logoUrl: {
    type: String,
    default: '/logo-madame-pastel.jpeg'
  },
  primaryColor: {
    type: String,
    default: '#d94f70'
  },
  secondaryColor: {
    type: String,
    default: '#f8d7da'
  },
  socialLinks: {
    instagram: {
      type: String,
      default: 'https://www.instagram.com/madamepastelmdp'
    },
    facebook: {
      type: String,
      default: ''
    },
    whatsapp: {
      type: String,
      default: '+5492235512021'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: 'Mar del Plata, Argentina'
    }
  },
  deliveryOptions: {
    pickup: {
      enabled: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
        default: 'Puedes retirar tu pedido en nuestra tienda'
      }
    },
    delivery: {
      enabled: {
        type: Boolean,
        default: true
      },
      fee: {
        type: Number,
        default: 0
      },
      freeOver: {
        type: Number,
        default: 0
      },
      message: {
        type: String,
        default: 'Costo y zona de envío a confirmar por WhatsApp'
      }
    }
  },
  paymentOptions: {
    mercadoPago: {
      enabled: {
        type: Boolean,
        default: true
      }
    },
    bankTransfer: {
      enabled: {
        type: Boolean,
        default: true
      },
      accountDetails: {
        type: String,
      default: ''
      }
    },
    cashOnDelivery: {
      enabled: {
        type: Boolean,
        default: true
      }
    }
  },
  siteSettings: {
    homepageTitle: {
      type: String,
      default: 'Madame Pastel'
    },
    homepageDescription: {
      type: String,
      default: 'Armá tu torta personalizada y coordiná el envío por WhatsApp.'
    },
    homepageAboutTitle: {
      type: String,
      default: 'Una torta hecha para tu momento'
    },
    homepageAboutDescription: {
      type: String,
      default: 'Elegí tamaño, sabor de bizcochuelo, dos rellenos y decoración. La decoración personalizada se cotiza por WhatsApp.'
    },
    metaDescription: {
      type: String,
      default: 'Madame Pastel - Pastelería artesanal en Mar del Plata. Tortas, cupcakes, macarons y más.'
    },
    featuredCategories: {
      type: [String],
      default: []
    }
  },
  businessHours: {
    monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
    tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
    wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
    thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
    friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
    saturday: { open: { type: String, default: '10:00' }, close: { type: String, default: '14:00' }, closed: { type: Boolean, default: false } },
    sunday: { open: { type: String, default: '00:00' }, close: { type: String, default: '00:00' }, closed: { type: Boolean, default: true } }
  },
  orderSettings: {
    minimumOrderAmount: {
      type: Number,
      default: 0
    },
    preOrderDays: {
      type: Number,
      default: 2
    },
    orderNotificationEmail: {
      type: String,
      default: ''
    },
    termsAndConditions: {
      type: String,
      default: 'Términos y condiciones para pedidos en Madame Pastel.'
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Asegurar que solo haya una configuración marcada como predeterminada
ConfigurationSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);
