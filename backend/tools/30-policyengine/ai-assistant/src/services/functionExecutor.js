const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4030/api/v1/policyengine';

class FunctionExecutor {
  
  async execute(functionName, parameters) {
    try {
      console.log(`Executing function: ${functionName}`);
      
      switch (functionName) {
        case 'create_policy':
          return await this.createPolicy(parameters);
        case 'analyze_policy':
          return await this.analyzePolicy(parameters);
        case 'map_policy_to_controls':
          return await this.mapPolicyToControls(parameters);
        case 'check_policy_compliance':
          return await this.checkPolicyCompliance(parameters);
        case 'generate_policy_documentation':
          return await this.generatePolicyDocumentation(parameters);
        case 'manage_policy_exception':
          return await this.managePolicyException(parameters);
        case 'create_policy_as_code':
          return await this.createPolicyAsCode(parameters);
        case 'compare_policies':
          return await this.comparePolicies(parameters);
        case 'assess_policy_effectiveness':
          return await this.assessPolicyEffectiveness(parameters);
        case 'recommend_policy_updates':
          return await this.recommendPolicyUpdates(parameters);
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      console.error(`Function execution error (${functionName}):`, error.message);
      return {
        success: false,
        error: error.message,
        function: functionName
      };
    }
  }
  
  async createPolicy(params) {
    const { policy_name, category, content, framework, compliance, applicability, owner } = params;
    
    const response = await axios.post(`${API_BASE}/policies`, {
      policy_name,
      category,
      content: {
        purpose: content.purpose,
        scope: content.scope,
        policy: content.policy,
        procedures: content.procedures || [],
        exceptions: content.exceptions || [],
        enforcement: content.enforcement || {},
        references: content.references || []
      },
      framework: framework || {},
      compliance: compliance || {},
      applicability: applicability || { scope: 'organization' },
      owner
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Policy created successfully'
    };
  }
  
  async analyzePolicy(params) {
    const { policy_id, analysis_type } = params;
    
    // Get policy details
    const policyResponse = await axios.get(`${API_BASE}/policies/${policy_id}`);
    const policy = policyResponse.data.data;
    
    let analysis = {};
    
    if (analysis_type === 'coverage' || analysis_type === 'all') {
      // Analyze framework coverage
      const mappingsResponse = await axios.get(`${API_BASE}/framework/mappings`, {
        params: { policy_id }
      });
      
      analysis.coverage = {
        mappedFrameworks: mappingsResponse.data.data.length,
        frameworks: mappingsResponse.data.data.map(m => ({
          name: m.framework.name,
          version: m.framework.version,
          controlCount: m.mappings.length,
          complianceScore: m.complianceStatus.complianceScore
        }))
      };
    }
    
    if (analysis_type === 'compliance' || analysis_type === 'all') {
      // Get compliance check results
      const checksResponse = await axios.get(`${API_BASE}/compliance/checks`, {
        params: { policy_id, status: 'completed' }
      });
      
      const checks = checksResponse.data.data;
      analysis.compliance = {
        totalChecks: checks.length,
        averageScore: checks.length > 0
          ? Math.round(checks.reduce((sum, c) => sum + (c.result.complianceScore || 0), 0) / checks.length)
          : 0,
        recentChecks: checks.slice(0, 5)
      };
    }
    
    if (analysis_type === 'gaps' || analysis_type === 'all') {
      // Identify gaps
      const mappingsResponse = await axios.get(`${API_BASE}/framework/mappings`, {
        params: { policy_id }
      });
      
      const allGaps = mappingsResponse.data.data.flatMap(m => m.gaps || []);
      analysis.gaps = {
        totalGaps: allGaps.length,
        critical: allGaps.filter(g => g.severity === 'critical').length,
        high: allGaps.filter(g => g.severity === 'high').length,
        medium: allGaps.filter(g => g.severity === 'medium').length,
        gaps: allGaps.slice(0, 10)
      };
    }
    
    return {
      success: true,
      data: {
        policyId: policy_id,
        policyName: policy.policyName,
        analysis
      }
    };
  }
  
  async mapPolicyToControls(params) {
    const { policy_id, framework, mappings } = params;
    
    const response = await axios.post(`${API_BASE}/framework/map`, {
      policy_id,
      framework: {
        name: framework.name,
        version: framework.version,
        category: framework.category || 'security'
      },
      mappings: mappings.map(m => ({
        controlId: m.control_id,
        controlName: m.control_name,
        controlDescription: m.control_description,
        mappingType: m.mapping_type || 'direct',
        coverage: m.coverage || 'full',
        implementation: m.implementation || {},
        evidence: m.evidence || [],
        status: m.status || 'not_implemented'
      }))
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Policy mapped to framework controls'
    };
  }
  
  async checkPolicyCompliance(params) {
    const { policy_id, scope, scope_id, check_type } = params;
    
    const response = await axios.post(`${API_BASE}/compliance/check`, {
      policy_id,
      scope: scope || 'organization',
      scope_id,
      check_type: check_type || 'manual'
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Compliance check initiated'
    };
  }
  
  async generatePolicyDocumentation(params) {
    const { policy_id, doc_type, format } = params;
    
    // Get policy details
    const policyResponse = await axios.get(`${API_BASE}/policies/${policy_id}`);
    const policy = policyResponse.data.data;
    
    let documentation = {};
    
    if (doc_type === 'full' || doc_type === 'policy') {
      documentation.policy = {
        policyNumber: policy.policyNumber,
        policyName: policy.policyName,
        version: policy.version.current,
        effectiveDate: policy.compliance.effectiveDate,
        purpose: policy.content.purpose,
        scope: policy.content.scope,
        policy: policy.content.policy,
        procedures: policy.content.procedures,
        enforcement: policy.content.enforcement,
        references: policy.content.references
      };
    }
    
    if (doc_type === 'full' || doc_type === 'compliance') {
      const checksResponse = await axios.get(`${API_BASE}/compliance/checks`, {
        params: { policy_id }
      });
      
      documentation.compliance = {
        mandates: policy.compliance.mandates,
        requirements: policy.compliance.requirements,
        recentChecks: checksResponse.data.data.slice(0, 5)
      };
    }
    
    if (doc_type === 'full' || doc_type === 'framework') {
      const mappingsResponse = await axios.get(`${API_BASE}/framework/mappings`, {
        params: { policy_id }
      });
      
      documentation.frameworkMappings = mappingsResponse.data.data;
    }
    
    return {
      success: true,
      data: {
        policyId: policy_id,
        documentType: doc_type,
        format: format || 'json',
        documentation
      }
    };
  }
  
  async managePolicyException(params) {
    const { action, exception_data } = params;
    
    if (action === 'create') {
      const response = await axios.post(`${API_BASE}/exceptions`, {
        policy_id: exception_data.policy_id,
        requestor: exception_data.requestor,
        justification: exception_data.justification,
        scope: exception_data.scope,
        duration: exception_data.duration,
        compensating_controls: exception_data.compensating_controls || []
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Exception request created'
      };
    }
    
    if (action === 'approve' || action === 'reject') {
      const response = await axios.post(`${API_BASE}/exceptions/${exception_data.exception_id}/approve`, {
        approver_id: exception_data.approver_id,
        approver_name: exception_data.approver_name,
        approver_role: exception_data.approver_role,
        decision: action === 'approve' ? 'approved' : 'rejected',
        comments: exception_data.comments
      });
      
      return {
        success: true,
        data: response.data,
        message: `Exception ${action}d`
      };
    }
    
    if (action === 'list') {
      const response = await axios.get(`${API_BASE}/exceptions`, {
        params: {
          policy_id: exception_data.policy_id,
          status: exception_data.status
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    }
    
    throw new Error(`Unknown exception action: ${action}`);
  }
  
  async createPolicyAsCode(params) {
    const { policy_id, target_platform, output_format } = params;
    
    // Get policy details
    const policyResponse = await axios.get(`${API_BASE}/policies/${policy_id}`);
    const policy = policyResponse.data.data;
    
    let policyCode = '';
    
    if (target_platform === 'opa') {
      policyCode = this.generateOPAPolicy(policy);
    } else if (target_platform === 'sentinel') {
      policyCode = this.generateSentinelPolicy(policy);
    } else if (target_platform === 'aws_scp') {
      policyCode = this.generateAWSPolicy(policy);
    } else if (target_platform === 'azure_policy') {
      policyCode = this.generateAzurePolicy(policy);
    } else {
      throw new Error(`Unsupported platform: ${target_platform}`);
    }
    
    return {
      success: true,
      data: {
        policyId: policy_id,
        policyName: policy.policyName,
        platform: target_platform,
        format: output_format || 'code',
        code: policyCode
      }
    };
  }
  
  async comparePolicies(params) {
    const { policy_id_1, policy_id_2, comparison_type } = params;
    
    // Get both policies
    const [policy1Response, policy2Response] = await Promise.all([
      axios.get(`${API_BASE}/policies/${policy_id_1}`),
      axios.get(`${API_BASE}/policies/${policy_id_2}`)
    ]);
    
    const policy1 = policy1Response.data.data;
    const policy2 = policy2Response.data.data;
    
    const comparison = {
      policies: {
        policy1: {
          id: policy1.policyId,
          name: policy1.policyName,
          version: policy1.version.current
        },
        policy2: {
          id: policy2.policyId,
          name: policy2.policyName,
          version: policy2.version.current
        }
      },
      differences: []
    };
    
    if (comparison_type === 'content' || comparison_type === 'all') {
      comparison.differences.push({
        field: 'purpose',
        policy1: policy1.content.purpose,
        policy2: policy2.content.purpose,
        match: policy1.content.purpose === policy2.content.purpose
      });
    }
    
    if (comparison_type === 'framework' || comparison_type === 'all') {
      comparison.frameworkComparison = {
        policy1Frameworks: policy1.framework.mappings?.map(m => m.framework) || [],
        policy2Frameworks: policy2.framework.mappings?.map(m => m.framework) || []
      };
    }
    
    return {
      success: true,
      data: comparison
    };
  }
  
  async assessPolicyEffectiveness(params) {
    const { policy_id, assessment_period } = params;
    
    // Get policy
    const policyResponse = await axios.get(`${API_BASE}/policies/${policy_id}`);
    const policy = policyResponse.data.data;
    
    // Get compliance checks
    const checksResponse = await axios.get(`${API_BASE}/compliance/checks`, {
      params: { policy_id, status: 'completed' }
    });
    
    // Get exceptions
    const exceptionsResponse = await axios.get(`${API_BASE}/exceptions`, {
      params: { policy_id }
    });
    
    const checks = checksResponse.data.data;
    const exceptions = exceptionsResponse.data.data;
    
    const assessment = {
      policyId: policy_id,
      policyName: policy.policyName,
      period: assessment_period,
      metrics: {
        complianceRate: policy.metrics.complianceRate,
        totalViolations: policy.metrics.violationCount,
        totalExceptions: policy.metrics.exceptionCount,
        totalChecks: checks.length,
        averageComplianceScore: checks.length > 0
          ? Math.round(checks.reduce((sum, c) => sum + (c.result.complianceScore || 0), 0) / checks.length)
          : 0
      },
      effectiveness: {
        rating: this.calculateEffectivenessRating(policy.metrics),
        strengths: [],
        weaknesses: [],
        recommendations: []
      }
    };
    
    if (assessment.metrics.complianceRate >= 90) {
      assessment.effectiveness.strengths.push('High compliance rate');
    } else {
      assessment.effectiveness.weaknesses.push('Low compliance rate');
      assessment.effectiveness.recommendations.push('Review policy controls and enforcement');
    }
    
    if (assessment.metrics.totalViolations > 10) {
      assessment.effectiveness.weaknesses.push('High violation count');
      assessment.effectiveness.recommendations.push('Strengthen policy enforcement');
    }
    
    return {
      success: true,
      data: assessment
    };
  }
  
  async recommendPolicyUpdates(params) {
    const { policy_id, recommendation_type } = params;
    
    // Get policy and analysis
    const policyResponse = await axios.get(`${API_BASE}/policies/${policy_id}`);
    const policy = policyResponse.data.data;
    
    const recommendations = {
      policyId: policy_id,
      policyName: policy.policyName,
      currentVersion: policy.version.current,
      recommendations: []
    };
    
    // Check review date
    const nextReview = new Date(policy.compliance.nextReviewDate);
    if (nextReview < new Date()) {
      recommendations.recommendations.push({
        type: 'review',
        priority: 'high',
        description: 'Policy review is overdue',
        action: 'Schedule policy review',
        impact: 'Ensures policy remains current and relevant'
      });
    }
    
    // Check for missing framework mappings
    if (!policy.framework.mappings || policy.framework.mappings.length === 0) {
      recommendations.recommendations.push({
        type: 'framework',
        priority: 'medium',
        description: 'No framework mappings found',
        action: 'Map policy to relevant compliance frameworks',
        impact: 'Improves compliance tracking and gap analysis'
      });
    }
    
    // Check compliance rate
    if (policy.metrics.complianceRate < 80) {
      recommendations.recommendations.push({
        type: 'compliance',
        priority: 'high',
        description: 'Low compliance rate detected',
        action: 'Review policy controls and enforcement mechanisms',
        impact: 'Improves policy effectiveness and reduces violations'
      });
    }
    
    return {
      success: true,
      data: recommendations
    };
  }
  
  // Helper methods
  
  generateOPAPolicy(policy) {
    return `package ${policy.policyNumber.toLowerCase().replace(/-/g, '_')}

# Policy: ${policy.policyName}
# Version: ${policy.version.current}
# Purpose: ${policy.content.purpose}

default allow = false

allow {
    # Add policy rules here
    input.compliant == true
}`;
  }
  
  generateSentinelPolicy(policy) {
    return `# Policy: ${policy.policyName}
# Version: ${policy.version.current}

import "tfplan"

main = rule {
    # Add policy rules here
    true
}`;
  }
  
  generateAWSPolicy(policy) {
    return JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: policy.policyNumber.replace(/-/g, ''),
          Effect: "Deny",
          Action: ["*"],
          Resource: "*",
          Condition: {
            // Add conditions here
          }
        }
      ]
    }, null, 2);
  }
  
  generateAzurePolicy(policy) {
    return JSON.stringify({
      properties: {
        displayName: policy.policyName,
        policyType: "Custom",
        mode: "All",
        description: policy.content.purpose,
        metadata: {
          version: policy.version.current,
          category: policy.category
        },
        policyRule: {
          if: {},
          then: {
            effect: "deny"
          }
        }
      }
    }, null, 2);
  }
  
  calculateEffectivenessRating(metrics) {
    const score = (
      (metrics.complianceRate || 0) * 0.5 +
      Math.max(0, 100 - metrics.violationCount) * 0.3 +
      Math.max(0, 100 - metrics.exceptionCount) * 0.2
    );
    
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }
}

module.exports = FunctionExecutor;
