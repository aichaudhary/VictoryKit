/**
 * AccessControl - Permission Model
 */

const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  permissionId: {
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
  resource: {
    type: {
      type: String,
      required: true,
    },
    identifier: String,
    pattern: String,
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
  constraints: mongoose.Schema.Types.Mixed,
  scope: {
    type: String,
    enum: ["global", "organization", "project", "resource"],
    default: "organization",
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

permissionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

permissionSchema.index({ permissionId: 1 });
permissionSchema.index({ "resource.type": 1 });

module.exports = mongoose.model("Permission", permissionSchema);
