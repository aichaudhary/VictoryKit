/**
 * Traffic Model
 * Network traffic captures and flows
 */

const mongoose = require("mongoose");

const TrafficSchema = new mongoose.Schema(
  {
    network: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Network",
    },
    captureType: {
      type: String,
      enum: ["continuous", "triggered", "scheduled", "manual"],
      default: "continuous",
    },
    flow: {
      sourceIp: String,
      sourcePort: Number,
      destinationIp: String,
      destinationPort: Number,
      protocol: String,
      bytes: Number,
      packets: Number,
      startTime: Date,
      endTime: Date,
      duration: Number,
    },
    metadata: {
      interface: String,
      vlan: Number,
      application: String,
      applicationCategory: String,
    },
    analysis: {
      isAnomaly: { type: Boolean, default: false },
      anomalyScore: Number,
      anomalyType: String,
      threatIndicators: [
        {
          type: String,
          value: String,
          severity: String,
        },
      ],
      classification: String,
      bandwidth: {
        bytesPerSecond: Number,
        packetsPerSecond: Number,
      },
    },
    dpi: {
      applicationLayer: String,
      httpHost: String,
      httpMethod: String,
      httpUri: String,
      sslCommonName: String,
      sslIssuer: String,
      dnsQuery: String,
      dnsResponse: [String],
    },
    stats: {
      retransmissions: Number,
      outOfOrder: Number,
      fragmentedPackets: Number,
    },
  },
  {
    timestamps: true,
  }
);

TrafficSchema.index({ "flow.sourceIp": 1, "flow.destinationIp": 1 });
TrafficSchema.index({ createdAt: -1 });
TrafficSchema.index({ "analysis.isAnomaly": 1 });

module.exports = mongoose.model("Traffic", TrafficSchema);
