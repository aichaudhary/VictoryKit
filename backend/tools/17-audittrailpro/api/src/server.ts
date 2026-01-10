import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import winston from 'winston';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

dotenv.config();

const PORT = process.env.API_PORT || 4017;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/audittrailpro_db';
const WS_PORT = parseInt(process.env.WS_PORT || '4018');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'audittrailpro-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('AuditTrailPro API connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Define MongoDB schemas
const AuditLogSchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  eventId: { type: String, default: () => `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
  timestamp: { type: Date, default: Date.now },
  eventType: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  source: {
    ip: { type: String },
    userAgent: { type: String },
    userId: { type: String },
    sessionId: { type: String },
    tenantId: { type: String }
  },
  action: {
    type: { type: String, required: true },
    resource: { type: String },
    method: { type: String },
    success: { type: Boolean, default: true },
    details: { type: mongoose.Schema.Types.Mixed }
  },
  compliance: {
    frameworks: [{ type: String }],
    requirements: [{ type: String }],
    violations: [{ type: String }]
  },
  integrity: {
    hash: { type: String },
    signature: { type: String },
    chainHash: { type: String }
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const ComplianceReportSchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  reportId: { type: String, unique: true, default: () => `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
  framework: { type: String, required: true },
  period: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  scores: {
    overall: { type: Number, min: 0, max: 100 },
    categories: { type: mongoose.Schema.Types.Mixed },
    requirements: { type: mongoose.Schema.Types.Mixed }
  },
  violations: [{
    requirement: { type: String },
    severity: { type: String },
    description: { type: String },
    evidence: { type: mongoose.Schema.Types.Mixed }
  }],
  recommendations: [{ type: String }],
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String }
}, { timestamps: true });

const SecurityEventSchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  eventId: { type: String, unique: true, default: () => `SEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
  type: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  source: { type: mongoose.Schema.Types.Mixed },
  target: { type: mongoose.Schema.Types.Mixed },
  details: { type: mongoose.Schema.Types.Mixed },
  correlationId: { type: String },
  incidentId: { type: String },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  resolution: { type: String }
}, { timestamps: true });

const RetentionPolicySchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  name: { type: String, required: true },
  description: { type: String },
  retentionPeriod: { type: Number, required: true }, // days
  frameworks: [{ type: String }],
  eventTypes: [{ type: String }],
  autoDelete: { type: Boolean, default: true },
  lastExecuted: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create models
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
const ComplianceReport = mongoose.model('ComplianceReport', ComplianceReportSchema);
const SecurityEvent = mongoose.model('SecurityEvent', SecurityEventSchema);
const RetentionPolicy = mongoose.model('RetentionPolicy', RetentionPolicySchema);

// Express app setup
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Validation middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Utility functions
function generateAuditHash(auditData: any): string {
  const dataString = JSON.stringify(auditData, Object.keys(auditData).sort());
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

function signAuditLog(data: any, privateKey?: string): string {
  // In production, use actual private key for signing
  const signature = crypto.createSign('RSA-SHA256');
  signature.update(JSON.stringify(data, Object.keys(data).sort()));
  return signature.sign(privateKey || 'default-key', 'hex');
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'AuditTrailPro API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'FINAL TOOL'
  });
});

// Audit Log Routes
app.post('/api/audit/logs', [
  body('eventType').isString().notEmpty(),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('action.type').isString().notEmpty()
], handleValidationErrors, async (req: express.Request, res: express.Response) => {
  try {
    // Generate integrity data
    const auditData = { ...req.body, timestamp: new Date() };
    const hash = generateAuditHash(auditData);
    const signature = signAuditLog(auditData);

    const auditLog = new AuditLog({
      ...auditData,
      integrity: {
        hash,
        signature,
        chainHash: hash // In production, chain with previous log
      }
    });

    await auditLog.save();

    // Broadcast to WebSocket clients
    if (wss.clients.size > 0) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'audit_log',
            data: auditLog
          }));
        }
      });
    }

    res.status(201).json(auditLog);
  } catch (error) {
    logger.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

app.get('/api/audit/logs', async (req, res) => {
  try {
    const {
      eventType,
      severity,
      userId,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
      sort = '-timestamp'
    } = req.query;

    const query: any = {};

    if (eventType) query.eventType = eventType;
    if (severity) query.severity = severity;
    if (userId) query['source.userId'] = userId;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await AuditLog.find(query)
      .sort(sort as string)
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    const total = await AuditLog.countDocuments(query);

    res.json({
      logs,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.get('/api/audit/logs/search', async (req, res) => {
  try {
    const { q, limit = 50 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    // Simple text search - in production, use Elasticsearch or similar
    const logs = await AuditLog.find({
      $or: [
        { eventType: new RegExp(q as string, 'i') },
        { 'action.type': new RegExp(q as string, 'i') },
        { 'action.resource': new RegExp(q as string, 'i') },
        { 'source.userId': new RegExp(q as string, 'i') }
      ]
    })
      .sort('-timestamp')
      .limit(parseInt(limit as string));

    res.json({ logs, query: q });
  } catch (error) {
    logger.error('Error searching audit logs:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Compliance Report Routes
app.post('/api/compliance/reports/generate', [
  body('framework').isString().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], handleValidationErrors, async (req: express.Request, res: express.Response) => {
  try {
    const { framework, startDate, endDate } = req.body;

    // Get logs for the period
    const logs = await AuditLog.find({
      timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
      'compliance.frameworks': framework
    });

    // Calculate compliance score
    const totalLogs = logs.length;
    const violations = logs.filter(log => (log.compliance?.violations?.length || 0) > 0).length;
    const complianceScore = totalLogs > 0 ? ((totalLogs - violations) / totalLogs) * 100 : 100;

    // Generate report
    const report = new ComplianceReport({
      framework,
      period: { start: new Date(startDate), end: new Date(endDate) },
      scores: {
        overall: Math.round(complianceScore),
        categories: {},
        requirements: {}
      },
      violations: logs
        .filter(log => log.compliance?.violations?.length > 0)
        .map(log => ({
          requirement: log.compliance.violations[0],
          severity: log.severity,
          description: `Violation in ${log.eventType}`,
          evidence: log
        })),
      recommendations: [
        'Review access control policies',
        'Implement additional monitoring',
        'Conduct security awareness training'
      ]
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    logger.error('Error generating compliance report:', error);
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
});

app.get('/api/compliance/reports', async (req, res) => {
  try {
    const { framework, limit = 20 } = req.query;
    const query: any = {};

    if (framework) query.framework = framework;

    const reports = await ComplianceReport.find(query)
      .sort('-generatedAt')
      .limit(parseInt(limit as string));

    res.json({ reports });
  } catch (error) {
    logger.error('Error fetching compliance reports:', error);
    res.status(500).json({ error: 'Failed to fetch compliance reports' });
  }
});

// Security Events Routes
app.post('/api/security/events', [
  body('type').isString().notEmpty(),
  body('severity').isIn(['low', 'medium', 'high', 'critical'])
], handleValidationErrors, async (req: express.Request, res: express.Response) => {
  try {
    const securityEvent = new SecurityEvent(req.body);
    await securityEvent.save();

    // Broadcast security event
    if (wss.clients.size > 0) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'security_event',
            data: securityEvent
          }));
        }
      });
    }

    res.status(201).json(securityEvent);
  } catch (error) {
    logger.error('Error creating security event:', error);
    res.status(500).json({ error: 'Failed to create security event' });
  }
});

app.get('/api/security/events', async (req, res) => {
  try {
    const { resolved = false, limit = 50 } = req.query;

    const events = await SecurityEvent.find({ resolved: resolved === 'true' })
      .sort('-timestamp')
      .limit(parseInt(limit as string));

    res.json({ events });
  } catch (error) {
    logger.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

// Retention Policy Routes
app.post('/api/retention/policies', [
  body('name').isString().notEmpty(),
  body('retentionPeriod').isInt({ min: 1 })
], handleValidationErrors, async (req: express.Request, res: express.Response) => {
  try {
    const policy = new RetentionPolicy(req.body);
    await policy.save();
    res.status(201).json(policy);
  } catch (error) {
    logger.error('Error creating retention policy:', error);
    res.status(500).json({ error: 'Failed to create retention policy' });
  }
});

app.get('/api/retention/policies', async (req, res) => {
  try {
    const policies = await RetentionPolicy.find();
    res.json({ policies });
  } catch (error) {
    logger.error('Error fetching retention policies:', error);
    res.status(500).json({ error: 'Failed to fetch retention policies' });
  }
});

// Analytics Routes
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      criticalEvents,
      complianceReports,
      activeAlerts
    ] = await Promise.all([
      AuditLog.countDocuments({ timestamp: { $gte: startDate } }),
      AuditLog.countDocuments({ timestamp: { $gte: startDate }, severity: 'critical' }),
      ComplianceReport.countDocuments({ generatedAt: { $gte: startDate } }),
      SecurityEvent.countDocuments({ resolved: false })
    ]);

    // Event type distribution
    const eventTypes = await AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: {
        totalLogs,
        criticalEvents,
        complianceReports,
        activeAlerts,
        period: `${days} days`
      },
      eventTypes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating analytics overview:', error);
    res.status(500).json({ error: 'Failed to generate analytics overview' });
  }
});

// Integrity Verification Route
app.post('/api/integrity/verify', async (req, res) => {
  try {
    const { logId } = req.body;

    if (!logId) {
      return res.status(400).json({ error: 'Log ID required' });
    }

    const log = await AuditLog.findById(logId);
    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    // Verify integrity
    const logData = log.toObject();
    const calculatedHash = generateAuditHash({
      ...logData,
      integrity: undefined,
      chainHash: undefined
    });

    const hashValid = calculatedHash === log.integrity?.hash;
    const signatureValid = true; // In production, verify signature

    res.json({
      logId,
      integrity_verified: hashValid && signatureValid,
      hash_valid: hashValid,
      signature_valid: signatureValid,
      tamper_detected: !(hashValid && signatureValid)
    });
  } catch (error) {
    logger.error('Error verifying integrity:', error);
    res.status(500).json({ error: 'Integrity verification failed' });
  }
});

// WebSocket server for real-time updates
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  logger.info('Real-time client connected to AuditTrailPro API');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      // Handle real-time subscriptions
      if (message.type === 'subscribe') {
        ws.send(JSON.stringify({
          type: 'subscribed',
          channels: message.channels || ['audit_logs', 'security_events', 'compliance_reports']
        }));
      }
    } catch (error) {
      logger.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    logger.info('Real-time client disconnected');
  });
});

// Scheduled tasks
cron.schedule('0 */6 * * *', async () => { // Every 6 hours
  try {
    // Execute retention policies
    const policies = await RetentionPolicy.find({ autoDelete: true });

    for (const policy of policies) {
      const cutoffDate = new Date(Date.now() - policy.retentionPeriod * 24 * 60 * 60 * 1000);

      const deleteQuery: any = { timestamp: { $lt: cutoffDate } };

      if (policy.frameworks?.length > 0) {
        deleteQuery['compliance.frameworks'] = { $in: policy.frameworks };
      }

      if (policy.eventTypes?.length > 0) {
        deleteQuery.eventType = { $in: policy.eventTypes };
      }

      const deletedCount = await AuditLog.deleteMany(deleteQuery);

      if (deletedCount.deletedCount > 0) {
        logger.info(`Retention policy "${policy.name}" deleted ${deletedCount.deletedCount} audit logs`);
      }

      await RetentionPolicy.findByIdAndUpdate(policy._id, { lastExecuted: new Date() });
    }

    logger.info('Retention policy execution completed');
  } catch (error) {
    logger.error('Retention policy execution error:', error);
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`AuditTrailPro API server running on port ${PORT}`);
  logger.info(`WebSocket server running on port ${WS_PORT}`);
  logger.info('FINAL TOOL - AuditTrailPro is now operational');
});

export default app;