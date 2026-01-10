/**
 * RiskQuantify Tool Component - Tool 19 - Enhanced Risk Assessment & Management
 * Features: AI Analysis, Real-time Collaboration, Threat Intelligence, Compliance Integration
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { riskAssessApi, simulatedData, type Risk, type RiskDashboard } from '../api/riskquantify.api';

type TabType = 'dashboard' | 'risks' | 'matrix' | 'ai-analysis' | 'threat-intel' | 'compliance' | 'reports' | 'analytics' | 'collaboration';

interface WebSocketMessage {
  type: string;
  data: any;
  userId?: string;
  timestamp: string;
}

export default function RiskQuantifyTool() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<RiskDashboard | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);

  // Enhanced state for new features
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [threatIntel, setThreatIntel] = useState<any>(null);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<WebSocketMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDashboard();
    initializeWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'risks') loadRisks();
    else if (activeTab === 'ai-analysis') loadAIAnalysis();
    else if (activeTab === 'threat-intel') loadThreatIntel();
    else if (activeTab === 'compliance') loadComplianceStatus();
    else if (activeTab === 'analytics') loadPredictiveAnalytics();
  }, [activeTab]);

  const initializeWebSocket = () => {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:4119';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      // Join collaboration session
      wsRef.current?.send(JSON.stringify({
        type: 'join_session',
        data: { sessionId: 'riskquantify-main', userId: 'user-' + Date.now() }
      }));
    };

    wsRef.current.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected, attempting reconnect...');
      reconnectTimeoutRef.current = setTimeout(initializeWebSocket, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'user_joined':
        setOnlineUsers(prev => [...prev, message.userId!]);
        break;
      case 'user_left':
        setOnlineUsers(prev => prev.filter(user => user !== message.userId));
        break;
      case 'chat_message':
        setChatMessages(prev => [...prev, message]);
        break;
      case 'risk_updated':
        // Refresh risks when someone updates them
        if (activeTab === 'risks') loadRisks();
        break;
      case 'ai_analysis_complete':
        setAiAnalysis(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendChatMessage = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        data: { message, userId: 'current-user' },
        timestamp: new Date().toISOString()
      }));
    }
  };

  async function loadDashboard() {
    setLoading(true);
    try {
      const r = await riskAssessApi.getDashboard();
      if (r.success && r.data) {
        setDashboard(r.data);
        setUsingSimulated(false);
      } else {
        setDashboard(simulatedData.dashboard);
        setUsingSimulated(true);
      }
    } catch {
      setDashboard(simulatedData.dashboard);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadRisks() {
    setLoading(true);
    try {
      const r = await riskAssessApi.getRisks();
      if (r.success && r.data) {
        setRisks(r.data);
        setUsingSimulated(false);
      } else {
        setRisks(simulatedData.risks);
        setUsingSimulated(true);
      }
    } catch {
      setRisks(simulatedData.risks);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadAIAnalysis() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risks: risks.slice(0, 5) })
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAiAnalysis({ error: 'AI analysis unavailable' });
    } finally {
      setLoading(false);
    }
  }

  async function loadThreatIntel() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/threat-intelligence/feeds');
      const data = await response.json();
      setThreatIntel(data);
    } catch (error) {
      console.error('Threat Intel failed:', error);
      setThreatIntel({ error: 'Threat intelligence unavailable' });
    } finally {
      setLoading(false);
    }
  }

  async function loadComplianceStatus() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/compliance/status');
      const data = await response.json();
      setComplianceStatus(data);
    } catch (error) {
      console.error('Compliance check failed:', error);
      setComplianceStatus({ error: 'Compliance status unavailable' });
    } finally {
      setLoading(false);
    }
  }

  async function loadPredictiveAnalytics() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/analytics/predictions');
      const data = await response.json();
      setPredictiveAnalytics(data);
    } catch (error) {
      console.error('Predictive analytics failed:', error);
      setPredictiveAnalytics({ error: 'Analytics unavailable' });
    } finally {
      setLoading(false);
    }
  }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-violet-500/20">
            <p className="text-gray-400 text-sm">Total Risks</p>
            <p className="text-2xl font-bold text-violet-400">{dashboard.overview.totalRisks}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20">
            <p className="text-gray-400 text-sm">High Risks</p>
            <p className="text-2xl font-bold text-red-400">{dashboard.overview.highRisks}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-gray-400 text-sm">Open Risks</p>
            <p className="text-2xl font-bold text-yellow-400">{dashboard.overview.openRisks}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20">
            <p className="text-gray-400 text-sm">Avg Score</p>
            <p className="text-2xl font-bold text-blue-400">{dashboard.overview.avgRiskScore.toFixed(1)}</p>
          </div>
        </div>

        {/* Real-time collaboration status */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Collaboration Status</p>
              <p className="text-green-400 font-semibold">🟢 {onlineUsers.length} users online</p>
            </div>
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 3).map((user, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-green-500 border-2 border-gray-800 flex items-center justify-center text-xs font-bold">
                  {user.charAt(0).toUpperCase()}
                </div>
              ))}
              {onlineUsers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs">
                  +{onlineUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Top Risks</h3>
          <div className="space-y-3">
            {dashboard.topRisks.map(r => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                    r.riskScore >= 8 ? 'bg-red-600' : r.riskScore >= 5 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}>
                    {r.riskScore.toFixed(1)}
                  </div>
                  <div>
                    <p className="text-white">{r.name}</p>
                    <p className="text-gray-500 text-sm">{r.category} • Owner: {r.owner}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  r.status === 'mitigated' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderAIAnalysis() {
    if (!aiAnalysis) return <div className="text-gray-400">Loading AI analysis...</div>;

    if (aiAnalysis.error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">⚠️ {aiAnalysis.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            🤖 AI Risk Analysis
            <span className="text-xs bg-blue-600 px-2 py-1 rounded">Powered by Multiple AI Models</span>
          </h3>

          {aiAnalysis.consensus && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Consensus Score</p>
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${
                  aiAnalysis.consensus.overall >= 8 ? 'text-red-400' :
                  aiAnalysis.consensus.overall >= 5 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {aiAnalysis.consensus.overall.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">
                  Confidence: {aiAnalysis.consensus.confidence}%
                </div>
              </div>
            </div>
          )}

          {aiAnalysis.recommendations && (
            <div>
              <h4 className="text-white font-medium mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {aiAnalysis.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-300">{rec.suggestion}</p>
                    <p className="text-gray-500 text-sm mt-1">Priority: {rec.priority}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderThreatIntel() {
    if (!threatIntel) return <div className="text-gray-400">Loading threat intelligence...</div>;

    if (threatIntel.error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">⚠️ {threatIntel.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-orange-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            🛡️ Threat Intelligence
            <span className="text-xs bg-orange-600 px-2 py-1 rounded">7+ Security Feeds</span>
          </h3>

          {threatIntel.feeds && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {threatIntel.feeds.map((feed: any, i: number) => (
                <div key={i} className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{feed.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      feed.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}>
                      {feed.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{feed.description}</p>
                  <p className="text-gray-500 text-xs">Last updated: {new Date(feed.lastUpdate).toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">Threats: {feed.threatCount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCompliance() {
    if (!complianceStatus) return <div className="text-gray-400">Loading compliance status...</div>;

    if (complianceStatus.error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">⚠️ {complianceStatus.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            📋 Compliance Status
            <span className="text-xs bg-purple-600 px-2 py-1 rounded">7 Frameworks</span>
          </h3>

          {complianceStatus.frameworks && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceStatus.frameworks.map((framework: any, i: number) => (
                <div key={i} className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{framework.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      framework.compliance >= 80 ? 'bg-green-900/30 text-green-400' :
                      framework.compliance >= 60 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
                    }`}>
                      {framework.compliance}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{framework.description}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        framework.compliance >= 80 ? 'bg-green-500' :
                        framework.compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${framework.compliance}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAnalytics() {
    if (!predictiveAnalytics) return <div className="text-gray-400">Loading predictive analytics...</div>;

    if (predictiveAnalytics.error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">⚠️ {predictiveAnalytics.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            📊 Predictive Analytics
            <span className="text-xs bg-cyan-600 px-2 py-1 rounded">ML-Powered</span>
          </h3>

          {predictiveAnalytics.predictions && (
            <div className="space-y-4">
              {predictiveAnalytics.predictions.map((pred: any, i: number) => (
                <div key={i} className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{pred.riskName}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      pred.predictedSeverity === 'high' ? 'bg-red-900/30 text-red-400' :
                      pred.predictedSeverity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'
                    }`}>
                      {pred.predictedSeverity}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Predicted trend: {pred.trend}</p>
                  <p className="text-gray-500 text-xs">Confidence: {pred.confidence}%</p>
                  <p className="text-gray-500 text-xs">Timeframe: Next {pred.timeframe}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCollaboration() {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            💬 Real-time Collaboration
            <span className="text-xs bg-green-600 px-2 py-1 rounded">WebSocket</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Online Users */}
            <div>
              <h4 className="text-white font-medium mb-3">Online Users ({onlineUsers.length})</h4>
              <div className="space-y-2">
                {onlineUsers.map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-300">{user}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div>
              <h4 className="text-white font-medium mb-3">Team Chat</h4>
              <div className="bg-gray-900/50 rounded-lg p-4 h-64 overflow-y-auto mb-3">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                ) : (
                  <div className="space-y-2">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-gray-400">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                        <span className="text-blue-400 font-medium"> {msg.userId}:</span>
                        <span className="text-gray-300"> {msg.data.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendChatMessage((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input.value) {
                      sendChatMessage(input.value);
                      input.value = '';
                    }
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderRisks() {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg">
            + New Risk
          </button>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="text-left p-4 text-gray-400">Risk</th>
                <th className="text-left p-4 text-gray-400">Category</th>
                <th className="text-left p-4 text-gray-400">Score</th>
                <th className="text-left p-4 text-gray-400">Owner</th>
                <th className="text-left p-4 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {risks.map(r => (
                <tr key={r._id} className="border-t border-gray-700 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div>
                      <p className="text-white">{r.name}</p>
                      <p className="text-gray-500 text-sm">{r.description}</p>
                    </div>
                  </td>
                  <td className="p-4 text-violet-400">{r.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded font-bold ${
                      r.riskScore >= 8 ? 'bg-red-900/30 text-red-400' :
                      r.riskScore >= 5 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'
                    }`}>
                      {r.riskScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{r.owner}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      r.status === 'mitigated' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'risks' as TabType, label: 'Risks', icon: '⚠️' },
    { id: 'matrix' as TabType, label: 'Matrix', icon: '📈' },
    { id: 'ai-analysis' as TabType, label: 'AI Analysis', icon: '🤖' },
    { id: 'threat-intel' as TabType, label: 'Threat Intel', icon: '🛡️' },
    { id: 'compliance' as TabType, label: 'Compliance', icon: '📋' },
    { id: 'reports' as TabType, label: 'Reports', icon: '📑' },
    { id: 'analytics' as TabType, label: 'Analytics', icon: '📊' },
    { id: 'collaboration' as TabType, label: 'Team Chat', icon: '💬' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-violet-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">📊</div>
              <div>
                <h1 className="text-xl font-bold">RiskQuantify Pro</h1>
                <p className="text-gray-400 text-sm">AI-Powered Risk Assessment & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {usingSimulated && (
                <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">
                  🔄 Simulation Mode
                </span>
              )}
              <button
                onClick={() => navigate('/maula/ai')}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
              >
                <span>✨</span>AI Assistant
              </button>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-400">Real-time</span>
              </div>
            </div>
          </div>
          <nav className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-violet-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'risks' && renderRisks()}
        {!loading && activeTab === 'matrix' && <div className="text-gray-400 text-center py-12">Interactive risk matrix visualization coming soon...</div>}
        {!loading && activeTab === 'ai-analysis' && renderAIAnalysis()}
        {!loading && activeTab === 'threat-intel' && renderThreatIntel()}
        {!loading && activeTab === 'compliance' && renderCompliance()}
        {!loading && activeTab === 'reports' && <div className="text-gray-400 text-center py-12">Advanced reporting with PDF/Excel export coming soon...</div>}
        {!loading && activeTab === 'analytics' && renderAnalytics()}
        {!loading && activeTab === 'collaboration' && renderCollaboration()}
      </main>
      <footer className="border-t border-gray-800 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          RiskQuantify Pro Tool 19 • VictoryKit Security Platform • AI-Enhanced Risk Management
        </div>
      </footer>
    </div>
  );
}
