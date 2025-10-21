const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor', 
    required: false
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 500
  },
  type: {
    type: String,
    enum: ['service', 'vendor', 'technician'],
    required: true
  }
}, {
  timestamps: true
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;