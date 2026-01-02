const { CloudResource } = require('../models');

/**
 * Get all cloud resources
 */
exports.getResources = async (req, res) => {
  try {
    const {
      provider,
      resourceType,
      riskLevel,
      limit = 50,
      page = 1,
      search
    } = req.query;

    const query = {};
    if (provider) query.provider = provider;
    if (resourceType) query.resourceType = resourceType;
    if (riskLevel) query.riskLevel = riskLevel;
    if (search) {
      query.$or = [
        { resourceName: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await CloudResource.find(query)
      .sort({ securityScore: 1, updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CloudResource.countDocuments(query);

    // Get summary by provider
    const summary = await CloudResource.aggregate([
      {
        $group: {
          _id: '$provider',
          count: { $sum: 1 },
          avgScore: { $avg: '$securityScore' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        resources,
        summary: summary.reduce((acc, s) => ({
          ...acc,
          [s._id]: { count: s.count, avgScore: Math.round(s.avgScore) }
        }), {}),
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get resources',
      details: error.message
    });
  }
};

/**
 * Get resource by ID
 */
exports.getResourceById = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    const resource = await CloudResource.findOne({ resourceId });
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Get findings for this resource
    const SecurityFinding = require('../models/SecurityFinding.model');
    const findings = await SecurityFinding.find({ 
      resourceId: resource.resourceId,
      status: 'open'
    });

    res.json({
      success: true,
      data: {
        resource,
        findings,
        findingsCount: findings.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get resource',
      details: error.message
    });
  }
};

/**
 * Get resource inventory summary
 */
exports.getInventorySummary = async (req, res) => {
  try {
    // By provider
    const byProvider = await CloudResource.aggregate([
      { $group: { _id: '$provider', count: { $sum: 1 } } }
    ]);

    // By resource type
    const byType = await CloudResource.aggregate([
      { $group: { _id: '$resourceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // By region
    const byRegion = await CloudResource.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // By risk level
    const byRisk = await CloudResource.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    // Total counts
    const totalResources = await CloudResource.countDocuments();
    const compliantResources = await CloudResource.countDocuments({ isCompliant: true });
    const atRiskResources = await CloudResource.countDocuments({ 
      riskLevel: { $in: ['critical', 'high'] } 
    });

    res.json({
      success: true,
      data: {
        totals: {
          total: totalResources,
          compliant: compliantResources,
          atRisk: atRiskResources
        },
        byProvider: byProvider.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {}),
        byType: byType.map(t => ({ type: t._id, count: t.count })),
        byRegion: byRegion.map(r => ({ region: r._id || 'global', count: r.count })),
        byRisk: byRisk.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {})
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory summary',
      details: error.message
    });
  }
};

/**
 * Get resource types
 */
exports.getResourceTypes = async (req, res) => {
  try {
    const { provider } = req.query;
    
    const query = provider ? { provider } : {};
    
    const types = await CloudResource.distinct('resourceType', query);

    res.json({
      success: true,
      data: types.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get resource types',
      details: error.message
    });
  }
};

/**
 * Detect configuration drift
 */
exports.detectDrift = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    const resource = await CloudResource.findOne({ resourceId });
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // In production, this would compare current state with baseline
    // For now, return mock drift detection
    const driftDetected = Math.random() > 0.7;
    
    res.json({
      success: true,
      data: {
        resourceId,
        driftDetected,
        changes: driftDetected ? [
          {
            path: 'configuration.publicAccess',
            expected: false,
            actual: true,
            severity: 'high'
          }
        ] : [],
        lastChecked: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to detect drift',
      details: error.message
    });
  }
};
