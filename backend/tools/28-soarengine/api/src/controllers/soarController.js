const Playbook = require('../models/Playbook');
const Execution = require('../models/Execution');
const Case = require('../models/Case');
const Integration = require('../models/Integration');
const { v4: uuidv4 } = require('uuid');

class SOARController {
  
  // ==================== PLAYBOOK MANAGEMENT ====================
  
  async createPlaybook(req, res) {
    try {
      const playbook = new Playbook(req.body);
      await playbook.save();
      res.status(201).json({ success: true, data: playbook });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  async getPlaybooks(req, res) {
    try {
      const { category, status, complexity, search, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (category && category !== 'all') query.category = category;
      if (status) query.status = status;
      if (complexity) query['metadata.complexity'] = complexity;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'metadata.tags': { $regex: search, $options: 'i' } }
        ];
      }
      
      const skip = (page - 1) * limit;
      const playbooks = await Playbook.find(query)
        .sort({ 'executionStats.totalExecutions': -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Playbook.countDocuments(query);
      
      res.json({
        success: true,
        data: playbooks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getPlaybookById(req, res) {
    try {
      const playbook = await Playbook.findById(req.params.id);
      if (!playbook) {
        return res.status(404).json({ success: false, error: 'Playbook not found' });
      }
      res.json({ success: true, data: playbook });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async updatePlaybook(req, res) {
    try {
      const playbook = await Playbook.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!playbook) {
        return res.status(404).json({ success: false, error: 'Playbook not found' });
      }
      res.json({ success: true, data: playbook });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  async deletePlaybook(req, res) {
    try {
      const playbook = await Playbook.findByIdAndDelete(req.params.id);
      if (!playbook) {
        return res.status(404).json({ success: false, error: 'Playbook not found' });
      }
      res.json({ success: true, message: 'Playbook deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async clonePlaybook(req, res) {
    try {
      const original = await Playbook.findById(req.params.id);
      if (!original) {
        return res.status(404).json({ success: false, error: 'Playbook not found' });
      }
      
      const clone = new Playbook({
        ...original.toObject(),
        _id: undefined,
        name: `${original.name} (Copy)`,
        executionStats: {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          averageDuration: 0,
          timeSaved: 0
        },
        status: 'draft'
      });
      
      await clone.save();
      res.status(201).json({ success: true, data: clone });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  // ==================== EXECUTION MANAGEMENT ====================
  
  async executePlaybook(req, res) {
    try {
      const { playbook_id, incident_id, input_data, execution_mode, notify_on_complete, rollback_on_error } = req.body;
      
      const playbook = await Playbook.findById(playbook_id);
      if (!playbook) {
        return res.status(404).json({ success: false, error: 'Playbook not found' });
      }
      
      if (playbook.status !== 'active') {
        return res.status(400).json({ success: false, error: 'Playbook is not active' });
      }
      
      // Create execution record
      const execution = new Execution({
        executionId: uuidv4(),
        playbookId: playbook._id,
        playbookName: playbook.name,
        caseId: incident_id,
        status: 'pending',
        executionMode: execution_mode || 'automatic',
        triggerType: 'manual',
        triggeredBy: req.user?.id || 'system',
        inputData: input_data,
        totalSteps: playbook.steps.length,
        steps: playbook.steps.map((step, index) => ({
          stepNumber: index + 1,
          action: step.action,
          tool: step.tool,
          status: 'pending',
          inputData: step.parameters
        })),
        priority: playbook.severity === 'critical' ? 'critical' : 'medium'
      });
      
      await execution.save();
      
      // Start execution asynchronously
      this.processExecution(execution._id, rollback_on_error, notify_on_complete).catch(console.error);
      
      res.status(202).json({
        success: true,
        message: 'Playbook execution started',
        data: {
          executionId: execution.executionId,
          status: execution.status
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  async processExecution(executionId, rollbackOnError, notifyOnComplete) {
    try {
      const execution = await Execution.findById(executionId);
      if (!execution) return;
      
      execution.status = 'running';
      execution.startedAt = new Date();
      await execution.save();
      
      await execution.addLog('info', 'Playbook execution started', 'orchestrator');
      
      // Execute each step
      for (let i = 0; i < execution.steps.length; i++) {
        const step = execution.steps[i];
        execution.currentStep = i + 1;
        await execution.save();
        
        await execution.updateStepStatus(step.stepNumber, 'running');
        await execution.addLog('info', `Executing step ${step.stepNumber}: ${step.action}`, step.tool);
        
        try {
          // Simulate step execution (in production, call actual integration)
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
          
          const outputData = {
            success: true,
            result: `Step ${step.stepNumber} completed successfully`,
            timestamp: new Date()
          };
          
          await execution.updateStepStatus(step.stepNumber, 'completed', outputData);
          await execution.addLog('info', `Step ${step.stepNumber} completed successfully`, step.tool);
          execution.metrics.actionsExecuted++;
          
        } catch (stepError) {
          await execution.updateStepStatus(step.stepNumber, 'failed', null, {
            message: stepError.message,
            code: 'STEP_EXECUTION_ERROR'
          });
          await execution.addLog('error', `Step ${step.stepNumber} failed: ${stepError.message}`, step.tool);
          
          if (rollbackOnError) {
            execution.rollback.required = true;
            execution.rollback.initiated = true;
            execution.rollback.initiatedAt = new Date();
            execution.status = 'failed';
            await execution.save();
            await execution.addLog('warn', 'Initiating rollback due to step failure', 'orchestrator');
            break;
          }
        }
      }
      
      // Finalize execution
      if (execution.status === 'running') {
        execution.status = execution.failedSteps > 0 ? 'failed' : 'completed';
      }
      execution.completedAt = new Date();
      execution.calculateDuration();
      execution.metrics.timeSaved = Math.floor(execution.duration / 1000) * 5; // Estimate 5x time savings
      await execution.save();
      
      // Update playbook stats
      const playbook = await Playbook.findById(execution.playbookId);
      if (playbook) {
        await playbook.recordExecution(
          execution.status === 'completed',
          execution.duration
        );
      }
      
      await execution.addLog('info', `Playbook execution ${execution.status}`, 'orchestrator');
      
      if (notifyOnComplete) {
        // Send notifications (implement notification logic)
      }
      
    } catch (error) {
      console.error('Execution processing error:', error);
      const execution = await Execution.findById(executionId);
      if (execution) {
        execution.status = 'failed';
        execution.error = {
          message: error.message,
          code: 'EXECUTION_ERROR',
          canRetry: true
        };
        await execution.save();
      }
    }
  }
  
  async getExecutions(req, res) {
    try {
      const { status, playbookId, caseId, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (status) query.status = status;
      if (playbookId) query.playbookId = playbookId;
      if (caseId) query.caseId = caseId;
      
      const skip = (page - 1) * limit;
      const executions = await Execution.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('playbookId', 'name category')
        .populate('caseId', 'caseId title severity');
      
      const total = await Execution.countDocuments(query);
      
      res.json({
        success: true,
        data: executions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getExecutionById(req, res) {
    try {
      const execution = await Execution.findOne({ executionId: req.params.id })
        .populate('playbookId')
        .populate('caseId');
      
      if (!execution) {
        return res.status(404).json({ success: false, error: 'Execution not found' });
      }
      res.json({ success: true, data: execution });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async cancelExecution(req, res) {
    try {
      const execution = await Execution.findOne({ executionId: req.params.id });
      if (!execution) {
        return res.status(404).json({ success: false, error: 'Execution not found' });
      }
      
      if (execution.status !== 'running' && execution.status !== 'pending') {
        return res.status(400).json({ success: false, error: 'Execution cannot be cancelled' });
      }
      
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      await execution.save();
      await execution.addLog('warn', 'Execution cancelled by user', 'system');
      
      res.json({ success: true, message: 'Execution cancelled successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== CASE MANAGEMENT ====================
  
  async createCase(req, res) {
    try {
      const caseData = {
        ...req.body,
        caseId: `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
      
      const newCase = new Case(caseData);
      await newCase.save();
      await newCase.addTimelineEvent('Case created', req.user?.id || 'system', { source: 'manual' });
      
      // Auto-execute playbook if requested
      if (req.body.auto_execute_playbook && req.body.playbook_id) {
        const execution = new Execution({
          executionId: uuidv4(),
          playbookId: req.body.playbook_id,
          caseId: newCase._id,
          status: 'pending',
          executionMode: 'automatic',
          triggerType: 'event_based',
          triggeredBy: 'auto',
          totalSteps: 0
        });
        await execution.save();
        this.processExecution(execution._id, true, true).catch(console.error);
      }
      
      res.status(201).json({ success: true, data: newCase });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  async getCases(req, res) {
    try {
      const { status, severity, category, assignedTo, search, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (status) query.status = status;
      if (severity) query.severity = severity;
      if (category) query.category = category;
      if (assignedTo) query.assignedTo = assignedTo;
      if (search) {
        query.$or = [
          { caseId: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      const skip = (page - 1) * limit;
      const cases = await Case.find(query)
        .sort({ severity: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Case.countDocuments(query);
      
      res.json({
        success: true,
        data: cases,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getCaseById(req, res) {
    try {
      const caseData = await Case.findOne({ caseId: req.params.id });
      if (!caseData) {
        return res.status(404).json({ success: false, error: 'Case not found' });
      }
      res.json({ success: true, data: caseData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async updateCase(req, res) {
    try {
      const caseData = await Case.findOneAndUpdate(
        { caseId: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!caseData) {
        return res.status(404).json({ success: false, error: 'Case not found' });
      }
      
      await caseData.addTimelineEvent(
        'Case updated',
        req.user?.id || 'system',
        { changes: Object.keys(req.body) }
      );
      
      res.json({ success: true, data: caseData });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  async assignCase(req, res) {
    try {
      const { analyst_id } = req.body;
      const caseData = await Case.findOne({ caseId: req.params.id });
      
      if (!caseData) {
        return res.status(404).json({ success: false, error: 'Case not found' });
      }
      
      const previousAnalyst = caseData.assignedTo;
      caseData.assignedTo = analyst_id;
      caseData.status = 'in_progress';
      await caseData.save();
      
      await caseData.addTimelineEvent(
        'Case assigned',
        req.user?.id || 'system',
        { from: previousAnalyst, to: analyst_id }
      );
      
      res.json({ success: true, data: caseData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async closeCase(req, res) {
    try {
      const { resolution_summary, root_cause, actions_taken, recommendations } = req.body;
      const caseData = await Case.findOne({ caseId: req.params.id });
      
      if (!caseData) {
        return res.status(404).json({ success: false, error: 'Case not found' });
      }
      
      caseData.status = 'closed';
      caseData.closedAt = new Date();
      caseData.closedBy = req.user?.id || 'system';
      caseData.resolution = {
        summary: resolution_summary,
        rootCause: root_cause,
        actionsTaken: actions_taken || [],
        recommendations: recommendations || []
      };
      
      if (!caseData.metrics.resolutionTime) {
        caseData.metrics.resolutionTime = new Date();
        caseData.metrics.meanTimeToResolve = Math.floor((caseData.metrics.resolutionTime - caseData.createdAt) / 1000);
      }
      
      await caseData.save();
      await caseData.addTimelineEvent('Case closed', req.user?.id || 'system', { resolution: resolution_summary });
      
      res.json({ success: true, data: caseData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== INTEGRATION MANAGEMENT ====================
  
  async createIntegration(req, res) {
    try {
      const integration = new Integration(req.body);
      integration.createdBy = req.user?.id || 'system';
      await integration.save();
      res.status(201).json({ success: true, data: integration });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  async getIntegrations(req, res) {
    try {
      const { toolType, status, search } = req.query;
      
      const query = {};
      if (toolType) query.toolType = toolType;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { toolName: { $regex: search, $options: 'i' } },
          { vendor: { $regex: search, $options: 'i' } }
        ];
      }
      
      const integrations = await Integration.find(query).sort({ toolName: 1 });
      res.json({ success: true, data: integrations });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getIntegrationById(req, res) {
    try {
      const integration = await Integration.findById(req.params.id);
      if (!integration) {
        return res.status(404).json({ success: false, error: 'Integration not found' });
      }
      res.json({ success: true, data: integration });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async updateIntegration(req, res) {
    try {
      const integration = await Integration.findByIdAndUpdate(
        req.params.id,
        { ...req.body, lastModifiedBy: req.user?.id || 'system' },
        { new: true, runValidators: true }
      );
      
      if (!integration) {
        return res.status(404).json({ success: false, error: 'Integration not found' });
      }
      res.json({ success: true, data: integration });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  async deleteIntegration(req, res) {
    try {
      const integration = await Integration.findByIdAndDelete(req.params.id);
      if (!integration) {
        return res.status(404).json({ success: false, error: 'Integration not found' });
      }
      res.json({ success: true, message: 'Integration deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async testIntegration(req, res) {
    try {
      const integration = await Integration.findById(req.params.id);
      if (!integration) {
        return res.status(404).json({ success: false, error: 'Integration not found' });
      }
      
      // Simulate health check
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      const responseTime = Date.now() - startTime;
      
      const isHealthy = Math.random() > 0.1; // 90% success rate
      
      integration.healthCheck = {
        lastChecked: new Date(),
        isHealthy,
        responseTime,
        lastError: isHealthy ? null : 'Connection timeout'
      };
      
      integration.status = isHealthy ? 'active' : 'error';
      await integration.save();
      
      res.json({
        success: true,
        data: {
          healthy: isHealthy,
          responseTime,
          message: isHealthy ? 'Integration is healthy' : 'Integration health check failed'
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== METRICS & ANALYTICS ====================
  
  async getAutomationMetrics(req, res) {
    try {
      const { time_period } = req.query;
      
      let startDate = new Date();
      switch (time_period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last_7_days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'last_30_days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'last_quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'last_year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }
      
      const executions = await Execution.find({
        createdAt: { $gte: startDate }
      });
      
      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(e => e.status === 'completed').length;
      const failedExecutions = executions.filter(e => e.status === 'failed').length;
      const totalTimeSaved = executions.reduce((sum, e) => sum + (e.metrics.timeSaved || 0), 0);
      const totalActionsExecuted = executions.reduce((sum, e) => sum + (e.metrics.actionsExecuted || 0), 0);
      
      const averageDuration = executions.length > 0
        ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length
        : 0;
      
      const casesData = await Case.find({
        createdAt: { $gte: startDate }
      });
      
      const slaCompliance = casesData.length > 0
        ? (casesData.filter(c => !c.sla.breached).length / casesData.length) * 100
        : 100;
      
      res.json({
        success: true,
        data: {
          period: time_period,
          startDate,
          metrics: {
            totalExecutions,
            successfulExecutions,
            failedExecutions,
            successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
            totalTimeSaved,
            timeSavedHours: Math.floor(totalTimeSaved / 3600),
            totalActionsExecuted,
            averageDuration: Math.floor(averageDuration / 1000),
            casesCreated: casesData.length,
            casesResolved: casesData.filter(c => c.status === 'resolved' || c.status === 'closed').length,
            slaCompliance: Math.round(slaCompliance * 100) / 100
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getDashboardStats(req, res) {
    try {
      const [
        totalPlaybooks,
        activePlaybooks,
        totalCases,
        openCases,
        totalExecutions,
        runningExecutions,
        totalIntegrations,
        activeIntegrations
      ] = await Promise.all([
        Playbook.countDocuments(),
        Playbook.countDocuments({ status: 'active' }),
        Case.countDocuments(),
        Case.countDocuments({ status: { $in: ['new', 'in_progress', 'pending'] } }),
        Execution.countDocuments(),
        Execution.countDocuments({ status: 'running' }),
        Integration.countDocuments(),
        Integration.countDocuments({ status: 'active' })
      ]);
      
      const recentExecutions = await Execution.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('executionId playbookName status createdAt duration');
      
      const criticalCases = await Case.find({ severity: 'critical', status: { $ne: 'closed' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('caseId title severity status createdAt');
      
      res.json({
        success: true,
        data: {
          stats: {
            playbooks: { total: totalPlaybooks, active: activePlaybooks },
            cases: { total: totalCases, open: openCases },
            executions: { total: totalExecutions, running: runningExecutions },
            integrations: { total: totalIntegrations, active: activeIntegrations }
          },
          recentExecutions,
          criticalCases
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== PLAYBOOK LIBRARY ====================
  
  async getPlaybookTemplates(req, res) {
    try {
      const templates = await Playbook.find({
        'metadata.isTemplate': true,
        status: 'active'
      }).select('name description category metadata steps');
      
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async importTemplate(req, res) {
    try {
      const { template_id, customizations } = req.body;
      
      const template = await Playbook.findById(template_id);
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }
      
      const playbook = new Playbook({
        ...template.toObject(),
        _id: undefined,
        ...customizations,
        'metadata.isTemplate': false,
        status: 'draft'
      });
      
      await playbook.save();
      res.status(201).json({ success: true, data: playbook });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new SOARController();
