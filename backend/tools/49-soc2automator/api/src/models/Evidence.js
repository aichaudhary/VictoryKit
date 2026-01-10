const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true, unique: true },
  requirement: {
    type: String,
    enum: ['req1', 'req2', 'req3', 'req4', 'req5', 'req6', 'req7', 'req8', 'req9', 'req10', 'req11', 'req12'],
    required: true
  },
  subRequirement: String,
  type: {
    type: String,
    enum: ['screenshot', 'document', 'policy', 'log_file', 'config_file', 'scan_result', 'interview', 'observation', 'other'],
    required: true
  },
  title: { type: String, required: true },
  description: String,
  fileUrl: String,
  fileSize: Number,
  mimeType: String,
  hash: String,
  uploadedBy: String,
  validatedBy: String,
  validationDate: Date,
  expiryDate: Date,
  tags: [String],
  metadata: {
    source: String,
    captureDate: Date,
    systemInfo: String,
    additionalNotes: String
  },
  associatedFindings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Finding' }],
  associatedScans: [{ type: String, ref: 'Scan' }]
}, { timestamps: true });

evidenceSchema.index({ evidenceId: 1 });
evidenceSchema.index({ requirement: 1 });
evidenceSchema.index({ type: 1 });
evidenceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Evidence', evidenceSchema);
