/**
 * Task Model
 * Incident response tasks
 */

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
    },
    taskId: { type: String, unique: true, required: true },
    playbookTaskId: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    phase: { type: String },
    type: {
      type: String,
      enum: ["manual", "automated", "approval"],
      default: "manual",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "blocked", "completed", "skipped"],
      default: "pending",
    },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    dueAt: { type: Date },
    slaBreached: { type: Boolean, default: false },
    result: {
      outcome: { type: String },
      notes: { type: String },
      artifacts: [{ type: String }],
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Generate task ID
taskSchema.pre("save", async function (next) {
  if (!this.taskId) {
    const count = await this.constructor.countDocuments();
    this.taskId = `TSK-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Index
taskSchema.index({ incidentId: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);
