/**
 * BotMitigation API Server
 * Port: 4023
 * Bot Detection and Mitigation Platform
 * 
 * Real-time bot detection with WebSocket support
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
require("dotenv").config();

const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const { initializeWebSocket, getWSS } = require("./websocket");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4023;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/victorykit_botmitigation";

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Make WebSocket accessible in routes
app.set('wss', null);

// Health check
app.get("/health", (req, res) => {
  const wss = getWSS();
  res.json({
    status: "healthy",
    service: "BotMitigation API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    websocket: {
      enabled: true,
      clients: wss ? wss.clients.size : 0
    },
    features: {
      realTimeDetection: true,
      captchaIntegration: true,
      ipReputation: true,
      fingerprinting: true,
      mlDetection: true
    }
  });
});

// API Routes
app.use("/api/v1", routes);

// Error handling
app.use(errorHandler);

// Database connection and server start
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB - BotMitigation");
    
    // Initialize WebSocket server
    const wss = initializeWebSocket(server);
    app.set('wss', wss);
    console.log("🔌 WebSocket server initialized");
    
    server.listen(PORT, () => {
      console.log(`🤖 BotMitigation API running on port ${PORT}`);
      console.log(`📡 WebSocket available at ws://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = { app, server };
