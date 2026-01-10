const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const { requestLogger, errorHandler, corsOptions, apiLimiter } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions
});

const PORT = process.env.PORT || 4035;

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// API rate limiting
app.use('/api/', apiLimiter);

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'EmailDefender',
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main routes
app.use('/api/v1/emaildefender', require('./routes'));

// Error handling middleware (must be last)
app.use(errorHandler);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('EmailDefender client connected:', socket.id);

  // Real-time email processing
  socket.on('process_email', async (emailData) => {
    try {
      const emailGuardService = require('./services/emailGuardService');
      const result = await emailGuardService.processEmail(emailData);

      // Send processing result
      socket.emit('email_processed', result);

      // Send real-time updates
      socket.emit('processing_update', {
        emailId: result.emailId,
        status: 'completed',
        threatScore: result.threatScore,
        action: result.action,
        processingTime: result.processingTime
      });

    } catch (error) {
      console.error('Real-time email processing error:', error);
      socket.emit('processing_error', {
        error: error.message,
        emailId: emailData.messageId
      });
    }
  });

  // Real-time threat monitoring
  socket.on('monitor_threats', async (filters) => {
    try {
      // Set up real-time threat monitoring
      const threatMonitor = setInterval(async () => {
        const emailGuardService = require('./services/emailGuardService');
        const threats = await emailGuardService.getRecentThreats(filters);

        if (threats.length > 0) {
          socket.emit('threat_alert', threats);
        }
      }, 30000); // Check every 30 seconds

      socket.on('stop_monitoring', () => {
        clearInterval(threatMonitor);
      });

      socket.on('disconnect', () => {
        clearInterval(threatMonitor);
      });

    } catch (error) {
      console.error('Threat monitoring setup failed:', error);
      socket.emit('monitoring_error', { error: error.message });
    }
  });

  // Real-time quarantine management
  socket.on('get_quarantine', async (filters) => {
    try {
      const Quarantine = require('./models').Quarantine;
      const query = { status: 'quarantined' };

      if (filters?.severity) query.severity = filters.severity;
      if (filters?.reason) query.reason = filters.reason;

      const quarantinedEmails = await Quarantine.find(query)
        .populate('emailId')
        .sort({ quarantinedAt: -1 })
        .limit(50);

      socket.emit('quarantine_list', quarantinedEmails);
    } catch (error) {
      console.error('Quarantine retrieval error:', error);
      socket.emit('quarantine_error', { error: error.message });
    }
  });

  // Real-time policy management
  socket.on('get_policies', async () => {
    try {
      const EmailPolicy = require('./models').EmailPolicy;
      const policies = await EmailPolicy.find({ enabled: true })
        .sort({ priority: -1 });

      socket.emit('policies_list', policies);
    } catch (error) {
      console.error('Policy retrieval error:', error);
      socket.emit('policies_error', { error: error.message });
    }
  });

  // Real-time statistics
  socket.on('get_stats', async (timeRange) => {
    try {
      const emailGuardService = require('./services/emailGuardService');
      const stats = await emailGuardService.getRealTimeStats(timeRange);

      socket.emit('stats_update', stats);
    } catch (error) {
      console.error('Stats retrieval error:', error);
      socket.emit('stats_error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('EmailDefender client disconnected:', socket.id);
  });
});

// MongoDB connection
const MONGODB_URI = process.env.EMAILGUARD_MONGODB_URI || 'mongodb://localhost:27017/emaildefender_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

server.listen(PORT, () => {
  console.log(`EmailDefender API with WebSocket support running on port ${PORT}`);
});
