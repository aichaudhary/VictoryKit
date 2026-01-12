/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎣 PHISHNETAI - CAMPAIGN MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 * Tracks identified phishing campaigns and patterns
 */

const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema(
  {
    // Campaign identification
    campaignId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'dormant', 'takedown_requested', 'taken_down', 'monitoring'],
      default: 'active',
    },

    // Target information
    target: {
      brand: String,
      industry: String,
      region: [String],
      type: {
        type: String,
        enum: [
          'credential_harvest',
          'malware',
          'bec',
          'tech_support',
          'romance',
          'investment',
          'other',
        ],
      },
    },

    // Attack vectors
    vectors: [
      {
        type: {
          type: String,
          enum: ['email', 'sms', 'social', 'search', 'ads', 'direct'],
        },
        description: String,
        sampleCount: Number,
      },
    ],

    // Associated domains
    domains: [
      {
        domain: String,
        firstSeen: Date,
        lastSeen: Date,
        active: Boolean,
        registrar: String,
        hostingProvider: String,
      },
    ],

    // Associated URLs
    urls: [
      {
        url: String,
        path: String,
        firstSeen: Date,
        lastSeen: Date,
        active: Boolean,
      },
    ],

    // Associated IPs
    ips: [
      {
        ip: String,
        asn: String,
        country: String,
        firstSeen: Date,
        lastSeen: Date,
      },
    ],

    // Email indicators
    emailIndicators: {
      subjects: [String],
      senderPatterns: [String],
      contentPatterns: [String],
      attachmentTypes: [String],
    },

    // Technical indicators (IOCs)
    iocs: {
      hashes: [
        {
          type: String,
          value: String,
          description: String,
        },
      ],
      emails: [String],
      phoneNumbers: [String],
      bitcoinAddresses: [String],
      userAgents: [String],
    },

    // Campaign statistics
    stats: {
      totalSamples: {
        type: Number,
        default: 0,
      },
      uniqueVictimsDomains: {
        type: Number,
        default: 0,
      },
      estimatedVictims: Number,
      peakActivity: Date,
    },

    // Timeline
    timeline: {
      firstSeen: Date,
      lastSeen: Date,
      peakStart: Date,
      peakEnd: Date,
      dormantSince: Date,
    },

    // Threat actor attribution
    attribution: {
      actorName: String,
      actorType: {
        type: String,
        enum: ['nation_state', 'cybercrime', 'hacktivist', 'insider', 'unknown'],
      },
      confidence: String,
      ttps: [String], // MITRE ATT&CK TTPs
      previousCampaigns: [String],
    },

    // Mitigation status
    mitigation: {
      takedownRequested: Boolean,
      takedownRequestDate: Date,
      takedownCompletedDate: Date,
      blockedInFeeds: Boolean,
      notifiedBrand: Boolean,
      notifiedLE: Boolean,
      notes: String,
    },

    // Related campaigns
    relatedCampaigns: [
      {
        campaignId: String,
        relationship: String,
        confidence: Number,
      },
    ],

    // Analysis history
    analyses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PhishNetAIAnalysis',
      },
    ],

    // Notes and comments
    notes: [
      {
        author: String,
        content: String,
        createdAt: Date,
      },
    ],

    // Severity assessment
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },

    // Auto-generated tags
    tags: [String],
  },
  {
    timestamps: true,
    collection: 'phishnetai_campaigns',
  }
);

// Indexes
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ 'target.brand': 1 });
CampaignSchema.index({ 'timeline.lastSeen': -1 });
CampaignSchema.index({ severity: 1 });
CampaignSchema.index({ tags: 1 });
CampaignSchema.index({ 'domains.domain': 1 });

// Virtual for campaign duration
CampaignSchema.virtual('durationDays').get(function () {
  if (!this.timeline?.firstSeen) return 0;
  const end = this.timeline.lastSeen || new Date();
  return Math.ceil((end - this.timeline.firstSeen) / (1000 * 60 * 60 * 24));
});

// Method to add domain to campaign
CampaignSchema.methods.addDomain = async function (domain, registrar, hosting) {
  const existing = this.domains.find((d) => d.domain === domain);

  if (existing) {
    existing.lastSeen = new Date();
    existing.active = true;
  } else {
    this.domains.push({
      domain,
      firstSeen: new Date(),
      lastSeen: new Date(),
      active: true,
      registrar,
      hostingProvider: hosting,
    });
  }

  return this.save();
};

// Method to add URL to campaign
CampaignSchema.methods.addUrl = async function (url) {
  const parsed = new URL(url);
  const existing = this.urls.find((u) => u.url === url);

  if (existing) {
    existing.lastSeen = new Date();
    existing.active = true;
  } else {
    this.urls.push({
      url,
      path: parsed.pathname,
      firstSeen: new Date(),
      lastSeen: new Date(),
      active: true,
    });
  }

  this.timeline.lastSeen = new Date();
  this.stats.totalSamples += 1;

  return this.save();
};

// Method to update status
CampaignSchema.methods.updateStatus = async function (newStatus, note) {
  this.status = newStatus;

  if (newStatus === 'dormant') {
    this.timeline.dormantSince = new Date();
  }

  if (note) {
    this.notes.push({
      author: 'system',
      content: `Status changed to ${newStatus}: ${note}`,
      createdAt: new Date(),
    });
  }

  return this.save();
};

// Static for active campaigns
CampaignSchema.statics.findActive = async function (limit = 50) {
  return this.find({ status: 'active' }).sort({ 'timeline.lastSeen': -1 }).limit(limit);
};

// Static for campaigns by brand
CampaignSchema.statics.findByBrand = async function (brand) {
  return this.find({
    'target.brand': { $regex: brand, $options: 'i' },
  }).sort({ 'timeline.lastSeen': -1 });
};

// Static for campaign statistics
CampaignSchema.statics.getStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSamples: { $sum: '$stats.totalSamples' },
      },
    },
  ]);
};

module.exports = mongoose.model('PhishNetAICampaign', CampaignSchema);
