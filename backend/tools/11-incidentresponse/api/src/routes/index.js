/**
 * IncidentResponse API Routes
 */

const express = require("express");
const router = express.Router();

const incidentController = require("../controllers/incidentController");
const playbookController = require("../controllers/playbookController");
const taskController = require("../controllers/taskController");
const evidenceController = require("../controllers/evidenceController");
const forensicsController = require("../controllers/forensicsController");

// ============= CORE INCIDENT ROUTES =============
router.post("/incidents", incidentController.createIncident);
router.get("/incidents", incidentController.getIncidents);
router.get("/incidents/:id", incidentController.getIncident);
router.patch("/incidents/:id", incidentController.updateIncident);
router.post("/incidents/:id/escalate", incidentController.escalateIncident);
router.post("/incidents/:id/close", incidentController.closeIncident);
router.get("/incidents/:id/timeline", incidentController.getTimeline);
router.post("/incidents/:id/analyze", incidentController.analyzeIncident);

// ============= REAL-WORLD INTEGRATION ROUTES =============

// Threat Intelligence
router.post("/incidents/:id/enrich-iocs", incidentController.enrichIOCs);

// SIEM Integration
router.post("/incidents/:id/siem-search", incidentController.siemSearch);
router.post("/incidents/:id/correlate", incidentController.correlateIOCs);
router.post("/incidents/:id/push-to-siem", incidentController.pushToSIEM);

// Notifications & Alerting
router.post("/incidents/:id/notify", incidentController.sendNotifications);

// AI Analysis
router.post("/incidents/:id/ai-analyze", incidentController.aiAnalyze);
router.get("/incidents/:id/executive-summary", incidentController.getExecutiveSummary);

// EDR Integration
router.post("/incidents/:id/edr-search", incidentController.edrSearch);
router.post("/incidents/:id/isolate-endpoint", incidentController.isolateEndpoint);

// Ticketing Systems
router.post("/incidents/:id/create-tickets", incidentController.createTickets);
router.post("/incidents/:id/page-oncall", incidentController.pageOnCall);

// ============= PLAYBOOK ROUTES =============
router.post("/playbooks", playbookController.createPlaybook);
router.get("/playbooks", playbookController.getPlaybooks);
router.get("/playbooks/:id", playbookController.getPlaybook);
router.put("/playbooks/:id", playbookController.updatePlaybook);
router.post("/playbooks/:id/execute", playbookController.executePlaybook);

// ============= TASK ROUTES =============
router.get("/tasks", taskController.getTasks);
router.get("/tasks/:id", taskController.getTask);
router.patch("/tasks/:id", taskController.updateTask);
router.post("/tasks/:id/complete", taskController.completeTask);

// ============= EVIDENCE ROUTES =============
router.post("/evidence", evidenceController.createEvidence);
router.get("/evidence", evidenceController.getEvidence);
router.get("/evidence/:id", evidenceController.getEvidenceById);
router.post("/evidence/:id/analyze", evidenceController.analyzeEvidence);

// ============= FORENSICS ROUTES =============
router.post(
  "/forensics/incidents/:id/analyze",
  forensicsController.analyzeIncident
);
router.post("/forensics/indicators", forensicsController.analyzeIndicators);
router.post(
  "/forensics/evidence/:id/analyze",
  forensicsController.analyzeEvidence
);
router.get(
  "/forensics/mitre/:techniqueId",
  forensicsController.getMitreTechnique
);
router.get(
  "/forensics/playbooks/templates",
  forensicsController.getPlaybookTemplates
);

// ============= DASHBOARD =============
router.get("/dashboard", incidentController.getDashboard);

module.exports = router;
