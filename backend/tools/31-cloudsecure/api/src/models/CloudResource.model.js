const mongoose = require('mongoose');

const cloudResourceSchema = new mongoose.Schema({
  // Resource identification
  resourceId: {
    type: String,
    required: true,
    index: true
  },
  resourceArn: {
    type: String,
    index: true
  },
  resourceName: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: [
      // AWS
      'aws:ec2:instance', 'aws:s3:bucket', 'aws:rds:instance', 'aws:lambda:function',
      'aws:iam:role', 'aws:iam:user', 'aws:iam:policy', 'aws:vpc:vpc',
      'aws:vpc:security-group', 'aws:cloudtrail:trail', 'aws:kms:key',
      'aws:eks:cluster', 'aws:ecs:cluster', 'aws:elb:load-balancer',
      // Azure
      'azure:compute:vm', 'azure:storage:account', 'azure:sql:database',
      'azure:network:vnet', 'azure:network:nsg', 'azure:keyvault:vault',
      'azure:aks:cluster', 'azure:webapp:app', 'azure:functions:app',
      // GCP
      'gcp:compute:instance', 'gcp:storage:bucket', 'gcp:sql:instance',
      'gcp:gke:cluster', 'gcp:iam:serviceaccount', 'gcp:network:firewall',
      'gcp:functions:function', 'gcp:run:service',
      // Generic
      'container', 'kubernetes:pod', 'kubernetes:deployment', 'kubernetes:service'
    ]
  },
  
  // Provider info
  provider: {
    type: String,
    required: true,
    enum: ['aws', 'azure', 'gcp', 'kubernetes', 'multi-cloud']
  },
  region: String,
  accountId: String,
  subscriptionId: String,
  projectId: String,
  
  // Tags and metadata
  tags: [{
    key: String,
    value: String
  }],
  metadata: mongoose.Schema.Types.Mixed,
  
  // Configuration snapshot
  configuration: mongoose.Schema.Types.Mixed,
  configurationHash: String,
  
  // Security status
  securityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'info'
  },
  isCompliant: {
    type: Boolean,
    default: true
  },
  
  // Relationships
  relatedResources: [{
    resourceId: String,
    relationshipType: String // 'attached-to', 'uses', 'exposes', 'protected-by'
  }],
  
  // Scan tracking
  lastScannedAt: Date,
  discoveredAt: {
    type: Date,
    default: Date.now
  },
  
  // Organization
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  }
}, {
  timestamps: true,
  collection: 'cloud_resources'
});

// Indexes
cloudResourceSchema.index({ provider: 1, resourceType: 1 });
cloudResourceSchema.index({ securityScore: 1 });
cloudResourceSchema.index({ riskLevel: 1 });
cloudResourceSchema.index({ lastScannedAt: 1 });

module.exports = mongoose.model('CloudResource', cloudResourceSchema);
