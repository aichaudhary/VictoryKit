/**
 * Incident Service
 * Business logic for incident operations
 */

const axios = require("axios");
const { getConnectors } = require('../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8011";

class IncidentService {
  /**
   * Analyze incident with AI/ML engine
   */
  async analyzeWithAI(incident) {
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/classify/incident`, {
        title: incident.title,
        description: incident.description,
        indicators: incident.indicators,
        affectedAssets: incident.affectedAssets,
        timeline: incident.timeline,
      });

      return response.data;
    } catch (error) {
      console.error("ML Engine error:", error.message);

      // Return basic classification if ML engine unavailable
      return this.basicClassification(incident);
    }
  }

  /**
   * Basic classification without ML
   */
  basicClassification(incident) {
    const title = incident.title.toLowerCase();
    const description = (incident.description || "").toLowerCase();
    const combined = `${title} ${description}`;

    let type = "other";
    let category = "Unknown";
    let techniques = [];

    // Simple keyword matching
    if (combined.includes("ransomware") || combined.includes("encrypt")) {
      type = "ransomware";
      category = "Impact";
      techniques = ["T1486"];
    } else if (
      combined.includes("phishing") ||
      combined.includes("credential")
    ) {
      type = "phishing";
      category = "Initial Access";
      techniques = ["T1566"];
    } else if (
      combined.includes("malware") ||
      combined.includes("virus") ||
      combined.includes("trojan")
    ) {
      type = "malware";
      category = "Execution";
      techniques = ["T1204"];
    } else if (
      combined.includes("data breach") ||
      combined.includes("exfiltration") ||
      combined.includes("leak")
    ) {
      type = "data_breach";
      category = "Exfiltration";
      techniques = ["T1041"];
    } else if (
      combined.includes("ddos") ||
      combined.includes("denial of service")
    ) {
      type = "ddos";
      category = "Impact";
      techniques = ["T1498"];
    } else if (combined.includes("insider") || combined.includes("employee")) {
      type = "insider_threat";
      category = "Initial Access";
      techniques = ["T1078"];
    } else if (
      combined.includes("apt") ||
      combined.includes("advanced persistent")
    ) {
      type = "apt";
      category = "Collection";
      techniques = ["T1005", "T1039"];
    }

    return {
      classification: {
        type,
        category,
        techniques,
        confidence: 70,
      },
      recommendations: this.getRecommendations(type),
      suggestedPlaybooks: this.getSuggestedPlaybooks(type),
    };
  }

  /**
   * Get recommendations based on incident type
   */
  getRecommendations(type) {
    const recommendations = {
      ransomware: [
        "Immediately isolate affected systems",
        "Preserve evidence before any recovery attempts",
        "Check backup integrity",
        "Contact legal and law enforcement",
        "Document all actions taken",
      ],
      phishing: [
        "Reset compromised credentials",
        "Block sender and malicious URLs",
        "Scan for lateral movement",
        "Alert potentially affected users",
        "Review email gateway logs",
      ],
      malware: [
        "Isolate infected endpoints",
        "Collect malware samples",
        "Run IOC sweep across environment",
        "Update antivirus signatures",
        "Analyze persistence mechanisms",
      ],
      data_breach: [
        "Identify scope of data exposure",
        "Preserve evidence",
        "Assess regulatory notification requirements",
        "Engage legal counsel",
        "Prepare breach notification",
      ],
      ddos: [
        "Enable DDoS mitigation",
        "Contact upstream provider",
        "Implement rate limiting",
        "Analyze attack vectors",
        "Prepare for potential secondary attacks",
      ],
      insider_threat: [
        "Preserve user activity logs",
        "Engage HR and legal",
        "Review access permissions",
        "Monitor for data exfiltration",
        "Document chain of evidence",
      ],
      apt: [
        "Engage threat intelligence team",
        "Conduct thorough environment sweep",
        "Assume widespread compromise",
        "Plan for extended investigation",
        "Consider external IR support",
      ],
      other: [
        "Gather additional information",
        "Assess impact and scope",
        "Identify affected assets",
        "Document timeline of events",
        "Escalate as needed",
      ],
    };

    return recommendations[type] || recommendations.other;
  }

  /**
   * Get suggested playbooks based on incident type
   */
  getSuggestedPlaybooks(type) {
    const playbooks = {
      ransomware: [
        "Ransomware Response",
        "Data Recovery",
        "Business Continuity",
      ],
      phishing: [
        "Phishing Response",
        "Credential Compromise",
        "Email Security",
      ],
      malware: ["Malware Containment", "Endpoint Investigation", "IOC Sweep"],
      data_breach: [
        "Data Breach Response",
        "Regulatory Notification",
        "Evidence Preservation",
      ],
      ddos: ["DDoS Mitigation", "Service Restoration", "Attack Analysis"],
      insider_threat: [
        "Insider Threat Response",
        "Evidence Collection",
        "HR Coordination",
      ],
      apt: ["APT Response", "Threat Hunting", "Extended Investigation"],
      other: ["General Incident Response"],
    };

    return playbooks[type] || playbooks.other;
  }

  // Integration with external security stack
  async integrateWithSecurityStack(incidentId, incidentData) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log incident response activities
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'IncidentResponse_CL',
            data: {
              IncidentId: incidentId,
              IncidentType: incidentData.type,
              Severity: incidentData.severity,
              Status: incidentData.status,
              AffectedAssets: incidentData.affectedAssets?.length || 0,
              IndicatorsCount: incidentData.indicators?.length || 0,
              Timestamp: new Date().toISOString(),
              Source: 'IncidentResponse'
            }
          }).catch(err => console.error('Sentinel integration failed:', err.message))
        );
      }

      // Cortex XSOAR - Create or update incident
      if (connectors.cortexXSOAR) {
        integrationPromises.push(
          connectors.cortexXSOAR.createIncident({
            name: `Security Incident - ${incidentId}`,
            type: incidentData.type,
            severity: incidentData.severity,
            details: {
              incidentId,
              type: incidentData.type,
              severity: incidentData.severity,
              status: incidentData.status,
              affectedAssets: incidentData.affectedAssets,
              indicators: incidentData.indicators
            }
          }).catch(err => console.error('XSOAR integration failed:', err.message))
        );
      }

      // CrowdStrike - Containment actions for endpoint incidents
      if (connectors.crowdstrike && incidentData.affectedAssets?.length > 0) {
        const containmentPromises = incidentData.affectedAssets.map(asset =>
          connectors.crowdstrike.containHost({
            hostId: asset,
            action: 'isolate'
          }).catch(err => console.error('CrowdStrike containment failed:', err.message))
        );
        integrationPromises.push(...containmentPromises);
      }

      // OpenCTI - Enrich with threat intelligence
      if (connectors.opencti && incidentData.indicators) {
        const tiPromises = incidentData.indicators.map(indicator =>
          connectors.opencti.searchIndicators({
            pattern: indicator.value,
            pattern_type: indicator.type
          }).catch(err => console.error('OpenCTI enrichment failed:', err.message))
        );
        integrationPromises.push(...tiPromises);
      }

      await Promise.allSettled(integrationPromises);
      console.log('IncidentResponse security stack integration completed');

    } catch (error) {
      console.error('IncidentResponse integration error:', error);
    }
  }
}

module.exports = new IncidentService();
