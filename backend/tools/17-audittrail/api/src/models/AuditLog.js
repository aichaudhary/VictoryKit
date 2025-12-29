/**
 * AuditTrail - AuditLog Model
 * Immutable audit log entries with hash chain
 */

const mongoose = require("mongoose");
const crypto = require("crypto");

const auditLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      unique: true,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "authentication",
        "authorization",
        "data_access",
        "data_modification",
        "system",
        "security",
        "admin",
        "user_action",
        "api_call",
        "error",
      ],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failure", "pending", "blocked"],
      default: "success",
    },
    actor: {
      type: {
        type: String,
        enum: ["user", "system", "service", "external"],
      },
      id: String,
      name: String,
      email: String,
      ip: String,
      userAgent: String,
    },
    resource: {
      type: String,
      id: String,
      name: String,
      path: String,
    },
    details: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
      parameters: mongoose.Schema.Types.Mixed,
      response: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      requestId: String,
      sessionId: String,
      correlationId: String,
      source: String,
      environment: String,
      version: String,
    },
    context: {
      location: {
        country: String,
        region: String,
        city: String,
      },
      device: {
        type: String,
        os: String,
        browser: String,
      },
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    // Hash chain for integrity
    previousHash: String,
    hash: {
      type: String,
      required: true,
    },
    // Retention
    retentionPolicy: {
      type: String,
      default: "standard",
    },
    expiresAt: Date,
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false, // We use our own timestamp
  }
);

// Generate hash before save
auditLogSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Get previous log for hash chain
    const previousLog = await this.constructor
      .findOne({})
      .sort({ timestamp: -1 });
    this.previousHash = previousLog ? previousLog.hash : "0".repeat(64);

    // Calculate hash
    const dataToHash = {
      logId: this.logId,
      timestamp: this.timestamp,
      eventType: this.eventType,
      action: this.action,
      actor: this.actor,
      resource: this.resource,
      previousHash: this.previousHash,
    };
    this.hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(dataToHash))
      .digest("hex");
  }
  next();
});

// Verify integrity method
auditLogSchema.methods.verifyIntegrity = async function () {
  const dataToHash = {
    logId: this.logId,
    timestamp: this.timestamp,
    eventType: this.eventType,
    action: this.action,
    actor: this.actor,
    resource: this.resource,
    previousHash: this.previousHash,
  };

  const calculatedHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(dataToHash))
    .digest("hex");

  return calculatedHash === this.hash;
};

auditLogSchema.index({ logId: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ eventType: 1, timestamp: -1 });
auditLogSchema.index({ "actor.id": 1, timestamp: -1 });
auditLogSchema.index({ "resource.type": 1, "resource.id": 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
