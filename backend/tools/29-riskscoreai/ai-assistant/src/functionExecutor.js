const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4029';

class FunctionExecutor {
  
  async execute(functionName, parameters) {
    console.log(`⚙️  Executing function: ${functionName}`);
    
    switch (functionName) {
      case 'calculate_asset_risk':
        return await this.calculateAssetRisk(parameters);
      case 'calculate_user_risk':
        return await this.calculateUserRisk(parameters);
      case 'assess_threat_risk':
        return await this.assessThreatRisk(parameters);
      case 'score_vulnerability':
        return await this.scoreVulnerability(parameters);
      case 'calculate_vendor_risk':
        return await this.calculateVendorRisk(parameters);
      case 'generate_risk_heatmap':
        return await this.generateRiskHeatmap(parameters);
      case 'predict_risk_trajectory':
        return await this.predictRiskTrajectory(parameters);
      case 'aggregate_risk_score':
        return await this.aggregateRiskScore(parameters);
      case 'analyze_risk_trends':
        return await this.analyzeRiskTrends(parameters);
      case 'create_custom_risk_model':
        return await this.createCustomRiskModel(parameters);
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }
  
  // ==================== RISK CALCULATION FUNCTIONS ====================
  
  async calculateAssetRisk(params) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/risk/assets/calculate`, {
        asset_id: params.asset_id,
        asset_type: params.asset_type || 'server',
        asset_data: {
          name: params.asset_name,
          criticality: params.business_criticality || 'medium',
          data_classification: params.data_classification || 'internal',
          vulnerabilities: params.vulnerabilities || [],
          last_patched: params.last_patched,
          exposure: params.network_exposure || 'internal',
          controls: params.security_controls || []
        },
        include_predictions: params.include_predictions || false,
        risk_model: params.risk_model || 'nist'
      });
      
      return {
        success: true,
        asset_id: response.data.data.assetId,
        risk_score: response.data.data.riskScore,
        risk_level: response.data.data.riskLevel,
        details: response.data.data.details,
        summary: `Asset "${params.asset_name || params.asset_id}" has a risk score of ${response.data.data.riskScore}/100 (${response.data.data.riskLevel} risk).`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to calculate asset risk: ${error.message}`
      };
    }
  }
  
  async calculateUserRisk(params) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/risk/users/calculate`, {
        user_id: params.user_id,
        user_data: {
          name: params.user_name,
          email: params.email,
          role: params.role,
          department: params.department,
          employee_type: params.employee_type || 'full_time',
          access_level: params.access_level || 'basic',
          privileged_access: params.privileged_access || false,
          data_access: params.data_access || [],
          failed_logins: params.failed_logins || 0,
          policy_violations: params.policy_violations || [],
          recent_activities: params.recent_activities || []
        },
        time_period: params.time_period || 'last_30_days'
      });
      
      return {
        success: true,
        user_id: response.data.data.userId,
        risk_score: response.data.data.riskScore,
        risk_level: response.data.data.riskLevel,
        details: response.data.data.details,
        summary: `User "${params.user_name || params.user_id}" has a risk score of ${response.data.data.riskScore}/100 (${response.data.data.riskLevel} risk).`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to calculate user risk: ${error.message}`
      };
    }
  }
  
  async assessThreatRisk(params) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/risk/threats/assess`, {
        threat_id: params.threat_id,
        threat_data: {
          name: params.threat_name,
          threat_type: params.threat_type,
          severity: params.severity || 'medium',
          business_impact: params.business_impact || 'medium',
          exploitability: params.exploitability || 'medium',
          skill_required: params.skill_required || 'intermediate',
          actively_exploited: params.actively_exploited || false,
          attack_vector: params.attack_vector,
          complexity: params.complexity || 'medium',
          affected_assets: params.affected_assets || [],
          affected_users: params.affected_users || [],
          mitre_tactics: params.mitre_tactics || [],
          mitre_techniques: params.mitre_techniques || [],
          active: params.active !== false
        },
        context: params.context || {}
      });
      
      return {
        success: true,
        threat_id: response.data.data.threatId,
        risk_score: response.data.data.riskScore,
        risk_level: response.data.data.riskLevel,
        details: response.data.data.details,
        summary: `Threat "${params.threat_name || params.threat_id}" assessed with risk score ${response.data.data.riskScore}/100 (${response.data.data.riskLevel} risk).`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to assess threat risk: ${error.message}`
      };
    }
  }
  
  async scoreVulnerability(params) {
    // Calculate CVSS-based vulnerability score
    try {
      const baseScore = this.calculateCVSSScore(params);
      const riskScore = this.convertCVSSToRiskScore(baseScore, params);
      
      return {
        success: true,
        vulnerability_id: params.cve_id || params.vulnerability_id,
        cvss_score: baseScore,
        risk_score: riskScore,
        risk_level: this.getRiskLevel(riskScore),
        severity: params.severity || this.getCVSSSeverity(baseScore),
        exploitability: params.exploitability || 'unknown',
        patch_available: params.patch_available || false,
        summary: `Vulnerability ${params.cve_id || params.vulnerability_id} scored ${riskScore}/100 (${this.getRiskLevel(riskScore)} risk) with CVSS ${baseScore.toFixed(1)}.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to score vulnerability: ${error.message}`
      };
    }
  }
  
  async calculateVendorRisk(params) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/risk/vendors/calculate`, {
        vendor_name: params.vendor_name,
        vendor_data: {
          access_level: params.access_level || 'limited',
          data_shared: params.data_shared || [],
          contract_value: params.contract_value,
          dependency_level: params.dependency_level || 'medium',
          security_certifications: params.security_certifications || [],
          security_questionnaire: params.security_questionnaire,
          recent_breaches: params.recent_breaches || 0,
          compliance_required: params.compliance_required || [],
          compliance_status: params.compliance_status || {}
        },
        assessment_type: params.assessment_type || 'standard'
      });
      
      return {
        success: true,
        vendor_name: response.data.data.vendorName,
        risk_score: response.data.data.riskScore,
        risk_level: response.data.data.riskLevel,
        details: response.data.data.details,
        summary: `Vendor "${params.vendor_name}" assessed with risk score ${response.data.data.riskScore}/100 (${response.data.data.riskLevel} risk).`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to calculate vendor risk: ${error.message}`
      };
    }
  }
  
  async generateRiskHeatmap(params) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/risk/heatmap`, {
        scope: params.scope || 'organization',
        scope_id: params.scope_id,
        risk_categories: params.risk_categories || ['assets', 'users', 'threats', 'vendors'],
        time_period: params.time_period || 'current',
        grouping: params.grouping || 'department'
      });
      
      const heatmap = response.data.data;
      
      return {
        success: true,
        overall_score: heatmap.overallScore,
        risk_distribution: heatmap.riskDistribution,
        categories: heatmap.categories,
        summary: `Risk heatmap generated: Overall score ${heatmap.overallScore}/100. Distribution: ${heatmap.riskDistribution.critical.percentage}% critical, ${heatmap.riskDistribution.high.percentage}% high, ${heatmap.riskDistribution.medium.percentage}% medium, ${heatmap.riskDistribution.low.percentage}% low.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to generate risk heatmap: ${error.message}`
      };
    }
  }
  
  async predictRiskTrajectory(params) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/risk/predictions/trajectory`, {
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        prediction_horizon: params.prediction_horizon || '30_days',
        include_scenarios: params.include_scenarios || false,
        confidence_threshold: params.confidence_threshold || 70
      });
      
      const prediction = response.data.data.prediction;
      
      return {
        success: true,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        current_score: response.data.data.currentRiskScore,
        predicted_score: prediction.predictions[0].predictedScore,
        confidence: prediction.predictions[0].confidenceLevel,
        trajectory: prediction.trajectory,
        summary: `Risk trajectory for ${params.entity_type} "${params.entity_id}": Current ${response.data.data.currentRiskScore} → Predicted ${prediction.predictions[0].predictedScore} (${prediction.trajectory.direction}, confidence ${prediction.predictions[0].confidenceLevel.toFixed(1)}%).`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to predict risk trajectory: ${error.message}`
      };
    }
  }
  
  async aggregateRiskScore(params) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/risk/aggregate`, {
        aggregation_level: params.aggregation_level || 'organization',
        aggregation_id: params.aggregation_id,
        risk_components: params.risk_components || ['asset_risk', 'user_risk', 'threat_risk', 'vendor_risk'],
        weighting: params.weighting || { asset_risk: 0.3, user_risk: 0.2, threat_risk: 0.3, vendor_risk: 0.2 },
        include_breakdown: params.include_breakdown || true
      });
      
      const data = response.data.data;
      
      return {
        success: true,
        aggregated_score: data.aggregatedScore,
        risk_level: data.riskLevel,
        breakdown: data.breakdown,
        summary: `Aggregated risk score for ${params.aggregation_level}: ${data.aggregatedScore}/100 (${data.riskLevel} risk).`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to aggregate risk score: ${error.message}`
      };
    }
  }
  
  async analyzeRiskTrends(params) {
    try {
      // Fetch current data for trend analysis
      const [assetResponse, userResponse, threatResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/risk/assets?page=1&limit=100`),
        axios.get(`${API_BASE_URL}/api/v1/risk/users?page=1&limit=100`),
        axios.get(`${API_BASE_URL}/api/v1/risk/threats?active_only=true&page=1&limit=100`)
      ]);
      
      const assets = assetResponse.data.data;
      const users = userResponse.data.data;
      const threats = threatResponse.data.data;
      
      // Calculate trends
      const assetTrend = this.calculateTrend(assets);
      const userTrend = this.calculateTrend(users);
      const threatTrend = this.calculateTrend(threats);
      
      return {
        success: true,
        time_period: params.time_period || 'last_30_days',
        trends: {
          assets: assetTrend,
          users: userTrend,
          threats: threatTrend
        },
        summary: `Risk trends over ${params.time_period || 'last 30 days'}: Assets ${assetTrend.direction} (${assetTrend.change_percent}%), Users ${userTrend.direction} (${userTrend.change_percent}%), Threats ${threatTrend.direction} (${threatTrend.change_percent}%).`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to analyze risk trends: ${error.message}`
      };
    }
  }
  
  async createCustomRiskModel(params) {
    try {
      // Create a custom risk model with user-defined factors and weights
      const model = {
        model_id: `custom_${Date.now()}`,
        model_name: params.model_name || 'Custom Risk Model',
        description: params.description || 'User-defined risk model',
        factors: params.factors || [],
        weights: params.weights || {},
        thresholds: params.thresholds || {
          low: 40,
          medium: 60,
          high: 80
        },
        created_at: new Date().toISOString()
      };
      
      // Validate weights sum to 1.0
      const totalWeight = Object.values(model.weights).reduce((sum, w) => sum + w, 0);
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        return {
          success: false,
          error: 'Weights must sum to 1.0',
          summary: `Invalid weights: total = ${totalWeight.toFixed(2)} (must be 1.0)`
        };
      }
      
      return {
        success: true,
        model: model,
        summary: `Custom risk model "${model.model_name}" created with ${Object.keys(model.weights).length} weighted factors.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: `Failed to create custom risk model: ${error.message}`
      };
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  calculateCVSSScore(params) {
    // Simplified CVSS v3.1 calculation
    const attackVector = params.attack_vector || 'network';
    const attackComplexity = params.attack_complexity || 'low';
    const confidentialityImpact = params.confidentiality_impact || 'high';
    const integrityImpact = params.integrity_impact || 'high';
    const availabilityImpact = params.availability_impact || 'high';
    
    // Base score estimation (simplified)
    let baseScore = 5.0;
    
    if (attackVector === 'network') baseScore += 1.5;
    if (attackComplexity === 'low') baseScore += 1.5;
    if (confidentialityImpact === 'high') baseScore += 1.0;
    if (integrityImpact === 'high') baseScore += 1.0;
    if (availabilityImpact === 'high') baseScore += 1.0;
    
    return Math.min(10.0, baseScore);
  }
  
  convertCVSSToRiskScore(cvssScore, params) {
    // Convert CVSS (0-10) to Risk Score (0-100)
    let riskScore = cvssScore * 10;
    
    // Adjust for exploitability
    if (params.exploitability === 'active' || params.actively_exploited) {
      riskScore += 10;
    }
    
    // Adjust for patch availability
    if (!params.patch_available) {
      riskScore += 5;
    }
    
    // Adjust for asset criticality
    if (params.asset_criticality === 'critical') {
      riskScore += 10;
    }
    
    return Math.min(100, Math.max(0, Math.round(riskScore)));
  }
  
  getCVSSSeverity(cvssScore) {
    if (cvssScore >= 9.0) return 'critical';
    if (cvssScore >= 7.0) return 'high';
    if (cvssScore >= 4.0) return 'medium';
    return 'low';
  }
  
  getRiskLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
  
  calculateTrend(entities) {
    if (!entities || entities.length === 0) {
      return { direction: 'stable', change_percent: 0, average_score: 0 };
    }
    
    const scores = entities.map(e => e.riskScore?.current || 0);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    
    // Calculate trend from previous scores
    const trendsUp = entities.filter(e => {
      const trend = e.riskScore?.trend;
      return trend === 'increasing' || (e.riskScore?.current > e.riskScore?.previous);
    }).length;
    
    const trendsDown = entities.filter(e => {
      const trend = e.riskScore?.trend;
      return trend === 'decreasing' || (e.riskScore?.current < e.riskScore?.previous);
    }).length;
    
    let direction = 'stable';
    if (trendsUp > trendsDown) direction = 'increasing';
    else if (trendsDown > trendsUp) direction = 'decreasing';
    
    const changePercent = Math.round(((trendsUp - trendsDown) / entities.length) * 100);
    
    return {
      direction,
      change_percent: Math.abs(changePercent),
      average_score: Math.round(avgScore),
      total_entities: entities.length
    };
  }
}

module.exports = new FunctionExecutor();
