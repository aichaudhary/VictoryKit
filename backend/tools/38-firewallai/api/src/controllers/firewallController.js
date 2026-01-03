const FirewallService = require('../services/firewallService');
const FirewallRule = require('../models/FirewallRule');
const FirewallPolicy = require('../models/FirewallPolicy');
const TrafficLog = require('../models/TrafficLog');
const Alert = require('../models/Alert');
const Analytics = require('../models/Analytics');
const AuditTrail = require('../models/AuditTrail');

class FirewallController {
  // Firewall Rules Management
  async getRules(req, res) {
    try {
      const { vendor, deviceId, page = 1, limit = 50, enabled, action, protocol } = req.query;

      let query = {};
      if (vendor) query.vendor = vendor;
      if (deviceId) query['device.id'] = deviceId;
      if (enabled !== undefined) query.enabled = enabled === 'true';
      if (action) query.action = action;
      if (protocol) query.protocol = protocol;

      const rules = await FirewallRule.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('policyId');

      const total = await FirewallRule.countDocuments(query);

      res.json({
        success: true,
        data: rules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting firewall rules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve firewall rules',
        details: error.message
      });
    }
  }

  async getRule(req, res) {
    try {
      const { id } = req.params;
      const rule = await FirewallRule.findById(id).populate('policyId');

      if (!rule) {
        return res.status(404).json({
          success: false,
          error: 'Firewall rule not found'
        });
      }

      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      console.error('Error getting firewall rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve firewall rule',
        details: error.message
      });
    }
  }

  async createRule(req, res) {
    try {
      const ruleData = req.body;
      const userId = req.user?.id || 'system';
      const username = req.user?.username || 'system';

      // Validate required fields
      if (!ruleData.name || !ruleData.action || !ruleData.vendor) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, action, vendor'
        });
      }

      // Create rule in database
      const rule = new FirewallRule({
        ...ruleData,
        createdBy: userId,
        updatedBy: userId
      });
      await rule.save();

      // Create firewall rule on vendor device if API configured
      try {
        if (ruleData.device?.id) {
          await FirewallService.createFirewallRule(
            ruleData.vendor,
            ruleData,
            ruleData.device.id
          );
        }
      } catch (vendorError) {
        console.warn('Vendor API rule creation failed:', vendorError.message);
        // Don't fail the whole operation, just log the warning
      }

      // Create audit trail
      await AuditTrail.create({
        auditId: `rule-create-${rule._id}-${Date.now()}`,
        action: 'create',
        category: 'configuration',
        vendor: ruleData.vendor,
        device: ruleData.device,
        user: { id: userId, username },
        resource: { type: 'rule', id: rule._id, name: ruleData.name },
        changes: { after: ruleData },
        details: { description: `Created firewall rule: ${ruleData.name}` }
      });

      res.status(201).json({
        success: true,
        data: rule,
        message: 'Firewall rule created successfully'
      });
    } catch (error) {
      console.error('Error creating firewall rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create firewall rule',
        details: error.message
      });
    }
  }

  async updateRule(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id || 'system';
      const username = req.user?.username || 'system';

      const existingRule = await FirewallRule.findById(id);
      if (!existingRule) {
        return res.status(404).json({
          success: false,
          error: 'Firewall rule not found'
        });
      }

      // Update rule in database
      const updatedRule = await FirewallRule.findByIdAndUpdate(
        id,
        {
          ...updateData,
          updatedBy: userId,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('policyId');

      // Update rule on vendor device if API configured
      try {
        if (existingRule.device?.id) {
          await FirewallService.updateFirewallRule(
            existingRule.vendor,
            existingRule.vendorRuleId || id,
            updateData,
            existingRule.device.id
          );
        }
      } catch (vendorError) {
        console.warn('Vendor API rule update failed:', vendorError.message);
      }

      // Create audit trail
      await AuditTrail.create({
        auditId: `rule-update-${id}-${Date.now()}`,
        action: 'update',
        category: 'configuration',
        vendor: existingRule.vendor,
        device: existingRule.device,
        user: { id: userId, username },
        resource: { type: 'rule', id, name: existingRule.name },
        changes: { before: existingRule, after: updateData },
        details: { description: `Updated firewall rule: ${existingRule.name}` }
      });

      res.json({
        success: true,
        data: updatedRule,
        message: 'Firewall rule updated successfully'
      });
    } catch (error) {
      console.error('Error updating firewall rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update firewall rule',
        details: error.message
      });
    }
  }

  async deleteRule(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      const username = req.user?.username || 'system';

      const rule = await FirewallRule.findById(id);
      if (!rule) {
        return res.status(404).json({
          success: false,
          error: 'Firewall rule not found'
        });
      }

      // Delete rule from vendor device if API configured
      try {
        if (rule.device?.id) {
          await FirewallService.deleteFirewallRule(
            rule.vendor,
            rule.vendorRuleId || id,
            rule.device.id
          );
        }
      } catch (vendorError) {
        console.warn('Vendor API rule deletion failed:', vendorError.message);
      }

      // Delete rule from database
      await FirewallRule.findByIdAndDelete(id);

      // Create audit trail
      await AuditTrail.create({
        auditId: `rule-delete-${id}-${Date.now()}`,
        action: 'delete',
        category: 'configuration',
        vendor: rule.vendor,
        device: rule.device,
        user: { id: userId, username },
        resource: { type: 'rule', id, name: rule.name },
        changes: { before: rule },
        details: { description: `Deleted firewall rule: ${rule.name}` }
      });

      res.json({
        success: true,
        message: 'Firewall rule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting firewall rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete firewall rule',
        details: error.message
      });
    }
  }

  async enableRule(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      const username = req.user?.username || 'system';

      const rule = await FirewallRule.findById(id);
      if (!rule) {
        return res.status(404).json({
          success: false,
          error: 'Firewall rule not found'
        });
      }

      // Update rule status
      rule.enabled = true;
      rule.updatedBy = userId;
      rule.updatedAt = new Date();
      await rule.save();

      // Enable rule on vendor device if API configured
      try {
        if (rule.device?.id) {
          await FirewallService.updateFirewallRule(
            rule.vendor,
            rule.vendorRuleId || id,
            { enabled: true },
            rule.device.id
          );
        }
      } catch (vendorError) {
        console.warn('Vendor API rule enable failed:', vendorError.message);
      }

      // Create audit trail
      await AuditTrail.create({
        auditId: `rule-enable-${id}-${Date.now()}`,
        action: 'enable',
        category: 'configuration',
        vendor: rule.vendor,
        device: rule.device,
        user: { id: userId, username },
        resource: { type: 'rule', id, name: rule.name },
        changes: { before: { enabled: false }, after: { enabled: true } },
        details: { description: `Enabled firewall rule: ${rule.name}` }
      });

      res.json({
        success: true,
        data: rule,
        message: 'Firewall rule enabled successfully'
      });
    } catch (error) {
      console.error('Error enabling firewall rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to enable firewall rule',
        details: error.message
      });
    }
  }

  async disableRule(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      const username = req.user?.username || 'system';

      const rule = await FirewallRule.findById(id);
      if (!rule) {
        return res.status(404).json({
          success: false,
          error: 'Firewall rule not found'
        });
      }

      // Update rule status
      rule.enabled = false;
      rule.updatedBy = userId;
      rule.updatedAt = new Date();
      await rule.save();

      // Disable rule on vendor device if API configured
      try {
        if (rule.device?.id) {
          await FirewallService.updateFirewallRule(
            rule.vendor,
            rule.vendorRuleId || id,
            { enabled: false },
            rule.device.id
          );
        }
      } catch (vendorError) {
        console.warn('Vendor API rule disable failed:', vendorError.message);
      }

      // Create audit trail
      await AuditTrail.create({
        auditId: `rule-disable-${id}-${Date.now()}`,
        action: 'disable',
        category: 'configuration',
        vendor: rule.vendor,
        device: rule.device,
        user: { id: userId, username },
        resource: { type: 'rule', id, name: rule.name },
        changes: { before: { enabled: true }, after: { enabled: false } },
        details: { description: `Disabled firewall rule: ${rule.name}` }
      });

      res.json({
        success: true,
        data: rule,
        message: 'Firewall rule disabled successfully'
      });
    } catch (error) {
      console.error('Error disabling firewall rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to disable firewall rule',
        details: error.message
      });
    }
  }

  // Firewall Policies Management
  async getPolicies(req, res) {
    try {
      const { vendor, deviceId, page = 1, limit = 50, enabled } = req.query;

      let query = {};
      if (vendor) query.vendor = vendor;
      if (deviceId) query['device.id'] = deviceId;
      if (enabled !== undefined) query.enabled = enabled === 'true';

      const policies = await FirewallPolicy.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('rules');

      const total = await FirewallPolicy.countDocuments(query);

      res.json({
        success: true,
        data: policies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting firewall policies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve firewall policies',
        details: error.message
      });
    }
  }

  async getPolicy(req, res) {
    try {
      const { id } = req.params;
      const policy = await FirewallPolicy.findById(id).populate('rules');

      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Firewall policy not found'
        });
      }

      res.json({
        success: true,
        data: policy
      });
    } catch (error) {
      console.error('Error getting firewall policy:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve firewall policy',
        details: error.message
      });
    }
  }

  async createPolicy(req, res) {
    try {
      const policyData = req.body;
      const userId = req.user?.id || 'system';
      const username = req.user?.username || 'system';

      // Validate required fields
      if (!policyData.name || !policyData.vendor) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, vendor'
        });
      }

      // Create policy in database
      const policy = new FirewallPolicy({
        ...policyData,
        createdBy: userId,
        updatedBy: userId
      });
      await policy.save();

      // Create audit trail
      await AuditTrail.create({
        auditId: `policy-create-${policy._id}-${Date.now()}`,
        action: 'create',
        category: 'configuration',
        vendor: policyData.vendor,
        device: policyData.device,
        user: { id: userId, username },
        resource: { type: 'policy', id: policy._id, name: policyData.name },
        changes: { after: policyData },
        details: { description: `Created firewall policy: ${policyData.name}` }
      });

      res.status(201).json({
        success: true,
        data: policy,
        message: 'Firewall policy created successfully'
      });
    } catch (error) {
      console.error('Error creating firewall policy:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create firewall policy',
        details: error.message
      });
    }
  }

  async updatePolicy(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id || 'system';
      const username = req.user?.username || 'system';

      const existingPolicy = await FirewallPolicy.findById(id);
      if (!existingPolicy) {
        return res.status(404).json({
          success: false,
          error: 'Firewall policy not found'
        });
      }

      // Update policy in database
      const updatedPolicy = await FirewallPolicy.findByIdAndUpdate(
        id,
        {
          ...updateData,
          updatedBy: userId,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('rules');

      // Create audit trail
      await AuditTrail.create({
        auditId: `policy-update-${id}-${Date.now()}`,
        action: 'update',
        category: 'configuration',
        vendor: existingPolicy.vendor,
        device: existingPolicy.device,
        user: { id: userId, username },
        resource: { type: 'policy', id, name: existingPolicy.name },
        changes: { before: existingPolicy, after: updateData },
        details: { description: `Updated firewall policy: ${existingPolicy.name}` }
      });

      res.json({
        success: true,
        data: updatedPolicy,
        message: 'Firewall policy updated successfully'
      });
    } catch (error) {
      console.error('Error updating firewall policy:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update firewall policy',
        details: error.message
      });
    }
  }

  async deletePolicy(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      const username = req.user?.username || 'system';

      const policy = await FirewallPolicy.findById(id);
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Firewall policy not found'
        });
      }

      // Delete policy from database
      await FirewallPolicy.findByIdAndDelete(id);

      // Create audit trail
      await AuditTrail.create({
        auditId: `policy-delete-${id}-${Date.now()}`,
        action: 'delete',
        category: 'configuration',
        vendor: policy.vendor,
        device: policy.device,
        user: { id: userId, username },
        resource: { type: 'policy', id, name: policy.name },
        changes: { before: policy },
        details: { description: `Deleted firewall policy: ${policy.name}` }
      });

      res.json({
        success: true,
        message: 'Firewall policy deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting firewall policy:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete firewall policy',
        details: error.message
      });
    }
  }

  // Traffic Logs Management
  async getTrafficLogs(req, res) {
    try {
      const {
        vendor,
        deviceId,
        startTime,
        endTime,
        sourceIp,
        destinationIp,
        protocol,
        action,
        threatDetected,
        page = 1,
        limit = 100
      } = req.query;

      let query = {};
      if (vendor) query.vendor = vendor;
      if (deviceId) query['device.id'] = deviceId;
      if (startTime || endTime) {
        query.timestamp = {};
        if (startTime) query.timestamp.$gte = new Date(startTime);
        if (endTime) query.timestamp.$lte = new Date(endTime);
      }
      if (sourceIp) query['source.ip'] = sourceIp;
      if (destinationIp) query['destination.ip'] = destinationIp;
      if (protocol) query.protocol = protocol;
      if (action) query.action = action;
      if (threatDetected !== undefined) query['threat.detected'] = threatDetected === 'true';

      const logs = await TrafficLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await TrafficLog.countDocuments(query);

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting traffic logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve traffic logs',
        details: error.message
      });
    }
  }

  async getTrafficLog(req, res) {
    try {
      const { id } = req.params;
      const log = await TrafficLog.findById(id);

      if (!log) {
        return res.status(404).json({
          success: false,
          error: 'Traffic log not found'
        });
      }

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('Error getting traffic log:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve traffic log',
        details: error.message
      });
    }
  }

  // Alerts Management
  async getAlerts(req, res) {
    try {
      const {
        vendor,
        deviceId,
        severity,
        status,
        category,
        startTime,
        endTime,
        page = 1,
        limit = 50
      } = req.query;

      let query = {};
      if (vendor) query.vendor = vendor;
      if (deviceId) query['device.id'] = deviceId;
      if (severity) query.severity = severity;
      if (status) query.status = status;
      if (category) query.category = category;
      if (startTime || endTime) {
        query.timestamp = {};
        if (startTime) query.timestamp.$gte = new Date(startTime);
        if (endTime) query.timestamp.$lte = new Date(endTime);
      }

      const alerts = await Alert.find(query)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Alert.countDocuments(query);

      res.json({
        success: true,
        data: alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve alerts',
        details: error.message
      });
    }
  }

  async getAlert(req, res) {
    try {
      const { id } = req.params;
      const alert = await Alert.findById(id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found'
        });
      }

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      console.error('Error getting alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve alert',
        details: error.message
      });
    }
  }

  async acknowledgeAlert(req, res) {
    try {
      const { id } = req.params;
      const { userId, username } = req.body;

      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found'
        });
      }

      await alert.acknowledge(userId, username);

      res.json({
        success: true,
        data: alert,
        message: 'Alert acknowledged successfully'
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to acknowledge alert',
        details: error.message
      });
    }
  }

  async resolveAlert(req, res) {
    try {
      const { id } = req.params;
      const { userId, username, resolution } = req.body;

      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found'
        });
      }

      await alert.resolve(userId, username, resolution);

      res.json({
        success: true,
        data: alert,
        message: 'Alert resolved successfully'
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resolve alert',
        details: error.message
      });
    }
  }

  // Analytics and Reporting
  async getAnalytics(req, res) {
    try {
      const { vendor, period, startDate, endDate } = req.query;

      if (!vendor || !period) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: vendor, period'
        });
      }

      const analytics = await Analytics.getForPeriod(
        vendor,
        period,
        new Date(startDate),
        new Date(endDate)
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics',
        details: error.message
      });
    }
  }

  async getLatestAnalytics(req, res) {
    try {
      const { vendor, period = 'daily' } = req.query;

      if (!vendor) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: vendor'
        });
      }

      const analytics = await Analytics.getLatest(vendor, period);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting latest analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve latest analytics',
        details: error.message
      });
    }
  }

  // ML Analysis and Threat Detection
  async analyzeTraffic(req, res) {
    try {
      const { data } = req.body;

      if (!data) {
        return res.status(400).json({
          success: false,
          error: 'Missing analysis data'
        });
      }

      const analysis = await FirewallService.analyze(data);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing traffic:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze traffic',
        details: error.message
      });
    }
  }

  async scanNetwork(req, res) {
    try {
      const { target } = req.body;

      if (!target) {
        return res.status(400).json({
          success: false,
          error: 'Missing scan target'
        });
      }

      const scanResult = await FirewallService.scan(target);

      res.json({
        success: true,
        data: scanResult
      });
    } catch (error) {
      console.error('Error scanning network:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to scan network',
        details: error.message
      });
    }
  }

  // Real-time Monitoring
  async startMonitoring(req, res) {
    try {
      const { vendor, deviceId, clientId } = req.body;

      if (!vendor || !deviceId || !clientId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: vendor, deviceId, clientId'
        });
      }

      FirewallService.startRealTimeMonitoring(vendor, deviceId, clientId);

      res.json({
        success: true,
        message: `Real-time monitoring started for ${vendor} device ${deviceId}`
      });
    } catch (error) {
      console.error('Error starting monitoring:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start monitoring',
        details: error.message
      });
    }
  }

  async stopMonitoring(req, res) {
    try {
      const { vendor, deviceId } = req.body;

      if (!vendor || !deviceId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: vendor, deviceId'
        });
      }

      FirewallService.stopRealTimeMonitoring(vendor, deviceId);

      res.json({
        success: true,
        message: `Real-time monitoring stopped for ${vendor} device ${deviceId}`
      });
    } catch (error) {
      console.error('Error stopping monitoring:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to stop monitoring',
        details: error.message
      });
    }
  }

  // Vendor API Integration
  async syncVendorRules(req, res) {
    try {
      const { vendor, deviceId } = req.body;

      if (!vendor) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: vendor'
        });
      }

      const vendorRules = await FirewallService.getFirewallRules(vendor, deviceId);

      // Sync rules to database
      const syncedRules = [];
      for (const vendorRule of vendorRules) {
        const existingRule = await FirewallRule.findOne({
          vendor,
          'device.id': deviceId,
          vendorRuleId: vendorRule.id
        });

        if (existingRule) {
          // Update existing rule
          await FirewallRule.findByIdAndUpdate(existingRule._id, {
            ...vendorRule,
            updatedAt: new Date()
          });
          syncedRules.push(existingRule);
        } else {
          // Create new rule
          const newRule = new FirewallRule({
            ...vendorRule,
            vendor,
            device: { id: deviceId },
            vendorRuleId: vendorRule.id
          });
          await newRule.save();
          syncedRules.push(newRule);
        }
      }

      res.json({
        success: true,
        data: syncedRules,
        message: `Synced ${syncedRules.length} rules from ${vendor}`
      });
    } catch (error) {
      console.error('Error syncing vendor rules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync vendor rules',
        details: error.message
      });
    }
  }

  async syncVendorLogs(req, res) {
    try {
      const { vendor, deviceId, options = {} } = req.body;

      if (!vendor) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: vendor'
        });
      }

      const vendorLogs = await FirewallService.getFirewallLogs(vendor, deviceId, options);

      // Process and store logs
      const processedLogs = [];
      for (const vendorLog of vendorLogs) {
        const log = new TrafficLog({
          ...vendorLog,
          vendor,
          device: { id: deviceId }
        });
        await log.save();
        processedLogs.push(log);
      }

      res.json({
        success: true,
        data: processedLogs,
        message: `Synced ${processedLogs.length} logs from ${vendor}`
      });
    } catch (error) {
      console.error('Error syncing vendor logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync vendor logs',
        details: error.message
      });
    }
  }

  // Security Stack Integration
  async integrateWithSecurityStack(req, res) {
    try {
      const { entityId, data } = req.body;

      if (!entityId || !data) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: entityId, data'
        });
      }

      const result = await FirewallService.integrateWithSecurityStack(entityId, data);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error integrating with security stack:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to integrate with security stack',
        details: error.message
      });
    }
  }

  // Audit Trail
  async getAuditTrail(req, res) {
    try {
      const {
        userId,
        action,
        category,
        startTime,
        endTime,
        page = 1,
        limit = 50
      } = req.query;

      let query = {};
      if (userId) query['user.id'] = userId;
      if (action) query.action = action;
      if (category) query.category = category;
      if (startTime || endTime) {
        query.timestamp = {};
        if (startTime) query.timestamp.$gte = new Date(startTime);
        if (endTime) query.timestamp.$lte = new Date(endTime);
      }

      const auditEntries = await AuditTrail.find(query)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AuditTrail.countDocuments(query);

      res.json({
        success: true,
        data: auditEntries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting audit trail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve audit trail',
        details: error.message
      });
    }
  }

  // Health Check
  async healthCheck(req, res) {
    try {
      // Check database connectivity
      await FirewallRule.findOne().limit(1);

      // Check ML engine connectivity
      await FirewallService.analyze({ test: true });

      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          mlEngine: 'connected'
        }
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new FirewallController();