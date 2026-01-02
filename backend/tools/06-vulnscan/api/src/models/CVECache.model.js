const mongoose = require('mongoose');

const cveCacheSchema = new mongoose.Schema({
  // CVE Identifier
  cveId: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    match: /^CVE-\d{4}-\d{4,}$/
  },
  
  // Basic CVE Information
  description: {
    type: String,
    required: true
  },
  
  // Publication dates
  published: Date,
  lastModified: Date,
  
  // CVSS v3.1 Scores
  cvssV3: {
    score: { type: Number, min: 0, max: 10 },
    severity: { type: String, enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    vectorString: String,
    attackVector: { type: String, enum: ['NETWORK', 'ADJACENT_NETWORK', 'LOCAL', 'PHYSICAL'] },
    attackComplexity: { type: String, enum: ['LOW', 'HIGH'] },
    privilegesRequired: { type: String, enum: ['NONE', 'LOW', 'HIGH'] },
    userInteraction: { type: String, enum: ['NONE', 'REQUIRED'] },
    scope: { type: String, enum: ['UNCHANGED', 'CHANGED'] },
    confidentialityImpact: { type: String, enum: ['NONE', 'LOW', 'HIGH'] },
    integrityImpact: { type: String, enum: ['NONE', 'LOW', 'HIGH'] },
    availabilityImpact: { type: String, enum: ['NONE', 'LOW', 'HIGH'] }
  },
  
  // CVSS v2 (legacy, for older CVEs)
  cvssV2: {
    score: { type: Number, min: 0, max: 10 },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    vectorString: String
  },
  
  // EPSS (Exploit Prediction Scoring System)
  epss: {
    score: { type: Number, min: 0, max: 1 },  // Probability 0-1
    percentile: { type: Number, min: 0, max: 100 },
    lastUpdated: Date
  },
  
  // KEV (Known Exploited Vulnerabilities) - CISA
  kev: {
    isKnownExploited: { type: Boolean, default: false },
    dateAdded: Date,
    dueDate: Date,
    requiredAction: String,
    notes: String
  },
  
  // Exploit Information
  exploits: {
    available: { type: Boolean, default: false },
    public: { type: Boolean, default: false },
    exploitDb: [{
      id: String,
      title: String,
      url: String,
      type: String  // e.g., 'remote', 'local', 'webapps'
    }],
    metasploit: {
      available: { type: Boolean, default: false },
      moduleName: String,
      moduleType: String
    },
    nucleiTemplate: {
      available: { type: Boolean, default: false },
      templateId: String,
      severity: String
    },
    pocAvailable: { type: Boolean, default: false },
    weaponized: { type: Boolean, default: false }
  },
  
  // Affected Products (CPE)
  affectedProducts: [{
    vendor: String,
    product: String,
    version: String,
    versionStartIncluding: String,
    versionEndIncluding: String,
    versionStartExcluding: String,
    versionEndExcluding: String,
    cpe: String  // Full CPE string
  }],
  
  // CWE Weaknesses
  weaknesses: [{
    cweId: String,
    name: String,
    description: String
  }],
  
  // References
  references: [{
    url: String,
    source: String,
    tags: [String]  // e.g., ['Patch', 'Vendor Advisory', 'Third Party Advisory']
  }],
  
  // Remediation
  remediation: {
    patchAvailable: { type: Boolean, default: false },
    patchUrl: String,
    workaround: String,
    mitigation: String,
    vendorAdvisory: String
  },
  
  // Risk scoring (calculated)
  riskScore: {
    score: { type: Number, min: 0, max: 100 },
    factors: {
      cvssWeight: Number,
      epssWeight: Number,
      exploitWeight: Number,
      kevWeight: Number
    },
    calculatedAt: Date
  },
  
  // Categories/Tags
  categories: [String],  // e.g., ['Remote Code Execution', 'SQL Injection', 'XSS']
  
  // Cache metadata
  source: { 
    type: String, 
    enum: ['NVD', 'MITRE', 'VulnDB', 'manual'],
    default: 'NVD'
  },
  
  // Cache TTL
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)  // 24 hours
  },
  
  // Usage tracking
  lookupCount: { type: Number, default: 0 },
  lastLookup: Date

}, { timestamps: true });

// Indexes
cveCacheSchema.index({ cveId: 1 });
cveCacheSchema.index({ 'cvssV3.score': -1 });
cveCacheSchema.index({ 'epss.score': -1 });
cveCacheSchema.index({ 'kev.isKnownExploited': 1 });
cveCacheSchema.index({ 'affectedProducts.vendor': 1, 'affectedProducts.product': 1 });
cveCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });  // TTL index
cveCacheSchema.index({ categories: 1 });

// Virtual for combined severity
cveCacheSchema.virtual('effectiveSeverity').get(function() {
  // Prioritize based on: KEV > EPSS > CVSS
  if (this.kev?.isKnownExploited) return 'CRITICAL';
  if (this.epss?.score >= 0.5) return 'CRITICAL';
  if (this.epss?.score >= 0.2) return 'HIGH';
  return this.cvssV3?.severity || this.cvssV2?.severity || 'UNKNOWN';
});

// Method to calculate risk score
cveCacheSchema.methods.calculateRiskScore = function() {
  let score = 0;
  const factors = {};
  
  // CVSS contribution (40%)
  if (this.cvssV3?.score) {
    factors.cvssWeight = (this.cvssV3.score / 10) * 40;
    score += factors.cvssWeight;
  }
  
  // EPSS contribution (30%)
  if (this.epss?.score) {
    factors.epssWeight = this.epss.score * 30;
    score += factors.epssWeight;
  }
  
  // Exploit availability (20%)
  if (this.exploits?.available) {
    factors.exploitWeight = 10;
    if (this.exploits.public) factors.exploitWeight += 5;
    if (this.exploits.weaponized) factors.exploitWeight += 5;
    score += factors.exploitWeight;
  }
  
  // KEV (10%)
  if (this.kev?.isKnownExploited) {
    factors.kevWeight = 10;
    score += factors.kevWeight;
  }
  
  this.riskScore = {
    score: Math.round(score),
    factors,
    calculatedAt: new Date()
  };
  
  return this.riskScore;
};

// Method to record lookup
cveCacheSchema.methods.recordLookup = function() {
  this.lookupCount += 1;
  this.lastLookup = new Date();
  return this.save();
};

// Static method to find by product
cveCacheSchema.statics.findByProduct = function(vendor, product, version) {
  const query = {
    'affectedProducts.vendor': new RegExp(vendor, 'i'),
    'affectedProducts.product': new RegExp(product, 'i')
  };
  
  return this.find(query).sort({ 'cvssV3.score': -1 });
};

// Static method to get high-risk CVEs
cveCacheSchema.statics.getHighRiskCVEs = function(limit = 100) {
  return this.find({
    $or: [
      { 'kev.isKnownExploited': true },
      { 'epss.score': { $gte: 0.1 } },
      { 'cvssV3.score': { $gte: 9.0 } }
    ]
  })
  .sort({ 'riskScore.score': -1, 'cvssV3.score': -1 })
  .limit(limit);
};

module.exports = mongoose.model('CVECache', cveCacheSchema);
