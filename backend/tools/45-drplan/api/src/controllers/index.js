const { RecoveryPlan, RecoverySite, System, Runbook, DRTest, Contact, Incident } = require('../models');

// ==================== STATUS & HEALTH ====================
exports.getStatus = async (req, res) => {
  try {
    const [plans, sites, systems, incidents] = await Promise.all([
      RecoveryPlan.countDocuments({ isActive: true }),
      RecoverySite.countDocuments({ isActive: true }),
      System.countDocuments({ isActive: true }),
      Incident.countDocuments({ status: { $nin: ['closed', 'recovered'] } })
    ]);
    res.json({ status: 'operational', service: 'drplan', plans, sites, systems, activeIncidents: incidents, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHealth = async (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime(), memory: process.memoryUsage(), timestamp: new Date() });
};

exports.getDashboard = async (req, res) => {
  try {
    const [plans, sites, systems, runbooks, tests, incidents, contacts] = await Promise.all([
      RecoveryPlan.find({ isActive: true }).select('name status planType priority rto rpo lastTestedAt').limit(10),
      RecoverySite.find({ isActive: true }).select('name siteType status healthCheck.status'),
      System.find({ isActive: true }).select('name criticality status rto rpo'),
      Runbook.find({ isActive: true }).select('name category status lastExecutedAt').limit(10),
      DRTest.find({ status: 'scheduled' }).sort({ scheduledDate: 1 }).limit(5),
      Incident.find({ status: { $nin: ['closed'] } }).sort({ detectedAt: -1 }).limit(5),
      Contact.countDocuments({ isActive: true, status: 'active' })
    ]);
    
    const criticalSystems = systems.filter(s => s.criticality === 'mission-critical').length;
    const healthySites = sites.filter(s => s.healthCheck?.status === 'healthy').length;
    
    res.json({ 
      summary: { totalPlans: plans.length, totalSites: sites.length, totalSystems: systems.length, criticalSystems, healthySites, totalContacts: contacts },
      recentPlans: plans, sites, systems, runbooks, upcomingTests: tests, activeIncidents: incidents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConfig = async (req, res) => {
  res.json({ service: 'drplan', version: '1.0.0', features: ['plans', 'sites', 'systems', 'runbooks', 'tests', 'incidents', 'contacts'] });
};

exports.updateConfig = async (req, res) => {
  res.json({ message: 'Configuration updated', config: req.body });
};

// ==================== RECOVERY PLANS ====================
exports.getPlans = async (req, res) => {
  try {
    const { status, planType, priority } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (planType) filter.planType = planType;
    if (priority) filter.priority = priority;
    const plans = await RecoveryPlan.find(filter).populate('primarySite recoverySite systems').sort({ updatedAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findById(req.params.id).populate('primarySite recoverySite systems');
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const plan = new RecoveryPlan({ ...req.body, planId: `PLAN-${Date.now()}` });
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    await RecoveryPlan.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activatePlan = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.json({ message: 'Plan activated', plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approvePlan = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findByIdAndUpdate(req.params.id, { status: 'approved', approvedBy: req.body.approver, approvedAt: new Date() }, { new: true });
    res.json({ message: 'Plan approved', plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clonePlan = async (req, res) => {
  try {
    const original = await RecoveryPlan.findById(req.params.id).lean();
    delete original._id;
    const clone = new RecoveryPlan({ ...original, planId: `PLAN-${Date.now()}`, name: `${original.name} (Copy)`, status: 'draft' });
    await clone.save();
    res.status(201).json(clone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlanSteps = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findById(req.params.id).select('steps');
    res.json(plan?.steps || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addPlanStep = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findById(req.params.id);
    plan.steps.push(req.body);
    await plan.save();
    res.status(201).json(plan.steps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePlanStep = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findById(req.params.id);
    const stepIndex = plan.steps.findIndex(s => s._id.toString() === req.params.stepId);
    if (stepIndex >= 0) { plan.steps[stepIndex] = { ...plan.steps[stepIndex].toObject(), ...req.body }; await plan.save(); }
    res.json(plan.steps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePlanStep = async (req, res) => {
  try {
    await RecoveryPlan.findByIdAndUpdate(req.params.id, { $pull: { steps: { _id: req.params.stepId } } });
    res.json({ message: 'Step deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportPlan = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findById(req.params.id).populate('primarySite recoverySite systems');
    res.json({ export: plan, exportedAt: new Date(), format: 'json' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.importPlan = async (req, res) => {
  try {
    const plan = new RecoveryPlan({ ...req.body, planId: `PLAN-${Date.now()}`, status: 'draft' });
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== RECOVERY SITES ====================
exports.getSites = async (req, res) => {
  try {
    const sites = await RecoverySite.find({ isActive: true }).sort({ siteType: 1 });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSiteById = async (req, res) => {
  try {
    const site = await RecoverySite.findById(req.params.id);
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSite = async (req, res) => {
  try {
    const site = new RecoverySite({ ...req.body, siteId: `SITE-${Date.now()}` });
    await site.save();
    res.status(201).json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSite = async (req, res) => {
  try {
    const site = await RecoverySite.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSite = async (req, res) => {
  try {
    await RecoverySite.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Site deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSiteHealth = async (req, res) => {
  try {
    const site = await RecoverySite.findById(req.params.id).select('healthCheck replicationConfig');
    res.json({ health: site?.healthCheck, replication: site?.replicationConfig });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.initiateFailover = async (req, res) => {
  try {
    const site = await RecoverySite.findByIdAndUpdate(req.params.id, { status: 'failover-active' }, { new: true });
    res.json({ message: 'Failover initiated', site });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.initiateFailback = async (req, res) => {
  try {
    const site = await RecoverySite.findByIdAndUpdate(req.params.id, { status: 'standby' }, { new: true });
    res.json({ message: 'Failback initiated', site });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReplicationStatus = async (req, res) => {
  try {
    const site = await RecoverySite.findById(req.params.id).select('replicationConfig');
    res.json(site?.replicationConfig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forceSiteSync = async (req, res) => {
  try {
    const site = await RecoverySite.findByIdAndUpdate(req.params.id, { 'replicationConfig.lastReplicationAt': new Date() }, { new: true });
    res.json({ message: 'Sync initiated', site });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== SYSTEMS ====================
exports.getSystems = async (req, res) => {
  try {
    const systems = await System.find({ isActive: true }).populate('infrastructure.primarySite infrastructure.drSite').sort({ criticality: 1 });
    res.json(systems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSystemById = async (req, res) => {
  try {
    const system = await System.findById(req.params.id).populate('dependencies.systemId infrastructure.primarySite infrastructure.drSite');
    res.json(system);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSystem = async (req, res) => {
  try {
    const system = new System({ ...req.body, systemId: `SYS-${Date.now()}` });
    await system.save();
    res.status(201).json(system);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSystem = async (req, res) => {
  try {
    const system = await System.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(system);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSystem = async (req, res) => {
  try {
    await System.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'System deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSystemDependencies = async (req, res) => {
  try {
    const system = await System.findById(req.params.id).populate('dependencies.systemId dependents');
    res.json({ dependencies: system?.dependencies, dependents: system?.dependents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addSystemDependency = async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    system.dependencies.push(req.body);
    await system.save();
    res.status(201).json(system.dependencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    const system = await System.findById(req.params.id).select('monitoring status');
    res.json({ status: system?.status, monitoring: system?.monitoring });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.initiateSystemRecovery = async (req, res) => {
  try {
    const system = await System.findByIdAndUpdate(req.params.id, { status: 'recovering' }, { new: true });
    res.json({ message: 'Recovery initiated', system });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSystemsByCriticality = async (req, res) => {
  try {
    const systems = await System.find({ criticality: req.params.level, isActive: true });
    res.json(systems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRtoAnalysis = async (req, res) => {
  try {
    const systems = await System.find({ isActive: true }).select('name criticality rto rpo actualRecoveryTime');
    const analysis = systems.map(s => ({ name: s.name, criticality: s.criticality, rto: s.rto, rpo: s.rpo, actual: s.actualRecoveryTime, rtoMet: !s.actualRecoveryTime || s.actualRecoveryTime <= s.rto }));
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== RUNBOOKS ====================
exports.getRunbooks = async (req, res) => {
  try {
    const runbooks = await Runbook.find({ isActive: true }).sort({ category: 1 });
    res.json(runbooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRunbookById = async (req, res) => {
  try {
    const runbook = await Runbook.findById(req.params.id).populate('scope.systems scope.sites');
    res.json(runbook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRunbook = async (req, res) => {
  try {
    const runbook = new Runbook({ ...req.body, runbookId: `RB-${Date.now()}` });
    await runbook.save();
    res.status(201).json(runbook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRunbook = async (req, res) => {
  try {
    const runbook = await Runbook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(runbook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRunbook = async (req, res) => {
  try {
    await Runbook.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Runbook deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.executeRunbook = async (req, res) => {
  try {
    const runbook = await Runbook.findByIdAndUpdate(req.params.id, { lastExecutedAt: new Date(), lastExecutedBy: req.body.executedBy, $inc: { executionCount: 1 } }, { new: true });
    res.json({ message: 'Runbook execution started', runbook });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeRunbookStep = async (req, res) => {
  try {
    const runbook = await Runbook.findById(req.params.id);
    const step = runbook.steps.find(s => s.stepNumber === parseInt(req.params.stepNum));
    if (step) { step.executionStatus = 'completed'; step.executedAt = new Date(); step.executedBy = req.body.executedBy; await runbook.save(); }
    res.json({ message: 'Step completed', step });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRunbookHistory = async (req, res) => {
  try {
    const runbook = await Runbook.findById(req.params.id).select('executionHistory');
    res.json(runbook?.executionHistory || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cloneRunbook = async (req, res) => {
  try {
    const original = await Runbook.findById(req.params.id).lean();
    delete original._id;
    const clone = new Runbook({ ...original, runbookId: `RB-${Date.now()}`, name: `${original.name} (Copy)`, status: 'draft' });
    await clone.save();
    res.status(201).json(clone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportRunbook = async (req, res) => {
  try {
    const runbook = await Runbook.findById(req.params.id);
    res.json({ export: runbook, exportedAt: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== DR TESTS ====================
exports.getTests = async (req, res) => {
  try {
    const tests = await DRTest.find({ isActive: true }).populate('scope.plans scope.systems').sort({ scheduledDate: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTestById = async (req, res) => {
  try {
    const test = await DRTest.findById(req.params.id).populate('scope.plans scope.systems scope.sites testLead');
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTest = async (req, res) => {
  try {
    const test = new DRTest({ ...req.body, testId: `TEST-${Date.now()}` });
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await DRTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    await DRTest.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.startTest = async (req, res) => {
  try {
    const test = await DRTest.findByIdAndUpdate(req.params.id, { status: 'in-progress', actualStartTime: new Date() }, { new: true });
    res.json({ message: 'Test started', test });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeTest = async (req, res) => {
  try {
    const test = await DRTest.findByIdAndUpdate(req.params.id, { status: 'completed', result: req.body.result, actualEndTime: new Date() }, { new: true });
    res.json({ message: 'Test completed', test });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelTest = async (req, res) => {
  try {
    const test = await DRTest.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    res.json({ message: 'Test cancelled', test });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.recordTestStepResult = async (req, res) => {
  try {
    const test = await DRTest.findById(req.params.id);
    test.stepResults.push({ stepNumber: parseInt(req.params.stepNum), ...req.body });
    await test.save();
    res.json({ message: 'Step result recorded', stepResults: test.stepResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTestReport = async (req, res) => {
  try {
    const test = await DRTest.findById(req.params.id).populate('scope.plans scope.systems');
    res.json({ report: test, generatedAt: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateTestReport = async (req, res) => {
  try {
    const test = await DRTest.findByIdAndUpdate(req.params.id, { reportGenerated: true }, { new: true });
    res.json({ message: 'Report generated', reportUrl: `/reports/test-${test.testId}.pdf` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUpcomingTests = async (req, res) => {
  try {
    const tests = await DRTest.find({ status: 'scheduled', scheduledDate: { $gte: new Date() } }).sort({ scheduledDate: 1 }).limit(10);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTestResultsSummary = async (req, res) => {
  try {
    const tests = await DRTest.find({ status: 'completed' }).select('testType result metrics');
    const summary = { total: tests.length, passed: tests.filter(t => t.result === 'passed').length, failed: tests.filter(t => t.result === 'failed').length };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== CONTACTS ====================
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ isActive: true }).sort({ lastName: 1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('manager backup assignedSystems assignedSites');
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const contact = new Contact({ ...req.body, contactId: `CONTACT-${Date.now()}` });
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContactsByRole = async (req, res) => {
  try {
    const contacts = await Contact.find({ drRole: req.params.role, isActive: true });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContactsByTeam = async (req, res) => {
  try {
    const contacts = await Contact.find({ teams: req.params.team, isActive: true });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOnCallContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ 'availability.isCurrentlyAvailable': true, isActive: true });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEscalationPath = async (req, res) => {
  try {
    const contacts = await Contact.find({ isActive: true }).sort({ escalationLevel: 1 }).limit(10);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== INCIDENTS ====================
exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ isActive: true }).populate('incidentCommander impact.affectedSystems').sort({ detectedAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate('incidentCommander impact.affectedSystems drExecution.planActivated');
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createIncident = async (req, res) => {
  try {
    const incident = new Incident({ ...req.body, incidentId: `INC-${Date.now()}`, detectedAt: new Date() });
    await incident.save();
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteIncident = async (req, res) => {
  try {
    await Incident.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acknowledgeIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: 'investigating', acknowledgedAt: new Date() }, { new: true });
    res.json({ message: 'Incident acknowledged', incident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activateDRForIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: 'dr-activated', drActivatedAt: new Date(), 'drExecution.planActivated': req.body.planId }, { new: true });
    res.json({ message: 'DR activated', incident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resolveIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: 'recovered', recoveredAt: new Date(), resolution: req.body.resolution }, { new: true });
    res.json({ message: 'Incident resolved', incident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.closeIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: 'closed', closedAt: new Date() }, { new: true });
    res.json({ message: 'Incident closed', incident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addTimelineEvent = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    incident.timeline.push({ timestamp: new Date(), ...req.body });
    await incident.save();
    res.json({ message: 'Timeline event added', timeline: incident.timeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIncidentTimeline = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).select('timeline');
    res.json(incident?.timeline || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.schedulePostMortem = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: 'post-mortem', 'postMortem.scheduled': true, 'postMortem.scheduledDate': req.body.date }, { new: true });
    res.json({ message: 'Post-mortem scheduled', incident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ status: { $nin: ['closed', 'recovered'] }, isActive: true }).sort({ severity: 1, detectedAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIncidentMetrics = async (req, res) => {
  try {
    const incidents = await Incident.find({ isActive: true });
    const metrics = { total: incidents.length, open: incidents.filter(i => !['closed', 'recovered'].includes(i.status)).length, avgTimeToResolve: 0 };
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== REPORTS ====================
exports.getReadinessReport = async (req, res) => {
  try {
    const [plans, sites, systems, tests] = await Promise.all([
      RecoveryPlan.countDocuments({ status: 'active', isActive: true }),
      RecoverySite.find({ isActive: true }).select('healthCheck.status'),
      System.find({ isActive: true }).select('criticality status'),
      DRTest.find({ result: 'passed' }).countDocuments()
    ]);
    res.json({ activePlans: plans, healthySites: sites.filter(s => s.healthCheck?.status === 'healthy').length, operationalSystems: systems.filter(s => s.status === 'operational').length, passedTests: tests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRtoRpoReport = async (req, res) => {
  try {
    const systems = await System.find({ isActive: true }).select('name criticality rto rpo actualRecoveryTime');
    res.json(systems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComplianceReport = async (req, res) => {
  try {
    const [plans, tests] = await Promise.all([
      RecoveryPlan.find({ isActive: true }).select('name complianceFrameworks lastTestedAt'),
      DRTest.find({ status: 'completed' }).select('complianceFrameworks result')
    ]);
    res.json({ plans, tests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTestHistoryReport = async (req, res) => {
  try {
    const tests = await DRTest.find({ status: 'completed' }).select('name testType scheduledDate result metrics').sort({ scheduledDate: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIncidentSummaryReport = async (req, res) => {
  try {
    const incidents = await Incident.find({ isActive: true }).select('title severity status detectedAt recoveredAt').sort({ detectedAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateReport = async (req, res) => {
  res.json({ message: 'Report generation queued', reportType: req.body.type, estimatedTime: '5 minutes' });
};

exports.getTrends = async (req, res) => {
  try {
    const tests = await DRTest.find({ status: 'completed' }).select('result scheduledDate');
    res.json({ testTrends: tests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRiskAssessment = async (req, res) => {
  try {
    const systems = await System.find({ isActive: true }).select('name criticality status rto businessImpact');
    res.json({ riskAssessment: systems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== NOTIFICATIONS ====================
exports.sendNotification = async (req, res) => {
  res.json({ message: 'Notification sent', recipient: req.body.recipient, channel: req.body.channel });
};

exports.broadcastNotification = async (req, res) => {
  res.json({ message: 'Broadcast sent', recipients: req.body.recipients?.length || 0 });
};

exports.getNotificationTemplates = async (req, res) => {
  res.json([
    { id: 'dr-activation', name: 'DR Activation', template: 'DR Plan {{planName}} has been activated...' },
    { id: 'test-reminder', name: 'Test Reminder', template: 'Reminder: DR test scheduled for {{date}}...' },
    { id: 'incident-alert', name: 'Incident Alert', template: 'ALERT: {{severity}} incident detected...' }
  ]);
};

// ==================== AI ANALYSIS ====================
exports.aiAnalyzePlan = async (req, res) => {
  res.json({ analysis: { completeness: 85, gaps: ['Missing vendor contact information', 'Runbook step 5 needs more detail'], recommendations: ['Add backup communication channels', 'Update RTO targets based on recent tests'] } });
};

exports.aiSuggestImprovements = async (req, res) => {
  res.json({ suggestions: ['Increase test frequency to quarterly', 'Add automated health checks', 'Document rollback procedures', 'Update escalation contacts'] });
};

exports.aiGenerateRunbook = async (req, res) => {
  res.json({ generatedRunbook: { name: `Generated Runbook - ${req.body.systemName}`, steps: [{ stepNumber: 1, title: 'Verify system status', instructions: 'Check monitoring dashboard...' }] } });
};

exports.aiRiskPrediction = async (req, res) => {
  res.json({ riskScore: 72, factors: ['Aging infrastructure', 'Untested failover procedures'], prediction: 'Medium risk of extended recovery time in case of incident' });
};
