const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom', 'incident'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  timeRange: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  summary: {
    totalTransactions: Number,
    fraudulentTransactions: Number,
    fraudRate: Number,
    totalAmount: Number,
    fraudulentAmount: Number,
    blockedAmount: Number,
    falsePositives: Number,
    falseNegatives: Number,
    accuracy: Number
  },
  metrics: {
    avgFraudScore: Number,
    avgProcessingTime: Number,
    peakTransactionTime: String,
    mostFlaggedMerchant: String,
    riskiestLocation: String,
    topFraudPatterns: [String]
  },
  charts: [{
    type: {
      type: String,
      enum: ['line', 'bar', 'pie', 'area', 'scatter']
    },
    title: String,
    data: mongoose.Schema.Types.Mixed
  }],
  recommendations: [{
    category: String,
    recommendation: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    estimatedImpact: String
  }],
  format: {
    type: String,
    enum: ['pdf', 'html', 'json', 'csv'],
    default: 'pdf'
  },
  fileUrl: String,
  fileSize: Number,
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  generatedAt: Date,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ 'timeRange.start': 1, 'timeRange.end': 1 });

module.exports = mongoose.model('Report', reportSchema);
