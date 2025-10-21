const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: true,
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  isVerified: { type: Boolean, default: false },
  verificationOTP: String,
  verificationOTPExpires: Date,
  role: {
    type: String,
    enum: ['customer', 'vendor'],
    default: 'customer'
  },
  avatar: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: { lat: Number, lng: Number }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.virtual('vendorProfile', {
  ref: 'Vendor',
  localField: '_id',
  foreignField: 'ownerId',
  justOne: true
});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationOTP = otp;
  this.verificationOTPExpires = Date.now() + 10 * 60 * 1000; 
  return otp;
};

module.exports = mongoose.model("User", userSchema);