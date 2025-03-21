// server/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack to the console for debugging
  
    // Create a default error response
    const statusCode = err.statusCode || 500; // If no statusCode, default to 500 (internal server error)
    const message = err.message || 'Internal Server Error'; // Default error message
  
    // If the environment is development, show full stack trace
    const stack = process.env.NODE_ENV === 'development' ? err.stack : null;
  
    // Send structured error response
    res.status(statusCode).json({
      success: false,
      message,
      stack // Optional: Stack trace is only included in development mode
    });
  };
  
  module.exports = errorHandler;
  