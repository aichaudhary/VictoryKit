import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.AI_PORT || 6016;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/networkforensics_db';

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
  .then(() => console.log('NetworkForensics AI Assistant connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define MongoDB schemas
const TrafficLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  sourceIP: String,
  destinationIP: String,
  sourcePort: Number,
  destinationPort: Number,
  protocol: String,
  packetSize: Number,
  sessionId: String,
  deviceId: String,
  anomalyScore: Number,
  classification: String,
  metadata: mongoose.Schema.Types.Mixed
});

const NetworkDeviceSchema = new mongoose.Schema({
  ipAddress: String,
  macAddress: String,
  hostname: String,
  deviceType: String,
  vendor: String,
  os: String,
  status: { type: String, enum: ['online', 'offline', 'unknown'] },
  lastSeen: { type: Date, default: Date.now },
  capabilities: [String],
  location: String,
  metadata: mongoose.Schema.Types.Mixed
});

const AlertSchema = new mongoose.Schema({
  alertId: String,
  type: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  title: String,
  description: String,
  source: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['new', 'acknowledged', 'resolved', 'false_positive'] },
  assignedTo: String,
  resolution: String,
  metadata: mongoose.Schema.Types.Mixed
});

const TrafficLog = mongoose.model('TrafficLog', TrafficLogSchema);
const NetworkDevice = mongoose.model('NetworkDevice', NetworkDeviceSchema);
const Alert = mongoose.model('Alert', AlertSchema);

// Express server for health checks
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'NetworkForensics AI Assistant is running', timestamp: new Date().toISOString() });
});

app.listen(PORT + 1000, () => {
  console.log(`NetworkForensics AI Assistant health check server running on port ${PORT + 1000}`);
});

// WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`NetworkForensics AI Assistant WebSocket server running on port ${PORT}`);

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

class NetworkForensicsAI {
  private sessions: Map<string, any> = new Map();

  async analyzeTraffic(query: string, context: any = {}): Promise<string> {
    try {
      // Get recent traffic data for context
      const recentTraffic = await TrafficLog.find()
        .sort({ timestamp: -1 })
        .limit(100)
        .select('sourceIP destinationIP protocol packetSize anomalyScore classification');

      // Get active alerts
      const activeAlerts = await Alert.find({ status: { $in: ['new', 'acknowledged'] } })
        .sort({ timestamp: -1 })
        .limit(10);

      // Get network devices
      const devices = await NetworkDevice.find({ status: 'online' })
        .select('ipAddress hostname deviceType status');

      const systemPrompt = `You are NetworkForensics AI, an advanced network security analysis assistant. You have access to real-time network traffic data, device information, and security alerts.

Current Network Context:
- Active Devices: ${devices.length}
- Recent Traffic Logs: ${recentTraffic.length}
- Active Alerts: ${activeAlerts.length}

Your capabilities:
1. Analyze network traffic patterns and identify anomalies
2. Provide security recommendations based on traffic analysis
3. Suggest network optimization strategies
4. Generate incident response plans
5. Explain network security concepts
6. Help with network troubleshooting

Always provide actionable, security-focused responses. If you detect potential security issues, prioritize them in your analysis.`;

      const userPrompt = `Network Analysis Query: ${query}

Context Data:
- Recent Traffic: ${JSON.stringify(recentTraffic.slice(0, 5), null, 2)}
- Active Alerts: ${JSON.stringify(activeAlerts.slice(0, 3), null, 2)}
- Network Devices: ${JSON.stringify(devices.slice(0, 5), null, 2)}

Please provide a comprehensive analysis and recommendations.`;

      // Try Claude first, fallback to Gemini, then OpenAI
      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-opus-20240229',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        return response.content[0].type === 'text' ? response.content[0].text : 'Analysis complete';
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
            max_tokens: 2000,
          });
          return completion.choices[0].message.content || 'Analysis complete';
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      return 'I apologize, but I encountered an error while analyzing the network data. Please try again.';
    }
  }

  async getNetworkInsights(): Promise<any> {
    try {
      const insights = {
        totalDevices: await NetworkDevice.countDocuments(),
        onlineDevices: await NetworkDevice.countDocuments({ status: 'online' }),
        activeAlerts: await Alert.countDocuments({ status: { $in: ['new', 'acknowledged'] } }),
        recentTraffic: await TrafficLog.countDocuments({
          timestamp: { $gte: new Date(Date.now() - 3600000) } // Last hour
        }),
        topProtocols: await TrafficLog.aggregate([
          { $group: { _id: '$protocol', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]),
        anomalyScore: await TrafficLog.aggregate([
          { $group: { _id: null, avgScore: { $avg: '$anomalyScore' } } }
        ])
      };

      return insights;
    } catch (error) {
      console.error('Error getting network insights:', error);
      return {};
    }
  }

  async detectAnomalies(): Promise<any[]> {
    try {
      // Simple anomaly detection based on traffic patterns
      const anomalies = await TrafficLog.find({
        anomalyScore: { $gt: 0.7 },
        timestamp: { $gte: new Date(Date.now() - 3600000) }
      })
      .sort({ anomalyScore: -1 })
      .limit(10)
      .select('sourceIP destinationIP protocol anomalyScore classification timestamp');

      return anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }
}

const ai = new NetworkForensicsAI();

wss.on('connection', (ws: WebSocket, req) => {
  console.log('New NetworkForensics AI client connected');

  ws.on('message', async (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'analyze_traffic':
          const analysis = await ai.analyzeTraffic(message.data.query, message.data.context);
          const response: AIMessage = {
            type: 'ai_response',
            content: analysis,
            timestamp: new Date().toISOString(),
            sessionId: message.sessionId || 'default',
            analysis: {
              type: 'traffic_analysis',
              insights: await ai.getNetworkInsights(),
              anomalies: await ai.detectAnomalies()
            }
          };
          ws.send(JSON.stringify(response));
          break;

        case 'get_insights':
          const insights = await ai.getNetworkInsights();
          ws.send(JSON.stringify({
            type: 'network_insights',
            data: insights,
            timestamp: new Date().toISOString(),
            sessionId: message.sessionId || 'default'
          }));
          break;

        case 'detect_anomalies':
          const anomalies = await ai.detectAnomalies();
          ws.send(JSON.stringify({
            type: 'anomaly_detection',
            data: anomalies,
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
    console.log('NetworkForensics AI client disconnected');
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'NetworkForensics AI Assistant connected. Ready to analyze your network traffic.',
    capabilities: [
      'Real-time traffic analysis',
      'Anomaly detection',
      'Security recommendations',
      'Network optimization',
      'Incident response planning'
    ],
    timestamp: new Date().toISOString()
  }));
});

console.log('NetworkForensics AI Assistant initialized with multi-LLM support');
console.log('Available AI providers: Claude Opus, Gemini Pro, GPT-4');