/**
 * AccessControl - Assignment Model
 */

const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  assignmentId: {
    type: String,
    unique: true,
    required: true,
  },
  principalType: {
    type: String,
    enum: ["user", "group", "service_account"],
    required: true,
  },
  principalId: {
    type: String,
    required: true,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  scope: {
    type: {
      type: String,
      enum: ["global", "organization", "project", "resource"],
      default: "organization",
    },
    resourceId: String,
  },
  grantedBy: mongoose.Schema.Types.ObjectId,
  grantedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date,
  reason: String,
  status: {
    type: String,
    enum: ["active", "pending_approval", "expired", "revoked"],
    default: "active",
  },
  approvals: [
    {
      approver: mongoose.Schema.Types.ObjectId,
      decision: {
        type: String,
        enum: ["approved", "rejected", "pending"],
      },
      timestamp: Date,
      comments: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

assignmentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

assignmentSchema.index({ assignmentId: 1 });
assignmentSchema.index({ principalType: 1, principalId: 1 });
assignmentSchema.index({ roleId: 1 });
assignmentSchema.index({ status: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
