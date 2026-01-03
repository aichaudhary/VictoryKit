/**
 * IoTSecure MongoDB Models
 * 
 * This module exports all MongoDB models for the IoTSecure platform.
 * 
 * Models:
 * - Device: IoT device inventory and management (cameras, sensors, PLCs, etc.)
 * - Vulnerability: CVE/vulnerability tracking from NVD, Shodan, Censys
 * - Scan: Network discovery and security scan operations
 * - Alert: Security alerts and real-time notifications
 * - Baseline: Behavioral baselines for ML anomaly detection
 * - Firmware: Firmware inventory, analysis, and update management
 * - Segment: Network segmentation, firewall rules, and access control
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
