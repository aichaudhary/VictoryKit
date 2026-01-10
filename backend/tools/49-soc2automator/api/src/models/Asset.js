const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['server', 'database', 'application', 'network_device', 'endpoint', 'cloud_resource', 'payment_terminal', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['in_scope', 'out_of_scope', 'connected_to_cde', 'cde'],
    default: 'out_of_scope'
  },
  location: {
    physical: String,
    network: String,
    datacenter: String,
    zone: String
  },
  network: {
    ipAddress: String,
    subnet: String,
    vlan: String,
    macAddress: String,
    hostname: String
  },
  technical: {
    os: String,
    version: String,
    vendor: String,
    model: String,
    serialNumber: String
  },
  dataTypes: [{
    type: String,
    enum: ['pan', 'cardholder_name', 'expiry_date', 'cvv', 'track_data', 'pin', 'none']
  }],
  pciRequirements: [{
    type: String,
    enum: ['req1', 'req2', 'req3', 'req4', 'req5', 'req6', 'req7', 'req8', 'req9', 'req10', 'req11', 'req12']
  }],
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'low'
  },
  owner: String,
  businessUnit: String,
  compliance: {
    lastScanned: Date,
    nextScanDue: Date,
    status: { type: String, enum: ['compliant', 'non_compliant', 'unknown'], default: 'unknown' },
    openFindings: { type: Number, default: 0 }
  },
  connections: [{
    targetAssetId: String,
    connectionType: String,
    ports: [Number],
    protocols: [String]
  }],
  tags: [String],
  notes: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

assetSchema.index({ assetId: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ 'network.ipAddress': 1 });
assetSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('Asset', assetSchema);
