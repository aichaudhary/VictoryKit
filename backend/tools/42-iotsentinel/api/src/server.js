const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 4041;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'IoTSentinel',
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/v1/iotsentinel', require('./routes'));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join rooms for real-time updates
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`Client ${socket.id} left room: ${room}`);
  });

  // Real-time device monitoring
  socket.on('monitor-device', (deviceId) => {
    socket.join(`device-${deviceId}`);
  });

  socket.on('stop-monitor-device', (deviceId) => {
    socket.leave(`device-${deviceId}`);
  });

  // Real-time alert monitoring
  socket.on('monitor-alerts', () => {
    socket.join('alerts');
  });

  socket.on('stop-monitor-alerts', () => {
    socket.leave('alerts');
  });

  // Real-time scan monitoring
  socket.on('monitor-scan', (scanId) => {
    socket.join(`scan-${scanId}`);
  });

  socket.on('stop-monitor-scan', (scanId) => {
    socket.leave(`scan-${scanId}`);
  });

  // Real-time vulnerability monitoring
  socket.on('monitor-vulnerabilities', () => {
    socket.join('vulnerabilities');
  });

  socket.on('stop-monitor-vulnerabilities', () => {
    socket.leave('vulnerabilities');
  });

  // Real-time firmware monitoring
  socket.on('monitor-firmware', () => {
    socket.join('firmware');
  });

  socket.on('stop-monitor-firmware', () => {
    socket.leave('firmware');
  });

  // Real-time segment monitoring
  socket.on('monitor-segment', (segmentId) => {
    socket.join(`segment-${segmentId}`);
  });

  socket.on('stop-monitor-segment', (segmentId) => {
    socket.leave(`segment-${segmentId}`);
  });

  // Real-time dashboard monitoring
  socket.on('monitor-dashboard', () => {
    socket.join('dashboard');
  });

  socket.on('stop-monitor-dashboard', () => {
    socket.leave('dashboard');
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Make io available globally for controllers
global.io = io;

// MongoDB connection with retry logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iotsentinel_db';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

server.listen(PORT, () => {
  console.log(`IoTSentinel API running on port ${PORT}`);
  console.log(`WebSocket server enabled for real-time updates`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
