const { AttackPath, SecurityFinding, CloudResource } = require('../models');

/**
 * Get all attack paths
 */
exports.getAttackPaths = async (req, res) => {
  try {
    const {
      riskLevel,
      status = 'active',
      attackType,
      limit = 20,
      page = 1
    } = req.query;

    const query = {};
    if (riskLevel) query.riskLevel = riskLevel;
    if (status) query.status = status;
    if (attackType) query.attackType = attackType;

    const paths = await AttackPath.find(query)
      .sort({ riskScore: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AttackPath.countDocuments(query);

    // Get summary
    const summary = await AttackPath.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        paths,
        summary: summary.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
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
      error: 'Failed to get attack paths',
      details: error.message
    });
  }
};

/**
 * Get attack path by ID
 */
exports.getAttackPathById = async (req, res) => {
  try {
    const { pathId } = req.params;
    
    const path = await AttackPath.findOne({ pathId });
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Attack path not found'
      });
    }

    // Get related findings
    const findingIds = path.steps.map(s => s.findingId).filter(Boolean);
    const findings = await SecurityFinding.find({ findingId: { $in: findingIds } });

    // Get related resources
    const resourceIds = path.steps.map(s => s.resourceId);
    const resources = await CloudResource.find({ resourceId: { $in: resourceIds } });

    res.json({
      success: true,
      data: {
        path,
        findings,
        resources
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get attack path',
      details: error.message
    });
  }
};

/**
 * Update attack path status
 */
exports.updateAttackPathStatus = async (req, res) => {
  try {
    const { pathId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['active', 'mitigated', 'accepted', 'in-progress'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const path = await AttackPath.findOneAndUpdate(
      { pathId },
      { 
        status,
        ...(status === 'mitigated' ? { lastValidatedAt: new Date() } : {})
      },
      { new: true }
    );

    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Attack path not found'
      });
    }

    res.json({
      success: true,
      message: 'Attack path status updated',
      data: path
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update attack path',
      details: error.message
    });
  }
};

/**
 * Get blast radius for an attack path
 */
exports.getBlastRadius = async (req, res) => {
  try {
    const { pathId } = req.params;
    
    const path = await AttackPath.findOne({ pathId });
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Attack path not found'
      });
    }

    // Get all resources that could be affected
    const affectedResourceIds = new Set();
    
    for (const step of path.steps) {
      affectedResourceIds.add(step.resourceId);
      
      // Get resources connected to each step
      const resource = await CloudResource.findOne({ resourceId: step.resourceId });
      if (resource?.relatedResources) {
        resource.relatedResources.forEach(r => affectedResourceIds.add(r.resourceId));
      }
    }

    const affectedResources = await CloudResource.find({
      resourceId: { $in: Array.from(affectedResourceIds) }
    });

    // Calculate impact metrics
    const dataResources = affectedResources.filter(r => 
      r.resourceType.includes('s3') || 
      r.resourceType.includes('storage') || 
      r.resourceType.includes('rds') ||
      r.resourceType.includes('database')
    );

    const computeResources = affectedResources.filter(r =>
      r.resourceType.includes('ec2') ||
      r.resourceType.includes('vm') ||
      r.resourceType.includes('lambda') ||
      r.resourceType.includes('function')
    );

    res.json({
      success: true,
      data: {
        pathId,
        blastRadius: {
          totalResources: affectedResources.length,
          dataResources: dataResources.length,
          computeResources: computeResources.length,
          regions: [...new Set(affectedResources.map(r => r.region).filter(Boolean))],
          resourceTypes: [...new Set(affectedResources.map(r => r.resourceType))]
        },
        affectedResources: affectedResources.map(r => ({
          resourceId: r.resourceId,
          resourceName: r.resourceName,
          resourceType: r.resourceType,
          provider: r.provider,
          riskLevel: r.riskLevel
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get blast radius',
      details: error.message
    });
  }
};

/**
 * Get MITRE ATT&CK mapping
 */
exports.getMitreMapping = async (req, res) => {
  try {
    const { pathId } = req.params;
    
    const path = await AttackPath.findOne({ pathId });
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Attack path not found'
      });
    }

    res.json({
      success: true,
      data: {
        pathId,
        name: path.name,
        mitreMapping: path.mitreMapping || [],
        techniques: path.steps.map(s => ({
          step: s.stepNumber,
          technique: s.technique,
          resource: s.resourceName
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get MITRE mapping',
      details: error.message
    });
  }
};

/**
 * Get remediation plan for attack path
 */
exports.getRemediationPlan = async (req, res) => {
  try {
    const { pathId } = req.params;
    
    const path = await AttackPath.findOne({ pathId });
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Attack path not found'
      });
    }

    // Get findings for remediation details
    const findingIds = path.steps.map(s => s.findingId).filter(Boolean);
    const findings = await SecurityFinding.find({ findingId: { $in: findingIds } });

    const remediationPlan = {
      pathId,
      name: path.name,
      quickestFix: path.quickestFix,
      steps: path.remediationPlan || path.steps.map((step, idx) => {
        const finding = findings.find(f => f.findingId === step.findingId);
        return {
          order: idx + 1,
          action: finding?.recommendation || `Fix ${step.action}`,
          resource: step.resourceName,
          effort: finding?.remediationEffort || 'short-term',
          impact: idx === 0 ? 'Blocks attack entry point' : 'Reduces attack surface'
        };
      }),
      estimatedEffort: path.steps.length <= 2 ? 'Low' : path.steps.length <= 5 ? 'Medium' : 'High',
      priority: path.riskLevel === 'critical' ? 'Immediate' : 
                path.riskLevel === 'high' ? 'This week' : 'This month'
    };

    res.json({
      success: true,
      data: remediationPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get remediation plan',
      details: error.message
    });
  }
};
