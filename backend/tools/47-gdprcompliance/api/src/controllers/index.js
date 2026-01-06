const axios = require('axios');
const {
  DataSubject,
  ConsentRecord,
  ProcessingActivity,
  DSAR,
  DataBreach,
  DPIAAssessment,
  LegalBasis,
  DataTransfer,
  Processor,
  RetentionSchedule,
  DPO,
  AuditLog
} = require('../models');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8047';

// ============================================================================
// SYSTEM
// ============================================================================

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'GDPR Compliance', timestamp: new Date(), models: 12 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// DATA SUBJECT MANAGEMENT
// ============================================================================

exports.createDataSubject = async (req, res) => {
  try {
    const dataSubject = new DataSubject(req.body);
    await dataSubject.save();
    res.status(201).json({ success: true, data: dataSubject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDataSubjects = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const dataSubjects = await DataSubject.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: dataSubjects.length, data: dataSubjects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDataSubjectById = async (req, res) => {
  try {
    const dataSubject = await DataSubject.findOne({ subjectId: req.params.id });
    if (!dataSubject) return res.status(404).json({ error: 'Data subject not found' });
    res.json({ success: true, data: dataSubject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// CONSENT MANAGEMENT (Article 7)
// ============================================================================

exports.createConsent = async (req, res) => {
  try {
    const consent = new ConsentRecord(req.body);
    await consent.save();
    res.status(201).json({ success: true, data: consent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConsents = async (req, res) => {
  try {
    const { dataSubjectId, purpose, status } = req.query;
    const filter = {};
    if (dataSubjectId) filter.dataSubjectId = dataSubjectId;
    if (purpose) filter.purpose = purpose;
    if (status) filter.status = status;
    const consents = await ConsentRecord.find(filter).sort({ grantedAt: -1 });
    res.json({ success: true, count: consents.length, data: consents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.withdrawConsent = async (req, res) => {
  try {
    const consent = await ConsentRecord.findOne({ consentId: req.params.id });
    if (!consent) return res.status(404).json({ error: 'Consent not found' });
    consent.withdraw(req.body.reason, req.body.withdrawnBy);
    await consent.save();
    res.json({ success: true, message: 'Consent withdrawn', data: consent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// PROCESSING ACTIVITIES (Article 30)
// ============================================================================

exports.createProcessingActivity = async (req, res) => {
  try {
    const activity = new ProcessingActivity(req.body);
    await activity.save();
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProcessingActivities = async (req, res) => {
  try {
    const activities = await ProcessingActivity.find().sort({ createdAt: -1 });
    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// DATA SUBJECT ACCESS REQUESTS (Article 15-22)
// ============================================================================

exports.createDSAR = async (req, res) => {
  try {
    const dsar = new DSAR(req.body);
    await dsar.save();
    res.status(201).json({ success: true, data: dsar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDSARs = async (req, res) => {
  try {
    const { status, requestType, overdue } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (requestType) filter.requestType = requestType;
    let dsars;
    if (overdue === 'true') {
      dsars = await DSAR.findOverdue();
    } else {
      dsars = await DSAR.find(filter).sort({ receivedDate: -1 });
    }
    res.json({ success: true, count: dsars.length, data: dsars });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeDSAR = async (req, res) => {
  try {
    const dsar = await DSAR.findOne({ requestId: req.params.id });
    if (!dsar) return res.status(404).json({ error: 'DSAR not found' });
    dsar.complete(req.body);
    await dsar.save();
    res.json({ success: true, message: 'DSAR completed', data: dsar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// DATA BREACH MANAGEMENT (Article 33-34)
// ============================================================================

exports.createDataBreach = async (req, res) => {
  try {
    const breach = new DataBreach(req.body);
    await breach.save();
    res.status(201).json({ success: true, data: breach, hours72Deadline: breach.complianceTracking.hours72Deadline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDataBreaches = async (req, res) => {
  try {
    const { overdue72 } = req.query;
    let breaches;
    if (overdue72 === 'true') {
      breaches = await DataBreach.findOverdue72Hours();
    } else {
      breaches = await DataBreach.find().sort({ discoveryDate: -1 });
    }
    res.json({ success: true, count: breaches.length, data: breaches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.notifySupervisoryAuthority = async (req, res) => {
  try {
    const breach = await DataBreach.findOne({ breachId: req.params.id });
    if (!breach) return res.status(404).json({ error: 'Data breach not found' });
    breach.notifySupervisoryAuthority(req.body.authority, req.body.method);
    await breach.save();
    res.json({ success: true, message: 'Supervisory authority notified', data: breach });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// DPIA MANAGEMENT (Article 35)
// ============================================================================

exports.createDPIA = async (req, res) => {
  try {
    const dpia = new DPIAAssessment(req.body);
    await dpia.save();
    res.status(201).json({ success: true, data: dpia });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDPIAs = async (req, res) => {
  try {
    const dpias = await DPIAAssessment.find().sort({ createdAt: -1 });
    res.json({ success: true, count: dpias.length, data: dpias });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// LEGAL BASIS (Article 6)
// ============================================================================

exports.createLegalBasis = async (req, res) => {
  try {
    const basis = new LegalBasis(req.body);
    await basis.save();
    res.status(201).json({ success: true, data: basis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// DATA TRANSFER (Article 44-50)
// ============================================================================

exports.createDataTransfer = async (req, res) => {
  try {
    const transfer = new DataTransfer(req.body);
    await transfer.save();
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// PROCESSOR MANAGEMENT (Article 28)
// ============================================================================

exports.createProcessor = async (req, res) => {
  try {
    const processor = new Processor(req.body);
    await processor.save();
    res.status(201).json({ success: true, data: processor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProcessors = async (req, res) => {
  try {
    const processors = await Processor.find().sort({ createdAt: -1 });
    res.json({ success: true, count: processors.length, data: processors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// RETENTION SCHEDULE
// ============================================================================

exports.createRetentionSchedule = async (req, res) => {
  try {
    const schedule = new RetentionSchedule(req.body);
    await schedule.save();
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// DPO MANAGEMENT (Article 37-39)
// ============================================================================

exports.createDPO = async (req, res) => {
  try {
    const dpo = new DPO(req.body);
    await dpo.save();
    res.status(201).json({ success: true, data: dpo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDPOs = async (req, res) => {
  try {
    const dpos = await DPO.find().sort({ createdAt: -1 });
    res.json({ success: true, count: dpos.length, data: dpos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// AUDIT LOG
// ============================================================================

exports.createAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.logEvent(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { eventCategory, startDate, endDate } = req.query;
    const filter = {};
    if (eventCategory) filter.eventCategory = eventCategory;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(1000);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// ML ENGINE
// ============================================================================

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const mlResponse = await axios.post(`${ML_ENGINE_URL}/analyze`, { data });
    res.json({ success: true, result: mlResponse.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scan = async (req, res) => {
  try {
    const { target } = req.body;
    const mlResponse = await axios.post(`${ML_ENGINE_URL}/scan`, { target });
    res.json({ success: true, scanId: Date.now(), result: mlResponse.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  res.json({ reports: [], total: 0 });
};

exports.getReportById = async (req, res) => {
  res.json({ id: req.params.id, status: 'pending' });
};

exports.getConfig = async (req, res) => {
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'GDPR' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};
