const mongoose = require("mongoose");

const endpointSchema = new mongoose.Schema(
  {
    endpointId: {
      type: String,
      unique: true,
    },
    apiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "API",
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      required: true,
    },
    description: String,
    parameters: [
      {
        name: String,
        location: { type: String, enum: ["path", "query", "header", "body"] },
        type: String,
        required: Boolean,
        validation: mongoose.Schema.Types.Mixed,
      },
    ],
    requestBody: {
      contentType: String,
      schema: mongoose.Schema.Types.Mixed,
      required: Boolean,
    },
    responses: [
      {
        statusCode: Number,
        description: String,
        schema: mongoose.Schema.Types.Mixed,
      },
    ],
    security: {
      authentication: Boolean,
      authorization: [String],
      scopes: [String],
    },
    validation: {
      input: { type: Boolean, default: true },
      output: { type: Boolean, default: false },
      strictMode: { type: Boolean, default: false },
    },
    rateLimit: {
      override: Boolean,
      requests: Number,
      period: String,
    },
    vulnerabilities: [
      {
        type: String,
        severity: {
          type: String,
          enum: ["critical", "high", "medium", "low", "info"],
        },
        description: String,
        remediation: String,
        detectedAt: Date,
      },
    ],
    statistics: {
      totalCalls: { type: Number, default: 0 },
      successRate: { type: Number, default: 100 },
      avgLatency: { type: Number, default: 0 },
      lastCalled: Date,
    },
    isDeprecated: {
      type: Boolean,
      default: false,
    },
    deprecationDate: Date,
  },
  { timestamps: true }
);

// Generate endpoint ID
endpointSchema.pre("save", function (next) {
  if (!this.endpointId) {
    this.endpointId = "END-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Indexes
endpointSchema.index({ endpointId: 1 });
endpointSchema.index({ apiId: 1 });
endpointSchema.index({ path: 1, method: 1 });

module.exports = mongoose.model("Endpoint", endpointSchema);
