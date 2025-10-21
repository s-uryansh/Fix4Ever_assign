const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId }, 
  serviceId: { type: mongoose.Schema.Types.ObjectId }, 
  status: { type: String, enum: ["pending","accepted","on-the-way","working","completed","cancelled"], default: "pending" },
  address: { type: String, required: true },
  scheduleTime: { type: Date, required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
