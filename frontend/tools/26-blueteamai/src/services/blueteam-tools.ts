// BlueTeamAI Tool Definitions for AI Function Calling
import { SecurityAlert, Incident, ThreatHunt, IOC, MitreTechnique } from '../types';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export const BLUETEAM_TOOLS: ToolDefinition[] = [
  {
    name: 'analyze_alert',
    description: 'Analyze a security alert for threat indicators, severity assessment, and recommended actions',
    parameters: {
      type: 'object',
      properties: {
        alert_id: { type: 'string', description: 'The ID of the alert to analyze' },
        include_ioc_enrichment: { type: 'boolean', description: 'Whether to enrich IOCs with threat intel' },
        map_mitre: { type: 'boolean', description: 'Whether to map to MITRE ATT&CK techniques' }
      },
      required: ['alert_id']
    }
  },
  {
    name: 'investigate_incident',
    description: 'Conduct deep investigation of a security incident, building timeline and identifying root cause',
    parameters: {
      type: 'object',
      properties: {
        incident_id: { type: 'string', description: 'The ID of the incident to investigate' },
        investigation_scope: { 
          type: 'string', 
          enum: ['full', 'quick', 'timeline_only', 'ioc_only'],
          description: 'Scope of investigation'
        }
      },
      required: ['incident_id']
    }
  },
  {
    name: 'run_threat_hunt',
    description: 'Execute a threat hunting query across security data sources',
    parameters: {
      type: 'object',
      properties: {
        hypothesis: { type: 'string', description: 'The threat hypothesis to hunt for' },
        query_type: { 
          type: 'string', 
          enum: ['ioc_search', 'behavior_pattern', 'anomaly_detection', 'mitre_technique'],
          description: 'Type of hunt query'
        },
        data_sources: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Data sources to search (siem, edr, network, cloud)'
        },
        indicators: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific indicators to hunt for'
        },
        time_range: { type: 'string', description: 'Time range for the hunt (e.g., "24h", "7d")' }
      },
      required: ['hypothesis', 'query_type']
    }
  },
  {
    name: 'get_mitre_mapping',
    description: 'Map observed techniques and behaviors to MITRE ATT&CK framework',
    parameters: {
      type: 'object',
      properties: {
        technique_ids: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'MITRE technique IDs to look up (e.g., T1059.001)'
        },
        behaviors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Observed behaviors to map to techniques'
        },
        include_mitigations: { type: 'boolean', description: 'Include mitigation recommendations' }
      },
      required: []
    }
  },
  {
    name: 'create_timeline',
    description: 'Generate a chronological timeline of events for an incident',
    parameters: {
      type: 'object',
      properties: {
        incident_id: { type: 'string', description: 'The incident ID to create timeline for' },
        alert_ids: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Related alert IDs to include'
        },
        start_time: { type: 'string', description: 'Timeline start (ISO 8601)' },
        end_time: { type: 'string', description: 'Timeline end (ISO 8601)' }
      },
      required: ['incident_id']
    }
  },
  {
    name: 'execute_playbook',
    description: 'Execute an automated response playbook for incident response',
    parameters: {
      type: 'object',
      properties: {
        playbook_id: { type: 'string', description: 'The playbook to execute' },
        incident_id: { type: 'string', description: 'Associated incident ID' },
        parameters: { type: 'object', description: 'Playbook execution parameters' },
        auto_approve: { type: 'boolean', description: 'Auto-approve all steps' }
      },
      required: ['playbook_id']
    }
  },
  {
    name: 'correlate_iocs',
    description: 'Cross-reference IOCs with threat intelligence sources',
    parameters: {
      type: 'object',
      properties: {
        iocs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['ip', 'domain', 'hash', 'url', 'email'] },
              value: { type: 'string' }
            }
          },
          description: 'List of IOCs to correlate'
        },
        sources: {
          type: 'array',
          items: { type: 'string' },
          description: 'Threat intel sources to query'
        }
      },
      required: ['iocs']
    }
  },
  {
    name: 'generate_report',
    description: 'Generate a comprehensive security report',
    parameters: {
      type: 'object',
      properties: {
        report_type: { 
          type: 'string', 
          enum: ['incident', 'threat_hunt', 'daily_summary', 'executive'],
          description: 'Type of report to generate'
        },
        entity_id: { type: 'string', description: 'ID of incident or hunt for the report' },
        format: { type: 'string', enum: ['pdf', 'html', 'markdown'], description: 'Output format' },
        include_sections: {
          type: 'array',
          items: { type: 'string' },
          description: 'Sections to include (summary, timeline, iocs, mitre, recommendations)'
        }
      },
      required: ['report_type', 'format']
    }
  }
];

// Tool execution handler
export async function executeTool(
  name: string, 
  args: Record<string, any>
): Promise<any> {
  console.log(`Executing BlueTeam tool: ${name}`, args);
  
  // Tool implementations would connect to backend APIs
  switch (name) {
    case 'analyze_alert':
      return { 
        status: 'success',
        analysis: {
          severity_assessment: 'high',
          threat_type: 'credential_attack',
          confidence: 85,
          recommended_actions: ['Isolate host', 'Reset credentials', 'Review logs']
        }
      };
      
    case 'investigate_incident':
      return {
        status: 'success',
        investigation: {
          root_cause: 'Phishing email led to credential compromise',
          affected_systems: 3,
          iocs_found: 5,
          mitre_techniques: ['T1078', 'T1059.001']
        }
      };
      
    case 'run_threat_hunt':
      return {
        status: 'success',
        hunt_id: `hunt_${Date.now()}`,
        matches: [],
        message: 'Threat hunt initiated'
      };
      
    default:
      return { status: 'error', message: `Unknown tool: ${name}` };
  }
}

export function getToolDefinitions(): ToolDefinition[] {
  return BLUETEAM_TOOLS;
}
