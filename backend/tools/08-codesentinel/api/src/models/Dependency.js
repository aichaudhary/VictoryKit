/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ CODESENTINEL - Dependency Model
 * Software Composition Analysis (SCA) for Package Security
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const dependencySchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════════════════════
  // Dependency Identification
  // ═══════════════════════════════════════════════════════════════════════════
  codebaseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Codebase', 
    required: true,
    index: true
  },
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodeScan',
    index: true
  },
  
  // Package Information
  name: { 
    type: String, 
    required: true,
    index: true
  },
  version: { 
    type: String, 
    required: true 
  },
  ecosystem: {
    type: String,
    enum: ['npm', 'pypi', 'maven', 'nuget', 'cargo', 'go', 'composer', 'rubygems', 'cocoapods', 'hex'],
    required: true,
    index: true
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Dependency Analysis
  // ═══════════════════════════════════════════════════════════════════════════
  isDirect: { 
    type: Boolean, 
    default: true 
  },
  isDevDependency: { 
    type: Boolean, 
    default: false 
  },
  depth: { 
    type: Number, 
    default: 0 
  },
  parentPackage: String,
  dependencyPath: [String],
  
  // Version Analysis
  latestVersion: String,
  recommendedVersion: String,
  versionsBehind: { type: Number, default: 0 },
  lastPublished: Date,
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Vulnerability Information
  // ═══════════════════════════════════════════════════════════════════════════
  vulnerabilities: [{
    cveId: String,
    ghsaId: String,
    osvId: String,
    title: String,
    description: String,
    severity: { 
      type: String, 
      enum: ['critical', 'high', 'medium', 'low', 'unknown'] 
    },
    cvssScore: { type: Number, min: 0, max: 10 },
    cvssVector: String,
    cwe: [String],
    patchedVersions: [String],
    vulnerableVersionRange: String,
    exploitAvailable: { type: Boolean, default: false },
    exploitMaturity: {
      type: String,
      enum: ['unproven', 'poc', 'functional', 'high'],
      default: 'unproven'
    },
    references: [{
      type: String,
      url: String
    }],
    publishedAt: Date,
    updatedAt: Date
  }],
  
  vulnerabilitySummary: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // License Information
  // ═══════════════════════════════════════════════════════════════════════════
  license: {
    name: String,
    spdxId: String,
    type: {
      type: String,
      enum: ['permissive', 'copyleft', 'proprietary', 'unknown']
    },
    url: String,
    compliance: {
      commercial: { type: Boolean, default: true },
      modification: { type: Boolean, default: true },
      distribution: { type: Boolean, default: true },
      privateUse: { type: Boolean, default: true },
      patentUse: Boolean,
      attributionRequired: Boolean,
      discloseSource: Boolean
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Package Health Metrics
  // ═══════════════════════════════════════════════════════════════════════════
  health: {
    score: { type: Number, min: 0, max: 100 },
    maintenance: { type: Number, min: 0, max: 100 },
    popularity: { type: Number, min: 0, max: 100 },
    quality: { type: Number, min: 0, max: 100 },
    downloads: {
      weekly: Number,
      monthly: Number
    },
    stars: Number,
    forks: Number,
    contributors: Number,
    lastCommit: Date,
    age: Number,
    deprecated: { type: Boolean, default: false },
    deprecationMessage: String
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Supply Chain Security
  // ═══════════════════════════════════════════════════════════════════════════
  supplyChain: {
    typosquattingRisk: { type: Boolean, default: false },
    maintainerCount: Number,
    organizationVerified: Boolean,
    signedPackage: Boolean,
    provenanceVerified: Boolean,
    sbomAvailable: Boolean,
    securityPolicy: Boolean,
    codeOwners: Boolean
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Remediation
  // ═══════════════════════════════════════════════════════════════════════════
  remediation: {
    status: {
      type: String,
      enum: ['pending', 'available', 'unavailable', 'applied', 'ignored'],
      default: 'pending'
    },
    suggestedAction: {
      type: String,
      enum: ['upgrade', 'downgrade', 'replace', 'remove', 'monitor', 'none']
    },
    targetVersion: String,
    alternativePackages: [{
      name: String,
      reason: String,
      ecosystem: String
    }],
    breakingChanges: Boolean,
    migrationGuide: String
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Location in Codebase
  // ═══════════════════════════════════════════════════════════════════════════
  manifestFile: String,
  usageLocations: [{
    file: String,
    line: Number,
    importStatement: String
  }],

  // ═══════════════════════════════════════════════════════════════════════════
  // Timestamps
  // ═══════════════════════════════════════════════════════════════════════════
  analyzedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ═══════════════════════════════════════════════════════════════════════════════
// Compound Indexes for Performance
// ═══════════════════════════════════════════════════════════════════════════════
dependencySchema.index({ codebaseId: 1, name: 1, version: 1 }, { unique: true });
dependencySchema.index({ codebaseId: 1, 'vulnerabilitySummary.total': -1 });
dependencySchema.index({ ecosystem: 1, name: 1 });
dependencySchema.index({ 'vulnerabilities.cveId': 1 });
dependencySchema.index({ 'license.spdxId': 1 });
dependencySchema.index({ 'health.deprecated': 1 });
dependencySchema.index({ 'remediation.status': 1 });
dependencySchema.index({ isDirect: 1, codebaseId: 1 });

module.exports = mongoose.model('Dependency', dependencySchema);
