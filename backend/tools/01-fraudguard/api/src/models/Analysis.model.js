const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    index: true
  },
  analysisType: {
    type: String,
    enum: ['real-time', 'batch', 'historical', 'pattern'],
    required: true
  },
  timeRange: {
    start: Date,
    end: Date
  },
  totalTransactions: {
    type: Number,
    default: 0
  },
  fraudulentCount: {
    type: Number,
    default: 0
  },
  fraudRate: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  fraudulentAmount: {
    type: Number,
    default: 0
  },
  patterns: [{
    type: {
      type: String,
      enum: ['velocity', 'location', 'amount', 'merchant', 'time', 'device']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    occurrences: Number,
    examples: [mongoose.Schema.Types.ObjectId]
  }],
  riskDistribution: {
    low: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    critical: { type: Number, default: 0 }
  },
  insights: [{
    category: String,
    finding: String,
    recommendation: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  completedAt: Date,
  processingTime: Number, // milliseconds
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ status: 1 });
analysisSchema.index({ analysisType: 1 });

module.exports = mongoose.model('Analysis', analysisSchema);
