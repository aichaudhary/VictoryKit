/**
 * Incident Controller
 * Handle security incident operations with real-world integrations
 */

const Incident = require("../models/Incident");
const incidentService = require("../services/incidentService");

// Real-world integration services
const threatIntelService = require("../services/threatIntelService");
const siemService = require("../services/siemService");
const notificationService = require("../services/notificationService");
const aiAnalysisService = require("../services/aiAnalysisService");
const edrService = require("../services/edrService");
const ticketingService = require("../services/ticketingService");

// Create incident
exports.createIncident = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const incident = new Incident({
      userId,
      ...req.body,
      timeline: [
        {
          event: "Incident created",
          actor: "system",
          details: { source: req.body.source || "manual" },
        },
      ],
    });

    await incident.save();

    // Trigger external security integrations
    incidentService.integrateWithSecurityStack(incident._id, {
      type: incident.type,
      severity: incident.severity,
      status: incident.status,
      affectedAssets: incident.affectedAssets,
      indicators: incident.indicators,
      userId: incident.userId
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the incident creation if integration fails
    });

    res.status(201).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all incidents
exports.getIncidents = async (req, res) => {
  try {
    const { status, severity, priority, limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id || req.query.userId;

    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;

    const incidents = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Incident.countDocuments(filter);

    res.json({
      success: true,
      data: incidents,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single incident
exports.getIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("playbook")
      .populate("leadInvestigator");

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    res.json({
      success: true,
      data: incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update incident
exports.updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        $push: {
          timeline: {
            event: "Incident updated",
            actor: req.user?.id || "system",
            details: { fields: Object.keys(req.body) },
          },
        },
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    res.json({
      success: true,
      data: incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Escalate incident
exports.escalateIncident = async (req, res) => {
  try {
    const { newSeverity, newPriority, reason } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        severity: newSeverity || "critical",
        priority: newPriority || "p1",
        $push: {
          timeline: {
            event: "Incident escalated",
            actor: req.user?.id || "system",
            details: { reason, newSeverity, newPriority },
          },
        },
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    res.json({
      success: true,
      data: incident,
      message: "Incident escalated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Close incident
exports.closeIncident = async (req, res) => {
  try {
    const { resolution, lessonsLearned } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        status: "closed",
        resolvedAt: new Date(),
        $push: {
          timeline: {
            event: "Incident closed",
            actor: req.user?.id || "system",
            details: { resolution, lessonsLearned },
          },
        },
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    // Calculate metrics
    if (incident.detectedAt) {
      incident.metrics = {
        ...incident.metrics,
        timeToResolve: Math.round((new Date() - incident.detectedAt) / 60000),
      };
      await incident.save();
    }

    res.json({
      success: true,
      data: incident,
      message: "Incident closed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get timeline
exports.getTimeline = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    res.json({
      success: true,
      data: incident.timeline.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      ),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// AI Analysis
exports.analyzeIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    // Call ML engine for analysis
    const analysis = await incidentService.analyzeWithAI(incident);

    // Update incident with classification
    if (analysis.classification) {
      incident.classification = analysis.classification;
      incident.timeline.push({
        event: "AI analysis completed",
        actor: "ml-engine",
        details: analysis,
      });
      await incident.save();
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Dashboard metrics
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const filter = userId ? { userId } : {};

    const [
      totalIncidents,
      openIncidents,
      criticalIncidents,
      statusBreakdown,
      severityBreakdown,
      recentIncidents,
    ] = await Promise.all([
      Incident.countDocuments(filter),
      Incident.countDocuments({ ...filter, status: { $nin: ["closed"] } }),
      Incident.countDocuments({
        ...filter,
        severity: "critical",
        status: { $nin: ["closed"] },
      }),
      Incident.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Incident.aggregate([
        { $match: filter },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
      Incident.find(filter).sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          total: totalIncidents,
          open: openIncidents,
          critical: criticalIncidents,
        },
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        severityBreakdown: severityBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentIncidents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ============= REAL-WORLD INTEGRATION ENDPOINTS =============

/**
 * Enrich IOCs with threat intelligence
 * POST /incidents/:id/enrich-iocs
 */
exports.enrichIOCs = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    if (!incident.indicators || incident.indicators.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No indicators to enrich",
      });
    }

    // Enrich all IOCs with threat intelligence
    const enrichedIOCs = await threatIntelService.enrichIOCs(incident.indicators);

    // Update incident with enriched data
    incident.indicators = enrichedIOCs.map((enriched, idx) => ({
      ...incident.indicators[idx].toObject(),
      enrichment: enriched
    }));

    incident.timeline.push({
      event: "IOCs enriched with threat intelligence",
      actor: req.user?.id || "system",
      details: {
        enrichedCount: enrichedIOCs.filter(e => !e.error).length,
        sources: [...new Set(enrichedIOCs.flatMap(e => e.sources || []))]
      }
    });

    await incident.save();

    res.json({
      success: true,
      data: {
        indicators: incident.indicators,
        summary: {
          total: enrichedIOCs.length,
          malicious: enrichedIOCs.filter(e => e.malicious || e.threat_level === 'high').length,
          suspicious: enrichedIOCs.filter(e => e.suspicious || e.threat_level === 'medium').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Search SIEM for correlated events
 * POST /incidents/:id/siem-search
 */
exports.siemSearch = async (req, res) => {
  try {
    const { query, timeRange, platform } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    // Build search query from IOCs if not provided
    const searchQuery = query || incident.indicators?.map(i => i.value).join(' OR ');
    
    const results = await siemService.searchLogs(searchQuery, timeRange || '24h', platform);

    // Log the search in timeline
    incident.timeline.push({
      event: "SIEM search performed",
      actor: req.user?.id || "system",
      details: {
        query: searchQuery.substring(0, 100),
        resultsCount: results.events?.length || 0,
        sources: results.sources || []
      }
    });
    await incident.save();

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Correlate IOCs across SIEM
 * POST /incidents/:id/correlate
 */
exports.correlateIOCs = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    if (!incident.indicators || incident.indicators.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No indicators to correlate",
      });
    }

    const correlations = await siemService.correlateIOCs(incident.indicators, '7d');

    // Update incident with correlation data
    incident.correlations = correlations;
    incident.timeline.push({
      event: "IOC correlation completed",
      actor: req.user?.id || "system",
      details: {
        matchCount: correlations.matches?.length || 0,
        timeRange: '7d'
      }
    });
    await incident.save();

    res.json({
      success: true,
      data: correlations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Send notifications for incident
 * POST /incidents/:id/notify
 */
exports.sendNotifications = async (req, res) => {
  try {
    const { channels } = req.body; // ['slack', 'teams', 'email', 'pagerduty', 'sms']
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    const results = await notificationService.sendIncidentAlert(incident, channels);

    // Log notifications in timeline
    incident.timeline.push({
      event: "Notifications sent",
      actor: req.user?.id || "system",
      details: {
        channels: results.successfulChannels || [],
        failures: results.failures?.map(f => f.channel) || []
      }
    });
    await incident.save();

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * AI-powered comprehensive analysis
 * POST /incidents/:id/ai-analyze
 */
exports.aiAnalyze = async (req, res) => {
  try {
    const { analysisType } = req.body; // 'comprehensive', 'threat', 'impact', 'rootcause', 'playbook'
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    const analysis = await aiAnalysisService.analyzeIncident(incident, analysisType || 'comprehensive');

    // Update incident with AI analysis
    incident.aiAnalysis = {
      ...analysis,
      analyzedAt: new Date()
    };
    
    if (analysis.analysis?.mitre_techniques) {
      incident.classification = {
        ...incident.classification,
        mitreTechniques: analysis.analysis.mitre_techniques
      };
    }

    incident.timeline.push({
      event: "AI analysis completed",
      actor: analysis.provider || "ai-engine",
      details: {
        analysisType,
        riskScore: analysis.analysis?.risk_score,
        confidence: analysis.analysis?.confidence
      }
    });
    await incident.save();

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Search EDR platforms for indicators
 * POST /incidents/:id/edr-search
 */
exports.edrSearch = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    if (!incident.indicators || incident.indicators.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No indicators to search",
      });
    }

    const results = await edrService.searchIndicators(incident.indicators);

    // Update affected assets from EDR results
    if (results.affectedEndpoints?.length > 0) {
      const existingIds = new Set(incident.affectedAssets?.map(a => a.assetId || a.hostname) || []);
      
      results.affectedEndpoints.forEach(endpoint => {
        if (!existingIds.has(endpoint.hostname)) {
          incident.affectedAssets.push({
            assetId: endpoint.id,
            hostname: endpoint.hostname,
            type: 'endpoint',
            platform: endpoint.platform,
            status: endpoint.status,
            discoveredBy: endpoint.source
          });
        }
      });
    }

    incident.timeline.push({
      event: "EDR search completed",
      actor: req.user?.id || "system",
      details: {
        matchCount: results.matches?.length || 0,
        endpointsFound: results.affectedEndpoints?.length || 0,
        sources: results.sources || []
      }
    });
    await incident.save();

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Isolate endpoint via EDR
 * POST /incidents/:id/isolate-endpoint
 */
exports.isolateEndpoint = async (req, res) => {
  try {
    const { endpointId, platform, reason } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    const result = await edrService.isolateEndpoint(endpointId, platform);

    incident.timeline.push({
      event: result.success ? "Endpoint isolated" : "Endpoint isolation failed",
      actor: req.user?.id || "system",
      details: {
        endpointId,
        platform,
        reason,
        result: result.action || result.error
      }
    });

    // Update containment status
    if (result.success) {
      incident.containment = {
        ...incident.containment,
        isolatedEndpoints: [...(incident.containment?.isolatedEndpoints || []), endpointId],
        lastAction: new Date()
      };
    }
    await incident.save();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Create tickets in external systems
 * POST /incidents/:id/create-tickets
 */
exports.createTickets = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    const results = await ticketingService.createTicket(incident);

    // Store ticket references
    incident.externalTickets = [
      ...(incident.externalTickets || []),
      ...results.tickets
    ];

    incident.timeline.push({
      event: "External tickets created",
      actor: req.user?.id || "system",
      details: {
        tickets: results.tickets.map(t => ({ system: t.system, id: t.ticketId })),
        errors: results.errors
      }
    });
    await incident.save();

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Page on-call responders via PagerDuty
 * POST /incidents/:id/page-oncall
 */
exports.pageOnCall = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    const result = await ticketingService.createPagerDutyIncident(incident);

    incident.externalTickets = [
      ...(incident.externalTickets || []),
      result
    ];

    incident.timeline.push({
      event: "On-call responders paged",
      actor: req.user?.id || "system",
      details: {
        pagerdutyIncident: result.incidentNumber,
        status: result.status
      }
    });
    await incident.save();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Push incident to SIEM
 * POST /incidents/:id/push-to-siem
 */
exports.pushToSIEM = async (req, res) => {
  try {
    const { platform } = req.body; // 'splunk', 'elastic', 'sentinel'
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    const result = await siemService.pushIncident(incident, platform);

    incident.timeline.push({
      event: `Incident pushed to ${platform || 'SIEM'}`,
      actor: req.user?.id || "system",
      details: result
    });
    await incident.save();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get executive summary using AI
 * GET /incidents/:id/executive-summary
 */
exports.getExecutiveSummary = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    const summary = await aiAnalysisService.generateExecutiveSummary(incident);

    res.json({
      success: true,
      data: {
        incidentId: incident.incidentId,
        summary,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
  }
};
