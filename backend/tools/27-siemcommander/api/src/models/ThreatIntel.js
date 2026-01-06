const mongoose = require('mongoose');

const threatIntelSchema = new mongoose.Schema({
  iocId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  iocType: {
    type: String,
    required: true,
    enum: ['ip', 'domain', 'url', 'hash', 'email', 'cve', 'file_hash', 'registry_key', 'mutex', 'certificate'],
    index: true
  },
  iocValue: {
    type: String,
    required: true,
    index: true
  },
  threatType: {
    type: String,
    enum: ['malware', 'ransomware', 'phishing', 'c2', 'apt', 'trojan', 'botnet', 'exploit', 'vulnerability'],
    index: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  source: {
    feed: String,
    provider: String,
    url: String,
    lastUpdated: Date
  },
  description: String,
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: Date,
  tags: [String],
  malwareFamily: String,
  campaignId: String,
  threatActor: String,
  ttps: [{ // MITRE ATT&CK TTPs
    tacticId: String,
    tacticName: String,
    techniqueId: String,
    techniqueName: String
  }],
  associatedCVEs: [String],
  relatedIOCs: [{
    iocType: String,
    iocValue: String,
    relationship: String
  }],
  geolocation: {
    country: String,
    countryCode: String,
    region: String,
    city: String,
    asn: String,
    organization: String
  },
  detectionCount: {
    type: Number,
    default: 0
  },
  lastDetected: Date,
  blockedCount: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  whitelisted: {
    type: Boolean,
    default: false
  },
  whitelistReason: String,
  expiresAt: Date,
  references: [{
    type: String,
    url: String,
    description: String
  }],
  enrichment: {
    virusTotal: mongoose.Schema.Types.Mixed,
    abuseIPDB: mongoose.Schema.Types.Mixed,
    shodan: mongoose.Schema.Types.Mixed,
    urlhaus: mongoose.Schema.Types.Mixed
  },
  automatedActions: [{
    action: String,
    enabled: Boolean,
    parameters: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes
threatIntelSchema.index({ iocType: 1, iocValue: 1 }, { unique: true });
threatIntelSchema.index({ threatType: 1, severity: 1 });
threatIntelSchema.index({ active: 1, confidence: -1 });
threatIntelSchema.index({ tags: 1 });
threatIntelSchema.index({ expiresAt: 1 });
threatIntelSchema.index({ 'source.provider': 1 });

module.exports = mongoose.model('ThreatIntel', threatIntelSchema);
