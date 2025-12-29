/**
 * Evidence Model
 * Forensic evidence management
 */

const mongoose = require("mongoose");

const chainOfCustodySchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
});

const evidenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
    },
    evidenceId: { type: String, unique: true, required: true },
    type: {
      type: String,
      enum: [
        "disk_image",
        "memory_dump",
        "network_capture",
        "log_file",
        "malware_sample",
        "screenshot",
        "document",
        "other",
      ],
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    source: {
      assetId: { type: String },
      hostname: { type: String },
      collectionMethod: { type: String },
    },
    storage: {
      location: { type: String },
      hash: {
        md5: { type: String },
        sha1: { type: String },
        sha256: { type: String },
      },
      size: { type: Number },
      encrypted: { type: Boolean, default: false },
    },
    chainOfCustody: [chainOfCustodySchema],
    analysis: {
      status: {
        type: String,
        enum: ["pending", "in_progress", "completed"],
        default: "pending",
      },
      findings: [{ type: String }],
      artifacts: [{ type: mongoose.Schema.Types.Mixed }],
      analyzedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      analyzedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Generate evidence ID
evidenceSchema.pre("save", async function (next) {
  if (!this.evidenceId) {
    const count = await this.constructor.countDocuments();
    this.evidenceId = `EVD-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Index
evidenceSchema.index({ incidentId: 1 });
evidenceSchema.index({ type: 1 });

module.exports = mongoose.model("Evidence", evidenceSchema);
