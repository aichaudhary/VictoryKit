import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.AI_PORT || 6017;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/audittrail_db';

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('AuditTrail AI Assistant connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define MongoDB schemas
const AuditLogSchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  eventId: String,
  timestamp: { type: Date, default: Date.now },
  eventType: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  source: {
    ip: String,
    userAgent: String,
    userId: String,
    sessionId: String,
    tenantId: String
  },
  action: {
    type: String,
    resource: String,
    method: String,
    success: Boolean,
    details: mongoose.Schema.Types.Mixed
  },
  compliance: {
    frameworks: [String],
    requirements: [String],
    violations: [String]
  },
  integrity: {
    hash: String,
    signature: String,
    chainHash: String
  },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const ComplianceReportSchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  reportId: String,
  framework: String,
  period: {
    start: Date,
    end: Date
  },
  scores: {
    overall: Number,
    categories: mongoose.Schema.Types.Mixed,
    requirements: mongoose.Schema.Types.Mixed
  },
  violations: [{
    requirement: String,
    severity: String,
    description: String,
    evidence: mongoose.Schema.Types.Mixed
  }],
  recommendations: [String],
  generatedAt: { type: Date, default: Date.now },
  generatedBy: String
}, { timestamps: true });

const SecurityEventSchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  eventId: String,
  type: String,
  severity: String,
  source: mongoose.Schema.Types.Mixed,
  target: mongoose.Schema.Types.Mixed,
  details: mongoose.Schema.Types.Mixed,
  correlationId: String,
  incidentId: String,
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  resolution: String
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
const ComplianceReport = mongoose.model('ComplianceReport', ComplianceReportSchema);
const SecurityEvent = mongoose.model('SecurityEvent', SecurityEventSchema);

// Express server for health checks
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'AuditTrail AI Assistant is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    capabilities: [
      'Compliance Risk Analysis',
      'Audit Log Anomaly Detection',
      'Incident Correlation',
      'Predictive Compliance Scoring',
      'Security Event Analysis',
      'Automated Recommendations'
    ]
  });
});

app.listen(PORT + 1000, () => {
  console.log(`AuditTrail AI Assistant health check server running on port ${PORT + 1000}`);
});

// WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`AuditTrail AI Assistant WebSocket server running on port ${PORT}`);

interface ClientMessage {
  type: string;
  data: any;
  sessionId?: string;
}

interface AIMessage {
  type: 'ai_response';
  content: string;
  timestamp: string;
  sessionId: string;
  analysis?: any;
}

class AuditTrailAI {
  private sessions: Map<string, any> = new Map();

