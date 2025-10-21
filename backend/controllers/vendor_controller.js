const Vendor = require("../models/Vendor");
const User = require("../models/User");
const { validationResult } = require('express-validator');
const { sendVendorWelcomeEmail } = require("../utils/email_service");

const createVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { businessName, gstNumber, address, contactEmail, contactPhone, serviceAreas } = req.body;
    const ownerId = req.user._id;
    
    const user = await User.findById(ownerId);
    if (!user.isVerified) {
      return res.status(400).json({ 
        success: false,
        message: "Please verify your email before becoming a vendor" 
      });
    }
    
    const existingVendor = await Vendor.findOne({ ownerId });
    if (existingVendor) {
      return res.status(400).json({ 
        success: false,
        message: "You already have a vendor profile" 
      });
    }

    const vendor = await Vendor.create({ 
      ownerId, 
      businessName, 
      gstNumber, 
      address,
      contactEmail,
      contactPhone,
      serviceAreas
    });

    user.role = 'vendor';
    await user.save();

    await sendVendorWelcomeEmail(user.email, user.name, businessName);

    res.status(201).json({
      success: true,
      message: "Vendor profile created successfully",
      vendor
    });
  } catch (error) {
    console.error("createVendor error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating vendor profile" 
    });
  }
};

const getVendors = async (req, res) => {
  try {
    const { category, service, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query["servicesOffered.category"] = category;
    }
    
    if (service) {
      query["servicesOffered.name"] = new RegExp(service, 'i');
    }

    const vendors = await Vendor.find(query)
      .populate("ownerId", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await Vendor.countDocuments(query);

    res.json({
      success: true,
      vendors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("getVendors error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching vendors" 
    });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("ownerId", "name email");
    
    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: "Vendor not found" 
      });
    }

    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error("getVendorById error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching vendor" 
    });
  }
};

const updateVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const vendor = await Vendor.findById(req.params.id);
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

    const updates = ["businessName", "gstNumber", "address", "contactEmail", "contactPhone", "serviceAreas"];
    updates.forEach(k => { 
      if (req.body[k] !== undefined) vendor[k] = req.body[k]; 
    });
    
    await vendor.save();

    res.json({
      success: true,
      message: "Vendor profile updated successfully",
      vendor
    });
  } catch (error) {
    console.error("updateVendor error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating vendor profile" 
    });
  }
};

const addService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const vendor = await Vendor.findById(req.params.id);
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

    const { name, description, price, category, estimatedDuration } = req.body;
    
    vendor.servicesOffered.push({ 
      name, 
      description, 
      price, 
      category, 
      estimatedDuration 
    });
    
    await vendor.save();

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      services: vendor.servicesOffered
    });
  } catch (error) {
    console.error("addService error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while adding service" 
    });
  }
};

const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { serviceId } = req.params;
    const vendor = await Vendor.findOne({ "servicesOffered._id": serviceId });
    
    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: "Service not found" 
      });
    }
    
    if (vendor.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    const svc = vendor.servicesOffered.id(serviceId);
    ["name", "description", "price", "category", "estimatedDuration"].forEach(k => { 
      if (req.body[k] !== undefined) svc[k] = req.body[k]; 
    });
    
    await vendor.save();

    res.json({
      success: true,
      message: "Service updated successfully",
      service: svc
    });
  } catch (error) {
    console.error("updateService error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating service" 
    });
  }
};

const removeService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const vendor = await Vendor.findOne({ "servicesOffered._id": serviceId });
    
    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: "Service not found" 
      });
    }
    
    if (vendor.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    vendor.servicesOffered.id(serviceId).remove();
    await vendor.save();

    res.json({
      success: true,
      message: "Service removed successfully"
    });
  } catch (error) {
    console.error("removeService error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while removing service" 
    });
  }
};

const addTechnician = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const vendor = await Vendor.findById(req.params.id);
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

    const { name, skills, phone, experience } = req.body;
    
    vendor.technicians.push({ 
      name, 
      skills, 
      phone, 
      experience 
    });
    
    await vendor.save();

    res.status(201).json({
      success: true,
      message: "Technician added successfully",
      technicians: vendor.technicians
    });
  } catch (error) {
    console.error("addTechnician error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while adding technician" 
    });
  }
};

const updateTechnician = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { techId } = req.params;
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
    ["name", "skills", "available", "phone", "experience"].forEach(k => { 
      if (req.body[k] !== undefined) tech[k] = req.body[k]; 
    });
    
    await vendor.save();

    res.json({
      success: true,
      message: "Technician updated successfully",
      technician: tech
    });
  } catch (error) {
    console.error("updateTechnician error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating technician" 
    });
  }
};

const removeTechnician = async (req, res) => {
  try {
    const { techId } = req.params;
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

    vendor.technicians.id(techId).remove();
    await vendor.save();

    res.json({
      success: true,
      message: "Technician removed successfully"
    });
  } catch (error) {
    console.error("removeTechnician error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while removing technician" 
    });
  }
};

module.exports = {
  createVendor, getVendors, getVendorById, updateVendor,
  addService, updateService, removeService,
  addTechnician, updateTechnician, removeTechnician
};