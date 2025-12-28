const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  merchantInfo: {
    name: String,
    category: String,
    location: String,
    mcc: String // Merchant Category Code
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'crypto', 'digital_wallet', 'other'],
    required: true
  },
  cardInfo: {
    last4: String,
    brand: String,
    country: String
  },
  ipAddress: String,
  deviceFingerprint: String,
  geolocation: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  fraudScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },
  isFraudulent: {
    type: Boolean,
    default: false,
    index: true
  },
  mlPrediction: {
    score: Number,
    confidence: Number,
    model: String,
    version: String,
    timestamp: Date,
    features: Map
  },
  ruleFlags: [{
    rule: String,
    reason: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    timestamp: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'reviewing', 'disputed'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ fraudScore: -1 });
transactionSchema.index({ riskLevel: 1, status: 1 });
transactionSchema.index({ 'merchantInfo.name': 1 });
transactionSchema.index({ ipAddress: 1 });

// Virtual for high risk detection
transactionSchema.virtual('isHighRisk').get(function() {
  return this.fraudScore >= 70 || this.riskLevel === 'high' || this.riskLevel === 'critical';
});

// Virtual for needs review
transactionSchema.virtual('needsReview').get(function() {
  return this.fraudScore >= 50 && this.status === 'pending';
});

module.exports = mongoose.model('Transaction', transactionSchema);
