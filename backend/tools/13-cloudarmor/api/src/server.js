/**
 * CloudArmor API Server
 * Cloud Security Posture Management
 * Port: 4013
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4013;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "CloudArmor API",
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);
app.use(errorHandler);

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/victorykit_cloudarmor";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected - CloudArmor");
    app.listen(PORT, () => {
      console.log(`☁️ CloudArmor API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
