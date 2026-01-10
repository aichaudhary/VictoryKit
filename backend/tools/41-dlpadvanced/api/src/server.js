const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 4041;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/v1/dlp', require('./routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'DLPAdvanced', 
    version: '1.0.0',
    port: PORT,
    features: {
      contentInspection: true,
      dataClassification: true,
      policyEnforcement: true,
      endpointMonitoring: true,
      cloudDLP: true,
      emailDLP: true,
      realTimeAlerts: true
    }
  });
});

// WebSocket connections for real-time monitoring
io.on('connection', (socket) => {
  console.log('Client connected for real-time DLP monitoring:', socket.id);
  
  socket.on('subscribe-alerts', (userId) => {
    socket.join(`alerts-${userId}`);
    console.log(`User ${userId} subscribed to alerts`);
  });
  
  socket.on('subscribe-scans', (organizationId) => {
    socket.join(`scans-${organizationId}`);
    console.log(`Organization ${organizationId} subscribed to scan updates`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dlp_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected for DLP'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Error handling
app.use((err, req, res, next) => {
  console.error('DLP API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

httpServer.listen(PORT, () => {
  console.log(`🛡️ DLPAdvanced API running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time monitoring`);
});

module.exports = { app, io };
