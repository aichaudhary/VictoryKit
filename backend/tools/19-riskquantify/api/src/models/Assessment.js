const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        "security",
        "operational",
        "financial",
        "compliance",
        "strategic",
        "comprehensive",
      ],
      default: "security",
    },
    status: {
      type: String,
      enum: [
        "draft",
        "in_progress",
        "pending_review",
        "approved",
        "completed",
        "archived",
      ],
      default: "draft",
    },
    methodology: {
      type: String,
      enum: [
        "qualitative",
        "quantitative",
        "hybrid",
        "nist",
        "iso27005",
        "octave",
        "fair",
      ],
      default: "qualitative",
    },
    scope: {
      description: String,
      assets: [String],
      departments: [String],
      systems: [String],
      exclusions: [String],
    },
    riskAppetite: {
      level: {
        type: String,
        enum: ["very_low", "low", "medium", "high", "very_high"],
        default: "medium",
      },
      thresholds: {
        critical: { type: Number, default: 90 },
        high: { type: Number, default: 70 },
        medium: { type: Number, default: 50 },
        low: { type: Number, default: 30 },
      },
    },
    risks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Risk",
      },
    ],
    controls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Control",
      },
    ],
    summary: {
      totalRisks: { type: Number, default: 0 },
      risksByLevel: {
        critical: { type: Number, default: 0 },
        high: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        low: { type: Number, default: 0 },
        informational: { type: Number, default: 0 },
      },
      risksByStatus: {
        identified: { type: Number, default: 0 },
        assessed: { type: Number, default: 0 },
        treated: { type: Number, default: 0 },
        accepted: { type: Number, default: 0 },
        closed: { type: Number, default: 0 },
      },
      averageRiskScore: { type: Number, default: 0 },
      residualRiskScore: { type: Number, default: 0 },
      controlEffectiveness: { type: Number, default: 0 },
    },
    schedule: {
      startDate: Date,
      endDate: Date,
      nextReview: Date,
      frequency: {
        type: String,
        enum: ["annual", "semi_annual", "quarterly", "monthly"],
      },
    },
    team: [
      {
        userId: String,
        name: String,
        role: {
          type: String,
          enum: ["owner", "assessor", "reviewer", "approver"],
        },
      },
    ],
    metadata: {
      createdBy: String,
      approvedBy: String,
      approvalDate: Date,
      framework: String,
      version: { type: String, default: "1.0" },
      tags: [String],
    },
  },
  { timestamps: true }
);

// Indexes
assessmentSchema.index({ name: 1 });
assessmentSchema.index({ type: 1 });
assessmentSchema.index({ status: 1 });
assessmentSchema.index({ "schedule.nextReview": 1 });

module.exports = mongoose.model("Assessment", assessmentSchema);
