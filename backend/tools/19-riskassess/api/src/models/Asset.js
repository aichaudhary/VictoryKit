const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // Asset Classification
  type: {
    type: String,
    enum: [
      'information',         // Data, databases, documents
      'software',            // Applications, systems
      'hardware',            // Servers, workstations, devices
      'network',             // Network infrastructure
      'service',             // Business services
      'people',              // Personnel, contractors
      'facility',            // Buildings, offices
      'intangible',          // Reputation, intellectual property
      'financial'            // Financial resources
    ],
    required: true
  },
  
  subType: String,
  
  category: {
    type: String,
    enum: ['primary', 'supporting', 'infrastructure', 'business_process']
  },
  
  // Criticality & Value
  criticality: {
    level: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'negligible'],
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    justification: String,
    factors: [{
      factor: String,
      weight: Number,
      value: Number
    }]
  },
  
  businessValue: {
    monetary: {
      value: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      method: {
        type: String,
        enum: ['purchase_cost', 'replacement_cost', 'market_value', 'estimated', 'custom']
      }
    },
    strategic: {
      score: Number,
      description: String
    },
    operational: {
      score: Number,
      description: String
    }
  },
  
  // Ownership & Responsibility
  owner: {
    userId: String,
    name: String,
    email: String,
    department: String,
    role: String
  },
  
  custodian: {
    userId: String,
    name: String,
    email: String,
    department: String
  },
  
  stakeholders: [{
    name: String,
    role: String,
    email: String,
    department: String,
    responsibility: String
  }],
  
  // Location & Deployment
  location: {
    physical: {
      address: String,
      building: String,
      floor: String,
      room: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    logical: {
      network: String,
      subnet: String,
      zone: String,
      segment: String
    },
    cloud: {
      provider: String,
      region: String,
      availabilityZone: String
    }
  },
  
  // Technical Details
  technical: {
    manufacturer: String,
    model: String,
    version: String,
    serialNumber: String,
    ipAddress: [String],
    macAddress: [String],
    hostname: String,
    operatingSystem: String,
    specifications: mongoose.Schema.Types.Mixed
  },
  
  // CIA Triad Assessment
  confidentiality: {
    level: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted', 'top_secret'],
      required: true
    },
    impact: {
      type: String,
      enum: ['catastrophic', 'critical', 'major', 'moderate', 'minor', 'negligible']
    },
    dataClassification: [String],
    requirements: [String]
  },
  
  integrity: {
    level: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true
    },
    impact: {
      type: String,
      enum: ['catastrophic', 'critical', 'major', 'moderate', 'minor', 'negligible']
    },
    requirements: [String]
  },
  
  availability: {
    level: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true
    },
    impact: {
      type: String,
      enum: ['catastrophic', 'critical', 'major', 'moderate', 'minor', 'negligible']
    },
    rto: Number,                        // Recovery Time Objective (hours)
    rpo: Number,                        // Recovery Point Objective (hours)
    mtd: Number,                        // Maximum Tolerable Downtime (hours)
    uptime: Number,                     // Required uptime %
    requirements: [String]
  },
  
  // Dependencies
  dependencies: {
    dependsOn: [{
      assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset'
      },
      name: String,
      type: String,
      criticalityLevel: String,
      dependencyType: {
        type: String,
        enum: ['hard', 'soft', 'optional']
      }
    }],
    
    supportedBy: [{
      assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset'
      },
      name: String,
      type: String
    }]
  },
  
  // Risk Assessment
  riskProfile: {
    inherentRisk: {
      score: Number,
      level: String
    },
    residualRisk: {
      score: Number,
      level: String
    },
    
    identifiedRisks: [{
      riskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Risk'
      },
      title: String,
      category: String,
      score: Number,
      level: String,
      status: String
    }],
    
    threats: [{
      threatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Threat'
      },
      name: String,
      type: String,
      likelihood: String
    }],
    
    vulnerabilities: [{
      vulnerabilityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vulnerability'
      },
      name: String,
      severity: String,
      cvssScore: Number
    }]
  },
  
  // Security Controls
  controls: [{
    controlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Control'
    },
    name: String,
    type: String,
    status: String,
    effectiveness: Number
  }],
  
  // Compliance Requirements
  compliance: {
    frameworks: [String],
    requirements: [{
      framework: String,
      requirementId: String,
      description: String,
      status: {
        type: String,
        enum: ['compliant', 'non_compliant', 'partial', 'not_applicable']
      }
    }],
    lastAuditDate: Date,
    nextAuditDate: Date
  },
  
  // Lifecycle Management
  lifecycle: {
    status: {
      type: String,
      enum: ['planning', 'acquisition', 'deployment', 'operational', 
             'maintenance', 'decommissioning', 'retired'],
      default: 'operational'
    },
    acquisitionDate: Date,
    deploymentDate: Date,
    warrantyExpiration: Date,
    endOfLife: Date,
    retirementDate: Date,
    maintenanceSchedule: String
  },
  
  // Usage & Performance
  usage: {
    users: Number,
    transactions: Number,
    capacity: {
      current: Number,
      maximum: Number,
      unit: String
    },
    performance: {
      availability: Number,
      reliability: Number,
      lastMeasured: Date
    }
  },
  
  // Incident History
  incidents: [{
    incidentId: String,
    date: Date,
    type: String,
    severity: String,
    description: String,
    impact: String,
    resolved: Boolean
  }],
  
  // Documentation
  documentation: {
    documents: [{
      title: String,
      type: String,
      url: String,
      lastUpdated: Date
    }],
    notes: String,
    attachments: [{
      filename: String,
      url: String,
      uploadedDate: Date
    }]
  },
  
  // Change Management
  changes: [{
    changeId: String,
    date: Date,
    type: String,
    description: String,
    performedBy: String,
    approved: Boolean
  }],
  
  // Metadata
  metadata: {
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,
    createdBy: {
      userId: String,
      name: String
    },
    lastModifiedBy: {
      userId: String,
      name: String
    }
  }
  
}, {
  timestamps: true
});

