/**
 * SecurityDashboard API Server - Enhanced v2.0
 * Port: 4020 (HTTP), 4120 (WebSocket)
 * Enterprise security posture scoring with AI-powered analysis
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Services
const aiScoringService = require('./services/aiScoringService');
const externalRatingsService = require('./services/externalRatingsService');
const vulnerabilityService = require('./services/vulnerabilityService');
const realTimeMonitoringService = require('./services/realTimeMonitoringService');
const advancedReportingService = require('./services/advancedReportingService');
const complianceMappingService = require('./services/complianceMappingService');
const predictiveAnalyticsService = require('./services/predictiveAnalyticsService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4020;
const WS_PORT = process.env.WS_PORT || 4120;

// ======================
// Security Middleware
// ======================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// ======================
// Performance Middleware
// ======================
app.use(compression());
app.use(morgan('combined'));

// ======================
// CORS Configuration
// ======================
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400
}));

// ======================
// Body Parsing
// ======================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ======================
// Request ID Middleware
// ======================
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// ======================
// API Routes
// ======================
app.use('/api', routes);

// ======================
// Enhanced Health Check
// ======================
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    service: 'SecurityDashboard API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    connections: {
      database: dbStatus,
      websocket: realTimeMonitoringService.getConnectedClientsCount ? 
        realTimeMonitoringService.getConnectedClientsCount() : 0
    },
    services: {
      aiScoring: aiScoringService.initialized || false,
      externalRatings: externalRatingsService.initialized || false,
      vulnerabilityScanner: vulnerabilityService.initialized || false,
      realTimeMonitoring: realTimeMonitoringService.initialized || false,
      reporting: advancedReportingService.initialized || false,
      complianceMapping: complianceMappingService.initialized || false,
      predictiveAnalytics: predictiveAnalyticsService.initialized || false
    },
    endpoints: {
      http: `http://localhost:${PORT}`,
      websocket: `ws://localhost:${WS_PORT}`
    }
  });
});

// ======================
// Service Status Endpoint
// ======================
app.get('/api/status/services', (req, res) => {
  res.json({
    services: [
      { name: 'AI Scoring', status: aiScoringService.initialized ? 'active' : 'initializing', type: 'analysis' },
      { name: 'External Ratings', status: externalRatingsService.initialized ? 'active' : 'initializing', type: 'integration' },
      { name: 'Vulnerability Scanner', status: vulnerabilityService.initialized ? 'active' : 'initializing', type: 'scanner' },
      { name: 'Real-Time Monitoring', status: realTimeMonitoringService.initialized ? 'active' : 'initializing', type: 'monitoring' },
      { name: 'Reporting', status: advancedReportingService.initialized ? 'active' : 'initializing', type: 'reporting' },
      { name: 'Compliance Mapping', status: complianceMappingService.initialized ? 'active' : 'initializing', type: 'compliance' },
      { name: 'Predictive Analytics', status: predictiveAnalyticsService.initialized ? 'active' : 'initializing', type: 'analytics' }
    ]
  });
});

// ======================
// API Documentation
// ======================
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'SecurityDashboard API',
    version: '2.0.0',
    description: 'Enterprise security posture scoring with AI-powered analysis',
    baseUrl: `/api`,
    endpoints: {
      scores: {
        'POST /scores': 'Create new security score',
        'GET /scores': 'List all scores with pagination',
        'GET /scores/:id': 'Get score by ID',
        'PUT /scores/:id': 'Update score',
        'DELETE /scores/:id': 'Delete score',
        'POST /scores/:id/calculate': 'Calculate/recalculate score',
        'GET /scores/:id/breakdown': 'Get detailed breakdown',
        'GET /scores/:id/trend': 'Get historical trend'
      },
      ai: {
        'POST /ai/analyze': 'AI-powered security analysis',
        'POST /ai/recommendations': 'Get AI recommendations',
        'POST /ai/predict': 'Predict score trends',
        'POST /ai/compare': 'AI industry comparison'
      },
      external: {
        'GET /external/ratings/:org': 'Get external ratings',
        'GET /external/benchmarks': 'Get industry benchmarks',
        'POST /external/aggregate': 'Aggregate ratings'
      },
      vulnerabilities: {
        'GET /vulnerabilities/:org': 'Get vulnerability summary',
        'GET /vulnerabilities/:org/trend': 'Vulnerability trends',
        'GET /vulnerabilities/:org/assets': 'Affected assets'
      },
      compliance: {
        'GET /compliance/frameworks': 'List frameworks',
        'POST /compliance/status': 'Get compliance status',
        'GET /compliance/gaps/:framework': 'Get framework gaps',
        'GET /compliance/mapping': 'Cross-framework mapping'
      },
      predictive: {
        'POST /predictive/forecast': 'Forecast future scores',
        'POST /predictive/risks': 'Predict category risks',
        'POST /predictive/scenarios': 'Risk scenarios',
        'POST /predictive/anomalies': 'Anomaly detection'
      },
      reports: {
        'POST /reports/generate': 'Generate report',
        'GET /reports/:id': 'Download report',
        'GET /reports/templates': 'List templates',
        'POST /reports/schedule': 'Schedule report'
      },
      realtime: {
        'WebSocket ws://localhost:4120': 'Real-time score updates'
      }
    }
  });
});

// ======================
// Error Handling
// ======================
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: '/api/docs'
  });
});

// ======================
// Initialize Services
// ======================
async function initializeServices() {
  console.log('Initializing SecurityDashboard services...');
  
  try {
    await Promise.all([
      aiScoringService.initialize?.() || Promise.resolve(),
      externalRatingsService.initialize?.() || Promise.resolve(),
      vulnerabilityService.initialize?.() || Promise.resolve(),
      advancedReportingService.initialize?.() || Promise.resolve(),
      complianceMappingService.initialize?.() || Promise.resolve(),
      predictiveAnalyticsService.initialize?.() || Promise.resolve()
    ]);
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('⚠️ Service initialization warning:', error.message);
  }
}

// ======================
// MongoDB Connection
// ======================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/victorykit_securitydashboard';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Initialize all services
    await initializeServices();
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 SecurityDashboard API running on port ${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api/docs`);
    });
    
    // Start WebSocket server
    realTimeMonitoringService.initialize(WS_PORT);
    console.log(`🔌 WebSocket server running on port ${WS_PORT}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ======================
// Graceful Shutdown
// ======================
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Close WebSocket connections
  if (realTimeMonitoringService.shutdown) {
    await realTimeMonitoringService.shutdown();
    console.log('WebSocket server closed');
  }
  
  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close MongoDB connection
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { app, server };
