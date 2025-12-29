/**
 * CloudResource Model
 * Cloud resources being monitored
 */

const mongoose = require("mongoose");

const CloudResourceSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudAccount",
      required: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
    arn: String,
    name: String,
    type: {
      type: String,
      required: true,
    },
    service: String,
    region: String,
    tags: mongoose.Schema.Types.Mixed,
    configuration: mongoose.Schema.Types.Mixed,
    metadata: {
      created: Date,
      modified: Date,
      createdBy: String,
    },
    security: {
      publiclyAccessible: { type: Boolean, default: false },
      encrypted: { type: Boolean, default: false },
      encryptionType: String,
      encryptionKeyId: String,
      logging: { type: Boolean, default: false },
      vpcAttached: { type: Boolean, default: false },
    },
    compliance: {
      frameworks: [
        {
          name: String,
          controls: [String],
          status: {
            type: String,
            enum: ["compliant", "non_compliant", "not_applicable"],
          },
        },
      ],
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    findingsCount: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
    },
    lastScanned: Date,
  },
  {
    timestamps: true,
  }
);

CloudResourceSchema.index({ account: 1, resourceId: 1 }, { unique: true });
CloudResourceSchema.index({ type: 1 });
CloudResourceSchema.index({ riskScore: -1 });

module.exports = mongoose.model("CloudResource", CloudResourceSchema);
