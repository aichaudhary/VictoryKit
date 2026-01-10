/**
 * SecretVault API Server
 * Tool 14: Enterprise Key Management & Data Encryption
 * Port: 4014
 * 
 * Features:
 * - Real-time WebSocket updates for key events
 * - Cloud KMS Integration (AWS KMS, Azure Key Vault, GCP KMS)
 * - HSM Integration (Thales, Fortanix, CloudHSM)
 * - Certificate Management (Let's Encrypt, DigiCert, Venafi)
 * - Key Rotation & Lifecycle Management
 * - Encryption/Decryption Operations
 * - Compliance Audit Logging
 * - AI-powered Anomaly Detection
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const http = require("http");

const routes = require("./routes");
const { errorHandler } = require("./middleware");
const websocketService = require("./services/websocketService");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4014;

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
    service: "SecretVault API",
    version: "1.0.0",
    port: PORT,
    timestamp: new Date().toISOString(),
    features: [
      "cloud-kms-integration",
      "hsm-integration",
      "certificate-management",
      "key-rotation",
      "encryption-decryption",
      "audit-logging",
      "real-time-websocket",
      "anomaly-detection"
    ],
    kmsProviders: ["aws-kms", "azure-keyvault", "gcp-kms", "hashicorp-vault"],
    hsmProviders: ["thales", "fortanix", "aws-cloudhsm", "ncipher"],
    certProviders: ["letsencrypt", "digicert", "sectigo", "venafi"],
    websocket: wsStats
  });
});

// API Routes
app.use("/api/v1/encryption", routes);

// Error handling
app.use(errorHandler);

// Database connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/victorykit_secretvault";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB - victorykit_secretvault");

    // Initialize WebSocket service
    websocketService.initialize(server);

    server.listen(PORT, () => {
      console.log(`🔐 SecretVault API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`
🔑 Configured Integrations:
   - Cloud KMS: AWS KMS, Azure Key Vault, GCP KMS, HashiCorp Vault
   - HSM: Thales, Fortanix, AWS CloudHSM, nCipher
   - Certificates: Let's Encrypt, DigiCert, Sectigo, Venafi
   - Audit: Splunk, Datadog, CloudTrail
      `);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    // Start server anyway in development for testing
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Starting in development mode without MongoDB...");
      websocketService.initialize(server);
      server.listen(PORT, () => {
        console.log(`🔐 SecretVault API (dev mode) on port ${PORT}`);
      });
    }
  });

module.exports = { app, server };
