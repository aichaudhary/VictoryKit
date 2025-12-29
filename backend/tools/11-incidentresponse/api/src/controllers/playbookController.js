/**
 * Playbook Controller
 * Handle incident response playbook operations
 */

const Playbook = require("../models/Playbook");
const Task = require("../models/Task");
const Incident = require("../models/Incident");

// Create playbook
exports.createPlaybook = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const playbook = new Playbook({
      userId,
      ...req.body,
    });

    await playbook.save();

    res.status(201).json({
      success: true,
      data: playbook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all playbooks
exports.getPlaybooks = async (req, res) => {
  try {
    const { incidentType, isActive, limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id || req.query.userId;

    const filter = {};
    if (userId) filter.userId = userId;
    if (incidentType) filter.incidentTypes = incidentType;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const playbooks = await Playbook.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Playbook.countDocuments(filter);

    res.json({
      success: true,
      data: playbooks,
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

// Get single playbook
exports.getPlaybook = async (req, res) => {
  try {
    const playbook = await Playbook.findById(req.params.id);

    if (!playbook) {
      return res.status(404).json({
        success: false,
        error: "Playbook not found",
      });
    }

    res.json({
      success: true,
      data: playbook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update playbook
exports.updatePlaybook = async (req, res) => {
  try {
    const playbook = await Playbook.findByIdAndUpdate(
      req.params.id,
      { ...req.body, version: req.body.version ? req.body.version + 1 : 1 },
      { new: true }
    );

    if (!playbook) {
      return res.status(404).json({
        success: false,
        error: "Playbook not found",
      });
    }

    res.json({
      success: true,
      data: playbook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Execute playbook
exports.executePlaybook = async (req, res) => {
  try {
    const { incidentId } = req.body;
    const userId = req.user?.id || req.body.userId;

    const playbook = await Playbook.findById(req.params.id);

    if (!playbook) {
      return res.status(404).json({
        success: false,
        error: "Playbook not found",
      });
    }

    // Get incident
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    // Create tasks from playbook phases
    const createdTasks = [];

    for (const phase of playbook.phases) {
      for (const task of phase.tasks) {
        const newTask = new Task({
          userId,
          incidentId: incident._id,
          playbookTaskId: task.taskId,
          name: task.name,
          description: task.description,
          phase: phase.name,
          type: task.type,
          priority: incident.severity === "critical" ? "critical" : "high",
          dueAt: task.sla ? new Date(Date.now() + task.sla * 60000) : null,
        });

        await newTask.save();
        createdTasks.push(newTask);
      }
    }

    // Update incident with playbook
    incident.playbook = playbook._id;
    incident.timeline.push({
      event: `Playbook "${playbook.name}" executed`,
      actor: "system",
      details: {
        playbookId: playbook.playbookId,
        tasksCreated: createdTasks.length,
      },
    });
    await incident.save();

    res.json({
      success: true,
      data: {
        playbook: playbook.playbookId,
        tasksCreated: createdTasks.length,
        tasks: createdTasks,
      },
      message: "Playbook executed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
