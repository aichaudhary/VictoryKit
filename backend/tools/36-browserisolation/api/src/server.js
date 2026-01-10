require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import routes and services
const webFilterRoutes = require('./routes/webFilterRoutes');
const webFilterService = require('./services/webFilterService');

// Import shared middleware and utilities
let sharedMiddleware;
let sharedUtils;
try {
  ({ middleware: sharedMiddleware, utils: sharedUtils } = require('../../../shared'));
} catch (error) {
  console.warn('Shared modules not available, using local fallbacks');
  sharedMiddleware = {};
  sharedUtils = {};
}

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time features
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint (no auth required)
app.get('/health', async (req, res) => {
  try {
    const dbHealth = mongoose.connection.readyState === 1;
    const uptime = process.uptime();

    res.json({
      success: true,
      data: {
        status: dbHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth ? 'healthy' : 'unhealthy'
        },
        uptime,
        version: process.env.npm_package_version || '1.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

// API Routes
app.use('/api/v1/browserisolation', webFilterRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join user-specific room for personalized updates
  socket.on('join-user-room', (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    }
  });

  // Join admin room for system-wide updates
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('Admin joined admin room');
  });

  // Handle real-time URL analysis requests
  socket.on('analyze-url', async (data) => {
    try {
      const { url, userId, options = {} } = data;

      if (!url) {
        socket.emit('analysis-error', { error: 'URL is required' });
        return;
      }

      const analysis = await webFilterService.analyzeUrl(url, {
        userId,
        ...options
      });

      // Send result to client
      socket.emit('analysis-result', {
        url,
        analysis: analysis.toObject()
      });

      // Broadcast to admin room for monitoring
      io.to('admin-room').emit('new-analysis', {
        url,
        userId,
        threatLevel: analysis.threatLevel,
        riskScore: analysis.riskScore,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Real-time analysis error:', error);
      socket.emit('analysis-error', {
        url: data.url,
        error: error.message
      });
    }
  });

  // Handle real-time statistics requests
  socket.on('request-stats', async (data) => {
    try {
      const { timeRange = '24h', userId } = data;

      const stats = await webFilterService.getRealTimeStats(timeRange);

      // Send stats to requesting client
      socket.emit('stats-update', stats);

      // If user-specific, also send to user room
      if (userId) {
        io.to(`user-${userId}`).emit('user-stats-update', stats);
      }

    } catch (error) {
      console.error('Real-time stats error:', error);
      socket.emit('stats-error', { error: error.message });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);

  // Handle mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Handle mongoose cast errors
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid data format',
      details: error.message
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/victorykit_browserisolation';

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 Received shutdown signal, closing server...');

  server.close(async () => {
    console.log('✅ HTTP server closed');

    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Process signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log
  if (process.env.NODE_ENV === 'production') {
    console.error('Unhandled rejection in production, continuing...');
  } else {
    process.exit(1);
  }
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 4025;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 BrowserIsolation API server running on port ${PORT}`);
      console.log(`📊 Real-time features enabled via Socket.IO`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api/v1/browserisolation`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize and start
startServer();

module.exports = { app, server, io };
