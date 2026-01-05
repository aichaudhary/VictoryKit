const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  contactId: { type: String, required: true, unique: true },
  
  // Personal Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  displayName: { type: String },
  title: { type: String },
  department: { type: String },
  
  // Contact Details
  email: { type: String, required: true },
  emailSecondary: { type: String },
  phone: { type: String },
  phoneSecondary: { type: String },
  mobile: { type: String },
  pager: { type: String },
  
  // Communication Preferences
  preferredContact: { type: String, enum: ['email', 'phone', 'mobile', 'sms', 'slack', 'teams'], default: 'email' },
  slackHandle: { type: String },
  teamsId: { type: String },
  pagerDutyId: { type: String },
  
  // Role in DR
  drRole: {
    type: String,
    enum: ['incident-commander', 'technical-lead', 'communications-lead', 'operations-lead', 
           'business-owner', 'system-owner', 'vendor-contact', 'executive', 'team-member', 'observer'],
    default: 'team-member'
  },
  responsibilities: [{ type: String }],
  skills: [{ type: String }],
  certifications: [{ type: String }],
  
  // Organization
  organization: { type: String },
  location: {
    office: { type: String },
    city: { type: String },
    country: { type: String },
    timezone: { type: String }
  },
  
  // Availability
  availability: {
    workingHours: {
      start: { type: String }, // "09:00"
      end: { type: String }, // "17:00"
      timezone: { type: String }
    },
    onCallSchedule: { type: String },
    vacationDates: [{
      start: { type: Date },
      end: { type: Date }
    }],
    isCurrentlyAvailable: { type: Boolean, default: true }
  },
  
  // Escalation
  escalationLevel: { type: Number, default: 1 }, // 1 = first contact, 2 = escalation, etc.
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  backup: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  
  // Teams/Groups
  teams: [{ type: String }],
  notificationGroups: [{ type: String }],
  
  // Associated Resources
  assignedSystems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'System' }],
  assignedSites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecoverySite' }],
  assignedPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryPlan' }],
  
  // Vendor Info (for external contacts)
  isVendor: { type: Boolean, default: false },
  vendorInfo: {
    company: { type: String },
    contractId: { type: String },
    supportTier: { type: String },
    supportHours: { type: String },
    escalationProcess: { type: String }
  },
  
  // Training & Compliance
  training: {
    lastDRTraining: { type: Date },
    nextDRTraining: { type: Date },
    trainingCompleted: [{ type: String }],
    certificationsExpiry: [{
      name: { type: String },
      expiryDate: { type: Date }
    }]
  },
  
  // Communication History
  lastContacted: { type: Date },
  contactHistory: [{
    date: { type: Date },
    type: { type: String },
    purpose: { type: String },
    notes: { type: String }
  }],
  
  // Status
  status: { type: String, enum: ['active', 'inactive', 'on-leave', 'terminated'], default: 'active' },
  
  // Metadata
  tags: [{ type: String }],
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
contactSchema.index({ contactId: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ drRole: 1, status: 1 });
contactSchema.index({ department: 1 });
contactSchema.index({ teams: 1 });

module.exports = mongoose.model('Contact', contactSchema);
