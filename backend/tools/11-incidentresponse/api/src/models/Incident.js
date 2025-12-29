/**
 * Incident Model
 * Security incident tracking
 */

const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  event: { type: String, required: true },
  actor: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
});

const affectedAssetSchema = new mongoose.Schema({
  assetId: { type: String },
  type: { type: String },
  hostname: { type: String },
  ipAddress: { type: String },
  impact: { type: String, enum: ["critical", "high", "medium", "low"] },
});

const indicatorSchema = new mongoose.Schema({
  type: { type: String, enum: ["ip", "domain", "hash", "url", "email"] },
  value: { type: String, required: true },
  malicious: { type: Boolean, default: false },
  source: { type: String },
});

const incidentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    incidentId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    description: { type: String },
    classification: {
      type: {
        type: String,
        enum: [
          "malware",
          "ransomware",
          "phishing",
          "data_breach",
          "ddos",
          "insider_threat",
          "apt",
          "unauthorized_access",
          "other",
        ],
      },
      category: { type: String },
      techniques: [{ type: String }],
      confidence: { type: Number, min: 0, max: 100 },
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    priority: {
      type: String,
      enum: ["p1", "p2", "p3", "p4"],
      default: "p3",
    },
    status: {
      type: String,
      enum: [
        "new",
        "triaged",
        "investigating",
        "containing",
        "eradicating",
        "recovering",
        "closed",
      ],
      default: "new",
    },
    phase: {
      type: String,
      enum: [
        "preparation",
        "identification",
        "containment",
        "eradication",
        "recovery",
        "lessons_learned",
      ],
    },
    timeline: [timelineEventSchema],
    affectedAssets: [affectedAssetSchema],
    indicators: [indicatorSchema],
    assignedTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    leadInvestigator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    playbook: { type: mongoose.Schema.Types.ObjectId, ref: "Playbook" },
    metrics: {
      timeToDetect: { type: Number },
      timeToRespond: { type: Number },
      timeToContain: { type: Number },
      timeToResolve: { type: Number },
    },
    detectedAt: { type: Date },
    containedAt: { type: Date },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Generate incident ID
incidentSchema.pre("save", async function (next) {
  if (!this.incidentId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.incidentId = `INC-${year}-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Index for search
incidentSchema.index({ userId: 1, status: 1, severity: 1 });
incidentSchema.index({ incidentId: 1 });
incidentSchema.index({ "classification.type": 1 });

module.exports = mongoose.model("Incident", incidentSchema);
