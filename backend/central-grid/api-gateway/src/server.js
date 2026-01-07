require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFoundHandler } = require('../../../../shared/middleware/errorHandler.middleware');
const gatewayRoutes = require('./routes/gateway.routes');
const logger = require('../../../../shared/utils/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', {
  stream: { write: message => logger.http(message.trim()) }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Gateway routes
app.use('/api/v1', gatewayRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Auth Service: ${process.env.AUTH_SERVICE_URL || 'http://localhost:5000'}`);
});

module.exports = app;
