const ScheduledScan = require('../models/ScheduledScan.model');
const Asset = require('../models/Asset.model');
const VulnScan = require('../models/Scan.model');
const { ApiResponse, ApiError } = require('../../../../../shared');
const logger = require('../../../../../shared/utils/logger');

class ScheduleController {
  /**
   * Create a scheduled scan
   */
  async createSchedule(req, res, next) {
    try {
      const { name, description, targets, scanConfig, schedule, notifications, tags, compliance } = req.body;

      // Generate schedule ID
      const scheduleId = `SCHED-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Validate targets
      if (!targets || targets.length === 0) {
        throw ApiError.badRequest('At least one target is required');
      }

      const scheduledScan = new ScheduledScan({
        userId: req.user.id,
        scheduleId,
        name,
        description,
        targets,
        scanConfig: {
          scanType: scanConfig?.scanType || 'quick',
          ports: scanConfig?.ports || { topPorts: 1000 },
          depth: scanConfig?.depth || 'standard',
          options: {
            cveDetection: scanConfig?.options?.cveDetection !== false,
            osDetection: scanConfig?.options?.osDetection !== false,
            serviceDetection: scanConfig?.options?.serviceDetection !== false,
            sslAnalysis: scanConfig?.options?.sslAnalysis !== false,
            headerCheck: scanConfig?.options?.headerCheck !== false,
            ...scanConfig?.options
          },
          maxConcurrent: scanConfig?.maxConcurrent || 10,
          timeout: scanConfig?.timeout || 300
        },
        schedule: {
          type: schedule?.type || 'weekly',
          cronExpression: schedule?.cronExpression,
          timezone: schedule?.timezone || 'UTC',
          dayOfWeek: schedule?.dayOfWeek,
          dayOfMonth: schedule?.dayOfMonth,
          hour: schedule?.hour ?? 2,
          minute: schedule?.minute ?? 0
        },
        notifications: {
          enabled: notifications?.enabled !== false,
          channels: notifications?.channels || [],
          thresholds: {
            criticalCount: notifications?.thresholds?.criticalCount ?? 1,
            highCount: notifications?.thresholds?.highCount ?? 5,
            riskScoreChange: notifications?.thresholds?.riskScoreChange ?? 10
          }
        },
        tags,
        compliance,
        status: 'active'
      });

      // Calculate next run
      scheduledScan.schedule.nextRun = scheduledScan.calculateNextRun();

      await scheduledScan.save();

      res.status(201).json(ApiResponse.created(scheduledScan, 'Scheduled scan created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all scheduled scans
   */
  async getAllSchedules(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;

      const query = { userId: req.user.id };
      if (status) query.status = status;

      const schedules = await ScheduledScan.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      const total = await ScheduledScan.countDocuments(query);

      res.json(ApiResponse.success({
        schedules,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get schedule by ID
   */
  async getScheduleById(req, res, next) {
    try {
      const schedule = await ScheduledScan.findById(req.params.id);

      if (!schedule) {
        throw ApiError.notFound('Scheduled scan not found');
      }

      if (schedule.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      res.json(ApiResponse.success(schedule));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update scheduled scan
   */
  async updateSchedule(req, res, next) {
    try {
      const { name, description, targets, scanConfig, schedule, notifications, tags, status } = req.body;

      const scheduledScan = await ScheduledScan.findById(req.params.id);

      if (!scheduledScan) {
        throw ApiError.notFound('Scheduled scan not found');
      }

      if (scheduledScan.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      // Update fields
      if (name) scheduledScan.name = name;
      if (description !== undefined) scheduledScan.description = description;
      if (targets) scheduledScan.targets = targets;
      if (scanConfig) scheduledScan.scanConfig = { ...scheduledScan.scanConfig, ...scanConfig };
      if (schedule) {
        scheduledScan.schedule = { ...scheduledScan.schedule, ...schedule };
        scheduledScan.schedule.nextRun = scheduledScan.calculateNextRun();
      }
      if (notifications) scheduledScan.notifications = { ...scheduledScan.notifications, ...notifications };
      if (tags) scheduledScan.tags = tags;
      if (status) scheduledScan.status = status;

      await scheduledScan.save();

      res.json(ApiResponse.success(scheduledScan, 'Scheduled scan updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete scheduled scan
   */
  async deleteSchedule(req, res, next) {
    try {
      const schedule = await ScheduledScan.findById(req.params.id);

      if (!schedule) {
        throw ApiError.notFound('Scheduled scan not found');
      }

      if (schedule.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      await schedule.deleteOne();

      res.json(ApiResponse.success(null, 'Scheduled scan deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pause/Resume scheduled scan
   */
  async toggleStatus(req, res, next) {
    try {
      const schedule = await ScheduledScan.findById(req.params.id);

      if (!schedule) {
        throw ApiError.notFound('Scheduled scan not found');
      }

      if (schedule.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      schedule.status = schedule.status === 'active' ? 'paused' : 'active';
      
      if (schedule.status === 'active') {
        schedule.schedule.nextRun = schedule.calculateNextRun();
      }

      await schedule.save();

      res.json(ApiResponse.success(schedule, `Scheduled scan ${schedule.status}`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Run scheduled scan immediately
   */
  async runNow(req, res, next) {
    try {
      const schedule = await ScheduledScan.findById(req.params.id);

      if (!schedule) {
        throw ApiError.notFound('Scheduled scan not found');
      }

      if (schedule.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      // Create scans for all targets
      const scans = [];
      for (const target of schedule.targets) {
        const scan = new VulnScan({
          userId: req.user.id,
          scanId: `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          targetType: target.targetType,
          targetIdentifier: target.targetIdentifier,
          scanType: schedule.scanConfig.scanType,
          scanConfig: schedule.scanConfig,
          status: 'pending',
          metadata: {
            scheduledScanId: schedule._id,
            triggeredManually: true
          }
        });

        await scan.save();
        scans.push(scan);
      }

      res.json(ApiResponse.success({
        scheduledScan: schedule,
        triggeredScans: scans
      }, `Started ${scans.length} scan(s)`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get execution history for a schedule
   */
  async getHistory(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const schedule = await ScheduledScan.findById(req.params.id);

      if (!schedule) {
        throw ApiError.notFound('Scheduled scan not found');
      }

      if (schedule.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      // Paginate execution history
      const start = (parseInt(page) - 1) * parseInt(limit);
      const history = schedule.executionHistory.slice(start, start + parseInt(limit));

      res.json(ApiResponse.success({
        history,
        pagination: {
          total: schedule.executionHistory.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(schedule.executionHistory.length / parseInt(limit))
        },
        stats: schedule.stats
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming scheduled scans
   */
  async getUpcoming(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const upcoming = await ScheduledScan.find({
        userId: req.user.id,
        status: 'active',
        'schedule.nextRun': { $gte: new Date() }
      })
        .sort({ 'schedule.nextRun': 1 })
        .limit(parseInt(limit))
        .select('name scheduleId schedule.nextRun targets')
        .lean();

      res.json(ApiResponse.success(upcoming));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get schedule statistics
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await ScheduledScan.aggregate([
        { $match: { userId: req.user.id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            paused: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } },
            totalRuns: { $sum: '$stats.totalRuns' },
            successfulRuns: { $sum: '$stats.successfulRuns' },
            failedRuns: { $sum: '$stats.failedRuns' }
          }
        }
      ]);

      res.json(ApiResponse.success(stats[0] || {
        total: 0,
        active: 0,
        paused: 0,
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0
      }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScheduleController();
