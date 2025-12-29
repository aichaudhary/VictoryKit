const mongoose = require("mongoose");

const riskRegisterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["enterprise", "department", "project", "system", "vendor"],
      default: "enterprise",
    },
    status: {
      type: String,
      enum: ["active", "archived", "draft"],
      default: "active",
    },
    scope: {
      organization: String,
      department: String,
      system: String,
      boundaries: [String],
    },
    owner: {
      userId: String,
      name: String,
      role: String,
    },
    risks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Risk",
      },
    ],
    summary: {
      totalRisks: { type: Number, default: 0 },
      openRisks: { type: Number, default: 0 },
      treatedRisks: { type: Number, default: 0 },
      acceptedRisks: { type: Number, default: 0 },
      overdue: { type: Number, default: 0 },
      riskProfile: {
        critical: { type: Number, default: 0 },
        high: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        low: { type: Number, default: 0 },
      },
      averageScore: { type: Number, default: 0 },
      trend: { type: String, enum: ["improving", "stable", "worsening"] },
    },
    thresholds: {
      critical: { type: Number, default: 80 },
      high: { type: Number, default: 60 },
      medium: { type: Number, default: 40 },
      low: { type: Number, default: 20 },
    },
    reporting: {
      frequency: { type: String, enum: ["weekly", "monthly", "quarterly"] },
      lastReport: Date,
      recipients: [String],
    },
    history: [
      {
        date: Date,
        action: String,
        user: String,
        details: String,
      },
    ],
    metadata: {
      createdBy: String,
      lastReviewedBy: String,
      lastReviewDate: Date,
      nextReviewDate: Date,
      version: { type: String, default: "1.0" },
      tags: [String],
    },
  },
  { timestamps: true }
);

// Indexes
riskRegisterSchema.index({ name: 1 });
riskRegisterSchema.index({ type: 1 });
riskRegisterSchema.index({ status: 1 });
riskRegisterSchema.index({ "owner.userId": 1 });

module.exports = mongoose.model("RiskRegister", riskRegisterSchema);
