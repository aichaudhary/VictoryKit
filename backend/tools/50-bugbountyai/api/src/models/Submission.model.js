const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  submission_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true
  },
  vulnerability_type: {
    type: String,
    required: true,
    enum: [
      'XSS', 'SQLi', 'CSRF', 'RCE', 'SSRF', 'XXE', 'IDOR', 
      'Authentication', 'Authorization', 'Information Disclosure',
      'Business Logic', 'Injection', 'Broken Access Control',
      'Security Misconfiguration', 'Other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low', 'informational'],
    default: 'medium'
  },
  cvss_score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  cvss_vector: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'triaged', 'accepted', 'rejected', 'duplicate', 'fixed', 'disclosed', 'closed'],
    default: 'new',
    index: true
  },
  researcher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Researcher',
    required: true,
    index: true
  },
  researcher_email: {
    type: String,
    required: true
  },
  assets_affected: [{
    type: String,
    trim: true
  }],
  proof_of_concept: {
    type: String,
    required: true
  },
  steps_to_reproduce: {
    type: String,
    default: ''
  },
  impact: {
    type: String,
    default: ''
  },
  mitigation: {
    type: String,
    default: ''
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploaded_at: Date
  }],
  duplicate_of: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    default: null
  },
  similarity_score: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  quality_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  reward_amount: {
    type: Number,
    min: 0,
    default: 0
  },
  reward_status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'rejected', 'not_eligible'],
    default: 'pending'
  },
  submitted_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  triaged_at: {
    type: Date,
    default: null
  },
  triaged_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolved_at: {
    type: Date,
    default: null
  },
  disclosed_at: {
    type: Date,
    default: null
  },
  sla_deadline: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  program_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    default: null
  },
  ai_analysis: {
    validity_score: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    severity_confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    classification: {
      type: String,
      default: ''
    },
    recommendations: [{
      type: String
    }],
    analyzed_at: {
      type: Date,
      default: null
    }
  },
  comments: [{
    user_id: mongoose.Schema.Types.ObjectId,
    user_name: String,
    comment: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  timeline: [{
    action: String,
    user_id: mongoose.Schema.Types.ObjectId,
    user_name: String,
    details: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'submissions'
});

// Indexes for performance
submissionSchema.index({ researcher_id: 1, submitted_at: -1 });
submissionSchema.index({ status: 1, severity: -1 });
submissionSchema.index({ vulnerability_type: 1 });
submissionSchema.index({ 'ai_analysis.validity_score': -1 });

// Virtual for days since submission
submissionSchema.virtual('days_open').get(function() {
  if (this.status === 'closed' || this.status === 'disclosed') {
    return 0;
  }
  return Math.floor((Date.now() - this.submitted_at) / (1000 * 60 * 60 * 24));
});

// Method to check if SLA is breached
submissionSchema.methods.isSLABreached = function() {
  if (!this.sla_deadline) return false;
  return Date.now() > this.sla_deadline;
};

// Static method to get stats
submissionSchema.statics.getStats = async function(query = {}) {
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        critical: {
          $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
        },
        high: {
          $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
        },
        medium: {
          $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] }
        },
        low: {
          $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] }
        },
        avgCVSS: { $avg: '$cvss_score' },
        avgQualityScore: { $avg: '$quality_score' },
        totalRewards: { $sum: '$reward_amount' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    avgCVSS: 0,
    avgQualityScore: 0,
    totalRewards: 0
  };
};

module.exports = mongoose.model('Submission', submissionSchema);
