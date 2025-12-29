/**
 * IdentityShield - Policy Model
 */

const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  provider: {
    type: String,
    enum: ["aws", "azure", "gcp", "okta", "custom"],
    default: "aws",
  },
  externalId: {
    type: String,
    index: true,
  },
  type: {
    type: String,
    enum: [
      "managed",
      "customer_managed",
      "inline",
      "scp",
      "permission_boundary",
    ],
    default: "customer_managed",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "deprecated"],
    default: "active",
  },
  document: {
    version: { type: String, default: "2012-10-17" },
    statements: [
      {
        sid: String,
        effect: { type: String, enum: ["Allow", "Deny"] },
        actions: [String],
        resources: [String],
        conditions: mongoose.Schema.Types.Mixed,
        principals: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  attachedTo: [
    {
      entityType: { type: String, enum: ["user", "role", "group"] },
      entityId: String,
      entityName: String,
    },
  ],
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  findings: [
    {
      type: { type: String },
      severity: String,
      description: String,
      recommendation: String,
    },
  ],
  statistics: {
    attachmentCount: { type: Number, default: 0 },
    permissionCount: { type: Number, default: 0 },
    privilegedPermissions: { type: Number, default: 0 },
  },
  lastEvaluated: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

policySchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // Calculate statistics
  if (this.document && this.document.statements) {
    let permCount = 0;
    let privCount = 0;

    this.document.statements.forEach((stmt) => {
      if (stmt.actions) {
        permCount += stmt.actions.length;
        if (stmt.actions.some((a) => a === "*" || a.includes(":*"))) {
          privCount++;
        }
      }
    });

    this.statistics.permissionCount = permCount;
    this.statistics.privilegedPermissions = privCount;
  }

  next();
});

policySchema.index({ name: 1, provider: 1 });
policySchema.index({ type: 1 });
policySchema.index({ riskScore: -1 });

module.exports = mongoose.model("Policy", policySchema);
