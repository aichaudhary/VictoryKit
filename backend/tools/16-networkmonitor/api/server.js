/**
 * NetworkMonitor API Server
 * Real-time Network Traffic Analysis & Monitoring
 * Port: 4016
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const mongoose = require("mongoose");
const schedule = require("node-schedule");

const routes = require("./src/routes");
const { apiLimiter, requestLogger, errorHandler } = require("./src/middleware");
const { websocketService, snmpService, discoveryService, alertService } = require("./src/services");

const app = express();
const server = http.createServer(app);

// Configuration
const PORT = process.env.PORT || 4016;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/victorykit_networkmonitor";

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow WebSocket connections
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3016", "http://localhost:5173"],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use("/api", apiLimiter);

// API Routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "NetworkMonitor API",
    version: "1.0.0",
    description: "Real-time Network Traffic Analysis & Monitoring",
    status: "running",
    endpoints: {
      dashboard: "/api/dashboard/overview",
      devices: "/api/devices",
      alerts: "/api/alerts",
      traffic: "/api/traffic/stats",
      health: "/api/health",
      websocket: "ws://localhost:4016/ws"
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

// Initialize WebSocket
websocketService.initialize(server);

// Scheduled tasks
function initializeScheduledTasks() {
  // Poll all SNMP devices every 5 minutes
  schedule.scheduleJob("*/5 * * * *", async () => {
    console.log("[Scheduler] Running SNMP poll for all devices...");
    try {
      const results = await snmpService.pollAllDevices();
      console.log(`[Scheduler] SNMP poll complete. Polled ${results.length} devices.`);
      
      // Send metrics update via WebSocket
      results.forEach(result => {
        websocketService.sendMetricsUpdate(result.device, result);
      });
    } catch (error) {
      console.error("[Scheduler] SNMP poll failed:", error.message);
    }
  });

  // Check device status every minute
  schedule.scheduleJob("* * * * *", async () => {
    try {
      const results = await discoveryService.checkAllDevices();
      
      // Notify status changes via WebSocket
      results.details.forEach(device => {
        websocketService.notifyDeviceStatusChange(device);
      });
      
      // Create alerts for offline devices
      const offlineDevices = results.details.filter(d => d.status === "offline");
      for (const device of offlineDevices) {
        await alertService.createAlert({
          type: "device-offline",
          severity: "high",
          title: `Device offline: ${device.name}`,
          message: `Device ${device.name} (${device.ip}) is not responding`,
          source: { deviceId: device._id, ip: device.ip }
        });
      }
    } catch (error) {
      console.error("[Scheduler] Device status check failed:", error.message);
    }
  });

  // Send bandwidth summary every minute
  schedule.scheduleJob("* * * * *", async () => {
    try {
      const { trafficService } = require("./src/services");
      const bandwidth = await trafficService.getBandwidthByDevice({ startTime: new Date(Date.now() - 60000) });
      websocketService.sendBandwidthSummary({
        timestamp: new Date(),
        devices: bandwidth
      });
    } catch (error) {
      // Silently fail for bandwidth updates
    }
  });

  console.log("[Scheduler] Scheduled tasks initialized");
}

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                    NetworkMonitor API                       ║
║                    Real-time Network Monitoring             ║
╠════════════════════════════════════════════════════════════╣
║  HTTP Server:    http://localhost:${PORT}                    ║
║  WebSocket:      ws://localhost:${PORT}/ws                   ║
║  Health Check:   http://localhost:${PORT}/api/health         ║
╠════════════════════════════════════════════════════════════╣
║  Features:                                                  ║
║  • Device Discovery & SNMP Monitoring                       ║
║  • Real-time Traffic Analysis                              ║
║  • Alert Management & Notifications                        ║
║  • Network Topology Mapping                                ║
║  • WebSocket Live Updates                                  ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // Initialize scheduled tasks
    initializeScheduledTasks();

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM. Shutting down gracefully...");
  
  // Cancel scheduled jobs
  schedule.gracefulShutdown();
  
  // Cleanup services
  snmpService.cleanup();
  websocketService.cleanup();
  
  // Close MongoDB connection
  await mongoose.connection.close();
  
  // Close HTTP server
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer();

module.exports = { app, server };
