const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  authUser, 
  getProfile, 
  updateProfile,
  sendVerificationOTP,
  verifyEmail,
  checkVendorEligibility
} = require("../controllers/user_controller");
const protect = require("../middlewares/auth");
const { validateUser, nameValidator, phoneValidator } = require("../middlewares/validation");
const { body } = require('express-validator');

router.post("/register", validateUser, registerUser);

router.post("/login", 
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  authUser
);

router.get("/profile", protect, getProfile);

router.put("/profile", 
  protect,
  [
    nameValidator,
    phoneValidator
  ],
  updateProfile
);

router.post("/send-verification", protect, sendVerificationOTP);
router.post("/verify-email", 
  protect,
  [
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  verifyEmail
);

router.get("/check-vendor-eligibility", protect, checkVendorEligibility);

module.exports = router;