const User = require("../models/User");
const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');
const { sendVerificationEmail } = require("../utils/email_service");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { name, email, phone, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    const user = await User.create({ name, email, phone, password });
    
    if (user) {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isVerified: user.isVerified,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: "Invalid user data" 
      });
    }
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while registering user" 
    });
  }
};

const authUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isVerified: user.isVerified,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }
  } catch (error) {
    console.error("authUser error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login" 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("vendorProfile");
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching profile" 
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);
    
    const { name, phone } = req.body;
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating profile" 
    });
  }
};

const sendVerificationOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    const otp = user.generateOTP();
    await user.save();

    const emailResult = await sendVerificationEmail(user.email, otp, user.name);
    
    res.json({
      success: true,
      message: "Verification OTP sent successfully",
      previewUrl: emailResult.previewUrl 
    });
  } catch (error) {
    console.error("sendVerificationOTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification OTP"
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required"
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    if (!user.verificationOTP || !user.verificationOTPExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP requested or OTP expired"
      });
    }

    if (user.verificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (Date.now() > user.verificationOTPExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error("verifyEmail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email"
    });
  }
};

const checkVendorEligibility = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const existingVendor = await Vendor.findOne({ ownerId: user._id });
    if (existingVendor) {
      return res.json({
        success: true,
        eligible: false,
        message: "You already have a vendor profile",
        vendorProfile: existingVendor
      });
    }

    if (!user.isVerified) {
      return res.json({
        success: true,
        eligible: false,
        message: "Please verify your email first to become a vendor",
        requiresVerification: true
      });
    }

    return res.json({
      success: true,
      eligible: true,
      message: "You can create a vendor profile"
    });
  } catch (error) {
    console.error("checkVendorEligibility error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check vendor eligibility"
    });
  }
};

module.exports = { 
  registerUser, 
  authUser, 
  getProfile, 
  updateProfile,
  sendVerificationOTP,
  verifyEmail,
  checkVendorEligibility
};