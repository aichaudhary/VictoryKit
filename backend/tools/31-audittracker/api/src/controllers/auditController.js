const AuditLog = require('../models/AuditLog');
const ComplianceEvidence = require('../models/ComplianceEvidence');
const Investigation = require('../models/Investigation');
const AnomalyDetection = require('../models/AnomalyDetection');
const AuditPolicy = require('../models/AuditPolicy');

class AuditController {
  
  // ==================== AUDIT LOG MANAGEMENT ====================
  
  async createAuditLog(req, res) {
    try {
      const auditData = req.body;
      
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const auditLog = new AuditLog({
        auditId,
        logId: auditData.log_id || auditId,
        timestamp: auditData.timestamp || new Date(),
        source: auditData.source,
        event: auditData.event,
        actor: auditData.actor,
        target: auditData.target,
        changes: auditData.changes,
        compliance: auditData.compliance || {},
        context: auditData.context || {},
        metadata: auditData.metadata || {}
      });
      
      // Generate hash for integrity
      auditLog.generateHash();
      
      // Calculate risk score
      auditLog.calculateRiskScore();
      
      await auditLog.save();
      
      res.json({
        success: true,
        data: {
          auditId: auditLog.auditId,
          riskScore: auditLog.risk.score,
          auditLog
        },
        message: 'Audit log created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getAuditLogs(req, res) {
    try {
      const {
        source_type,
        event_category,
        event_severity,
        user_id,
        resource_type,
        start_time,
        end_time,
        compliance_framework,
        violation,
        anomaly,
        flagged,
        search,
        page = 1,
        limit = 50,
        sort = '-timestamp'
      } = req.query;
      
      const query = {};
      
      if (source_type) query['source.type'] = source_type;
      if (event_category) query['event.category'] = event_category;
      if (event_severity) query['event.severity'] = event_severity;
      if (user_id) query['actor.user_id'] = user_id;
      if (resource_type) query['target.resource_type'] = resource_type;
      if (compliance_framework) query['compliance.frameworks'] = compliance_framework;
      if (violation === 'true') query['compliance.violation'] = true;
      if (anomaly === 'true') query['risk.anomaly_detected'] = true;
      if (flagged === 'true') query['investigation.flagged'] = true;
      
      if (start_time && end_time) {
        query.timestamp = {
          $gte: new Date(start_time),
          $lte: new Date(end_time)
        };
      }
      
      if (search) {
        query.$text = { $search: search };
      }
      
      const skip = (page - 1) * limit;
      const logs = await AuditLog.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await AuditLog.countDocuments(query);
      
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
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getAuditLogById(req, res) {
    try {
      const log = await AuditLog.findOne({ auditId: req.params.id });
      
      if (!log) {
        return res.status(404).json({
          success: false,
          error: 'Audit log not found'
        });
      }
      
      res.json({ success: true, data: log });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async verifyAuditLogIntegrity(req, res) {
    try {
      const log = await AuditLog.findOne({ auditId: req.params.id });
      
      if (!log) {
        return res.status(404).json({
          success: false,
          error: 'Audit log not found'
        });
      }
      
      const isValid = log.verifyIntegrity();
      
      res.json({
        success: true,
        data: {
          auditId: log.auditId,
          integrityValid: isValid,
          hash: log.integrity.hash,
          algorithm: log.integrity.algorithm,
          verifiedAt: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async flagAuditLog(req, res) {
    try {
      const log = await AuditLog.findOne({ auditId: req.params.id });
      
      if (!log) {
        return res.status(404).json({
          success: false,
          error: 'Audit log not found'
        });
      }
      
      const { flagged_by, reason } = req.body;
      
      log.investigation.flagged = true;
      log.investigation.flagged_by = flagged_by;
      log.investigation.flagged_reason = reason;
      
      await log.save();
      
      res.json({
        success: true,
        data: log,
        message: 'Audit log flagged for investigation'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== COMPLIANCE EVIDENCE ====================
  
  async collectComplianceEvidence(req, res) {
    try {
      const {
        framework,
        control_id,
        audit_period,
        evidence_type,
        collection_method,
        audit_log_ids
      } = req.body;
      
      const evidenceId = `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const evidence = new ComplianceEvidence({
        evidenceId,
        framework: {
          name: framework.name,
          version: framework.version,
          domain: framework.domain
        },
        control: {
          control_id,
          control_name: req.body.control_name,
          control_description: req.body.control_description
        },
        auditPeriod: {
          start_date: audit_period.start_date,
          end_date: audit_period.end_date,
          period_name: audit_period.period_name || 'Q1 2026'
        },
        evidence: {
          type: evidence_type,
          title: req.body.evidence_title,
          description: req.body.evidence_description,
          collection_method: collection_method || 'automated',
          source_systems: req.body.source_systems || [],
          audit_log_ids: audit_log_ids || []
        }
      });
      
      // Calculate quality score
      evidence.calculateQualityScore();
      
      await evidence.save();
      
      res.json({
        success: true,
        data: evidence,
        message: 'Compliance evidence collected successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getComplianceEvidence(req, res) {
    try {
      const {
        framework,
        control_id,
        status,
        audit_period_start,
        audit_period_end,
        evidence_type,
        page = 1,
        limit = 20
      } = req.query;
      
      const query = {};
      
      if (framework) query['framework.name'] = framework;
      if (control_id) query['control.control_id'] = control_id;
      if (status) query['compliance.status'] = status;
      if (evidence_type) query['evidence.type'] = evidence_type;
      
      if (audit_period_start && audit_period_end) {
        query['auditPeriod.start_date'] = { $gte: new Date(audit_period_start) };
        query['auditPeriod.end_date'] = { $lte: new Date(audit_period_end) };
      }
      
      const skip = (page - 1) * limit;
      const evidence = await ComplianceEvidence.find(query)
        .sort({ 'metadata.collected_at': -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await ComplianceEvidence.countDocuments(query);
      
      res.json({
        success: true,
        data: evidence,
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
  
  async attestEvidence(req, res) {
    try {
      const evidence = await ComplianceEvidence.findOne({ evidenceId: req.params.id });
      
      if (!evidence) {
        return res.status(404).json({
          success: false,
          error: 'Evidence not found'
        });
      }
      
      const { attestor, attestation_statement, digital_signature } = req.body;
      
      evidence.attestation.status = 'attested';
      evidence.attestation.attestor = attestor;
      evidence.attestation.attestation_date = new Date();
      evidence.attestation.attestation_statement = attestation_statement;
      evidence.attestation.digital_signature = digital_signature;
      
      await evidence.save();
      
      res.json({
        success: true,
        data: evidence,
        message: 'Evidence attested successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== INVESTIGATIONS ====================
  
  async createInvestigation(req, res) {
    try {
      const {
        title,
        type,
        description,
        severity,
        affected_systems,
        affected_users,
        lead_investigator
      } = req.body;
      
      const investigationId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const caseNumber = `CASE-${Date.now().toString().slice(-8)}`;
      
      const investigation = new Investigation({
        investigationId,
        case_number: caseNumber,
        investigation: {
          title,
          type,
          description,
          severity,
          priority: severity === 'critical' ? 'P1' : severity === 'high' ? 'P2' : 'P3',
          status: 'new'
        },
        timeline: {
          incident_detected: req.body.incident_detected || new Date(),
          investigation_started: new Date()
        },
        scope: {
          affected_systems: affected_systems || [],
          affected_users: affected_users || [],
          time_range: req.body.time_range || {}
        },
        team: {
          lead_investigator: {
            user_id: lead_investigator.user_id,
            name: lead_investigator.name,
            email: lead_investigator.email,
            role: lead_investigator.role
          },
          investigators: []
        },
        evidence: {
          audit_log_ids: req.body.audit_log_ids || [],
          digital_evidence: [],
          total_evidence_items: 0
        },
        metadata: {
          created_by: lead_investigator
        }
      });
      
      await investigation.save();
      
      res.json({
        success: true,
        data: {
          investigationId: investigation.investigationId,
          caseNumber: investigation.case_number,
          investigation
        },
        message: 'Investigation created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getInvestigations(req, res) {
    try {
      const {
        status,
        type,
        severity,
        investigator,
        page = 1,
        limit = 20,
        sort = '-timeline.investigation_started'
      } = req.query;
      
      const query = {};
      
      if (status) query['investigation.status'] = status;
      if (type) query['investigation.type'] = type;
      if (severity) query['investigation.severity'] = severity;
      if (investigator) {
        query.$or = [
          { 'team.lead_investigator.user_id': investigator },
          { 'team.investigators.user_id': investigator }
        ];
      }
      
      const skip = (page - 1) * limit;
      const investigations = await Investigation.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Investigation.countDocuments(query);
      
      res.json({
        success: true,
        data: investigations,
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
  
  async getInvestigationById(req, res) {
    try {
      const investigation = await Investigation.findOne({ investigationId: req.params.id });
      
      if (!investigation) {
        return res.status(404).json({
          success: false,
          error: 'Investigation not found'
        });
      }
      
      res.json({ success: true, data: investigation });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async updateInvestigationStatus(req, res) {
    try {
      const investigation = await Investigation.findOne({ investigationId: req.params.id });
      
      if (!investigation) {
        return res.status(404).json({
          success: false,
          error: 'Investigation not found'
        });
      }
      
      investigation.updateStatus(req.body.status);
      await investigation.save();
      
      res.json({
        success: true,
        data: investigation,
        message: `Investigation status updated to ${req.body.status}`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async addInvestigationEvidence(req, res) {
    try {
      const investigation = await Investigation.findOne({ investigationId: req.params.id });
      
      if (!investigation) {
        return res.status(404).json({
          success: false,
          error: 'Investigation not found'
        });
      }
      
      investigation.addEvidence(req.body);
      await investigation.save();
      
      res.json({
        success: true,
        data: investigation,
        message: 'Evidence added to investigation'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async addInvestigationFinding(req, res) {
    try {
      const investigation = await Investigation.findOne({ investigationId: req.params.id });
      
      if (!investigation) {
        return res.status(404).json({
          success: false,
          error: 'Investigation not found'
        });
      }
      
      investigation.addFinding(req.body);
      await investigation.save();
      
      res.json({
        success: true,
        data: investigation,
        message: 'Finding added to investigation'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== ANOMALY DETECTION ====================
  
  async detectAnomalies(req, res) {
    try {
      const {
        detection_scope,
        sensitivity,
        baseline_period,
        ml_model,
        time_range
      } = req.body;
      
      // Fetch audit logs for analysis
      const logs = await AuditLog.find({
        timestamp: {
          $gte: new Date(time_range.start),
          $lte: new Date(time_range.end)
        }
      });
      
      // Simulate anomaly detection (in production, this would use actual ML models)
      const anomalies = [];
      
      for (const log of logs.slice(0, 5)) {  // Demo: detect first 5 as anomalies
        const anomalyId = `anom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const anomaly = new AnomalyDetection({
          anomalyId,
          detection: {
            detected_at: new Date(),
            detection_model: ml_model || 'isolation_forest',
            confidence_score: Math.random() * 50 + 50  // 50-100
          },
          anomaly: {
            type: detection_scope[0] || 'unusual_access_pattern',
            category: 'behavioral_anomaly',
            severity: sensitivity === 'critical' ? 'critical' : 'high',
            description: 'Anomalous behavior detected'
          },
          auditLogs: {
            primary_audit_id: log.auditId,
            related_audit_ids: [],
            total_logs_analyzed: logs.length
          },
          baseline: {
            baseline_period: baseline_period || '30d'
          }
        });
        
        anomaly.calculateRiskScore();
        await anomaly.save();
        
        anomalies.push(anomaly);
      }
      
      res.json({
        success: true,
        data: {
          total_anomalies: anomalies.length,
          anomalies
        },
        message: 'Anomaly detection completed'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getAnomalies(req, res) {
    try {
      const {
        type,
        severity,
        status,
        min_risk_score,
        user_id,
        start_date,
        page = 1,
        limit = 20
      } = req.query;
      
      const query = {};
      
      if (type) query['anomaly.type'] = type;
      if (severity) query['anomaly.severity'] = severity;
      if (status) query['investigation.status'] = status;
      if (min_risk_score) query['anomaly.risk_score'] = { $gte: parseFloat(min_risk_score) };
      if (user_id) query['context.user.user_id'] = user_id;
      if (start_date) query['detection.detected_at'] = { $gte: new Date(start_date) };
      
      const skip = (page - 1) * limit;
      const anomalies = await AnomalyDetection.find(query)
        .sort({ 'anomaly.risk_score': -1, 'detection.detected_at': -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await AnomalyDetection.countDocuments(query);
      
      res.json({
        success: true,
        data: anomalies,
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
  
  async markAnomalyFalsePositive(req, res) {
    try {
      const anomaly = await AnomalyDetection.findOne({ anomalyId: req.params.id });
      
      if (!anomaly) {
        return res.status(404).json({
          success: false,
          error: 'Anomaly not found'
        });
      }
      
      anomaly.markAsFalsePositive(req.body.reason, req.body.user_id);
      await anomaly.save();
      
      res.json({
        success: true,
        data: anomaly,
        message: 'Anomaly marked as false positive'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== AUDIT POLICIES ====================
  
  async createAuditPolicy(req, res) {
    try {
      const {
        policy_name,
        description,
        enabled_sources,
        collection_rules,
        retention,
        owner
      } = req.body;
      
      const policyId = `pol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const policy = new AuditPolicy({
        policyId,
        policy_name,
        policy: {
          description,
          purpose: req.body.purpose,
          status: 'draft',
          priority: req.body.priority || 'medium',
          category: req.body.category || 'security'
        },
        sources: {
          enabled_sources,
          source_configs: req.body.source_configs || []
        },
        collection: collection_rules,
        retention: {
          duration_days: retention.duration_days,
          long_term_archive: retention.long_term_archive || {},
          deletion_policy: retention.deletion_policy || {}
        },
        management: {
          owner: {
            user_id: owner.user_id,
            name: owner.name,
            email: owner.email
          },
          version: 1
        }
      });
      
      await policy.save();
      
      res.json({
        success: true,
        data: {
          policyId: policy.policyId,
          policy
        },
        message: 'Audit policy created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getAuditPolicies(req, res) {
    try {
      const {
        status,
        category,
        owner,
        page = 1,
        limit = 20
      } = req.query;
      
      const query = {};
      
      if (status) query['policy.status'] = status;
      if (category) query['policy.category'] = category;
      if (owner) query['management.owner.user_id'] = owner;
      
      const skip = (page - 1) * limit;
      const policies = await AuditPolicy.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await AuditPolicy.countDocuments(query);
      
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
  
  async activateAuditPolicy(req, res) {
    try {
      const policy = await AuditPolicy.findOne({ policyId: req.params.id });
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
      }
      
      policy.activate();
      await policy.save();
      
      res.json({
        success: true,
        data: policy,
        message: 'Audit policy activated'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async deactivateAuditPolicy(req, res) {
    try {
      const policy = await AuditPolicy.findOne({ policyId: req.params.id });
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
      }
      
      policy.deactivate();
      await policy.save();
      
      res.json({
        success: true,
        data: policy,
        message: 'Audit policy deactivated'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // ==================== DASHBOARD & ANALYTICS ====================
  
  async getDashboardStats(req, res) {
    try {
      const [
        totalLogs,
        recentLogs,
        criticalEvents,
        activeInvestigations,
        unresolvedAnomalies,
        complianceViolations,
        evidenceItems,
        activePolicies
      ] = await Promise.all([
        AuditLog.countDocuments(),
        AuditLog.find().sort({ timestamp: -1 }).limit(10),
        AuditLog.countDocuments({ 'event.severity': 'critical' }),
        Investigation.countDocuments({ 'investigation.status': { $in: ['assigned', 'in_progress'] } }),
        AnomalyDetection.countDocuments({ 'investigation.status': { $in: ['new', 'triaged', 'investigating'] } }),
        AuditLog.countDocuments({ 'compliance.violation': true }),
        ComplianceEvidence.countDocuments(),
        AuditPolicy.countDocuments({ 'policy.status': 'active' })
      ]);
      
      // Calculate average risk score
      const riskScores = await AuditLog.find({ 'risk.score': { $exists: true } })
        .select('risk.score')
        .limit(1000);
      
      const avgRiskScore = riskScores.length > 0
        ? Math.round(riskScores.reduce((sum, log) => sum + (log.risk.score || 0), 0) / riskScores.length)
        : 0;
      
      res.json({
        success: true,
        data: {
          auditLogs: {
            total: totalLogs,
            recent: recentLogs,
            criticalEvents,
            averageRiskScore: avgRiskScore
          },
          investigations: {
            active: activeInvestigations
          },
          anomalies: {
            unresolved: unresolvedAnomalies
          },
          compliance: {
            violations: complianceViolations,
            evidenceItems
          },
          policies: {
            active: activePolicies
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getAuditTimeline(req, res) {
    try {
      const { start_date, end_date, granularity = 'hour' } = req.query;
      
      const matchStage = {};
      if (start_date && end_date) {
        matchStage.timestamp = {
          $gte: new Date(start_date),
          $lte: new Date(end_date)
        };
      }
      
      const groupByFormat = granularity === 'day'
        ? { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        : { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } };
      
      const timeline = await AuditLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: groupByFormat,
            count: { $sum: 1 },
            criticalEvents: {
              $sum: { $cond: [{ $eq: ['$event.severity', 'critical'] }, 1, 0] }
            },
            highRiskEvents: {
              $sum: { $cond: [{ $gte: ['$risk.score', 75] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      res.json({
        success: true,
        data: timeline
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async searchAuditLogs(req, res) {
    try {
      const { query, scope, filters, page = 1, limit = 50 } = req.body;
      
      const searchQuery = {};
      
      // Text search
      if (query) {
        searchQuery.$text = { $search: query };
      }
      
      // Scope filtering
      if (scope && scope.length > 0) {
        const scopeConditions = [];
        
        if (scope.includes('user_actions')) {
          scopeConditions.push({ 'event.category': { $in: ['authentication', 'access_control'] } });
        }
        if (scope.includes('security_events')) {
          scopeConditions.push({ 'event.category': 'security_event' });
        }
        if (scope.includes('data_access')) {
          scopeConditions.push({ 'event.category': 'data_access' });
        }
        
        if (scopeConditions.length > 0) {
          searchQuery.$or = scopeConditions;
        }
      }
      
      // Additional filters
      if (filters) {
        if (filters.severity) searchQuery['event.severity'] = filters.severity;
        if (filters.user_id) searchQuery['actor.user_id'] = filters.user_id;
        if (filters.ip_address) searchQuery['actor.ip_address'] = filters.ip_address;
      }
      
      const skip = (page - 1) * limit;
      const results = await AuditLog.find(searchQuery)
        .sort({ timestamp: -1, score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await AuditLog.countDocuments(searchQuery);
      
      res.json({
        success: true,
        data: results,
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
}

module.exports = new AuditController();
