/**
 * SSLMonitor API Server
 * Port: 4025
 * SSL/TLS Certificate Monitoring Platform
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4025;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/victorykit_sslmonitor';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'SSLMonitor API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Database connection and server start
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB - SSLMonitor');
        app.listen(PORT, () => {
            console.log(`🔐 SSLMonitor API running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

module.exports = app;
