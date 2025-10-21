const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth");
const tc = require("../controllers/tracking_controller");
const { body } = require('express-validator');

router.get("/:bookingId", protect, tc.getTrackingByBooking);

router.put("/technician/:techId/location",
  protect,
  [
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('lon').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
  ],
  tc.updateTechnicianLocation
);

router.get("/technician/:techId/location", protect, tc.getTechnicianLocation);

module.exports = router;