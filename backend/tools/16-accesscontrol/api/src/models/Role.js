/**
 * AccessControl - Role Model
 */

const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  displayName: String,
  description: String,
  type: {
    type: String,
    enum: ["system", "application", "custom"],
    default: "custom",
  },
  scope: {
    type: String,
    enum: ["global", "organization", "project", "resource"],
    default: "organization",
  },
  permissions: [
    {
      permissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
      resource: String,
      actions: [String],
    },
  ],
  inheritsFrom: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
  constraints: {
    maxAssignments: Number,
    requireApproval: { type: Boolean, default: false },
    approvers: [mongoose.Schema.Types.ObjectId],
    expiryDays: Number,
  },
  metadata: {
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    privileged: { type: Boolean, default: false },
    sensitive: { type: Boolean, default: false },
    owner: mongoose.Schema.Types.ObjectId,
  },
  memberCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

roleSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

roleSchema.index({ roleId: 1 });
roleSchema.index({ name: 1 });
roleSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model("Role", roleSchema);
