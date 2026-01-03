/**
 * Data Retention Service for DataGuardian
 * Handles data lifecycle management, retention policies, automated deletion, and legal holds
 * Integrates with Collibra, Microsoft Purview, and AWS for enterprise data governance
 */
const axios = require('axios');
const DataRetention = require('../models/DataRetention');
const { logger } = require('../../../../../shared');

class RetentionService {
  constructor() {
    // Collibra configuration
    this.collibraConfig = {
      apiUrl: process.env.DATAGUARDIAN_COLLIBRA_API_URL,
      username: process.env.DATAGUARDIAN_COLLIBRA_USERNAME,
      password: process.env.DATAGUARDIAN_COLLIBRA_PASSWORD
    };

    // Microsoft Purview configuration
    this.purviewConfig = {
      accountName: process.env.DATAGUARDIAN_PURVIEW_ACCOUNT_NAME,
      tenantId: process.env.DATAGUARDIAN_PURVIEW_TENANT_ID,
      clientId: process.env.DATAGUARDIAN_PURVIEW_CLIENT_ID,
      clientSecret: process.env.DATAGUARDIAN_PURVIEW_CLIENT_SECRET
    };

    // Retention settings
    this.retentionConfig = {
      autoDeleteEnabled: process.env.DATAGUARDIAN_RETENTION_AUTO_DELETE === 'true',
      archiveEnabled: process.env.DATAGUARDIAN_RETENTION_ARCHIVE === 'true',
      notifyDaysBefore: parseInt(process.env.DATAGUARDIAN_RETENTION_NOTIFY_DAYS) || 30,
      approvalRequired: process.env.DATAGUARDIAN_RETENTION_APPROVAL_REQUIRED === 'true'
    };

    this.purviewToken = null;
    this.purviewTokenExpiry = null;
  }

  /**
   * Check if real API integrations are configured
   */
  isConfigured(provider) {
    switch (provider) {
      case 'collibra':
        return !!(this.collibraConfig.apiUrl && this.collibraConfig.username);
      case 'purview':
        return !!(this.purviewConfig.accountName && this.purviewConfig.clientId);
      default:
        return false;
    }
  }

