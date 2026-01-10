/**
 * Incident Controller
 * Manages bot attack incidents
 */

const mongoose = require("mongoose");
const { broadcastAlert } = require("../websocket");

// Incident Schema
const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  severity: { 
    type: String, 
    required: true, 
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "investigating", "mitigating", "resolved"],
    default: "active"
  },
  type: {
    type: String,
    required: true,
    enum: ["credential_stuffing", "scraping", "ddos", "spam", "fraud", "api_abuse", "other"]
  },
  affectedResources: [{
    type: String, // paths, endpoints, etc.
    impact: String
  }],
  sourceIPs: [String],
  botSignatures: [String],
  metrics: {
    requestsBlocked: { type: Number, default: 0 },
    uniqueBots: { type: Number, default: 0 },
    peakRPS: { type: Number, default: 0 },
    duration: Number // seconds
  },
  actions: [{
    action: String,
    performedBy: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],
  timeline: [{
    event: String,
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }],
  resolution: {
    summary: String,
    resolvedAt: Date,
    resolvedBy: String,
    preventiveMeasures: [String]
  },
  metadata: {
    createdBy: String,
    assignedTo: String,
    tags: [String]
  }
}, { timestamps: true });

const Incident = mongoose.models.Incident || mongoose.model("Incident", incidentSchema);

/**
 * Get all incidents
 */
exports.getAll = async (req, res, next) => {
  try {
    const { status, severity, type, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Incident.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      incidents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get incident by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found"
      });
    }
    
    res.json({
      success: true,
      incident
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new incident
 */
exports.create = async (req, res, next) => {
  try {
    const { 
      title, description, severity, type, 
      affectedResources, sourceIPs, botSignatures,
      assignedTo, tags 
    } = req.body;
    
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        error: "Title and type are required"
      });
    }
    
    const incident = new Incident({
      title,
      description,
      severity: severity || "medium",
      type,
      status: "active",
      affectedResources: affectedResources || [],
      sourceIPs: sourceIPs || [],
      botSignatures: botSignatures || [],
      timeline: [{
        event: "Incident created",
        timestamp: new Date()
      }],
      metadata: {
        createdBy: req.user?.id || "system",
        assignedTo,
        tags: tags || []
      }
    });
    
    await incident.save();
    
    // Broadcast alert for new incident
    broadcastAlert({
      severity: incident.severity,
      message: `New incident: ${title}`,
      incidentId: incident._id,
      type: incident.type
    });
    
    res.status(201).json({
      success: true,
      message: "Incident created successfully",
      incident
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update incident
 */
exports.update = async (req, res, next) => {
  try {
    const { 
      title, description, severity, status, 
      affectedResources, sourceIPs, botSignatures,
      metrics, actionNote 
    } = req.body;
    
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found"
      });
    }
    
    // Track status changes in timeline
    if (status && status !== incident.status) {
      incident.timeline.push({
        event: `Status changed from ${incident.status} to ${status}`,
        timestamp: new Date()
      });
    }
    
    if (title) incident.title = title;
    if (description !== undefined) incident.description = description;
    if (severity) incident.severity = severity;
    if (status) incident.status = status;
    if (affectedResources) incident.affectedResources = affectedResources;
    if (sourceIPs) incident.sourceIPs = sourceIPs;
    if (botSignatures) incident.botSignatures = botSignatures;
    if (metrics) incident.metrics = { ...incident.metrics, ...metrics };
    
    // Add action if note provided
    if (actionNote) {
      incident.actions.push({
        action: actionNote,
        performedBy: req.user?.id || "system",
        timestamp: new Date()
      });
    }
    
    await incident.save();
    
    res.json({
      success: true,
      message: "Incident updated successfully",
      incident
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve incident
 */
exports.resolve = async (req, res, next) => {
  try {
    const { summary, preventiveMeasures } = req.body;
    
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found"
      });
    }
    
    incident.status = "resolved";
    incident.resolution = {
      summary: summary || "Incident resolved",
      resolvedAt: new Date(),
      resolvedBy: req.user?.id || "system",
      preventiveMeasures: preventiveMeasures || []
    };
    
    incident.timeline.push({
      event: "Incident resolved",
      timestamp: new Date(),
      details: { summary }
    });
    
    // Calculate duration
    incident.metrics.duration = Math.floor(
      (new Date() - incident.createdAt) / 1000
    );
    
    await incident.save();
    
    res.json({
      success: true,
      message: "Incident resolved successfully",
      incident
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active incidents
 */
exports.getActive = async (req, res, next) => {
  try {
    const incidents = await Incident.find({
      status: { $in: ["active", "investigating", "mitigating"] }
    }).sort({ severity: -1, createdAt: -1 });
    
    res.json({
      success: true,
      total: incidents.length,
      incidents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get incident timeline
 */
exports.getTimeline = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .select("title timeline actions status");
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found"
      });
    }
    
    // Merge timeline and actions, sorted by timestamp
    const combinedTimeline = [
      ...incident.timeline.map(t => ({ ...t.toObject(), type: "event" })),
      ...incident.actions.map(a => ({ ...a.toObject(), type: "action" }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      incidentId: incident._id,
      title: incident.title,
      status: incident.status,
      timeline: combinedTimeline
    });
  } catch (error) {
    next(error);
  }
};
