/**
 * AuditTrailPro - Alert Controller
 * Active alerts management
 */

const AlertService = require('../services/alertService');

// Get active alerts
exports.getActiveAlerts = async (req, res) => {
  try {
    const { severity, status, category } = req.query;
    const alerts = AlertService.getActiveAlerts({ severity, status, category });
    
    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Get active alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active alerts',
      error: error.message
    });
  }
};

// Get alert history
exports.getAlertHistory = async (req, res) => {
  try {
    const { limit } = req.query;
    const history = AlertService.getAlertHistory(parseInt(limit) || 100);
    
    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Get alert history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alert history',
      error: error.message
    });
  }
};

// Get alert statistics
exports.getAlertStats = async (req, res) => {
  try {
    const stats = AlertService.getAlertStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alert stats',
      error: error.message
    });
  }
};

// Acknowledge alert
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'userId and userName are required'
      });
    }
    
    const alert = AlertService.acknowledgeAlert(id, userId, userName);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Alert acknowledged',
      alert
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert',
      error: error.message
    });
  }
};

// Resolve alert
exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, resolution } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'userId and userName are required'
      });
    }
    
    const alert = AlertService.resolveAlert(id, userId, userName, resolution);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Alert resolved',
      alert
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: error.message
    });
  }
};
