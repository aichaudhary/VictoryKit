const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true,
    default: () => `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Policy Information
  policyViolated: {
    policyId: {
      type: String,
      required: true
    },
    policyName: String,
    framework: String
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  
  // User Information
  user: {
    userId: {
      type: String,
      required: true
    },
    name: String,
    email: String,
    department: String,
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Data Information
  data: {
    type: {
      type: String,
      enum: ['PII', 'PHI', 'PCI', 'Financial', 'Intellectual Property', 'Trade Secret', 'Confidential', 'Unknown'],
      required: true
    },
    classification: {
      type: String,
      enum: ['Public', 'Internal', 'Confidential', 'Restricted'],
      required: true
    },
    size: Number, // bytes
    fileType: String,
    fileName: String,
    preview: String, // Redacted preview
    matchedPatterns: [String],
    mlConfidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  
  // Action Details
  action: {
    attempted: {
      type: String,
      enum: ['email', 'upload', 'download', 'print', 'copy', 'screenshot', 'usb', 'other'],
      required: true
    },
    blocked: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    justification: String, // User-provided justification
    overridden: {
      type: Boolean,
      default: false
    },
    overrideReason: String,
    overriddenBy: {
      userId: String,
      name: String,
      timestamp: Date
    }
  },
  
  // Source and Destination
  source: {
    type: String,
    required: true // File path, database, etc.
  },
  destination: {
    type: String,
    required: true // Email address, URL, device, etc.
  },
  transferMethod: {
    type: String,
    enum: ['email', 'web', 'ftp', 'usb', 'cloud', 'print', 'other']
  },
  
  // Incident Status
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'false_positive', 'escalated'],
    default: 'open'
  },
  
  // Response Information
  response: {
    actionTaken: String,
    assignedTo: {
      userId: String,
      name: String,
      timestamp: Date
    },
    investigationNotes: [{
      note: String,
      author: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    resolution: {
      outcome: {
        type: String,
        enum: ['violation_confirmed', 'false_positive', 'legitimate_business', 'training_needed', 'policy_updated']
      },
      description: String,
      resolvedBy: {
        userId: String,
        name: String
      },
      timestamp: Date
    },
    remediationSteps: [{
      step: String,
      completed: Boolean,
      timestamp: Date
    }]
  },
  
  // Risk Assessment
  riskAssessment: {
    dataExposureRisk: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    complianceImpact: {
      type: String,
      enum: ['none', 'minor', 'moderate', 'major', 'severe']
    },
    reputationImpact: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    estimatedCost: Number, // Potential breach cost
    assessedBy: String,
    assessmentDate: Date
  },
  
  // Forensic Data
  forensics: {
    ipAddress: String,
    hostname: String,
    userAgent: String,
    sessionId: String,
    geolocation: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    additionalContext: mongoose.Schema.Types.Mixed
  },
  
  // Related Incidents
  relatedIncidents: [{
    incidentId: String,
    relationship: {
      type: String,
      enum: ['duplicate', 'related', 'pattern', 'escalation']
    }
  }],
  
  // Tags and Labels
  tags: [String],
  labels: [{
    key: String,
    value: String
  }]
}, {
  timestamps: true
});

// Indexes
incidentSchema.index({ incidentId: 1 });
incidentSchema.index({ 'user.userId': 1 });
incidentSchema.index({ 'policyViolated.policyId': 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ 'action.timestamp': -1 });
incidentSchema.index({ 'data.type': 1 });

// Methods
incidentSchema.methods.assignTo = function(userId, userName) {
  this.response.assignedTo = {
    userId,
    name: userName,
    timestamp: new Date()
  };
  this.status = 'investigating';
  return this.save();
};

incidentSchema.methods.addNote = function(note, author) {
  this.response.investigationNotes.push({
    note,
    author,
    timestamp: new Date()
  });
  return this.save();
};

incidentSchema.methods.resolve = function(outcome, description, resolvedBy) {
  this.response.resolution = {
    outcome,
    description,
    resolvedBy,
    timestamp: new Date()
  };
  this.status = 'resolved';
  return this.save();
};

incidentSchema.methods.escalate = function() {
  this.status = 'escalated';
  if (this.severity === 'high') this.severity = 'critical';
  else if (this.severity === 'medium') this.severity = 'high';
  return this.save();
};

incidentSchema.methods.calculateRiskScore = function() {
  const severityWeight = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 100
  };
  
  const dataTypeWeight = {
    'PII': 1.2,
    'PHI': 1.5,
    'PCI': 1.4,
    'Trade Secret': 1.6,
    'Intellectual Property': 1.3,
    'Financial': 1.3
  };
  
  const baseScore = severityWeight[this.severity] || 50;
  const dataMultiplier = dataTypeWeight[this.data.type] || 1.0;
  
  return Math.min(Math.round(baseScore * dataMultiplier), 100);
};

// Statics
incidentSchema.statics.getOpenByUser = function(userId) {
  return this.find({ 
    'user.userId': userId, 
    status: { $in: ['open', 'investigating'] }
  });
};

incidentSchema.statics.getCriticalIncidents = function() {
  return this.find({ 
    severity: 'critical', 
    status: { $ne: 'resolved' }
  }).sort({ 'action.timestamp': -1 });
};

incidentSchema.statics.getStatisticsByTimeRange = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        'action.timestamp': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 },
        blocked: {
          $sum: { $cond: ['$action.blocked', 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Incident', incidentSchema);
