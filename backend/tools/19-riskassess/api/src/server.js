/**
 * RiskAssess API Server - Enhanced Edition
 * Port: 4019 (HTTP), 4119 (WebSocket)
 * Enterprise risk assessment and management with AI-powered analysis
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const WebSocket = require("ws");
const http = require("http");
const jwt = require("jsonwebtoken");
const winston = require("winston");
const path = require("path");
require("dotenv").config();

// Import services
const aiRiskAnalysisService = require("./services/aiRiskAnalysisService");
const riskIntelligenceService = require("./services/riskIntelligenceService");
const complianceMappingService = require("./services/complianceMappingService");
const advancedReportingService = require("./services/advancedReportingService");
const realTimeCollaborationService = require("./services/realTimeCollaborationService");
const predictiveAnalyticsService = require("./services/predictiveAnalyticsService");

// Import routes and middleware
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const authMiddleware = require("./middleware/authMiddleware");
const validationMiddleware = require("./middleware/validationMiddleware");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4019;
const WS_PORT = process.env.WEBSOCKET_PORT || 4119;

// Create HTTP server for WebSocket integration
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({
  server,
  path: process.env.WEBSOCKET_PATH || "/ws",
  maxPayload: parseInt(process.env.WEBSOCKET_MESSAGE_SIZE_LIMIT) || 1048576,
});

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "riskassess-api" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: (parseInt(process.env.API_RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// WebSocket rate limiting
const wsLimiter = new Map();

// Middleware stack
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(morgan("combined", {
  stream: { write: (message) => logger.info(message.trim()) }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply rate limiting
app.use("/api", limiter);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/reports", express.static(path.join(__dirname, "../reports")));

// Health check endpoint
app.get("/health", (req, res) => {
  const health = {
    status: "healthy",
    service: "RiskAssess API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    websocket: {
      port: WS_PORT,
      connections: wss.clients.size,
      maxConnections: parseInt(process.env.WEBSOCKET_MAX_CONNECTIONS) || 1000,
    },
    features: {
      aiAnalysis: process.env.ENABLE_AI_ANALYSIS === "true",
      realTimeCollaboration: process.env.ENABLE_REAL_TIME_COLLABORATION === "true",
      predictiveModeling: process.env.ENABLE_PREDICTIVE_MODELING === "true",
      threatIntelligence: process.env.ENABLE_THREAT_INTELLIGENCE === "true",
    },
  };
  res.json(health);
});

// API documentation
// if (process.env.NODE_ENV === "development") {
//   const swaggerUi = require("swagger-ui-express");
//   const swaggerDocument = require("../docs/swagger.json");
//   app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// }

// API routes
app.use("/api/v1", routes);
app.use("/api", routes); // Backward compatibility

// WebSocket connection handling is now managed by realTimeCollaborationService
// The service is initialized with the server in initializeServices()

// Error handling middleware
app.use(errorHandler);

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/victorykit_riskassess";

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info("Connected to MongoDB");

      // Initialize services after DB connection
      await initializeServices();

      // Start scheduled tasks
      startScheduledTasks();

      return;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        logger.error("Failed to connect to MongoDB after all retries");
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Initialize AI and background services
const initializeServices = async () => {
  try {
    if (process.env.ENABLE_AI_ANALYSIS === "true") {
      await aiRiskAnalysisService.initialize();
      logger.info("AI Risk Analysis Service initialized");
    }

    if (process.env.ENABLE_THREAT_INTELLIGENCE === "true") {
      await riskIntelligenceService.initialize();
      logger.info("Risk Intelligence Service initialized");
    }

    if (process.env.ENABLE_COMPLIANCE_INTEGRATION === "true") {
      await complianceMappingService.initialize();
      logger.info("Compliance Mapping Service initialized");
    }

    if (process.env.ENABLE_REAL_TIME_COLLABORATION === "true") {
      await realTimeCollaborationService.initialize(server);
      logger.info("Real-time Collaboration Service initialized");
    }

    if (process.env.ENABLE_ADVANCED_REPORTING === "true") {
      await advancedReportingService.initialize();
      logger.info("Advanced Reporting Service initialized");
    }

    if (process.env.ENABLE_PREDICTIVE_MODELING === "true") {
      await predictiveAnalyticsService.initialize();
      logger.info("Predictive Analytics Service initialized");
    }

    logger.info("All services initialized successfully");
  } catch (error) {
    logger.error("Service initialization error:", error);
  }
};

// Start scheduled tasks
const startScheduledTasks = () => {
  const cron = require("node-cron");

  // Daily risk intelligence updates
  if (process.env.ENABLE_THREAT_INTELLIGENCE === "true") {
    cron.schedule("0 2 * * *", async () => {
      logger.info("Running scheduled risk intelligence update");
      try {
        await riskIntelligenceService.updateThreatFeeds();
      } catch (error) {
        logger.error("Scheduled risk intelligence update failed:", error);
      }
    });
  }

  // Weekly compliance framework updates
  if (process.env.ENABLE_COMPLIANCE_INTEGRATION === "true") {
    cron.schedule("0 3 * * 1", async () => {
      logger.info("Running scheduled compliance framework update");
      try {
        await complianceMappingService.updateComplianceFrameworks();
      } catch (error) {
        logger.error("Scheduled compliance update failed:", error);
      }
    });
  }

  // Monthly predictive model retraining
  if (process.env.ENABLE_PREDICTIVE_MODELING === "true") {
    cron.schedule("0 4 1 * *", async () => {
      logger.info("Running scheduled predictive model retraining");
      try {
        await predictiveAnalyticsService.retrainModels();
      } catch (error) {
        logger.error("Scheduled model retraining failed:", error);
      }
    });
  }

  // Daily report cleanup
  if (process.env.ENABLE_ADVANCED_REPORTING === "true") {
    cron.schedule("0 1 * * *", async () => {
      logger.info("Running scheduled report cleanup");
      try {
        const cleaned = await advancedReportingService.cleanupExpiredReports();
        logger.info(`Cleaned up ${cleaned} expired reports`);
      } catch (error) {
        logger.error("Scheduled report cleanup failed:", error);
      }
    });
  }

  logger.info("Scheduled tasks initialized");
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info("Received shutdown signal, closing connections...");

  // Close WebSocket server
  wss.close(() => {
    logger.info("WebSocket server closed");
  });

  // Close MongoDB connection
  await mongoose.connection.close(() => {
    logger.info("MongoDB connection closed");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`RiskAssess API running on port ${PORT}`);
    logger.info(`WebSocket server running on port ${WS_PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    logger.info(`AI Analysis: ${process.env.ENABLE_AI_ANALYSIS === "true" ? "Enabled" : "Disabled"}`);
    logger.info(`Real-time Collaboration: ${process.env.ENABLE_REAL_TIME_COLLABORATION === "true" ? "Enabled" : "Disabled"}`);
  });
}).catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});

module.exports = { app, server, wss };
