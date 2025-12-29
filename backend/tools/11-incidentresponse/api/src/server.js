/**
 * IncidentResponse API Server
 * Tool 11: AI-Powered Security Incident Management
 * Port: 4011
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4011;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "IncidentResponse API",
    version: "1.0.0",
    port: PORT,
    timestamp: new Date().toISOString(),
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

    app.listen(PORT, () => {
      console.log(`🚨 IncidentResponse API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
