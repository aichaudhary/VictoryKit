/**
 * NetworkMonitor API Middleware
 * Request validation, rate limiting, and error handling
 */

const rateLimit = require("express-rate-limit");

// Rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: "Too many requests, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiter for discovery operations
const discoveryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 discovery requests per minute
  message: {
    success: false,
    error: "Discovery rate limit exceeded. Please wait before scanning again."
  }
});

// Validate IP address
const validateIP = (req, res, next) => {
  const ip = req.body.ip || req.query.ip;
  if (ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({
        success: false,
        error: "Invalid IP address format"
      });
    }
  }
  next();
};

// Validate subnet
const validateSubnet = (req, res, next) => {
  const subnet = req.body.subnet || req.query.subnet;
  if (subnet) {
    const subnetRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:3[0-2]|[12]?[0-9])$/;
    if (!subnetRegex.test(subnet)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subnet format. Use CIDR notation (e.g., 192.168.1.0/24)"
      });
    }
  }
  next();
};

// Validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  if (id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format"
      });
    }
  }
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    };
    
    if (res.statusCode >= 400) {
      console.error("Request Error:", log);
    } else if (duration > 1000) {
      console.warn("Slow Request:", log);
    }
  });
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: messages
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format"
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: `Duplicate value for field: ${field}`
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
};

module.exports = {
  apiLimiter,
  discoveryLimiter,
  validateIP,
  validateSubnet,
  validateObjectId,
  requestLogger,
  errorHandler
};
