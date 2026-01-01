const axios = require("axios");
const { getConnectors } = require("../../../../shared/connectors");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8028";

class SOAREngineService {
  // Analyze incidents and orchestrate responses using ML
  async analyze(data) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/analyze`,
        { data },
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error("ML analysis failed, using fallback:", error.message);
      return this.fallbackAnalysis(data);
    }
  }

  // Execute orchestrated response workflows
  async scan(target) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/scan`,
        { target },
        { timeout: 60000 }
      );
      return response.data;
    } catch (error) {
      console.error("ML scan failed, using fallback:", error.message);
      return this.fallbackScan(target);
    }
  }

  // Fallback analysis when ML engine is unavailable
  fallbackAnalysis(data) {
    const incidents = [];
    const workflows = [];
    const recommendations = [];

    // Analyze incident data for response orchestration
    if (data.incidents) {
      for (const incident of data.incidents) {
        const severity = incident.severity || 'medium';
        const type = incident.type || 'unknown';

        incidents.push({
          id: incident.id,
          type,
          severity,
          status: 'analyzed',
          priority: severity === 'critical' ? 'high' : severity === 'high' ? 'medium' : 'low'
        });

        // Generate workflow recommendations
        if (severity === 'critical') {
          workflows.push({
            incidentId: incident.id,
            name: 'Critical Incident Response',
            steps: [
              'Isolate affected systems',
              'Notify security team',
              'Gather forensics',
              'Implement containment',
              'Begin recovery'
            ],
            automated: true
          });
        }

        // Generate response recommendations
        recommendations.push({
          incidentId: incident.id,
          actions: this.generateResponseActions(incident),
          priority: severity === 'critical' ? 'immediate' : 'scheduled'
        });
      }
    }

    return {
      incidents,
      workflows,
      recommendations,
      totalIncidents: incidents.length,
      automatedResponses: workflows.filter(w => w.automated).length,
      riskLevel: incidents.some(i => i.severity === 'critical') ? 'critical' :
                 incidents.some(i => i.severity === 'high') ? 'high' : 'medium'
    };
  }

  // Generate response actions based on incident type
  generateResponseActions(incident) {
    const actions = [];

    switch (incident.type) {
      case 'malware':
        actions.push(
          'Isolate infected systems',
          'Run antivirus scan',
          'Block malicious domains',
          'Update signatures'
        );
        break;
      case 'intrusion':
        actions.push(
          'Change compromised credentials',
          'Review access logs',
          'Implement additional monitoring',
          'Notify affected users'
        );
        break;
      case 'data_breach':
        actions.push(
          'Assess data exposure',
          'Notify regulatory authorities',
          'Implement data protection measures',
          'Conduct security audit'
        );
        break;
      default:
        actions.push(
          'Investigate incident details',
          'Document findings',
          'Implement preventive measures',
          'Update incident response plan'
        );
    }

    return actions;
  }

  // Fallback scan when ML engine is unavailable
  fallbackScan(target) {
    return {
      target,
      scanId: Date.now(),
      workflows: [],
      status: 'completed',
      summary: {
        totalWorkflows: 0,
        executed: 0,
        failed: 0
      },
      note: 'ML engine unavailable, basic orchestration completed'
    };
  }

  // Integrate with external security stack
  async integrateWithSecurityStack(entityId, data) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log SOAR orchestration activities
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'SOAR_Orchestration_CL',
            data: {
              EntityId: entityId,
              OrchestrationType: data.orchestrationType || 'incident_response',
              Target: data.target,
              IncidentsProcessed: data.incidents?.length || 0,
              WorkflowsExecuted: data.workflows?.length || 0,
              AutomatedResponses: data.automatedResponses || 0,
              RiskLevel: data.riskLevel || 'medium',
              ScanId: data.scanId,
              Timestamp: new Date().toISOString(),
              Severity: data.severity || 'medium'
            }
          }).catch(err => console.error('Sentinel SOAR integration failed:', err))
        );
      }

      // Cortex XSOAR - Primary SOAR integration (bidirectional orchestration)
      if (connectors.xsoar) {
        // Sync incidents for orchestrated response
        if (data.incidents?.length > 0) {
          for (const incident of data.incidents) {
            integrationPromises.push(
              connectors.xsoar.orchestrateResponse({
                incidentId: incident.id,
                type: incident.type,
                severity: incident.severity,
                priority: incident.priority,
                actions: data.recommendations?.find(r => r.incidentId === incident.id)?.actions || [],
                entityId
              }).catch(err => console.error('XSOAR orchestration failed:', err))
            );
          }
        }

        // Execute automated workflows
        if (data.workflows?.length > 0) {
          for (const workflow of data.workflows) {
            integrationPromises.push(
              connectors.xsoar.executeWorkflow({
                workflowId: workflow.id || Date.now().toString(),
                name: workflow.name,
                steps: workflow.steps,
                incidentId: workflow.incidentId,
                automated: workflow.automated
              }).catch(err => console.error('XSOAR workflow execution failed:', err))
            );
          }
        }
      }

      // CrowdStrike - Execute containment actions as part of SOAR workflow
      if (connectors.crowdstrike && data.containmentActions) {
        integrationPromises.push(
          connectors.crowdstrike.executeContainment({
            entityId,
            actions: data.containmentActions,
            workflowId: data.workflowId,
            reason: 'SOAR orchestrated containment'
          }).catch(err => console.error('CrowdStrike SOAR integration failed:', err))
        );
      }

      // Cloudflare - Execute WAF updates as part of incident response
      if (connectors.cloudflare && data.wafUpdates) {
        integrationPromises.push(
          connectors.cloudflare.executeResponse({
            actions: data.wafUpdates,
            incidentId: entityId,
            source: 'SOAR_Engine'
          }).catch(err => console.error('Cloudflare SOAR integration failed:', err))
        );
      }

      // Kong - Execute API security responses
      if (connectors.kong && data.apiResponses) {
        integrationPromises.push(
          connectors.kong.executeSecurityResponse({
            actions: data.apiResponses,
            incidentId: entityId,
            source: 'SOAR_Engine'
          }).catch(err => console.error('Kong SOAR integration failed:', err))
        );
      }

      // Okta - Execute identity security responses
      if (connectors.okta && data.identityActions) {
        integrationPromises.push(
          connectors.okta.executeIdentityResponse({
            actions: data.identityActions,
            incidentId: entityId,
            source: 'SOAR_Engine'
          }).catch(err => console.error('Okta SOAR integration failed:', err))
        );
      }

      // OpenCTI - Update threat intelligence based on incident analysis
      if (connectors.opencti && data.threatUpdates) {
        for (const update of data.threatUpdates) {
          integrationPromises.push(
            connectors.opencti.updateIntelligence({
              type: 'incident_analysis',
              value: update.indicator,
              description: update.description,
              labels: ['soar', 'incident_response', update.type],
              confidence: update.confidence || 85,
              entityId
            }).catch(err => console.error('OpenCTI SOAR integration failed:', err))
          );
        }
      }

      // Execute all integrations in parallel
      await Promise.allSettled(integrationPromises);
      console.log(`SOAR Engine integration completed for entity ${entityId}`);

    } catch (error) {
      console.error('SOAR Engine security stack integration error:', error);
      // Don't throw - integration failures shouldn't break core functionality
    }
  }
}

module.exports = new SOAREngineService();