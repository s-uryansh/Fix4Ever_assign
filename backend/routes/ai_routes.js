const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth");
const aiController = require("../controllers/ai_controller");
const { body } = require('express-validator');

router.post(
  "/diagnose-issue", 
  protect,
  [
    body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('imageData').optional().isString().withMessage('Invalid image data')
  ],
  aiController.diagnoseIssue.bind(aiController)
);

router.post(
  "/suggest-technician", 
  protect,
  [
    body('issueDescription').isLength({ min: 10 }).withMessage('Issue description must be at least 10 characters'),
    body('userLocation').optional().isObject().withMessage('Invalid location data'),
    body('preferredSkills').optional().isArray().withMessage('Preferred skills must be an array')
  ],
  aiController.suggestTechnician.bind(aiController)
);

router.post(
  "/chat-support", 
  protect,
  [
    body('message').isLength({ min: 1 }).withMessage('Message is required'),
    body('conversationHistory').optional().isArray().withMessage('Conversation history must be an array')
  ],
  aiController.chatSupport.bind(aiController)
);

router.post(
  "/generate-invoice/:bookingId", 
  protect,
  aiController.generateInvoice.bind(aiController)
);

module.exports = router;
