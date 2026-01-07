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

dotenv.config();

const PORT = process.env.API_PORT || 4016;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/networkmonitor_db';
const WS_PORT = parseInt(process.env.WS_PORT || '4017');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'networkmonitor-api' },
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
  .then(() => logger.info('NetworkMonitor API connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Define MongoDB schemas
const TrafficLogSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  timestamp: { type: Date, default: Date.now },
  sourceIP: { type: String, required: true },
  destinationIP: { type: String, required: true },
  sourcePort: { type: Number, required: true },
  destinationPort: { type: Number, required: true },
  protocol: { type: String, required: true },
  packetSize: { type: Number, required: true },
  sessionId: { type: String, default: uuidv4 },
  deviceId: { type: String, required: true },
  anomalyScore: { type: Number, default: 0 },
  classification: { type: String, default: 'normal' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const NetworkDeviceSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  ipAddress: { type: String, required: true, unique: true },
  macAddress: { type: String, sparse: true },
  hostname: { type: String },
  deviceType: { type: String, enum: ['router', 'switch', 'server', 'workstation', 'printer', 'iot', 'unknown'], default: 'unknown' },
  vendor: { type: String },
  os: { type: String },
  status: { type: String, enum: ['online', 'offline', 'unknown'], default: 'unknown' },
  lastSeen: { type: Date, default: Date.now },
  capabilities: [{ type: String }],
  location: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const AlertSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  alertId: { type: String, unique: true, default: () => `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
  type: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  source: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['new', 'acknowledged', 'resolved', 'false_positive'], default: 'new' },
  assignedTo: { type: String },
  resolution: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const NetworkTopologySchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  deviceId: { type: String, required: true },
  connections: [{
    targetDeviceId: { type: String, required: true },
    interface: { type: String },
    bandwidth: { type: Number },
    latency: { type: Number },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Create models
const TrafficLog = mongoose.model('TrafficLog', TrafficLogSchema);
const NetworkDevice = mongoose.model('NetworkDevice', NetworkDeviceSchema);
const Alert = mongoose.model('Alert', AlertSchema);
const NetworkTopology = mongoose.model('NetworkTopology', NetworkTopologySchema);

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

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'NetworkMonitor API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Network Device Routes
app.get('/api/network/devices', async (req, res) => {
  try {
    const { status, deviceType, limit = 100, offset = 0 } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (deviceType) query.deviceType = deviceType;

    const devices = await NetworkDevice.find(query)
      .sort({ lastSeen: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    const total = await NetworkDevice.countDocuments(query);

    res.json({
      devices,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    logger.error('Error fetching network devices:', error);
    res.status(500).json({ error: 'Failed to fetch network devices' });
  }
});

app.get('/api/network/devices/:id', [
  param('id').isUUID()
], handleValidationErrors, async (req, res) => {
  try {
    const device = await NetworkDevice.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    logger.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

app.post('/api/network/devices', [
  body('ipAddress').isIP(),
  body('deviceType').optional().isIn(['router', 'switch', 'server', 'workstation', 'printer', 'iot', 'unknown']),
  body('hostname').optional().isString(),
  body('macAddress').optional().isMACAddress()
], handleValidationErrors, async (req, res) => {
  try {
    const device = new NetworkDevice(req.body);
    await device.save();
    res.status(201).json(device);
  } catch (error) {
    logger.error('Error creating device:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

app.put('/api/network/devices/:id', [
  param('id').isUUID(),
  body('status').optional().isIn(['online', 'offline', 'unknown']),
  body('hostname').optional().isString(),
  body('deviceType').optional().isIn(['router', 'switch', 'server', 'workstation', 'printer', 'iot', 'unknown'])
], handleValidationErrors, async (req, res) => {
  try {
    const device = await NetworkDevice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastSeen: new Date() },
      { new: true }
    );
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    logger.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Traffic Analysis Routes
app.get('/api/traffic/logs', async (req, res) => {
  try {
    const {
      sourceIP,
      destinationIP,
      protocol,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
      sort = '-timestamp'
    } = req.query;

    const query: any = {};

    if (sourceIP) query.sourceIP = sourceIP;
    if (destinationIP) query.destinationIP = destinationIP;
    if (protocol) query.protocol = protocol;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await TrafficLog.find(query)
      .sort(sort as string)
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .populate('deviceId');

    const total = await TrafficLog.countDocuments(query);

    res.json({
      logs,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    logger.error('Error fetching traffic logs:', error);
    res.status(500).json({ error: 'Failed to fetch traffic logs' });
  }
});

app.post('/api/traffic/logs', [
  body('sourceIP').isIP(),
  body('destinationIP').isIP(),
  body('sourcePort').isInt({ min: 1, max: 65535 }),
  body('destinationPort').isInt({ min: 1, max: 65535 }),
  body('protocol').isString(),
  body('packetSize').isInt({ min: 0 }),
  body('deviceId').isUUID()
], handleValidationErrors, async (req, res) => {
  try {
    const trafficLog = new TrafficLog(req.body);
    await trafficLog.save();
    res.status(201).json(trafficLog);
  } catch (error) {
    logger.error('Error creating traffic log:', error);
    res.status(500).json({ error: 'Failed to create traffic log' });
  }
});

app.get('/api/traffic/patterns', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startDate = new Date(Date.now() - parseInt(hours as string) * 60 * 60 * 1000);

    // Aggregate traffic patterns
    const patterns = await TrafficLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            protocol: '$protocol',
            hour: { $hour: '$timestamp' }
          },
          count: { $sum: 1 },
          avgPacketSize: { $avg: '$packetSize' },
          totalBytes: { $sum: '$packetSize' }
        }
      },
      { $sort: { '_id.hour': 1, count: -1 } }
    ]);

    res.json({ patterns, timeframe: `${hours} hours` });
  } catch (error) {
    logger.error('Error analyzing traffic patterns:', error);
    res.status(500).json({ error: 'Failed to analyze traffic patterns' });
  }
});

app.get('/api/traffic/anomalies', async (req, res) => {
  try {
    const { threshold = 0.7, limit = 50 } = req.query;

    const anomalies = await TrafficLog.find({
      anomalyScore: { $gte: parseFloat(threshold as string) }
    })
      .sort({ anomalyScore: -1, timestamp: -1 })
      .limit(parseInt(limit as string))
      .populate('deviceId');

    res.json({ anomalies, threshold: parseFloat(threshold as string) });
  } catch (error) {
    logger.error('Error fetching anomalies:', error);
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
});

// Alert Management Routes
app.get('/api/alerts', async (req, res) => {
  try {
    const { status, severity, limit = 50, offset = 0 } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (severity) query.severity = severity;

    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    const total = await Alert.countDocuments(query);

    res.json({
      alerts,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.get('/api/alerts/:id', [
  param('id').isUUID()
], handleValidationErrors, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    logger.error('Error fetching alert:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

app.put('/api/alerts/:id/status', [
  param('id').isUUID(),
  body('status').isIn(['new', 'acknowledged', 'resolved', 'false_positive']),
  body('assignedTo').optional().isString(),
  body('resolution').optional().isString()
], handleValidationErrors, async (req, res) => {
  try {
    const updateData = {
      status: req.body.status,
      ...(req.body.assignedTo && { assignedTo: req.body.assignedTo }),
      ...(req.body.resolution && { resolution: req.body.resolution })
    };

    const alert = await Alert.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    logger.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

app.post('/api/alerts', [
  body('type').isString(),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('title').isString(),
  body('description').isString(),
  body('source').isString()
], handleValidationErrors, async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    logger.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Network Topology Routes
app.get('/api/network/topology', async (req, res) => {
  try {
    const topology = await NetworkTopology.find()
      .populate('deviceId')
      .populate('connections.targetDeviceId');

    res.json({ topology });
  } catch (error) {
    logger.error('Error fetching topology:', error);
    res.status(500).json({ error: 'Failed to fetch network topology' });
  }
});

// Performance Monitoring Routes
app.get('/api/metrics/performance', async (req, res) => {
  try {
    const { hours = 1 } = req.query;
    const startDate = new Date(Date.now() - parseInt(hours as string) * 60 * 60 * 1000);

    const metrics = await TrafficLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalPackets: { $sum: 1 },
          totalBytes: { $sum: '$packetSize' },
          avgPacketSize: { $avg: '$packetSize' },
          uniqueSources: { $addToSet: '$sourceIP' },
          uniqueDestinations: { $addToSet: '$destinationIP' },
          protocols: { $addToSet: '$protocol' }
        }
      }
    ]);

    const deviceStatus = await NetworkDevice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      timeframe: `${hours} hours`,
      traffic: metrics[0] || {},
      devices: deviceStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Security Metrics
app.get('/api/metrics/security', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startDate = new Date(Date.now() - parseInt(hours as string) * 60 * 60 * 1000);

    const securityMetrics = await TrafficLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalTraffic: { $sum: 1 },
          anomaliesDetected: {
            $sum: { $cond: [{ $gte: ['$anomalyScore', 0.7] }, 1, 0] }
          },
          suspiciousPorts: {
            $sum: {
              $cond: [
                { $in: ['$destinationPort', [22, 3389, 23, 21]] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const alertsBySeverity = await Alert.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      timeframe: `${hours} hours`,
      trafficAnalysis: securityMetrics[0] || {},
      alertsBySeverity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching security metrics:', error);
    res.status(500).json({ error: 'Failed to fetch security metrics' });
  }
});

// Network Discovery Route
app.post('/api/network/scan', async (req, res) => {
  try {
    // This would integrate with network scanning tools
    // For now, return a placeholder response
    const scanId = uuidv4();

    // Simulate network discovery (in real implementation, use nmap, ping, etc.)
    setTimeout(async () => {
      // Mock discovered devices
      const mockDevices = [
        {
          ipAddress: '192.168.1.1',
          hostname: 'gateway.local',
          deviceType: 'router',
          status: 'online'
        },
        {
          ipAddress: '192.168.1.100',
          hostname: 'server-01.local',
          deviceType: 'server',
          status: 'online'
        }
      ];

      for (const deviceData of mockDevices) {
        try {
          await NetworkDevice.findOneAndUpdate(
            { ipAddress: deviceData.ipAddress },
            { ...deviceData, lastSeen: new Date() },
            { upsert: true, new: true }
          );
        } catch (error) {
          logger.error('Error saving discovered device:', error);
        }
      }
    }, 1000);

    res.json({
      scanId,
      status: 'started',
      message: 'Network discovery scan initiated',
      estimatedDuration: '30 seconds'
    });
  } catch (error) {
    logger.error('Error starting network scan:', error);
    res.status(500).json({ error: 'Failed to start network scan' });
  }
});

// WebSocket server for real-time updates
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  logger.info('Real-time client connected to NetworkMonitor API');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      // Handle real-time subscriptions
      if (message.type === 'subscribe') {
        ws.send(JSON.stringify({
          type: 'subscribed',
          channels: message.channels || ['traffic', 'alerts', 'devices']
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
cron.schedule('*/5 * * * *', async () => {
  try {
    // Update device statuses
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await NetworkDevice.updateMany(
      { lastSeen: { $lt: fiveMinutesAgo }, status: 'online' },
      { status: 'offline' }
    );

    // Clean up old traffic logs (keep last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await TrafficLog.deleteMany({ timestamp: { $lt: thirtyDaysAgo } });

    logger.info('Scheduled maintenance completed');
  } catch (error) {
    logger.error('Scheduled maintenance error:', error);
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
  logger.info(`NetworkMonitor API server running on port ${PORT}`);
  logger.info(`WebSocket server running on port ${WS_PORT}`);
});

export default app;