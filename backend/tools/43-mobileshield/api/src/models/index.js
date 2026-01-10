/**
 * MobileShield MongoDB Models
 * 
 * This module exports all MongoDB models for the MobileShield platform.
 * 
 * Models:
 * - Device: Mobile device inventory, enrollment, and security status
 * - App: Mobile application inventory, permissions, and malware analysis
 * - Threat: Security threats, incidents, and attack detection
 * - Policy: Enterprise mobile security policies and compliance rules
 * - Scan: Security scan operations and results
 * - Alert: Real-time security alerts and notifications
 */

const Device = require('./Device');
const App = require('./App');
const Threat = require('./Threat');
const Policy = require('./Policy');
const Scan = require('./Scan');
const Alert = require('./Alert');

module.exports = {
  Device,
  App,
  Threat,
  Policy,
  Scan,
  Alert
};
