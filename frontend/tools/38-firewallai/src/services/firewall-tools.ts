/**
 * FirewallAI Function Tools
 * These functions are registered with the AI assistant to enable
 * natural language interaction with the FirewallAI system.
 */

import { firewallAPI } from './firewallAPI';
import { FirewallRule, TrafficLog, Alert, ThreatAnalysis } from '../types';

// Tool execution result type
interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  display?: {
    type: 'text' | 'table' | 'chart' | 'card' | 'form';
    content: any;
  };
}

// Tool function type
type ToolFunction = (params: Record<string, any>) => Promise<ToolResult>;

// Tool definitions for AI registration
export const FIREWALL_TOOLS = {
  analyze_traffic: {
    name: 'analyze_traffic',
    description: 'Analyze network traffic for security threats and anomalies. Returns traffic patterns, potential threats, and recommendations.',
    parameters: {
      type: 'object',
      properties: {
        time_range: {
          type: 'string',
          enum: ['5m', '15m', '1h', '6h', '24h', '7d'],
          description: 'Time range for traffic analysis'
        },
        protocol_filter: {
          type: 'string',
          enum: ['tcp', 'udp', 'icmp', 'http', 'https', 'all'],
          description: 'Filter by protocol'
        },
        source_ip: { type: 'string', description: 'Filter by source IP address' },
        destination_ip: { type: 'string', description: 'Filter by destination IP address' },
      },
    },
  },
  create_firewall_rule: {
    name: 'create_firewall_rule',
    description: 'Create a new firewall rule with AI optimization recommendations.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Rule name' },
        description: { type: 'string', description: 'Rule description' },
        action: {
          type: 'string',
          enum: ['allow', 'deny', 'reject', 'drop'],
          description: 'Rule action'
        },
        protocol: {
          type: 'string',
          enum: ['tcp', 'udp', 'icmp', 'all'],
          description: 'Protocol to match'
        },
        source_ip: { type: 'string', description: 'Source IP address or CIDR' },
        source_port: { type: 'number', description: 'Source port number' },
        destination_ip: { type: 'string', description: 'Destination IP address or CIDR' },
        destination_port: { type: 'number', description: 'Destination port number' },
        direction: {
          type: 'string',
          enum: ['inbound', 'outbound', 'both'],
          description: 'Traffic direction'
        },
      },
      required: ['name', 'action'],
    },
  },
  detect_intrusions: {
    name: 'detect_intrusions',
    description: 'Run intrusion detection analysis on network traffic.',
    parameters: {
      type: 'object',
      properties: {
        sensitivity: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Detection sensitivity level'
        },
        rule_set: {
          type: 'string',
          enum: ['comprehensive', 'targeted', 'minimal'],
          description: 'Intrusion detection rule set'
        },
      },
    },
  },
  generate_security_report: {
    name: 'generate_security_report',
    description: 'Generate comprehensive security analytics and threat reports.',
    parameters: {
      type: 'object',
      properties: {
        report_type: {
          type: 'string',
          enum: ['threat_summary', 'traffic_analysis', 'compliance', 'performance'],
          description: 'Type of security report'
        },
        time_period: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month'],
          description: 'Time period for the report'
        },
        format: {
          type: 'string',
          enum: ['summary', 'detailed', 'executive'],
          description: 'Report detail level'
        },
      },
      required: ['report_type'],
    },
  },
  optimize_rules: {
    name: 'optimize_rules',
    description: 'Analyze and optimize firewall rules for better performance and security.',
    parameters: {
      type: 'object',
      properties: {
        optimization_type: {
          type: 'string',
          enum: ['performance', 'security', 'consolidation', 'redundancy'],
          description: 'Type of optimization to perform'
        },
        rule_subset: {
          type: 'string',
          enum: ['all', 'recent', 'high_traffic'],
          description: 'Which rules to optimize'
        },
      },
    },
  },
  threat_intelligence: {
    name: 'threat_intelligence',
    description: 'Get latest threat intelligence and indicators of compromise.',
    parameters: {
      type: 'object',
      properties: {
        threat_type: {
          type: 'string',
          enum: ['malware', 'intrusion', 'dos', 'phishing', 'ransomware'],
          description: 'Type of threat intelligence'
        },
        source: {
          type: 'string',
          enum: ['all', 'internal', 'external', 'community'],
          description: 'Intelligence source'
        },
      },
    },
  },
  policy_compliance: {
    name: 'policy_compliance',
    description: 'Check firewall policies against compliance frameworks.',
    parameters: {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          enum: ['PCI_DSS', 'HIPAA', 'SOX', 'GDPR', 'NIST', 'ISO_27001', 'CIS'],
          description: 'Compliance framework to check against'
        },
        scope: {
          type: 'string',
          enum: ['all_policies', 'network_policies', 'access_policies'],
          description: 'Scope of compliance check'
        },
      },
      required: ['framework'],
    },
  },
};

