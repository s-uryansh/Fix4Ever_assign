const Booking = require("../models/Booking");
const Vendor = require("../models/Vendor");
const Tracking = require("../models/Tracking");
const { getIO } = require("../socket/tracking_socket");

const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { vendorId, serviceId, address, scheduleTime, issueDescription } = req.body;
    
    if (!vendorId || !serviceId || !address || !scheduleTime) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: vendorId, serviceId, address, scheduleTime" 
      });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: "Vendor not found" 
      });
    }

    const service = vendor.servicesOffered.id(serviceId);
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: "Service not found" 
      });
    }

    const booking = await Booking.create({
      userId,
      vendorId,
      serviceId,
      issueDescription,
      status: "pending",
      address,
      scheduleTime: new Date(scheduleTime),
      price: service.price
    });

    await Tracking.create({
      bookingId: booking._id,
      timeline: [{ status: "pending", timeStamp: new Date() }],
      liveLocation: {}
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking
    });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating booking" 
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (req.query.vendorId) {
      const vendorId = req.query.vendorId;
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ 
          success: false,
          message: "Vendor not found" 
        });
      }
      if (vendor.ownerId.toString() !== userId.toString()) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied" 
        });
      }
      const bookings = await Booking.find({ vendorId })
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 });
      return res.json({
        success: true,
        bookings
      });
    }
    
    const bookings = await Booking.find({ userId })
      .populate("vendorId", "businessName contactPhone")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      bookings
    });
  } catch (err) {
    console.error("getMyBookings error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching bookings" 
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("vendorId", "businessName contactPhone address");
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    // Check if user has access to this booking
    const vendor = await Vendor.findById(booking.vendorId);
    const requesterId = req.user._id.toString();
    const isOwner = vendor && vendor.ownerId.toString() === requesterId;
    const isUser = booking.userId._id.toString() === requesterId;
    
    if (!isOwner && !isUser) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (err) {
    console.error("getBookingById error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching booking" 
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "accepted", "on-the-way", "working", "completed", "cancelled"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    const vendor = await Vendor.findById(booking.vendorId);
    const requesterId = req.user._id.toString();
    const isOwner = vendor && vendor.ownerId.toString() === requesterId;
    const isUser = booking.userId.toString() === requesterId;
    
    if (!isOwner && !isUser) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    booking.status = status;
    await booking.save();

    await Tracking.findOneAndUpdate(
      { bookingId: booking._id },
      { $push: { timeline: { status, timeStamp: new Date() } } },
      { upsert: true }
    );

    try {
      const io = getIO();
      io.to(booking._id.toString()).emit("statusUpdate", { 
        status, 
        timeStamp: new Date(),
        bookingId: booking._id 
      });
    } catch (e) {
      console.error("Socket emit error:", e);
    }

    res.json({
      success: true,
      message: "Booking status updated successfully",
      booking
    });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating booking status" 
    });
  }
};

const assignTechnician = async (req, res) => {
  try {
    const { techId } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    const vendor = await Vendor.findById(booking.vendorId);
    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: "Vendor not found" 
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
        message: "Technician not found" 
      });
    }

    booking.technicianId = techId;
    booking.status = "accepted";
    await booking.save();

    await Tracking.findOneAndUpdate(
      { bookingId: booking._id },
      { 
        $push: { timeline: { status: "accepted", timeStamp: new Date() } },
        $set: { assignedTechnician: techId }
      },
      { upsert: true }
    );

    try {
      const io = getIO();
      io.to(booking._id.toString()).emit("statusUpdate", { 
        status: "accepted", 
        timeStamp: new Date(), 
        technician: {
          name: tech.name,
          _id: tech._id,
          phone: tech.phone
        },
        bookingId: booking._id
      });
    } catch (e) {
      console.error("Socket emit error:", e);
    }

    res.json({
      success: true,
      message: "Technician assigned successfully",
      booking
    });
  } catch (err) {
    console.error("assignTechnician error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while assigning technician" 
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  assignTechnician
};