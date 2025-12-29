const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema(
  {
    ruleId: {
      type: String,
      unique: true,
    },
    instanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WAFInstance",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["managed", "custom", "rate_limit", "geo_block", "ip_set"],
      default: "custom",
    },
    category: {
      type: String,
      enum: [
        "owasp",
        "bot",
        "sqli",
        "xss",
        "rce",
        "lfi",
        "custom",
        "rate",
        "geo",
      ],
      default: "custom",
    },
    priority: {
      type: Number,
      default: 100,
    },
    action: {
      type: String,
      enum: ["block", "allow", "count", "captcha", "challenge"],
      default: "block",
    },
    conditions: [
      {
        field: {
          type: String,
          enum: [
            "uri",
            "query_string",
            "headers",
            "body",
            "method",
            "ip",
            "country",
          ],
        },
        operator: {
          type: String,
          enum: [
            "contains",
            "exactly",
            "starts_with",
            "ends_with",
            "regex",
            "ip_set",
          ],
        },
        value: String,
        negated: { type: Boolean, default: false },
        transforms: [
          {
            type: String,
            enum: [
              "lowercase",
              "url_decode",
              "html_entity_decode",
              "base64_decode",
            ],
          },
        ],
      },
    ],
    rateLimit: {
      enabled: { type: Boolean, default: false },
      limit: Number,
      period: Number,
      aggregateKey: { type: String, enum: ["ip", "header", "cookie", "query"] },
    },
    ipSet: [String],
    geoBlock: [String],
    exceptions: [
      {
        type: { type: String },
        value: String,
        reason: String,
      },
    ],
    enabled: {
      type: Boolean,
      default: true,
    },
    deployed: {
      type: Boolean,
      default: false,
    },
    statistics: {
      hits: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      lastTriggered: Date,
    },
    metadata: {
      createdBy: String,
      source: String,
      version: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

// Generate rule ID
ruleSchema.pre("save", function (next) {
  if (!this.ruleId) {
    this.ruleId = "RUL-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Indexes
ruleSchema.index({ ruleId: 1 });
ruleSchema.index({ instanceId: 1 });
ruleSchema.index({ type: 1 });
ruleSchema.index({ category: 1 });
ruleSchema.index({ enabled: 1 });

module.exports = mongoose.model("Rule", ruleSchema);
