const mongoose = require('mongoose');

const StatisticSchema = new mongoose.Schema({
  // Estadísticas de visitas
  pageVisits: {
    home: { type: Number, default: 0 },
    products: { type: Number, default: 0 },
    cart: { type: Number, default: 0 },
    checkout: { type: Number, default: 0 },
    contact: { type: Number, default: 0 },
    promotions: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  
  // Productos vistos
  productViews: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  
  // Productos comprados
  productPurchases: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    count: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  }],
  
  // Ventas diarias
  dailySales: [{
    date: {
      type: Date
    },
    count: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  }],
  
  // Datos demográficos básicos (opcional, según la información que recopiles)
  demographics: {
    devices: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 }
    },
    referrers: [{
      source: String,
      count: { type: Number, default: 0 }
    }]
  },
  
  // Última actualización
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Statistic', StatisticSchema);
