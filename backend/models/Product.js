const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  isPromotion: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  // Campos para promociones temporales
  seasonalPromotion: {
    type: Boolean,
    default: false
  },
  promotionStartDate: {
    type: Date,
    default: null
  },
  promotionEndDate: {
    type: Date,
    default: null
  },
  promotionName: {
    type: String,
    default: ''
  },
  promotionDescription: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  ingredients: [String],
  allergens: [String],
  preparationTime: {
    type: Number,  // En horas
    default: 24
  }
}, { timestamps: true });

// Método virtual para comprobar si la promoción está activa
ProductSchema.virtual('isPromotionActive').get(function() {
  if (!this.seasonalPromotion) return false;
  
  const now = new Date();
  const startDate = this.promotionStartDate ? new Date(this.promotionStartDate) : null;
  const endDate = this.promotionEndDate ? new Date(this.promotionEndDate) : null;
  
  if (!startDate || !endDate) return false;
  
  return now >= startDate && now <= endDate;
});

// Asegurarse de que los virtuals se incluyen cuando convertimos a JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);
