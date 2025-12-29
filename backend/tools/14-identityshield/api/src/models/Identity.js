/**
 * IdentityShield - Identity Model
 */

const mongoose = require("mongoose");

const identitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["user", "service_account", "application", "group", "role"],
    default: "user",
  },
  provider: {
    type: String,
    enum: ["aws", "azure", "gcp", "okta", "active_directory", "custom"],
    default: "aws",
  },
  externalId: {
    type: String,
    index: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended", "pending"],
    default: "active",
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  riskLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low",
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
    },
  ],
  groups: [
    {
      name: String,
      externalId: String,
    },
  ],
  authentication: {
    mfaEnabled: { type: Boolean, default: false },
    mfaType: String,
    lastLogin: Date,
    failedAttempts: { type: Number, default: 0 },
    passwordLastChanged: Date,
    accessKeys: [
      {
        keyId: String,
        status: String,
        createdAt: Date,
        lastUsed: Date,
      },
    ],
  },
  metadata: {
    department: String,
    manager: String,
    location: String,
    tags: { type: Map, of: String },
  },
  lastAnalyzed: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

identitySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

identitySchema.index({ name: 1, provider: 1 });
identitySchema.index({ riskLevel: 1 });
identitySchema.index({ status: 1 });

module.exports = mongoose.model("Identity", identitySchema);
