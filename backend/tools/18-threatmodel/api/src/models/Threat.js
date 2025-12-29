const mongoose = require("mongoose");

const threatSchema = new mongoose.Schema(
  {
    threatModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreatModel",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    category: {
      type: String,
      enum: [
        "spoofing",
        "tampering",
        "repudiation",
        "information_disclosure",
        "denial_of_service",
        "elevation_of_privilege",
        "other",
      ],
      required: true,
    },
    strideCategory: {
      type: String,
      enum: ["S", "T", "R", "I", "D", "E"],
    },
    attackVector: {
      type: String,
      enum: ["network", "adjacent", "local", "physical"],
    },
    attackComplexity: {
      type: String,
      enum: ["low", "high"],
    },
    privilegesRequired: {
      type: String,
      enum: ["none", "low", "high"],
    },
    userInteraction: {
      type: String,
      enum: ["none", "required"],
    },
    affectedComponents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
      },
    ],
    affectedAssets: [
      {
        name: String,
        type: { type: String },
        sensitivity: String,
      },
    ],
    likelihood: {
      type: String,
      enum: ["very_low", "low", "medium", "high", "very_high"],
      default: "medium",
    },
    impact: {
      confidentiality: {
        type: String,
        enum: ["none", "low", "high"],
        default: "low",
      },
      integrity: {
        type: String,
        enum: ["none", "low", "high"],
        default: "low",
      },
      availability: {
        type: String,
        enum: ["none", "low", "high"],
        default: "low",
      },
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ["critical", "high", "medium", "low", "informational"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["identified", "analyzed", "mitigated", "accepted", "transferred"],
      default: "identified",
    },
    mitigations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mitigation",
      },
    ],
    residualRisk: {
      score: { type: Number, default: 0 },
      level: {
        type: String,
        enum: ["critical", "high", "medium", "low", "informational"],
      },
    },
    attackScenarios: [
      {
        name: String,
        description: String,
        steps: [String],
        preconditions: [String],
        postconditions: [String],
      },
    ],
    references: [
      {
        type: {
          type: String,
          enum: ["cwe", "capec", "mitre", "owasp", "custom"],
        },
        id: String,
        url: String,
        description: String,
      },
    ],
    metadata: {
      identifiedBy: String,
      identifiedDate: { type: Date, default: Date.now },
      lastAssessedBy: String,
      lastAssessedDate: Date,
      notes: String,
    },
  },
  { timestamps: true }
);

// Calculate risk score before save
threatSchema.pre("save", function (next) {
  // Simple risk calculation
  const likelihoodScores = {
    very_low: 1,
    low: 2,
    medium: 3,
    high: 4,
    very_high: 5,
  };
  const impactScores = { none: 0, low: 1, high: 2 };

  const likelihood = likelihoodScores[this.likelihood] || 3;
  const impact = Math.max(
    impactScores[this.impact?.confidentiality] || 0,
    impactScores[this.impact?.integrity] || 0,
    impactScores[this.impact?.availability] || 0
  );

  this.riskScore = Math.round(((likelihood * impact) / 10) * 100);

  if (this.riskScore >= 80) this.riskLevel = "critical";
  else if (this.riskScore >= 60) this.riskLevel = "high";
  else if (this.riskScore >= 40) this.riskLevel = "medium";
  else if (this.riskScore >= 20) this.riskLevel = "low";
  else this.riskLevel = "informational";

  next();
});

// Indexes
threatSchema.index({ threatModelId: 1 });
threatSchema.index({ category: 1 });
threatSchema.index({ riskLevel: 1 });
threatSchema.index({ status: 1 });

module.exports = mongoose.model("Threat", threatSchema);
