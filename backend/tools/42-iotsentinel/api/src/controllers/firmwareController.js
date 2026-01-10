/**
 * Firmware Controller
 * Handles firmware management and security analysis
 */

const { Firmware, Device } = require('../models');
const virusTotalService = require('../services/virusTotalService');

// Helper for pagination
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Get all firmware with filtering
 */
exports.getFirmware = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    
    const filter = {};
    if (req.query.deviceId) filter.deviceId = req.query.deviceId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.securityStatus) filter.securityStatus = req.query.securityStatus;
    
    const [firmware, total] = await Promise.all([
      Firmware.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('deviceId', 'name ipAddress type manufacturer'),
      Firmware.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: firmware,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get firmware statistics
 */
exports.getFirmwareStats = async (req, res) => {
  try {
    const stats = await Firmware.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get vulnerable firmware
 */
exports.getVulnerableFirmware = async (req, res) => {
  try {
    const firmware = await Firmware.getVulnerable();
    res.json({ success: true, data: firmware, count: firmware.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get firmware by device
 */
exports.getFirmwareByDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const firmware = await Firmware.find({ deviceId }).sort({ version: -1 });
    
    res.json({ success: true, data: firmware, count: firmware.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get firmware by manufacturer
 */
exports.getFirmwareByManufacturer = async (req, res) => {
  try {
    const { manufacturer } = req.params;
    const { page, limit, skip } = getPagination(req);
    
    const [firmware, total] = await Promise.all([
      Firmware.find({ manufacturer }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Firmware.countDocuments({ manufacturer })
    ]);
    
    res.json({
      success: true,
      data: firmware,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single firmware
 */
exports.getFirmwareById = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id)
      .populate('deviceId', 'name ipAddress type manufacturer')
      .populate('approvedBy', 'name email');
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Upload firmware
 */
exports.uploadFirmware = async (req, res) => {
  try {
    const firmwareData = {
      ...req.body,
      filePath: req.file?.path,
      fileSize: req.file?.size,
      uploadedBy: req.user?.id,
      uploadedAt: new Date()
    };
    
    const firmware = await Firmware.create(firmwareData);
    
    // Start security analysis
    await firmware.startAnalysis();
    
    res.status(201).json({ success: true, data: firmware });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update firmware
 */
exports.updateFirmware = async (req, res) => {
  try {
    const firmware = await Firmware.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete firmware
 */
exports.deleteFirmware = async (req, res) => {
  try {
    const firmware = await Firmware.findByIdAndDelete(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    // TODO: Delete file from storage
    
    res.json({ success: true, message: 'Firmware deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Analyze firmware security
 */
exports.analyzeFirmware = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    await firmware.startAnalysis();
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Submit to VirusTotal
 */
exports.submitToVirusTotal = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    if (!process.env.VIRUSTOTAL_API_KEY) {
      return res.status(400).json({ 
        success: false, 
        error: 'VirusTotal API key not configured' 
      });
    }
    
    const result = await virusTotalService.submitFile(firmware.filePath);
    
    firmware.virusTotal = {
      scanId: result.scan_id,
      submittedAt: new Date(),
      status: 'pending'
    };
    
    await firmware.save();
    
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get VirusTotal results
 */
exports.getVirusTotalResults = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    if (!firmware.virusTotal?.scanId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Firmware not submitted to VirusTotal' 
      });
    }
    
    const results = await virusTotalService.getReport(firmware.virusTotal.scanId);
    
    firmware.virusTotal = {
      ...firmware.virusTotal,
      results,
      lastChecked: new Date()
    };
    
    await firmware.save();
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Approve firmware
 */
exports.approveFirmware = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    await firmware.approve(req.body.userId, req.body.notes);
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Reject firmware
 */
exports.rejectFirmware = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    await firmware.reject(req.body.userId, req.body.reason);
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Deploy firmware
 */
exports.deployFirmware = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    if (firmware.status !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        error: 'Only approved firmware can be deployed' 
      });
    }
    
    await firmware.deploy(req.body.targetDevices, req.body.userId);
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get deployment status
 */
exports.getDeploymentStatus = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    res.json({ 
      success: true, 
      data: {
        deploymentStatus: firmware.deploymentStatus,
        deployedTo: firmware.deployedTo,
        deploymentHistory: firmware.deploymentHistory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Compare firmware versions
 */
exports.compareVersions = async (req, res) => {
  try {
    const { id1, id2 } = req.params;
    
    const [firmware1, firmware2] = await Promise.all([
      Firmware.findById(id1),
      Firmware.findById(id2)
    ]);
    
    if (!firmware1 || !firmware2) {
      return res.status(404).json({ success: false, error: 'One or both firmware versions not found' });
    }
    
    const comparison = await Firmware.compareVersions(firmware1, firmware2);
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get firmware changelog
 */
exports.getChangelog = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    res.json({ success: true, data: firmware.changelog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add changelog entry
 */
exports.addChangelogEntry = async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    firmware.changelog.push({
      version: req.body.version,
      changes: req.body.changes,
      author: req.body.userId,
      date: new Date()
    });
    
    await firmware.save();
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk approve firmware
 */
exports.bulkApprove = async (req, res) => {
  try {
    const { firmwareIds, userId, notes } = req.body;
    
    const result = await Firmware.updateMany(
      { _id: { $in: firmwareIds } },
      { 
        $set: { 
          status: 'approved',
          'approval.approved': true,
          'approval.approvedBy': userId,
          'approval.approvedAt': new Date(),
          'approval.notes': notes
        }
      }
    );
    
    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk delete firmware
 */
exports.bulkDelete = async (req, res) => {
  try {
    const { firmwareIds } = req.body;
    
    const result = await Firmware.deleteMany({ _id: { $in: firmwareIds } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export firmware inventory to CSV
 */
exports.exportCSV = async (req, res) => {
  try {
    const firmware = await Firmware.find({}).lean();
    
    const headers = ['name', 'version', 'manufacturer', 'deviceType', 'status', 'securityStatus', 'createdAt'];
    const rows = firmware.map(f => 
      headers.map(h => f[h] || '').join(',')
    );
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=firmware.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export firmware inventory to JSON
 */
exports.exportJSON = async (req, res) => {
  try {
    const firmware = await Firmware.find({}).lean();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=firmware.json');
    res.json(firmware);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
