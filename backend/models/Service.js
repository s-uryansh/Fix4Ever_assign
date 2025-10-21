const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  price: Number,
  category: {
    type: String,
    enum: ['electronics', 'appliances', 'plumbing', 'electrical', 'home', 'other'],
    default: 'other'
  },
  estimatedDuration: {
    type: Number,
    default: 60
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Service", serviceSchema);