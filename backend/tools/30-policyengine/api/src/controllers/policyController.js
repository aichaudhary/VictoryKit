const Policy = require('../models/Policy');
const PolicyVersion = require('../models/PolicyVersion');
const RuntimeGuard = require('../models/RuntimeGuard');
const PolicyException = require('../models/PolicyException');
const FrameworkMapping = require('../models/FrameworkMapping');
const { v4: uuidv4 } = require('uuid');

class PolicyController {
  
  // ==================== POLICY MANAGEMENT ====================
  
  async createPolicy(req, res) {
    try {
      const {
        policy_name,
        category,
        content,
        framework,
        compliance,
        applicability,
        owner
      } = req.body;
      
      const policyId = `pol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const policy = new Policy({
        policyId,
        policyName: policy_name,
        policyNumber: `POL-${Date.now().toString().slice(-6)}`,
        category,
        status: 'draft',
        content,
        framework: framework || {},
        compliance: {
          ...compliance,
          effectiveDate: compliance?.effectiveDate || new Date(),
          reviewCycle: compliance?.reviewCycle || 'annual',
          nextReviewDate: this.calculateNextReviewDate(compliance?.reviewCycle || 'annual')
        },
        applicability: applicability || { scope: 'organization' },
        owner,
        metrics: {
          complianceRate: 0,
          violationCount: 0,
          exceptionCount: 0
        }
      });
      
      await policy.save();
      
      // Create initial version
      await this.createPolicyVersion(policy);
      
      res.json({
        success: true,
        data: {
          policyId: policy.policyId,
          policyNumber: policy.policyNumber,
          policy
        },
        message: 'Policy created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getPolicies(req, res) {
    try {
      const {
        category,
        status,
        framework,
        compliance,
        scope,
        owner,
        search,
        page = 1,
        limit = 20,
        sort = '-createdAt'
      } = req.query;
      
      const query = {};
      
      if (category) query.category = category;
      if (status) query.status = status;
      if (framework) query['framework.baseFramework'] = framework;
      if (compliance) query['compliance.mandates'] = compliance;
      if (scope) query['applicability.scope'] = scope;
      if (owner) query['owner.userId'] = owner;
      
      if (search) {
        query.$or = [
          { policyName: { $regex: search, $options: 'i' } },
          { policyNumber: { $regex: search, $options: 'i' } },
          { 'content.purpose': { $regex: search, $options: 'i' } }
        ];
      }
      
      const skip = (page - 1) * limit;
      const policies = await Policy.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Policy.countDocuments(query);
      
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
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getPolicyById(req, res) {
    try {
      const policy = await Policy.findOne({ policyId: req.params.id });
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
      }
      
      res.json({ success: true, data: policy });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async updatePolicy(req, res) {
    try {
      const policy = await Policy.findOne({ policyId: req.params.id });
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
      }
      
      const { update_type, ...updates } = req.body;
      
      // Apply updates
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          policy[key] = updates[key];
        }
      });
      
      // Increment version if significant changes
      if (update_type) {
        policy.incrementVersion(update_type);
        await this.createPolicyVersion(policy);
      }
      
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
  
  async deletePolicy(req, res) {
    try {
      const policy = await Policy.findOne({ policyId: req.params.id });
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
      }
      
      // Soft delete - archive instead of removing
      policy.status = 'archived';
      await policy.save();
      
      res.json({
        success: true,
        message: 'Policy archived successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== POLICY APPROVAL ====================
  
  async submitForApproval(req, res) {
    try {
      const policy = await Policy.findOne({ policyId: req.params.id });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      const { approvers } = req.body;
      
      policy.status = 'under_review';
      policy.approval.status = 'pending';
      policy.approval.approvers = approvers.map(a => ({
        userId: a.userId,
        userName: a.userName,
        role: a.role,
        status: 'pending'
      }));
      
      await policy.save();
      
      res.json({
        success: true,
        data: policy,
        message: 'Policy submitted for approval'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async approvePolicy(req, res) {
    try {
      const policy = await Policy.findOne({ policyId: req.params.id });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      const { approver_id, decision, comments } = req.body;
      
      const approverIndex = policy.approval.approvers.findIndex(
        a => a.userId === approver_id
      );
      
      if (approverIndex === -1) {
        return res.status(403).json({
          success: false,
          error: 'User not authorized to approve this policy'
        });
      }
      
      policy.approval.approvers[approverIndex].status = decision;
      policy.approval.approvers[approverIndex].approvalDate = new Date();
      policy.approval.approvers[approverIndex].comments = comments;
      
      // Check if all approvers have decided
      const allDecided = policy.approval.approvers.every(
        a => a.status !== 'pending'
      );
      
      if (allDecided) {
        const allApproved = policy.approval.approvers.every(
          a => a.status === 'approved'
        );
        
        if (allApproved) {
          policy.approval.status = 'approved';
          policy.status = 'approved';
          policy.approval.finalApprovalDate = new Date();
        } else {
          policy.approval.status = 'rejected';
          policy.status = 'draft';
        }
      }
      
      await policy.save();
      
      res.json({
        success: true,
        data: policy,
        message: `Policy ${decision}`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== POLICY COMPLIANCE ====================
  
  async checkCompliance(req, res) {
    try {
      const { policy_id, scope, scope_id, check_type } = req.body;
      
      const policy = await Policy.findOne({ policyId: policy_id });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      const checkId = `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const complianceCheck = new RuntimeGuard({
        checkId,
        policyId: policy_id,
        policyName: policy.policyName,
        checkType: check_type || 'manual',
        scope,
        scopeId: scope_id,
        status: 'in_progress',
        execution: {
          startTime: new Date(),
          automated: check_type === 'automated'
        }
      });
      
      await complianceCheck.save();
      
      // Simulate compliance check (in production, this would run actual checks)
      setTimeout(async () => {
        complianceCheck.status = 'completed';
        complianceCheck.result = {
          overall: 'compliant',
          totalControls: 10,
          compliantControls: 8,
          nonCompliantControls: 2,
          notApplicableControls: 0
        };
        complianceCheck.calculateComplianceScore();
        complianceCheck.execution.endTime = new Date();
        await complianceCheck.save();
        
        // Update policy metrics
        policy.updateComplianceMetrics({
          complianceRate: complianceCheck.result.complianceScore
        });
        await policy.save();
      }, 100);
      
      res.json({
        success: true,
        data: {
          checkId: complianceCheck.checkId,
          status: complianceCheck.status,
          check: complianceCheck
        },
        message: 'Compliance check initiated'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getRuntimeGuards(req, res) {
    try {
      const { policy_id, scope, status, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (policy_id) query.policyId = policy_id;
      if (scope) query.scope = scope;
      if (status) query.status = status;
      
      const skip = (page - 1) * limit;
      const checks = await RuntimeGuard.find(query)
        .sort({ 'execution.startTime': -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await RuntimeGuard.countDocuments(query);
      
      res.json({
        success: true,
        data: checks,
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
  
  // ==================== POLICY EXCEPTIONS ====================
  
  async createException(req, res) {
    try {
      const {
        policy_id,
        requestor,
        justification,
        scope,
        duration,
        compensating_controls
      } = req.body;
      
      const policy = await Policy.findOne({ policyId: policy_id });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      const exceptionId = `exc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const exception = new PolicyException({
        exceptionId,
        policyId: policy_id,
        policyName: policy.policyName,
        status: 'pending',
        requestor,
        justification,
        scope,
        duration: {
          ...duration,
          startDate: duration.startDate || new Date(),
          endDate: this.calculateExceptionEndDate(duration.duration)
        },
        riskAssessment: this.assessExceptionRisk(justification, scope),
        compensatingControls: compensating_controls || [],
        approval: {
          required: ['security_manager', 'ciso'],  // Default required approvers
          approvals: [],
          finalDecision: 'pending'
        }
      });
      
      await exception.save();
      
      // Update policy exception count
      policy.metrics.exceptionCount += 1;
      await policy.save();
      
      res.json({
        success: true,
        data: exception,
        message: 'Exception request created'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getExceptions(req, res) {
    try {
      const { policy_id, status, requestor, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (policy_id) query.policyId = policy_id;
      if (status) query.status = status;
      if (requestor) query['requestor.userId'] = requestor;
      
      const skip = (page - 1) * limit;
      const exceptions = await PolicyException.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await PolicyException.countDocuments(query);
      
      res.json({
        success: true,
        data: exceptions,
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
  
  async approveException(req, res) {
    try {
      const exception = await PolicyException.findOne({ exceptionId: req.params.id });
      
      if (!exception) {
        return res.status(404).json({ success: false, error: 'Exception not found' });
      }
      
      const { approver_id, approver_name, approver_role, decision, comments } = req.body;
      
      exception.addApproval({
        approverId: approver_id,
        approverName: approver_name,
        approverRole: approver_role,
        decision,
        comments
      });
      
      await exception.save();
      
      res.json({
        success: true,
        data: exception,
        message: `Exception ${decision}`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== FRAMEWORK MAPPING ====================
  
  async mapToFramework(req, res) {
    try {
      const { policy_id, framework, mappings } = req.body;
      
      const policy = await Policy.findOne({ policyId: policy_id });
      
      if (!policy) {
        return res.status(404).json({ success: false, error: 'Policy not found' });
      }
      
      const mappingId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const frameworkMapping = new FrameworkMapping({
        mappingId,
        policyId: policy_id,
        policyName: policy.policyName,
        framework,
        mappings,
        complianceStatus: {
          overall: 'not_assessed',
          totalControls: mappings.length
        }
      });
      
      frameworkMapping.calculateComplianceScore();
      await frameworkMapping.save();
      
      // Update policy framework mappings
      policy.framework.mappings = policy.framework.mappings || [];
      policy.framework.mappings.push({
        framework: framework.name,
        controlId: mappingId,
        coverage: 'full'
      });
      await policy.save();
      
      res.json({
        success: true,
        data: frameworkMapping,
        message: 'Framework mapping created'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getFrameworkMappings(req, res) {
    try {
      const { policy_id, framework, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (policy_id) query.policyId = policy_id;
      if (framework) query['framework.name'] = framework;
      
      const skip = (page - 1) * limit;
      const mappings = await FrameworkMapping.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await FrameworkMapping.countDocuments(query);
      
      res.json({
        success: true,
        data: mappings,
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
  
  // ==================== DASHBOARD & ANALYTICS ====================
  
  async getDashboardStats(req, res) {
    try {
      const [
        totalPolicies,
        draftPolicies,
        approvedPolicies,
        publishedPolicies,
        totalExceptions,
        pendingExceptions,
        activeExceptions,
        totalChecks,
        recentChecks
      ] = await Promise.all([
        Policy.countDocuments(),
        Policy.countDocuments({ status: 'draft' }),
        Policy.countDocuments({ status: 'approved' }),
        Policy.countDocuments({ status: 'published' }),
        PolicyException.countDocuments(),
        PolicyException.countDocuments({ status: 'pending' }),
        PolicyException.countDocuments({ status: 'approved' }),
        RuntimeGuard.countDocuments(),
        RuntimeGuard.find().sort({ 'execution.startTime': -1 }).limit(5)
      ]);
      
      // Calculate average compliance
      const checks = await RuntimeGuard.find({ status: 'completed' });
      const avgCompliance = checks.length > 0
        ? Math.round(checks.reduce((sum, c) => sum + (c.result.complianceScore || 0), 0) / checks.length)
        : 0;
      
      res.json({
        success: true,
        data: {
          policies: {
            total: totalPolicies,
            draft: draftPolicies,
            approved: approvedPolicies,
            published: publishedPolicies
          },
          exceptions: {
            total: totalExceptions,
            pending: pendingExceptions,
            active: activeExceptions
          },
          compliance: {
            totalChecks,
            averageScore: avgCompliance,
            recentChecks
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  calculateNextReviewDate(cycle) {
    const date = new Date();
    switch (cycle) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'semi_annual':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'annual':
      default:
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }
  
  calculateExceptionEndDate(duration) {
    const date = new Date();
    const days = parseInt(duration.replace('d', ''));
    date.setDate(date.getDate() + days);
    return date;
  }
  
  assessExceptionRisk(justification, scope) {
    // Simplified risk assessment
    const urgency = justification.urgency || 'medium';
    const scopeType = scope.type;
    
    let riskScore = 50;
    
    if (urgency === 'critical') riskScore += 25;
    else if (urgency === 'high') riskScore += 15;
    
    if (scopeType === 'organization') riskScore += 15;
    else if (scopeType === 'department') riskScore += 10;
    
    const riskLevel = riskScore >= 75 ? 'high' : riskScore >= 50 ? 'medium' : 'low';
    
    return {
      riskLevel,
      riskScore: Math.min(100, riskScore),
      impactAnalysis: 'Automated assessment based on scope and urgency',
      likelihoodAssessment: 'Medium',
      residualRisk: 'To be assessed with compensating controls'
    };
  }
  
  async createPolicyVersion(policy) {
    const versionId = `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const version = new PolicyVersion({
      versionId,
      policyId: policy.policyId,
      policyName: policy.policyName,
      version: {
        number: policy.version.current,
        major: policy.version.major,
        minor: policy.version.minor,
        patch: policy.version.patch
      },
      versionType: 'major',
      changeLog: {
        summary: 'Policy created or updated',
        changes: []
      },
      content: policy.content,
      metadata: {
        createdBy: {
          userId: policy.owner.userId,
          userName: policy.owner.userName,
          email: policy.owner.email
        },
        status: 'active'
      }
    });
    
    await version.save();
    return version;
  }
}

module.exports = new PolicyController();
