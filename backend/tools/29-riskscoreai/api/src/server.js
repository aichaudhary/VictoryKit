const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3029', 'http://riskscoreai.maula.ai', 'https://riskscoreai.maula.ai'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/riskscoreai_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Connected to MongoDB (riskscoreai_db)');
    console.log('📊 Risk Scoring Models Ready:');
    console.log('   - AssetRisk: Asset risk assessment');
    console.log('   - UserRisk: User behavior analysis');
    console.log('   - ThreatRisk: Threat risk evaluation');
    console.log('   - VendorRisk: Third-party risk management');
    console.log('   - RiskPrediction: ML-based risk forecasting');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 4029;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RiskScoreAI API Server running on port ${PORT}`);
  console.log(`📍 Risk Score Calculation API: http://localhost:${PORT}/api/v1/risk`);
  console.log(`🎯 Supported frameworks: NIST, ISO 27001, FAIR`);
  console.log(`🔴🟡🟢 Risk Levels: Low (0-39) | Medium (40-59) | High (60-79) | Critical (80-100)`);
});
