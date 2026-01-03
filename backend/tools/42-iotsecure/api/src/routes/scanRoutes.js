/**
 * Scan Routes - Network Discovery and Security Scanning
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Scan, Device, Vulnerability } = require('../models');

const SHODAN_API_KEY = process.env.SHODAN_API_KEY;
const SHODAN_API_URL = process.env.SHODAN_API_URL || 'https://api.shodan.io';
const CENSYS_API_ID = process.env.CENSYS_API_ID;
const CENSYS_API_SECRET = process.env.CENSYS_API_SECRET;
const CENSYS_API_URL = process.env.CENSYS_API_URL || 'https://search.censys.io/api/v2';

// GET /scans - List all scans
router.get('/', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const [scans, total] = await Promise.all([
      Scan.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Scan.countDocuments(query)
    ]);
    
    res.json({ 
      success: true, 
      data: scans,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /scans/stats - Get scan statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Scan.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /scans/recent - Get recent scans
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const scans = await Scan.getRecent(parseInt(limit));
    res.json({ success: true, data: scans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /scans/running - Get running scans
router.get('/running', async (req, res) => {
  try {
    const scans = await Scan.getRunning();
    res.json({ success: true, data: scans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /scans/:id - Get scan by ID
router.get('/:id', async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id)
      .populate('targets.devices', 'name ipAddress type')
      .populate('targets.segments', 'name type');
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /scans - Create and start new scan
router.post('/', async (req, res) => {
  try {
    const scanData = {
      ...req.body,
      scanId: `scan_${Date.now()}`,
      status: 'pending',
      createdBy: req.body.userId || 'system'
    };
    
    const scan = new Scan(scanData);
    await scan.save();
    
    // Start scan asynchronously
    startScan(scan._id);
    
    if (global.io) {
      global.io.to('dashboard').emit('scan-created', scan);
    }
    
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /scans/quick - Quick network discovery scan
router.post('/quick', async (req, res) => {
  try {
    const { networks = ['192.168.1.0/24'] } = req.body;
    
    const scan = new Scan({
      scanId: `quick_${Date.now()}`,
      name: 'Quick Discovery Scan',
      type: 'quick',
      status: 'pending',
      targets: { type: 'network', networks },
      config: { portRange: '22,80,443,8080', scanSpeed: 'fast', deepScan: false }
    });
    
    await scan.save();
    startScan(scan._id);
    
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /scans/discovery - Full network discovery
router.post('/discovery', async (req, res) => {
  try {
    const { networks, excludeIPs = [] } = req.body;
    
    const scan = new Scan({
      scanId: `discovery_${Date.now()}`,
      name: 'Network Discovery Scan',
      type: 'discovery',
      status: 'pending',
      targets: { type: 'network', networks, excludeIPs },
      config: { portRange: '1-1024', scanSpeed: 'normal', deepScan: true }
    });
    
    await scan.save();
    startScan(scan._id);
    
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /scans/vulnerability - Vulnerability scan
router.post('/vulnerability', async (req, res) => {
  try {
    const { deviceIds, segmentIds } = req.body;
    
    const scan = new Scan({
      scanId: `vuln_${Date.now()}`,
      name: 'Vulnerability Scan',
      type: 'vulnerability',
      status: 'pending',
      targets: { 
        type: deviceIds ? 'devices' : 'segment',
        devices: deviceIds,
        segments: segmentIds
      },
      config: { checkVulnerabilities: true, checkCredentials: true, deepScan: true }
    });
    
    await scan.save();
    startScan(scan._id);
    
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /scans/:id/cancel - Cancel running scan
router.post('/:id/cancel', async (req, res) => {
  try {
    const scan = await Scan.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', completedAt: new Date() },
      { new: true }
    );
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    if (global.io) {
      global.io.to(`scan-${scan._id}`).emit('scan-cancelled', scan);
    }
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /scans/:id/pause - Pause running scan
router.post('/:id/pause', async (req, res) => {
  try {
    const scan = await Scan.findByIdAndUpdate(
      req.params.id,
      { status: 'paused' },
      { new: true }
    );
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /scans/:id/resume - Resume paused scan
router.post('/:id/resume', async (req, res) => {
  try {
    const scan = await Scan.findByIdAndUpdate(
      req.params.id,
      { status: 'running' },
      { new: true }
    );
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /scans/shodan/host/:ip - Get Shodan data for IP
router.get('/shodan/host/:ip', async (req, res) => {
  try {
    if (!SHODAN_API_KEY) {
      return res.status(400).json({ success: false, error: 'Shodan API key not configured' });
    }
    
    const response = await axios.get(`${SHODAN_API_URL}/shodan/host/${req.params.ip}`, {
      params: { key: SHODAN_API_KEY }
    });
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: error.response?.data?.error || error.message 
    });
  }
});

// GET /scans/shodan/search - Search Shodan
router.get('/shodan/search', async (req, res) => {
  try {
    if (!SHODAN_API_KEY) {
      return res.status(400).json({ success: false, error: 'Shodan API key not configured' });
    }
    
    const { query, page = 1 } = req.query;
    
    const response = await axios.get(`${SHODAN_API_URL}/shodan/host/search`, {
      params: { key: SHODAN_API_KEY, query, page }
    });
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: error.response?.data?.error || error.message 
    });
  }
});

// GET /scans/censys/host/:ip - Get Censys data for IP
router.get('/censys/host/:ip', async (req, res) => {
  try {
    if (!CENSYS_API_ID || !CENSYS_API_SECRET) {
      return res.status(400).json({ success: false, error: 'Censys API credentials not configured' });
    }
    
    const auth = Buffer.from(`${CENSYS_API_ID}:${CENSYS_API_SECRET}`).toString('base64');
    
    const response = await axios.get(`${CENSYS_API_URL}/hosts/${req.params.ip}`, {
      headers: { Authorization: `Basic ${auth}` }
    });
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      success: false, 
      error: error.response?.data?.error || error.message 
    });
  }
});

// DELETE /scans/:id - Delete scan
router.delete('/:id', async (req, res) => {
  try {
    const scan = await Scan.findByIdAndDelete(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ success: true, message: 'Scan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to start scan
async function startScan(scanId) {
  try {
    const scan = await Scan.findById(scanId);
    if (!scan) return;
    
    await scan.start();
    
    if (global.io) {
      global.io.to(`scan-${scanId}`).emit('scan-started', scan);
    }
    
    // Simulate scan progress (in production, this would be actual scanning)
    let progress = 0;
    const interval = setInterval(async () => {
      progress += Math.floor(Math.random() * 15) + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Complete scan with mock results
        await scan.complete({
          devicesScanned: Math.floor(Math.random() * 50) + 10,
          devicesDiscovered: Math.floor(Math.random() * 20) + 5,
          vulnerabilitiesFound: Math.floor(Math.random() * 15),
          criticalVulns: Math.floor(Math.random() * 3),
          highVulns: Math.floor(Math.random() * 5),
          mediumVulns: Math.floor(Math.random() * 7),
          lowVulns: Math.floor(Math.random() * 10)
        });
        
        if (global.io) {
          global.io.to(`scan-${scanId}`).emit('scan-completed', scan);
          global.io.to('dashboard').emit('scan-completed', scan);
        }
      } else {
        await scan.updateProgress(progress);
        
        if (global.io) {
          global.io.to(`scan-${scanId}`).emit('scan-progress', { progress, scanId });
        }
      }
    }, 2000);
    
  } catch (error) {
    console.error('Scan error:', error);
    const scan = await Scan.findById(scanId);
    if (scan) await scan.fail(error);
  }
}

module.exports = router;
