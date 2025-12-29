/**
 * Incident Controller
 * Handle security incident operations
 */

const Incident = require("../models/Incident");
const incidentService = require("../services/incidentService");

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
