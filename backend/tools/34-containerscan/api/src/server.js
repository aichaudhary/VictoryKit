const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4034;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ContainerScan', port: PORT });
});

// Main routes
app.use('/api/v1/containerscan', require('./routes'));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Real-time frame analysis
  socket.on('analyze_frame', async (data) => {
    try {
      // Process frame for real-time analysis
      const result = await processRealTimeFrame(data);
      socket.emit('auth_progress', result);
    } catch (error) {
      console.error('Frame analysis error:', error);
      socket.emit('alert', { message: 'Frame analysis failed', severity: 'error' });
    }
  });

  // Real-time authentication
  socket.on('authenticate', async (data) => {
    try {
      socket.emit('alert', { message: 'Real-time authentication started', severity: 'info' });

      // Process authentication with real-time updates
      const biometricService = require('./services/biometricService');
      const result = await biometricService.authenticate(data);

      // Send progress updates
      socket.emit('auth_progress', {
        faceConfidence: result.methods?.face?.confidence || 0,
        voiceConfidence: result.methods?.voice?.confidence || 0,
        behavioralConfidence: result.methods?.behavioral?.confidence || 0,
        processingTime: result.processing_time || 0
      });

      // Send final result
      socket.emit('auth_result', result);

      // Send performance metrics
      socket.emit('performance', {
        latency: result.latency || 0,
        processingTime: result.processing_time || 0,
        fps: 30 // Placeholder
      });

    } catch (error) {
      console.error('Real-time authentication error:', error);
      socket.emit('auth_result', { success: false, error: error.message });
      socket.emit('alert', { message: 'Authentication failed', severity: 'error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Real-time frame processing function
async function processRealTimeFrame(data) {
  // Simulate real-time face analysis
  // In production, this would call actual ML models
  const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

  return {
    faceConfidence: confidence,
    processingTime: Math.random() * 100 + 50, // 50-150ms
    timestamp: Date.now()
  };
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/containerscan_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

server.listen(PORT, () => {
  console.log(`ContainerScan API with WebSocket support running on port ${PORT}`);
});
