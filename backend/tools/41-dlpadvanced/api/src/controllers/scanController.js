/**
 * Scan Controller - Content & File Scanning Operations
 */

const { v4: uuidv4 } = require('uuid');
const { ScanResult, DataClassification, DLPIncident } = require('../models');
const dlpService = require('../services/dlpService');

/**
 * Scan text content for sensitive data
 */
exports.scanContent = async (req, res) => {
  try {
    const { content, options = {} } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }
    
    const result = await dlpService.scanContent(content, options);
    
    res.json({
      success: true,
      scanId: uuidv4(),
      timestamp: new Date(),
      ...result
    });
  } catch (error) {
    console.error('Content scan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Scan uploaded file
 */
exports.scanFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File is required' });
    }
    
    const scanId = uuidv4();
    const options = req.body.options ? JSON.parse(req.body.options) : {};
    
    // Create scan record
    const scanRecord = await ScanResult.create({
      scanId,
      target: {
        type: 'file',
        location: req.file.originalname
      },
      status: 'scanning',
      timing: { startedAt: new Date() }
    });
    
    // Perform scan
    const result = await dlpService.scanFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      options
    );
    
    // Update scan record
    scanRecord.status = 'completed';
    scanRecord.results = {
      filesScanned: 1,
      sensitivFilesFound: result.totalFindings > 0 ? 1 : 0,
      violations: result.findings,
      summary: {
        byDataType: result.findingsByType,
        bySeverity: result.findingsBySeverity
      }
    };
    scanRecord.timing.completedAt = new Date();
    scanRecord.timing.duration = Date.now() - scanRecord.timing.startedAt;
    await scanRecord.save();
    
    // Create incident if high risk
    if (result.riskScore >= 70) {
      await DLPIncident.create({
        incidentId: `INC-${Date.now()}`,
        type: 'sensitive_data_exposure',
        severity: result.riskScore >= 90 ? 'critical' : 'high',
        status: 'open',
        details: {
          dataTypes: result.findings.map(f => f.type),
          recordCount: result.totalFindings
        },
        content: {
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size
        },
        detectedAt: new Date()
      });
    }
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('scan:complete', { scanId, riskScore: result.riskScore });
    }
    
    res.json({
      success: true,
      scanId,
      ...result
    });
  } catch (error) {
    console.error('File scan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Scan email content
 */
exports.scanEmail = async (req, res) => {
  try {
    const { subject, body, from, to, attachments } = req.body;
    
    if (!body) {
      return res.status(400).json({ success: false, error: 'Email body is required' });
    }
    
    const result = await dlpService.scanEmail({ subject, body, from, to, attachments });
    
    res.json({
      success: true,
      scanId: uuidv4(),
      ...result
    });
  } catch (error) {
    console.error('Email scan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk scan multiple items
 */
exports.bulkScan = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items array is required' });
    }
    
    const batchId = uuidv4();
    const results = [];
    
    for (const item of items) {
      const result = await dlpService.scanContent(item.content, item.options);
      results.push({
        id: item.id,
        ...result
      });
    }
    
    res.json({
      success: true,
      batchId,
      totalScanned: items.length,
      results
    });
  } catch (error) {
    console.error('Bulk scan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get scan history
 */
exports.getScanHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query['target.type'] = type;
    
    const scans = await ScanResult.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await ScanResult.countDocuments(query);
    
    res.json({
      success: true,
      data: scans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get scan by ID
 */
exports.getScanById = async (req, res) => {
  try {
    const scan = await ScanResult.findOne({ scanId: req.params.id });
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
