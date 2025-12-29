/**
 * Evidence Controller
 * Handle forensic evidence operations
 */

const Evidence = require("../models/Evidence");
const Incident = require("../models/Incident");
const evidenceService = require("../services/evidenceService");

// Create evidence
exports.createEvidence = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const evidence = new Evidence({
      userId,
      ...req.body,
      chainOfCustody: [
        {
          action: "Evidence collected",
          actor: userId,
          notes: req.body.collectionNotes,
        },
      ],
    });

    await evidence.save();

    // Update incident timeline
    await Incident.findByIdAndUpdate(req.body.incidentId, {
      $push: {
        timeline: {
          event: `Evidence "${evidence.name}" collected`,
          actor: userId,
          details: { evidenceId: evidence.evidenceId, type: evidence.type },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: evidence,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all evidence
exports.getEvidence = async (req, res) => {
  try {
    const { incidentId, type, limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id || req.query.userId;

    const filter = {};
    if (userId) filter.userId = userId;
    if (incidentId) filter.incidentId = incidentId;
    if (type) filter.type = type;

    const evidence = await Evidence.find(filter)
      .populate("incidentId", "incidentId title")
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Evidence.countDocuments(filter);

    res.json({
      success: true,
      data: evidence,
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

// Get single evidence
exports.getEvidenceById = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate("incidentId")
      .populate("chainOfCustody.actor");

    if (!evidence) {
      return res.status(404).json({
        success: false,
        error: "Evidence not found",
      });
    }

    // Add chain of custody entry for view
    evidence.chainOfCustody.push({
      action: "Evidence viewed",
      actor: req.user?.id,
      notes: "Evidence details accessed",
    });
    await evidence.save();

    res.json({
      success: true,
      data: evidence,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Analyze evidence
exports.analyzeEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        error: "Evidence not found",
      });
    }

    // Update status to in_progress
    evidence.analysis.status = "in_progress";
    await evidence.save();

    // Call ML engine for analysis
    const analysis = await evidenceService.analyzeWithAI(evidence);

    // Update evidence with analysis results
    evidence.analysis = {
      status: "completed",
      findings: analysis.findings,
      artifacts: analysis.artifacts,
      analyzedBy: req.user?.id,
      analyzedAt: new Date(),
    };

    evidence.chainOfCustody.push({
      action: "Evidence analyzed",
      actor: req.user?.id,
      notes: `AI analysis completed with ${analysis.findings.length} findings`,
    });

    await evidence.save();

    // Update incident timeline
    await Incident.findByIdAndUpdate(evidence.incidentId, {
      $push: {
        timeline: {
          event: `Evidence "${evidence.name}" analyzed`,
          actor: "ml-engine",
          details: {
            evidenceId: evidence.evidenceId,
            findingsCount: analysis.findings.length,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        evidence,
        analysis,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
