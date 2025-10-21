const Review = require("../models/Review");
const Vendor = require("../models/Vendor");
const { validationResult } = require('express-validator');
const { broadcastNewReview } = require("../socket/review_socket");

const submitReview = async (req, res) => {
  try {
    // console.log('Backend - Received request body:', req.body);
    // console.log('Backend - Received rating:', req.body.rating);
    // console.log('Backend - Received comment:', req.body.comment);
    // console.log('Backend - Received serviceId:', req.body.serviceId);
    // console.log('Backend - Received userName:', req.body.userName);
    // console.log('Backend - Received type:', req.body.type);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { serviceId, vendorId, technicianId, rating, comment, userName, type } = req.body;
    const userId = req.user._id;

    let reviewType, targetId;
    if (serviceId) {
      reviewType = 'service';
      targetId = serviceId;
    } else if (vendorId) {
      reviewType = 'vendor';
      targetId = vendorId;
    } else if (technicianId) {
      reviewType = 'technician';
      targetId = technicianId;
    } else {
      return res.status(400).json({
        success: false,
        message: "Must specify serviceId, vendorId, or technicianId"
      });
    }


    const review = await Review.create({
      [reviewType + 'Id']: targetId,
      userId,
      userName: userName || req.user.name,
      rating: parseInt(rating),
      comment: comment.trim(),
      type: reviewType
    });

    const populatedReview = await Review.findById(review._id)
      .select('-__v')
      .lean();

    // console.log('Review created successfully:', populatedReview);

    broadcastNewReview(populatedReview);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview
    });
    
  } catch (error) {
    console.error("submitReview error:", error);
    if (error.code === 11000 || error.message.includes('duplicate key')) {
      return res.status(400).json({
        success: false,
        message: "Database still has unique constraints. Please drop the indexes: serviceId_1_userId_1, vendorId_1_userId_1, technicianId_1_userId_1"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while submitting review"
    });
  }
};

const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // console.log('Fetching reviews for service:', serviceId); 

    const reviews = await Review.find({ serviceId })
      .sort({ createdAt: -1 })
      .select('-__v');

    // console.log('Found reviews:', reviews); 

    res.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error("getServiceReviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews"
    });
  }
};

const getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // console.log('Fetching reviews for vendor:', vendorId); 

    const reviews = await Review.find({ vendorId })
      .sort({ createdAt: -1 })
      .select('-__v');

    // console.log('Found vendor reviews:', reviews); 
    res.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error("getVendorReviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching vendor reviews"
    });
  }
};

const getTechnicianReviews = async (req, res) => {
  try {
    const { technicianId } = req.params;

    // console.log('Fetching reviews for technician:', technicianId);

    const reviews = await Review.find({ technicianId })
      .sort({ createdAt: -1 })
      .select('-__v');

    // console.log('Found technician reviews:', reviews); 

    res.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error("getTechnicianReviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching technician reviews"
    });
  }
};

module.exports = {
  submitReview,
  getServiceReviews,
  getVendorReviews,
  getTechnicianReviews
};