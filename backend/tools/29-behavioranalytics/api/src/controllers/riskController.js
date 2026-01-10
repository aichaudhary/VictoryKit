const AssetRisk = require('../models/AssetRisk');
const UserRisk = require('../models/UserRisk');
const ThreatRisk = require('../models/ThreatRisk');
const VendorRisk = require('../models/VendorRisk');
const RiskPrediction = require('../models/RiskPrediction');
const { v4: uuidv4 } = require('uuid');

class RiskScoreController {
  
  // ==================== ASSET RISK MANAGEMENT ====================
  
  async calculateAssetRisk(req, res) {
    try {
      const { asset_id, asset_type, asset_data, include_predictions, risk_model } = req.body;
      
      // Calculate risk score using selected framework
      const riskScore = this.computeAssetRiskScore(asset_data, risk_model || 'nist');
      
      let assetRisk = await AssetRisk.findOne({ assetId: asset_id });
      
      if (assetRisk) {
        await assetRisk.updateRiskScore(riskScore);
      } else {
        assetRisk = new AssetRisk({
          assetId: asset_id,
          assetName: asset_data.name || asset_id,
          assetType: asset_type,
          riskScore: { current: riskScore },
          riskLevel: this.getRiskLevel(riskScore),
          criticality: {
            businessCriticality: asset_data.criticality || 'medium',
            dataClassification: asset_data.data_classification || 'internal'
          },
          vulnerabilities: {
            total: asset_data.vulnerabilities?.length || 0,
            cves: asset_data.vulnerabilities?.map(v => v.cve) || [],
            lastPatched: asset_data.last_patched
          },
          exposure: {
            networkExposure: asset_data.exposure || 'internal',
            publiclyAccessible: asset_data.exposure === 'internet_facing'
          },
          securityControls: {
            implemented: asset_data.controls || []
          },
          riskFactors: this.extractAssetRiskFactors(asset_data)
        });
        await assetRisk.save();
      }
      
      // Generate AI predictions if requested
      if (include_predictions) {
        const prediction = await this.generateRiskPrediction('asset', asset_id, riskScore);
        assetRisk.aiInsights = {
          predictedRisk: prediction.predictions[0]?.predictedScore,
          confidenceScore: prediction.predictions[0]?.confidenceLevel
        };
        await assetRisk.save();
      }
      
      res.json({
        success: true,
        data: {
          assetId: asset_id,
          riskScore: riskScore,
          riskLevel: this.getRiskLevel(riskScore),
          details: assetRisk
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getAssetRisks(req, res) {
    try {
      const { asset_type, risk_level, department, page = 1, limit = 20, sort = '-riskScore.current' } = req.query;
      
      const query = {};
      if (asset_type) query.assetType = asset_type;
      if (risk_level) query.riskLevel = risk_level;
      if (department) query['metadata.department'] = department;
      
      const skip = (page - 1) * limit;
      const assetRisks = await AssetRisk.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await AssetRisk.countDocuments(query);
      
      res.json({
        success: true,
        data: assetRisks,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getAssetRiskById(req, res) {
    try {
      const assetRisk = await AssetRisk.findOne({ assetId: req.params.id });
      if (!assetRisk) {
        return res.status(404).json({ success: false, error: 'Asset risk not found' });
      }
      res.json({ success: true, data: assetRisk });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== USER RISK MANAGEMENT ====================
  
  async calculateUserRisk(req, res) {
    try {
      const { user_id, user_data, time_period } = req.body;
      
      const riskScore = this.computeUserRiskScore(user_data, time_period || 'last_30_days');
      
      let userRisk = await UserRisk.findOne({ userId: user_id });
      
      if (userRisk) {
        await userRisk.updateRiskScore(riskScore);
      } else {
        userRisk = new UserRisk({
          userId: user_id,
          userName: user_data.name || user_id,
          email: user_data.email || `${user_id}@example.com`,
          riskScore: { current: riskScore },
          riskLevel: this.getRiskLevel(riskScore),
          profile: {
            role: user_data.role || 'user',
            department: user_data.department || 'unknown',
            employeeType: user_data.employee_type || 'full_time'
          },
          accessProfile: {
            accessLevel: user_data.access_level || 'basic',
            privilegedAccess: user_data.privileged_access || false,
            sensitiveDataAccess: user_data.data_access || []
          },
          behaviorMetrics: {
            failedLogins: user_data.failed_logins || 0,
            suspiciousActivities: user_data.recent_activities?.filter(a => a.suspicious).length || 0,
            policyViolations: user_data.policy_violations?.length || 0
          },
          riskFactors: this.extractUserRiskFactors(user_data)
        });
        await userRisk.save();
      }
      
      res.json({
        success: true,
        data: {
          userId: user_id,
          riskScore: riskScore,
          riskLevel: this.getRiskLevel(riskScore),
          details: userRisk
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getUserRisks(req, res) {
    try {
      const { department, risk_level, access_level, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (department) query['profile.department'] = department;
      if (risk_level) query.riskLevel = risk_level;
      if (access_level) query['accessProfile.accessLevel'] = access_level;
      
      const skip = (page - 1) * limit;
      const userRisks = await UserRisk.find(query)
        .sort({ 'riskScore.current': -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await UserRisk.countDocuments(query);
      
      res.json({
        success: true,
        data: userRisks,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getUserRiskById(req, res) {
    try {
      const userRisk = await UserRisk.findOne({ userId: req.params.id });
      if (!userRisk) {
        return res.status(404).json({ success: false, error: 'User risk not found' });
      }
      res.json({ success: true, data: userRisk });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== THREAT RISK ASSESSMENT ====================
  
  async assessThreatRisk(req, res) {
    try {
      const { threat_id, threat_data, context } = req.body;
      
      const riskScore = this.computeThreatRiskScore(threat_data, context);
      
      const threatRisk = new ThreatRisk({
        threatId: threat_id,
        threatName: threat_data.name || threat_id,
        threatType: threat_data.threat_type,
        riskScore: { current: riskScore, initial: riskScore },
        riskLevel: this.getRiskLevel(riskScore),
        severity: {
          rating: threat_data.severity,
          business_impact: threat_data.business_impact || 'medium'
        },
        exploitability: {
          ease: threat_data.exploitability || 'medium',
          skillRequired: threat_data.skill_required || 'intermediate',
          activelyExploited: threat_data.actively_exploited || false
        },
        attackVector: {
          vector: threat_data.attack_vector,
          complexity: threat_data.complexity || 'medium'
        },
        scope: {
          affectedAssets: threat_data.affected_assets || [],
          affectedUsers: threat_data.affected_users || []
        },
        mitreAttack: {
          tactics: threat_data.mitre_tactics || [],
          techniques: threat_data.mitre_techniques || []
        },
        timeline: {
          firstDetected: new Date(),
          isActive: threat_data.active !== false
        },
        riskFactors: this.extractThreatRiskFactors(threat_data)
      });
      
      await threatRisk.save();
      
      res.json({
        success: true,
        data: {
          threatId: threat_id,
          riskScore: riskScore,
          riskLevel: this.getRiskLevel(riskScore),
          details: threatRisk
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getThreatRisks(req, res) {
    try {
      const { threat_type, risk_level, active_only, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (threat_type) query.threatType = threat_type;
      if (risk_level) query.riskLevel = risk_level;
      if (active_only === 'true') query['timeline.isActive'] = true;
      
      const skip = (page - 1) * limit;
      const threatRisks = await ThreatRisk.find(query)
        .sort({ 'riskScore.current': -1, 'timeline.firstDetected': -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await ThreatRisk.countDocuments(query);
      
      res.json({
        success: true,
        data: threatRisks,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== VENDOR RISK ASSESSMENT ====================
  
  async calculateVendorRisk(req, res) {
    try {
      const { vendor_name, vendor_data, assessment_type } = req.body;
      
      const riskScore = this.computeVendorRiskScore(vendor_data);
      
      const vendorId = vendor_name.toLowerCase().replace(/\s+/g, '_');
      
      let vendorRisk = await VendorRisk.findOne({ vendorId });
      
      if (vendorRisk) {
        await vendorRisk.updateRiskScore(riskScore);
        vendorRisk.assessmentHistory.push({
          date: new Date(),
          score: riskScore,
          assessmentType: assessment_type || 'annual_review'
        });
      } else {
        vendorRisk = new VendorRisk({
          vendorId,
          vendorName: vendor_name,
          riskScore: { current: riskScore },
          riskLevel: this.getRiskLevel(riskScore),
          relationship: {
            accessLevel: vendor_data.access_level || 'limited',
            dataShared: vendor_data.data_shared || [],
            contractValue: vendor_data.contract_value,
            dependencyLevel: vendor_data.dependency_level || 'medium'
          },
          securityPosture: {
            certifications: vendor_data.security_certifications || [],
            securityQuestionnaire: {
              completed: !!vendor_data.security_questionnaire,
              score: vendor_data.security_questionnaire?.score
            }
          },
          incidentHistory: {
            totalBreaches: vendor_data.recent_breaches || 0
          },
          compliance: {
            required: vendor_data.compliance_required || [],
            status: vendor_data.compliance_status || {}
          },
          riskFactors: this.extractVendorRiskFactors(vendor_data),
          assessmentHistory: [{
            date: new Date(),
            score: riskScore,
            assessmentType: assessment_type || 'initial'
          }]
        });
      }
      
      await vendorRisk.save();
      
      res.json({
        success: true,
        data: {
          vendorId,
          vendorName: vendor_name,
          riskScore: riskScore,
          riskLevel: this.getRiskLevel(riskScore),
          details: vendorRisk
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getVendorRisks(req, res) {
    try {
      const { risk_level, dependency_level, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (risk_level) query.riskLevel = risk_level;
      if (dependency_level) query['relationship.dependencyLevel'] = dependency_level;
      
      const skip = (page - 1) * limit;
      const vendorRisks = await VendorRisk.find(query)
        .sort({ 'riskScore.current': -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await VendorRisk.countDocuments(query);
      
      res.json({
        success: true,
        data: vendorRisks,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== RISK HEATMAP ====================
  
  async generateRiskHeatmap(req, res) {
    try {
      const { scope, scope_id, risk_categories, time_period, grouping } = req.body;
      
      const heatmapData = {
        scope,
        scope_id,
        timestamp: new Date(),
        categories: {}
      };
      
      // Gather data for each requested category
      const categories = risk_categories || ['assets', 'users', 'threats', 'vulnerabilities', 'vendors'];
      
      for (const category of categories) {
        switch (category) {
          case 'assets':
            const assetStats = await this.getAssetHeatmapData(scope, scope_id, grouping);
            heatmapData.categories.assets = assetStats;
            break;
          case 'users':
            const userStats = await this.getUserHeatmapData(scope, scope_id, grouping);
            heatmapData.categories.users = userStats;
            break;
          case 'threats':
            const threatStats = await this.getThreatHeatmapData(scope, scope_id, grouping);
            heatmapData.categories.threats = threatStats;
            break;
          case 'vendors':
            const vendorStats = await this.getVendorHeatmapData(scope, scope_id, grouping);
            heatmapData.categories.vendors = vendorStats;
            break;
        }
      }
      
      // Calculate overall organization risk score
      heatmapData.overallScore = this.calculateOverallRiskScore(heatmapData.categories);
      heatmapData.riskDistribution = this.calculateRiskDistribution(heatmapData.categories);
      
      res.json({
        success: true,
        data: heatmapData
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== RISK PREDICTIONS ====================
  
  async predictRiskTrajectory(req, res) {
    try {
      const { entity_type, entity_id, prediction_horizon, include_scenarios, confidence_threshold } = req.body;
      
      // Get current risk score
      let currentScore;
      let entityName;
      
      switch (entity_type) {
        case 'asset':
          const asset = await AssetRisk.findOne({ assetId: entity_id });
          if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
          currentScore = asset.riskScore.current;
          entityName = asset.assetName;
          break;
        case 'user':
          const user = await UserRisk.findOne({ userId: entity_id });
          if (!user) return res.status(404).json({ success: false, error: 'User not found' });
          currentScore = user.riskScore.current;
          entityName = user.userName;
          break;
        case 'vendor':
          const vendor = await VendorRisk.findOne({ vendorId: entity_id });
          if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
          currentScore = vendor.riskScore.current;
          entityName = vendor.vendorName;
          break;
        default:
          return res.status(400).json({ success: false, error: 'Invalid entity type' });
      }
      
      const prediction = await this.generateRiskPrediction(entity_type, entity_id, currentScore, prediction_horizon, include_scenarios);
      
      res.json({
        success: true,
        data: {
          entityType: entity_type,
          entityId: entity_id,
          entityName: entityName,
          currentRiskScore: currentScore,
          prediction: prediction
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async generateRiskPrediction(entityType, entityId, currentScore, horizon = '30_days', includeScenarios = false) {
    const predictionId = uuidv4();
    
    // Simple ML prediction (in production, use actual ML models)
    const daysAhead = parseInt(horizon.split('_')[0]);
    const randomVariance = (Math.random() - 0.5) * 10;
    const trend = currentScore > 50 ? -2 : 2; // Assume high risk improves, low risk degrades
    const predictedScore = Math.max(0, Math.min(100, currentScore + (trend * (daysAhead / 30)) + randomVariance));
    
    const prediction = new RiskPrediction({
      predictionId,
      entityType,
      entityId,
      currentRiskScore: currentScore,
      predictions: [{
        timeframe: horizon,
        predictedScore: Math.round(predictedScore),
        confidenceLevel: 75 + Math.random() * 15,
        factors: [
          { factor: 'Historical Trend', impact: trend > 0 ? 'negative' : 'positive', magnitude: Math.abs(trend) },
          { factor: 'Current State', impact: currentScore > 60 ? 'negative' : 'positive', magnitude: 5 }
        ]
      }],
      trajectory: {
        direction: predictedScore > currentScore ? 'deteriorating' : predictedScore < currentScore ? 'improving' : 'stable',
        velocity: (predictedScore - currentScore) / daysAhead
      },
      validUntil: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
    });
    
    if (includeScenarios) {
      prediction.scenarios = [
        {
          scenarioName: 'Best Case',
          description: 'All recommended actions implemented',
          predictedScore: Math.max(0, predictedScore - 20),
          probability: 30,
          recommendedActions: ['Patch vulnerabilities', 'Implement controls', 'Train users']
        },
        {
          scenarioName: 'Worst Case',
          description: 'No action taken, new threats emerge',
          predictedScore: Math.min(100, predictedScore + 15),
          probability: 20,
          recommendedActions: ['Immediate remediation required']
        }
      ];
    }
    
    await prediction.save();
    return prediction;
  }
  
  // ==================== RISK AGGREGATION ====================
  
  async aggregateRiskScore(req, res) {
    try {
      const { aggregation_level, aggregation_id, risk_components, weighting, include_breakdown } = req.body;
      
      const query = {};
      if (aggregation_id) {
        query['metadata.department'] = aggregation_id; // Assuming dept-level aggregation
      }
      
      const components = risk_components || ['asset_risk', 'user_risk', 'threat_risk', 'vendor_risk'];
      const weights = weighting || { asset_risk: 0.3, user_risk: 0.2, threat_risk: 0.3, vendor_risk: 0.2 };
      
      let aggregatedScore = 0;
      const breakdown = {};
      
      // Calculate weighted average from each component
      if (components.includes('asset_risk')) {
        const assets = await AssetRisk.find(query);
        const avgAssetRisk = assets.length > 0 
          ? assets.reduce((sum, a) => sum + a.riskScore.current, 0) / assets.length 
          : 0;
        aggregatedScore += avgAssetRisk * (weights.asset_risk || 0.3);
        breakdown.asset_risk = { average: Math.round(avgAssetRisk), count: assets.length };
      }
      
      if (components.includes('user_risk')) {
        const users = await UserRisk.find(query);
        const avgUserRisk = users.length > 0 
          ? users.reduce((sum, u) => sum + u.riskScore.current, 0) / users.length 
          : 0;
        aggregatedScore += avgUserRisk * (weights.user_risk || 0.2);
        breakdown.user_risk = { average: Math.round(avgUserRisk), count: users.length };
      }
      
      if (components.includes('threat_risk')) {
        const threats = await ThreatRisk.find({ 'timeline.isActive': true });
        const avgThreatRisk = threats.length > 0 
          ? threats.reduce((sum, t) => sum + t.riskScore.current, 0) / threats.length 
          : 0;
        aggregatedScore += avgThreatRisk * (weights.threat_risk || 0.3);
        breakdown.threat_risk = { average: Math.round(avgThreatRisk), count: threats.length };
      }
      
      if (components.includes('vendor_risk')) {
        const vendors = await VendorRisk.find({});
        const avgVendorRisk = vendors.length > 0 
          ? vendors.reduce((sum, v) => sum + v.riskScore.current, 0) / vendors.length 
          : 0;
        aggregatedScore += avgVendorRisk * (weights.vendor_risk || 0.2);
        breakdown.vendor_risk = { average: Math.round(avgVendorRisk), count: vendors.length };
      }
      
      res.json({
        success: true,
        data: {
          aggregation_level,
          aggregation_id,
          aggregatedScore: Math.round(aggregatedScore),
          riskLevel: this.getRiskLevel(aggregatedScore),
          components: components,
          breakdown: include_breakdown ? breakdown : undefined,
          timestamp: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== DASHBOARD & ANALYTICS ====================
  
  async getDashboardStats(req, res) {
    try {
      const [
        totalAssets,
        criticalAssets,
        totalUsers,
        highRiskUsers,
        activeThreats,
        totalVendors,
        highRiskVendors
      ] = await Promise.all([
        AssetRisk.countDocuments(),
        AssetRisk.countDocuments({ riskLevel: 'critical' }),
        UserRisk.countDocuments(),
        UserRisk.countDocuments({ riskLevel: { $in: ['high', 'critical'] } }),
        ThreatRisk.countDocuments({ 'timeline.isActive': true }),
        VendorRisk.countDocuments(),
        VendorRisk.countDocuments({ riskLevel: { $in: ['high', 'critical'] } })
      ]);
      
      // Calculate average risk scores
      const assetAvg = await AssetRisk.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$riskScore.current' } } }
      ]);
      
      const userAvg = await UserRisk.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$riskScore.current' } } }
      ]);
      
      res.json({
        success: true,
        data: {
          assets: { 
            total: totalAssets, 
            critical: criticalAssets,
            averageRisk: Math.round(assetAvg[0]?.avgScore || 0)
          },
          users: { 
            total: totalUsers, 
            highRisk: highRiskUsers,
            averageRisk: Math.round(userAvg[0]?.avgScore || 0)
          },
          threats: { 
            active: activeThreats 
          },
          vendors: { 
            total: totalVendors, 
            highRisk: highRiskVendors 
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  computeAssetRiskScore(assetData, model) {
    // Simplified risk calculation
    let score = 0;
    
    // Criticality factor (0-25 points)
    const criticalityMap = { low: 5, medium: 12, high: 18, critical: 25 };
    score += criticalityMap[assetData.criticality] || 12;
    
    // Vulnerability factor (0-30 points)
    const vulnCount = assetData.vulnerabilities?.length || 0;
    score += Math.min(30, vulnCount * 3);
    
    // Exposure factor (0-25 points)
    const exposureMap = { internal: 5, dmz: 15, internet_facing: 25 };
    score += exposureMap[assetData.exposure] || 5;
    
    // Control effectiveness (subtract 0-20 points)
    const controlCount = assetData.controls?.length || 0;
    score -= Math.min(20, controlCount * 2);
    
    return Math.max(0, Math.min(100, score));
  }
  
  computeUserRiskScore(userData, timePeriod) {
    let score = 0;
    
    // Access level (0-20 points)
    const accessMap = { basic: 5, elevated: 10, administrative: 15, super_admin: 20 };
    score += accessMap[userData.access_level] || 5;
    
    // Failed logins (0-25 points)
    score += Math.min(25, (userData.failed_logins || 0) * 2);
    
    // Policy violations (0-30 points)
    score += Math.min(30, (userData.policy_violations?.length || 0) * 5);
    
    // Suspicious activities (0-25 points)
    const suspiciousCount = userData.recent_activities?.filter(a => a.suspicious).length || 0;
    score += Math.min(25, suspiciousCount * 5);
    
    return Math.max(0, Math.min(100, score));
  }
  
  computeThreatRiskScore(threatData, context) {
    let score = 0;
    
    // Severity (0-35 points)
    const severityMap = { low: 10, medium: 20, high: 30, critical: 35 };
    score += severityMap[threatData.severity] || 20;
    
    // Exploitability (0-30 points)
    const exploitMap = { low: 10, medium: 20, high: 30 };
    score += exploitMap[threatData.exploitability] || 20;
    
    // Scope (0-20 points)
    const affectedCount = (threatData.affected_assets?.length || 0) + (threatData.affected_users?.length || 0);
    score += Math.min(20, affectedCount * 2);
    
    // Active exploitation bonus (+15 points)
    if (threatData.active) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }
  
  computeVendorRiskScore(vendorData) {
    let score = 0;
    
    // Access level (0-25 points)
    const accessMap = { none: 0, limited: 8, moderate: 15, extensive: 25 };
    score += accessMap[vendorData.access_level] || 8;
    
    // Dependency (0-25 points)
    const depMap = { low: 5, medium: 12, high: 18, critical: 25 };
    score += depMap[vendorData.dependency_level] || 12;
    
    // Breach history (0-30 points)
    score += Math.min(30, (vendorData.recent_breaches || 0) * 10);
    
    // Security certifications (subtract 0-20 points)
    const certCount = vendorData.security_certifications?.length || 0;
    score -= Math.min(20, certCount * 5);
    
    return Math.max(0, Math.min(100, score));
  }
  
  getRiskLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
  
  extractAssetRiskFactors(data) {
    const factors = [];
    if (data.criticality) factors.push({ factor: 'Business Criticality', value: data.criticality, weight: 0.25, severity: data.criticality });
    if (data.exposure) factors.push({ factor: 'Network Exposure', value: data.exposure, weight: 0.25, severity: data.exposure === 'internet_facing' ? 'high' : 'low' });
    if (data.vulnerabilities) factors.push({ factor: 'Vulnerabilities', value: data.vulnerabilities.length, weight: 0.30, severity: data.vulnerabilities.length > 5 ? 'high' : 'medium' });
    return factors;
  }
  
  extractUserRiskFactors(data) {
    const factors = [];
    if (data.access_level) factors.push({ factor: 'Access Level', value: data.access_level, weight: 0.20 });
    if (data.failed_logins) factors.push({ factor: 'Failed Logins', value: data.failed_logins, weight: 0.25 });
    if (data.policy_violations) factors.push({ factor: 'Policy Violations', value: data.policy_violations.length, weight: 0.30 });
    return factors;
  }
  
  extractThreatRiskFactors(data) {
    const factors = [];
    factors.push({ factor: 'Severity', value: data.severity, weight: 0.35 });
    factors.push({ factor: 'Exploitability', value: data.exploitability, weight: 0.30 });
    if (data.affected_assets) factors.push({ factor: 'Affected Assets', value: data.affected_assets.length, weight: 0.20 });
    return factors;
  }
  
  extractVendorRiskFactors(data) {
    const factors = [];
    factors.push({ factor: 'Access Level', value: data.access_level, weight: 0.25 });
    factors.push({ factor: 'Dependency', value: data.dependency_level, weight: 0.25 });
    if (data.recent_breaches) factors.push({ factor: 'Breach History', value: data.recent_breaches, weight: 0.30 });
    return factors;
  }
  
  async getAssetHeatmapData(scope, scopeId, grouping) {
    const query = scopeId ? { 'metadata.department': scopeId } : {};
    const assets = await AssetRisk.find(query);
    
    return {
      total: assets.length,
      critical: assets.filter(a => a.riskLevel === 'critical').length,
      high: assets.filter(a => a.riskLevel === 'high').length,
      medium: assets.filter(a => a.riskLevel === 'medium').length,
      low: assets.filter(a => a.riskLevel === 'low').length,
      averageScore: assets.length > 0 ? Math.round(assets.reduce((sum, a) => sum + a.riskScore.current, 0) / assets.length) : 0
    };
  }
  
  async getUserHeatmapData(scope, scopeId, grouping) {
    const query = scopeId ? { 'profile.department': scopeId } : {};
    const users = await UserRisk.find(query);
    
    return {
      total: users.length,
      critical: users.filter(u => u.riskLevel === 'critical').length,
      high: users.filter(u => u.riskLevel === 'high').length,
      medium: users.filter(u => u.riskLevel === 'medium').length,
      low: users.filter(u => u.riskLevel === 'low').length,
      averageScore: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.riskScore.current, 0) / users.length) : 0
    };
  }
  
  async getThreatHeatmapData(scope, scopeId, grouping) {
    const threats = await ThreatRisk.find({ 'timeline.isActive': true });
    
    return {
      total: threats.length,
      critical: threats.filter(t => t.riskLevel === 'critical').length,
      high: threats.filter(t => t.riskLevel === 'high').length,
      medium: threats.filter(t => t.riskLevel === 'medium').length,
      low: threats.filter(t => t.riskLevel === 'low').length,
      averageScore: threats.length > 0 ? Math.round(threats.reduce((sum, t) => sum + t.riskScore.current, 0) / threats.length) : 0
    };
  }
  
  async getVendorHeatmapData(scope, scopeId, grouping) {
    const vendors = await VendorRisk.find({});
    
    return {
      total: vendors.length,
      critical: vendors.filter(v => v.riskLevel === 'critical').length,
      high: vendors.filter(v => v.riskLevel === 'high').length,
      medium: vendors.filter(v => v.riskLevel === 'medium').length,
      low: vendors.filter(v => v.riskLevel === 'low').length,
      averageScore: vendors.length > 0 ? Math.round(vendors.reduce((sum, v) => sum + v.riskScore.current, 0) / vendors.length) : 0
    };
  }
  
  calculateOverallRiskScore(categories) {
    const scores = [];
    if (categories.assets) scores.push(categories.assets.averageScore);
    if (categories.users) scores.push(categories.users.averageScore);
    if (categories.threats) scores.push(categories.threats.averageScore);
    if (categories.vendors) scores.push(categories.vendors.averageScore);
    
    return scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
  }
  
  calculateRiskDistribution(categories) {
    let total = 0, critical = 0, high = 0, medium = 0, low = 0;
    
    Object.values(categories).forEach(cat => {
      total += cat.total || 0;
      critical += cat.critical || 0;
      high += cat.high || 0;
      medium += cat.medium || 0;
      low += cat.low || 0;
    });
    
    return {
      critical: { count: critical, percentage: total > 0 ? Math.round((critical / total) * 100) : 0 },
      high: { count: high, percentage: total > 0 ? Math.round((high / total) * 100) : 0 },
      medium: { count: medium, percentage: total > 0 ? Math.round((medium / total) * 100) : 0 },
      low: { count: low, percentage: total > 0 ? Math.round((low / total) * 100) : 0 }
    };
  }
}

module.exports = new RiskScoreController();
