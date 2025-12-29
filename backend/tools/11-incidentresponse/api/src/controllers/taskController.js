/**
 * Task Controller
 * Handle incident response task operations
 */

const Task = require("../models/Task");
const Incident = require("../models/Incident");

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const { incidentId, status, assignee, limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id || req.query.userId;

    const filter = {};
    if (userId) filter.userId = userId;
    if (incidentId) filter.incidentId = incidentId;
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate("incidentId", "incidentId title severity")
      .sort({ priority: 1, createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
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

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("incidentId")
      .populate("assignee");

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Track status changes
    if (req.body.status === "in_progress" && !updates.startedAt) {
      updates.startedAt = new Date();
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Update incident timeline
    await Incident.findByIdAndUpdate(task.incidentId, {
      $push: {
        timeline: {
          event: `Task "${task.name}" updated to ${task.status}`,
          actor: req.user?.id || "system",
          details: { taskId: task.taskId },
        },
      },
    });

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Complete task
exports.completeTask = async (req, res) => {
  try {
    const { outcome, notes, artifacts } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        completedAt: new Date(),
        result: {
          outcome,
          notes,
          artifacts,
          completedBy: req.user?.id,
        },
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Check SLA breach
    if (task.dueAt && new Date() > task.dueAt) {
      task.slaBreached = true;
      await task.save();
    }

    // Update incident timeline
    await Incident.findByIdAndUpdate(task.incidentId, {
      $push: {
        timeline: {
          event: `Task "${task.name}" completed`,
          actor: req.user?.id || "system",
          details: { taskId: task.taskId, outcome },
        },
      },
    });

    res.json({
      success: true,
      data: task,
      message: "Task completed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
