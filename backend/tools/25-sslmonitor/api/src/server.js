/**
 * SSLMonitor API Server
 * Port: 4025
 * SSL/TLS Certificate Monitoring Platform
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const http = require('http');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const WebSocketServer = require('./services/websocketService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4025;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/victorykit_sslmonitor';

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
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
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3025',
    credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'SSLMonitor API',
        version: '1.0.0',
        websocket: 'enabled',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// API Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);

// Make WebSocket server available globally for other services
global.wsServer = wsServer;

// WebSocket event handlers
wsServer.on('client_connected', (client) => {
    console.log(`📡 WebSocket client connected: ${client.id}`);
});

wsServer.on('client_disconnected', (client) => {
    console.log(`📡 WebSocket client disconnected: ${client.id}`);
});

wsServer.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    wsServer.close();
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log('Process terminated');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    wsServer.close();
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log('Process terminated');
            process.exit(0);
        });
    });
});

// Database connection and server start
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ Connected to MongoDB - SSLMonitor');
    server.listen(PORT, () => {
        console.log(`🔐 SSLMonitor API running on port ${PORT}`);
        console.log(`🔌 WebSocket server active on port ${process.env.WEBSOCKET_PORT || 4125}`);

        // Start periodic system status broadcasts
        setInterval(() => {
            wsServer.notifySystemStatus({
                server: 'online',
                database: 'connected',
                websocket: 'active',
                clients: wsServer.getClientCount(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            });
        }, 30000); // Every 30 seconds
    });
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

module.exports = app;
