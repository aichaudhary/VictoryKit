const mongoose = require("mongoose");

const securityScoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    entityType: {
      type: String,
      enum: ["organization", "department", "system", "application", "vendor"],
      default: "organization",
    },
    entityId: String,
    overallScore: {
      value: { type: Number, min: 0, max: 100, default: 0 },
      grade: {
        type: String,
        enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"],
      },
      trend: { type: String, enum: ["improving", "stable", "declining"] },
    },
    categories: {
      network: {
        score: { type: Number, min: 0, max: 100, default: 0 },
        weight: { type: Number, default: 0.15 },
        metrics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Metric" }],
      },
      endpoint: {
        score: { type: Number, min: 0, max: 100, default: 0 },
        weight: { type: Number, default: 0.15 },
        metrics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Metric" }],
      },
      identity: {
        score: { type: Number, min: 0, max: 100, default: 0 },
        weight: { type: Number, default: 0.15 },
        metrics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Metric" }],
      },
      data: {
        score: { type: Number, min: 0, max: 100, default: 0 },
        weight: { type: Number, default: 0.15 },
        metrics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Metric" }],
      },
      application: {
        score: { type: Number, min: 0, max: 100, default: 0 },
        weight: { type: Number, default: 0.15 },
        metrics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Metric" }],
      },
      cloud: {
        score: { type: Number, min: 0, max: 100, default: 0 },
        weight: { type: Number, default: 0.1 },
        metrics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Metric" }],
      },
      compliance: {
        score: { type: Number, min: 0, max: 100, default: 0 },
        weight: { type: Number, default: 0.15 },
        metrics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Metric" }],
      },
    },
    risks: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
    },
    improvements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Improvement",
      },
    ],
    benchmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Benchmark",
      },
    ],
    history: [
      {
        date: { type: Date, default: Date.now },
        score: Number,
        grade: String,
        categories: mongoose.Schema.Types.Mixed,
      },
    ],
    schedule: {
      frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
      lastCalculated: Date,
      nextCalculation: Date,
    },
    metadata: {
      createdBy: String,
      lastModifiedBy: String,
      framework: String,
      tags: [String],
    },
  },
  { timestamps: true }
);

// Calculate grade from score
securityScoreSchema.pre("save", function (next) {
  const score = this.overallScore.value;
  if (score >= 97) this.overallScore.grade = "A+";
  else if (score >= 93) this.overallScore.grade = "A";
  else if (score >= 90) this.overallScore.grade = "A-";
  else if (score >= 87) this.overallScore.grade = "B+";
  else if (score >= 83) this.overallScore.grade = "B";
  else if (score >= 80) this.overallScore.grade = "B-";
  else if (score >= 77) this.overallScore.grade = "C+";
  else if (score >= 73) this.overallScore.grade = "C";
  else if (score >= 70) this.overallScore.grade = "C-";
  else if (score >= 60) this.overallScore.grade = "D";
  else this.overallScore.grade = "F";
  next();
});

// Indexes
securityScoreSchema.index({ name: 1 });
securityScoreSchema.index({ entityType: 1 });
securityScoreSchema.index({ "overallScore.value": -1 });

module.exports = mongoose.model("SecurityScore", securityScoreSchema);
