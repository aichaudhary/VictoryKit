/**
 * RiskQuantify - Models Index
 * ===========================
 * Centralized model exports for IP Risk Scanner & Payment Sandbox Platform
 *
 * Models:
 * - IPLookup: IP address analysis results and caching
 * - DeviceFingerprint: Device fingerprint tracking and trust scores
 * - PaymentSimulation: Payment sandbox simulation results
 * - BlacklistCache: Cached blacklist check results
 *
 * @module models
 * @version 19.1.0
 */

const IPLookup = require('./IPLookup');
const DeviceFingerprint = require('./DeviceFingerprint');
const PaymentSimulation = require('./PaymentSimulation');
const BlacklistCache = require('./BlacklistCache');

module.exports = {
  // Primary Models
  IPLookup,
  DeviceFingerprint,
  PaymentSimulation,
  BlacklistCache,

  // Aliases for consistency
  IPLookupModel: IPLookup,
  DeviceModel: DeviceFingerprint,
  PaymentModel: PaymentSimulation,
  BlacklistModel: BlacklistCache,

  // Model names for dynamic loading
  modelNames: [
    'IPLookup',
    'DeviceFingerprint',
    'PaymentSimulation',
    'BlacklistCache',
  ],
};
