/**
 * Rule Model
 * IDS/IPS detection rules
 */

const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema(
  {
    sid: {
      type: Number,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      enum: [
        "exploit",
        "malware",
        "policy",
        "suspicious",
        "trojan",
        "dos",
        "scan",
        "shellcode",
        "sql_injection",
        "xss",
        "web_attack",
        "custom",
      ],
      default: "custom",
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "medium",
    },
    action: {
      type: String,
      enum: ["alert", "drop", "reject", "pass", "log"],
      default: "alert",
    },
    protocol: {
      type: String,
      enum: ["tcp", "udp", "icmp", "ip", "http", "dns", "any"],
      default: "any",
    },
    source: {
      address: { type: String, default: "any" },
      port: { type: String, default: "any" },
    },
    destination: {
      address: { type: String, default: "any" },
      port: { type: String, default: "any" },
    },
    direction: {
      type: String,
      enum: ["->", "<->", "<>"],
      default: "->",
    },
    options: {
      content: [String],
      pcre: [String],
      flow: String,
      threshold: {
        type: String,
        track: String,
        count: Number,
        seconds: Number,
      },
      reference: [String],
      classtype: String,
      metadata: mongoose.Schema.Types.Mixed,
    },
    ruleText: String,
    source: {
      type: String,
      enum: ["builtin", "community", "emerging_threats", "custom"],
      default: "custom",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    hitCount: {
      type: Number,
      default: 0,
    },
    lastHit: Date,
    performance: {
      averageProcessingTime: Number,
      falsePositiveRate: Number,
    },
  },
  {
    timestamps: true,
  }
);

RuleSchema.index({ sid: 1 });
RuleSchema.index({ category: 1, enabled: 1 });
RuleSchema.index({ severity: 1 });

module.exports = mongoose.model("Rule", RuleSchema);
