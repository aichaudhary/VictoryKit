const mongoose = require("mongoose");

const riskSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
    },
    registerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskRegister",
    },
    riskId: {
      type: String,
      unique: true,
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
        "security",
        "operational",
        "financial",
        "compliance",
        "reputational",
        "strategic",
        "technical",
        "third_party",
      ],
      required: true,
    },
    subcategory: String,
    source: {
      type: String,
      enum: [
        "internal",
        "external",
        "third_party",
        "environmental",
        "regulatory",
      ],
    },
    owner: {
      userId: String,
      name: String,
      department: String,
    },
    likelihood: {
      level: {
        type: String,
        enum: ["rare", "unlikely", "possible", "likely", "almost_certain"],
        default: "possible",
      },
      score: { type: Number, min: 1, max: 5, default: 3 },
      justification: String,
    },
    impact: {
      level: {
        type: String,
        enum: ["negligible", "minor", "moderate", "major", "catastrophic"],
        default: "moderate",
      },
      score: { type: Number, min: 1, max: 5, default: 3 },
      areas: {
        financial: { type: Number, min: 0, max: 5, default: 0 },
        operational: { type: Number, min: 0, max: 5, default: 0 },
        reputational: { type: Number, min: 0, max: 5, default: 0 },
        compliance: { type: Number, min: 0, max: 5, default: 0 },
        safety: { type: Number, min: 0, max: 5, default: 0 },
      },
      justification: String,
    },
    inherentRisk: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      level: {
        type: String,
        enum: ["critical", "high", "medium", "low", "informational"],
      },
    },
    residualRisk: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      level: {
        type: String,
        enum: ["critical", "high", "medium", "low", "informational"],
      },
    },
    targetRisk: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      level: {
        type: String,
        enum: ["critical", "high", "medium", "low", "informational"],
      },
    },
    treatment: {
      strategy: {
        type: String,
        enum: ["accept", "mitigate", "transfer", "avoid"],
        default: "mitigate",
      },
      plan: String,
      status: {
        type: String,
        enum: ["not_started", "in_progress", "completed", "deferred"],
        default: "not_started",
      },
      dueDate: Date,
      completedDate: Date,
    },
    controls: [
      {
        controlId: { type: mongoose.Schema.Types.ObjectId, ref: "Control" },
        effectiveness: { type: Number, min: 0, max: 100 },
      },
    ],
    status: {
      type: String,
      enum: [
        "identified",
        "assessed",
        "treated",
        "accepted",
        "closed",
        "reopened",
      ],
      default: "identified",
    },
    incidents: [
      {
        incidentId: String,
        date: Date,
        description: String,
      },
    ],
    kris: [
      {
        name: String,
        metric: String,
        threshold: Number,
        currentValue: Number,
        status: { type: String, enum: ["green", "amber", "red"] },
      },
    ],
    metadata: {
      identifiedDate: { type: Date, default: Date.now },
      lastAssessedDate: Date,
      lastReviewDate: Date,
      nextReviewDate: Date,
      tags: [String],
      notes: String,
    },
  },
  { timestamps: true }
);

// Calculate risk scores before save
riskSchema.pre("save", function (next) {
  // Calculate inherent risk
  const likelihoodScore = this.likelihood.score || 3;
  const impactScore = this.impact.score || 3;
  this.inherentRisk.score = Math.round(
    ((likelihoodScore * impactScore) / 25) * 100
  );
  this.inherentRisk.level = calculateLevel(this.inherentRisk.score);

  // Calculate residual risk if controls exist
  if (this.controls && this.controls.length > 0) {
    const avgEffectiveness =
      this.controls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) /
      this.controls.length;
    this.residualRisk.score = Math.round(
      this.inherentRisk.score * (1 - avgEffectiveness / 100)
    );
  } else {
    this.residualRisk.score = this.inherentRisk.score;
  }
  this.residualRisk.level = calculateLevel(this.residualRisk.score);

  // Generate risk ID if not exists
  if (!this.riskId) {
    this.riskId = "RISK-" + Date.now().toString(36).toUpperCase();
  }

  next();
});

function calculateLevel(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  if (score >= 20) return "low";
  return "informational";
}

// Indexes
riskSchema.index({ assessmentId: 1 });
riskSchema.index({ registerId: 1 });
riskSchema.index({ category: 1 });
riskSchema.index({ "inherentRisk.level": 1 });
riskSchema.index({ status: 1 });

module.exports = mongoose.model("Risk", riskSchema);
