const { Event, Incident, Playbook, ThreatIntel } = require('../models');
const siemService = require('../services/siemService');

// Health Check
exports.getStatus = async (req, res) => {
  try {
    const stats = {
      status: 'operational',
      service: 'SIEMCommander',
      timestamp: new Date(),
      dbConnection: 'connected',
      stats: {
        totalEvents: await Event.countDocuments(),
        activeIncidents: await Incident.countDocuments({ status: { $in: ['open', 'investigating'] } }),
        activePlaybooks: await Playbook.countDocuments({ active: true }),
        threatIntelIOCs: await ThreatIntel.countDocuments({ active: true })
      }
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Event Management
exports.ingestEvents = async (req, res) => {
  try {
    const { source_type, events, auto_correlate = false, normalize = true } = req.body;
    
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Events array is required' });
    }

    const ingestedEvents = [];
    for (const eventData of events) {
      const event = new Event({
        eventId: eventData.eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: eventData.timestamp || new Date(),
        sourceType: source_type,
        severity: eventData.severity || 'medium',
        category: eventData.category,
        sourceIp: eventData.sourceIp,
        destinationIp: eventData.destinationIp,
        sourcePort: eventData.sourcePort,
        destinationPort: eventData.destinationPort,
        protocol: eventData.protocol,
        action: eventData.action,
        message: eventData.message || eventData.raw_log,
        rawLog: eventData.raw_log,
        normalized: normalize,
        metadata: eventData.metadata || {},
        tags: eventData.tags || []
      });
      
      await event.save();
      ingestedEvents.push(event);
    }

    // Auto-correlate if requested
    if (auto_correlate) {
      // Simple correlation by sourceIp in last 5 minutes
      const correlationWindow = new Date(Date.now() - 5 * 60 * 1000);
      const correlationId = `corr_${Date.now()}`;
      
      for (const event of ingestedEvents) {
        if (event.sourceIp) {
          await Event.updateMany(
            {
              sourceIp: event.sourceIp,
              timestamp: { $gte: correlationWindow },
              correlationId: { $exists: false }
            },
            { $set: { correlationId } }
          );
        }
      }
    }

    res.json({
      success: true,
      ingested: ingestedEvents.length,
      events: ingestedEvents.map(e => ({ eventId: e.eventId, severity: e.severity }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 100, severity, sourceType, startTime, endTime } = req.query;
    
    const query = {};
    if (severity) query.severity = severity;
    if (sourceType) query.sourceType = sourceType;
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = new Date(startTime);
      if (endTime) query.timestamp.$lte = new Date(endTime);
    }

    const events = await Event.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Event.countDocuments(query);

    res.json({
      events,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.eventId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.queryEvents = async (req, res) => {
  try {
    const { query, time_range, limit = 1000, sort_by = 'timestamp' } = req.body;
    
    // Simple query parsing (in production, use proper SPL/KQL parser)
    const mongoQuery = {};
    if (time_range) {
      mongoQuery.timestamp = {
        $gte: new Date(time_range.start),
        $lte: new Date(time_range.end)
      };
    }

    const events = await Event.find(mongoQuery)
      .sort({ [sort_by]: -1 })
      .limit(parseInt(limit));

    res.json({
      query,
      results: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.correlateEvents = async (req, res) => {
  try {
    const { event_ids, time_window = '5m', min_confidence = 70 } = req.body;
    
    const events = await Event.find({ eventId: { $in: event_ids } });
    
    // Simple correlation: group by sourceIp
    const correlations = {};
    for (const event of events) {
      const key = event.sourceIp || 'unknown';
      if (!correlations[key]) {
        correlations[key] = [];
      }
      correlations[key].push(event);
    }

    const correlatedGroups = Object.entries(correlations)
      .filter(([key, events]) => events.length > 1)
      .map(([key, events]) => ({
        correlationKey: key,
        events: events.length,
        confidence: Math.min(100, events.length * 20),
        eventIds: events.map(e => e.eventId)
      }));

    res.json({
      correlations: correlatedGroups,
      total: correlatedGroups.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Threat Detection
exports.detectThreats = async (req, res) => {
  try {
    const { time_window = '24h', severity_threshold = 'medium', use_threat_intel = true } = req.body;
    
    const timeMap = { '1h': 1, '6h': 6, '24h': 24, '7d': 168, '30d': 720 };
    const hours = timeMap[time_window] || 24;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const events = await Event.find({
      timestamp: { $gte: startTime },
      severity: { $in: ['high', 'critical'] }
    }).limit(1000);

    const threats = [];
    const ipGroups = {};
    
    // Group by IP
    for (const event of events) {
      if (event.sourceIp) {
        if (!ipGroups[event.sourceIp]) {
          ipGroups[event.sourceIp] = [];
        }
        ipGroups[event.sourceIp].push(event);
      }
    }

    // Detect anomalies
    for (const [ip, ipEvents] of Object.entries(ipGroups)) {
      if (ipEvents.length > 5) {
        threats.push({
          threatId: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'anomaly_detection',
          sourceIp: ip,
          severity: ipEvents.some(e => e.severity === 'critical') ? 'critical' : 'high',
          eventCount: ipEvents.length,
          description: `Suspicious activity from ${ip}: ${ipEvents.length} events in ${time_window}`,
          detectedAt: new Date()
        });
      }
    }

    res.json({
      threats,
      total: threats.length,
      timeWindow: time_window
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.threatHunt = async (req, res) => {
  try {
    const { hunt_hypothesis, iocs = [], scope = [], time_range } = req.body;
    
    const findings = [];
    
    // Hunt for IOCs in events
    if (iocs.length > 0) {
      const events = await Event.find({
        $or: [
          { sourceIp: { $in: iocs } },
          { destinationIp: { $in: iocs } },
          { 'metadata.hash': { $in: iocs } }
        ]
      }).limit(500);

      findings.push({
        type: 'ioc_match',
        matches: events.length,
        events: events.slice(0, 10).map(e => ({ eventId: e.eventId, sourceIp: e.sourceIp }))
      });
    }

    res.json({
      hypothesis: hunt_hypothesis,
      findings,
      totalFindings: findings.reduce((sum, f) => sum + (f.matches || 0), 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Incident Management
exports.createIncident = async (req, res) => {
  try {
    const { title, description, severity, category, assign_to, playbook_id, auto_execute, affected_assets } = req.body;
    
    const incident = new Incident({
      incidentId: `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      severity,
      category,
      assignedTo: assign_to ? { userId: assign_to } : undefined,
      affectedAssets: affected_assets || [],
      timeline: [{
        timestamp: new Date(),
        action: 'incident_created',
        actor: req.user?.username || 'system',
        details: 'Incident created'
      }]
    });

    if (playbook_id) {
      incident.playbook = {
        playbookId: playbook_id,
        executed: false
      };
    }

    await incident.save();

    // Auto-execute playbook if requested
    if (auto_execute && playbook_id) {
      // Execute playbook asynchronously
      executePlaybookForIncident(playbook_id, incident.incidentId).catch(console.error);
    }

    res.status(201).json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const { status, severity, category, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (category) query.category = category;

    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Incident.countDocuments(query);

    res.json({
      incidents,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findOne({ incidentId: req.params.incidentId })
      .populate('relatedEvents');
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findOne({ incidentId: req.params.incidentId });
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    Object.assign(incident, req.body);
    
    incident.timeline.push({
      timestamp: new Date(),
      action: 'incident_updated',
      actor: req.user?.username || 'system',
      details: 'Incident updated'
    });

    if (req.body.status === 'resolved') {
      incident.resolvedAt = new Date();
    }

    await incident.save();

    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteIncident = async (req, res) => {
  try {
    await Incident.deleteOne({ incidentId: req.params.incidentId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Playbook Management
exports.executePlaybook = async (req, res) => {
  try {
    const { playbook_id, incident_id, dry_run = false, parameters = {} } = req.body;
    
    const playbook = await Playbook.findOne({ playbookId: playbook_id });
    
    if (!playbook) {
      return res.status(404).json({ error: 'Playbook not found' });
    }

    const executionId = `exec_${Date.now()}`;
    const results = [];

    for (const step of playbook.steps) {
      results.push({
        stepNumber: step.stepNumber,
        name: step.name,
        action: step.action,
        status: dry_run ? 'simulated' : 'executed',
        result: `${step.action} ${dry_run ? 'would be' : 'was'} executed`
      });
    }

    if (!dry_run) {
      playbook.executionStats.totalExecutions += 1;
      playbook.executionStats.successfulExecutions += 1;
      playbook.executionStats.lastExecuted = new Date();
      await playbook.save();
    }

    res.json({
      success: true,
      executionId,
      playbookId: playbook_id,
      dryRun: dry_run,
      steps: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlaybooks = async (req, res) => {
  try {
    const { category, active } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (active !== undefined) query.active = active === 'true';

    const playbooks = await Playbook.find(query);

    res.json({ playbooks, total: playbooks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlaybookById = async (req, res) => {
  try {
    const playbook = await Playbook.findOne({ playbookId: req.params.playbookId });
    
    if (!playbook) {
      return res.status(404).json({ error: 'Playbook not found' });
    }

    res.json(playbook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPlaybook = async (req, res) => {
  try {
    const playbook = new Playbook({
      playbookId: `pb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...req.body
    });

    await playbook.save();

    res.status(201).json({ success: true, playbook });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePlaybook = async (req, res) => {
  try {
    const playbook = await Playbook.findOne({ playbookId: req.params.playbookId });
    
    if (!playbook) {
      return res.status(404).json({ error: 'Playbook not found' });
    }

    Object.assign(playbook, req.body);
    await playbook.save();

    res.json({ success: true, playbook });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Threat Intelligence
exports.addThreatIntel = async (req, res) => {
  try {
    const { iocType, iocValue, threatType, severity, confidence, source } = req.body;
    
    const threatIntel = new ThreatIntel({
      iocId: `ioc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      iocType,
      iocValue,
      threatType,
      severity: severity || 'medium',
      confidence: confidence || 75,
      source: source || { feed: 'manual', provider: 'user' }
    });

    await threatIntel.save();

    res.status(201).json({ success: true, threatIntel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getThreatIntel = async (req, res) => {
  try {
    const { iocType, threatType, active = true } = req.query;
    
    const query = { active: active === 'true' };
    if (iocType) query.iocType = iocType;
    if (threatType) query.threatType = threatType;

    const threatIntel = await ThreatIntel.find(query)
      .sort({ confidence: -1 })
      .limit(1000);

    res.json({ threatIntel, total: threatIntel.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateThreatIntelFeeds = async (req, res) => {
  try {
    const { feed_sources = [], auto_apply = false } = req.body;
    
    // Simulate feed update
    const updated = feed_sources.length;

    res.json({
      success: true,
      feedsUpdated: updated,
      autoApplied: auto_apply,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkIOC = async (req, res) => {
  try {
    const { iocValue } = req.params;
    
    const threatIntel = await ThreatIntel.findOne({ iocValue, active: true });

    res.json({
      found: !!threatIntel,
      iocValue,
      threat: threatIntel || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Compliance & Reporting
exports.generateReport = async (req, res) => {
  try {
    const { report_type, compliance_framework, format, time_period, include_charts, include_raw_data } = req.body;
    
    const reportId = `report_${Date.now()}`;
    
    // Generate report data based on type
    const reportData = {
      reportId,
      type: report_type,
      framework: compliance_framework,
      format,
      generatedAt: new Date(),
      period: time_period,
      summary: {
        totalEvents: await Event.countDocuments(),
        totalIncidents: await Incident.countDocuments(),
        criticalIncidents: await Incident.countDocuments({ severity: 'critical' })
      }
    };

    res.json({
      success: true,
      reportId,
      status: 'generated',
      downloadUrl: `/api/v1/siemcommander/reports/${reportId}/download`,
      report: reportData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    res.json({ reports: [], total: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    res.json({ id: req.params.id, status: 'completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dashboard & Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stats = {
      events: {
        total: await Event.countDocuments(),
        last24h: await Event.countDocuments({ timestamp: { $gte: last24h } }),
        bySeverity: {
          critical: await Event.countDocuments({ severity: 'critical' }),
          high: await Event.countDocuments({ severity: 'high' }),
          medium: await Event.countDocuments({ severity: 'medium' }),
          low: await Event.countDocuments({ severity: 'low' })
        }
      },
      incidents: {
        total: await Incident.countDocuments(),
        open: await Incident.countDocuments({ status: 'open' }),
        investigating: await Incident.countDocuments({ status: 'investigating' }),
        resolved: await Incident.countDocuments({ status: 'resolved' })
      },
      threats: {
        activeIOCs: await ThreatIntel.countDocuments({ active: true }),
        highConfidence: await ThreatIntel.countDocuments({ confidence: { $gte: 80 } })
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getThreatTimeline = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);

    const events = await Event.find({
      timestamp: { $gte: startTime },
      severity: { $in: ['high', 'critical'] }
    }).sort({ timestamp: -1 }).limit(100);

    const timeline = events.map(e => ({
      timestamp: e.timestamp,
      severity: e.severity,
      category: e.category,
      sourceIp: e.sourceIp,
      message: e.message
    }));

    res.json({ timeline, total: timeline.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Configuration
exports.getConfig = async (req, res) => {
  try {
    res.json({
      autoScan: true,
      alertThreshold: 0.8,
      category: 'SIEM',
      correlationEnabled: true,
      threatIntelEnabled: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    res.json({ success: true, config: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function for async playbook execution
async function executePlaybookForIncident(playbookId, incidentId) {
  // Implementation for async playbook execution
  console.log(`Executing playbook ${playbookId} for incident ${incidentId}`);
}
