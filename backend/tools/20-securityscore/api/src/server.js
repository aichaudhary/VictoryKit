/**
 * SecurityScore API Server
 * Port: 4020
 * Unified security posture scoring and benchmarking
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4020;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "SecurityScore API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(errorHandler);

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/victorykit_securityscore";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`SecurityScore API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
