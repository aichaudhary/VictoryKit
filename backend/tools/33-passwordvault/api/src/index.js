require('dotenv').config();

const app = require('./app');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to Uncaught Exception');
  process.exit(1);
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 PasswordVault API Server Started Successfully!
📍 Server running on port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${PORT}/health
📚 API Documentation: http://localhost:${PORT}/api/docs
🔐 Encryption: AES-256-GCM with PBKDF2
🛡️  Security: Enterprise-grade with MFA & RBAC
  `);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});

module.exports = server;