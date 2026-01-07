/**
 * FirewallAI Assistant Server
 * Provides WebSocket access to Gemini for firewall policy guidance and automation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { executeFirewallAIFunction } from './functionExecutor.js';

dotenv.config();

const PORT = process.env.PORT || 6038;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

const functions = [
  {
    name: 'analyze_traffic_pattern',
    description: 'Detect anomalies in network traffic patterns and surface likely threats',
    parameters: {
      type: 'object',
      properties: {
        timeRange: { type: 'string', description: 'Time range for analysis' },
        segments: { type: 'array', items: { type: 'string' }, description: 'Network segments to include' },
        threshold: { type: 'number', description: 'Anomaly score threshold' },
        includeBaselines: { type: 'boolean', description: 'Include historical baselines' }
      },
      required: ['timeRange']
    }
  },
  {
    name: 'generate_firewall_policy',
    description: 'Generate firewall policies based on business context, assets, and risk appetite',
    parameters: {
      type: 'object',
      properties: {
        assets: { type: 'array', description: 'Assets and services to protect' },
        riskLevel: { type: 'string', description: 'Risk tolerance (low, medium, high)' },
        controls: { type: 'array', description: 'Required controls or standards' },
        changeWindow: { type: 'string', description: 'Maintenance window for applying changes' }
      },
      required: ['assets', 'riskLevel']
    }
  },
  {
    name: 'simulate_rule_change',
    description: 'Simulate impact of rule changes on traffic, availability, and risk',
    parameters: {
      type: 'object',
      properties: {
        rules: { type: 'array', description: 'Proposed rule changes' },
        trafficProfile: { type: 'object', description: 'Observed traffic profile' },
        blastRadius: { type: 'string', description: 'Scope of change impact' },
        rollbackPlan: { type: 'string', description: 'Rollback approach' }
      },
      required: ['rules', 'trafficProfile']
    }
  },
  {
    name: 'detect_intrusion_campaign',
    description: 'Correlate multi-stage intrusion patterns and suggest mitigations',
    parameters: {
      type: 'object',
      properties: {
        events: { type: 'array', description: 'Recent security events' },
        timeHorizon: { type: 'string', description: 'Time horizon for correlation' },
        includeMITRE: { type: 'boolean', description: 'Map to MITRE ATT&CK' },
        sensitivity: { type: 'string', description: 'Detection sensitivity (low, medium, high)' }
      },
      required: ['events', 'timeHorizon']
    }
  },
  {
    name: 'recommend_microsegmentation',
    description: 'Design microsegmentation policies based on asset relationships and data flows',
    parameters: {
      type: 'object',
      properties: {
        assets: { type: 'array', description: 'Inventory of assets' },
        flows: { type: 'array', description: 'Observed data flows' },
        sensitivityTags: { type: 'array', description: 'Sensitivity tags for assets' },
        guardrails: { type: 'array', description: 'Non-functional guardrails' }
      },
      required: ['assets', 'flows']
    }
  },
  {
    name: 'optimize_waf_rules',
    description: 'Tune WAF signatures and thresholds to reduce false positives and block exploits',
    parameters: {
      type: 'object',
      properties: {
        application: { type: 'string', description: 'Application or API name' },
        attackVectors: { type: 'array', items: { type: 'string' }, description: 'Attack vectors to prioritize' },
        falsePositivePatterns: { type: 'array', description: 'Known false positive patterns' },
        performanceBudget: { type: 'number', description: 'Latency budget in ms' }
      },
      required: ['application']
    }
  },
  {
    name: 'generate_incident_runbook',
    description: 'Create step-by-step containment and recovery runbooks for detected incidents',
    parameters: {
      type: 'object',
      properties: {
        incidentType: { type: 'string', description: 'Type of incident' },
        severity: { type: 'string', description: 'Incident severity' },
        affectedAssets: { type: 'array', description: 'Assets impacted' },
        dependencies: { type: 'array', description: 'Critical dependencies' }
      },
      required: ['incidentType', 'severity', 'affectedAssets']
    }
  },
  {
    name: 'enrich_threat_intel',
    description: 'Enrich alerts with threat intelligence, exploit paths, and recommended blocks',
    parameters: {
      type: 'object',
      properties: {
        indicator: { type: 'string', description: 'Indicator value' },
        indicatorType: { type: 'string', description: 'Type of indicator (ip, domain, url, hash)' },
        sources: { type: 'array', description: 'Intel sources to query' },
        confidenceFloor: { type: 'number', description: 'Minimum confidence threshold' }
      },
      required: ['indicator', 'indicatorType']
    }
  },
  {
    name: 'assess_compliance_gap',
    description: 'Assess firewall controls against compliance frameworks and highlight gaps',
    parameters: {
      type: 'object',
      properties: {
        framework: { type: 'string', description: 'Compliance framework to assess' },
        controls: { type: 'array', description: 'Implemented controls' },
        evidence: { type: 'array', description: 'Evidence artifacts' },
        exceptions: { type: 'array', description: 'Documented exceptions' }
      },
      required: ['framework', 'controls']
    }
  },
  {
    name: 'forecast_capacity',
    description: 'Forecast firewall and WAF capacity needs based on traffic growth and attack trends',
    parameters: {
      type: 'object',
      properties: {
        currentUtilization: { type: 'object', description: 'Current utilization metrics' },
        growthRate: { type: 'number', description: 'Projected growth rate' },
        seasonality: { type: 'array', description: 'Seasonal patterns' },
        attackPatterns: { type: 'array', description: 'Known attack patterns' }
      },
      required: ['currentUtilization', 'growthRate']
    }
  }
];

const wss = new WebSocketServer({ port: PORT });

console.log(`🧱 FirewallAI Assistant running on port ${PORT}`);

/**
 * FirewallAI Assistant Server
 * Provides WebSocket access to Gemini for firewall policy guidance and automation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { executeFirewallAIFunction } from './functionExecutor.js';

dotenv.config();

const PORT = process.env.PORT || 6038;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

const functions = [
  {
    name: 'analyze_traffic_pattern',
    description: 'Detect anomalies in network traffic patterns and surface likely threats',
    parameters: {
      type: 'object',
      properties: {
        timeRange: { type: 'string', description: 'Time range for analysis' },
        segments: { type: 'array', items: { type: 'string' }, description: 'Network segments to include' },
        threshold: { type: 'number', description: 'Anomaly score threshold' },
        includeBaselines: { type: 'boolean', description: 'Include historical baselines' }
      },
      required: ['timeRange']
    }
  },
  {
    name: 'generate_firewall_policy',
    description: 'Generate firewall policies based on business context, assets, and risk appetite',
    parameters: {
      type: 'object',
      properties: {
        assets: { type: 'array', description: 'Assets and services to protect' },
        riskLevel: { type: 'string', description: 'Risk tolerance (low, medium, high)' },
        controls: { type: 'array', description: 'Required controls or standards' },
        changeWindow: { type: 'string', description: 'Maintenance window for applying changes' }
      },
      required: ['assets', 'riskLevel']
    }
  },
  {
    name: 'simulate_rule_change',
    description: 'Simulate impact of rule changes on traffic, availability, and risk',
    parameters: {
      type: 'object',
      properties: {
        rules: { type: 'array', description: 'Proposed rule changes' },
        trafficProfile: { type: 'object', description: 'Observed traffic profile' },
        blastRadius: { type: 'string', description: 'Scope of change impact' },
        rollbackPlan: { type: 'string', description: 'Rollback approach' }
      },
      required: ['rules', 'trafficProfile']
    }
  },
  {
    name: 'detect_intrusion_campaign',
    description: 'Correlate multi-stage intrusion patterns and suggest mitigations',
    parameters: {
      type: 'object',
      properties: {
        events: { type: 'array', description: 'Recent security events' },
        timeHorizon: { type: 'string', description: 'Time horizon for correlation' },
        includeMITRE: { type: 'boolean', description: 'Map to MITRE ATT&CK' },
        sensitivity: { type: 'string', description: 'Detection sensitivity (low, medium, high)' }
      },
      required: ['events', 'timeHorizon']
    }
  },
  {
    name: 'recommend_microsegmentation',
    description: 'Design microsegmentation policies based on asset relationships and data flows',
    parameters: {
      type: 'object',
      properties: {
        assets: { type: 'array', description: 'Inventory of assets' },
        flows: { type: 'array', description: 'Observed data flows' },
        sensitivityTags: { type: 'array', description: 'Sensitivity tags for assets' },
        guardrails: { type: 'array', description: 'Non-functional guardrails' }
      },
      required: ['assets', 'flows']
    }
  },
  {
    name: 'optimize_waf_rules',
    description: 'Tune WAF signatures and thresholds to reduce false positives and block exploits',
    parameters: {
      type: 'object',
      properties: {
        application: { type: 'string', description: 'Application or API name' },
        attackVectors: { type: 'array', items: { type: 'string' }, description: 'Attack vectors to prioritize' },
        falsePositivePatterns: { type: 'array', description: 'Known false positive patterns' },
        performanceBudget: { type: 'number', description: 'Latency budget in ms' }
      },
      required: ['application']
    }
  },
  {
    name: 'generate_incident_runbook',
    description: 'Create step-by-step containment and recovery runbooks for detected incidents',
    parameters: {
      type: 'object',
      properties: {
        incidentType: { type: 'string', description: 'Type of incident' },
        severity: { type: 'string', description: 'Incident severity' },
        affectedAssets: { type: 'array', description: 'Assets impacted' },
        dependencies: { type: 'array', description: 'Critical dependencies' }
      },
      required: ['incidentType', 'severity', 'affectedAssets']
    }
  },
  {
    name: 'enrich_threat_intel',
    description: 'Enrich alerts with threat intelligence, exploit paths, and recommended blocks',
    parameters: {
      type: 'object',
      properties: {
        indicator: { type: 'string', description: 'Indicator value' },
        indicatorType: { type: 'string', description: 'Type of indicator (ip, domain, url, hash)' },
        sources: { type: 'array', description: 'Intel sources to query' },
        confidenceFloor: { type: 'number', description: 'Minimum confidence threshold' }
      },
      required: ['indicator', 'indicatorType']
    }
  },
  {
    name: 'assess_compliance_gap',
    description: 'Assess firewall controls against compliance frameworks and highlight gaps',
    parameters: {
      type: 'object',
      properties: {
        framework: { type: 'string', description: 'Compliance framework to assess' },
        controls: { type: 'array', description: 'Implemented controls' },
        evidence: { type: 'array', description: 'Evidence artifacts' },
        exceptions: { type: 'array', description: 'Documented exceptions' }
      },
      required: ['framework', 'controls']
    }
  },
  {
    name: 'forecast_capacity',
    description: 'Forecast firewall and WAF capacity needs based on traffic growth and attack trends',
    parameters: {
      type: 'object',
      properties: {
        currentUtilization: { type: 'object', description: 'Current utilization metrics' },
        growthRate: { type: 'number', description: 'Projected growth rate' },
        seasonality: { type: 'array', description: 'Seasonal patterns' },
        attackPatterns: { type: 'array', description: 'Known attack patterns' }
      },
      required: ['currentUtilization', 'growthRate']
    }
  }
];

const wss = new WebSocketServer({ port: PORT });

console.log(`🧱 FirewallAI Assistant running on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('🔌 Client connected to FirewallAI');

  const chat = model.startChat({
    tools: [{ functionDeclarations: functions }],
    history: []
  });

  ws.on('message', async (message) => {
    try {
      const { type, content, functionName, parameters } = JSON.parse(message);

      if (type === 'function_call') {
        const result = await executeFirewallAIFunction(functionName, parameters);
        ws.send(JSON.stringify({
          type: 'function_result',
          functionName,
          result
        }));
      } else {
        const result = await chat.sendMessage(content);
        const response = result.response;

        const functionCall = response.functionCalls()?.[0];

        if (functionCall) {
          const { name, args } = functionCall;
          const parsedArgs = JSON.parse(args || '{}');
          const functionResult = await executeFirewallAIFunction(name, parsedArgs);

          ws.send(JSON.stringify({
            type: 'function_result',
            functionName: name,
            result: functionResult
          }));
        }

        const text = response.text();
        ws.send(JSON.stringify({
          type: 'ai_response',
          content: text
        }));
      }
    } catch (error) {
      console.error('AI processing error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('👋 Client disconnected from FirewallAI');
  });
});
  console.log('🔌 Client connected to FirewallAI');

  const chat = model.startChat({
    tools: [{ functionDeclarations: functions }],
    history: []
  });

  ws.on('message', async (message) => {
    try {
      const { type, content, functionName, parameters } = JSON.parse(message);

      if (type === 'function_call') {
        const result = await executeFirewallAIFunction(functionName, parameters);
        ws.send(JSON.stringify({
          type: 'function_result',
          functionName,
          result
+        }));
+      } else {
+        const result = await chat.sendMessage(content);
+        const response = result.response;
+
+        const functionCall = response.functionCalls()?.[0];
+
+        if (functionCall) {
+          const { name, args } = functionCall;
+          const parsedArgs = JSON.parse(args || '{}');
+          const functionResult = await executeFirewallAIFunction(name, parsedArgs);
+
+          ws.send(JSON.stringify({
+            type: 'function_result',
+            functionName: name,
+            result: functionResult
+          }));
+        }
+
+        const text = response.text();
+        ws.send(JSON.stringify({
+          type: 'ai_response',
+          content: text
+        }));
+      }
+    } catch (error) {
+      console.error('AI processing error:', error);
+      ws.send(JSON.stringify({
+        type: 'error',
+        error: error.message
       }));
     }
   });
+
+  ws.on('close', () => {
+    console.log('👋 Client disconnected from FirewallAI');
+  });
 });
*** End Patch