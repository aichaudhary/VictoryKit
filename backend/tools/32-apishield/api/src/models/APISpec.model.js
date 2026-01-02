const mongoose = require('mongoose');

const apiSpecSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true
  },
  version: String,
  description: String,
  
  // Spec Type
  specType: {
    type: String,
    enum: ['openapi-3.0', 'openapi-3.1', 'swagger-2.0', 'graphql', 'grpc', 'soap', 'custom'],
    required: true
  },
  specFormat: {
    type: String,
    enum: ['json', 'yaml', 'sdl', 'proto', 'wsdl'],
    default: 'json'
  },

  // Source
  source: {
    type: {
      type: String,
      enum: ['upload', 'url', 'discovered', 'manual']
    },
    url: String,
    lastFetchedAt: Date,
    autoRefresh: { type: Boolean, default: false },
    refreshInterval: Number // in hours
  },

  // Raw Spec Content
  rawSpec: mongoose.Schema.Types.Mixed,
  specHash: String, // For change detection

  // Server Info
  servers: [{
    url: String,
    description: String,
    environment: {
      type: String,
      enum: ['production', 'staging', 'development', 'testing']
    }
  }],
  baseUrl: String,

  // Parsed Info
  endpointCount: { type: Number, default: 0 },
  operationCount: { type: Number, default: 0 },
  schemaCount: { type: Number, default: 0 },

  // Security Schemes
  securitySchemes: [{
    name: String,
    type: {
      type: String,
      enum: ['apiKey', 'http', 'oauth2', 'openIdConnect', 'mutualTLS']
    },
    scheme: String,
    bearerFormat: String,
    in: String,
    flows: mongoose.Schema.Types.Mixed
  }],

  // Tags
  tags: [{
    name: String,
    description: String,
    endpointCount: Number
  }],

  // GraphQL Specific
  graphql: {
    queries: [String],
    mutations: [String],
    subscriptions: [String],
    types: [String],
    introspectionEnabled: Boolean
  },

  // Security Analysis
  securityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  lastScanned: Date,
  totalVulnerabilities: { type: Number, default: 0 },
  
  // Issues Found in Spec
  specIssues: [{
    type: {
      type: String,
      enum: ['missing-auth', 'missing-rate-limit', 'sensitive-data', 'deprecated', 'missing-validation', 'other']
    },
    severity: String,
    path: String,
    message: String
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'draft', 'deprecated'],
    default: 'active'
  },
  isPublic: { type: Boolean, default: false },

  // Metadata
  owner: String,
  team: String,
  contact: {
    name: String,
    email: String,
    url: String
  },
  license: String,
  externalDocs: {
    description: String,
    url: String
  }

}, {
  timestamps: true
});

// Indexes
apiSpecSchema.index({ name: 1, version: 1 });
apiSpecSchema.index({ status: 1 });
apiSpecSchema.index({ specType: 1 });

module.exports = mongoose.model('APISpec', apiSpecSchema);
