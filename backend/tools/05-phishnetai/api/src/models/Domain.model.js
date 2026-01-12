/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎣 PHISHNETAI - DOMAIN MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 * Stores domain intelligence data including reputation, WHOIS, and history
 */

const mongoose = require('mongoose');

const DomainSchema = new mongoose.Schema(
  {
    // Domain identification
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Domain parts
    tld: String,
    sld: String, // Second level domain
    subdomain: String,

    // WHOIS Information
    whois: {
      registrar: String,
      registrantName: String,
      registrantOrg: String,
      registrantCountry: String,
      registrantEmail: String,
      adminContact: String,
      techContact: String,
      createdDate: Date,
      updatedDate: Date,
      expiresDate: Date,
      status: [String],
      nameservers: [String],
      dnssec: Boolean,
      rawWhois: String,
    },

    // Calculated age
    age: {
      days: Number,
      category: {
        type: String,
        enum: ['brand_new', 'new', 'recent', 'established', 'veteran', 'unknown'],
      },
    },

    // DNS Records
    dns: {
      a: [String],
      aaaa: [String],
      mx: [
        {
          priority: Number,
          exchange: String,
        },
      ],
      ns: [String],
      txt: [String],
      cname: String,
      soa: Object,
      ptr: [String],
      spf: String,
      dmarc: String,
      dkim: Object,
    },

    // IP Information
    ipInfo: {
      ip: String,
      asn: String,
      asnOrg: String,
      isp: String,
      country: String,
      region: String,
      city: String,
      latitude: Number,
      longitude: Number,
      isHosting: Boolean,
      isProxy: Boolean,
      isVpn: Boolean,
      isTor: Boolean,
    },

    // SSL Certificate
    ssl: {
      valid: Boolean,
      issuer: String,
      issuerOrg: String,
      subject: String,
      validFrom: Date,
      validTo: Date,
      daysUntilExpiry: Number,
      protocol: String,
      cipher: String,
      keySize: Number,
      selfSigned: Boolean,
      expired: Boolean,
      wildcardCert: Boolean,
      grade: String,
      chain: [
        {
          subject: String,
          issuer: String,
          validFrom: Date,
          validTo: Date,
        },
      ],
    },

    // Reputation scoring
    reputation: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      category: {
        type: String,
        enum: ['trusted', 'neutral', 'suspicious', 'malicious', 'unknown'],
        default: 'unknown',
      },
      lastUpdated: Date,
    },

    // Threat intelligence from various sources
    threatIntel: {
      virustotal: {
        malicious: Number,
        suspicious: Number,
        clean: Number,
        unrated: Number,
        lastAnalysis: Date,
        categories: [String],
      },
      googleSafeBrowsing: {
        listed: Boolean,
        threats: [String],
        lastCheck: Date,
      },
      phishtank: {
        listed: Boolean,
        phishId: String,
        verifiedAt: Date,
      },
      openphish: {
        listed: Boolean,
        lastSeen: Date,
      },
      urlhaus: {
        listed: Boolean,
        tags: [String],
        lastSeen: Date,
      },
    },

    // Brand impersonation detection
    brandProtection: {
      impersonates: Boolean,
      targetBrand: String,
      similarityScore: Number,
      homograph: Boolean,
      typosquat: Boolean,
      combosquat: Boolean,
    },

    // Historical data
    history: {
      firstSeen: Date,
      lastSeen: Date,
      totalScans: {
        type: Number,
        default: 0,
      },
      phishingDetections: {
        type: Number,
        default: 0,
      },
      verdictHistory: [
        {
          verdict: String,
          date: Date,
          riskScore: Number,
        },
      ],
    },

    // Categories
    categories: [
      {
        source: String,
        category: String,
        confidence: Number,
      },
    ],

    // Technology stack detection
    technologies: [
      {
        name: String,
        version: String,
        category: String,
      },
    ],

    // Related domains
    relatedDomains: [
      {
        domain: String,
        relationship: String,
        confidence: Number,
      },
    ],

    // Cached data expiry
    cacheExpiry: {
      whois: Date,
      dns: Date,
      ssl: Date,
      threatIntel: Date,
    },

    // Flags
    flags: {
      isParked: Boolean,
      isSinkholed: Boolean,
      isPrivacyProtected: Boolean,
      hasMalware: Boolean,
      hasPhishing: Boolean,
      isCompromised: Boolean,
    },
  },
  {
    timestamps: true,
    collection: 'phishnetai_domains',
  }
);

// Indexes
DomainSchema.index({ 'reputation.score': 1 });
DomainSchema.index({ 'reputation.category': 1 });
DomainSchema.index({ 'age.days': 1 });
DomainSchema.index({ 'history.lastSeen': -1 });
DomainSchema.index({ 'flags.hasPhishing': 1 });
DomainSchema.index({ tld: 1 });

// Virtual for domain age in human readable format
DomainSchema.virtual('ageFormatted').get(function () {
  if (!this.age?.days) return 'Unknown';
  const days = this.age.days;
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
});

// Method to update reputation
DomainSchema.methods.updateReputation = async function (newScore) {
  this.reputation.score = newScore;

  if (newScore >= 80) this.reputation.category = 'trusted';
  else if (newScore >= 50) this.reputation.category = 'neutral';
  else if (newScore >= 30) this.reputation.category = 'suspicious';
  else this.reputation.category = 'malicious';

  this.reputation.lastUpdated = new Date();
  return this.save();
};

// Method to check if cache is expired
DomainSchema.methods.isCacheExpired = function (type) {
  const expiry = this.cacheExpiry?.[type];
  if (!expiry) return true;
  return new Date() > expiry;
};

// Method to record scan
DomainSchema.methods.recordScan = async function (verdict, riskScore) {
  this.history.totalScans += 1;
  this.history.lastSeen = new Date();

  if (verdict === 'PHISHING' || verdict === 'MALICIOUS') {
    this.history.phishingDetections += 1;
  }

  this.history.verdictHistory.push({
    verdict,
    date: new Date(),
    riskScore,
  });

  // Keep only last 100 verdict entries
  if (this.history.verdictHistory.length > 100) {
    this.history.verdictHistory = this.history.verdictHistory.slice(-100);
  }

  return this.save();
};

// Static for finding malicious domains
DomainSchema.statics.findMalicious = async function (limit = 100) {
  return this.find({
    $or: [
      { 'reputation.category': 'malicious' },
      { 'flags.hasPhishing': true },
      { 'flags.hasMalware': true },
    ],
  })
    .sort({ 'history.lastSeen': -1 })
    .limit(limit);
};

// Static for finding new suspicious domains
DomainSchema.statics.findNewSuspicious = async function (maxAgeDays = 30, limit = 100) {
  return this.find({
    'age.days': { $lte: maxAgeDays },
    'reputation.category': { $in: ['suspicious', 'malicious'] },
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('PhishNetAIDomain', DomainSchema);
