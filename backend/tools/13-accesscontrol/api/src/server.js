/**
 * AccessControl API Server
 * Tool 13 - AI-Powered Access Management & Authorization
 * Port: 4013
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Import routes
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const policyRoutes = require('./routes/policyRoutes');
const auditRoutes = require('./routes/auditRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 4013;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://accesscontrol.maula.ai', 'https://maula.ai']
    : ['http://localhost:3013', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'accesscontrol-api',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/v1/accesscontrol/auth', authRoutes);
app.use('/api/v1/accesscontrol/users', authMiddleware, userRoutes);
app.use('/api/v1/accesscontrol/roles', authMiddleware, roleRoutes);
app.use('/api/v1/accesscontrol/permissions', authMiddleware, permissionRoutes);
app.use('/api/v1/accesscontrol/policies', authMiddleware, policyRoutes);
app.use('/api/v1/accesscontrol/audit', authMiddleware, auditRoutes);
app.use('/api/v1/accesscontrol/ai', authMiddleware, aiRoutes);

// Dashboard route (public with auth)
app.use('/api/v1/accesscontrol/dashboard', authMiddleware, require('./routes/dashboardRoutes'));

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/victorykit_accesscontrol', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🔐 ACCESSCONTROL API                     ║
║                    Port: ${PORT.padStart(4)}                              ║
║                    Status: ✅ RUNNING                        ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();

module.exports = app;