const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema(
  {
    threatModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreatModel",
      required: true,
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
        "web_server",
        "application_server",
        "database",
        "api",
        "load_balancer",
        "cache",
        "message_queue",
        "storage",
        "external_service",
        "user",
        "process",
        "data_store",
        "other",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "frontend",
        "backend",
        "database",
        "infrastructure",
        "external",
        "user",
      ],
    },
    technology: {
      stack: String,
      version: String,
      framework: String,
      language: String,
    },
    deployment: {
      environment: String,
      location: String,
      hosting: String,
      containerized: Boolean,
    },
    dataHandled: [
      {
        type: { type: String },
        classification: {
          type: String,
          enum: ["public", "internal", "confidential", "restricted"],
        },
        pii: Boolean,
        phi: Boolean,
        pci: Boolean,
      },
    ],
    trustLevel: {
      type: String,
      enum: ["untrusted", "partially_trusted", "trusted", "highly_trusted"],
      default: "partially_trusted",
    },
    exposedInterfaces: [
      {
        name: String,
        type: { type: String, enum: ["api", "ui", "cli", "file", "network"] },
        protocol: String,
        port: Number,
        authenticated: Boolean,
        authorized: Boolean,
        encrypted: Boolean,
      },
    ],
    dependencies: [
      {
        componentId: { type: mongoose.Schema.Types.ObjectId, ref: "Component" },
        name: String,
        type: { type: String },
        critical: Boolean,
      },
    ],
    securityControls: [
      {
        name: String,
        type: { type: String },
        implemented: Boolean,
        verified: Boolean,
      },
    ],
    vulnerabilities: [
      {
        name: String,
        severity: String,
        status: String,
        cveId: String,
      },
    ],
    threats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Threat",
      },
    ],
    riskProfile: {
      exposureLevel: {
        type: String,
        enum: ["external", "internal", "isolated"],
      },
      criticality: {
        type: String,
        enum: ["critical", "high", "medium", "low"],
      },
      attackSurface: {
        type: String,
        enum: ["large", "medium", "small", "minimal"],
      },
    },
    metadata: {
      owner: String,
      team: String,
      documentation: String,
      lastReviewed: Date,
      notes: String,
    },
  },
  { timestamps: true }
);

// Indexes
componentSchema.index({ threatModelId: 1 });
componentSchema.index({ type: 1 });
componentSchema.index({ trustLevel: 1 });

module.exports = mongoose.model("Component", componentSchema);
