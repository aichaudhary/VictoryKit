/**
 * Scan Controller
 * Handles network and security scanning operations
 */

const { Scan, Device, Vulnerability } = require('../models');

// Helper for pagination
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Get all scans with filtering
 */
exports.getScans = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    
    const [scans, total] = await Promise.all([
      Scan.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Scan.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: scans,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get scan statistics
 */
exports.getScanStats = async (req, res) => {
  try {
    const [total, byStatus, byType, recentResults] = await Promise.all([
      Scan.countDocuments(),
      Scan.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Scan.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Scan.aggregate([
        { $match: { status: 'completed' } },
        { $sort: { completedAt: -1 } },
        { $limit: 10 },
        { $group: { 
          _id: null,
          avgDevicesFound: { $avg: '$results.devicesFound' },
          avgVulnsFound: { $avg: '$results.vulnerabilitiesFound' },
          avgDuration: { $avg: '$actualDuration' }
        }}
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        byType: byType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
        averages: recentResults[0] || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get active scans
 */
exports.getActiveScans = async (req, res) => {
  try {
    const scans = await Scan.getActive();
    res.json({ success: true, data: scans, count: scans.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get scheduled scans
 */
exports.getScheduledScans = async (req, res) => {
  try {
    const scans = await Scan.getScheduled();
    res.json({ success: true, data: scans, count: scans.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get recent completed scans
 */
exports.getRecentScans = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const scans = await Scan.getRecent(limit);
    res.json({ success: true, data: scans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get scans by type
 */
exports.getScansByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page, limit, skip } = getPagination(req);
    
    const [scans, total] = await Promise.all([
      Scan.find({ type }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Scan.countDocuments({ type })
    ]);
    
    res.json({
      success: true,
      data: scans,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Start a new scan
 */
exports.startScan = async (req, res) => {
  try {
    const { type, target, config } = req.body;
    
    const scan = await Scan.create({
      type: type || 'discovery',
      target: target || { type: 'all' },
      config: config || {},
      initiatedBy: 'user',
      userId: req.user?.id,
      userName: req.user?.name
    });
    
    // Start the scan asynchronously
    await scan.start();
    
    // TODO: Trigger actual scan worker
    
    res.status(201).json({ 
      success: true, 
      data: scan,
      message: 'Scan started successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Quick discovery scan
 */
exports.quickDiscoveryScan = async (req, res) => {
  try {
    const scan = await Scan.create({
      type: 'discovery',
      target: req.body.target || { type: 'all' },
      config: {
        scanSpeed: 'fast',
        commonPortsOnly: true,
        serviceDetection: true,
        osDetection: true
      },
      initiatedBy: 'user'
    });
    
    await scan.start();
    
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Quick vulnerability scan
 */
exports.quickVulnerabilityScan = async (req, res) => {
  try {
    const scan = await Scan.create({
      type: 'vulnerability',
      target: req.body.target || { type: 'all' },
      config: {
        scanSpeed: 'normal',
        vulnerabilityCheck: true,
        useNvd: true
      },
      initiatedBy: 'user'
    });
    
    await scan.start();
    
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Quick full scan
 */
exports.quickFullScan = async (req, res) => {
  try {
    const scan = await Scan.create({
      type: 'full',
      target: req.body.target || { type: 'all' },
      config: {
        scanSpeed: 'normal',
        serviceDetection: true,
        osDetection: true,
        bannerGrabbing: true,
        vulnerabilityCheck: true,
        useNvd: true
      },
      initiatedBy: 'user'
    });
    
    await scan.start();
    
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Get single scan
 */
exports.getScanById = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update scan configuration
 */
exports.updateScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    if (scan.status === 'running') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot update running scan' 
      });
    }
    
    Object.assign(scan, req.body);
    await scan.save();
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete scan
 */
exports.deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    if (scan.status === 'running') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete running scan. Cancel it first.' 
      });
    }
    
    await scan.deleteOne();
    res.json({ success: true, message: 'Scan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Pause scan
 */
exports.pauseScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    if (scan.status !== 'running') {
      return res.status(400).json({ 
        success: false, 
        error: 'Only running scans can be paused' 
      });
    }
    
    scan.status = 'paused';
    scan.pausedAt = new Date();
    await scan.save();
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Resume scan
 */
exports.resumeScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    if (scan.status !== 'paused') {
      return res.status(400).json({ 
        success: false, 
        error: 'Only paused scans can be resumed' 
      });
    }
    
    scan.status = 'running';
    scan.pausedAt = null;
    await scan.save();
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Cancel scan
 */
exports.cancelScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    await scan.cancel(req.body.reason || 'User cancelled');
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Restart scan
 */
exports.restartScan = async (req, res) => {
  try {
    const originalScan = await Scan.findById(req.params.id);
    
    if (!originalScan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    // Create new scan with same config
    const newScan = await Scan.create({
      type: originalScan.type,
      target: originalScan.target,
      config: originalScan.config,
      initiatedBy: 'user'
    });
    
    await newScan.start();
    
    res.status(201).json({ 
      success: true, 
      data: newScan,
      message: 'Scan restarted'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get scan results
 */
exports.getScanResults = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ 
      success: true, 
      data: {
        status: scan.status,
        progress: scan.progress,
        results: scan.results,
        discoveredDevices: scan.discoveredDevices,
        vulnerabilitiesDetected: scan.vulnerabilitiesDetected,
        errors: scan.errors,
        warnings: scan.warnings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get devices found in scan
 */
exports.getScanDevices = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ 
      success: true, 
      data: scan.discoveredDevices,
      count: scan.discoveredDevices?.length || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get vulnerabilities found in scan
 */
exports.getScanVulnerabilities = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ 
      success: true, 
      data: scan.vulnerabilitiesDetected,
      count: scan.vulnerabilitiesDetected?.length || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Schedule a scan
 */
exports.scheduleScan = async (req, res) => {
  try {
    const { type, target, config, schedule } = req.body;
    
    const scan = await Scan.create({
      type,
      target,
      config,
      schedule: {
        type: schedule.type,
        cronExpression: schedule.cronExpression,
        nextRun: schedule.nextRun || new Date(schedule.startTime),
        enabled: true
      },
      status: 'pending',
      initiatedBy: 'schedule'
    });
    
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update scheduled scan
 */
exports.updateScheduledScan = async (req, res) => {
  try {
    const scan = await Scan.findByIdAndUpdate(
      req.params.id,
      { schedule: req.body.schedule },
      { new: true }
    );
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scheduled scan not found' });
    }
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete scheduled scan
 */
exports.deleteScheduledScan = async (req, res) => {
  try {
    const scan = await Scan.findByIdAndDelete(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scheduled scan not found' });
    }
    
    res.json({ success: true, message: 'Scheduled scan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export scan results to PDF
 */
exports.exportScanPDF = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    // TODO: Generate PDF
    res.json({ 
      success: true, 
      message: 'PDF export not yet implemented',
      note: 'Will generate comprehensive PDF report'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export scan results to CSV
 */
exports.exportScanCSV = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    // Build CSV from discovered devices
    const headers = ['ipAddress', 'macAddress', 'hostname', 'type', 'manufacturer', 'isNew'];
    const rows = (scan.discoveredDevices || []).map(d =>
      headers.map(h => d[h] || '').join(',')
    );
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=scan-${scan.scanId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
