/**
 * Firmware Routes - Firmware Analysis and Update Management
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { Firmware, Device, Alert } = require('../models');

// GET /firmware - List all firmware
router.get('/', async (req, res) => {
  try {
    const { vendor, status, hasVulnerabilities, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (vendor) query.vendor = vendor;
    if (status) query.status = status;
    if (hasVulnerabilities === 'true') query['vulnerabilityFindings.0'] = { $exists: true };
    
    const [firmware, total] = await Promise.all([
      Firmware.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Firmware.countDocuments(query)
    ]);
    
    res.json({ 
      success: true, 
      data: firmware,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /firmware/stats - Get firmware statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Firmware.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /firmware/vulnerable - Get vulnerable firmware
router.get('/vulnerable', async (req, res) => {
  try {
    const firmware = await Firmware.getVulnerable();
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /firmware/outdated - Get outdated firmware
router.get('/outdated', async (req, res) => {
  try {
    const firmware = await Firmware.getOutdated();
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /firmware/:id - Get firmware by ID
router.get('/:id', async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id)
      .populate('deviceReferences.deviceId', 'name ipAddress type');
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /firmware - Register new firmware
router.post('/', async (req, res) => {
  try {
    const firmwareData = {
      ...req.body,
      firmwareId: req.body.firmwareId || `fw_${Date.now()}`
    };
    
    const firmware = new Firmware(firmwareData);
    await firmware.save();
    
    res.status(201).json({ success: true, data: firmware });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /firmware/upload - Upload firmware for analysis
router.post('/upload', async (req, res) => {
  try {
    const { fileName, fileBuffer, vendor, version, deviceType } = req.body;
    
    // Calculate hashes
    const buffer = Buffer.from(fileBuffer, 'base64');
    const md5 = crypto.createHash('md5').update(buffer).digest('hex');
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Check if already exists
    let firmware = await Firmware.findByHash(sha256);
    if (firmware) {
      return res.json({ 
        success: true, 
        data: firmware, 
        message: 'Firmware already registered' 
      });
    }
    
    // Create new firmware entry
    firmware = new Firmware({
      firmwareId: `fw_${Date.now()}`,
      name: fileName,
      vendor,
      version,
      deviceType,
      file: {
        size: buffer.length,
        md5,
        sha256,
        fileName
      },
      status: 'pending_analysis'
    });
    
    await firmware.save();
    
    // Start background analysis
    analyzeFirmware(firmware._id, buffer);
    
    res.status(201).json({ 
      success: true, 
      data: firmware,
      message: 'Firmware uploaded, analysis started'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /firmware/:id/analyze - Trigger firmware analysis
router.post('/:id/analyze', async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    firmware.status = 'analyzing';
    await firmware.save();
    
    // Simulate analysis (in production, use actual analysis engine)
    analyzeFirmware(firmware._id);
    
    res.json({ 
      success: true, 
      message: 'Analysis started',
      data: firmware
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /firmware/:id/virustotal - Submit to VirusTotal
router.post('/:id/virustotal', async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    const vtApiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!vtApiKey || vtApiKey === 'your_virustotal_api_key_here') {
      // Simulate VirusTotal response
      firmware.virusTotalAnalysis = {
        scanned: true,
        scanDate: new Date(),
        detectionRatio: '0/72',
        malicious: false,
        suspicious: false,
        engines: {
          total: 72,
          detected: 0,
          undetected: 72
        }
      };
      await firmware.save();
      
      return res.json({ 
        success: true, 
        data: firmware.virusTotalAnalysis,
        message: 'Simulated VirusTotal analysis (no API key)'
      });
    }
    
    // Real VirusTotal API call
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/files/${firmware.file.sha256}`,
      { headers: { 'x-apikey': vtApiKey } }
    );
    
    const stats = response.data.data.attributes.last_analysis_stats;
    firmware.virusTotalAnalysis = {
      scanned: true,
      scanDate: new Date(),
      scanId: response.data.data.id,
      detectionRatio: `${stats.malicious}/${stats.malicious + stats.undetected}`,
      malicious: stats.malicious > 0,
      suspicious: stats.suspicious > 0,
      engines: stats
    };
    await firmware.save();
    
    // Create alert if malicious
    if (stats.malicious > 0) {
      await Alert.create({
        alertId: `alert_${Date.now()}`,
        type: 'malware_detected',
        severity: 'critical',
        title: `Malicious Firmware Detected: ${firmware.name}`,
        description: `VirusTotal detected ${stats.malicious} malware indicators`,
        source: 'virustotal',
        metadata: { firmwareId: firmware._id }
      });
    }
    
    res.json({ success: true, data: firmware.virusTotalAnalysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /firmware/:id/cves - Get CVEs for firmware
router.get('/:id/cves', async (req, res) => {
  try {
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    // Search NVD for firmware-related CVEs
    const nvdApiKey = process.env.NVD_API_KEY;
    const keyword = `${firmware.vendor} ${firmware.name}`.trim();
    
    try {
      const response = await axios.get(
        'https://services.nvd.nist.gov/rest/json/cves/2.0',
        {
          params: { keywordSearch: keyword, resultsPerPage: 20 },
          headers: nvdApiKey ? { apiKey: nvdApiKey } : {}
        }
      );
      
      const cves = response.data.vulnerabilities?.map(v => ({
        cveId: v.cve.id,
        description: v.cve.descriptions?.find(d => d.lang === 'en')?.value,
        severity: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'UNKNOWN',
        score: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore,
        published: v.cve.published
      })) || [];
      
      res.json({ success: true, data: cves });
    } catch (nvdError) {
      // Return cached or empty if NVD fails
      res.json({ 
        success: true, 
        data: firmware.vulnerabilityFindings || [],
        message: 'NVD lookup failed, returning cached data'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /firmware/:id/update - Schedule firmware update
router.post('/:id/update', async (req, res) => {
  try {
    const { targetVersion, scheduledAt, deviceIds } = req.body;
    const firmware = await Firmware.findById(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    firmware.updateAvailable = {
      version: targetVersion,
      releaseDate: new Date(),
      critical: req.body.critical || false,
      downloadUrl: req.body.downloadUrl,
      releaseNotes: req.body.releaseNotes
    };
    
    firmware.updateHistory.push({
      fromVersion: firmware.version,
      toVersion: targetVersion,
      status: 'scheduled',
      scheduledAt: new Date(scheduledAt),
      targetDevices: deviceIds?.length || 0
    });
    
    await firmware.save();
    
    if (global.io) {
      global.io.to('firmware').emit('update-scheduled', {
        firmwareId: firmware._id,
        targetVersion,
        scheduledAt
      });
    }
    
    res.json({ success: true, data: firmware });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /firmware/:id - Update firmware info
router.put('/:id', async (req, res) => {
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
});

// DELETE /firmware/:id - Delete firmware
router.delete('/:id', async (req, res) => {
  try {
    const firmware = await Firmware.findByIdAndDelete(req.params.id);
    
    if (!firmware) {
      return res.status(404).json({ success: false, error: 'Firmware not found' });
    }
    
    res.json({ success: true, message: 'Firmware deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function - Analyze firmware (simulated)
async function analyzeFirmware(firmwareId, buffer = null) {
  try {
    const firmware = await Firmware.findById(firmwareId);
    if (!firmware) return;
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulated static analysis results
    firmware.staticAnalysis = {
      performed: true,
      analysisDate: new Date(),
      entropyScore: 6.8 + Math.random() * 1.5,
      stringsExtracted: Math.floor(Math.random() * 5000) + 1000,
      cryptoFunctionsFound: ['AES', 'SHA256', 'RSA'].slice(0, Math.floor(Math.random() * 3) + 1),
      hardcodedCredentials: Math.random() > 0.8,
      debugSymbols: Math.random() > 0.7,
      packingDetected: Math.random() > 0.9
    };
    
    // Simulated vulnerability findings
    if (Math.random() > 0.5) {
      firmware.vulnerabilityFindings.push({
        type: 'hardcoded_credential',
        severity: 'high',
        description: 'Potential hardcoded credentials detected',
        location: 'strings analysis',
        recommendation: 'Remove hardcoded credentials and use secure credential storage'
      });
    }
    
    firmware.status = 'analyzed';
    firmware.lastAnalyzed = new Date();
    await firmware.save();
    
    if (global.io) {
      global.io.to('firmware').emit('analysis-complete', {
        firmwareId: firmware._id,
        name: firmware.name,
        status: 'analyzed'
      });
    }
  } catch (error) {
    console.error('Firmware analysis error:', error);
  }
}

module.exports = router;
