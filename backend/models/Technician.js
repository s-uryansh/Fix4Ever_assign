const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  name: String,
  skills: [String],
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Technician", technicianSchema);