// Indexes
assetSchema.index({ type: 1, 'criticality.level': 1 });
assetSchema.index({ 'owner.userId': 1 });
assetSchema.index({ 'lifecycle.status': 1 });

// Pre-save hook
assetSchema.pre('save', function(next) {
  if (!this.assetId) {
    this.assetId = `AST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Instance Methods
assetSchema.methods.calculateValue = function() {
  let totalValue = 0;
  
  if (this.businessValue.monetary.value) {
    totalValue += this.businessValue.monetary.value;
  }
  
  if (this.businessValue.strategic.score) {
    totalValue += this.businessValue.strategic.score * 1000;
  }
  
  if (this.businessValue.operational.score) {
    totalValue += this.businessValue.operational.score * 500;
  }
  
  return totalValue;
};

assetSchema.methods.calculateCriticalityScore = function() {
  let score = 0;
  
  const ciaLevels = {
    'top_secret': 100, 'critical': 90, 'restricted': 80,
    'confidential': 70, 'high': 60, 'internal': 50,
    'medium': 40, 'low': 20, 'public': 10, 'negligible': 0
  };
  
  score += ciaLevels[this.confidentiality.level] || 0;
  score += ciaLevels[this.integrity.level] || 0;
  score += ciaLevels[this.availability.level] || 0;
  
  this.criticality.score = score / 3;
  return this.criticality.score;
};

// Static Methods
assetSchema.statics.findCritical = async function() {
  return this.find({ 'criticality.level': { $in: ['critical', 'high'] } })
    .sort({ 'criticality.score': -1 });
};

assetSchema.statics.findByType = async function(type) {
  return this.find({ type }).sort({ name: 1 });
};

assetSchema.statics.findByOwner = async function(ownerId) {
  return this.find({ 'owner.userId': ownerId }).sort({ name: 1 });
};

assetSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalValue: { $sum: '$businessValue.monetary.value' },
        avgCriticality: { $avg: '$criticality.score' },
        critical: {
          $sum: { $cond: [{ $eq: ['$criticality.level', 'critical'] }, 1, 0] }
        },
        high: {
          $sum: { $cond: [{ $eq: ['$criticality.level', 'high'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || { total: 0, totalValue: 0, avgCriticality: 0, critical: 0, high: 0 };
};

module.exports = mongoose.model('Asset', assetSchema);
