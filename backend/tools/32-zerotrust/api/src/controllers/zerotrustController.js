const AccessRequest = require('../models/AccessRequest');
const ZeroTrustPolicy = require('../models/ZeroTrustPolicy');
const DeviceTrust = require('../models/DeviceTrust');
const UserIdentity = require('../models/UserIdentity');
const NetworkSegment = require('../models/NetworkSegment');

class ZeroTrustController {
  
  // ==================== ACCESS REQUEST VERIFICATION ====================
  
  async createAccessRequest(req, res) {
    try {
      const requestData = req.body;
      
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const accessRequest = new AccessRequest({
        requestId,
        request: requestData.request,
        user: requestData.user,
        device: requestData.device,
        context: requestData.context || {},
        authentication: requestData.authentication,
        trust: { factors: {} },
        risk: {},
        policy: {},
        decision: {}
      });
      
      // Calculate trust and risk scores
      await accessRequest.calculateTrustScore();
      await accessRequest.calculateRiskScore();
      
      // Make decision
      await accessRequest.makeDecision();
      
      await accessRequest.save();
      
      res.json({
        success: true,
        data: {
          requestId: accessRequest.requestId,
          decision: accessRequest.decision.verdict,
          trustScore: accessRequest.trust.trust_score,
          riskScore: accessRequest.risk.risk_score,
          accessRequest
        },
        message: 'Access request evaluated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getAccessRequests(req, res) {
    try {
      const {
        user_id,
        device_id,
        resource_id,
        decision,
        min_trust_score,
        max_risk_score,
        start_date,
        end_date,
        page = 1,
        limit = 50,
        sort = '-request.timestamp'
      } = req.query;
      
      const query = {};
      
      if (user_id) query['user.user_id'] = user_id;
      if (device_id) query['device.device_id'] = device_id;
      if (resource_id) query['request.resource_id'] = resource_id;
      if (decision) query['decision.verdict'] = decision;
      if (min_trust_score) query['trust.trust_score'] = { $gte: parseFloat(min_trust_score) };
      if (max_risk_score) query['risk.risk_score'] = { $lte: parseFloat(max_risk_score) };
      
      if (start_date || end_date) {
        query['request.timestamp'] = {};
        if (start_date) query['request.timestamp'].$gte = new Date(start_date);
        if (end_date) query['request.timestamp'].$lte = new Date(end_date);
      }
      
      const skip = (page - 1) * limit;
      
      const requests = await AccessRequest.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await AccessRequest.countDocuments(query);
      
      res.json({
        success: true,
        data: requests,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getAccessRequestById(req, res) {
    try {
      const { requestId } = req.params;
      
      const accessRequest = await AccessRequest.findOne({ requestId });
      
      if (!accessRequest) {
        return res.status(404).json({ success: false, error: 'Access request not found' });
      }
      
      res.json({ success: true, data: accessRequest });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async approveAccessRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { approved_by, reason } = req.body;
      
      const accessRequest = await AccessRequest.findOne({ requestId });
      
      if (!accessRequest) {
        return res.status(404).json({ success: false, error: 'Access request not found' });
      }
      
      accessRequest.decision.verdict = 'allow';
      accessRequest.decision.reason = reason || 'Manually approved';
      accessRequest.decision.decided_by = 'manual';
      accessRequest.decision.decided_at = new Date();
      accessRequest.audit.approval_chain.push({
        approved_by,
        action: 'approved',
        timestamp: new Date(),
        reason
      });
      
      await accessRequest.save();
      
      res.json({
        success: true,
        data: accessRequest,
        message: 'Access request approved'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async denyAccessRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { denied_by, reason } = req.body;
      
      const accessRequest = await AccessRequest.findOne({ requestId });
      
      if (!accessRequest) {
        return res.status(404).json({ success: false, error: 'Access request not found' });
      }
      
      accessRequest.decision.verdict = 'deny';
      accessRequest.decision.reason = reason || 'Manually denied';
      accessRequest.decision.decided_by = 'manual';
      accessRequest.decision.decided_at = new Date();
      accessRequest.audit.approval_chain.push({
        approved_by: denied_by,
        action: 'denied',
        timestamp: new Date(),
        reason
      });
      
      await accessRequest.save();
      
      res.json({
        success: true,
        data: accessRequest,
        message: 'Access request denied'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== TRUST SCORE CALCULATION ====================
  
  async calculateTrustScore(req, res) {
    try {
      const { user_id, device_id, context } = req.body;
      
      // Get user and device
      const user = await UserIdentity.findOne({ userId: user_id });
      const device = await DeviceTrust.findOne({ deviceId: device_id });
      
      if (!user || !device) {
        return res.status(404).json({ 
          success: false, 
          error: 'User or device not found' 
        });
      }
      
      // Calculate trust scores
      const userTrustScore = user.calculateTrustScore();
      const deviceTrustScore = device.calculateTrustScore();
      
      await user.save();
      await device.save();
      
      // Composite trust score
      const compositeTrustScore = Math.round((userTrustScore * 0.6) + (deviceTrustScore * 0.4));
      
      res.json({
        success: true,
        data: {
          user_trust_score: userTrustScore,
          device_trust_score: deviceTrustScore,
          composite_trust_score: compositeTrustScore,
          user_factors: user.trust.factors,
          device_factors: device.trust.factors
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getTrustScoreHistory(req, res) {
    try {
      const { user_id, days = 30 } = req.query;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      
      const requests = await AccessRequest.find({
        'user.user_id': user_id,
        'request.timestamp': { $gte: startDate }
      })
        .select('request.timestamp trust.trust_score risk.risk_score')
        .sort('request.timestamp');
      
      const history = requests.map(r => ({
        timestamp: r.request.timestamp,
        trust_score: r.trust.trust_score,
        risk_score: r.risk.risk_score
      }));
      
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== ZERO TRUST POLICY MANAGEMENT ====================
  
  async createPolicy(req, res) {
    try {
      const policyData = req.body;
      
      const policyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const policy = new ZeroTrustPolicy({
        policyId,
        policy: policyData.policy,
        scope: policyData.scope,
        trust_requirements: policyData.trust_requirements,
        conditions: policyData.conditions,
        enforcement: policyData.enforcement,
        monitoring: policyData.monitoring,
        management: policyData.management
      });
      
      await policy.save();
      
      res.json({
        success: true,
        data: policy,
        message: 'Zero Trust policy created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getPolicies(req, res) {
    try {
      const {
        status,
        category,
        framework,
        priority,
        page = 1,
        limit = 50
      } = req.query;
      
      const query = {};
      
      if (status) query['policy.status'] = status;
      if (category) query['policy.category'] = category;
      if (framework) query['policy.framework'] = framework;
      if (priority) query['policy.priority'] = { $gte: parseInt(priority) };
      
      const skip = (page - 1) * limit;
      
      const policies = await ZeroTrustPolicy.find(query)
        .sort('-policy.priority')
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await ZeroTrustPolicy.countDocuments(query);
      
      res.json({
        success: true,
        data: policies,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getPolicyById(req, res) {
    try {
      const { policyId } = req.params;
      
      const policy = await ZeroTrustPolicy.findOne({ policyId });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      res.json({ success: true, data: policy });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async updatePolicy(req, res) {
    try {
      const { policyId } = req.params;
      const updates = req.body;
      
      const policy = await ZeroTrustPolicy.findOne({ policyId });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          policy[key] = updates[key];
        }
      });
      
      policy.management.version += 1;
      policy.management.last_modified_by = updates.modified_by || 'system';
      
      await policy.save();
      
      res.json({
        success: true,
        data: policy,
        message: 'Policy updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async activatePolicy(req, res) {
    try {
      const { policyId } = req.params;
      
      const policy = await ZeroTrustPolicy.findOne({ policyId });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      await policy.activate();
      
      res.json({
        success: true,
        data: policy,
        message: 'Policy activated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async deactivatePolicy(req, res) {
    try {
      const { policyId } = req.params;
      
      const policy = await ZeroTrustPolicy.findOne({ policyId });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      await policy.deactivate();
      
      res.json({
        success: true,
        data: policy,
        message: 'Policy deactivated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async evaluatePolicy(req, res) {
    try {
      const { policyId } = req.params;
      const { request } = req.body;
      
      const policy = await ZeroTrustPolicy.findOne({ policyId });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      const evaluation = await policy.evaluateRequest(request);
      
      res.json({
        success: true,
        data: evaluation
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== BEHAVIOR ANOMALY DETECTION ====================
  
  async analyzeBehavior(req, res) {
    try {
      const { user_id, activity } = req.body;
      
      const user = await UserIdentity.findOne({ userId: user_id });
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      const anomalies = user.detectBehaviorAnomaly(activity);
      
      await user.save();
      
      res.json({
        success: true,
        data: {
          anomalies_detected: anomalies.length,
          anomalies,
          user_risk_score: user.risk.risk_score
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getBehaviorAnomalies(req, res) {
    try {
      const { user_id, unresolved_only } = req.query;
      
      const query = {};
      if (user_id) query.userId = user_id;
      
      const users = await UserIdentity.find(query);
      
      let allAnomalies = [];
      users.forEach(user => {
        const userAnomalies = user.behavior.anomalies_detected
          .filter(a => !unresolved_only || !a.resolved)
          .map(a => ({
            user_id: user.userId,
            username: user.identity.username,
            ...a
          }));
        allAnomalies = allAnomalies.concat(userAnomalies);
      });
      
      // Sort by severity and date
      allAnomalies.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
      
      res.json({
        success: true,
        data: allAnomalies,
        total: allAnomalies.length
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== DEVICE TRUST ASSESSMENT ====================
  
  async assessDevice(req, res) {
    try {
      const deviceData = req.body;
      
      const deviceId = deviceData.device_id || `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      let device = await DeviceTrust.findOne({ deviceId });
      
      if (!device) {
        device = new DeviceTrust({
          deviceId,
          device: deviceData.device,
          os: deviceData.os,
          security: deviceData.security,
          compliance: {},
          trust: { factors: {} },
          network: deviceData.network,
          user: deviceData.user
        });
      } else {
        // Update device info
        Object.assign(device, deviceData);
      }
      
      // Calculate trust score
      device.calculateTrustScore();
      
      // Assess compliance
      const complianceRequirements = {
        encryption_required: true,
        antivirus_required: true
      };
      device.assessCompliance(complianceRequirements);
      
      await device.save();
      
      res.json({
        success: true,
        data: {
          deviceId: device.deviceId,
          trust_score: device.trust.trust_score,
          trust_level: device.trust.trust_level,
          is_compliant: device.compliance.is_compliant,
          violations: device.compliance.violations,
          device
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getDevices(req, res) {
    try {
      const {
        device_type,
        ownership,
        is_managed,
        is_compliant,
        min_trust_score,
        user_id,
        page = 1,
        limit = 50
      } = req.query;
      
      const query = {};
      
      if (device_type) query['device.device_type'] = device_type;
      if (ownership) query['device.ownership'] = ownership;
      if (is_managed !== undefined) query['device.is_managed'] = is_managed === 'true';
      if (is_compliant !== undefined) query['compliance.is_compliant'] = is_compliant === 'true';
      if (min_trust_score) query['trust.trust_score'] = { $gte: parseFloat(min_trust_score) };
      if (user_id) query['user.primary_user_id'] = user_id;
      
      const skip = (page - 1) * limit;
      
      const devices = await DeviceTrust.find(query)
        .sort('-trust.trust_score')
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await DeviceTrust.countDocuments(query);
      
      res.json({
        success: true,
        data: devices,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getDeviceById(req, res) {
    try {
      const { deviceId } = req.params;
      
      const device = await DeviceTrust.findOne({ deviceId });
      
      if (!device) {
        return res.status(404).json({ success: false, error: 'Device not found' });
      }
      
      res.json({ success: true, data: device });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async quarantineDevice(req, res) {
    try {
      const { deviceId } = req.params;
      const { reason } = req.body;
      
      const device = await DeviceTrust.findOne({ deviceId });
      
      if (!device) {
        return res.status(404).json({ success: false, error: 'Device not found' });
      }
      
      await device.quarantine(reason || 'Security policy violation');
      
      res.json({
        success: true,
        data: device,
        message: 'Device quarantined successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== USER IDENTITY MANAGEMENT ====================
  
  async createUser(req, res) {
    try {
      const userData = req.body;
      
      const userId = userData.user_id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const user = new UserIdentity({
        userId,
        identity: userData.identity,
        authorization: userData.authorization,
        authentication: userData.authentication,
        behavior: { baseline: {}, current_patterns: {}, anomalies_detected: [] },
        trust: { factors: {} },
        risk: {},
        access: {},
        continuous_auth: userData.continuous_auth || {}
      });
      
      // Calculate initial trust and risk scores
      user.calculateTrustScore();
      user.calculateRiskScore();
      
      await user.save();
      
      res.json({
        success: true,
        data: user,
        message: 'User identity created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getUsers(req, res) {
    try {
      const {
        status,
        role,
        clearance_level,
        is_privileged,
        is_high_risk,
        department,
        page = 1,
        limit = 50
      } = req.query;
      
      const query = {};
      
      if (status) query['identity.status'] = status;
      if (role) query['authorization.role'] = role;
      if (clearance_level) query['authorization.clearance_level'] = clearance_level;
      if (is_privileged !== undefined) query['authorization.is_privileged'] = is_privileged === 'true';
      if (is_high_risk !== undefined) query['risk.is_high_risk'] = is_high_risk === 'true';
      if (department) query['identity.department'] = department;
      
      const skip = (page - 1) * limit;
      
      const users = await UserIdentity.find(query)
        .select('-authentication.password')
        .sort('-access.last_login')
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await UserIdentity.countDocuments(query);
      
      res.json({
        success: true,
        data: users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      
      const user = await UserIdentity.findOne({ userId })
        .select('-authentication.password');
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async addToWatchlist(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      
      const user = await UserIdentity.findOne({ userId });
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      await user.addToWatchlist(reason || 'Security monitoring');
      
      res.json({
        success: true,
        data: user,
        message: 'User added to watchlist'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== NETWORK MICRO-SEGMENTATION ====================
  
  async createSegment(req, res) {
    try {
      const segmentData = req.body;
      
      const segmentId = `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const segment = new NetworkSegment({
        segmentId,
        segment: segmentData.segment,
        network: segmentData.network,
        isolation: segmentData.isolation,
        access_control: segmentData.access_control,
        members: segmentData.members || {},
        monitoring: segmentData.monitoring || {},
        micro_segmentation: segmentData.micro_segmentation || {}
      });
      
      await segment.save();
      
      res.json({
        success: true,
        data: segment,
        message: 'Network segment created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getSegments(req, res) {
    try {
      const {
        segment_type,
        security_zone,
        trust_level,
        status,
        microsegmentation_enabled,
        page = 1,
        limit = 50
      } = req.query;
      
      const query = {};
      
      if (segment_type) query['segment.segment_type'] = segment_type;
      if (security_zone) query['segment.security_zone'] = security_zone;
      if (trust_level) query['segment.trust_level'] = trust_level;
      if (status) query['segment.status'] = status;
      if (microsegmentation_enabled !== undefined) {
        query['micro_segmentation.enabled'] = microsegmentation_enabled === 'true';
      }
      
      const skip = (page - 1) * limit;
      
      const segments = await NetworkSegment.find(query)
        .sort('segment.security_zone')
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await NetworkSegment.countDocuments(query);
      
      res.json({
        success: true,
        data: segments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getSegmentById(req, res) {
    try {
      const { segmentId } = req.params;
      
      const segment = await NetworkSegment.findOne({ segmentId });
      
      if (!segment) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      
      res.json({ success: true, data: segment });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async allowInbound(req, res) {
    try {
      const { segmentId } = req.params;
      const { source_segment_id, source_segment_name, ports, protocols } = req.body;
      
      const segment = await NetworkSegment.findOne({ segmentId });
      
      if (!segment) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      
      await segment.allowInboundFrom(source_segment_id, source_segment_name, ports, protocols);
      
      res.json({
        success: true,
        data: segment,
        message: 'Inbound access allowed'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async blockSegment(req, res) {
    try {
      const { segmentId } = req.params;
      const { target_segment_id, reason } = req.body;
      
      const segment = await NetworkSegment.findOne({ segmentId });
      
      if (!segment) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      
      await segment.blockSegment(target_segment_id, reason);
      
      res.json({
        success: true,
        data: segment,
        message: 'Segment blocked successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async addFirewallRule(req, res) {
    try {
      const { segmentId } = req.params;
      const rule = req.body;
      
      const segment = await NetworkSegment.findOne({ segmentId });
      
      if (!segment) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      
      await segment.addFirewallRule(rule);
      
      res.json({
        success: true,
        data: segment,
        message: 'Firewall rule added successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async detectLateralMovement(req, res) {
    try {
      const { segmentId } = req.params;
      const { connection } = req.body;
      
      const segment = await NetworkSegment.findOne({ segmentId });
      
      if (!segment) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      
      const anomalies = segment.detectLateralMovement(connection);
      
      await segment.save();
      
      res.json({
        success: true,
        data: {
          anomalies_detected: anomalies.length,
          anomalies,
          suspicious_connections: segment.lateral_movement.suspicious_connections
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async quarantineSegment(req, res) {
    try {
      const { segmentId } = req.params;
      const { reason } = req.body;
      
      const segment = await NetworkSegment.findOne({ segmentId });
      
      if (!segment) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      
      await segment.quarantine(reason || 'Security incident');
      
      res.json({
        success: true,
        data: segment,
        message: 'Segment quarantined successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async enableMicroSegmentation(req, res) {
    try {
      const { segmentId } = req.params;
      const { strategy } = req.body;
      
      const segment = await NetworkSegment.findOne({ segmentId });
      
      if (!segment) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      
      await segment.enableMicroSegmentation(strategy);
      
      res.json({
        success: true,
        data: segment,
        message: 'Micro-segmentation enabled successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== CONTINUOUS AUTHENTICATION ====================
  
  async validateSession(req, res) {
    try {
      const { user_id, session_id } = req.body;
      
      const user = await UserIdentity.findOne({ userId: user_id });
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      const session = user.access.active_sessions.find(s => s.session_id === session_id);
      
      if (!session) {
        return res.status(404).json({ 
          success: false, 
          error: 'Session not found',
          action: 'require_reauthentication'
        });
      }
      
      // Check if session is still valid
      const now = new Date();
      const sessionAge = (now - session.started_at) / 1000; // seconds
      const idleTime = (now - session.last_activity) / 1000; // seconds
      
      const maxSessionAge = 8 * 60 * 60; // 8 hours
      const maxIdleTime = 30 * 60; // 30 minutes
      
      if (sessionAge > maxSessionAge || idleTime > maxIdleTime) {
        return res.json({
          success: false,
          valid: false,
          reason: sessionAge > maxSessionAge ? 'Session expired' : 'Session idle timeout',
          action: 'require_reauthentication'
        });
      }
      
      // Update last activity
      session.last_activity = now;
      user.continuous_auth.last_validation = now;
      
      await user.save();
      
      res.json({
        success: true,
        valid: true,
        session
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== REPORTING & ANALYTICS ====================
  
  async generateAccessReport(req, res) {
    try {
      const { start_date, end_date, format = 'json' } = req.query;
      
      const query = {};
      if (start_date || end_date) {
        query['request.timestamp'] = {};
        if (start_date) query['request.timestamp'].$gte = new Date(start_date);
        if (end_date) query['request.timestamp'].$lte = new Date(end_date);
      }
      
      const requests = await AccessRequest.find(query);
      
      const report = {
        period: { start_date, end_date },
        total_requests: requests.length,
        by_decision: {
          allowed: requests.filter(r => r.decision.verdict === 'allow').length,
          denied: requests.filter(r => r.decision.verdict === 'deny').length,
          step_up_auth: requests.filter(r => r.decision.verdict === 'step_up_auth').length,
          limited_access: requests.filter(r => r.decision.verdict === 'limited_access').length
        },
        average_trust_score: requests.reduce((sum, r) => sum + r.trust.trust_score, 0) / requests.length,
        average_risk_score: requests.reduce((sum, r) => sum + r.risk.risk_score, 0) / requests.length,
        high_risk_requests: requests.filter(r => r.risk.risk_score >= 70).length,
        low_trust_requests: requests.filter(r => r.trust.trust_score < 50).length
      };
      
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getDashboardStats(req, res) {
    try {
      const totalPolicies = await ZeroTrustPolicy.countDocuments();
      const activePolicies = await ZeroTrustPolicy.countDocuments({ 'policy.status': 'active' });
      const totalDevices = await DeviceTrust.countDocuments();
      const compliantDevices = await DeviceTrust.countDocuments({ 'compliance.is_compliant': true });
      const totalUsers = await UserIdentity.countDocuments();
      const highRiskUsers = await UserIdentity.countDocuments({ 'risk.is_high_risk': true });
      const totalSegments = await NetworkSegment.countDocuments();
      const microSegmentedNetworks = await NetworkSegment.countDocuments({ 'micro_segmentation.enabled': true });
      
      // Recent access requests (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentRequests = await AccessRequest.countDocuments({
        'request.timestamp': { $gte: yesterday }
      });
      const deniedRequests = await AccessRequest.countDocuments({
        'request.timestamp': { $gte: yesterday },
        'decision.verdict': 'deny'
      });
      
      res.json({
        success: true,
        data: {
          policies: { total: totalPolicies, active: activePolicies },
          devices: { total: totalDevices, compliant: compliantDevices },
          users: { total: totalUsers, high_risk: highRiskUsers },
          segments: { total: totalSegments, micro_segmented: microSegmentedNetworks },
          recent_access: { total: recentRequests, denied: deniedRequests }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ZeroTrustController();
