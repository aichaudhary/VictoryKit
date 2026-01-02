const { SecurityFinding } = require('../models');

/**
 * Get all findings with filtering
 */
exports.getFindings = async (req, res) => {
  try {
    const {
      severity,
      provider,
      category,
      status = 'open',
      limit = 50,
      page = 1,
      sortBy = 'severity',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    if (severity) query.severity = severity;
    if (provider) query.provider = provider;
    if (category) query.category = category;
    if (status) query.status = status;

    const sortOptions = {};
    const severityOrder = { critical: 1, high: 2, medium: 3, low: 4, info: 5 };
    
    if (sortBy === 'severity') {
      sortOptions.severity = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const findings = await SecurityFinding.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await SecurityFinding.countDocuments(query);

    // Get summary counts
    const summary = await SecurityFinding.aggregate([
      { $match: { status: 'open' } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const summaryCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };
    summary.forEach(s => {
      summaryCounts[s._id] = s.count;
    });

    res.json({
      success: true,
      data: {
        findings,
        summary: summaryCounts,
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
      error: 'Failed to get findings',
      details: error.message
    });
  }
};

/**
 * Get finding by ID
 */
exports.getFindingById = async (req, res) => {
  try {
    const { findingId } = req.params;
    
    const finding = await SecurityFinding.findOne({ findingId });
    if (!finding) {
      return res.status(404).json({
        success: false,
        error: 'Finding not found'
      });
    }

    res.json({
      success: true,
      data: finding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get finding',
      details: error.message
    });
  }
};

/**
 * Update finding status
 */
exports.updateFindingStatus = async (req, res) => {
  try {
    const { findingId } = req.params;
    const { status, reason, assignedTo } = req.body;

    const validStatuses = ['open', 'in-progress', 'resolved', 'suppressed', 'false-positive', 'accepted-risk'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const finding = await SecurityFinding.findOne({ findingId });
    if (!finding) {
      return res.status(404).json({
        success: false,
        error: 'Finding not found'
      });
    }

    // Add to status history
    finding.statusHistory.push({
      status: finding.status,
      changedBy: req.user?.email || 'system',
      changedAt: new Date(),
      reason: reason || 'Status updated'
    });

    finding.status = status;
    if (status === 'resolved') {
      finding.resolvedAt = new Date();
    }
    if (assignedTo) {
      finding.assignedTo = assignedTo;
      finding.assignedAt = new Date();
    }

    await finding.save();

    res.json({
      success: true,
      message: 'Finding status updated',
      data: finding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update finding',
      details: error.message
    });
  }
};

/**
 * Bulk update findings
 */
exports.bulkUpdateFindings = async (req, res) => {
  try {
    const { findingIds, status, reason } = req.body;

    if (!Array.isArray(findingIds) || findingIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'findingIds must be a non-empty array'
      });
    }

    const result = await SecurityFinding.updateMany(
      { findingId: { $in: findingIds } },
      {
        $set: { status, resolvedAt: status === 'resolved' ? new Date() : null },
        $push: {
          statusHistory: {
            status,
            changedBy: req.user?.email || 'system',
            changedAt: new Date(),
            reason: reason || 'Bulk status update'
          }
        }
      }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} findings`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update findings',
      details: error.message
    });
  }
};

/**
 * Get finding statistics
 */
exports.getFindingStats = async (req, res) => {
  try {
    const { provider, days = 30 } = req.query;
    
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    const matchQuery = {
      firstSeenAt: { $gte: dateFilter }
    };
    if (provider) matchQuery.provider = provider;

    // By severity
    const bySeverity = await SecurityFinding.aggregate([
      { $match: { ...matchQuery, status: 'open' } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // By category
    const byCategory = await SecurityFinding.aggregate([
      { $match: { ...matchQuery, status: 'open' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // By provider
    const byProvider = await SecurityFinding.aggregate([
      { $match: { ...matchQuery, status: 'open' } },
      { $group: { _id: '$provider', count: { $sum: 1 } } }
    ]);

    // Trend over time
    const trend = await SecurityFinding.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$firstSeenAt' }
          },
          newFindings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top affected resources
    const topResources = await SecurityFinding.aggregate([
      { $match: { ...matchQuery, status: 'open' } },
      { $group: { _id: '$resourceId', count: { $sum: 1 }, resourceName: { $first: '$resourceName' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        bySeverity: bySeverity.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        byCategory: byCategory.map(c => ({ category: c._id, count: c.count })),
        byProvider: byProvider.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {}),
        trend,
        topResources
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get finding statistics',
      details: error.message
    });
  }
};

/**
 * Get remediation code for a finding
 */
exports.getRemediationCode = async (req, res) => {
  try {
    const { findingId } = req.params;
    const { format = 'terraform' } = req.query;

    const finding = await SecurityFinding.findOne({ findingId });
    if (!finding) {
      return res.status(404).json({
        success: false,
        error: 'Finding not found'
      });
    }

    const code = finding.remediationCode?.[format] || 
      `# No ${format} remediation code available for this finding.\n# Recommendation: ${finding.recommendation}`;

    res.json({
      success: true,
      data: {
        findingId,
        format,
        code,
        recommendation: finding.recommendation,
        remediationSteps: finding.remediationSteps
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get remediation code',
      details: error.message
    });
  }
};
