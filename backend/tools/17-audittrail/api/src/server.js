/**
 * AuditTrail API - Main Server
 * Comprehensive Audit Logging System with Real-time Streaming
 * Port: 4017
 */

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

const routes = require("./routes");
const WebSocketService = require("./services/websocketService");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4017;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3017', 'http://localhost:3000'],
  credentials: true
}));
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check with detailed info
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "AuditTrail API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    websocket: {
      enabled: true,
      clients: WebSocketService.getClientCount()
    },
    mongodb: {
      connected: mongoose.connection.readyState === 1
    }
  });
});

// API info endpoint
app.get("/api/v1/audittrail/info", (req, res) => {
  res.json({
    name: "AuditTrail API",
    version: "2.0.0",
    description: "Comprehensive Compliance Audit Logging System",
    features: [
      "Real-time audit log streaming",
      "Hash chain integrity verification",
      "Compliance reporting (SOC2, HIPAA, GDPR, PCI-DSS, ISO27001)",
      "Advanced search and filtering",
      "Alert rules and notifications",
      "SIEM integration support"
    ],
    endpoints: {
      logs: "/api/v1/audittrail/logs",
      search: "/api/v1/audittrail/search",
      events: "/api/v1/audittrail/events",
      reports: "/api/v1/audittrail/reports",
      alerts: "/api/v1/audittrail/alerts",
      rules: "/api/v1/audittrail/rules",
      dashboard: "/api/v1/audittrail/dashboard",
      stats: "/api/v1/audittrail/stats",
      websocket: `ws://localhost:${PORT}`
    }
  });
});

// API Routes
app.use("/api/v1/audittrail", routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/victorykit_audittrail";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    
    // Initialize WebSocket
    WebSocketService.initialize(server);
    console.log("🔌 WebSocket server initialized");
    
    // Start periodic stats broadcast
    setInterval(() => {
      const AuditLog = require("./models/AuditLog");
      AuditLog.countDocuments().then(count => {
        WebSocketService.broadcastStats({
          totalLogs: count,
          timestamp: new Date().toISOString()
        });
      }).catch(() => {});
    }, 30000); // Every 30 seconds
    
    server.listen(PORT, () => {
      console.log(`📋 AuditTrail API running on port ${PORT}`);
      console.log(`🌐 WebSocket available at ws://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  WebSocketService.broadcast({ type: "server_shutdown" });
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

module.exports = { app, server };
