/**
 * Challenge Model - Bot verification challenges
 */

const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    challengeId: {
      type: String,
      unique: true,
      default: () =>
        `CHL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "captcha", // Traditional CAPTCHA
        "recaptcha", // Google reCAPTCHA
        "hcaptcha", // hCaptcha
        "invisible", // Background challenge
        "javascript", // JS execution test
        "cookie", // Cookie support test
        "proof_of_work", // Computational challenge
        "fingerprint", // Browser fingerprinting
        "behavioral", // Mouse/keyboard analysis
        "custom",
      ],
      required: true,
    },
    configuration: {
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
      timeout: {
        type: Number,
        default: 60, // seconds
      },
      maxAttempts: {
        type: Number,
        default: 3,
      },
      parameters: mongoose.Schema.Types.Mixed,
    },
    triggers: {
      conditions: [
        {
          field: String,
          operator: {
            type: String,
            enum: [
              "equals",
              "contains",
              "greater_than",
              "less_than",
              "matches",
            ],
          },
          value: mongoose.Schema.Types.Mixed,
        },
      ],
      botScore: {
        min: Number,
        max: Number,
      },
      paths: [String],
      countries: [String],
      rateLimitExceeded: Boolean,
    },
    styling: {
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "auto",
      },
      customCss: String,
      logo: String,
      message: String,
    },
    fallback: {
      onFail: {
        type: String,
        enum: ["block", "rate_limit", "escalate", "log"],
        default: "block",
      },
      redirectUrl: String,
    },
    statistics: {
      issued: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      expired: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "testing"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
challengeSchema.index({ type: 1 });
challengeSchema.index({ status: 1 });

module.exports = mongoose.model("Challenge", challengeSchema);