// Tool execution functions
const toolFunctions: Record<string, ToolFunction> = {
  analyze_traffic: async (params) => {
    try {
      const logs = await firewallAPI.getTrafficLogs(params);
      const analysis = await firewallAPI.analyzeTraffic(logs);

      return {
        success: true,
        data: analysis,
        display: {
          type: 'chart',
          content: {
            title: 'Traffic Analysis Results',
            data: analysis,
            chartType: 'traffic_flow'
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Traffic analysis failed: ${error.message}`
      };
    }
  },

  create_firewall_rule: async (params) => {
    try {
      // AI optimization suggestions
      const suggestions = await firewallAPI.optimizeRule(params);

      const rule = await firewallAPI.createRule({
        ...params,
        ...suggestions,
        enabled: true
      });

      return {
        success: true,
        data: rule,
        display: {
          type: 'card',
          content: {
            title: 'Rule Created Successfully',
            rule: rule,
            suggestions: suggestions
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Rule creation failed: ${error.message}`
      };
    }
  },

  detect_intrusions: async (params) => {
    try {
      const results = await firewallAPI.runIntrusionDetection(params);

      return {
        success: true,
        data: results,
        display: {
          type: 'table',
          content: {
            title: 'Intrusion Detection Results',
            columns: ['timestamp', 'source_ip', 'threat_type', 'severity', 'action'],
            data: results.detections
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Intrusion detection failed: ${error.message}`
      };
    }
  },

  generate_security_report: async (params) => {
    try {
      const report = await firewallAPI.generateReport(params);

      return {
        success: true,
        data: report,
        display: {
          type: 'text',
          content: {
            title: `${params.report_type} Report`,
            content: report.summary,
            details: report.details
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Report generation failed: ${error.message}`
      };
    }
  },

  optimize_rules: async (params) => {
    try {
      const optimization = await firewallAPI.optimizeRules(params);

      return {
        success: true,
        data: optimization,
        display: {
          type: 'table',
          content: {
            title: 'Rule Optimization Results',
            columns: ['rule_id', 'optimization_type', 'impact', 'recommendation'],
            data: optimization.changes
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Rule optimization failed: ${error.message}`
      };
    }
  },

  threat_intelligence: async (params) => {
    try {
      const intelligence = await firewallAPI.getThreatIntelligence(params);

      return {
        success: true,
        data: intelligence,
        display: {
          type: 'table',
          content: {
            title: 'Threat Intelligence Feed',
            columns: ['indicator', 'type', 'severity', 'source', 'last_seen'],
            data: intelligence.indicators
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Threat intelligence retrieval failed: ${error.message}`
      };
    }
  },

  policy_compliance: async (params) => {
    try {
      const compliance = await firewallAPI.checkCompliance(params);

      return {
        success: true,
        data: compliance,
        display: {
          type: 'card',
          content: {
            title: `${params.framework} Compliance Check`,
            status: compliance.passing ? 'PASSING' : 'NEEDS_ATTENTION',
            score: compliance.score,
            issues: compliance.issues
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Compliance check failed: ${error.message}`
      };
    }
  },
};

// Execute a tool function
export async function executeTool(toolName: string, params: Record<string, any>): Promise<ToolResult> {
  const toolFunction = toolFunctions[toolName];
  if (!toolFunction) {
    return {
      success: false,
      error: `Tool '${toolName}' not found`
    };
  }

  return await toolFunction(params);
}

// Get tool definitions for AI registration
export function getToolDefinitions() {
  return Object.values(FIREWALL_TOOLS);
}
