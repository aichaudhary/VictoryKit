const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
  // Basic Info
  specId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'APISpec',
    index: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    required: true
  },
  path: {
    type: String,
    required: true
  },
  fullUrl: String,
  operationId: String,
  summary: String,
  description: String,
  tags: [String],

  // Parameters
  parameters: [{
    name: String,
    in: {
      type: String,
      enum: ['query', 'header', 'path', 'cookie', 'body']
    },
    required: Boolean,
    type: String,
    format: String,
    example: mongoose.Schema.Types.Mixed,
    schema: mongoose.Schema.Types.Mixed
  }],

  // Request Body
  requestBody: {
    contentType: String,
    schema: mongoose.Schema.Types.Mixed,
    required: Boolean,
    example: mongoose.Schema.Types.Mixed
  },

  // Responses
  responses: [{
    statusCode: String,
    description: String,
    contentType: String,
    schema: mongoose.Schema.Types.Mixed
  }],

  // Security
  security: [{
    type: {
      type: String,
      enum: ['apiKey', 'bearer', 'oauth2', 'openIdConnect', 'basic', 'none']
    },
    name: String,
    in: String,
    flows: mongoose.Schema.Types.Mixed,
    scopes: [String]
  }],
  requiresAuth: {
    type: Boolean,
    default: false
  },

  // Security Status
  securityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info', 'unknown'],
    default: 'unknown'
  },
  vulnerabilityCount: {
    type: Number,
    default: 0
  },
  lastScanned: Date,

  // Metadata
  deprecated: {
    type: Boolean,
    default: false
  },
  internalOnly: {
    type: Boolean,
    default: false
  },
  rateLimited: {
    type: Boolean,
    default: null
  },
  rateLimit: {
    requests: Number,
    period: String
  },

  // Discovery
  discoveredAt: {
    type: Date,
    default: Date.now
  },
  discoveryMethod: {
    type: String,
    enum: ['spec', 'crawl', 'manual', 'traffic'],
    default: 'spec'
  }
}, {
  timestamps: true
});

// Compound index for unique endpoints
endpointSchema.index({ specId: 1, method: 1, path: 1 }, { unique: true });
endpointSchema.index({ riskLevel: 1, vulnerabilityCount: -1 });

module.exports = mongoose.model('APIEndpoint', endpointSchema);
