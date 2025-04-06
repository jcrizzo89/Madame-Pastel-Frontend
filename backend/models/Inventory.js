const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  initialStock: {
    type: Number,
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  pendingProduction: {
    type: Number,
    default: 0
  },
  reorderLevel: {
    type: Number,
    default: 5
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
