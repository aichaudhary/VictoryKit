const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  reward_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  submission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
    index: true
  },
  researcher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Researcher',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'BTC', 'ETH']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'processing', 'paid', 'rejected', 'on_hold'],
    default: 'pending',
    index: true
  },
  payment_method: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe', 'crypto', 'wire_transfer', 'other'],
    default: 'paypal'
  },
  payment_details: {
    transaction_id: String,
    receipt_url: String,
    payment_date: Date,
    processor: String,
    notes: String
  },
  calculation_details: {
    base_amount: Number,
    severity_multiplier: Number,
    quality_bonus: Number,
    speed_bonus: Number,
    deductions: Number,
    final_amount: Number,
    calculation_method: String
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approved_at: {
    type: Date,
    default: null
  },
  rejected_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejected_at: {
    type: Date,
    default: null
  },
  rejection_reason: {
    type: String,
    default: ''
  },
  paid_at: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  invoice_url: {
    type: String,
    default: ''
  },
  tax_info: {
    tax_id: String,
    tax_rate: Number,
    tax_amount: Number,
    net_amount: Number
  },
  timeline: [{
    status: String,
    user_id: mongoose.Schema.Types.ObjectId,
    user_name: String,
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'rewards'
});

// Indexes for performance
rewardSchema.index({ status: 1, created_at: -1 });
rewardSchema.index({ researcher_id: 1, status: 1 });
rewardSchema.index({ paid_at: -1 });

// Virtual for days pending
rewardSchema.virtual('days_pending').get(function() {
  if (this.status === 'paid') return 0;
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to approve reward
rewardSchema.methods.approve = function(userId, userName) {
  this.status = 'approved';
  this.approved_by = userId;
  this.approved_at = new Date();
  
  this.timeline.push({
    status: 'approved',
    user_id: userId,
    user_name: userName,
    notes: 'Reward approved',
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to reject reward
rewardSchema.methods.reject = function(userId, userName, reason) {
  this.status = 'rejected';
  this.rejected_by = userId;
  this.rejected_at = new Date();
  this.rejection_reason = reason;
  
  this.timeline.push({
    status: 'rejected',
    user_id: userId,
    user_name: userName,
    notes: reason,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to mark as paid
rewardSchema.methods.markAsPaid = function(transactionId, paymentDate) {
  this.status = 'paid';
  this.paid_at = paymentDate || new Date();
  this.payment_details.transaction_id = transactionId;
  this.payment_details.payment_date = this.paid_at;
  
  this.timeline.push({
    status: 'paid',
    notes: `Payment processed: ${transactionId}`,
    timestamp: new Date()
  });
  
  return this.save();
};

// Static method to calculate reward amount
rewardSchema.statics.calculateAmount = function(submission, program) {
  const severity = submission.severity;
  const qualityScore = submission.quality_score || 50;
  const cvssScore = submission.cvss_score || 0;
  
  // Get base amount from program settings
  let baseAmount = 0;
  if (program && program.reward_ranges && program.reward_ranges[severity]) {
    const range = program.reward_ranges[severity];
    baseAmount = (range.min + range.max) / 2;
  } else {
    // Default ranges if no program
    const defaultRanges = {
      critical: 5000,
      high: 2000,
      medium: 500,
      low: 100,
      informational: 0
    };
    baseAmount = defaultRanges[severity] || 0;
  }
  
  // Quality bonus (0-20% of base)
  const qualityBonus = baseAmount * (qualityScore / 100) * 0.20;
  
  // CVSS adjustment (can increase up to 30%)
  const cvssBonus = baseAmount * (cvssScore / 10) * 0.30;
  
  // Speed bonus (submitted quickly after discovered)
  const speedBonus = 0; // Would need more info
  
  const finalAmount = baseAmount + qualityBonus + cvssBonus + speedBonus;
  
  return {
    base_amount: baseAmount,
    quality_bonus: qualityBonus,
    cvss_bonus: cvssBonus,
    speed_bonus: speedBonus,
    final_amount: Math.round(finalAmount),
    calculation_method: 'AI-assisted automated calculation'
  };
};

// Static method to get stats
rewardSchema.statics.getStats = async function(query = {}) {
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total_rewards: { $sum: 1 },
        total_amount: { $sum: '$amount' },
        avg_amount: { $avg: '$amount' },
        pending_count: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        pending_amount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        },
        paid_count: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        paid_amount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total_rewards: 0,
    total_amount: 0,
    avg_amount: 0,
    pending_count: 0,
    pending_amount: 0,
    paid_count: 0,
    paid_amount: 0
  };
};

module.exports = mongoose.model('Reward', rewardSchema);
