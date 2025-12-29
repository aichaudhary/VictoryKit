const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema(
  {
    metricId: {
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
      enum: ["percentage", "count", "ratio", "boolean", "time", "score"],
      default: "percentage",
    },
    source: {
      type: { type: String, enum: ["manual", "automated", "api", "agent"] },
      system: String,
      lastCollected: Date,
    },
    value: {
      current: { type: Number, default: 0 },
      target: { type: Number, default: 100 },
      threshold: {
        good: Number,
        warning: Number,
        critical: Number,
      },
      unit: String,
    },
    score: {
      value: { type: Number, min: 0, max: 100, default: 0 },
      status: {
        type: String,
        enum: ["good", "warning", "critical", "unknown"],
      },
    },
    weight: {
      type: Number,
      min: 0,
      max: 1,
      default: 1,
    },
    trend: {
      direction: { type: String, enum: ["up", "down", "stable"] },
      change: Number,
      period: String,
    },
    history: [
      {
        date: { type: Date, default: Date.now },
        value: Number,
        score: Number,
      },
    ],
    dataCollection: {
      method: String,
      query: String,
      schedule: String,
    },
    metadata: {
      framework: String,
      control: String,
      owner: String,
      tags: [String],
    },
  },
  { timestamps: true }
);

// Generate metric ID
metricSchema.pre("save", function (next) {
  if (!this.metricId) {
    this.metricId = "MTR-" + Date.now().toString(36).toUpperCase();
  }

  // Calculate score from value and thresholds
  if (this.value.threshold) {
    const current = this.value.current;
    const { good, warning, critical } = this.value.threshold;

    if (current >= good) {
      this.score.value = 100;
      this.score.status = "good";
    } else if (current >= warning) {
      this.score.value = Math.round(
        70 + ((current - warning) / (good - warning)) * 30
      );
      this.score.status = "warning";
    } else if (current >= critical) {
      this.score.value = Math.round(
        30 + ((current - critical) / (warning - critical)) * 40
      );
      this.score.status = "critical";
    } else {
      this.score.value = Math.round((current / critical) * 30);
      this.score.status = "critical";
    }
  }

  next();
});

// Indexes
metricSchema.index({ metricId: 1 });
metricSchema.index({ category: 1 });
metricSchema.index({ "score.status": 1 });

module.exports = mongoose.model("Metric", metricSchema);
