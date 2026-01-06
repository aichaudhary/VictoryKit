const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  program_id: {
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
  description: {
    type: String,
    required: true
  },
  organization: {
    name: String,
    website: String,
    industry: String,
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    }
  },
  type: {
    type: String,
    enum: ['public', 'private', 'invite_only'],
    default: 'public'
  },
  scope: {
    in_scope: [{
      asset: String,
      type: {
        type: String,
        enum: ['web', 'api', 'mobile', 'desktop', 'hardware', 'other']
      },
      description: String,
      criticality: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low']
      }
    }],
    out_of_scope: [{
      asset: String,
      reason: String
    }]
  },
  accepted_vulnerabilities: [{
    type: String,
    enum: [
      'XSS', 'SQLi', 'CSRF', 'RCE', 'SSRF', 'XXE', 'IDOR',
      'Authentication', 'Authorization', 'Information Disclosure',
      'Business Logic', 'Injection', 'Broken Access Control',
      'Security Misconfiguration', 'Other'
    ]
  }],
  reward_ranges: {
    critical: {
      min: { type: Number, min: 0, default: 2500 },
      max: { type: Number, min: 0, default: 10000 }
    },
    high: {
      min: { type: Number, min: 0, default: 1000 },
      max: { type: Number, min: 0, default: 5000 }
    },
    medium: {
      min: { type: Number, min: 0, default: 250 },
      max: { type: Number, min: 0, default: 1500 }
    },
    low: {
      min: { type: Number, min: 0, default: 50 },
      max: { type: Number, min: 0, default: 500 }
    },
    informational: {
      min: { type: Number, min: 0, default: 0 },
      max: { type: Number, min: 0, default: 0 }
    }
  },
  currency: {
    type: String,
    default: 'USD'
  },
  rules: {
    type: String,
    default: ''
  },
  disclosure_policy: {
    type: String,
    default: 'coordinated',
    enum: ['coordinated', 'immediate', 'none']
  },
  sla: {
    triage_hours: {
      type: Number,
      default: 48
    },
    first_response_hours: {
      type: Number,
      default: 24
    },
    resolution_days: {
      type: Number,
      default: 90
    }
  },
  requirements: {
    age_minimum: {
      type: Number,
      default: 18
    },
    kyc_required: {
      type: Boolean,
      default: false
    },
    nda_required: {
      type: Boolean,
      default: false
    },
    background_check: {
      type: Boolean,
      default: false
    }
  },
  metrics: {
    total_submissions: {
      type: Number,
      default: 0
    },
    valid_submissions: {
      type: Number,
      default: 0
    },
    total_rewards_paid: {
      type: Number,
      default: 0
    },
    avg_triage_time: {
      type: Number,
      default: 0
    },
    avg_resolution_time: {
      type: Number,
      default: 0
    },
    participating_researchers: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'draft',
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'hidden'],
    default: 'public'
  },
  launch_date: {
    type: Date,
    default: null
  },
  end_date: {
    type: Date,
    default: null
  },
  contacts: [{
    name: String,
    email: String,
    role: String,
    primary: Boolean
  }],
  integrations: {
    jira: {
      enabled: Boolean,
      project_key: String
    },
    slack: {
      enabled: Boolean,
      webhook_url: String
    },
    github: {
      enabled: Boolean,
      repo: String
    }
  },
  settings: {
    auto_triage: {
      type: Boolean,
      default: false
    },
    ai_enabled: {
      type: Boolean,
      default: true
    },
    duplicate_detection: {
      type: Boolean,
      default: true
    },
    quality_threshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 30
    }
  }
}, {
  timestamps: true,
  collection: 'programs'
});

// Indexes for performance
programSchema.index({ status: 1, type: 1 });
programSchema.index({ 'organization.name': 1 });

// Virtual for active duration
programSchema.virtual('days_active').get(function() {
  if (!this.launch_date) return 0;
  const endDate = this.end_date || new Date();
  return Math.floor((endDate - this.launch_date) / (1000 * 60 * 60 * 24));
});

// Method to check if submission is in scope
programSchema.methods.isInScope = function(asset) {
  return this.scope.in_scope.some(item => {
    return item.asset === asset || asset.includes(item.asset);
  });
};

// Method to check if submission is out of scope
programSchema.methods.isOutOfScope = function(asset) {
  return this.scope.out_of_scope.some(item => {
    return item.asset === asset || asset.includes(item.asset);
  });
};

// Method to get reward range for severity
programSchema.methods.getRewardRange = function(severity) {
  return this.reward_ranges[severity] || { min: 0, max: 0 };
};

// Static method to get active programs
programSchema.statics.getActivePrograms = async function() {
  return this.find({
    status: 'active',
    visibility: { $in: ['public', 'private'] }
  })
  .select('-integrations -settings')
  .sort({ launch_date: -1 })
  .lean();
};

module.exports = mongoose.model('Program', programSchema);
