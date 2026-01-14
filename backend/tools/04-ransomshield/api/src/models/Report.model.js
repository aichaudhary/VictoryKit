/**
 * RansomShield - Report Model
 * Stores generated reports
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    // Report Identification
    reportId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    // Report Type
    reportType: {
      type: String,
      enum: [
        'daily',
        'weekly',
        'monthly',
        'incident',
        'forensic',
        'executive',
        'compliance',
        'custom',
      ],
      required: true,
      index: true,
    },

    // Format
    format: {
      type: String,
      enum: ['pdf', 'html', 'json', 'csv'],
      default: 'pdf',
    },

    // Status
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
      index: true,
    },

    // Time Range
    timeRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },

    // Report Content
    content: {
      // Summary Statistics
      summary: {
        totalSamples: { type: Number, default: 0 },
        maliciousSamples: { type: Number, default: 0 },
        suspiciousSamples: { type: Number, default: 0 },
        cleanSamples: { type: Number, default: 0 },
        totalThreats: { type: Number, default: 0 },
        criticalThreats: { type: Number, default: 0 },
        highThreats: { type: Number, default: 0 },
        mediumThreats: { type: Number, default: 0 },
        lowThreats: { type: Number, default: 0 },
        avgRiskScore: { type: Number, default: 0 },
      },

      // Threat Breakdown
      threatBreakdown: {
        byType: [
          {
            type: { type: String },
            count: Number,
            percentage: Number,
          },
        ],
        byFamily: [
          {
            family: String,
            count: Number,
            percentage: Number,
          },
        ],
        bySeverity: [
          {
            severity: String,
            count: Number,
            percentage: Number,
          },
        ],
      },

      // Top Threats
      topThreats: [
        {
          sampleId: mongoose.Schema.Types.ObjectId,
          fileName: String,
          malwareType: String,
          malwareFamily: String,
          riskScore: Number,
          detectedAt: Date,
        },
      ],

      // Trend Data
      trends: {
        daily: [
          {
            date: Date,
            samples: Number,
            threats: Number,
            avgRiskScore: Number,
          },
        ],
        weekly: [
          {
            week: String,
            samples: Number,
            threats: Number,
            avgRiskScore: Number,
          },
        ],
      },

      // IOC Summary
      indicators: {
        maliciousUrls: [String],
        maliciousIps: [String],
        maliciousHashes: [String],
        c2Servers: [String],
      },

      // Recommendations
      recommendations: [String],

      // Executive Summary (AI Generated)
      executiveSummary: String,

      // Detailed Findings
      detailedFindings: String,
    },

    // File Storage
    filePath: String,
    fileSize: Number,

    // Metadata
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    // Sharing
    sharedWith: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        sharedAt: Date,
        accessLevel: {
          type: String,
          enum: ['view', 'download'],
          default: 'view',
        },
      },
    ],

    // Scheduling
    scheduled: {
      type: Boolean,
      default: false,
    },

    scheduleConfig: {
      frequency: String, // 'daily', 'weekly', 'monthly'
      dayOfWeek: Number,
      dayOfMonth: Number,
      time: String,
      recipients: [String],
    },

    // Error handling
    error: {
      message: String,
      occurredAt: Date,
    },

    expiresAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reportSchema.index({ createdAt: -1 });
reportSchema.index({ reportType: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1, reportType: 1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save to generate reportId
reportSchema.pre('save', function (next) {
  if (!this.reportId) {
    this.reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Static method to get recent reports
reportSchema.statics.getRecent = function (userId, limit = 10) {
  return this.find({ generatedBy: userId, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
