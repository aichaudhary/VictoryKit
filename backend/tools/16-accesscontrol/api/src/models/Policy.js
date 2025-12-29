/**
 * AccessControl - Policy Model
 */

const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  policyId: {
    type: String,
    unique: true,
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
    enum: ["rbac", "abac", "pbac", "hybrid"],
    default: "rbac",
  },
  effect: {
    type: String,
    enum: ["allow", "deny"],
    default: "allow",
  },
  priority: {
    type: Number,
    default: 100,
  },
  subjects: {
    users: [String],
    roles: [String],
    groups: [String],
    attributes: mongoose.Schema.Types.Mixed,
  },
  resources: {
    types: [String],
    identifiers: [String],
    patterns: [String],
    attributes: mongoose.Schema.Types.Mixed,
  },
  actions: [
    {
      type: String,
      enum: [
        "read",
        "write",
        "delete",
        "execute",
        "admin",
        "create",
        "update",
        "*",
      ],
    },
  ],
  conditions: [
    {
      attribute: String,
      operator: {
        type: String,
        enum: [
          "equals",
          "not_equals",
          "contains",
          "starts_with",
          "in",
          "not_in",
          "greater_than",
          "less_than",
        ],
      },
      value: mongoose.Schema.Types.Mixed,
    },
  ],
  context: {
    timeRestrictions: [
      {
        days: [String],
        startTime: String,
        endTime: String,
        timezone: String,
      },
    ],
    locationRestrictions: [String],
    ipRestrictions: [String],
    mfaRequired: { type: Boolean, default: false },
  },
  scope: {
    applications: [String],
    environments: [String],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  effectiveFrom: Date,
  effectiveTo: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

policySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

policySchema.index({ policyId: 1 });
policySchema.index({ "subjects.roles": 1 });
policySchema.index({ isActive: 1, priority: 1 });

module.exports = mongoose.model("Policy", policySchema);
