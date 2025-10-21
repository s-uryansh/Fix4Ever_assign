const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
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
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'appliances', 'plumbing', 'electrical', 'home', 'other']
  },
  estimatedDuration: {
    type: Number, 
    required: true
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
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  }
}, { _id: true });

const technicianSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  skills: [{ 
    type: String, 
    trim: true 
  }],
  available: { 
    type: Boolean, 
    default: true 
  },
  currentLocation: {
    lat: { type: Number },
    lon: { type: Number }
  },
  phone: {
    type: String,
    required: true
  },
  experience: {
    type: Number, // years of experience
    default: 0
  }
}, { _id: true });

const vendorSchema = new mongoose.Schema({
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  businessName: { 
    type: String, 
    required: true,
    trim: true
  },
  gstNumber: { 
    type: String,
    uppercase: true,
    trim: true
  },
  address: { 
    type: String, 
    required: true 
  },
  contactEmail: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true
  },
  servicesOffered: [serviceSchema],
  technicians: [technicianSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  serviceAreas: [{
    type: String,
    trim: true
  }]
}, { 
  timestamps: true 
});

vendorSchema.index({ ownerId: 1 });
vendorSchema.index({ "servicesOffered.category": 1 });
vendorSchema.index({ "technicians.skills": 1 });

module.exports = mongoose.model("Vendor", vendorSchema);