/**
 * Playbook Model
 * Incident response playbooks
 */

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ["manual", "automated", "approval"],
    default: "manual",
  },
  assignee: { type: String },
  sla: { type: Number },
  automation: {
    script: { type: String },
    integration: { type: String },
    parameters: { type: mongoose.Schema.Types.Mixed },
  },
  dependencies: [{ type: String }],
});

const phaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
  tasks: [taskSchema],
});

const triggerSchema = new mongoose.Schema({
  condition: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
});

const automationSchema = new mongoose.Schema({
  trigger: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String },
  parameters: { type: mongoose.Schema.Types.Mixed },
});

const playbookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    playbookId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String },
    incidentTypes: [{ type: String }],
    triggers: [triggerSchema],
    phases: [phaseSchema],
    automations: [automationSchema],
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

// Generate playbook ID
playbookSchema.pre("save", async function (next) {
  if (!this.playbookId) {
    const count = await this.constructor.countDocuments();
    this.playbookId = `PB-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Playbook", playbookSchema);
