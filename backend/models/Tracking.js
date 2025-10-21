const mongoose = require("mongoose");

const timelineItem = new mongoose.Schema({
  status: String,
  timeStamp: { type: Date, default: Date.now }
});

const trackingSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
  timeline: [timelineItem],
  liveLocation: {
    lat: { type: Number },
    lon: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model("Tracking", trackingSchema);
