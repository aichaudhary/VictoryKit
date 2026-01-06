const mongoose = require('mongoose');

const researcherSchema = new mongoose.Schema({
  researcher_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  bio: {
    type: String,
    maxLength: 500,
    default: ''
  },
  avatar_url: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  twitter: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  reputation_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
    index: true
  },
  rank: {
    type: String,
    enum: ['rookie', 'bronze', 'silver', 'gold', 'platinum', 'legend'],
    default: 'rookie',
    index: true
  },
  total_submissions: {
    type: Number,
    min: 0,
    default: 0
  },
  accepted_submissions: {
    type: Number,
    min: 0,
    default: 0
  },
  rejected_submissions: {
    type: Number,
    min: 0,
    default: 0
  },
  duplicate_submissions: {
    type: Number,
    min: 0,
    default: 0
  },
  total_earned: {
    type: Number,
    min: 0,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  specializations: [{
    type: String,
    trim: true
  }],
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert']
    }
  }],
  joined_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  last_active: {
    type: Date,
    default: Date.now
  },
  last_submission: {
    type: Date,
    default: null
  },
  verified: {
    type: Boolean,
    default: false
  },
  verified_at: {
    type: Date,
    default: null
  },
  kyc_completed: {
    type: Boolean,
    default: false
  },
  payment_info: {
    method: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'crypto', 'other'],
      default: 'paypal'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  statistics: {
    critical_vulns: {
      type: Number,
      default: 0
    },
    high_vulns: {
      type: Number,
      default: 0
    },
    medium_vulns: {
      type: Number,
      default: 0
    },
    low_vulns: {
      type: Number,
      default: 0
    },
    info_vulns: {
      type: Number,
      default: 0
    },
    duplicates: {
      type: Number,
      default: 0
    },
    false_positives: {
      type: Number,
      default: 0
    },
    avg_quality_score: {
      type: Number,
      default: 0
    },
    avg_response_time: {
      type: Number,
      default: 0
    },
    avg_triage_time: {
      type: Number,
      default: 0
    },
    highest_reward: {
      type: Number,
      default: 0
    },
    total_rewards_count: {
      type: Number,
      default: 0
    }
  },
  achievements: [{
    name: String,
    description: String,
    icon: String,
    earned_at: Date
  }],
  badges: [{
    name: String,
    description: String,
    icon: String,
    color: String
  }],
  preferences: {
    email_notifications: {
      type: Boolean,
      default: true
    },
    submission_updates: {
      type: Boolean,
      default: true
    },
    reward_notifications: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'banned'],
    default: 'active',
    index: true
  },
  suspension_reason: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'researchers'
});

// Indexes for performance
researcherSchema.index({ reputation_score: -1 });
researcherSchema.index({ total_earned: -1 });
researcherSchema.index({ 'statistics.critical_vulns': -1 });
researcherSchema.index({ rank: 1, reputation_score: -1 });

// Virtual for acceptance rate
researcherSchema.virtual('acceptance_rate').get(function() {
  if (this.total_submissions === 0) return 0;
  return ((this.accepted_submissions / this.total_submissions) * 100).toFixed(2);
});

// Virtual for days since joined
researcherSchema.virtual('days_member').get(function() {
  return Math.floor((Date.now() - this.joined_at) / (1000 * 60 * 60 * 24));
});

// Method to calculate rank
researcherSchema.methods.calculateRank = function() {
  const score = this.reputation_score;
  const earnings = this.total_earned;
  
  if (score >= 90 && earnings >= 50000) return 'legend';
  if (score >= 80 && earnings >= 25000) return 'platinum';
  if (score >= 70 && earnings >= 10000) return 'gold';
  if (score >= 60 && earnings >= 5000) return 'silver';
  if (score >= 50 && earnings >= 1000) return 'bronze';
  return 'rookie';
};

// Method to update reputation score
researcherSchema.methods.updateReputation = function() {
  let score = 50; // Base score
  
  // Acceptance rate factor (0-30 points)
  const acceptanceRate = this.total_submissions > 0 
    ? this.accepted_submissions / this.total_submissions 
    : 0;
  score += acceptanceRate * 30;
  
  // Quality factor (0-20 points)
  score += (this.statistics.avg_quality_score / 100) * 20;
  
  // Volume factor (0-15 points)
  const volumeScore = Math.min(this.accepted_submissions / 100, 1) * 15;
  score += volumeScore;
  
  // Severity factor (0-15 points)
  const severityScore = (
    this.statistics.critical_vulns * 4 +
    this.statistics.high_vulns * 2 +
    this.statistics.medium_vulns * 1
  ) / Math.max(this.accepted_submissions, 1);
  score += Math.min(severityScore, 15);
  
  // Penalty for duplicates/false positives (-20 points max)
  const penaltyRate = this.total_submissions > 0
    ? (this.duplicates + this.false_positives) / this.total_submissions
    : 0;
  score -= penaltyRate * 20;
  
  this.reputation_score = Math.max(0, Math.min(100, score));
  this.rank = this.calculateRank();
};

// Static method to get leaderboard
researcherSchema.statics.getLeaderboard = async function(limit = 100, timeframe = 'all') {
  const query = { status: 'active' };
  
  // Add timeframe filter if needed
  if (timeframe !== 'all') {
    const date = new Date();
    if (timeframe === '7d') date.setDate(date.getDate() - 7);
    else if (timeframe === '30d') date.setDate(date.getDate() - 30);
    else if (timeframe === '90d') date.setDate(date.getDate() - 90);
    query.last_submission = { $gte: date };
  }
  
  return this.find(query)
    .sort({ reputation_score: -1, total_earned: -1 })
    .limit(limit)
    .select('-payment_info -notes')
    .lean();
};

// Static method to get stats
researcherSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        total_researchers: { $sum: 1 },
        total_earnings_paid: { $sum: '$total_earned' },
        avg_reputation: { $avg: '$reputation_score' },
        total_submissions: { $sum: '$total_submissions' },
        by_rank: {
          $push: {
            rank: '$rank',
            count: 1
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total_researchers: 0,
    total_earnings_paid: 0,
    avg_reputation: 0,
    total_submissions: 0
  };
};

module.exports = mongoose.model('Researcher', researcherSchema);