  async analyzeCompliance(query: string, context: any = {}): Promise<string> {
    try {
      // Get recent audit logs for context
      const recentLogs = await AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(100)
        .select('eventType severity source action compliance violations');

      // Get recent compliance reports
      const recentReports = await ComplianceReport.find()
        .sort({ generatedAt: -1 })
        .limit(10)
        .select('framework scores violations recommendations');

      // Get security events
      const securityEvents = await SecurityEvent.find({ resolved: false })
        .sort({ timestamp: -1 })
        .limit(20)
        .select('type severity source target details');

      const systemPrompt = `You are AuditTrail AI, the FINAL tool in the VictoryKit security suite. You are an advanced compliance and audit analysis assistant with deep expertise in:

COMPLIANCE FRAMEWORKS:
- GDPR (General Data Protection Regulation)
- HIPAA (Health Insurance Portability and Accountability Act)
- PCI-DSS (Payment Card Industry Data Security Standard)
- SOX (Sarbanes-Oxley Act)
- ISO 27001 (Information Security Management)
- NIST Cybersecurity Framework
- CIS Controls

Your capabilities include:
1. Compliance risk assessment and gap analysis
2. Audit log anomaly detection and pattern recognition
3. Security event correlation and incident analysis
4. Predictive compliance scoring and risk forecasting
5. Automated compliance reporting and recommendations
6. Security policy optimization and implementation guidance
7. Forensic audit analysis and chain of custody verification
8. Multi-framework compliance mapping and harmonization

Always provide actionable, compliance-focused responses with specific regulatory references. Prioritize critical compliance violations and provide remediation steps.`;

      const userPrompt = `Compliance & Audit Analysis Query: ${query}

Current Context:
- Recent Audit Logs: ${recentLogs.length} entries analyzed
- Active Compliance Reports: ${recentReports.length} frameworks monitored
- Unresolved Security Events: ${securityEvents.length} incidents

Audit Data Summary:
- Recent Logs: ${JSON.stringify(recentLogs.slice(0, 5), null, 2)}
- Compliance Status: ${JSON.stringify(recentReports.slice(0, 3), null, 2)}
- Security Events: ${JSON.stringify(securityEvents.slice(0, 3), null, 2)}

Please provide comprehensive compliance analysis and actionable recommendations.`;

      // Try Claude first, fallback to Gemini, then OpenAI
      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-opus-20240229',
          max_tokens: 3000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        return response.content[0].type === 'text' ? response.content[0].text : 'Compliance analysis complete';
      } catch (claudeError) {
        console.log('Claude error, trying Gemini:', claudeError);
        try {
          const result = await geminiModel.generateContent(userPrompt);
          return result.response.text();
        } catch (geminiError) {
          console.log('Gemini error, trying OpenAI:', geminiError);
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 3000,
          });
          return completion.choices[0].message.content || 'Compliance analysis complete';
        }
      }
    } catch (error) {
      console.error('AI compliance analysis error:', error);
      return 'I apologize, but I encountered an error while analyzing the compliance data. Please try again.';
    }
  }

  async detectAuditAnomalies(): Promise<any[]> {
    try {
      // Get recent logs for anomaly detection
      const recentLogs = await AuditLog.find({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).sort({ timestamp: -1 });

      // Simple anomaly detection based on patterns
      const anomalies = [];
      const userActivity = new Map();
      const ipActivity = new Map();

      // Analyze user activity patterns
      for (const log of recentLogs) {
        const userId = log.source?.userId;
        const ip = log.source?.ip;

        if (userId) {
          userActivity.set(userId, (userActivity.get(userId) || 0) + 1);
        }

        if (ip) {
          ipActivity.set(ip, (ipActivity.get(ip) || 0) + 1);
        }

        // Check for suspicious patterns
        if (log.severity === 'critical' || log.compliance?.violations?.length > 0) {
          anomalies.push({
            type: 'compliance_violation',
            log: log,
            risk: 'high',
            description: `Critical compliance violation: ${log.eventType}`
          });
        }

        // Check for unusual login patterns
        if (log.eventType === 'failed_login' && log.action?.details?.attempts > 5) {
          anomalies.push({
            type: 'brute_force_attempt',
            log: log,
            risk: 'high',
            description: 'Potential brute force attack detected'
          });
        }
      }

      // Check for users with unusually high activity
      const avgActivity = Array.from(userActivity.values()).reduce((a, b) => a + b, 0) / userActivity.size;
      for (const [userId, count] of userActivity) {
        if (count > avgActivity * 3) {
          anomalies.push({
            type: 'unusual_user_activity',
            userId: userId,
            activity: count,
            risk: 'medium',
            description: `User ${userId} shows unusually high activity (${count} events)`
          });
        }
      }

      return anomalies.slice(0, 20); // Return top 20 anomalies
    } catch (error) {
      console.error('Error detecting audit anomalies:', error);
      return [];
    }
  }

  async generateComplianceReport(framework: string): Promise<any> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get logs for the compliance framework
      const relevantLogs = await AuditLog.find({
        timestamp: { $gte: thirtyDaysAgo },
        'compliance.frameworks': framework
      });

      // Calculate compliance score
      const totalLogs = relevantLogs.length;
      const violations = relevantLogs.filter(log => log.compliance?.violations?.length > 0).length;
      const complianceScore = totalLogs > 0 ? ((totalLogs - violations) / totalLogs) * 100 : 100;

      // Generate recommendations based on violations
      const recommendations = [];
      const violationTypes = new Set();

      relevantLogs.forEach(log => {
        log.compliance?.violations?.forEach((violation: string) => {
          violationTypes.add(violation);
        });
      });

      if (violationTypes.has('unauthorized_access')) {
        recommendations.push('Implement stronger access controls and multi-factor authentication');
      }

      if (violationTypes.has('data_breach')) {
        recommendations.push('Enhance data encryption and implement data loss prevention controls');
      }

      if (violationTypes.has('audit_log_tampering')) {
        recommendations.push('Implement tamper-proof audit logging with cryptographic integrity');
      }

      return {
        framework,
        period: {
          start: thirtyDaysAgo.toISOString(),
          end: new Date().toISOString()
        },
        scores: {
          overall: Math.round(complianceScore),
          violations: violations,
          totalAssessed: totalLogs
        },
        violations: Array.from(violationTypes),
        recommendations,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return { error: 'Failed to generate compliance report' };
    }
  }

  async correlateSecurityEvents(): Promise<any[]> {
    try {
      const recentEvents = await SecurityEvent.find({
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      }).sort({ timestamp: -1 });

      // Group events by correlation patterns
      const correlations = [];
      const eventGroups = new Map();

      for (const event of recentEvents) {
        const key = `${event.source?.ip || 'unknown'}-${event.type}`;
        if (!eventGroups.has(key)) {
          eventGroups.set(key, []);
        }
        eventGroups.get(key).push(event);
      }

      // Find correlated events
      for (const [key, events] of eventGroups) {
        if (events.length > 1) {
          correlations.push({
            correlationId: crypto.randomUUID(),
            events: events.length,
            type: events[0].type,
            source: events[0].source,
            severity: events[0].severity,
            timeSpan: {
              start: events[events.length - 1].timestamp,
              end: events[0].timestamp
            },
            description: `${events.length} related ${events[0].type} events from ${events[0].source?.ip || 'unknown source'}`
          });
        }
      }

      return correlations;
    } catch (error) {
      console.error('Error correlating security events:', error);
      return [];
    }
  }
}

