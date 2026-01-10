const mongoose = require('mongoose');

const securityAssessmentSchema = new mongoose.Schema({
  // Assessment Identification
  assessmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Assessment Type
  assessmentType: {
    type: String,
    required: true,
    enum: ['scheduled', 'on_demand', 'incident_triggered', 'compliance', 'post_change'],
    index: true
  },
  
  // Timing
  assessmentDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  completedAt: Date,
  duration: Number,
  
  // Overall Security Score
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  previousScore: Number,
  scoreChange: Number,
  trend: {
    type: String,
    enum: ['improving', 'stable', 'declining']
  },
  
  // Category Scores
  categoryScores: {
    encryption: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: Number,
      findings: [String],
      recommendations: [String]
    },
    configuration: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: Number,
      findings: [String],
      recommendations: [String]
    },
    accessControl: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: Number,
      findings: [String],
      recommendations: [String]
    },
    deviceSecurity: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: Number,
      findings: [String],
      recommendations: [String]
    },
    compliance: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: Number,
      findings: [String],
      recommendations: [String]
    },
    monitoring: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      weight: Number,
      findings: [String],
      recommendations: [String]
    }
  },
  
  // Vulnerabilities Found
  vulnerabilities: [{
    vulnerabilityId: String,
    title: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info']
    },
    category: String,
    cvss: Number,
    cve: String,
    affectedAssets: [String],
    description: String,
    impact: String,
    remediation: String,
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'accepted_risk', 'false_positive']
    },
    dueDate: Date,
    assignedTo: String
  }],
  
  // Findings by Category
  findings: {
    weakEncryption: [{
      asset: String,
      currentEncryption: String,
      recommendedEncryption: String,
      risk: String
    }],
    rogueDevices: [{
      macAddress: String,
      type: String,
      firstSeen: Date,
      threat Level: String
    }],
    misconfigurations: [{
      asset: String,
      issue: String,
      severity: String,
      recommendation: String
    }],
    unusedServices: [{
      service: String,
      location: String,
      risk: String
    }],
    policyViolations: [{
      policy: String,
      violation: String,
      affectedAssets: [String]
    }],
    outdatedFirmware: [{
      device: String,
      currentVersion: String,
      latestVersion: String,
      releaseNotes: String
    }]
  },
  
  // Recommendations
  recommendations: [{
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    },
    category: String,
    title: String,
    description: String,
    expectedImpact: String,
    effort: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    cost: {
      type: String,
      enum: ['none', 'low', 'medium', 'high']
    },
    implementation: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Assets Assessed
  assetsAssessed: {
    accessPoints: Number,
    devices: Number,
    networks: Number,
    users: Number
  },
  
  // Compliance Status
  complianceStatus: [{
    framework: String,
    status: {
      type: String,
      enum: ['compliant', 'partial', 'non_compliant', 'not_assessed']
    },
    score: Number,
    gaps: [String],
    lastAudit: Date
  }],
  
  // Risk Analysis
  riskAnalysis: {
    highRiskAssets: [{
      asset: String,
      type: String,
      riskScore: Number,
      reasons: [String]
    }],
    topRisks: [{
      risk: String,
      likelihood: String,
      impact: String,
      mitigation: String
    }],
    riskDistribution: {
      critical: Number,
      high: Number,
      medium: Number,
      low: Number
    },
    totalRiskExposure: Number
  },
  
  // Comparison with Previous Assessment
  changes: {
    newVulnerabilities: Number,
    resolvedVulnerabilities: Number,
    newAssets: Number,
    removedAssets: Number,
    improvedAreas: [String],
    degradedAreas: [String]
  },
  
  // Network Topology Insights
  topology: {
    networkSegmentation: {
      score: Number,
      issues: [String]
    },
    accessPointPlacement: {
      score: Number,
      recommendations: [String]
    },
    coverage: {
      adequate: Number,
      inadequate: Number,
      overlap: Number
    }
  },
  
  // Performance Impact
  performanceIssues: [{
    issue: String,
    affectedArea: String,
    impact: String,
    recommendation: String
  }],
  
  // Executive Summary
  executiveSummary: {
    keyFindings: [String],
    criticalIssues: Number,
    improvementPercentage: Number,
    timeToRemediate: String,
    businessImpact: String
  },
  
  // Assessment Metadata
  assessedBy: {
    user: String,
    role: String,
    automated: Boolean
  },
  scope: {
    locations: [String],
    departments: [String],
    assetTypes: [String]
  },
  methodology: String,
  tools: [String],
  
  // Report Generation
  reports: [{
    type: {
      type: String,
      enum: ['executive', 'technical', 'compliance', 'full']
    },
    format: String,
    generatedAt: Date,
    filePath: String,
    downloadUrl: String
  }],
  
  // Next Assessment
  nextAssessment: {
    scheduledDate: Date,
    type: String,
    reason: String
  },
  
  // Metadata
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes
securityAssessmentSchema.index({ assessmentDate: -1 });
securityAssessmentSchema.index({ overallScore: 1 });
securityAssessmentSchema.index({ assessmentType: 1, assessmentDate: -1 });
securityAssessmentSchema.index({ 'vulnerabilities.severity': 1 });

// Methods
securityAssessmentSchema.methods.calculateOverallScore = function() {
  const categories = this.categoryScores;
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.keys(categories).forEach(category => {
    const cat = categories[category];
    if (cat.score !== undefined && cat.weight !== undefined) {
      totalScore += cat.score * cat.weight;
      totalWeight += cat.weight;
    }
  });
  
  this.overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  return this.overallScore;
};

securityAssessmentSchema.methods.calculateTrend = function(previousAssessment) {
  if (!previousAssessment) {
    this.trend = 'stable';
    return;
  }
  
  this.previousScore = previousAssessment.overallScore;
  this.scoreChange = this.overallScore - this.previousScore;
  
  if (this.scoreChange > 5) {
    this.trend = 'improving';
  } else if (this.scoreChange < -5) {
    this.trend = 'declining';
  } else {
    this.trend = 'stable';
  }
};

securityAssessmentSchema.methods.getPrioritizedActions = function() {
  const actions = [];
  
  // Critical vulnerabilities
  this.vulnerabilities
    .filter(v => v.severity === 'critical' && v.status === 'open')
    .forEach(v => {
      actions.push({
        priority: 1,
        action: `Remediate critical vulnerability: ${v.title}`,
        dueDate: v.dueDate
      });
    });
  
  // Critical recommendations
  this.recommendations
    .filter(r => r.priority === 'critical' && r.status !== 'completed')
    .forEach(r => {
      actions.push({
        priority: 2,
        action: r.title,
        description: r.description
      });
    });
  
  return actions.sort((a, b) => a.priority - b.priority);
};

securityAssessmentSchema.methods.generateExecutiveSummary = function() {
  const critical = this.vulnerabilities.filter(v => v.severity === 'critical').length;
  const high = this.vulnerabilities.filter(v => v.severity === 'high').length;
  
  return {
    assessmentId: this.assessmentId,
    date: this.assessmentDate,
    overallScore: this.overallScore,
    trend: this.trend,
    criticalIssues: critical,
    highIssues: high,
    topRecommendations: this.recommendations.filter(r => r.priority === 'critical').slice(0, 5),
    requiresImmediateAction: critical > 0 || this.overallScore < 60
  };
};

module.exports = mongoose.model('SecurityAssessment', securityAssessmentSchema);
