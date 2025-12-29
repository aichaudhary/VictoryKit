const mongoose = require("mongoose");

const mitigationSchema = new mongoose.Schema(
  {
    threatModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreatModel",
      required: true,
    },
    threatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Threat",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["preventive", "detective", "corrective", "compensating"],
      required: true,
    },
    category: {
      type: String,
      enum: ["technical", "administrative", "physical", "hybrid"],
    },
    controlType: {
      type: String,
      enum: [
        "authentication",
        "authorization",
        "encryption",
        "input_validation",
        "logging",
        "monitoring",
        "network",
        "configuration",
        "process",
        "other",
      ],
    },
    implementation: {
      status: {
        type: String,
        enum: [
          "planned",
          "in_progress",
          "implemented",
          "verified",
          "deprecated",
        ],
        default: "planned",
      },
      priority: {
        type: String,
        enum: ["critical", "high", "medium", "low"],
        default: "medium",
      },
      effort: {
        type: String,
        enum: ["trivial", "minor", "moderate", "major", "significant"],
      },
      cost: {
        estimated: Number,
        actual: Number,
        currency: { type: String, default: "USD" },
      },
      timeline: {
        plannedStart: Date,
        plannedEnd: Date,
        actualStart: Date,
        actualEnd: Date,
      },
      assignee: String,
      team: String,
    },
    effectiveness: {
      type: String,
      enum: ["very_high", "high", "medium", "low", "very_low"],
      default: "medium",
    },
    riskReduction: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    requirements: [
      {
        type: { type: String },
        description: String,
        status: String,
      },
    ],
    technicalDetails: {
      technology: String,
      configuration: String,
      dependencies: [String],
      integrationPoints: [String],
    },
    testing: {
      testCases: [
        {
          name: String,
          description: String,
          expected: String,
          status: String,
        },
      ],
      lastTested: Date,
      testResults: String,
    },
    references: [
      {
        type: { type: String },
        id: String,
        url: String,
      },
    ],
    metadata: {
      createdBy: String,
      approvedBy: String,
      approvalDate: Date,
      notes: String,
    },
  },
  { timestamps: true }
);

// Indexes
mitigationSchema.index({ threatModelId: 1 });
mitigationSchema.index({ threatId: 1 });
mitigationSchema.index({ "implementation.status": 1 });
mitigationSchema.index({ type: 1 });

module.exports = mongoose.model("Mitigation", mitigationSchema);
