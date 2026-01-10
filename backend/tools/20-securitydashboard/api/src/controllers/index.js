const {
  SecurityDashboard,
  ScoreMetric,
  Assessment,
  Benchmark,
  Improvement,
  Control,
  Framework,
  ScoreReport
} = require('../models');

/**
 * SecurityDashboard Tool - Unified Controllers
 * 
 * Comprehensive API endpoints for security posture scoring platform
 * Total: 42 endpoints across 9 feature groups
 */

// ========== System & Dashboard (2 endpoints) ==========

/**
 * GET /api/securitydashboard/status
 * Health check
 */
exports.getStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      service: 'SecurityDashboard API',
      version: '1.0.0',
      timestamp: new Date(),
      status: 'operational'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/securitydashboard/dashboard
 * Dashboard overview with aggregated statistics
 */
exports.getDashboard = async (req, res) => {
  try {
    const [scores, metrics, assessments, improvements] = await Promise.all([
      SecurityDashboard.getStatistics(),
      ScoreMetric.getStatistics(),
      Assessment.getStatistics(),
      Improvement.getStatistics()
    ]);
    
    const topPerformers = await SecurityDashboard.findTopPerformers(5);
    const criticalMetrics = await ScoreMetric.findCritical();
    const recentAssessments = await Assessment.findRecent(5);
    const highPriorityImprovements = await Improvement.findHighPriority();
    
    res.status(200).json({
      success: true,
      data: {
        statistics: { scores, metrics, assessments, improvements },
        topPerformers,
        criticalMetrics,
        recentAssessments,
        highPriorityImprovements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== Security Score Management (8 endpoints) ==========

exports.createSecurityDashboard = async (req, res) => {
  try {
    const score = new SecurityDashboard(req.body);
    score.calculateOverallScore();
    await score.save();
    res.status(201).json({ success: true, data: score });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSecurityDashboards = async (req, res) => {
  try {
    const { entityType, status, minScore, maxScore, page = 1, limit = 20 } = req.query;
    const query = {};
    if (entityType) query['entity.type'] = entityType;
    if (status) query.status = status;
    if (minScore || maxScore) {
      query['overallScore.value'] = {};
      if (minScore) query['overallScore.value'].$gte = Number(minScore);
      if (maxScore) query['overallScore.value'].$lte = Number(maxScore);
    }
    
    const scores = await SecurityDashboard.find(query)
      .populate('improvements.improvementId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ 'overallScore.value': -1 });
    
    const total = await SecurityDashboard.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: scores,
      pagination: { page: Number(page), limit: Number(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSecurityDashboardById = async (req, res) => {
  try {
    const score = await SecurityDashboard.findById(req.params.id)
      .populate('improvements.improvementId')
      .populate('benchmarks.benchmarkId');
    if (!score) return res.status(404).json({ success: false, error: 'Score not found' });
    res.status(200).json({ success: true, data: score });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSecurityDashboard = async (req, res) => {
  try {
    const score = await SecurityDashboard.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!score) return res.status(404).json({ success: false, error: 'Score not found' });
    score.calculateOverallScore();
    await score.save();
    res.status(200).json({ success: true, data: score });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteSecurityDashboard = async (req, res) => {
  try {
    const score = await SecurityDashboard.findByIdAndDelete(req.params.id);
    if (!score) return res.status(404).json({ success: false, error: 'Score not found' });
    res.status(200).json({ success: true, message: 'Score deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.calculateScore = async (req, res) => {
  try {
    const score = await SecurityDashboard.findById(req.params.id);
    if (!score) return res.status(404).json({ success: false, error: 'Score not found' });
    score.calculateOverallScore();
    score.addHistoryEntry();
    score.calculateTrend();
    await score.save();
    res.status(200).json({ success: true, data: score });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getScoreHistory = async (req, res) => {
  try {
    const score = await SecurityDashboard.findById(req.params.id).select('history');
    if (!score) return res.status(404).json({ success: false, error: 'Score not found' });
    res.status(200).json({ success: true, data: score.history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTopPerformers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const scores = await SecurityDashboard.findTopPerformers(limit);
    res.status(200).json({ success: true, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== Metric Management (6 endpoints) ==========

exports.createMetric = async (req, res) => {
  try {
    const metric = new ScoreMetric(req.body);
    await metric.save();
    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query['score.status'] = status;
    
    const metrics = await ScoreMetric.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ 'metadata.displayOrder': 1 });
    
    const total = await ScoreMetric.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: metrics,
      pagination: { page: Number(page), limit: Number(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMetricById = async (req, res) => {
  try {
    const metric = await ScoreMetric.findById(req.params.id);
    if (!metric) return res.status(404).json({ success: false, error: 'Metric not found' });
    res.status(200).json({ success: true, data: metric });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateMetricValue = async (req, res) => {
  try {
    const metric = await ScoreMetric.findById(req.params.id);
    if (!metric) return res.status(404).json({ success: false, error: 'Metric not found' });
    metric.updateValue(req.body.value, req.body.source || 'manual');
    await metric.save();
    res.status(200).json({ success: true, data: metric });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getCriticalMetrics = async (req, res) => {
  try {
    const metrics = await ScoreMetric.findCritical();
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMetricsByCategory = async (req, res) => {
  try {
    const metrics = await ScoreMetric.findByCategory(req.params.category);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== Assessment Management (6 endpoints) ==========

exports.createAssessment = async (req, res) => {
  try {
    const assessment = new Assessment(req.body);
    await assessment.save();
    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAssessments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    const assessments = await Assessment.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ 'schedule.startDate': -1 });
    
    const total = await Assessment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: assessments,
      pagination: { page: Number(page), limit: Number(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('scopeDetails.controls.controlId');
    if (!assessment) return res.status(404).json({ success: false, error: 'Assessment not found' });
    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assessment) return res.status(404).json({ success: false, error: 'Assessment not found' });
    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.completeAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, error: 'Assessment not found' });
    assessment.complete();
    await assessment.save();
    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getRecentAssessments = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const assessments = await Assessment.findRecent(limit);
    res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== Benchmark Management (4 endpoints) ==========

exports.createBenchmark = async (req, res) => {
  try {
    const benchmark = new Benchmark(req.body);
    await benchmark.save();
    res.status(201).json({ success: true, data: benchmark });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getBenchmarks = async (req, res) => {
  try {
    const { type, industry, size } = req.query;
    const benchmarks = await Benchmark.findActive(type, industry, size);
    res.status(200).json({ success: true, data: benchmarks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBenchmarkById = async (req, res) => {
  try {
    const benchmark = await Benchmark.findById(req.params.id);
    if (!benchmark) return res.status(404).json({ success: false, error: 'Benchmark not found' });
    res.status(200).json({ success: true, data: benchmark });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.compareToBenchmark = async (req, res) => {
  try {
    const { scoreId, benchmarkId } = req.params;
    const [score, benchmark] = await Promise.all([
      SecurityDashboard.findById(scoreId),
      Benchmark.findById(benchmarkId)
    ]);
    
    if (!score || !benchmark) {
      return res.status(404).json({ success: false, error: 'Score or benchmark not found' });
    }
    
    const comparison = benchmark.compareScore(score.overallScore.value);
    res.status(200).json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== Improvement Management (5 endpoints) ==========

exports.createImprovement = async (req, res) => {
  try {
    const improvement = new Improvement(req.body);
    await improvement.save();
    res.status(201).json({ success: true, data: improvement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getImprovements = async (req, res) => {
  try {
    const { priority, status, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (category) query.category = category;
    
    const improvements = await Improvement.find(query)
      .populate('relatedEntities.securityScore')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ priority: 1, createdAt: -1 });
    
    const total = await Improvement.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: improvements,
      pagination: { page: Number(page), limit: Number(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getImprovementById = async (req, res) => {
  try {
    const improvement = await Improvement.findById(req.params.id)
      .populate('implementation.dependencies.improvementId');
    if (!improvement) return res.status(404).json({ success: false, error: 'Improvement not found' });
    res.status(200).json({ success: true, data: improvement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateImprovementProgress = async (req, res) => {
  try {
    const improvement = await Improvement.findById(req.params.id);
    if (!improvement) return res.status(404).json({ success: false, error: 'Improvement not found' });
    improvement.updateProgress(req.body.percentage, req.body.description, req.body.updatedBy);
    await improvement.save();
    res.status(200).json({ success: true, data: improvement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.approveImprovement = async (req, res) => {
  try {
    const improvement = await Improvement.findById(req.params.id);
    if (!improvement) return res.status(404).json({ success: false, error: 'Improvement not found' });
    improvement.approve(req.body.approverEmail, req.body.comments);
    await improvement.save();
    res.status(200).json({ success: true, data: improvement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========== Control Management (5 endpoints) ==========

exports.createControl = async (req, res) => {
  try {
    const control = new Control(req.body);
    await control.save();
    res.status(201).json({ success: true, data: control });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getControls = async (req, res) => {
  try {
    const { category, status, framework, page = 1, limit = 50 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query['implementation.status'] = status;
    if (framework) query['framework.primary'] = framework;
    
    const controls = await Control.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ category: 1 });
    
    const total = await Control.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: controls,
      pagination: { page: Number(page), limit: Number(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getControlById = async (req, res) => {
  try {
    const control = await Control.findById(req.params.id)
      .populate('dependencies.prerequisites.controlId');
    if (!control) return res.status(404).json({ success: false, error: 'Control not found' });
    res.status(200).json({ success: true, data: control });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateControlImplementation = async (req, res) => {
  try {
    const control = await Control.findById(req.params.id);
    if (!control) return res.status(404).json({ success: false, error: 'Control not found' });
    control.updateImplementation(req.body.status, req.body.percentage);
    await control.save();
    res.status(200).json({ success: true, data: control });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.recordControlTest = async (req, res) => {
  try {
    const control = await Control.findById(req.params.id);
    if (!control) return res.status(404).json({ success: false, error: 'Control not found' });
    control.recordTest(req.body.result, req.body.tester, req.body.findings, req.body.evidence);
    await control.save();
    res.status(200).json({ success: true, data: control });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========== Framework Management (4 endpoints) ==========

exports.createFramework = async (req, res) => {
  try {
    const framework = new Framework(req.body);
    await framework.save();
    res.status(201).json({ success: true, data: framework });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getFrameworks = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const frameworks = await Framework.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, data: frameworks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFrameworkById = async (req, res) => {
  try {
    const framework = await Framework.findById(req.params.id)
      .populate('controls.controlId')
      .populate('assessments.assessmentId');
    if (!framework) return res.status(404).json({ success: false, error: 'Framework not found' });
    res.status(200).json({ success: true, data: framework });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateFrameworkCompliance = async (req, res) => {
  try {
    const framework = await Framework.findById(req.params.id);
    if (!framework) return res.status(404).json({ success: false, error: 'Framework not found' });
    framework.updateComplianceSummary();
    await framework.save();
    res.status(200).json({ success: true, data: framework });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========== Report Management (4 endpoints) ==========

exports.generateReport = async (req, res) => {
  try {
    const report = new ScoreReport(req.body);
    report.generateExecutiveSummary();
    report.status = 'generating';
    await report.save();
    
    // Simulate report generation (would be async in production)
    setTimeout(async () => {
      report.status = 'completed';
      await report.save();
    }, 1000);
    
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    const reports = await ScoreReport.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ 'generation.generatedDate': -1 });
    
    const total = await ScoreReport.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: reports,
      pagination: { page: Number(page), limit: Number(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await ScoreReport.findById(req.params.id)
      .populate('scope.securityScores')
      .populate('benchmarkComparison.benchmarks.benchmarkId');
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.distributeReport = async (req, res) => {
  try {
    const report = await ScoreReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    report.distribute(req.body.recipients);
    await report.save();
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = exports;
