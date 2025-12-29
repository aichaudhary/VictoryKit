const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    policyId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    template: {
      type: String,
      enum: [
        "owasp_top_10",
        "api_protection",
        "bot_mitigation",
        "ddos_protection",
        "custom",
      ],
      default: "custom",
    },
    rules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rule",
      },
    ],
    defaultAction: {
      type: String,
      enum: ["allow", "block", "challenge"],
      default: "allow",
    },
    logging: {
      enabled: { type: Boolean, default: true },
      fullRequest: { type: Boolean, default: false },
      sensitiveFields: [String],
    },
    customResponses: {
      block: {
        statusCode: { type: Number, default: 403 },
        body: String,
        headers: mongoose.Schema.Types.Mixed,
      },
    },
    scheduling: {
      enabled: { type: Boolean, default: false },
      activeHours: {
        start: String,
        end: String,
        timezone: String,
      },
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    instances: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WAFInstance",
      },
    ],
    metadata: {
      createdBy: String,
      version: { type: Number, default: 1 },
      tags: [String],
    },
  },
  { timestamps: true }
);

// Generate policy ID
policySchema.pre("save", function (next) {
  if (!this.policyId) {
    this.policyId = "POL-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Indexes
policySchema.index({ policyId: 1 });
policySchema.index({ template: 1 });
policySchema.index({ isActive: 1 });

module.exports = mongoose.model("Policy", policySchema);
