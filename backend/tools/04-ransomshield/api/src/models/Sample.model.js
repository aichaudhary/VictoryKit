/**
 * RansomShield - Sample Model
 * Stores malware samples and their metadata
 */

const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema(
  {
    // File Information
    fileName: {
      type: String,
      required: true,
      index: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
    },

    // Hash Values
    hashes: {
      md5: { type: String, index: true },
      sha1: { type: String, index: true },
      sha256: { type: String, required: true, unique: true, index: true },
      ssdeep: String,
      imphash: String,
    },

    // Storage
    storagePath: String,
    storageType: {
      type: String,
      enum: ['local', 's3', 'azure'],
      default: 'local',
    },

    // Classification Result
    verdict: {
      type: String,
      enum: ['MALICIOUS', 'SUSPICIOUS', 'CLEAN', 'UNKNOWN', 'PENDING'],
      default: 'PENDING',
      index: true,
    },

    malwareType: {
      type: String,
      enum: [
        'ransomware',
        'trojan',
        'worm',
        'backdoor',
        'rootkit',
        'spyware',
        'adware',
        'pup',
        'clean',
        'unknown',
      ],
      default: 'unknown',
      index: true,
    },

    malwareFamily: {
      type: String,
      index: true,
    },

    // Risk Assessment
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },

    threatLevel: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'],
      default: 'NONE',
      index: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Analysis Status
    analysisStatus: {
      type: String,
      enum: ['pending', 'analyzing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },

    // Static Analysis Results
    staticAnalysis: {
      entropy: Number,
      packed: Boolean,
      signed: Boolean,
      signatureValid: Boolean,
      signerInfo: {
        issuer: String,
        subject: String,
        validFrom: Date,
        validTo: Date,
      },
      imports: [String],
      exports: [String],
      sections: [
        {
          name: String,
          virtualSize: Number,
          rawSize: Number,
          entropy: Number,
          characteristics: [String],
        },
      ],
      strings: {
        urls: [String],
        ips: [String],
        emails: [String],
        registryKeys: [String],
        filePaths: [String],
        suspicious: [String],
      },
      peInfo: {
        compiledAt: Date,
        entryPoint: String,
        imageBase: String,
        subsystem: String,
        machine: String,
      },
    },

    // Dynamic Analysis Results (Sandbox)
    dynamicAnalysis: {
      sandboxId: String,
      duration: Number,
      behaviors: [
        {
          category: String,
          description: String,
          severity: String,
          timestamp: Date,
        },
      ],
      networkActivity: {
        connections: [
          {
            destination: String,
            port: Number,
            protocol: String,
            data: String,
          },
        ],
        dnsQueries: [String],
        httpRequests: [
          {
            method: String,
            url: String,
            headers: mongoose.Schema.Types.Mixed,
          },
        ],
      },
      fileActivity: {
        created: [String],
        modified: [String],
        deleted: [String],
        read: [String],
      },
      registryActivity: {
        created: [String],
        modified: [String],
        deleted: [String],
      },
      processActivity: [
        {
          name: String,
          pid: Number,
          parentPid: Number,
          commandLine: String,
          action: String,
        },
      ],
      screenshots: [String],
    },

    // YARA Matches
    yaraMatches: [
      {
        ruleName: String,
        ruleFile: String,
        tags: [String],
        meta: mongoose.Schema.Types.Mixed,
        strings: [String],
      },
    ],

    // ML Predictions
    mlPredictions: {
      classifier: {
        model: String,
        prediction: String,
        confidence: Number,
        probabilities: mongoose.Schema.Types.Mixed,
      },
      behaviorPredictor: {
        predictedBehaviors: [String],
        riskAssessment: Number,
      },
    },

    // Threat Intelligence
    threatIntelligence: {
      virusTotalScore: String,
      knownMalware: Boolean,
      firstSeen: Date,
      lastSeen: Date,
      campaigns: [String],
      actors: [String],
      references: [String],
    },

    // Tags and Notes
    tags: [
      {
        type: String,
        index: true,
      },
    ],

    notes: [
      {
        content: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Metadata
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    source: {
      type: String,
      enum: ['upload', 'email', 'api', 'endpoint', 'crawl'],
      default: 'upload',
    },

    quarantined: {
      type: Boolean,
      default: false,
      index: true,
    },

    quarantinedAt: Date,

    analyzedAt: Date,

    // AI Analysis Summary
    aiSummary: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
sampleSchema.index({ createdAt: -1 });
sampleSchema.index({ 'hashes.sha256': 1, uploadedBy: 1 });
sampleSchema.index({ verdict: 1, threatLevel: 1 });
sampleSchema.index({ malwareType: 1, malwareFamily: 1 });

// Virtual for formatted file size
sampleSchema.virtual('formattedSize').get(function () {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Pre-save middleware
sampleSchema.pre('save', function (next) {
  // Auto-set threat level based on risk score
  if (this.isModified('riskScore')) {
    if (this.riskScore >= 80) this.threatLevel = 'CRITICAL';
    else if (this.riskScore >= 60) this.threatLevel = 'HIGH';
    else if (this.riskScore >= 40) this.threatLevel = 'MEDIUM';
    else if (this.riskScore >= 20) this.threatLevel = 'LOW';
    else this.threatLevel = 'NONE';
  }
  next();
});

// Static method to find by hash
sampleSchema.statics.findByHash = function (hash) {
  return this.findOne({
    $or: [{ 'hashes.md5': hash }, { 'hashes.sha1': hash }, { 'hashes.sha256': hash }],
  });
};

// Instance method to generate report
sampleSchema.methods.generateReport = function () {
  return {
    id: this._id,
    fileName: this.fileName,
    hashes: this.hashes,
    verdict: this.verdict,
    malwareType: this.malwareType,
    malwareFamily: this.malwareFamily,
    riskScore: this.riskScore,
    threatLevel: this.threatLevel,
    confidence: this.confidence,
    staticAnalysis: this.staticAnalysis,
    dynamicAnalysis: this.dynamicAnalysis,
    yaraMatches: this.yaraMatches,
    aiSummary: this.aiSummary,
    analyzedAt: this.analyzedAt,
  };
};

const Sample = mongoose.model('Sample', sampleSchema);

module.exports = Sample;
