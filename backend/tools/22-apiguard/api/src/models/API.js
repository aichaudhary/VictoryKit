const mongoose = require("mongoose");

const apiSchema = new mongoose.Schema(
  {
    apiId: {
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
      enum: ["rest", "graphql", "grpc", "soap", "websocket"],
      default: "rest",
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    baseUrl: {
      type: String,
      required: true,
    },
    specification: {
      format: {
        type: String,
        enum: ["openapi", "swagger", "graphql", "wsdl", "proto"],
      },
      url: String,
      content: mongoose.Schema.Types.Mixed,
    },
    authentication: {
      type: {
        type: String,
        enum: ["none", "api_key", "oauth2", "jwt", "basic", "mtls"],
      },
      location: { type: String, enum: ["header", "query", "cookie"] },
      headerName: String,
    },
    security: {
      score: { type: Number, min: 0, max: 100 },
      grade: { type: String, enum: ["A+", "A", "B", "C", "D", "F"] },
      issues: [
        {
          severity: String,
          category: String,
          description: String,
        },
      ],
      lastScan: Date,
    },
    rateLimit: {
      enabled: { type: Boolean, default: true },
      requests: Number,
      period: String,
    },
    endpoints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Endpoint",
      },
    ],
    policies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Policy",
      },
    ],
    status: {
      type: String,
      enum: ["active", "deprecated", "development", "retired"],
      default: "active",
    },
    metadata: {
      owner: String,
      team: String,
      tags: [String],
      environment: {
        type: String,
        enum: ["production", "staging", "development"],
      },
    },
  },
  { timestamps: true }
);

// Generate API ID
apiSchema.pre("save", function (next) {
  if (!this.apiId) {
    this.apiId = "API-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Indexes
apiSchema.index({ apiId: 1 });
apiSchema.index({ type: 1 });
apiSchema.index({ status: 1 });

module.exports = mongoose.model("API", apiSchema);
