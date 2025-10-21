const Tracking = require("../models/Tracking");
const Booking = require("../models/Booking");
const Vendor = require("../models/Vendor");
const { getIO } = require("../socket/tracking_socket");

const getTrackingByBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    
    if (!bookingId || !require('mongoose').Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid booking ID format" 
      });
    }

    const tracking = await Tracking.findOne({ bookingId });
    if (!tracking) {
      return res.status(404).json({ 
        success: false,
        message: "Tracking information not found" 
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    const vendor = await Vendor.findById(booking.vendorId);
    const requesterId = req.user._id.toString();
    
    const isUser = booking.userId.toString() === requesterId;
    const isVendorOwner = vendor && vendor.ownerId.toString() === requesterId;
    
    if (!isUser && !isVendorOwner) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied to tracking information" 
      });
    }

    res.json({
      success: true,
      tracking,
      bookingDetails: {
        status: booking.status,
        serviceId: booking.serviceId,
        scheduleTime: booking.scheduleTime
      }
    });
  } catch (err) {
    console.error("getTrackingByBooking error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching tracking information" 
    });
  }
};

const updateTechnicianLocation = async (req, res) => {
  try {
    const { techId } = req.params;
    const { lat, lon } = req.body;

    if (typeof lat !== 'number' || typeof lon !== 'number' || 
        lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid coordinates provided" 
      });
    }

    const vendor = await Vendor.findOne({ "technicians._id": techId });
    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: "Technician not found" 
      });
    }
    
    if (vendor.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    const tech = vendor.technicians.id(techId);
    if (!tech) {
      return res.status(404).json({ 
        success: false,
        message: "Technician not found in vendor records" 
      });
    }

    tech.currentLocation = { lat, lon };
    await vendor.save();

    const activeBookings = await Booking.find({
      technicianId: techId,
      status: { $in: ["accepted", "on-the-way", "working"] }
    });

    const io = getIO();
    activeBookings.forEach(booking => {
      io.to(booking._id.toString()).emit("technicianLocationUpdate", {
        technician: { 
          name: tech.name, 
          _id: tech._id,
          phone: tech.phone 
        },
        location: { lat, lon },
        bookingId: booking._id,
        timestamp: new Date()
      });
    });

    res.json({ 
      success: true,
      message: "Technician location updated successfully", 
      technician: {
        name: tech.name,
        location: { lat, lon },
        updatedAt: new Date()
      }
    });
  } catch (err) {
    console.error("updateTechnicianLocation error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating technician location" 
    });
  }
};

const getTechnicianLocation = async (req, res) => {
  try {
    const { techId } = req.params;

    const vendor = await Vendor.findOne({ "technicians._id": techId });
    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: "Technician not found" 
      });
    }

    const tech = vendor.technicians.id(techId);
    if (!tech || !tech.currentLocation) {
      return res.status(404).json({ 
        success: false,
        message: "Technician location not available" 
      });
    }

    const activeBooking = await Booking.findOne({
      technicianId: techId,
      status: { $in: ["accepted", "on-the-way", "working"] },
      $or: [
        { userId: req.user._id },
        { vendorId: vendor._id }
      ]
    });

    if (!activeBooking) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied to technician location" 
      });
    }

    res.json({
      success: true,
      location: tech.currentLocation,
      technician: {
        name: tech.name,
        lastUpdated: tech.updatedAt
      },
      bookingId: activeBooking._id
    });
  } catch (err) {
    console.error("getTechnicianLocation error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching technician location" 
    });
  }
};

module.exports = { 
  getTrackingByBooking, 
  updateTechnicianLocation,
  getTechnicianLocation 
};