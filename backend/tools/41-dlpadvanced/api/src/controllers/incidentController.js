/**
 * Incident Controller - DLP Incident Management
 */

const { DLPIncident } = require('../models');

/**
 * Get all incidents
 */
exports.getAllIncidents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      severity, 
      type,
      startDate,
      endDate 
    } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.detectedAt = {};
      if (startDate) query.detectedAt.$gte = new Date(startDate);
      if (endDate) query.detectedAt.$lte = new Date(endDate);
    }
    
    const incidents = await DLPIncident.find(query)
      .sort({ detectedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await DLPIncident.countDocuments(query);
    
    res.json({
      success: true,
      data: incidents,
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
 * Get incident by ID
 */
exports.getIncidentById = async (req, res) => {
  try {
    const incident = await DLPIncident.findOne({ incidentId: req.params.id });
    
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    
    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update incident status
 */
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const incident = await DLPIncident.findOne({ incidentId: req.params.id });
    
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    
    incident.status = status;
    
    // Add note if provided
    if (note) {
      incident.investigation.notes.push({
        note,
        author: req.user?.name || 'System',
        timestamp: new Date()
      });
    }
    
    // Set timestamps based on status
    if (status === 'investigating' && !incident.acknowledgedAt) {
      incident.acknowledgedAt = new Date();
    } else if (['remediated', 'closed', 'false_positive'].includes(status)) {
      incident.resolvedAt = new Date();
    }
    
    // Add action record
    incident.actionsTaken.push({
      action: `Status changed to ${status}`,
      timestamp: new Date(),
      automated: false,
      performedBy: req.user?.name || 'User'
    });
    
    await incident.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('incident:updated', { incidentId: incident.incidentId, status });
    }
    
    res.json({
      success: true,
      message: 'Incident status updated',
      data: incident
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Assign incident to user
 */
exports.assignIncident = async (req, res) => {
  try {
    const { assigneeId, assigneeName } = req.body;
    
    const incident = await DLPIncident.findOne({ incidentId: req.params.id });
    
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    
    incident.investigation.assignedTo = assigneeId;
    incident.actionsTaken.push({
      action: `Assigned to ${assigneeName}`,
      timestamp: new Date(),
      automated: false,
      performedBy: req.user?.name || 'User'
    });
    
    await incident.save();
    
    res.json({
      success: true,
      message: 'Incident assigned',
      data: incident
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add note to incident
 */
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({ success: false, error: 'Note is required' });
    }
    
    const incident = await DLPIncident.findOne({ incidentId: req.params.id });
    
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    
    incident.investigation.notes.push({
      note,
      author: req.user?.name || 'User',
      timestamp: new Date()
    });
    
    await incident.save();
    
    res.json({
      success: true,
      message: 'Note added',
      data: incident
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get incident statistics
 */
exports.getIncidentStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const [
      byStatus,
      bySeverity,
      byType,
      timeline
    ] = await Promise.all([
      // By status
      DLPIncident.aggregate([
        { $match: { detectedAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // By severity
      DLPIncident.aggregate([
        { $match: { detectedAt: { $gte: startDate } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      // By type
      DLPIncident.aggregate([
        { $match: { detectedAt: { $gte: startDate } } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      // Timeline (daily counts)
      DLPIncident.aggregate([
        { $match: { detectedAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
        bySeverity: Object.fromEntries(bySeverity.map(s => [s._id, s.count])),
        byType: Object.fromEntries(byType.map(s => [s._id, s.count])),
        timeline
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk update incidents
 */
exports.bulkUpdateIncidents = async (req, res) => {
  try {
    const { incidentIds, update } = req.body;
    
    if (!incidentIds || !Array.isArray(incidentIds)) {
      return res.status(400).json({ success: false, error: 'Incident IDs array is required' });
    }
    
    const result = await DLPIncident.updateMany(
      { incidentId: { $in: incidentIds } },
      { $set: update }
    );
    
    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} incidents`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
