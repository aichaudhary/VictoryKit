/**
 * Error Handler Middleware
 */

exports.errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};
