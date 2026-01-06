const mongoose = require('mongoose');

const phiDiscoverySchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true },
  scanDate: { type: Date, default: Date.now },
  scanType: { type: String, enum: ['full', 'targeted', 'incremental'], required: true },
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' },
  scope: {
    systems: [String],
    databases: [String],
    fileShares: [String],
    applications: [String]
  },
  phiLocations: [{
    location: String,
    type: { type: String, enum: ['database', 'file', 'email', 'backup', 'log'] },
    phiTypes: [{ type: String, enum: ['name', 'ssn', 'mrn', 'dob', 'address', 'phone', 'email', 'insurance', 'diagnosis', 'treatment'] }],
    recordCount: Number,
    encrypted: Boolean,
    accessControls: Boolean,
    riskLevel: { type: String, enum: ['critical', 'high', 'medium', 'low'] }
  }],
  statistics: {
    totalLocations: { type: Number, default: 0 },
    encryptedLocations: { type: Number, default: 0 },
    unencryptedLocations: { type: Number, default: 0 },
    criticalFindings: { type: Number, default: 0 }
  },
  initiatedBy: String
}, { timestamps: true });

phiDiscoverySchema.index({ scanId: 1 });
phiDiscoverySchema.index({ scanDate: -1 });
phiDiscoverySchema.index({ status: 1 });

module.exports = mongoose.model('PHIDiscovery', phiDiscoverySchema);
