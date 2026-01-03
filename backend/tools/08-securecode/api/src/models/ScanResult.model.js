const mongoose = require('mongoose');

/**
 * ScanResult Model
 * Comprehensive scan results with findings, metrics, and analysis
 */
const ScanResultSchema = new mongoose.Schema({
  // Scan identification
  scanId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Repository reference
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodeRepository',
    index: true
  },
  repositoryName: String,  // Denormalized for quick access
  
  // Scan context
  context: {
    branch: {
      type: String,
      required: true,
      index: true
    },
    commit: {
      sha: String,
      message: String,
      author: String,
      timestamp: Date
    },
    pullRequest: {
      number: Number,
      title: String,
      url: String
    },
    trigger: {
      type: String,
      enum: ['push', 'pull_request', 'scheduled', 'manual', 'webhook', 'api'],
      default: 'manual'
    },
    triggeredBy: {
      userId: mongoose.Schema.Types.ObjectId,
      username: String
    }
  },
  
  // Scan configuration used
  config: {
    scanTypes: {
      sast: Boolean,
      secrets: Boolean,
      dependencies: Boolean,
      iac: Boolean,
      containers: Boolean
    },
    languages: [String],
    rules: {
      enabled: [String],
      disabled: [String],
      custom: [String]
    },
    paths: {
      included: [String],
      excluded: [String]
    }
  },
  
  // Scan status
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed', 'cancelled'],
    default: 'queued',
    index: true
  },
  
  // Progress tracking
  progress: {
    percentage: { type: Number, default: 0 },
    currentPhase: String,
    filesScanned: { type: Number, default: 0 },
    totalFiles: Number,
    startedAt: Date,
    completedAt: Date,
    duration: Number  // in milliseconds
  },
  
  // Findings summary
  summary: {
    totalFindings: { type: Number, default: 0 },
    newFindings: { type: Number, default: 0 },
    fixedFindings: { type: Number, default: 0 },
    bySeverity: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 }
    },
    byCategory: {
      type: Map,
      of: Number
    },
    byLanguage: {
      type: Map,
      of: Number
    }
  },
  
  // Security score
  score: {
    overall: {
      type: Number,
      min: 0,
      max: 100
    },
    previous: Number,
    change: Number,  // Positive = improved, negative = degraded
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']
    },
    breakdown: {
      sast: Number,
      secrets: Number,
      dependencies: Number,
      configuration: Number
    }
  },
  
  // Detailed findings
  findings: [{
    findingId: {
      type: String,
      required: true
    },
    ruleId: {
      type: String,
      required: true,
      index: true
    },
    ruleName: String,
    
    // Finding classification
    category: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      required: true
    },
    confidence: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    
    // Location
    location: {
      file: {
        type: String,
        required: true
      },
      startLine: Number,
      endLine: Number,
      startColumn: Number,
      endColumn: Number,
      snippet: String,  // Code snippet with vulnerability
      context: String   // Surrounding code for context
    },
    
    // Data flow (for taint analysis)
    dataFlow: [{
      file: String,
      line: Number,
      description: String,
      type: {
        type: String,
        enum: ['source', 'propagator', 'sink']
      }
    }],
    
    // Standards mapping
    standards: {
      cwe: [{
        id: Number,
        name: String
      }],
      owasp: [String],
      sans: [String]
    },
    
    // Message and remediation
    message: {
      type: String,
      required: true
    },
    description: String,
    remediation: {
      suggestion: String,
      codeExample: String,
      references: [{
        title: String,
        url: String
      }],
      autofix: {
        available: Boolean,
        patch: String
      }
    },
    
    // AI-generated insights
    aiAnalysis: {
      explanation: String,
      impact: String,
      exploitability: String,
      suggestedFix: String,
      confidence: Number
    },
    
    // Status tracking
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'in_progress', 'fixed', 'false_positive', 'wont_fix', 'duplicate'],
      default: 'open'
    },
    isNew: { type: Boolean, default: true },
    firstSeenAt: Date,
    resolvedAt: Date,
    
    // Metadata
    hash: String,  // Fingerprint for deduplication
    tags: [String],
    assignee: {
      userId: mongoose.Schema.Types.ObjectId,
      username: String
    },
    comments: [{
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      content: String,
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  
  // Dependency vulnerabilities (separate from code findings)
  dependencies: {
    scanned: { type: Number, default: 0 },
    vulnerable: { type: Number, default: 0 },
    outdated: { type: Number, default: 0 },
    items: [{
      name: String,
      version: String,
      latestVersion: String,
      ecosystem: {
        type: String,
        enum: ['npm', 'pip', 'maven', 'gradle', 'nuget', 'gem', 'cargo', 'go', 'composer']
      },
      vulnerabilities: [{
        id: String,  // CVE-ID or advisory ID
        title: String,
        severity: String,
        cvss: Number,
        fixedIn: String,
        url: String
      }],
      license: String,
      isDirectDependency: Boolean
    }]
  },
  
  // Secrets detected
  secrets: {
    count: { type: Number, default: 0 },
    items: [{
      type: {
        type: String,
        enum: [
          'api_key', 'aws_access_key', 'aws_secret_key', 'azure_key',
          'gcp_key', 'github_token', 'gitlab_token', 'slack_token',
          'private_key', 'certificate', 'password', 'jwt_secret',
          'database_url', 'connection_string', 'oauth_secret', 'generic'
        ]
      },
      file: String,
      line: Number,
      severity: String,
      masked: String,  // Partially masked secret for display
      verified: Boolean,  // If we verified it's active
      status: String
    }]
  },
  
  // Files analyzed
  filesAnalyzed: [{
    path: String,
    language: String,
    lines: Number,
    findings: Number,
    score: Number
  }],
  
  // Performance metrics
  metrics: {
    filesProcessed: Number,
    linesOfCode: Number,
    scanEngines: [{
      name: String,
      duration: Number,
      findingsCount: Number
    }],
    memoryUsed: Number,
    cpuTime: Number
  },
  
  // Error information
  errors: [{
    phase: String,
    message: String,
    stack: String,
    timestamp: Date
  }],
  
  // Comparison with baseline
  baseline: {
    scanId: mongoose.Schema.Types.ObjectId,
    comparison: {
      newIssues: Number,
      fixedIssues: Number,
      unchangedIssues: Number
    }
  },
  
  // Policy evaluation
  policyResult: {
    passed: Boolean,
    failureReason: String,
    rules: [{
      name: String,
      passed: Boolean,
      message: String
    }]
  },
  
  // Notifications sent
  notifications: [{
    channel: String,
    sentAt: Date,
    status: String
  }],
  
  // Metadata
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'securecode_scans'
});

