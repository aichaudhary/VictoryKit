const mongoose = require("mongoose");

const controlSchema = new mongoose.Schema(
  {
    controlId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        "preventive",
        "detective",
        "corrective",
        "directive",
        "compensating",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ["technical", "administrative", "physical", "operational"],
    },
    framework: {
      name: {
        type: String,
        enum: ["nist", "iso27001", "cis", "cobit", "soc2", "custom"],
      },
      controlRef: String,
      requirement: String,
    },
    implementation: {
      status: {
        type: String,
        enum: ["planned", "partial", "implemented", "not_applicable"],
        default: "planned",
      },
      evidence: String,
      owner: String,
      implementedDate: Date,
    },
    effectiveness: {
      rating: {
        type: String,
        enum: [
          "not_tested",
          "ineffective",
          "partially_effective",
          "effective",
          "highly_effective",
        ],
        default: "not_tested",
      },
      score: { type: Number, min: 0, max: 100, default: 0 },
      lastTested: Date,
      testMethod: String,
      testResults: String,
    },
    coverage: {
      assets: [String],
      risks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Risk" }],
      systems: [String],
    },
    cost: {
      implementation: Number,
      annual: Number,
      currency: { type: String, default: "USD" },
    },
    automation: {
      level: {
        type: String,
        enum: ["manual", "semi_automated", "fully_automated"],
      },
      tools: [String],
    },
    testing: {
      frequency: {
        type: String,
        enum: [
          "continuous",
          "daily",
          "weekly",
          "monthly",
          "quarterly",
          "annual",
        ],
      },
      lastTest: Date,
      nextTest: Date,
      testHistory: [
        {
          date: Date,
          result: String,
          tester: String,
          findings: String,
        },
      ],
    },
    gaps: [
      {
        description: String,
        severity: { type: String, enum: ["critical", "high", "medium", "low"] },
        remediation: String,
        status: { type: String, enum: ["open", "in_progress", "closed"] },
      },
    ],
    metadata: {
      createdBy: String,
      lastModifiedBy: String,
      approvedBy: String,
      tags: [String],
      notes: String,
    },
  },
  { timestamps: true }
);

// Generate control ID if not exists
controlSchema.pre("save", function (next) {
  if (!this.controlId) {
    this.controlId = "CTRL-" + Date.now().toString(36).toUpperCase();
  }

  // Calculate effectiveness score from rating
  const ratingScores = {
    not_tested: 0,
    ineffective: 10,
    partially_effective: 50,
    effective: 80,
    highly_effective: 100,
  };
  this.effectiveness.score = ratingScores[this.effectiveness.rating] || 0;

  next();
});

// Indexes
controlSchema.index({ controlId: 1 });
controlSchema.index({ type: 1 });
controlSchema.index({ "framework.name": 1 });
controlSchema.index({ "implementation.status": 1 });

module.exports = mongoose.model("Control", controlSchema);
