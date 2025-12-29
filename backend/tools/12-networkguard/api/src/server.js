/**
 * NetworkGuard API Server
 * Network Security Monitoring & IDS/IPS
 * Port: 4012
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4012;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "NetworkGuard API",
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api", routes);

// Error handler
app.use(errorHandler);

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/victorykit_networkguard";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected - NetworkGuard");
    app.listen(PORT, () => {
      console.log(`🛡️ NetworkGuard API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
