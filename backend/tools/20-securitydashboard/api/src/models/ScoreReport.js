const mongoose = require('mongoose');

const scoreReportSchema = new mongoose.Schema({
  reportId: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['executive_summary', 'technical_detailed', 'compliance_report', 'trend_analysis', 'benchmark_comparison', 'improvement_tracking'], required: true, index: true },
  
  scope: {
    entityType: String,
    entityId: String,
    entityName: String,
    securityScores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SecurityDashboard' }],
    dateRange: { from: Date, to: Date },
    categories: [String],
    frameworks: [String]
  },
  
  executiveSummary: {
    overallScore: Number,
    grade: String,
    trend: String,
    scoreChange: Number,
    keyFindings: [String],
    topRisks: [{ title: String, severity: String }],
    recommendations: [{ priority: String, title: String, impact: Number }]
  },
  
  statistics: {
    scores: { current: Number, previous: Number, change: Number, highest: Number, lowest: Number },
    categories: { network: Number, endpoint: Number, identity: Number, data: Number, application: Number, cloud: Number, compliance: Number },
    risks: { critical: Number, high: Number, medium: Number, low: Number, total: Number },
    vulnerabilities: { critical: Number, high: Number, medium: Number, low: Number, total: Number },
    improvements: { total: Number, completed: Number, inProgress: Number },
    compliance: { frameworks: [{ name: String, score: Number, status: String }], overallCompliance: Number }
  },
  
  trendAnalysis: {
    period: String,
    dataPoints: [{ date: Date, score: Number, grade: String }],
    forecast: [{ date: Date, predictedScore: Number }],
    insights: [String]
  },
  
  benchmarkComparison: {
    benchmarks: [{ benchmarkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Benchmark' }, name: String, score: Number, percentile: Number }],
    industryAverage: Number,
    peerAverage: Number,
    ranking: { position: Number, total: Number }
  },
  
  detailedFindings: [{ category: String, title: String, severity: String, description: String, recommendation: String }],
  metrics: [{ metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' }, name: String, currentValue: Number, score: Number }],
  assessments: [{ assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' }, name: String, date: Date, score: Number }],
  improvements: [{ improvementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Improvement' }, title: String, priority: String, status: String }],
  controls: [{ controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' }, name: String, implementationStatus: String }],
  
  visualizations: [{ type: String, title: String, data: mongoose.Schema.Types.Mixed }],
  
  generation: {
    generatedBy: { userId: String, name: String, email: String },
    generatedDate: { type: Date, default: Date.now, index: true },
    method: String,
    processingTime: Number
  },
  
  distribution: {
    recipients: [{ name: String, email: String, sentDate: Date, opened: Boolean }],
    sharedWith: [{ userId: String, name: String }]
  },
  
  exports: [{ format: String, filename: String, url: String, size: Number, generatedDate: Date }],
  
  schedule: {
    isRecurring: Boolean,
    frequency: String,
    nextGeneration: Date,
    autoDistribute: Boolean
  },
  
  metadata: {
    confidentiality: { type: String, default: 'confidential' },
    tags: [String],
    createdBy: { name: String, email: String },
    version: { type: Number, default: 1 }
  },
  
  status: { type: String, enum: ['draft', 'generating', 'completed', 'distributed', 'archived'], default: 'draft', index: true }
}, {
  timestamps: true,
  collection: 'scorereports'
});

scoreReportSchema.index({ reportId: 1 });
scoreReportSchema.index({ type: 1, status: 1 });

scoreReportSchema.pre('save', function(next) {
  if (!this.reportId) {
    this.reportId = 'RPT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

scoreReportSchema.methods.generateExecutiveSummary = function() {
  const { scores, risks } = this.statistics;
  this.executiveSummary.overallScore = scores.current;
  this.executiveSummary.scoreChange = scores.change;
  this.executiveSummary.trend = scores.change > 5 ? 'improving' : scores.change < -5 ? 'declining' : 'stable';
};

scoreReportSchema.methods.addExport = function(format, filename, url, size) {
  this.exports.push({ format, filename, url, size, generatedDate: new Date() });
};

scoreReportSchema.statics.findRecent = function(limit = 10) {
  return this.find({ status: { $in: ['completed', 'distributed'] } }).sort({ 'generation.generatedDate': -1 }).limit(limit).exec();
};

scoreReportSchema.statics.findByType = function(type) {
  return this.find({ type, status: { $ne: 'archived' } }).sort({ 'generation.generatedDate': -1 }).exec();
};

scoreReportSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    { $match: { status: { $in: ['completed', 'distributed'] } } },
    { $group: { _id: '$type', count: { $sum: 1 }, avgScore: { $avg: '$executiveSummary.overallScore' } } }
  ]);
};

module.exports = mongoose.model('ScoreReport', scoreReportSchema);
