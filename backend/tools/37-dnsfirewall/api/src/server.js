const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import middleware
const {
  requestLogger,
  securityHeaders,
  corsHandler,
  errorHandler
} = require('./middleware/auth');

const {
  globalLimiter,
  burstLimiter,
  rateLimitMonitor
} = require('./middleware/rateLimit');

// Import services for WebSocket integration
const dnsShieldService = require('./services/dnsShieldService');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ?
      process.env.ALLOWED_ORIGINS.split(',') :
      ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// CORS middleware
app.use(corsHandler);

// Rate limiting middleware
app.use(rateLimitMonitor);
app.use(burstLimiter);
app.use(globalLimiter);

// Request logging
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    service: 'DNSShield',
    port: process.env.PORT || 4037,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };

  // Check MongoDB connection
  if (mongoose.connection.readyState === 1) {
    health.database = 'connected';
  } else {
    health.database = 'disconnected';
    health.status = 'unhealthy';
    res.status(503);
  }

  res.json(health);
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      service: 'DNSShield',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        name: mongoose.connection.name,
        host: mongoose.connection.host
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    // Check external API connectivity (basic ping)
    try {
      const externalHealth = await dnsShieldService.checkExternalAPIs();
      health.externalAPIs = externalHealth;
    } catch (error) {
      health.externalAPIs = { status: 'error', message: error.message };
      health.status = 'degraded';
    }

    // Check Redis if configured
    if (process.env.REDIS_URL) {
      try {
        // Basic Redis connectivity check would go here
        health.redis = { status: 'configured' };
      } catch (error) {
        health.redis = { status: 'error', message: error.message };
        health.status = 'degraded';
      }
    }

    if (health.status !== 'healthy') {
      res.status(503);
    }

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    service: 'DNSShield API',
    version: '1.0.0',
    description: 'DNS Security and Threat Analysis Platform',
    endpoints: {
      health: '/health',
      detailedHealth: '/health/detailed',
      dnsAnalysis: '/api/v1/dnsfirewall/analyze',
      domainReputation: '/api/v1/dnsfirewall/domain/{domain}/reputation',
      statistics: '/api/v1/dnsfirewall/stats',
      policies: '/api/v1/dnsfirewall/policies',
      alerts: '/api/v1/dnsfirewall/alerts',
      reports: '/api/v1/dnsfirewall/reports'
    },
    websocket: {
      url: `ws://localhost:${process.env.PORT || 4037}`,
      events: ['dns-query', 'threat-alert', 'stats-update']
    }
  });
});

// Main API routes
app.use('/api/v1/dnsfirewall', require('./routes/dnsShieldRoutes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/health',
      '/health/detailed',
      '/api-docs',
      '/api/v1/dnsfirewall/*'
    ]
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join user-specific room if authenticated
  socket.on('authenticate', (token) => {
    try {
      // Basic token validation (in production, use proper JWT verification)
      if (token) {
        socket.join(`user-${token}`);
        socket.emit('authenticated', { success: true });
      } else {
        socket.emit('authenticated', { success: false, error: 'Invalid token' });
      }
    } catch (error) {
      socket.emit('authenticated', { success: false, error: error.message });
    }
  });

  // Subscribe to real-time DNS monitoring
  socket.on('subscribe-dns-monitoring', (data) => {
    socket.join('dns-monitoring');
    socket.emit('subscribed', { channel: 'dns-monitoring' });
  });

  // Subscribe to threat alerts
  socket.on('subscribe-threat-alerts', (data) => {
    socket.join('threat-alerts');
    socket.emit('subscribed', { channel: 'threat-alerts' });
  });

  // Subscribe to statistics updates
  socket.on('subscribe-stats', (data) => {
    socket.join('stats-updates');
    socket.emit('subscribed', { channel: 'stats-updates' });
  });

  // Handle DNS query analysis requests via WebSocket
  socket.on('analyze-dns', async (data) => {
    try {
      const result = await dnsShieldService.analyzeDNSQuery(data.domain || data.query);
      socket.emit('dns-analysis-result', result);
    } catch (error) {
      socket.emit('dns-analysis-error', {
        error: error.message,
        query: data.domain || data.query
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Make io available globally for services
global.io = io;

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnsfirewall_db';

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ MongoDB connected successfully');
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error.message);

      if (i === retries - 1) {
        console.error('❌ Failed to connect to MongoDB after all retries');
        process.exit(1);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');

    try {
      // Close WebSocket connections
      io.close(() => {
        console.log('WebSocket server closed');
      });

      // Close MongoDB connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');

      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const PORT = process.env.PORT || 4037;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Start HTTP server with WebSocket support
    server.listen(PORT, () => {
      console.log(`🚀 DNSShield API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
