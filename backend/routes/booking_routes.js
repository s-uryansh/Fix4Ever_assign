const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth");
const bc = require("../controllers/booking_controller");
const { validateBooking } = require("../middlewares/validation");
const { body } = require('express-validator');

router.post("/", protect, validateBooking, bc.createBooking);
router.get("/", protect, bc.getMyBookings); 
router.get("/:id", protect, bc.getBookingById);

router.put("/:id/status", 
  protect, 
  [
    body('status').isIn(["pending", "accepted", "on-the-way", "working", "completed", "cancelled"])
      .withMessage('Invalid status')
  ],
  bc.updateBookingStatus
);

router.put("/:id/assign-tech", 
  protect, 
  [
    body('techId').isMongoId().withMessage('Invalid technician ID')
  ],
  bc.assignTechnician
);

module.exports = router;