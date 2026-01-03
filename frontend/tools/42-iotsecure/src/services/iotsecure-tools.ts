/**
 * IoTSecure AI Tools - Function Definitions for AI Agent
 * These tools enable the AI to interact with IoT security operations
 */

import { iotSecureAPI } from './iotSecureAPI';

// Tool definitions for AI function calling
export const iotSecureTools = [
  {
    type: "function",
    function: {
      name: "discover_devices",
      description: "Scan the network to discover IoT devices. Use this to find new devices on the network.",
      parameters: {
        type: "object",
        properties: {
          networks: {
            type: "array",
            items: { type: "string" },
            description: "Network subnets to scan (e.g., ['192.168.1.0/24'])"
          },
          quick: {
            type: "boolean",
            description: "If true, perform a quick discovery scan"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_device_inventory",
      description: "Get a list of all discovered IoT devices with their status and risk levels.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["online", "offline", "degraded", "quarantined"],
            description: "Filter by device status"
          },
          riskLevel: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
            description: "Filter by risk level"
          },
          type: {
            type: "string",
            description: "Filter by device type (camera, thermostat, sensor, etc.)"
          },
          limit: {
            type: "number",
            description: "Maximum number of devices to return"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_device",
      description: "Get detailed security analysis of a specific IoT device.",
      parameters: {
        type: "object",
        properties: {
          deviceId: {
            type: "string",
            description: "The ID of the device to analyze"
          }
        },
        required: ["deviceId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "scan_vulnerabilities",
      description: "Run a vulnerability scan on devices or the entire network.",
      parameters: {
        type: "object",
        properties: {
          deviceIds: {
            type: "array",
            items: { type: "string" },
            description: "Specific device IDs to scan (optional, scans all if empty)"
          },
          scanType: {
            type: "string",
            enum: ["quick", "full", "vulnerability", "compliance"],
            description: "Type of scan to perform"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_vulnerabilities",
      description: "Get list of discovered vulnerabilities with severity and status.",
      parameters: {
        type: "object",
        properties: {
          severity: {
            type: "string",
            enum: ["info", "low", "medium", "high", "critical"],
            description: "Filter by severity level"
          },
          status: {
            type: "string",
            enum: ["open", "in_progress", "mitigated", "resolved"],
            description: "Filter by status"
          },
          exploitable: {
            type: "boolean",
            description: "Filter for exploitable vulnerabilities only"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_cve",
      description: "Search for CVE information from the NVD database.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (CVE ID, vendor name, or product)"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_alerts",
      description: "Get security alerts with filtering options.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["new", "acknowledged", "investigating", "resolved"],
            description: "Filter by alert status"
          },
          severity: {
            type: "string",
            enum: ["info", "low", "medium", "high", "critical"],
            description: "Filter by severity"
          },
          type: {
            type: "string",
            description: "Filter by alert type (device_offline, new_device, etc.)"
          },
          limit: {
            type: "number",
            description: "Maximum number of alerts to return"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "acknowledge_alert",
      description: "Acknowledge a security alert to indicate it's being reviewed.",
      parameters: {
        type: "object",
        properties: {
          alertId: {
            type: "string",
            description: "The ID of the alert to acknowledge"
          }
        },
        required: ["alertId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "resolve_alert",
      description: "Mark an alert as resolved with a resolution description.",
      parameters: {
        type: "object",
        properties: {
          alertId: {
            type: "string",
            description: "The ID of the alert to resolve"
          },
          resolution: {
            type: "string",
            description: "Description of how the alert was resolved"
          }
        },
        required: ["alertId", "resolution"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "quarantine_device",
      description: "Quarantine a device to isolate it from the network for security reasons.",
      parameters: {
        type: "object",
        properties: {
          deviceId: {
            type: "string",
            description: "The ID of the device to quarantine"
          },
          reason: {
            type: "string",
            description: "Reason for quarantine"
          }
        },
        required: ["deviceId", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_network_topology",
      description: "Get the network topology showing segments and device connections.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_segment",
      description: "Create a new network segment for device isolation.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the segment"
          },
          type: {
            type: "string",
            enum: ["production", "development", "iot", "guest", "quarantine", "critical_infrastructure"],
            description: "Type of segment"
          },
          securityLevel: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
            description: "Security level of the segment"
          },
          subnet: {
            type: "string",
            description: "Network subnet (e.g., 192.168.10.0/24)"
          }
        },
        required: ["name", "type", "securityLevel"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_firewall_rule",
      description: "Add a firewall rule to a network segment.",
      parameters: {
        type: "object",
        properties: {
          segmentId: {
            type: "string",
            description: "The ID of the segment"
          },
          name: {
            type: "string",
            description: "Name of the rule"
          },
          action: {
            type: "string",
            enum: ["allow", "deny", "log"],
            description: "Rule action"
          },
          direction: {
            type: "string",
            enum: ["inbound", "outbound", "both"],
            description: "Traffic direction"
          },
          protocol: {
            type: "string",
            enum: ["tcp", "udp", "icmp", "any"],
            description: "Network protocol"
          },
          destinationPorts: {
            type: "string",
            description: "Destination ports (e.g., '80,443' or '1-1024')"
          }
        },
        required: ["segmentId", "name", "action", "direction"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_firmware",
      description: "Analyze firmware for security vulnerabilities.",
      parameters: {
        type: "object",
        properties: {
          firmwareId: {
            type: "string",
            description: "The ID of the firmware to analyze"
          }
        },
        required: ["firmwareId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_firmware_list",
      description: "Get list of all firmware in inventory with analysis status.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["pending_analysis", "analyzing", "analyzed", "failed"],
            description: "Filter by analysis status"
          },
          hasVulnerabilities: {
            type: "boolean",
            description: "Filter for firmware with vulnerabilities"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_baseline",
      description: "Create a behavioral baseline for a device to detect anomalies.",
      parameters: {
        type: "object",
        properties: {
          deviceId: {
            type: "string",
            description: "The device ID to create baseline for"
          },
          learningPeriod: {
            type: "number",
            description: "Learning period in days (default: 7)"
          }
        },
        required: ["deviceId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "detect_anomalies",
      description: "Check for behavioral anomalies across devices.",
      parameters: {
        type: "object",
        properties: {
          hours: {
            type: "number",
            description: "Look back period in hours (default: 24)"
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
            description: "Filter by anomaly severity"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_dashboard_overview",
      description: "Get the main dashboard overview with key metrics and risk score.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_risk_breakdown",
      description: "Get detailed risk score breakdown with recommendations.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_compliance_status",
      description: "Get compliance status for security frameworks (PCI-DSS, HIPAA, GDPR, ISO 27001).",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "shodan_lookup",
      description: "Look up an IP address in Shodan for external exposure information.",
      parameters: {
        type: "object",
        properties: {
          ip: {
            type: "string",
            description: "The IP address to look up"
          }
        },
        required: ["ip"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "export_report",
      description: "Generate and export a security report.",
      parameters: {
        type: "object",
        properties: {
          reportType: {
            type: "string",
            enum: ["executive", "technical", "compliance", "vulnerability", "inventory"],
            description: "Type of report to generate"
          },
          format: {
            type: "string",
            enum: ["pdf", "json", "csv"],
            description: "Export format"
          },
          dateRange: {
            type: "object",
            properties: {
              start: { type: "string", description: "Start date (ISO format)" },
              end: { type: "string", description: "End date (ISO format)" }
            },
            description: "Date range for the report"
          }
        },
        required: ["reportType"]
      }
    }
  }
];

// Function execution handlers
export async function executeIoTSecureTool(name: string, args: Record<string, any>): Promise<any> {
  try {
    switch (name) {
      // Device operations
      case 'discover_devices':
        if (args.quick) {
          return await iotSecureAPI.scans.startQuick(args.networks);
        }
        return await iotSecureAPI.scans.startDiscovery(args.networks || ['192.168.0.0/16']);

      case 'get_device_inventory':
        return await iotSecureAPI.devices.getAll(args);

      case 'analyze_device':
        return await iotSecureAPI.devices.getById(args.deviceId);

      case 'quarantine_device':
        return await iotSecureAPI.devices.quarantine(args.deviceId, args.reason);

      // Vulnerability operations
      case 'scan_vulnerabilities':
        if (args.deviceIds?.length) {
          return await iotSecureAPI.scans.startVulnerability(args.deviceIds);
        }
        return await iotSecureAPI.scans.startQuick();

      case 'get_vulnerabilities':
        return await iotSecureAPI.vulnerabilities.getAll(args);

      case 'search_cve':
        return await iotSecureAPI.vulnerabilities.searchNVD(args.query);

      // Alert operations
      case 'get_alerts':
        return await iotSecureAPI.alerts.getAll(args);

      case 'acknowledge_alert':
        return await iotSecureAPI.alerts.acknowledge(args.alertId);

      case 'resolve_alert':
        return await iotSecureAPI.alerts.resolve(args.alertId, args.resolution);

      // Network operations
      case 'get_network_topology':
        return await iotSecureAPI.segments.getTopology();

      case 'create_segment':
        return await iotSecureAPI.segments.create({
          name: args.name,
          type: args.type,
          securityLevel: args.securityLevel,
          network: args.subnet ? { subnet: args.subnet } : undefined
        });

      case 'add_firewall_rule':
        return await iotSecureAPI.segments.addFirewallRule(args.segmentId, {
          name: args.name,
          action: args.action,
          direction: args.direction,
          protocol: args.protocol || 'any',
          destinationPorts: args.destinationPorts
        });

      // Firmware operations
      case 'analyze_firmware':
        return await iotSecureAPI.firmware.analyze(args.firmwareId);

      case 'get_firmware_list':
        return await iotSecureAPI.firmware.getAll(args);

      // Baseline operations
      case 'create_baseline':
        return await iotSecureAPI.baselines.create({
          device: args.deviceId,
          config: { learningPeriod: args.learningPeriod || 7 }
        });

      case 'detect_anomalies':
        return await iotSecureAPI.baselines.getAnomalies(args.hours || 24);

      // Dashboard operations
      case 'get_dashboard_overview':
        return await iotSecureAPI.dashboard.getOverview();

      case 'get_risk_breakdown':
        return await iotSecureAPI.dashboard.getRiskScore();

      case 'get_compliance_status':
        return await iotSecureAPI.dashboard.getCompliance();

      // Integration operations
      case 'shodan_lookup':
        return await iotSecureAPI.integrations.shodanLookup(args.ip);

      case 'export_report':
        // Return mock report data for now
        return {
          success: true,
          data: {
            reportType: args.reportType,
            format: args.format || 'pdf',
            generatedAt: new Date().toISOString(),
            downloadUrl: `#report-${args.reportType}-${Date.now()}`
          }
        };

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Tool execution failed' };
  }
}

export default iotSecureTools;
