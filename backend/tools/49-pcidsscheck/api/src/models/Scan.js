const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true },
  scanType: {
    type: String,
    enum: ['full_assessment', 'quick_scan', 'specific_requirement', 'pre_audit_check', 'gap_analysis'],
    required: true
  },
  merchantLevel: {
    type: String,
    enum: ['level1', 'level2', 'level3', 'level4']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  scope: {
    networks: [String],
    systems: [String],
    applications: [String]
  },
  requirements: [{
    type: String,
    enum: ['req1', 'req2', 'req3', 'req4', 'req5', 'req6', 'req7', 'req8', 'req9', 'req10', 'req11', 'req12']
  }],
  overallScore: { type: Number, default: 0, min: 0, max: 100 },
  requirementScores: {
    req1: { type: Number, default: 0 },
    req2: { type: Number, default: 0 },
    req3: { type: Number, default: 0 },
    req4: { type: Number, default: 0 },
    req5: { type: Number, default: 0 },
    req6: { type: Number, default: 0 },
    req7: { type: Number, default: 0 },
    req8: { type: Number, default: 0 },
    req9: { type: Number, default: 0 },
    req10: { type: Number, default: 0 },
    req11: { type: Number, default: 0 },
    req12: { type: Number, default: 0 }
  },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: Number,
  findingsCount: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    info: { type: Number, default: 0 }
  },
  metadata: {
    initiatedBy: String,
    scannerVersion: String,
    notes: String
  }
}, { timestamps: true });

scanSchema.index({ scanId: 1 });
scanSchema.index({ status: 1 });
scanSchema.index({ createdAt: -1 });
scanSchema.index({ merchantLevel: 1 });

module.exports = mongoose.model('Scan', scanSchema);
