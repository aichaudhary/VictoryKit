const mongoose = require('mongoose');

const baaSchema = new mongoose.Schema({
  baaId: { type: String, required: true, unique: true },
  businessAssociateName: { type: String, required: true },
  contactPerson: String,
  contactEmail: String,
  contactPhone: String,
  agreementType: { type: String, enum: ['business_associate', 'subcontractor'], required: true },
  services: [String],
  phiAccess: { type: String, enum: ['full', 'limited', 'none'], required: true },
  signedDate: Date,
  effectiveDate: Date,
  expirationDate: Date,
  status: {
    type: String,
    enum: ['draft', 'pending_signature', 'active', 'expired', 'terminated'],
    default: 'draft'
  },
  renewalDate: Date,
  lastAuditDate: Date,
  nextAuditDate: Date,
  complianceScore: { type: Number, min: 0, max: 100 },
  documents: [{
    name: String,
    url: String,
    uploadDate: Date
  }],
  violations: [{
    date: Date,
    description: String,
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    resolved: Boolean
  }]
}, { timestamps: true });

baaSchema.index({ baaId: 1 });
baaSchema.index({ businessAssociateName: 1 });
baaSchema.index({ status: 1 });
baaSchema.index({ expirationDate: 1 });

module.exports = mongoose.model('BAA', baaSchema);
