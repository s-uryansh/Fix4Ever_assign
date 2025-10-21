// routes/review_routes.js
const express = require("express");
const router = express.Router();
const { body } = require('express-validator');
const { 
  submitReview, 
  getServiceReviews, 
  getVendorReviews, 
  getTechnicianReviews 
} = require("../controllers/review_controller");
const protect = require("../middlewares/auth");

const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters')
    .trim()
    .escape(),
];

router.post("/submit", protect, validateReview, submitReview);

router.get("/service/:serviceId", getServiceReviews);
router.get("/vendor/:vendorId", getVendorReviews);
router.get("/technician/:technicianId", getTechnicianReviews);

module.exports = router;