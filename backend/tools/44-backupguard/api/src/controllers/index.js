const axios = require('axios');
const backupGuardService = require('../services/backupGuardService');
const { Backup, StorageLocation, IntegrityCheck, RetentionPolicy, Alert, AccessLog } = require('../models');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8044';

// ===== Health & Status =====
exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'BackupGuard', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHealth = async (req, res) => {
  try {
    const [backupsCount, storageCount, alertsCount] = await Promise.all([
      Backup.countDocuments(),
      StorageLocation.countDocuments({ status: 'active' }),
      Alert.countDocuments({ status: 'new' })
    ]);
    res.json({
      status: 'healthy',
      service: 'BackupGuard',
      version: '1.0.0',
      backups: backupsCount,
      storageLocations: storageCount,
      pendingAlerts: alertsCount,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalBackups,
      completedBackups,
      failedBackups,
      runningBackups,
      storageLocations,
      pendingAlerts,
      criticalAlerts,
      recentBackups
    ] = await Promise.all([
      Backup.countDocuments(),
      Backup.countDocuments({ status: 'completed' }),
      Backup.countDocuments({ status: 'failed' }),
      Backup.countDocuments({ status: 'running' }),
      StorageLocation.find({ status: 'active' }).select('name type capacity'),
      Alert.countDocuments({ status: 'new' }),
      Alert.countDocuments({ status: 'new', severity: 'critical' }),
      Backup.find().sort({ createdAt: -1 }).limit(10).populate('target', 'name type')
    ]);

    const totalStorage = storageLocations.reduce((sum, s) => sum + (s.capacity?.usedBytes || 0), 0);
    const successRate = totalBackups > 0 ? Math.round((completedBackups / totalBackups) * 100) : 100;

    res.json({
      overview: {
        totalBackups,
        completedBackups,
        failedBackups,
        runningBackups,
        successRate,
        totalStorageUsed: totalStorage,
        pendingAlerts,
        criticalAlerts
      },
      storageLocations,
      recentBackups,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Backups =====
exports.getBackups = async (req, res) => {
  try {
    const { status, type, limit = 50, skip = 0, sort = '-createdAt' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const [backups, total] = await Promise.all([
      Backup.find(query).sort(sort).skip(Number(skip)).limit(Number(limit)).populate('target', 'name type'),
      Backup.countDocuments(query)
    ]);

    res.json({ backups, total, limit: Number(limit), skip: Number(skip) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBackupById = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id).populate('target');
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBackup = async (req, res) => {
  try {
    const backup = new Backup(req.body);
    await backup.save();
    await AccessLog.logAccess({
      action: 'backup_create',
      result: 'success',
      user: { userId: req.user?.id, email: req.user?.email },
      session: { ipAddress: req.ip },
      resource: { type: 'backup', id: backup._id, name: backup.name }
    });
    res.status(201).json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBackup = async (req, res) => {
  try {
    const backup = await Backup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBackup = async (req, res) => {
  try {
    const backup = await Backup.findByIdAndDelete(req.params.id);
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    await AccessLog.logAccess({
      action: 'backup_delete',
      result: 'success',
      user: { userId: req.user?.id, email: req.user?.email },
      session: { ipAddress: req.ip },
      resource: { type: 'backup', id: backup._id, name: backup.name }
    });
    res.json({ success: true, message: 'Backup deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.startBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    await backup.start();
    res.json({ success: true, backup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelBackup = async (req, res) => {
  try {
    const backup = await Backup.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    res.json({ success: true, backup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBackupProgress = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id).select('status execution');
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    res.json({ status: backup.status, progress: backup.execution });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Restores =====
exports.initiateRestore = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    await AccessLog.logAccess({
      action: 'restore_initiate',
      result: 'success',
      user: { userId: req.user?.id, email: req.user?.email },
      session: { ipAddress: req.ip },
      resource: { type: 'backup', id: backup._id, name: backup.name }
    });
    res.json({ success: true, restoreId: `RST-${Date.now()}`, backup: backup._id, status: 'initiated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRestores = async (req, res) => {
  res.json({ restores: [], total: 0 });
};

exports.getRestoreById = async (req, res) => {
  res.json({ id: req.params.id, status: 'pending' });
};

exports.cancelRestore = async (req, res) => {
  res.json({ success: true, message: 'Restore cancelled' });
};

// ===== Storage Locations =====
exports.getStorageLocations = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    const locations = await StorageLocation.find(query).sort('-createdAt');
    res.json({ storageLocations: locations, total: locations.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStorageLocationById = async (req, res) => {
  try {
    const location = await StorageLocation.findById(req.params.id);
    if (!location) return res.status(404).json({ error: 'Storage location not found' });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createStorageLocation = async (req, res) => {
  try {
    const location = new StorageLocation(req.body);
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStorageLocation = async (req, res) => {
  try {
    const location = await StorageLocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) return res.status(404).json({ error: 'Storage location not found' });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStorageLocation = async (req, res) => {
  try {
    const location = await StorageLocation.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ error: 'Storage location not found' });
    res.json({ success: true, message: 'Storage location deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.testStorageConnection = async (req, res) => {
  try {
    const location = await StorageLocation.findById(req.params.id);
    if (!location) return res.status(404).json({ error: 'Storage location not found' });
    const connected = await location.testConnection();
    await location.save();
    res.json({ success: connected, connectivity: location.connectivity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStorageCapacity = async (req, res) => {
  try {
    const location = await StorageLocation.findById(req.params.id).select('capacity');
    if (!location) return res.status(404).json({ error: 'Storage location not found' });
    res.json(location.capacity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Integrity Checks =====
exports.getIntegrityChecks = async (req, res) => {
  try {
    const { status, type, backup } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (backup) query.backup = backup;
    const checks = await IntegrityCheck.find(query).sort('-createdAt').limit(50).populate('backup', 'name');
    res.json({ integrityChecks: checks, total: checks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIntegrityCheckById = async (req, res) => {
  try {
    const check = await IntegrityCheck.findById(req.params.id).populate('backup');
    if (!check) return res.status(404).json({ error: 'Integrity check not found' });
    res.json(check);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createIntegrityCheck = async (req, res) => {
  try {
    const check = new IntegrityCheck(req.body);
    await check.save();
    res.status(201).json(check);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ error: 'Backup not found' });
    
    const check = new IntegrityCheck({
      backup: backup._id,
      backupId: backup.backupId,
      type: 'checksum',
      trigger: { type: 'manual', userId: req.user?.id }
    });
    await check.start();
    
    res.json({ success: true, integrityCheck: check });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Retention Policies =====
exports.getPolicies = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const policies = await RetentionPolicy.find(query).sort('-priority');
    res.json({ policies, total: policies.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPolicyById = async (req, res) => {
  try {
    const policy = await RetentionPolicy.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const policy = new RetentionPolicy(req.body);
    await policy.save();
    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await RetentionPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await RetentionPolicy.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json({ success: true, message: 'Policy deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.applyPolicy = async (req, res) => {
  try {
    const policy = await RetentionPolicy.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    policy.stats.lastEnforced = new Date();
    await policy.save();
    res.json({ success: true, message: 'Policy applied', policy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Alerts =====
exports.getAlerts = async (req, res) => {
  try {
    const { status, severity, type, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.type = type;
    const alerts = await Alert.find(query).sort('-createdAt').limit(Number(limit));
    res.json({ alerts, total: alerts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlertsCount = async (req, res) => {
  try {
    const [total, unread, critical, high] = await Promise.all([
      Alert.countDocuments({ status: { $in: ['new', 'acknowledged'] } }),
      Alert.countDocuments({ read: false }),
      Alert.countDocuments({ severity: 'critical', status: 'new' }),
      Alert.countDocuments({ severity: 'high', status: 'new' })
    ]);
    res.json({ total, unread, critical, high });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('backup storageLocation');
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    await alert.acknowledge(req.user?.id);
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    await alert.resolve(req.body.actionTaken, req.user?.id);
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.dismissAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    alert.status = 'dismissed';
    await alert.save();
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Access Logs =====
exports.getAccessLogs = async (req, res) => {
  try {
    const { action, result, limit = 100 } = req.query;
    const query = {};
    if (action) query.action = action;
    if (result) query.result = result;
    const logs = await AccessLog.find(query).sort('-timestamp').limit(Number(limit));
    res.json({ logs, total: logs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActivitySummary = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const summary = await AccessLog.getActivitySummary(since);
    res.json({ summary, period: `${days} days` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSuspiciousActivity = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const activity = await AccessLog.getSuspiciousActivity(since);
    res.json({ suspiciousActivity: activity, total: activity.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Reports =====
exports.getReports = async (req, res) => {
  res.json({ reports: [], total: 0 });
};

exports.getReportById = async (req, res) => {
  res.json({ id: req.params.id, status: 'pending' });
};

exports.generateReport = async (req, res) => {
  res.json({ success: true, reportId: `RPT-${Date.now()}`, status: 'generating' });
};

// ===== Config =====
exports.getConfig = async (req, res) => {
  res.json({
    autoBackup: true,
    integrityCheckInterval: 24,
    alertThreshold: 0.8,
    retentionDefault: 30,
    encryptionEnabled: true,
    compressionEnabled: true
  });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

// ===== AI Analysis =====
exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await backupGuardService.analyze(data);

    backupGuardService.integrateWithSecurityStack(`analyze_${Date.now()}`, {
      ...result,
      sourceIP: req.ip,
      userAgent: req.get('User-Agent')
    }).catch(err => console.error('Integration failed:', err));

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scan = async (req, res) => {
  try {
    const { target } = req.body;
    const result = await backupGuardService.scan(target);

    backupGuardService.integrateWithSecurityStack(`scan_${Date.now()}`, {
      ...result,
      target,
      sourceIP: req.ip,
      userAgent: req.get('User-Agent')
    }).catch(err => console.error('Integration failed:', err));

    res.json({ success: true, scanId: Date.now(), result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};
