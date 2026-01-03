/**
 * Incident Model
 * Security incident tracking with real-world integrations
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
  platform: { type: String },
  status: { type: String },
  discoveredBy: { type: String },
  impact: { type: String, enum: ["critical", "high", "medium", "low"] },
});

const indicatorSchema = new mongoose.Schema({
  type: { type: String, enum: ["ip", "domain", "hash", "url", "email", "file"] },
  value: { type: String, required: true },
  malicious: { type: Boolean, default: false },
  source: { type: String },
  enrichment: { type: mongoose.Schema.Types.Mixed },
  firstSeen: { type: Date },
  lastSeen: { type: Date },
});

// External ticket reference schema
const externalTicketSchema = new mongoose.Schema({
  system: { type: String, required: true },
  ticketId: { type: String },
  sysId: { type: String },
  incidentId: { type: String },
  incidentNumber: { type: Number },
  url: { type: String },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Containment actions schema
const containmentSchema = new mongoose.Schema({
  isolatedEndpoints: [{ type: String }],
  blockedIPs: [{ type: String }],
  disabledAccounts: [{ type: String }],
  lastAction: { type: Date },
  status: { type: String, enum: ["not_started", "in_progress", "complete"] },
});

// AI Analysis result schema
const aiAnalysisSchema = new mongoose.Schema({
  analysis: { type: mongoose.Schema.Types.Mixed },
  provider: { type: String },
  model: { type: String },
  simulated: { type: Boolean, default: false },
  analyzedAt: { type: Date },
});

// SIEM correlation schema
const correlationSchema = new mongoose.Schema({
  matches: [{ type: mongoose.Schema.Types.Mixed }],
  sources: [{ type: String }],
  timeRange: { type: String },
  correlatedAt: { type: Date },
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
      mitreTechniques: [{ type: String }],
      attackVector: { type: String },
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
    
    // Real-world integration fields
    externalTickets: [externalTicketSchema],
    containment: containmentSchema,
    aiAnalysis: aiAnalysisSchema,
    correlations: correlationSchema,
    
    // Notification tracking
    notificationsSent: [{
      channel: { type: String },
      sentAt: { type: Date },
      success: { type: Boolean },
    }],
    
    metrics: {
      timeToDetect: { type: Number },
      timeToRespond: { type: Number },
      timeToContain: { type: Number },
      timeToResolve: { type: Number },
      riskScore: { type: Number, min: 0, max: 100 },
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
incidentSchema.index({ "indicators.value": 1 });
incidentSchema.index({ "externalTickets.ticketId": 1 });

module.exports = mongoose.model("Incident", incidentSchema);
