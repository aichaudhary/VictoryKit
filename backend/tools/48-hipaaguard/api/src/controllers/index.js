const {
  RiskQuantifyment,
  PHIDiscovery,
  Breach,
  BAA,
  Training,
  AccessLog,
  ComplianceReport
} = require('../models');

// ===== Risk Assessment Endpoints =====

exports.createRiskQuantifyment = async (req, res) => {
  try {
    const assessment = new RiskQuantifyment(req.body);
    await assessment.save();
    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRiskQuantifyments = async (req, res) => {
  try {
    const { status, assessmentType, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assessmentType) filter.assessmentType = assessmentType;
    if (startDate || endDate) {
      filter.assessmentDate = {};
      if (startDate) filter.assessmentDate.$gte = new Date(startDate);
      if (endDate) filter.assessmentDate.$lte = new Date(endDate);
    }
    const assessments = await RiskQuantifyment.find(filter).sort({ assessmentDate: -1 });
    res.json({ success: true, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRiskQuantifymentById = async (req, res) => {
  try {
    const assessment = await RiskQuantifyment.findOne({ assessmentId: req.params.id });
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Risk assessment not found' });
    }
    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateRiskQuantifyment = async (req, res) => {
  try {
    const assessment = await RiskQuantifyment.findOneAndUpdate(
      { assessmentId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Risk assessment not found' });
    }
    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteRiskQuantifyment = async (req, res) => {
  try {
    const assessment = await RiskQuantifyment.findOneAndDelete({ assessmentId: req.params.id });
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Risk assessment not found' });
    }
    res.json({ success: true, message: 'Risk assessment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== PHI Discovery Endpoints =====

exports.createPHIScan = async (req, res) => {
  try {
    const scan = new PHIDiscovery(req.body);
    await scan.save();
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPHIScans = async (req, res) => {
  try {
    const { status, scanType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (scanType) filter.scanType = scanType;
    const scans = await PHIDiscovery.find(filter).sort({ scanDate: -1 });
    res.json({ success: true, data: scans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPHIScanById = async (req, res) => {
  try {
    const scan = await PHIDiscovery.findOne({ scanId: req.params.id });
    if (!scan) {
      return res.status(404).json({ success: false, error: 'PHI scan not found' });
    }
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePHIScan = async (req, res) => {
  try {
    const scan = await PHIDiscovery.findOneAndUpdate(
      { scanId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!scan) {
      return res.status(404).json({ success: false, error: 'PHI scan not found' });
    }
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== Breach Management Endpoints =====

exports.createBreach = async (req, res) => {
  try {
    const breach = new Breach(req.body);
    await breach.save();
    res.status(201).json({ success: true, data: breach });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBreaches = async (req, res) => {
  try {
    const { status, severity, breachType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (breachType) filter.breachType = breachType;
    const breaches = await Breach.find(filter).sort({ incidentDate: -1 });
    res.json({ success: true, data: breaches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBreachById = async (req, res) => {
  try {
    const breach = await Breach.findOne({ breachId: req.params.id });
    if (!breach) {
      return res.status(404).json({ success: false, error: 'Breach not found' });
    }
    res.json({ success: true, data: breach });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateBreach = async (req, res) => {
  try {
    const breach = await Breach.findOneAndUpdate(
      { breachId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!breach) {
      return res.status(404).json({ success: false, error: 'Breach not found' });
    }
    res.json({ success: true, data: breach });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBreachStatistics = async (req, res) => {
  try {
    const stats = await Breach.aggregate([
      {
        $group: {
          _id: null,
          totalBreaches: { $sum: 1 },
          totalAffectedIndividuals: { $sum: '$affectedIndividuals' },
          criticalBreaches: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          },
          highBreaches: {
            $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
          },
          unresolvedBreaches: {
            $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);
    res.json({ success: true, data: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== Business Associate Agreement Endpoints =====

exports.createBAA = async (req, res) => {
  try {
    const baa = new BAA(req.body);
    await baa.save();
    res.status(201).json({ success: true, data: baa });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBAAs = async (req, res) => {
  try {
    const { status, agreementType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (agreementType) filter.agreementType = agreementType;
    const baas = await BAA.find(filter).sort({ businessAssociateName: 1 });
    res.json({ success: true, data: baas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBAAById = async (req, res) => {
  try {
    const baa = await BAA.findOne({ baaId: req.params.id });
    if (!baa) {
      return res.status(404).json({ success: false, error: 'BAA not found' });
    }
    res.json({ success: true, data: baa });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateBAA = async (req, res) => {
  try {
    const baa = await BAA.findOneAndUpdate(
      { baaId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!baa) {
      return res.status(404).json({ success: false, error: 'BAA not found' });
    }
    res.json({ success: true, data: baa });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getExpiringBAAs = async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 90;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    const baas = await BAA.find({
      status: 'active',
      expirationDate: { $lte: futureDate }
    }).sort({ expirationDate: 1 });
    
    res.json({ success: true, data: baas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== Training Management Endpoints =====

exports.createTraining = async (req, res) => {
  try {
    const training = new Training(req.body);
    await training.save();
    res.status(201).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTrainings = async (req, res) => {
  try {
    const { status, employeeId, courseType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;
    if (courseType) filter.courseType = courseType;
    const trainings = await Training.find(filter).sort({ trainingDate: -1 });
    res.json({ success: true, data: trainings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTrainingById = async (req, res) => {
  try {
    const training = await Training.findOne({ trainingId: req.params.id });
    if (!training) {
      return res.status(404).json({ success: false, error: 'Training record not found' });
    }
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTraining = async (req, res) => {
  try {
    const training = await Training.findOneAndUpdate(
      { trainingId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!training) {
      return res.status(404).json({ success: false, error: 'Training record not found' });
    }
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOverdueTrainings = async (req, res) => {
  try {
    const now = new Date();
    const trainings = await Training.find({
      $or: [
        { status: 'expired' },
        { expirationDate: { $lt: now }, status: { $ne: 'completed' } }
      ]
    }).sort({ expirationDate: 1 });
    res.json({ success: true, data: trainings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTrainingStatistics = async (req, res) => {
  try {
    const stats = await Training.aggregate([
      {
        $group: {
          _id: null,
          totalTrainings: { $sum: 1 },
          completedTrainings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          expiredTrainings: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          },
          averageScore: { $avg: '$score' }
        }
      }
    ]);
    res.json({ success: true, data: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== Access Log Endpoints =====

exports.createAccessLog = async (req, res) => {
  try {
    const log = new AccessLog(req.body);
    await log.save();
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAccessLogs = async (req, res) => {
  try {
    const { userId, patientId, suspicious, startDate, endDate, action } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (patientId) filter.patientId = patientId;
    if (suspicious) filter.suspicious = suspicious === 'true';
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    const logs = await AccessLog.find(filter).sort({ timestamp: -1 }).limit(1000);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAccessLogById = async (req, res) => {
  try {
    const log = await AccessLog.findOne({ logId: req.params.id });
    if (!log) {
      return res.status(404).json({ success: false, error: 'Access log not found' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSuspiciousActivity = async (req, res) => {
  try {
    const logs = await AccessLog.find({ suspicious: true })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAccessStatistics = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const stats = await AccessLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAccesses: { $sum: 1 },
          suspiciousAccesses: {
            $sum: { $cond: ['$suspicious', 1, 0] }
          },
          deniedAccesses: {
            $sum: { $cond: [{ $eq: ['$accessGranted', false] }, 1, 0] }
          },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalAccesses: 1,
          suspiciousAccesses: 1,
          deniedAccesses: 1,
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      }
    ]);
    
    res.json({ success: true, data: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== Compliance Report Endpoints =====

exports.createComplianceReport = async (req, res) => {
  try {
    const report = new ComplianceReport(req.body);
    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getComplianceReports = async (req, res) => {
  try {
    const { reportType, status } = req.query;
    const filter = {};
    if (reportType) filter.reportType = reportType;
    if (status) filter.status = status;
    const reports = await ComplianceReport.find(filter).sort({ reportDate: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getComplianceReportById = async (req, res) => {
  try {
    const report = await ComplianceReport.findOne({ reportId: req.params.id });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Compliance report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateComplianceReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findOneAndUpdate(
      { reportId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!report) {
      return res.status(404).json({ success: false, error: 'Compliance report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteComplianceReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findOneAndDelete({ reportId: req.params.id });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Compliance report not found' });
    }
    res.json({ success: true, message: 'Compliance report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== Dashboard & Analytics Endpoints =====

exports.getDashboardData = async (req, res) => {
  try {
    const [
      totalAssessments,
      activeBreaches,
      activeBAAs,
      overdueTrainings,
      suspiciousLogs
    ] = await Promise.all([
      RiskQuantifyment.countDocuments(),
      Breach.countDocuments({ status: { $ne: 'resolved' } }),
      BAA.countDocuments({ status: 'active' }),
      Training.countDocuments({ status: 'expired' }),
      AccessLog.countDocuments({ suspicious: true })
    ]);

    const recentBreaches = await Breach.find()
      .sort({ incidentDate: -1 })
      .limit(5)
      .select('breachId breachType severity status incidentDate affectedIndividuals');

    const latestAssessment = await RiskQuantifyment.findOne()
      .sort({ assessmentDate: -1 })
      .select('assessmentId overallRiskScore safeguardScores ruleCompliance status');

    res.json({
      success: true,
      data: {
        summary: {
          totalAssessments,
          activeBreaches,
          activeBAAs,
          overdueTrainings,
          suspiciousLogs
        },
        recentBreaches,
        latestAssessment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getComplianceOverview = async (req, res) => {
  try {
    const latestAssessment = await RiskQuantifyment.findOne()
      .sort({ assessmentDate: -1 });

    const breachStats = await Breach.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const trainingStats = await Training.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const baaStats = await BAA.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        riskAssessment: latestAssessment,
        breachStats,
        trainingStats,
        baaStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
