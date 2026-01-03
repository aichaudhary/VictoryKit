/**
 * ThreatModel API Server - Enhanced
 * Port: 4018 (HTTP), 4118 (WebSocket)
 * AI-powered Threat modeling with STRIDE/PASTA analysis
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const websocketService = require("./services/websocketService");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4018;
const WS_PORT = process.env.WS_PORT || 4118;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3018', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "ThreatModel API",
    version: "2.0.0",
    features: ["STRIDE", "PASTA", "AI Analysis", "Threat Intel", "Real-time"],
    timestamp: new Date().toISOString(),
  });
});

// API info endpoint
app.get("/api/info", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "ThreatModel API",
      version: "2.0.0",
      description: "AI-powered threat modeling with STRIDE/PASTA analysis",
      endpoints: {
        threatModels: "/api/threat-models",
        threats: "/api/threats",
        mitigations: "/api/mitigations",
        components: "/api/components",
        aiAnalysis: "/api/ai/*",
        threatIntel: "/api/intel/*",
        reports: "/api/reports/*",
        dashboard: "/api/dashboard"
      },
      features: [
        "STRIDE threat analysis",
        "PASTA methodology",
        "AI-powered threat detection",
        "CVE/NVD integration",
        "MITRE ATT&CK mapping",
        "VirusTotal integration",
        "OWASP Top 10 mapping",
        "Real-time collaboration",
        "Multi-format report export"
      ],
      websocket: {
        url: `ws://localhost:${WS_PORT}/ws/threatmodel`,
        events: ["threat_update", "model_update", "analysis_complete"]
      }
    }
  });
});

// Dashboard endpoint
app.get("/api/v1/threatmodel/dashboard", async (req, res) => {
  try {
    const ThreatModel = require("./models/ThreatModel");
    const Threat = require("./models/Threat");
    
    const [models, threats] = await Promise.all([
      ThreatModel.find().select("name status methodology riskSummary createdAt").lean(),
      Threat.find().select("name category riskLevel status severity createdAt").lean()
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalModels: models.length,
          totalThreats: threats.length,
          mitigatedThreats: threats.filter(t => t.status === 'mitigated').length,
          criticalThreats: threats.filter(t => t.riskLevel === 'critical' || t.severity === 'critical').length
        },
        threatsByCategory: [
          { category: 'STRIDE', count: threats.filter(t => ['spoofing', 'tampering', 'repudiation', 'information_disclosure', 'denial_of_service', 'elevation_of_privilege'].includes(t.category)).length },
          { category: 'Other', count: threats.filter(t => t.category === 'other').length }
        ],
        recentThreats: threats.slice(0, 10).map(t => ({
          _id: t._id,
          name: t.name,
          category: t.category,
          type: t.category,
          severity: t.riskLevel || t.severity || 'medium',
          status: t.status || 'identified'
        }))
      }
    });
  } catch (error) {
    res.json({
      success: true,
      simulated: true,
      data: {
        overview: { totalModels: 12, totalThreats: 86, mitigatedThreats: 54, criticalThreats: 8 },
        threatsByCategory: [
          { category: 'STRIDE', count: 65 },
          { category: 'DREAD', count: 15 },
          { category: 'Other', count: 6 }
        ],
        recentThreats: [
          { _id: '1', name: 'SQL Injection', category: 'tampering', type: 'Injection', severity: 'critical', status: 'identified' },
          { _id: '2', name: 'Broken Authentication', category: 'spoofing', type: 'Authentication', severity: 'high', status: 'mitigated' },
          { _id: '3', name: 'Sensitive Data Exposure', category: 'information_disclosure', type: 'Data Leak', severity: 'high', status: 'identified' },
          { _id: '4', name: 'Privilege Escalation', category: 'elevation_of_privilege', type: 'Access Control', severity: 'critical', status: 'identified' },
          { _id: '5', name: 'DDoS Attack', category: 'denial_of_service', type: 'Availability', severity: 'medium', status: 'mitigated' }
        ]
      }
    });
  }
});

// Models list endpoint
app.get("/api/v1/threatmodel/models", async (req, res) => {
  try {
    const ThreatModel = require("./models/ThreatModel");
    const models = await ThreatModel.find()
      .populate('threats')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: models.map(m => ({
        _id: m._id,
        name: m.name,
        description: m.description,
        scope: m.scope?.description || m.methodology,
        threats: m.threats || [],
        assets: m.components || []
      }))
    });
  } catch (error) {
    res.json({
      success: true,
      simulated: true,
      data: [
        { _id: '1', name: 'Web Application Model', description: 'Main web application threat model', scope: 'Production', threats: [], assets: [{ name: 'Database', type: 'data' }, { name: 'API', type: 'service' }] },
        { _id: '2', name: 'API Gateway Model', description: 'API gateway security analysis', scope: 'API Layer', threats: [], assets: [{ name: 'Gateway', type: 'service' }] },
        { _id: '3', name: 'Mobile App Model', description: 'Mobile application threat model', scope: 'Mobile', threats: [], assets: [] }
      ]
    });
  }
});

// WebSocket metrics endpoint
app.get("/api/ws/metrics", (req, res) => {
  res.json({
    success: true,
    data: websocketService.getMetrics()
  });
});

// Error handling
app.use(errorHandler);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/victorykit_threatmodel";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🎯 ThreatModel API running on port ${PORT}`);
      console.log(`📡 API endpoints: http://localhost:${PORT}/api`);
    });
    
    // Initialize WebSocket on same server
    websocketService.initialize(server);
    console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws/threatmodel`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("🔄 Starting server without database (simulation mode)...");
    
    server.listen(PORT, () => {
      console.log(`🎯 ThreatModel API running on port ${PORT} (simulation mode)`);
    });
    
    websocketService.initialize(server);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  websocketService.close();
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = { app, server };
