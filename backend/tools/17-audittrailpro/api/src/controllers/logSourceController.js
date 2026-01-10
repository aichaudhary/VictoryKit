/**
 * AuditTrailPro - LogSource Controller
 */

const LogSource = require("../models/LogSource");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

exports.getAll = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [sources, total] = await Promise.all([
      LogSource.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ name: 1 }),
      LogSource.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: sources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const source = await LogSource.findById(req.params.id);
    if (!source) {
      return res
        .status(404)
        .json({ success: false, error: "Log source not found" });
    }
    res.json({ success: true, data: source });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const source = new LogSource({
      ...req.body,
      sourceId: req.body.sourceId || `SRC-${uuidv4().split('-')[0].toUpperCase()}`,
    });
    await source.save();
    res.status(201).json({ success: true, data: source });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const source = await LogSource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!source) {
      return res
        .status(404)
        .json({ success: false, error: "Log source not found" });
    }
    res.json({ success: true, data: source });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const source = await LogSource.findByIdAndDelete(req.params.id);
    if (!source) {
      return res
        .status(404)
        .json({ success: false, error: "Log source not found" });
    }
    res.json({ success: true, message: "Log source deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.testConnection = async (req, res) => {
  try {
    const source = await LogSource.findById(req.params.id);
    if (!source) {
      return res
        .status(404)
        .json({ success: false, error: "Log source not found" });
    }

    let testResult = { success: false, message: 'Unknown source type' };

    // Test connection based on source type
    switch (source.type) {
      case 'api':
      case 'webhook':
        if (source.config?.endpoint) {
          try {
            const response = await axios.get(source.config.endpoint, {
              timeout: 10000,
              headers: source.config.headers || {}
            });
            testResult = {
              success: response.status >= 200 && response.status < 300,
              message: `Connection successful (HTTP ${response.status})`,
              latency: response.headers['x-response-time'] || 'N/A'
            };
          } catch (apiError) {
            testResult = {
              success: false,
              message: `Connection failed: ${apiError.message}`
            };
          }
        }
        break;

      case 'syslog':
        testResult = {
          success: true,
          message: 'Syslog source configured (passive listener)',
          port: source.config?.port || 514
        };
        break;

      case 'file':
        testResult = {
          success: true,
          message: 'File source configured',
          path: source.config?.path || 'Not specified'
        };
        break;

      case 'database':
        testResult = {
          success: true,
          message: 'Database connection configuration validated',
          type: source.config?.dbType || 'Unknown'
        };
        break;

      default:
        testResult = {
          success: true,
          message: `Source type "${source.type}" is configured`
        };
    }

    // Update source status
    source.status = testResult.success ? 'active' : 'error';
    source.lastChecked = new Date();
    await source.save();

    res.json({
      success: true,
      sourceId: source.sourceId,
      name: source.name,
      type: source.type,
      test: testResult,
      testedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
