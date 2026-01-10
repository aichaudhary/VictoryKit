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
    type: {
      type: String,
      enum: [
        "security",
        "rate_limiting",
        "validation",
        "transformation",
        "governance",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "authentication",
        "authorization",
        "input_validation",
        "output_filtering",
        "encryption",
        "logging",
        "cors",
        "caching",
      ],
    },
    rules: [
      {
        name: String,
        condition: mongoose.Schema.Types.Mixed,
        action: {
          type: {
            type: String,
            enum: ["allow", "deny", "transform", "log", "alert"],
          },
          parameters: mongoose.Schema.Types.Mixed,
        },
        priority: Number,
      },
    ],
    scope: {
      global: { type: Boolean, default: false },
      apis: [{ type: mongoose.Schema.Types.ObjectId, ref: "API" }],
      endpoints: [{ type: mongoose.Schema.Types.ObjectId, ref: "Endpoint" }],
    },
    enforcement: {
      mode: {
        type: String,
        enum: ["enforce", "monitor", "disabled"],
        default: "enforce",
      },
      failAction: {
        type: String,
        enum: ["deny", "allow_log", "alert"],
        default: "deny",
      },
    },
    validation: {
      schemaEnforcement: Boolean,
      requiredFields: Boolean,
      typeChecking: Boolean,
      regexPatterns: mongoose.Schema.Types.Mixed,
    },
    securityHeaders: {
      cors: mongoose.Schema.Types.Mixed,
      contentSecurityPolicy: String,
      xFrameOptions: String,
      xContentTypeOptions: Boolean,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    effectiveFrom: Date,
    effectiveUntil: Date,
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
policySchema.index({ type: 1 });
policySchema.index({ isActive: 1 });

module.exports = mongoose.model("Policy", policySchema);
