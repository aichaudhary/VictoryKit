const mongoose = require("mongoose");

const threatModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    version: {
      type: String,
      default: "1.0.0",
    },
    status: {
      type: String,
      enum: ["draft", "in_review", "approved", "archived"],
      default: "draft",
    },
    methodology: {
      type: String,
      enum: ["stride", "pasta", "attack_trees", "custom"],
      default: "stride",
    },
    scope: {
      description: String,
      boundaries: [String],
      assumptions: [String],
      exclusions: [String],
    },
    system: {
      name: String,
      type: {
        type: String,
        enum: [
          "web_application",
          "api",
          "mobile_app",
          "microservices",
          "infrastructure",
          "iot",
          "other",
        ],
      },
      architecture: String,
      dataFlows: [
        {
          source: String,
          destination: String,
          dataType: String,
          protocol: String,
          encrypted: Boolean,
        },
      ],
      trustBoundaries: [
        {
          name: String,
          description: String,
          components: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Component" },
          ],
        },
      ],
    },
    components: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
      },
    ],
    threats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Threat",
      },
    ],
    mitigations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mitigation",
      },
    ],
    riskSummary: {
      totalThreats: { type: Number, default: 0 },
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      mitigated: { type: Number, default: 0 },
      averageRiskScore: { type: Number, default: 0 },
    },
    strideAnalysis: {
      spoofing: [{ threat: String, description: String, risk: String }],
      tampering: [{ threat: String, description: String, risk: String }],
      repudiation: [{ threat: String, description: String, risk: String }],
      informationDisclosure: [
        { threat: String, description: String, risk: String },
      ],
      denialOfService: [{ threat: String, description: String, risk: String }],
      elevationOfPrivilege: [
        { threat: String, description: String, risk: String },
      ],
    },
    pastaAnalysis: {
      stage1_objectives: {
        businessObjectives: [String],
        securityRequirements: [String],
      },
      stage2_technicalScope: { assets: [String], dependencies: [String] },
      stage3_decomposition: { components: [String], dataFlows: [String] },
      stage4_threatAnalysis: { threats: [String], attackVectors: [String] },
      stage5_vulnerabilities: { weaknesses: [String], exposures: [String] },
      stage6_attackModeling: { attackTrees: [String], scenarios: [String] },
      stage7_riskAnalysis: { risks: [String], recommendations: [String] },
    },
    metadata: {
      createdBy: String,
      lastModifiedBy: String,
      reviewedBy: String,
      approvedBy: String,
      reviewDate: Date,
      approvalDate: Date,
      tags: [String],
    },
  },
  { timestamps: true }
);

// Indexes
threatModelSchema.index({ name: 1 });
threatModelSchema.index({ status: 1 });
threatModelSchema.index({ methodology: 1 });
threatModelSchema.index({ "metadata.tags": 1 });

module.exports = mongoose.model("ThreatModel", threatModelSchema);
