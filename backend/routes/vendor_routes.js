const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth");
const vc = require("../controllers/vendor_controller");
const { validateVendor, validateService, validateTechnician } = require("../middlewares/validation");
const Vendor = require("../models/Vendor"); // Add this import

router.post("/", protect, validateVendor, vc.createVendor);
router.get("/", vc.getVendors);
router.get("/:id", vc.getVendorById);
router.put("/:id", protect, validateVendor, vc.updateVendor);

router.post("/:id/services", protect, validateService, vc.addService);
router.put("/services/:serviceId", protect, validateService, vc.updateService);
router.delete("/services/:serviceId", protect, vc.removeService);

router.post("/:id/technicians", protect, validateTechnician, vc.addTechnician);
router.put("/technicians/:techId", protect, validateTechnician, vc.updateTechnician);
router.delete("/technicians/:techId", protect, vc.removeTechnician);

router.get("/my-vendor", protect, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user._id });
    
    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: "Vendor profile not found" 
      });
    }

    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error("getMyVendor error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching vendor profile" 
    });
  }
});

module.exports = router;