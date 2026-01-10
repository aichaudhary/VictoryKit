const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  activityType: { type: String, required: true },
  riskScore: { type: Number, min: 0, max: 100 },
  description: { type: String },
  flagged: { type: Boolean, default: false }
}, { _id: true });

const userRiskSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  userName: { type: String, required: true },
  email: { type: String, required: true, index: true },
  
  riskScore: {
    current: { type: Number, required: true, min: 0, max: 100, index: true },
    previous: { type: Number, min: 0, max: 100 },
    trend: { type: String, enum: ['improving', 'stable', 'degrading'], default: 'stable' },
    percentChange: { type: Number }
  },
  
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  
  profile: {
    role: { type: String, required: true },
    department: { type: String, required: true, index: true },
    manager: { type: String },
    hireDate: { type: Date },
    location: { type: String },
    employeeType: { type: String, enum: ['full_time', 'contractor', 'vendor', 'temporary'] }
  },
  
  accessProfile: {
    accessLevel: { type: String, enum: ['basic', 'elevated', 'administrative', 'super_admin'], required: true },
    privilegedAccess: { type: Boolean, default: false },
    sensitiveDataAccess: [{ type: String }],
    criticalSystemsAccess: [{ type: String }],
    thirdPartyAccess: { type: Boolean, default: false },
    remoteAccess: { type: Boolean, default: false }
  },
  
  behaviorMetrics: {
    failedLogins: { type: Number, default: 0 },
    suspiciousActivities: { type: Number, default: 0 },
    dataExfiltrationAttempts: { type: Number, default: 0 },
    policyViolations: { type: Number, default: 0 },
    unusualLoginTimes: { type: Number, default: 0 },
    unusualLoginLocations: { type: Number, default: 0 },
    fileDownloadVolume: { type: Number, default: 0 }, // MB per day average
    emailSentVolume: { type: Number, default: 0 } // Emails per day average
  },
  
  securityIncidents: {
    total: { type: Number, default: 0 },
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    lastIncident: { type: Date },
    types: [{ type: String }]
  },
  
  complianceStatus: {
    trainingCompleted: { type: Boolean, default: false },
    lastTrainingDate: { type: Date },
    acknowledgments: [{ type: String }],
    violations: [{
      type: { type: String },
      date: { type: Date },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      resolved: { type: Boolean, default: false }
    }]
  },
  
  recentActivities: [activitySchema],
  
  geographicProfile: {
    primaryLocation: { type: String },
    unusualLocations: [{ type: String }],
    vpnUsage: { type: Number, default: 0 }, // Percentage of logins via VPN
    travelFrequency: { type: String, enum: ['never', 'rare', 'occasional', 'frequent'] }
  },
  
  deviceSecurity: {
    compliantDevices: { type: Number, default: 0 },
    nonCompliantDevices: { type: Number, default: 0 },
    unknownDevices: { type: Number, default: 0 },
    jailbrokenDevices: { type: Number, default: 0 }
  },
  
  riskFactors: [{
    factor: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    weight: { type: Number, min: 0, max: 1 },
    contribution: { type: Number },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
  }],
  
  aiInsights: {
    behaviorBaseline: { type: String },
    anomaliesDetected: [{ type: String }],
    recommendations: [{ type: String }],
    threatProbability: { type: Number, min: 0, max: 100 },
    insiderThreatScore: { type: Number, min: 0, max: 100 }
  },
  
  lastCalculated: { type: Date, default: Date.now },
  nextReassessment: { type: Date }
}, {
  timestamps: true
});

userRiskSchema.index({ 'riskScore.current': -1, 'profile.department': 1 });
userRiskSchema.index({ riskLevel: 1, 'accessProfile.accessLevel': 1 });
userRiskSchema.index({ 'profile.department': 1, 'riskScore.current': -1 });

userRiskSchema.methods.updateRiskScore = async function(newScore) {
  this.riskScore.previous = this.riskScore.current;
  this.riskScore.current = newScore;
  
  if (this.riskScore.previous) {
    const change = newScore - this.riskScore.previous;
    this.riskScore.percentChange = (change / this.riskScore.previous) * 100;
    
    if (change < -5) this.riskScore.trend = 'improving';
    else if (change > 5) this.riskScore.trend = 'degrading';
    else this.riskScore.trend = 'stable';
  }
  
  if (newScore >= 80) this.riskLevel = 'critical';
  else if (newScore >= 60) this.riskLevel = 'high';
  else if (newScore >= 40) this.riskLevel = 'medium';
  else this.riskLevel = 'low';
  
  this.lastCalculated = new Date();
  await this.save();
};

module.exports = mongoose.model('UserRisk', userRiskSchema);
