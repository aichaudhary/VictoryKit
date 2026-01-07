import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from 'dotenv';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// Import custom modules
import { AIService } from './services/ai.service.js';
import { WebSocketService } from './services/websocket.service.js';
import { ThreatAnalysisService } from './services/threat-analysis.service.js';
import { SessionService } from './services/session.service.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { threatAnalysisRoutes } from './routes/threat-analysis.routes.js';
import { sessionRoutes } from './routes/session.routes.js';

// Load environment variables
config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'threatmodel-ai-assistant' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log')
    })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

class ThreatModelAIAssistant {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private aiService: AIService;
  private webSocketService: WebSocketService;
  private threatAnalysisService: ThreatAnalysisService;
  private sessionService: SessionService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.WS_CORS_ORIGIN || "http://localhost:3018",
        methods: ["GET", "POST"],
        credentials: true
      },
      maxHttpBufferSize: 1e8, // 100MB for large threat models
      pingInterval: parseInt(process.env.WS_PING_INTERVAL || '30000'),
      pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '10000')
    });

    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  private initializeServices(): void {
    try {
      this.aiService = new AIService(logger);
      this.sessionService = new SessionService(logger);
      this.threatAnalysisService = new ThreatAnalysisService(
        this.aiService,
        this.sessionService,
        logger
      );
      this.webSocketService = new WebSocketService(
        this.io,
        this.threatAnalysisService,
        this.sessionService,
        logger
      );

      logger.info('All services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize services', { error });
      throw error;
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3018",
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Rate limiting
    this.app.use(rateLimitMiddleware);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'threatmodel-ai-assistant',
        version: '1.0.0'
      });
    });

    // API routes with authentication
    this.app.use('/api/threat-analysis', authMiddleware, threatAnalysisRoutes);
    this.app.use('/api/sessions', authMiddleware, sessionRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      });
    });
  }

  private setupWebSocket(): void {
    this.webSocketService.initialize();
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    const port = parseInt(process.env.PORT || '6018');
    const host = process.env.HOST || 'localhost';

    try {
      await this.server.listen(port, host);
      logger.info(`ThreatModel AI Assistant server started`, {
        port,
        host,
        environment: process.env.NODE_ENV || 'development'
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.gracefulShutdown());
      process.on('SIGINT', () => this.gracefulShutdown());

    } catch (error) {
      logger.error('Failed to start server', { error });
      throw error;
    }
  }

  private gracefulShutdown(): void {
    logger.info('Received shutdown signal, closing server gracefully...');

    this.server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close WebSocket connections
        this.io.close(() => {
          logger.info('WebSocket server closed');
        });

        // Close database connections if any
        await this.sessionService.close();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', { error });
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  }

  // Getter methods for testing
  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): any {
    return this.server;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public getAIService(): AIService {
    return this.aiService;
  }

  public getThreatAnalysisService(): ThreatAnalysisService {
    return this.threatAnalysisService;
  }

  public getSessionService(): SessionService {
    return this.sessionService;
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const assistant = new ThreatModelAIAssistant();
  assistant.start().catch((error) => {
    console.error('Failed to start ThreatModel AI Assistant:', error);
    process.exit(1);
  });
}

export { ThreatModelAIAssistant };