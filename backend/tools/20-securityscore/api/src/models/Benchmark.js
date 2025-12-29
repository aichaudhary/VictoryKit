const mongoose = require("mongoose");

const benchmarkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["industry", "peer", "regulatory", "internal", "custom"],
      default: "industry",
    },
    industry: {
      type: String,
      enum: [
        "finance",
        "healthcare",
        "technology",
        "retail",
        "manufacturing",
        "government",
        "general",
      ],
    },
    size: {
      type: String,
      enum: ["small", "medium", "large", "enterprise"],
    },
    scores: {
      overall: { type: Number, min: 0, max: 100 },
      network: { type: Number, min: 0, max: 100 },
      endpoint: { type: Number, min: 0, max: 100 },
      identity: { type: Number, min: 0, max: 100 },
      data: { type: Number, min: 0, max: 100 },
      application: { type: Number, min: 0, max: 100 },
      cloud: { type: Number, min: 0, max: 100 },
      compliance: { type: Number, min: 0, max: 100 },
    },
    percentiles: {
      p25: { type: Number },
      p50: { type: Number },
      p75: { type: Number },
      p90: { type: Number },
    },
    sampleSize: { type: Number },
    validFrom: { type: Date },
    validTo: { type: Date },
    source: {
      name: String,
      url: String,
      lastUpdated: Date,
    },
    metadata: {
      createdBy: String,
      tags: [String],
      notes: String,
    },
  },
  { timestamps: true }
);

// Indexes
benchmarkSchema.index({ type: 1 });
benchmarkSchema.index({ industry: 1 });
benchmarkSchema.index({ size: 1 });

module.exports = mongoose.model("Benchmark", benchmarkSchema);
