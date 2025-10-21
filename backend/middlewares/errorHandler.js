const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
  }
  
  console.error('Error Details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    keyValue: err.keyValue
  });

  if (err.name === 'CastError') {
    const message = 'Resource not found with the specified ID';
    error = { message, statusCode: 404 };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists. Please use a different value.`;
    error = { message, statusCode: 409 };
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data: ${messages.join(', ')}`;
    error = { message, statusCode: 400 };
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token has expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;