/**
 * IoTSecure MongoDB Models
 * 
 * This module exports all MongoDB models for the IoTSecure platform.
 * 
 * Models:
 * - Device: IoT device inventory and management
 * - Vulnerability: CVE/vulnerability tracking
 * - Scan: Network and security scan operations
 * - Alert: Security alerts and notifications
 * - Baseline: Behavioral baselines for anomaly detection
 * - Firmware: Firmware inventory and security analysis
 * - Segment: Network segmentation and access control
 */

const Device = require('./Device');
const Vulnerability = require('./Vulnerability');
const Scan = require('./Scan');
const Alert = require('./Alert');
const Baseline = require('./Baseline');
const Firmware = require('./Firmware');
const Segment = require('./Segment');

module.exports = {
  Device,
  Vulnerability,
  Scan,
  Alert,
  Baseline,
  Firmware,
  Segment
};
