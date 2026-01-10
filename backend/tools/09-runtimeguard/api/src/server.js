const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { config, connectDB, errorHandler, logger } = require('../../../../shared');
const routes = require('./routes');

const app = express();
const PORT = config.ports?.runtimeguard || 4009;

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Routes
app.use('/api/v1/runtimeguard', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'runtimeguard-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB('runtimeguard');
    app.listen(PORT, () => {
      logger.info(`✅ RuntimeGuard API running on port ${PORT}`);
      logger.info(`📍 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
