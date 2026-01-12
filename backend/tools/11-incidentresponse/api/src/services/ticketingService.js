/**
 * Ticketing Integration Service
 * Real-world integrations for incident ticketing systems
 *
 * Integrates with: ServiceNow, Jira, PagerDuty
 */

const axios = require('axios');

class TicketingService {
  constructor() {
    // ServiceNow
    this.snowInstance = process.env.incidentcommand_SERVICENOW_INSTANCE;
    this.snowUsername = process.env.incidentcommand_SERVICENOW_USERNAME;
    this.snowPassword = process.env.incidentcommand_SERVICENOW_PASSWORD;
    this.snowApiKey = process.env.incidentcommand_SERVICENOW_API_KEY;

    // Jira
    this.jiraUrl = process.env.incidentcommand_JIRA_URL;
    this.jiraEmail = process.env.incidentcommand_JIRA_EMAIL;
    this.jiraApiToken = process.env.incidentcommand_JIRA_API_TOKEN;
    this.jiraProject = process.env.incidentcommand_JIRA_PROJECT_KEY;

    // PagerDuty (for on-call escalation)
    this.pdApiKey = process.env.incidentcommand_PAGERDUTY_API_KEY;
    this.pdServiceId = process.env.incidentcommand_PAGERDUTY_SERVICE_ID;
    this.pdEscalationPolicyId = process.env.incidentcommand_PAGERDUTY_ESCALATION_POLICY_ID;
  }

  /**
   * Create ticket in all configured systems
   */
  async createTicket(incident) {
    const results = {
      tickets: [],
      errors: [],
    };

    // ServiceNow
    if (this.snowInstance && (this.snowApiKey || (this.snowUsername && this.snowPassword))) {
      try {
        const ticket = await this.createServiceNowIncident(incident);
        results.tickets.push({ system: 'ServiceNow', ...ticket });
      } catch (error) {
        results.errors.push({ system: 'ServiceNow', error: error.message });
      }
    }

    // Jira
    if (this.jiraUrl && this.jiraEmail && this.jiraApiToken) {
      try {
        const ticket = await this.createJiraIssue(incident);
        results.tickets.push({ system: 'Jira', ...ticket });
      } catch (error) {
        results.errors.push({ system: 'Jira', error: error.message });
      }
    }

    // If no integrations configured, return simulated
    if (results.tickets.length === 0 && results.errors.length === 0) {
      return this.simulatedTicketCreation(incident);
    }

    return results;
  }

  /**
   * ServiceNow - Create Security Incident
   */
  async createServiceNowIncident(incident) {
    const auth = this.snowApiKey
      ? { headers: { Authorization: `Bearer ${this.snowApiKey}` } }
      : { auth: { username: this.snowUsername, password: this.snowPassword } };

    const severityMap = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
    };

    const payload = {
      short_description: incident.title,
      description: this.formatIncidentDescription(incident),
      category: 'Security',
      subcategory: incident.classification?.type || 'Security Incident',
      impact: severityMap[incident.severity] || 3,
      urgency: severityMap[incident.severity] || 3,
      caller_id: incident.reporter?.email || 'security-operations@company.com',
      assignment_group: 'Security Operations Center',
      u_security_incident_id: incident.incidentId,
      u_incident_type: incident.classification?.type,
      u_attack_vector: incident.classification?.attack_vector,
    };

