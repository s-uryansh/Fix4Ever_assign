const { body, validationResult, param } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages
    });
  }
  next();
};

const mongoIdValidator = param('id')
  .isMongoId()
  .withMessage('Invalid ID format');

const emailValidator = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const passwordValidator = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

const phoneValidator = body('phone')
  .isMobilePhone('any', { strictMode: false })
  .withMessage('Please provide a valid phone number');

const nameValidator = body('name')
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .trim()
  .escape()
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces');

const validateBooking = [
  body('vendorId')
    .isMongoId()
    .withMessage('Invalid vendor ID'),
  
  body('serviceId')
    .isMongoId()
    .withMessage('Invalid service ID'),
  
  body('address')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters')
    .trim()
    .escape(),
  
  body('scheduleTime')
    .isISO8601()
    .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)')
    .custom((value) => {
      const scheduledTime = new Date(value);
      const now = new Date();
      if (scheduledTime <= now) {
        throw new Error('Schedule time must be in the future');
      }
      return true;
    }),
  
  handleValidationErrors
];

const validateUser = [
  nameValidator,
  emailValidator,
  passwordValidator,
  phoneValidator,
  handleValidationErrors
];

const validateVendor = [
  body('businessName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters')
    .trim()
    .escape(),
  
  body('gstNumber')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GST number format'),
  
  body('address')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters')
    .trim(),
  
  body('contactEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email'),
  
  body('contactPhone')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid contact phone number'),
  
  handleValidationErrors
];

const validateService = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Service name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('description')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters')
    .trim()
    .escape(),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .isIn(['electronics', 'appliances', 'plumbing', 'electrical', 'home', 'other'])
    .withMessage('Invalid service category'),
  
  body('estimatedDuration')
    .isInt({ min: 15, max: 480 }) 
    .withMessage('Estimated duration must be between 15 and 480 minutes'),
  
  handleValidationErrors
];

const validateTechnician = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Technician name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  
  body('skills.*')
    .isLength({ min: 2, max: 50 })
    .withMessage('Each skill must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('phone')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number for the technician'),
  
  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateBooking,
  validateUser,
  validateVendor,
  validateService,
  validateTechnician,
  mongoIdValidator,
  emailValidator,
  passwordValidator,
  phoneValidator,
  nameValidator
};