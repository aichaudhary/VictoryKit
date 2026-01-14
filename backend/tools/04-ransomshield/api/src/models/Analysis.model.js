/**
 * RansomShield - Analysis Model
 * Stores analysis jobs and results
 */

const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    // Reference to sample
    sampleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sample',
      required: true,
      index: true,
    },

    // Analysis Type
    analysisType: {
      type: String,
      enum: ['static', 'dynamic', 'behavioral', 'comprehensive', 'quick_scan', 'yara', 'ml'],
      required: true,
      index: true,
    },

    // Status
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed', 'cancelled'],
      default: 'queued',
      index: true,
    },

    // Progress
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    currentStep: {
      type: String,
    },

    steps: [
      {
        name: String,
        status: {
          type: String,
          enum: ['pending', 'running', 'completed', 'warning', 'error'],
        },
        detail: String,
        progress: Number,
        startedAt: Date,
        completedAt: Date,
      },
    ],

    // Results
    result: {
      verdict: {
        type: String,
        enum: ['MALICIOUS', 'SUSPICIOUS', 'CLEAN', 'UNKNOWN'],
      },
      riskScore: Number,
      confidence: Number,
      malwareType: String,
      malwareFamily: String,
      threatLevel: String,
      detections: [
        {
          name: String,
          type: String,
          severity: String,
          file: String,
          action: String,
          details: mongoose.Schema.Types.Mixed,
        },
      ],
      summary: {
        malware: { type: Number, default: 0 },
        pup: { type: Number, default: 0 },
        suspicious: { type: Number, default: 0 },
        clean: { type: Number, default: 0 },
      },
      indicators: [
        {
          type: { type: String },
          value: String,
          severity: String,
          description: String,
        },
      ],
      recommendations: [String],
    },

    // AI Analysis
    aiAnalysis: {
      summary: String,
      technicalDetails: String,
      behaviorAnalysis: String,
      remediationSteps: [String],
    },

    // Scan Configuration
    config: {
      depth: {
        type: String,
        enum: ['quick', 'standard', 'deep'],
        default: 'standard',
      },
      enableHeuristics: { type: Boolean, default: true },
      enableBehavioral: { type: Boolean, default: true },
      enableSandbox: { type: Boolean, default: false },
      enableYara: { type: Boolean, default: true },
      autoQuarantine: { type: Boolean, default: false },
      timeout: { type: Number, default: 300 },
    },

    // Events Log
    events: [
      {
        timestamp: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ['scan', 'detection', 'analysis', 'warning', 'info', 'error'],
        },
        severity: {
          type: String,
          enum: ['info', 'low', 'medium', 'high', 'critical'],
        },
        message: String,
        file: String,
        details: mongoose.Schema.Types.Mixed,
      },
    ],

    // Performance Metrics
    metrics: {
      startedAt: Date,
      completedAt: Date,
      duration: Number, // in milliseconds
      filesScanned: { type: Number, default: 0 },
      threatsFound: { type: Number, default: 0 },
      bytesProcessed: { type: Number, default: 0 },
    },

    // Error Information
    error: {
      code: String,
      message: String,
      stack: String,
      occurredAt: Date,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal',
      index: true,
    },

    tags: [String],

    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
analysisSchema.index({ createdAt: -1 });
analysisSchema.index({ status: 1, createdAt: -1 });
analysisSchema.index({ sampleId: 1, analysisType: 1 });

// Virtual for duration in seconds
analysisSchema.virtual('durationSeconds').get(function () {
  if (this.metrics && this.metrics.duration) {
    return (this.metrics.duration / 1000).toFixed(2);
  }
  return null;
});

// Pre-save to calculate duration
analysisSchema.pre('save', function (next) {
  if (this.status === 'completed' && this.metrics.startedAt && this.metrics.completedAt) {
    this.metrics.duration = this.metrics.completedAt - this.metrics.startedAt;
  }
  next();
});

// Static method to get pending analyses
analysisSchema.statics.getPending = function (limit = 10) {
  return this.find({ status: 'queued' })
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit)
    .populate('sampleId');
};

// Instance method to add event
analysisSchema.methods.addEvent = function (event) {
  this.events.push({
    timestamp: new Date(),
    ...event,
  });
  return this.save();
};

// Instance method to update step
analysisSchema.methods.updateStep = function (stepName, status, detail, progress) {
  const step = this.steps.find((s) => s.name === stepName);
  if (step) {
    step.status = status;
    step.detail = detail;
    step.progress = progress;
    if (status === 'completed') step.completedAt = new Date();
  }
  return this.save();
};

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