    const response = await axios.post(
      `https://${this.snowInstance}.service-now.com/api/now/table/sn_si_incident`,
      payload,
      {
        ...auth,
        headers: {
          ...auth.headers,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return {
      ticketId: response.data.result.number,
      sysId: response.data.result.sys_id,
      url: `https://${this.snowInstance}.service-now.com/nav_to.do?uri=sn_si_incident.do?sys_id=${response.data.result.sys_id}`,
    };
  }

  /**
   * Jira - Create Security Issue
   */
  async createJiraIssue(incident) {
    const auth = Buffer.from(`${this.jiraEmail}:${this.jiraApiToken}`).toString('base64');

    const priorityMap = {
      critical: 'Highest',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };

    const payload = {
      fields: {
        project: { key: this.jiraProject },
        summary: `[${incident.severity.toUpperCase()}] ${incident.title}`,
        description: {
          version: 1,
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Security Incident Details' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: incident.description || 'No description provided' }],
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Incident Information' }],
            },
            {
              type: 'bulletList',
              content: [
                this.jiraListItem(`Incident ID: ${incident.incidentId}`),
                this.jiraListItem(`Severity: ${incident.severity}`),
                this.jiraListItem(`Status: ${incident.status}`),
                this.jiraListItem(`Category: ${incident.classification?.type || 'Unknown'}`),
                this.jiraListItem(`Affected Assets: ${incident.affectedAssets?.length || 0}`),
              ],
            },
          ],
        },
        issuetype: { name: 'Bug' }, // Or custom 'Security Incident' type
        priority: { name: priorityMap[incident.severity] || 'Medium' },
        labels: ['security-incident', incident.classification?.type || 'security'].filter(Boolean),
      },
    };

    const response = await axios.post(`${this.jiraUrl}/rest/api/3/issue`, payload, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return {
      ticketId: response.data.key,
      id: response.data.id,
      url: `${this.jiraUrl}/browse/${response.data.key}`,
    };
  }

  jiraListItem(text) {
    return {
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text }],
        },
      ],
    };
  }

  /**
   * PagerDuty - Create incident for on-call escalation
   */
  async createPagerDutyIncident(incident) {
    if (!this.pdApiKey) {
      return this.simulatedPagerDuty(incident);
    }

    try {
      const urgencyMap = {
        critical: 'high',
        high: 'high',
        medium: 'low',
        low: 'low',
      };

      const response = await axios.post(
        'https://api.pagerduty.com/incidents',
        {
          incident: {
            type: 'incident',
            title: `[${incident.severity.toUpperCase()}] ${incident.title}`,
            service: {
              id: this.pdServiceId,
              type: 'service_reference',
            },
            urgency: urgencyMap[incident.severity] || 'low',
            body: {
              type: 'incident_body',
              details: this.formatIncidentDescription(incident),
            },
            escalation_policy: this.pdEscalationPolicyId
              ? {
                  id: this.pdEscalationPolicyId,
                  type: 'escalation_policy_reference',
                }
              : undefined,
          },
        },
        {
          headers: {
            Authorization: `Token token=${this.pdApiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.pagerduty+json;version=2',
          },
        }
      );

      return {
        system: 'PagerDuty',
        incidentId: response.data.incident.id,
        incidentNumber: response.data.incident.incident_number,
        url: response.data.incident.html_url,
        status: response.data.incident.status,
      };
    } catch (error) {
      console.error('PagerDuty incident creation error:', error.message);
      throw error;
    }
  }

  /**
   * Update ticket status across systems
   */
  async updateTicketStatus(ticketRefs, status, comment) {
    const results = [];

    for (const ref of ticketRefs) {
      try {
        switch (ref.system.toLowerCase()) {
          case 'servicenow':
            await this.updateServiceNowIncident(ref.sysId, status, comment);
            results.push({ system: 'ServiceNow', ticketId: ref.ticketId, updated: true });
            break;
          case 'jira':
            await this.updateJiraIssue(ref.ticketId, status, comment);
            results.push({ system: 'Jira', ticketId: ref.ticketId, updated: true });
            break;
          case 'pagerduty':
            await this.updatePagerDutyIncident(ref.incidentId, status);
            results.push({ system: 'PagerDuty', ticketId: ref.incidentId, updated: true });
            break;
        }
      } catch (error) {
        results.push({
          system: ref.system,
          ticketId: ref.ticketId || ref.incidentId,
          error: error.message,
        });
      }
    }

    return results;
  }

  async updateServiceNowIncident(sysId, status, comment) {
    const auth = this.snowApiKey
      ? { headers: { Authorization: `Bearer ${this.snowApiKey}` } }
      : { auth: { username: this.snowUsername, password: this.snowPassword } };

    const stateMap = {
      open: 1,
      investigating: 2,
      containment: 3,
      eradication: 4,
      recovery: 5,
      resolved: 6,
      closed: 7,
    };

    await axios.patch(
      `https://${this.snowInstance}.service-now.com/api/now/table/sn_si_incident/${sysId}`,
      {
        state: stateMap[status] || 2,
        work_notes: comment,
      },
      auth
    );
  }

  async updateJiraIssue(issueKey, status, comment) {
    const auth = Buffer.from(`${this.jiraEmail}:${this.jiraApiToken}`).toString('base64');
    const headers = { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' };

    // Add comment
    if (comment) {
      await axios.post(
        `${this.jiraUrl}/rest/api/3/issue/${issueKey}/comment`,
        {
          body: {
            version: 1,
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: `Status Update: ${status}\n\n${comment}` }],
              },
            ],
          },
        },
        { headers }
      );
    }

    // Transition would require getting available transitions first
    // This is simplified - in production, map status to transition ID
  }

  async updatePagerDutyIncident(incidentId, status) {
    const statusMap = {
      resolved: 'resolved',
      closed: 'resolved',
      acknowledged: 'acknowledged',
    };

    if (statusMap[status]) {
      await axios.put(
        `https://api.pagerduty.com/incidents/${incidentId}`,
        {
          incident: {
            type: 'incident',
            status: statusMap[status],
          },
        },
        {
          headers: {
            Authorization: `Token token=${this.pdApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  /**
   * Sync incident status from tickets
   */
  async syncTicketStatus(ticketRefs) {
    const statuses = [];

    for (const ref of ticketRefs) {
      try {
        let status;
        switch (ref.system.toLowerCase()) {
          case 'servicenow':
            status = await this.getServiceNowStatus(ref.sysId);
            break;
          case 'jira':
            status = await this.getJiraStatus(ref.ticketId);
            break;
          case 'pagerduty':
            status = await this.getPagerDutyStatus(ref.incidentId);
            break;
        }
        if (status) {
          statuses.push({ system: ref.system, ticketId: ref.ticketId || ref.incidentId, status });
        }
      } catch (error) {
        console.error(`Failed to sync ${ref.system} status:`, error.message);
      }
    }

    return statuses;
  }

  // ============= Helper Methods =============

  formatIncidentDescription(incident) {
    return `
SECURITY INCIDENT: ${incident.incidentId}
================================

SEVERITY: ${incident.severity.toUpperCase()}
STATUS: ${incident.status}
CATEGORY: ${incident.classification?.type || 'Unknown'}

DESCRIPTION:
${incident.description || 'No description provided'}

AFFECTED ASSETS:
${incident.affectedAssets?.map((a) => `- ${a.hostname || a.assetId} (${a.type})`).join('\n') || 'None recorded'}

INDICATORS OF COMPROMISE:
${incident.indicators?.map((i) => `- [${i.type}] ${i.value}`).join('\n') || 'None recorded'}

RESPONSE ACTIONS:
${
  incident.timeline
    ?.filter((t) => t.type === 'action')
    .map((t) => `- ${t.event}`)
    .join('\n') || 'No actions recorded'
}

---
Generated by VictoryKit incidentcommand
    `.trim();
  }

  // ============= Simulated Responses =============

  simulatedTicketCreation(incident) {
    const ticketNum = Math.floor(100000 + Math.random() * 900000);
    return {
      tickets: [
        {
          system: 'Simulated ServiceNow',
          ticketId: `INC${ticketNum}`,
          sysId: `sim-${Date.now()}`,
          url: `https://example.service-now.com/incident/${ticketNum}`,
        },
        {
          system: 'Simulated Jira',
          ticketId: `SEC-${ticketNum}`,
          id: `sim-${Date.now() + 1}`,
          url: `https://example.atlassian.net/browse/SEC-${ticketNum}`,
        },
      ],
      errors: [],
      simulated: true,
    };
  }

  simulatedPagerDuty(incident) {
    return {
      system: 'Simulated PagerDuty',
      incidentId: `P-${Date.now()}`,
      incidentNumber: Math.floor(1000 + Math.random() * 9000),
      url: 'https://example.pagerduty.com/incidents/P123456',
      status: 'triggered',
      simulated: true,
    };
  }
}

module.exports = new TicketingService();