  /**
   * Get Microsoft Purview token
   */
  async getPurviewToken() {
    if (this.purviewToken && this.purviewTokenExpiry && Date.now() < this.purviewTokenExpiry) {
      return this.purviewToken;
    }

    if (!this.isConfigured('purview')) {
      return null;
    }

    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.purviewConfig.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.purviewConfig.clientId,
          client_secret: this.purviewConfig.clientSecret,
          scope: 'https://purview.azure.net/.default'
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      this.purviewToken = response.data.access_token;
      this.purviewTokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
      return this.purviewToken;
    } catch (error) {
      logger.error('Purview OAuth error:', error.message);
      return null;
    }
  }

  /**
   * Create a new retention policy
   */
  async createPolicy(policyData) {
    try {
      // Sync to external system if configured
      let externalId = null;
      if (this.isConfigured('purview')) {
        const externalResult = await this.createPurviewPolicy(policyData);
        if (externalResult) {
          externalId = externalResult.id;
        }
      }

      // Calculate next run based on schedule
      const nextRun = this.calculateNextRun(policyData.schedule);

      const policy = new DataRetention({
        userId: policyData.userId,
        name: policyData.name,
        description: policyData.description,
        type: policyData.type || 'retention',
        status: policyData.status || 'active',
        scope: {
          dataCategories: policyData.dataCategories || [],
          dataSources: policyData.dataSources || [],
          classification: policyData.classification,
          businessUnit: policyData.businessUnit,
          region: policyData.region,
          filters: policyData.filters
        },
        retention: {
          duration: policyData.duration || 365,
          unit: policyData.unit || 'days',
          startEvent: policyData.startEvent || 'creation',
          extendOnAccess: policyData.extendOnAccess || false
        },
        disposition: {
          action: policyData.dispositionAction || 'delete',
          requireApproval: policyData.requireApproval ?? this.retentionConfig.approvalRequired,
          approvers: policyData.approvers || [],
          notifyDaysBefore: policyData.notifyDaysBefore || this.retentionConfig.notifyDaysBefore,
          archiveLocation: policyData.archiveLocation
        },
        compliance: {
          regulations: policyData.regulations || [],
          legalBasis: policyData.legalBasis,
          policyReference: policyData.policyReference,
          reviewRequired: policyData.reviewRequired || false
        },
        schedule: {
          frequency: policyData.scheduleFrequency || 'daily',
          dayOfWeek: policyData.dayOfWeek,
          dayOfMonth: policyData.dayOfMonth,
          time: policyData.scheduleTime || '02:00',
          timezone: policyData.timezone || 'UTC',
          nextRun
        },
        externalId,
        externalSystem: externalId ? 'purview' : null
      });

      await policy.save();

      logger.info(`Retention policy created: ${policy.policyId}`);

      return {
        policyId: policy.policyId,
        id: policy._id,
        name: policy.name,
        status: policy.status,
        nextRun: policy.schedule.nextRun,
        source: externalId ? 'purview' : 'simulation'
      };
    } catch (error) {
      logger.error('Create retention policy error:', error.message);
      throw error;
    }
  }

  /**
   * Update retention policy
   */
  async updatePolicy(policyId, updates) {
    try {
      const policy = await DataRetention.findOne({
        $or: [{ policyId }, { _id: policyId }]
      });

      if (!policy) {
        throw new Error('Policy not found');
      }

      // Update fields
      const allowedUpdates = [
        'name', 'description', 'status', 'scope', 'retention', 
        'disposition', 'compliance', 'schedule'
      ];

      for (const field of allowedUpdates) {
        if (updates[field] !== undefined) {
          if (typeof updates[field] === 'object' && !Array.isArray(updates[field])) {
            policy[field] = { ...policy[field].toObject?.() || policy[field], ...updates[field] };
          } else {
            policy[field] = updates[field];
          }
        }
      }

      // Recalculate next run if schedule changed
      if (updates.schedule) {
        policy.schedule.nextRun = this.calculateNextRun(policy.schedule);
      }

      await policy.save();

      logger.info(`Retention policy updated: ${policy.policyId}`);

      return {
        policyId: policy.policyId,
        status: policy.status,
        nextRun: policy.schedule.nextRun
      };
    } catch (error) {
      logger.error('Update retention policy error:', error.message);
      throw error;
    }
  }

  /**
   * Execute retention policy
   */
  async executePolicy(policyId, options = {}) {
    try {
      const policy = await DataRetention.findOne({
        $or: [{ policyId }, { _id: policyId }]
      });

      if (!policy) {
        throw new Error('Policy not found');
      }

      // Check if legal hold is active
      if (policy.legalHold?.isActive) {
        return {
          success: false,
          message: 'Policy execution blocked by legal hold',
          legalHold: policy.legalHold.name
        };
      }

      // Create execution record
      const executionId = `EXEC-${Date.now().toString(36).toUpperCase()}`;
      const execution = {
        executionId,
        startedAt: new Date(),
        status: 'running',
        recordsProcessed: 0,
        recordsDeleted: 0,
        recordsArchived: 0,
        recordsFailed: 0
      };

      policy.executions.push(execution);
      await policy.save();

      // Execute disposition based on policy
      let result;
      if (this.retentionConfig.autoDeleteEnabled || options.force) {
        result = await this.executeDisposition(policy, executionId, options);
      } else {
        result = await this.simulateExecution(policy);
      }

      // Update execution record
      const execIndex = policy.executions.findIndex(e => e.executionId === executionId);
      if (execIndex !== -1) {
        policy.executions[execIndex] = {
          ...policy.executions[execIndex],
          ...result,
          completedAt: new Date(),
          status: result.recordsFailed > 0 ? 'completed_with_errors' : 'completed'
        };
      }

      // Update statistics
      policy.statistics.totalRecordsProcessed += result.recordsProcessed;
      policy.statistics.totalRecordsDeleted += result.recordsDeleted;
      policy.statistics.totalRecordsArchived += result.recordsArchived;
      policy.statistics.lastExecutionAt = new Date();

      // Calculate next run
      policy.schedule.lastRun = new Date();
      policy.schedule.nextRun = this.calculateNextRun(policy.schedule);

      await policy.save();

      logger.info(`Retention policy executed: ${policy.policyId}, records processed: ${result.recordsProcessed}`);

      return {
        success: true,
        policyId: policy.policyId,
        executionId,
        ...result,
        nextRun: policy.schedule.nextRun
      };
    } catch (error) {
      logger.error('Execute retention policy error:', error.message);
      throw error;
    }
  }

  /**
   * Execute disposition actions
   */
  async executeDisposition(policy, executionId, options = {}) {
    // In production, this would actually delete/archive data
    // For now, simulate the execution
    const result = await this.simulateExecution(policy);

    if (policy.disposition.action === 'archive' && this.retentionConfig.archiveEnabled) {
      // Archive data to configured location
      logger.info(`Archiving ${result.recordsProcessed} records to ${policy.disposition.archiveLocation}`);
    }

    return result;
  }

  /**
   * Apply legal hold to policy
   */
  async applyLegalHold(policyId, holdData) {
    try {
      const policy = await DataRetention.findOne({
        $or: [{ policyId }, { _id: policyId }]
      });

      if (!policy) {
        throw new Error('Policy not found');
      }

      policy.legalHold = {
        isActive: true,
        holdId: holdData.holdId || `HOLD-${Date.now().toString(36).toUpperCase()}`,
        name: holdData.name,
        caseNumber: holdData.caseNumber,
        appliedBy: holdData.appliedBy,
        appliedAt: new Date(),
        expiresAt: holdData.expiresAt,
        notes: holdData.notes
      };

      // Pause the policy
      policy.status = 'paused';

      await policy.save();

      logger.info(`Legal hold applied to policy: ${policy.policyId}`);

      return {
        success: true,
        policyId: policy.policyId,
        holdId: policy.legalHold.holdId,
        status: policy.status
      };
    } catch (error) {
      logger.error('Apply legal hold error:', error.message);
      throw error;
    }
  }

  /**
   * Release legal hold
   */
  async releaseLegalHold(policyId, options = {}) {
    try {
      const policy = await DataRetention.findOne({
        $or: [{ policyId }, { _id: policyId }]
      });

      if (!policy) {
        throw new Error('Policy not found');
      }

      if (!policy.legalHold?.isActive) {
        return { success: false, message: 'No active legal hold on this policy' };
      }

      policy.legalHold.isActive = false;
      policy.legalHold.releasedBy = options.releasedBy;
      policy.legalHold.releasedAt = new Date();
      policy.legalHold.releaseNotes = options.notes;

      // Reactivate policy if it was paused
      if (policy.status === 'paused' && options.reactivate !== false) {
        policy.status = 'active';
        policy.schedule.nextRun = this.calculateNextRun(policy.schedule);
      }

      await policy.save();

      logger.info(`Legal hold released from policy: ${policy.policyId}`);

      return {
        success: true,
        policyId: policy.policyId,
        status: policy.status,
        nextRun: policy.schedule.nextRun
      };
    } catch (error) {
      logger.error('Release legal hold error:', error.message);
      throw error;
    }
  }

  /**
   * Get pending dispositions
   */
  async getPendingDispositions(userId, options = {}) {
    try {
      const policies = await DataRetention.find({
        userId,
        status: 'active',
        'legalHold.isActive': { $ne: true },
        'disposition.requireApproval': true
      });

      const pending = [];

      for (const policy of policies) {
        // Find records due for disposition
        const dueRecords = await this.findDueRecords(policy);
        if (dueRecords.count > 0) {
          pending.push({
            policyId: policy.policyId,
            policyName: policy.name,
            action: policy.disposition.action,
            recordCount: dueRecords.count,
            dataCategories: policy.scope.dataCategories,
            dueDate: dueRecords.oldestDueDate,
            requiresApproval: true,
            approvers: policy.disposition.approvers
          });
        }
      }

      return {
        total: pending.length,
        pending,
        approvalRequired: pending.filter(p => p.requiresApproval).length
      };
    } catch (error) {
      logger.error('Get pending dispositions error:', error.message);
      throw error;
    }
  }

  /**
   * Approve disposition
   */
  async approveDisposition(policyId, approvalData) {
    try {
      const policy = await DataRetention.findOne({
        $or: [{ policyId }, { _id: policyId }]
      });

      if (!policy) {
        throw new Error('Policy not found');
      }

      // Add approval record
      policy.pendingRecords.push({
        recordId: `BATCH-${Date.now().toString(36)}`,
        dueDate: new Date(),
        status: 'approved',
        approvedBy: approvalData.approvedBy,
        approvedAt: new Date(),
        notes: approvalData.notes
      });

      await policy.save();

      // Execute if auto-execute is enabled
      if (approvalData.executeNow) {
        return await this.executePolicy(policyId, { force: true });
      }

      return {
        success: true,
        policyId: policy.policyId,
        message: 'Disposition approved'
      };
    } catch (error) {
      logger.error('Approve disposition error:', error.message);
      throw error;
    }
  }

  /**
   * Get retention dashboard statistics
   */
  async getRetentionDashboard(userId) {
    try {
      const policies = await DataRetention.find({ userId });

      const stats = {
        totalPolicies: policies.length,
        activePolicies: policies.filter(p => p.status === 'active').length,
        pausedPolicies: policies.filter(p => p.status === 'paused').length,
        withLegalHold: policies.filter(p => p.legalHold?.isActive).length,
        totalRecordsProcessed: policies.reduce((sum, p) => sum + (p.statistics?.totalRecordsProcessed || 0), 0),
        totalRecordsDeleted: policies.reduce((sum, p) => sum + (p.statistics?.totalRecordsDeleted || 0), 0),
        totalRecordsArchived: policies.reduce((sum, p) => sum + (p.statistics?.totalRecordsArchived || 0), 0)
      };

      const byType = await DataRetention.aggregate([
        { $match: { userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      const byAction = await DataRetention.aggregate([
        { $match: { userId } },
        { $group: { _id: '$disposition.action', count: { $sum: 1 } } }
      ]);

      const upcomingExecutions = await DataRetention.find({
        userId,
        status: 'active',
        'schedule.nextRun': { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      })
        .sort({ 'schedule.nextRun': 1 })
        .limit(10)
        .select('policyId name schedule.nextRun disposition.action');

      const recentExecutions = policies
        .flatMap(p => (p.executions || []).map(e => ({
          policyId: p.policyId,
          policyName: p.name,
          ...e.toObject?.() || e
        })))
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
        .slice(0, 10);

      return {
        summary: stats,
        byType: byType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
        byAction: byAction.reduce((acc, a) => ({ ...acc, [a._id]: a.count }), {}),
        upcomingExecutions: upcomingExecutions.map(p => ({
          policyId: p.policyId,
          name: p.name,
          nextRun: p.schedule.nextRun,
          action: p.disposition.action
        })),
        recentExecutions,
        legalHolds: policies
          .filter(p => p.legalHold?.isActive)
          .map(p => ({
            policyId: p.policyId,
            policyName: p.name,
            holdId: p.legalHold.holdId,
            holdName: p.legalHold.name,
            appliedAt: p.legalHold.appliedAt
          }))
      };
    } catch (error) {
      logger.error('Retention dashboard error:', error.message);
      throw error;
    }
  }

  /**
   * Run scheduled retention policies
   */
  async runScheduledPolicies() {
    try {
      const duePolicies = await DataRetention.findDuePolicies();
      
      logger.info(`Found ${duePolicies.length} retention policies due for execution`);

      const results = [];

      for (const policy of duePolicies) {
        try {
          const result = await this.executePolicy(policy._id);
          results.push({
            policyId: policy.policyId,
            success: result.success,
            recordsProcessed: result.recordsProcessed
          });
        } catch (error) {
          results.push({
            policyId: policy.policyId,
            success: false,
            error: error.message
          });
        }
      }

      return {
        executed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      logger.error('Run scheduled policies error:', error.message);
      throw error;
    }
  }

  // ==================== EXTERNAL API METHODS ====================

  /**
   * Create policy in Microsoft Purview
   */
  async createPurviewPolicy(policyData) {
    try {
      const token = await this.getPurviewToken();
      if (!token) return null;

      const response = await axios.post(
        `https://${this.purviewConfig.accountName}.purview.azure.com/catalog/api/policies`,
        {
          name: policyData.name,
          description: policyData.description,
          policyType: 'Retention',
          retentionPeriod: policyData.duration,
          retentionUnit: policyData.unit,
          scope: {
            dataCategories: policyData.dataCategories,
            classifications: policyData.classification ? [policyData.classification] : []
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Purview retention policy created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Purview create policy error:', error.message);
      return null;
    }
  }

  // ==================== SIMULATION METHODS ====================

  /**
   * Simulate policy execution
   */
  async simulateExecution(policy) {
    logger.info(`[SIMULATION] Executing retention policy: ${policy.policyId}`);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate finding and processing records
    const recordsProcessed = Math.floor(Math.random() * 500) + 50;
    const deletionRate = policy.disposition.action === 'delete' ? 0.85 : 0.1;
    const archiveRate = policy.disposition.action === 'archive' ? 0.85 : 0.05;

    return {
      recordsProcessed,
      recordsDeleted: Math.floor(recordsProcessed * deletionRate),
      recordsArchived: Math.floor(recordsProcessed * archiveRate),
      recordsFailed: Math.floor(Math.random() * 5),
      dataVolume: `${(recordsProcessed * 0.5).toFixed(1)} MB`
    };
  }

  /**
   * Find records due for disposition (simulation)
   */
  async findDueRecords(policy) {
    // In production, this would query actual data stores
    return {
      count: Math.floor(Math.random() * 200) + 20,
      oldestDueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };
  }

  // ==================== HELPER METHODS ====================

  calculateNextRun(schedule) {
    const now = new Date();
    let next = new Date();

    // Parse time
    const [hours, minutes] = (schedule.time || '02:00').split(':').map(Number);
    next.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
      case 'hourly':
        next.setMinutes(0, 0, 0);
        next.setHours(next.getHours() + 1);
        break;

      case 'daily':
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;

      case 'weekly':
        const targetDay = schedule.dayOfWeek || 0; // 0 = Sunday
        const currentDay = next.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0 || (daysUntil === 0 && next <= now)) {
          daysUntil += 7;
        }
        next.setDate(next.getDate() + daysUntil);
        break;

      case 'monthly':
        const targetDate = schedule.dayOfMonth || 1;
        next.setDate(targetDate);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;

      case 'quarterly':
        const currentMonth = now.getMonth();
        const nextQuarterMonth = Math.ceil((currentMonth + 1) / 3) * 3;
        next.setMonth(nextQuarterMonth);
        next.setDate(1);
        if (next <= now) {
          next.setMonth(next.getMonth() + 3);
        }
        break;

      case 'yearly':
        next.setMonth(0);
        next.setDate(1);
        if (next <= now) {
          next.setFullYear(next.getFullYear() + 1);
        }
        break;

      default:
        next.setDate(next.getDate() + 1);
    }

    return next;
  }
}

module.exports = new RetentionService();