const ai = new AuditTrailAI();

wss.on('connection', (ws: WebSocket, req) => {
  console.log('New AuditTrail AI client connected');

  ws.on('message', async (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'analyze_compliance':
          const analysis = await ai.analyzeCompliance(message.data.query, message.data.context);
          const response: AIMessage = {
            type: 'ai_response',
            content: analysis,
            timestamp: new Date().toISOString(),
            sessionId: message.sessionId || 'default',
            analysis: {
              type: 'compliance_analysis',
              anomalies: await ai.detectAuditAnomalies(),
              correlations: await ai.correlateSecurityEvents()
            }
          };
          ws.send(JSON.stringify(response));
          break;

        case 'generate_compliance_report':
          const report = await ai.generateComplianceReport(message.data.framework);
          ws.send(JSON.stringify({
            type: 'compliance_report',
            data: report,
            timestamp: new Date().toISOString(),
            sessionId: message.sessionId || 'default'
          }));
          break;

        case 'detect_anomalies':
          const anomalies = await ai.detectAuditAnomalies();
          ws.send(JSON.stringify({
            type: 'anomaly_detection',
            data: anomalies,
            timestamp: new Date().toISOString(),
            sessionId: message.sessionId || 'default'
          }));
          break;

        case 'correlate_events':
          const correlations = await ai.correlateSecurityEvents();
          ws.send(JSON.stringify({
            type: 'event_correlation',
            data: correlations,
            timestamp: new Date().toISOString(),
            sessionId: message.sessionId || 'default'
          }));
          break;

        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString(),
            sessionId: message.sessionId || 'default'
          }));
          break;

        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type',
            timestamp: new Date().toISOString(),
            sessionId: message.sessionId || 'default'
          }));
      }
    } catch (error) {
      console.error('Message processing error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message',
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on('close', () => {
    console.log('AuditTrail AI client disconnected');
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'AuditTrail AI Assistant connected. Ready to analyze compliance and audit data.',
    capabilities: [
      'Compliance risk assessment',
      'Audit log anomaly detection',
      'Security event correlation',
      'Predictive compliance scoring',
      'Automated recommendations',
      'Multi-framework compliance analysis'
    ],
    timestamp: new Date().toISOString()
  }));
});

console.log('AuditTrail AI Assistant initialized with multi-LLM support');
console.log('Available AI providers: Claude Opus, Gemini Pro, GPT-4');
console.log('Compliance frameworks supported: GDPR, HIPAA, PCI-DSS, SOX, ISO 27001, NIST, CIS');