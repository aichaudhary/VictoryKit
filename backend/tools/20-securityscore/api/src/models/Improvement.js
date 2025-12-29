const mongoose = require("mongoose");

const improvementSchema = new mongoose.Schema(
  {
    improvementId: {
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
        "network",
        "endpoint",
        "identity",
        "data",
        "application",
        "cloud",
        "compliance",
      ],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "quick_win",
        "short_term",
        "medium_term",
        "long_term",
        "strategic",
      ],
      default: "short_term",
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["identified", "planned", "in_progress", "completed", "deferred"],
      default: "identified",
    },
    impact: {
      scoreIncrease: { type: Number, min: 0, max: 100 },
      affectedMetrics: [String],
      riskReduction: String,
    },
    effort: {
      level: { type: String, enum: ["low", "medium", "high", "very_high"] },
      hours: Number,
      cost: Number,
      currency: { type: String, default: "USD" },
    },
    implementation: {
      steps: [String],
      requirements: [String],
      dependencies: [String],
      assignee: String,
      dueDate: Date,
      completedDate: Date,
    },
    metrics: [
      {
        metricId: { type: mongoose.Schema.Types.ObjectId, ref: "Metric" },
        expectedImprovement: Number,
      },
    ],
    relatedIssues: [
      {
        issueId: String,
        title: String,
        severity: String,
      },
    ],
    validation: {
      method: String,
      evidence: String,
      validatedBy: String,
      validatedDate: Date,
    },
    metadata: {
      createdBy: String,
      source: {
        type: String,
        enum: ["automated", "manual", "ai_recommendation"],
      },
      framework: String,
      control: String,
      tags: [String],
    },
  },
  { timestamps: true }
);

// Generate improvement ID
improvementSchema.pre("save", function (next) {
  if (!this.improvementId) {
    this.improvementId = "IMP-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Indexes
improvementSchema.index({ improvementId: 1 });
improvementSchema.index({ category: 1 });
improvementSchema.index({ priority: 1 });
improvementSchema.index({ status: 1 });

module.exports = mongoose.model("Improvement", improvementSchema);
