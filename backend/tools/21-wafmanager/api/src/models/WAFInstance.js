const mongoose = require("mongoose");

const wafInstanceSchema = new mongoose.Schema(
  {
    instanceId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["aws", "cloudflare", "akamai", "f5", "imperva", "azure", "gcp"],
      required: true,
    },
    configuration: {
      apiKey: String,
      region: String,
      resourceArn: String,
      zoneId: String,
      accountId: String,
    },
    protectedResources: [
      {
        type: {
          type: String,
          enum: ["api_gateway", "alb", "cloudfront", "domain", "cdn"],
        },
        identifier: String,
        name: String,
      },
    ],
    mode: {
      type: String,
      enum: ["detection", "prevention", "learning"],
      default: "detection",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error", "syncing"],
      default: "inactive",
    },
    statistics: {
      totalRequests: { type: Number, default: 0 },
      blockedRequests: { type: Number, default: 0 },
      allowedRequests: { type: Number, default: 0 },
      lastUpdated: Date,
    },
    managedRules: [
      {
        name: String,
        enabled: Boolean,
        vendor: String,
      },
    ],
    lastSyncAt: Date,
    metadata: {
      createdBy: String,
      tags: [String],
    },
  },
  { timestamps: true }
);

// Generate instance ID
wafInstanceSchema.pre("save", function (next) {
  if (!this.instanceId) {
    this.instanceId = "WAF-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Indexes
wafInstanceSchema.index({ instanceId: 1 });
wafInstanceSchema.index({ provider: 1 });
wafInstanceSchema.index({ status: 1 });

module.exports = mongoose.model("WAFInstance", wafInstanceSchema);