// Indexes for performance
ScanResultSchema.index({ repository: 1, 'context.branch': 1, createdAt: -1 });
ScanResultSchema.index({ status: 1, createdAt: -1 });
ScanResultSchema.index({ 'context.commit.sha': 1 });
ScanResultSchema.index({ 'context.pullRequest.number': 1 });
ScanResultSchema.index({ 'findings.ruleId': 1 });
ScanResultSchema.index({ 'findings.status': 1 });
ScanResultSchema.index({ 'findings.severity': 1 });
ScanResultSchema.index({ 'score.overall': 1 });

// Virtual for duration in human-readable format
ScanResultSchema.virtual('durationFormatted').get(function() {
  if (!this.progress.duration) return 'N/A';
  const seconds = Math.floor(this.progress.duration / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
});

// Method to calculate security score
ScanResultSchema.methods.calculateScore = function() {
  const weights = {
    critical: 25,
    high: 10,
    medium: 3,
    low: 1,
    info: 0
  };
  
  let penalty = 0;
  Object.entries(this.summary.bySeverity).forEach(([severity, count]) => {
    penalty += (weights[severity] || 0) * count;
  });
  
  // Add penalties for secrets and vulnerable dependencies
  penalty += (this.secrets.count || 0) * 20;
  penalty += (this.dependencies.vulnerable || 0) * 5;
  
  const score = Math.max(0, 100 - penalty);
  
  // Calculate grade
  let grade;
  if (score >= 97) grade = 'A+';
  else if (score >= 93) grade = 'A';
  else if (score >= 90) grade = 'A-';
  else if (score >= 87) grade = 'B+';
  else if (score >= 83) grade = 'B';
  else if (score >= 80) grade = 'B-';
  else if (score >= 77) grade = 'C+';
  else if (score >= 73) grade = 'C';
  else if (score >= 70) grade = 'C-';
  else if (score >= 67) grade = 'D+';
  else if (score >= 63) grade = 'D';
  else if (score >= 60) grade = 'D-';
  else grade = 'F';
  
  this.score.overall = score;
  this.score.grade = grade;
  
  return { score, grade };
};

// Static method to find recent scans for a repository
ScanResultSchema.statics.findRecentForRepo = function(repoId, limit = 10) {
  return this.find({ repository: repoId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-findings -filesAnalyzed');
};

// Static method to get trend data
ScanResultSchema.statics.getTrendData = function(repoId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.aggregate([
    {
      $match: {
        repository: mongoose.Types.ObjectId(repoId),
        status: 'completed',
        createdAt: { $gte: since }
      }
    },
    {
      $project: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        score: '$score.overall',
        critical: '$summary.bySeverity.critical',
        high: '$summary.bySeverity.high',
        total: '$summary.totalFindings'
      }
    },
    {
      $group: {
        _id: '$date',
        avgScore: { $avg: '$score' },
        maxCritical: { $max: '$critical' },
        maxHigh: { $max: '$high' },
        totalFindings: { $sum: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('ScanResult', ScanResultSchema);
