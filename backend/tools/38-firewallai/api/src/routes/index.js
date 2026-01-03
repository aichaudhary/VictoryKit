// Main routes file for FirewallAI API
const express = require('express');
const router = express.Router();

// Import all route modules
const firewallRoutes = require('./firewallRoutes');

// Mount routes
router.use('/firewall', firewallRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    service: 'FirewallAI API',
    version: '1.0.0',
    endpoints: {
      firewall: '/api/v1/firewallai/firewall',
      health: '/health'
    },
    documentation: '/api/docs'
  });
});

module.exports = router;
