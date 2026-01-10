const mongoose = require('mongoose');

const remediationSchema = new mongoose.Schema({
  remediationId: { type: String, required: true, unique: true },
  findingId: { type: String, required: true, ref: 'Finding' },
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'blocked', 'completed', 'cancelled', 'verified'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['p1', 'p2', 'p3', 'p4'],
    required: true
  },
  effort: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  estimatedHours: Number,
  actualHours: Number,
  assignedTo: String,
  team: String,
  startDate: Date,
  dueDate: Date,
  completedDate: Date,
  verifiedDate: Date,
  verifiedBy: String,
  tasks: [{
    taskId: String,
    description: String,
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    assignee: String,
    completedDate: Date
  }],
  dependencies: [String],
  blockers: [{
    description: String,
    reportedDate: Date,
    resolvedDate: Date
  }],
  progress: { type: Number, default: 0, min: 0, max: 100 },
  comments: [{
    author: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  cost: {
    estimated: Number,
    actual: Number,
    currency: { type: String, default: 'USD' }
  }
}, { timestamps: true });

remediationSchema.index({ remediationId: 1 });
remediationSchema.index({ findingId: 1 });
remediationSchema.index({ status: 1 });
remediationSchema.index({ priority: 1 });
remediationSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Remediation', remediationSchema);
