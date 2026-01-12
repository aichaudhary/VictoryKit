/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎣 PHISHNETAI - ANALYSIS MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 * Stores phishing analysis results including URL, email, and domain analysis
 */

const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema(
  {
    // Analysis identification
    analysisId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Analysis type
    type: {
      type: String,
      enum: ['url', 'email', 'domain', 'bulk'],
      required: true,
    },

    // Input data
    input: {
      url: String,
      email: String,
      domain: String,
      headers: Object,
      rawContent: String,
    },

    // Verdict and scoring
    verdict: {
      type: String,
      enum: ['SAFE', 'SUSPICIOUS', 'PHISHING', 'MALICIOUS', 'SPAM'],
      required: true,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // URL Analysis Results
    urlAnalysis: {
      parsed: {
        protocol: String,
        hostname: String,
        path: String,
        query: String,
        subdomain: String,
        tld: String,
      },
      redirectChain: [
        {
          url: String,
          statusCode: Number,
          finalDestination: Boolean,
        },
      ],
      shortenerDetected: Boolean,
      suspiciousPatterns: [
        {
          pattern: String,
          description: String,
          severity: String,
        },
      ],
    },

    // Domain Intelligence
    domainIntel: {
      age: Number,
      ageCategory: {
        type: String,
        enum: ['new', 'recent', 'established', 'veteran'],
      },
      registrar: String,
      registrantCountry: String,
      createdDate: Date,
      updatedDate: Date,
      expiresDate: Date,
      nameservers: [String],
      dnssec: Boolean,
    },

    // SSL/TLS Analysis
    sslAnalysis: {
      valid: Boolean,
      issuer: String,
      subject: String,
      validFrom: Date,
      validTo: Date,
      daysUntilExpiry: Number,
      protocol: String,
      grade: String,
      selfSigned: Boolean,
      expired: Boolean,
      wildcardCert: Boolean,
    },

    // Email Authentication (for email analysis)
    emailAuth: {
      spf: {
        valid: Boolean,
        status: String,
        record: String,
      },
      dkim: {
        valid: Boolean,
        status: String,
        selector: String,
      },
      dmarc: {
        valid: Boolean,
        policy: String,
        record: String,
      },
      arc: {
        valid: Boolean,
        status: String,
      },
    },

    // Sender Analysis
    senderAnalysis: {
      email: String,
      displayName: String,
      domain: String,
      replyTo: String,
      returnPath: String,
      spoofed: Boolean,
      impersonation: {
        detected: Boolean,
        targetBrand: String,
        confidence: Number,
      },
      reputation: {
        type: String,
        enum: ['trusted', 'neutral', 'suspicious', 'malicious'],
      },
    },

    // Content Analysis
    contentAnalysis: {
      language: String,
      urgencyScore: Number,
      threatIndicators: [
        {
          type: String,
          text: String,
          severity: String,
        },
      ],
      suspiciousKeywords: [String],
      socialEngineering: {
        detected: Boolean,
        tactics: [String],
      },
      brandMentions: [String],
      attachments: [
        {
          filename: String,
          mimeType: String,
          size: Number,
          hash: String,
          malicious: Boolean,
        },
      ],
    },

    // Homograph Detection
    homographAnalysis: {
      detected: Boolean,
      originalDomain: String,
      normalizedDomain: String,
      confusables: [
        {
          original: String,
          lookalike: String,
          unicodePoint: String,
        },
      ],
      targetBrand: String,
    },

    // Link Analysis (for emails)
    linkAnalysis: {
      totalLinks: Number,
      uniqueDomains: Number,
      maliciousLinks: Number,
      suspiciousLinks: Number,
      links: [
        {
          url: String,
          displayText: String,
          verdict: String,
          riskScore: Number,
          mismatch: Boolean,
        },
      ],
    },

    // Threat Intelligence Results
    threatIntel: [
      {
        provider: {
          type: String,
          required: true,
        },
        available: Boolean,
        queried: Boolean,
        result: {
          isMalicious: Boolean,
          isPhishing: Boolean,
          riskScore: Number,
          categories: [String],
          firstSeen: Date,
          lastSeen: Date,
        },
        rawResponse: Object,
        error: String,
        queryTime: Number,
      },
    ],

    // AI Analysis
    aiAnalysis: {
      model: String,
      phishingProbability: Number,
      spamProbability: Number,
      legitimateProbability: Number,
      reasoning: String,
      features: Object,
      embeddings: [Number],
    },

    // Visual Similarity (if screenshot taken)
    visualSimilarity: {
      screenshotUrl: String,
      brandMatches: [
        {
          brand: String,
          similarity: Number,
          logoDetected: Boolean,
        },
      ],
      loginFormDetected: Boolean,
      captchaDetected: Boolean,
    },

    // Indicators of Compromise
    indicators: [
      {
        type: {
          type: String,
          enum: ['critical', 'high', 'medium', 'low', 'info'],
        },
        category: String,
        description: String,
        evidence: String,
        mitreTactic: String,
      },
    ],

    // Recommendations
    recommendations: [
      {
        action: String,
        priority: {
          type: String,
          enum: ['critical', 'high', 'medium', 'low'],
        },
        description: String,
      },
    ],

    // Performance metrics
    analysisMetrics: {
      startTime: Date,
      endTime: Date,
      totalDuration: Number,
      stepsCompleted: Number,
      totalSteps: Number,
      apiCalls: Number,
    },

    // User and session info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    sessionId: String,
    ipAddress: String,
    userAgent: String,

    // Reporting
    reported: {
      type: Boolean,
      default: false,
    },

    reportedTo: [
      {
        authority: String,
        reportId: String,
        reportedAt: Date,
      },
    ],

    // Feedback for ML improvement
    userFeedback: {
      correct: Boolean,
      actualVerdict: String,
      comments: String,
      feedbackAt: Date,
    },
  },
  {
    timestamps: true,
    collection: 'phishnetai_analyses',
  }
);

// Indexes
AnalysisSchema.index({ 'input.url': 1 });
AnalysisSchema.index({ 'input.domain': 1 });
AnalysisSchema.index({ verdict: 1 });
AnalysisSchema.index({ riskScore: -1 });
AnalysisSchema.index({ createdAt: -1 });
AnalysisSchema.index({ 'domainIntel.age': 1 });

// Virtual for formatted duration
AnalysisSchema.virtual('formattedDuration').get(function () {
  if (!this.analysisMetrics?.totalDuration) return 'N/A';
  return `${this.analysisMetrics.totalDuration}ms`;
});

// Method to add indicator
AnalysisSchema.methods.addIndicator = function (indicator) {
  this.indicators.push(indicator);
  return this.save();
};

// Method to calculate threat score
AnalysisSchema.methods.calculateThreatScore = function () {
  const weights = { critical: 30, high: 20, medium: 10, low: 5, info: 1 };
  let score = 0;

  this.indicators.forEach((ind) => {
    score += weights[ind.type] || 0;
  });

  return Math.min(100, score);
};

// Static to find similar analyses
AnalysisSchema.statics.findSimilar = async function (domain, limit = 10) {
  return this.find({
    'input.domain': domain,
    verdict: { $in: ['PHISHING', 'MALICIOUS'] },
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static for statistics
AnalysisSchema.statics.getStats = async function (timeRange = 24) {
  const since = new Date(Date.now() - timeRange * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        phishing: { $sum: { $cond: [{ $eq: ['$verdict', 'PHISHING'] }, 1, 0] } },
        malicious: { $sum: { $cond: [{ $eq: ['$verdict', 'MALICIOUS'] }, 1, 0] } },
        suspicious: { $sum: { $cond: [{ $eq: ['$verdict', 'SUSPICIOUS'] }, 1, 0] } },
        safe: { $sum: { $cond: [{ $eq: ['$verdict', 'SAFE'] }, 1, 0] } },
        avgRiskScore: { $avg: '$riskScore' },
        avgDuration: { $avg: '$analysisMetrics.totalDuration' },
      },
    },
  ]);
};

module.exports = mongoose.model('PhishNetAIAnalysis', AnalysisSchema);
