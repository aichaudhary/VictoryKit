const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4031/api/v1/cloudposture';

async function executeFunctions(functions) {
  const results = [];
  
  for (const func of functions) {
    try {
      let result;
      
      switch (func.name) {
        
        case 'analyze_audit_trail':
          result = await analyzeAuditTrailPro(func.parameters);
          break;
        
        case 'search_audit_logs':
          result = await searchAuditLogs(func.parameters);
          break;
        
        case 'collect_compliance_evidence':
          result = await collectComplianceEvidence(func.parameters);
          break;
        
        case 'detect_anomalies':
          result = await detectAnomalies(func.parameters);
          break;
        
        case 'generate_audit_report':
          result = await generateAuditReport(func.parameters);
          break;
        
        case 'investigate_security_incident':
          result = await investigateSecurityIncident(func.parameters);
          break;
        
        case 'monitor_realtime_events':
          result = await monitorRealtimeEvents(func.parameters);
          break;
        
        case 'verify_audit_integrity':
          result = await verifyAuditIntegrity(func.parameters);
          break;
        
        case 'calculate_risk_score':
          result = await calculateRiskScore(func.parameters);
          break;
        
        case 'create_audit_policy':
          result = await createAuditPolicy(func.parameters);
          break;
        
        default:
          result = { error: `Unknown function: ${func.name}` };
      }
      
      results.push({
        function: func.name,
        status: 'success',
        data: result
      });
      
    } catch (error) {
      console.error(`Error executing ${func.name}:`, error);
      results.push({
        function: func.name,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
}

// ==================== FUNCTION IMPLEMENTATIONS ====================

async function analyzeAuditTrailPro(params) {
  const { user_id, time_range, analysis_type } = params;
  
  const query = new URLSearchParams();
  if (user_id) query.append('user_id', user_id);
  if (time_range?.start) query.append('start_time', time_range.start);
  if (time_range?.end) query.append('end_time', time_range.end);
  
  const response = await axios.get(`${API_BASE}/audit-logs?${query}`);
  const logs = response.data.data;
  
  // Analyze patterns
  const categories = {};
  const severities = {};
  const sources = {};
  let anomalyCount = 0;
  let violationCount = 0;
  
  logs.forEach(log => {
    categories[log.event.category] = (categories[log.event.category] || 0) + 1;
    severities[log.event.severity] = (severities[log.event.severity] || 0) + 1;
    sources[log.source.type] = (sources[log.source.type] || 0) + 1;
    if (log.risk.anomaly_detected) anomalyCount++;
    if (log.compliance.violation) violationCount++;
  });
  
  return {
    summary: {
      total_logs: logs.length,
      anomalies_detected: anomalyCount,
      compliance_violations: violationCount,
      time_range: time_range
    },
    patterns: {
      by_category: categories,
      by_severity: severities,
      by_source: sources
    },
    risk_assessment: {
      high_risk_logs: logs.filter(l => l.risk.score >= 75).length,
      medium_risk_logs: logs.filter(l => l.risk.score >= 50 && l.risk.score < 75).length,
      low_risk_logs: logs.filter(l => l.risk.score < 50).length
    },
    recommendations: generateRecommendations(logs, anomalyCount, violationCount)
  };
}

async function searchAuditLogs(params) {
  const { query, scope, filters, limit } = params;
  
  const response = await axios.post(`${API_BASE}/search`, {
    query,
    scope: scope || [],
    filters: filters || {},
    limit: limit || 50
  });
  
  return {
    total_results: response.data.pagination?.total || 0,
    results: response.data.data,
    search_query: query,
    applied_filters: filters
  };
}

async function collectComplianceEvidence(params) {
  const { framework, control_id, period, auto_collect } = params;
  
  if (auto_collect) {
    // Auto-collect audit logs for the specified period
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);
    
    const logsResponse = await axios.get(`${API_BASE}/audit-logs`, {
      params: {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        compliance_framework: framework.name,
        limit: 1000
      }
    });
    
    const relevantLogs = logsResponse.data.data;
    
    // Create evidence record
    const evidenceResponse = await axios.post(`${API_BASE}/compliance/evidence`, {
      framework: {
        name: framework.name,
        version: framework.version || '1.0',
        domain: framework.domain || 'security'
      },
      control_id,
      control_name: params.control_name,
      control_description: params.control_description,
      audit_period: {
        start_date: startDate,
        end_date: endDate,
        period_name: period.name || 'Q1 2026'
      },
      evidence_type: 'access_logs',
      evidence_title: `Auto-collected evidence for ${control_id}`,
      evidence_description: `Automatically collected ${relevantLogs.length} audit logs for compliance verification`,
      collection_method: 'automated',
      source_systems: ['audit_system'],
      audit_log_ids: relevantLogs.map(l => l.auditId)
    });
    
    return {
      evidence_collected: true,
      evidence_id: evidenceResponse.data.data.evidenceId,
      total_logs: relevantLogs.length,
      quality_score: evidenceResponse.data.data.quality?.overall_score,
      evidence: evidenceResponse.data.data
    };
  }
  
  return { message: 'Manual evidence collection mode - please provide evidence details' };
}

async function detectAnomalies(params) {
  const { detection_scope, sensitivity, time_range, ml_model } = params;
  
  const response = await axios.post(`${API_BASE}/anomalies/detect`, {
    detection_scope: detection_scope || ['unusual_access_pattern', 'privilege_escalation'],
    sensitivity: sensitivity || 'medium',
    baseline_period: '30d',
    ml_model: ml_model || 'isolation_forest',
    time_range: {
      start: time_range?.start || new Date(Date.now() - 24*60*60*1000).toISOString(),
      end: time_range?.end || new Date().toISOString()
    }
  });
  
  const anomalies = response.data.data.anomalies;
  
  return {
    detection_summary: {
      total_anomalies: anomalies.length,
      critical: anomalies.filter(a => a.anomaly.severity === 'critical').length,
      high: anomalies.filter(a => a.anomaly.severity === 'high').length,
      medium: anomalies.filter(a => a.anomaly.severity === 'medium').length
    },
    anomalies: anomalies.map(a => ({
      id: a.anomalyId,
      type: a.anomaly.type,
      severity: a.anomaly.severity,
      risk_score: a.anomaly.risk_score,
      description: a.anomaly.description,
      detected_at: a.detection.detected_at
    })),
    model_used: ml_model || 'isolation_forest',
    recommendations: generateAnomalyRecommendations(anomalies)
  };
}

async function generateAuditReport(params) {
  const { report_type, time_range, framework, format } = params;
  
  // Fetch dashboard stats
  const statsResponse = await axios.get(`${API_BASE}/dashboard/stats`);
  const stats = statsResponse.data.data;
  
  // Fetch audit timeline
  const timelineResponse = await axios.get(`${API_BASE}/dashboard/timeline`, {
    params: {
      start_date: time_range?.start,
      end_date: time_range?.end,
      granularity: 'day'
    }
  });
  const timeline = timelineResponse.data.data;
  
  const report = {
    report_id: `rpt_${Date.now()}`,
    generated_at: new Date().toISOString(),
    report_type,
    time_range,
    framework: framework || 'N/A',
    format: format || 'json',
    executive_summary: {
      total_audit_logs: stats.auditLogs.total,
      critical_events: stats.auditLogs.criticalEvents,
      active_investigations: stats.investigations.active,
      unresolved_anomalies: stats.anomalies.unresolved,
      compliance_violations: stats.compliance.violations,
      average_risk_score: stats.auditLogs.averageRiskScore
    },
    timeline: timeline,
    compliance: {
      evidence_items: stats.compliance.evidenceItems,
      violations: stats.compliance.violations
    },
    security_posture: calculateSecurityPosture(stats),
    recommendations: generateReportRecommendations(stats)
  };
  
  return report;
}

async function investigateSecurityIncident(params) {
  const { incident_type, affected_systems, severity, description } = params;
  
  const response = await axios.post(`${API_BASE}/investigations`, {
    title: params.title || `${incident_type} investigation`,
    type: incident_type,
    description: description || `Investigating ${incident_type}`,
    severity: severity || 'high',
    affected_systems: affected_systems || [],
    affected_users: params.affected_users || [],
    lead_investigator: {
      user_id: params.investigator?.user_id || 'ai_assistant',
      name: params.investigator?.name || 'AI Assistant',
      email: params.investigator?.email || 'ai@maula.ai',
      role: 'lead'
    },
    incident_detected: params.detected_at || new Date().toISOString(),
    time_range: params.time_range || {},
    audit_log_ids: params.audit_log_ids || []
  });
  
  return {
    investigation_created: true,
    investigation_id: response.data.data.investigationId,
    case_number: response.data.data.caseNumber,
    status: 'new',
    next_steps: [
      'Review related audit logs',
      'Collect digital evidence',
      'Interview affected users',
      'Perform root cause analysis',
      'Document findings'
    ]
  };
}

async function monitorRealtimeEvents(params) {
  const { event_types, severity_threshold, duration_seconds } = params;
  
  const startTime = new Date(Date.now() - (duration_seconds || 60) * 1000);
  const endTime = new Date();
  
  const response = await axios.get(`${API_BASE}/audit-logs`, {
    params: {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      limit: 100
    }
  });
  
  let logs = response.data.data;
  
  // Filter by event types
  if (event_types && event_types.length > 0) {
    logs = logs.filter(log => event_types.includes(log.event.category));
  }
  
  // Filter by severity
  if (severity_threshold) {
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    const threshold = severityOrder[severity_threshold];
    logs = logs.filter(log => severityOrder[log.event.severity] >= threshold);
  }
  
  return {
    monitoring_period: {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      duration_seconds: duration_seconds || 60
    },
    events_captured: logs.length,
    critical_events: logs.filter(l => l.event.severity === 'critical'),
    high_risk_events: logs.filter(l => l.risk.score >= 75),
    anomalies: logs.filter(l => l.risk.anomaly_detected),
    recent_events: logs.slice(0, 10)
  };
}

async function verifyAuditIntegrity(params) {
  const { audit_ids, verification_method } = params;
  
  const results = [];
  
  for (const auditId of audit_ids || []) {
    try {
      const response = await axios.post(`${API_BASE}/audit-logs/${auditId}/verify`);
      results.push({
        audit_id: auditId,
        integrity_valid: response.data.data.integrityValid,
        hash: response.data.data.hash,
        algorithm: response.data.data.algorithm,
        verified_at: response.data.data.verifiedAt
      });
    } catch (error) {
      results.push({
        audit_id: auditId,
        integrity_valid: false,
        error: error.message
      });
    }
  }
  
  const validCount = results.filter(r => r.integrity_valid).length;
  const invalidCount = results.length - validCount;
  
  return {
    verification_summary: {
      total_verified: results.length,
      valid: validCount,
      invalid: invalidCount,
      verification_method: verification_method || 'hash_verification'
    },
    results,
    overall_status: invalidCount === 0 ? 'PASS' : 'FAIL'
  };
}

async function calculateRiskScore(params) {
  const { entity_type, entity_id, time_range } = params;
  
  const query = new URLSearchParams();
  
  if (entity_type === 'user') {
    query.append('user_id', entity_id);
  } else if (entity_type === 'system') {
    query.append('source_type', entity_id);
  }
  
  if (time_range?.start) query.append('start_time', time_range.start);
  if (time_range?.end) query.append('end_time', time_range.end);
  
  const response = await axios.get(`${API_BASE}/audit-logs?${query}`);
  const logs = response.data.data;
  
  if (logs.length === 0) {
    return {
      entity_type,
      entity_id,
      risk_score: 0,
      risk_level: 'low',
      message: 'No audit logs found for this entity'
    };
  }
  
  // Calculate composite risk score
  const avgScore = logs.reduce((sum, log) => sum + (log.risk.score || 0), 0) / logs.length;
  const anomalyCount = logs.filter(l => l.risk.anomaly_detected).length;
  const violationCount = logs.filter(l => l.compliance.violation).length;
  const criticalCount = logs.filter(l => l.event.severity === 'critical').length;
  
  const compositeScore = Math.min(100, avgScore + (anomalyCount * 5) + (violationCount * 10) + (criticalCount * 15));
  
  const riskLevel = compositeScore >= 75 ? 'critical' : 
                    compositeScore >= 50 ? 'high' : 
                    compositeScore >= 25 ? 'medium' : 'low';
  
  return {
    entity_type,
    entity_id,
    risk_score: Math.round(compositeScore),
    risk_level: riskLevel,
    analysis: {
      total_events: logs.length,
      average_event_risk: Math.round(avgScore),
      anomalies_detected: anomalyCount,
      compliance_violations: violationCount,
      critical_events: criticalCount
    },
    risk_factors: [
      anomalyCount > 0 && `${anomalyCount} anomalies detected`,
      violationCount > 0 && `${violationCount} compliance violations`,
      criticalCount > 0 && `${criticalCount} critical events`
    ].filter(Boolean)
  };
}

async function createAuditPolicy(params) {
  const {
    policy_name,
    description,
    enabled_sources,
    retention_days,
    compliance_frameworks,
    owner
  } = params;
  
  const response = await axios.post(`${API_BASE}/policies`, {
    policy_name,
    description,
    purpose: params.purpose || 'Automated audit collection and retention',
    priority: params.priority || 'medium',
    category: params.category || 'security',
    enabled_sources: enabled_sources || ['windows_events', 'linux_syslog', 'application_logs'],
    source_configs: params.source_configs || [],
    collection_rules: {
      real_time: params.real_time !== false,
      batch_interval_minutes: params.batch_interval || 15,
      filters: params.filters || { include: [], exclude: [] }
    },
    retention: {
      duration_days: retention_days || 90,
      long_term_archive: params.long_term_archive || { enabled: false },
      deletion_policy: params.deletion_policy || { secure_deletion: true }
    },
    owner: {
      user_id: owner?.user_id || 'ai_assistant',
      name: owner?.name || 'AI Assistant',
      email: owner?.email || 'ai@maula.ai'
    }
  });
  
  return {
    policy_created: true,
    policy_id: response.data.data.policyId,
    policy_name,
    status: 'draft',
    next_steps: [
      'Review policy configuration',
      'Test with sample data',
      'Activate policy for production use'
    ],
    policy: response.data.data.policy
  };
}

// ==================== HELPER FUNCTIONS ====================

function generateRecommendations(logs, anomalyCount, violationCount) {
  const recommendations = [];
  
  if (anomalyCount > 0) {
    recommendations.push({
      priority: 'high',
      category: 'anomaly_detection',
      recommendation: `${anomalyCount} anomalies detected. Review anomalies and investigate suspicious patterns.`,
      action: 'Investigate anomalies'
    });
  }
  
  if (violationCount > 0) {
    recommendations.push({
      priority: 'critical',
      category: 'compliance',
      recommendation: `${violationCount} compliance violations found. Take corrective action immediately.`,
      action: 'Address compliance violations'
    });
  }
  
  const criticalLogs = logs.filter(l => l.event.severity === 'critical').length;
  if (criticalLogs > 5) {
    recommendations.push({
      priority: 'high',
      category: 'security',
      recommendation: `High volume of critical events (${criticalLogs}). Review security posture.`,
      action: 'Security review required'
    });
  }
  
  return recommendations;
}

function generateAnomalyRecommendations(anomalies) {
  const recommendations = [];
  
  const criticalAnomalies = anomalies.filter(a => a.anomaly.severity === 'critical');
  if (criticalAnomalies.length > 0) {
    recommendations.push({
      priority: 'critical',
      recommendation: `${criticalAnomalies.length} critical anomalies require immediate investigation`,
      action: 'Create security investigation'
    });
  }
  
  const privEsc = anomalies.filter(a => a.anomaly.type === 'privilege_escalation');
  if (privEsc.length > 0) {
    recommendations.push({
      priority: 'high',
      recommendation: 'Privilege escalation attempts detected - potential insider threat',
      action: 'Review user access controls'
    });
  }
  
  return recommendations;
}

function calculateSecurityPosture(stats) {
  const totalEvents = stats.auditLogs.total || 1;
  const criticalEvents = stats.auditLogs.criticalEvents || 0;
  const violations = stats.compliance.violations || 0;
  const anomalies = stats.anomalies.unresolved || 0;
  
  // Higher is worse
  const risk = ((criticalEvents / totalEvents) * 30) + 
               ((violations / totalEvents) * 40) + 
               ((anomalies / totalEvents) * 30);
  
  const postureScore = Math.max(0, 100 - (risk * 100));
  
  return {
    score: Math.round(postureScore),
    rating: postureScore >= 90 ? 'Excellent' :
            postureScore >= 75 ? 'Good' :
            postureScore >= 50 ? 'Fair' : 'Poor',
    risk_level: postureScore >= 75 ? 'Low' :
                postureScore >= 50 ? 'Medium' : 'High'
  };
}

function generateReportRecommendations(stats) {
  const recommendations = [];
  
  if (stats.compliance.violations > 0) {
    recommendations.push('Address compliance violations immediately');
  }
  
  if (stats.anomalies.unresolved > 5) {
    recommendations.push('High volume of unresolved anomalies - increase investigation capacity');
  }
  
  if (stats.auditLogs.averageRiskScore > 60) {
    recommendations.push('Average risk score is elevated - review security controls');
  }
  
  if (stats.investigations.active > 10) {
    recommendations.push('Multiple active investigations - consider additional resources');
  }
  
  return recommendations;
}

module.exports = { executeFunctions };
