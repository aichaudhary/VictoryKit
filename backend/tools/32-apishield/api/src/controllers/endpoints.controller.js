const { APIEndpoint, APISpec, APIVulnerability } = require('../models');

// Get all endpoints
exports.getEndpoints = async (req, res) => {
  try {
    const { specId, method, riskLevel, limit = 100, page = 1 } = req.query;
    
    const query = {};
    if (specId) query.specId = specId;
    if (method) query.method = method;
    if (riskLevel) query.riskLevel = riskLevel;

    const endpoints = await APIEndpoint.find(query)
      .sort({ riskLevel: 1, vulnerabilityCount: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await APIEndpoint.countDocuments(query);

    res.json({
      success: true,
      data: {
        endpoints,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single endpoint with vulnerabilities
exports.getEndpoint = async (req, res) => {
  try {
    const endpoint = await APIEndpoint.findById(req.params.id);
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    const vulnerabilities = await APIVulnerability.find({ endpointId: endpoint._id })
      .sort({ severity: 1 });

    res.json({
      success: true,
      data: {
        endpoint,
        vulnerabilities
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create endpoint manually
exports.createEndpoint = async (req, res) => {
  try {
    const {
      specId,
      method,
      path,
      summary,
      description,
      parameters,
      requestBody,
      security,
      tags
    } = req.body;

    if (!method || !path) {
      return res.status(400).json({
        success: false,
        error: 'Method and path are required'
      });
    }

    const endpoint = new APIEndpoint({
      specId,
      method: method.toUpperCase(),
      path,
      summary,
      description,
      parameters,
      requestBody,
      security,
      tags,
      requiresAuth: security && security.length > 0,
      discoveryMethod: 'manual'
    });

    await endpoint.save();

    res.status(201).json({
      success: true,
      data: { endpoint }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update endpoint
exports.updateEndpoint = async (req, res) => {
  try {
    const endpoint = await APIEndpoint.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    res.json({
      success: true,
      data: { endpoint }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete endpoint
exports.deleteEndpoint = async (req, res) => {
  try {
    const endpoint = await APIEndpoint.findByIdAndDelete(req.params.id);
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    // Also delete associated vulnerabilities
    await APIVulnerability.deleteMany({ endpointId: endpoint._id });

    res.json({
      success: true,
      message: 'Endpoint deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get endpoint statistics
exports.getEndpointStats = async (req, res) => {
  try {
    const { specId } = req.query;
    const match = {};
    if (specId) match.specId = specId;

    const byMethod = await APIEndpoint.aggregate([
      { $match: match },
      { $group: { _id: '$method', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byRiskLevel = await APIEndpoint.aggregate([
      { $match: match },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    const byAuth = await APIEndpoint.aggregate([
      { $match: match },
      { $group: { _id: '$requiresAuth', count: { $sum: 1 } } }
    ]);

    const totalEndpoints = await APIEndpoint.countDocuments(match);
    const withVulnerabilities = await APIEndpoint.countDocuments({
      ...match,
      vulnerabilityCount: { $gt: 0 }
    });

    res.json({
      success: true,
      data: {
        total: totalEndpoints,
        withVulnerabilities,
        byMethod: byMethod.map(m => ({ method: m._id, count: m.count })),
        byRiskLevel: byRiskLevel.map(r => ({ riskLevel: r._id || 'unknown', count: r.count })),
        authenticated: byAuth.find(a => a._id === true)?.count || 0,
        unauthenticated: byAuth.find(a => a._id === false)?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
