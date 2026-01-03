/**
 * IncidentResponse API Server
 * Tool 11: AI-Powered Security Incident Management
 * Port: 4011
 * 
 * Features:
 * - Real-time WebSocket updates
 * - Threat Intelligence Integration (VirusTotal, AbuseIPDB, Shodan)
 * - SIEM Integration (Splunk, Elastic, Azure Sentinel)
 * - EDR Integration (CrowdStrike, SentinelOne, MS Defender)
 * - Ticketing Integration (ServiceNow, Jira, PagerDuty)
 * - AI Analysis (OpenAI, Gemini, Claude)
 * - Multi-channel Notifications (Slack, Teams, Email, SMS)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const http = require("http");

const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const websocketService = require("./services/websocketService");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4011;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check with real-time stats
app.get("/health", (req, res) => {
  const wsStats = websocketService.getStats();
  res.json({
    status: "healthy",
    service: "IncidentResponse API",
    version: "2.0.0",
    port: PORT,
    timestamp: new Date().toISOString(),
    features: [
      "real-time-websocket",
      "threat-intelligence",
      "siem-integration",
      "edr-integration",
      "ticketing-integration",
      "ai-analysis",
      "multi-channel-notifications"
    ],
    websocket: wsStats
  });
});

// API Routes
app.use("/api/v1/incidentresponse", routes);

// Error handling
app.use(errorHandler);

// Database connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/victorykit_incidentresponse";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB - victorykit_incidentresponse");

    // Initialize WebSocket service
    websocketService.initialize(server);

    server.listen(PORT, () => {
      console.log(`🚨 IncidentResponse API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket enabled for real-time updates`);
      console.log(`📦 Integrations: ThreatIntel | SIEM | EDR | Ticketing | AI`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = { app, server };
