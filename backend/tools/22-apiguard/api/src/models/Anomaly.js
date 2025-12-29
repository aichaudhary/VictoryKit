const mongoose = require("mongoose");

const anomalySchema = new mongoose.Schema(
  {
    anomalyId: {
      type: String,
      unique: true,
    },
    apiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "API",
    },
    endpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Endpoint",
    },
    type: {
      type: String,
      enum: [
        "traffic_spike",
        "error_rate",
        "latency",
        "security",
        "schema_violation",
        "authentication_failure",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    description: String,
    metrics: {
      baseline: Number,
      observed: Number,
      deviation: Number,
      threshold: Number,
    },
    request: {
      ip: String,
      userAgent: String,
      path: String,
      method: String,
      payload: mongoose.Schema.Types.Mixed,
    },
    detection: {
      method: { type: String, enum: ["ml", "rule", "threshold", "pattern"] },
      confidence: Number,
      model: String,
    },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "false_positive"],
      default: "open",
    },
    resolution: {
      action: String,
      resolvedBy: String,
      resolvedAt: Date,
      notes: String,
    },
  },
  { timestamps: true }
);

// Generate anomaly ID
anomalySchema.pre("save", function (next) {
  if (!this.anomalyId) {
    this.anomalyId = "ANM-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Indexes
anomalySchema.index({ anomalyId: 1 });
anomalySchema.index({ apiId: 1 });
anomalySchema.index({ type: 1 });
anomalySchema.index({ severity: 1 });
anomalySchema.index({ status: 1 });
anomalySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Anomaly", anomalySchema);
