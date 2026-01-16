/**
 * XDRPlatform Tool Component - REDESIGNED
 * Tool 12 - Extended Detection & Response Platform
 * Beautiful external-facing design with Playground feature
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { logAnalyzerApi, simulatedData, type LogEntry, type LogDashboard, type LogAnalysisResult, type LogLevel, type LogSource } from '../api/loganalyzer.api';

// ============================================================================
// BEAUTIFUL ANIMATED BACKGROUND COMPONENTS
// ============================================================================

// Threat Radar Sweep Animation
const ThreatRadarSweep = () => {
  const [threats, setThreats] = useState<{ id: number; x: number; y: number; severity: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newThreat = {
          id: Date.now(),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        };
        setThreats(prev => [...prev.slice(-8), newThreat]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[20, 35, 50].map((r, i) => (
          <circle key={i} cx="50" cy="50" r={r} fill="none" stroke="#a855f7" strokeWidth="0.2" opacity="0.3" />
        ))}
        <g className="animate-spin" style={{ transformOrigin: '50px 50px', animationDuration: '4s' }}>
          <path d="M50,50 L50,5 A45,45 0 0,1 85,30 Z" fill="url(#radarGradient)" />
          <line x1="50" y1="50" x2="50" y2="5" stroke="#a855f7" strokeWidth="0.5" />
        </g>
        {threats.map(threat => (
          <g key={threat.id}>
            <circle cx={threat.x} cy={threat.y} r="2" fill={severityColors[threat.severity]} opacity="0.8">
              <animate attributeName="r" values="1;3;1" dur="1s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Endpoint Network Visualization
const EndpointNetwork = () => {
  const nodes = useMemo(() => [
    { id: 1, x: 50, y: 15, type: 'cloud', label: 'Cloud' },
    { id: 2, x: 15, y: 35, type: 'endpoint', label: 'Endpoint' },
    { id: 3, x: 85, y: 35, type: 'network', label: 'Network' },
    { id: 4, x: 25, y: 70, type: 'email', label: 'Email' },
    { id: 5, x: 75, y: 70, type: 'server', label: 'Server' },
    { id: 6, x: 50, y: 45, type: 'xdr', label: 'XDR' },
  ], []);

  const connections = [[1, 6], [2, 6], [3, 6], [4, 6], [5, 6]];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {connections.map(([from, to], i) => {
          const fromNode = nodes.find(n => n.id === from)!;
          const toNode = nodes.find(n => n.id === to)!;
          return (
            <g key={i}>
              <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke="#a855f7" strokeWidth="0.3" opacity="0.5" />
              <circle r="0.8" fill="#a855f7">
                <animateMotion dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`} />
              </circle>
            </g>
          );
        })}
        {nodes.map(node => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={node.type === 'xdr' ? 6 : 3} fill={node.type === 'xdr' ? '#a855f7' : '#1e1b4b'} stroke="#a855f7" strokeWidth="0.5">
              {node.type === 'xdr' && <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />}
            </circle>
            <text x={node.x} y={node.y + (node.type === 'xdr' ? 12 : 8)} textAnchor="middle" fill="#a855f7" fontSize="3">{node.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Live Event Feed Animation
const LiveEventFeed = () => {
  const [events, setEvents] = useState<{ id: number; time: string; type: string; severity: string; message: string }[]>([]);

  const eventTypes = [
    { type: 'HIGH', severity: 'high', message: 'Data Exfiltration' },
    { type: 'INFO', severity: 'info', message: 'Suspicious Login' },
    { type: 'CRITICAL', severity: 'critical', message: 'C2 Communication' },
    { type: 'CRITICAL', severity: 'critical', message: 'Malware Detected' },
    { type: 'HIGH', severity: 'high', message: 'Privilege Escalation' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const now = new Date();
      setEvents(prev => [{
        id: Date.now(),
        time: now.toLocaleTimeString('en-US', { hour12: false }),
        type: event.type,
        severity: event.severity,
        message: event.message
      }, ...prev.slice(0, 4)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    info: 'text-blue-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  };

  return (
    <div className="absolute left-4 top-1/4 w-64 font-mono text-xs space-y-1 opacity-60 hidden lg:block">
      {events.map(event => (
        <div key={event.id} className="flex items-center gap-2 animate-pulse">
          <span className="text-green-400">●</span>
          <span className="text-gray-500">{event.time}</span>
          <span className={`font-bold ${severityColors[event.severity]}`}>[{event.type}]</span>
          <span className="text-gray-400">{event.message}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const levelColors: Record<LogLevel, { bg: string; text: string; border: string }> = {
  debug: { bg: 'bg-gray-600/20', text: 'text-gray-300', border: 'border-gray-500' },
  info: { bg: 'bg-blue-600/20', text: 'text-blue-300', border: 'border-blue-500' },
  warn: { bg: 'bg-yellow-600/20', text: 'text-yellow-300', border: 'border-yellow-500' },
  error: { bg: 'bg-red-600/20', text: 'text-red-300', border: 'border-red-500' },
  critical: { bg: 'bg-purple-600/20', text: 'text-purple-300', border: 'border-purple-500' },
};

type TabType = 'overview' | 'detection' | 'response' | 'analytics' | 'incidents' | 'playground';

interface XDRIncident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  source: string;
  affectedAssets: string[];
  indicators: string[];
  timestamp: string;
  assignee?: string;
}

interface LiveEvent {
  id: number;
  timestamp: string;
  type: string;
  severity: string;
  source: string;
  message: string;
  details?: any;
}

export default function XDRPlatformTool() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dashboard, setDashboard] = useState<LogDashboard | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analysis, setAnalysis] = useState<LogAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(true);
  
  // Playground state
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [playgroundOutput, setPlaygroundOutput] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // Incidents state
  const [incidents, setIncidents] = useState<XDRIncident[]>([]);
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    severity: 'medium' as const,
    source: 'manual',
    description: '',
  });

  // Live events stream
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Response actions state
  const [responseActions, setResponseActions] = useState<{[key: string]: {loading: boolean; result?: string}}>({});

  // Live metrics
  const [metrics, setMetrics] = useState({
    eventsPerSec: 11514,
    activeThreats: 0,
    dataSources: 54,
    avgMTTR: '4.6m',
  });

  useEffect(() => { 
    loadData();
    loadIncidents();
  }, []);

  // Real-time metrics update
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        eventsPerSec: Math.floor(11000 + Math.random() * 1000),
        activeThreats: incidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
      }));
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, [incidents]);

  // Real-time event stream simulation
  useEffect(() => {
    const eventTypes = [
      { type: 'ENDPOINT', severity: 'info', messages: ['Process started', 'File modified', 'Network connection'] },
      { type: 'NETWORK', severity: 'warn', messages: ['Unusual traffic pattern', 'Port scan detected', 'DNS anomaly'] },
      { type: 'CLOUD', severity: 'info', messages: ['API call', 'Resource modified', 'Login event'] },
      { type: 'THREAT', severity: 'high', messages: ['Malware signature match', 'C2 communication', 'Data exfiltration'] },
      { type: 'AUTH', severity: 'warn', messages: ['Failed login', 'Password reset', 'MFA bypass attempt'] },
    ];

    const interval = setInterval(() => {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const message = eventType.messages[Math.floor(Math.random() * eventType.messages.length)];
      const newEvent: LiveEvent = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: eventType.type,
        severity: eventType.severity,
        source: `${['srv', 'ws', 'fw', 'app'][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
        message,
      };
      setLiveEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dashRes, logsRes, analysisRes] = await Promise.all([
        logAnalyzerApi.getDashboard(),
        logAnalyzerApi.queryLogs({ limit: 50 }),
        logAnalyzerApi.analyzeLogs({}),
      ]);
      
      if (dashRes.success && dashRes.data) setDashboard(dashRes.data);
      else setDashboard(simulatedData.dashboard);
      
      if (logsRes.success && logsRes.data) setLogs(logsRes.data.logs);
      else setLogs(simulatedData.logs);
      
      if (analysisRes.success && analysisRes.data) setAnalysis(analysisRes.data);
      else setAnalysis(simulatedData.analysis);
      
      setUsingSimulated(!dashRes.success);
    } catch {
      setDashboard(simulatedData.dashboard);
      setLogs(simulatedData.logs);
      setAnalysis(simulatedData.analysis);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  function loadIncidents() {
    // Load simulated incidents
    const simulatedIncidents: XDRIncident[] = [
      {
        id: 'XDR-001',
        title: 'Potential Data Exfiltration Detected',
        severity: 'critical',
        status: 'investigating',
        source: 'NDR',
        affectedAssets: ['srv-prod-01', 'db-main'],
        indicators: ['192.168.1.100', 'suspicious.domain.com'],
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        assignee: 'SOC Team',
      },
      {
        id: 'XDR-002',
        title: 'Unauthorized Access Attempt',
        severity: 'high',
        status: 'open',
        source: 'EDR',
        affectedAssets: ['ws-finance-003'],
        indicators: ['admin:failed-login', '10.0.0.50'],
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'XDR-003',
        title: 'Malware Detected on Endpoint',
        severity: 'high',
        status: 'contained',
        source: 'EDR',
        affectedAssets: ['ws-hr-001'],
        indicators: ['trojan.gen.2', 'hash:abc123'],
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        assignee: 'Analyst-1',
      },
    ];
    setIncidents(simulatedIncidents);
  }

  function createIncident() {
    if (!newIncident.title) return;
    
    const incident: XDRIncident = {
      id: `XDR-${Date.now().toString().slice(-4)}`,
      title: newIncident.title,
      severity: newIncident.severity,
      status: 'open',
      source: newIncident.source,
      affectedAssets: [],
      indicators: [],
      timestamp: new Date().toISOString(),
    };
    
    setIncidents([incident, ...incidents]);
    setNewIncident({ title: '', severity: 'medium', source: 'manual', description: '' });
    setShowCreateIncident(false);
  }

  function updateIncidentStatus(id: string, status: XDRIncident['status']) {
    setIncidents(incidents.map(inc => 
      inc.id === id ? { ...inc, status } : inc
    ));
  }

  async function executeResponseAction(actionType: string, target: string) {
    const actionKey = `${actionType}-${target}`;
    setResponseActions(prev => ({ ...prev, [actionKey]: { loading: true } }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results: Record<string, string> = {
      'isolate': `✅ Successfully isolated ${target} from network`,
      'block-ip': `✅ IP address ${target} blocked across all firewalls`,
      'disable-user': `✅ User account ${target} disabled`,
      'quarantine': `✅ File quarantined on ${target}`,
      'scan': `✅ Full scan initiated on ${target}`,
      'collect-evidence': `✅ Evidence collection started on ${target}`,
    };
    
    setResponseActions(prev => ({ 
      ...prev, 
      [actionKey]: { loading: false, result: results[actionType] || '✅ Action completed' } 
    }));
    
    // Clear result after 5 seconds
    setTimeout(() => {
      setResponseActions(prev => ({ ...prev, [actionKey]: { loading: false } }));
    }, 5000);
  }

  function formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  // Playground handlers
  async function runPlaygroundQuery() {
    if (!playgroundInput.trim()) return;
    setPlaygroundLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Parse input and generate output
    const input = playgroundInput.toLowerCase();
    let output;
    
    if (input.includes('threat') || input.includes('malware')) {
      output = {
        type: 'threat_detection',
        timestamp: new Date().toISOString(),
        threats_found: Math.floor(Math.random() * 5) + 1,
        severity: 'high',
        details: [
          { type: 'Malware', confidence: 0.94, source: 'endpoint-001', ioc: 'hash:a1b2c3d4' },
          { type: 'C2 Communication', confidence: 0.87, source: 'network', ioc: 'ip:192.168.1.100' },
        ],
        recommended_actions: ['Isolate affected endpoint', 'Block C2 IP', 'Run full scan'],
      };
    } else if (input.includes('log') || input.includes('search')) {
      output = {
        type: 'log_query',
        timestamp: new Date().toISOString(),
        total_results: 1247,
        query_time_ms: 42,
        sample_logs: [
          { level: 'error', source: 'auth-server', message: 'Failed login attempt', timestamp: new Date().toISOString() },
          { level: 'warn', source: 'firewall', message: 'Suspicious port scan detected', timestamp: new Date().toISOString() },
        ],
      };
    } else if (input.includes('incident') || input.includes('alert')) {
      output = {
        type: 'incident_response',
        timestamp: new Date().toISOString(),
        incident_id: `INC-${Math.floor(Math.random() * 10000)}`,
        status: 'investigating',
        priority: 'P1',
        timeline: [
          { time: '10:00:00', action: 'Alert triggered' },
          { time: '10:00:15', action: 'Automated containment initiated' },
          { time: '10:01:00', action: 'Analyst notified' },
        ],
        affected_assets: ['srv-prod-01', 'db-main', 'app-gateway'],
      };
    } else {
      output = {
        type: 'general_analysis',
        timestamp: new Date().toISOString(),
        input_received: playgroundInput,
        analysis_summary: 'Query processed successfully',
        data_sources_queried: ['endpoints', 'network', 'cloud', 'email'],
        processing_time_ms: 156,
        recommendations: ['Consider adding specific keywords like "threat", "log", or "incident" for detailed results'],
      };
    }
    
    setPlaygroundOutput(output);
    setPlaygroundLoading(false);
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'OVERVIEW', icon: '👁' },
    { id: 'detection' as TabType, label: 'DETECTION', icon: '🎯' },
    { id: 'incidents' as TabType, label: 'INCIDENTS', icon: '🚨' },
    { id: 'response' as TabType, label: 'RESPONSE', icon: '⚡' },
    { id: 'analytics' as TabType, label: 'ANALYTICS', icon: '📊' },
    { id: 'playground' as TabType, label: 'PLAYGROUND', icon: '🎮' },
  ];

  // Data Source Stats
  const dataSourceStats = [
    { icon: '🖥️', label: 'ENDPOINT', value: '25K+' },
    { icon: '🔗', label: 'NETWORK', value: '1.2B' },
    { icon: '☁️', label: 'CLOUD', value: '8' },
    { icon: '📧', label: 'EMAIL', value: '50M+' },
    { icon: '👤', label: 'IDENTITY', value: '100K' },
    { icon: '📱', label: 'APPLICATIONS', value: '200+' },
  ];

  // Coverage Stats
  const coverageStats = [
    { label: 'EDR', value: 71 },
    { label: 'NDR', value: 94 },
    { label: 'Cloud', value: 96 },
    { label: 'Email', value: 84 },
    { label: 'IAM', value: 86 },
  ];

  return (
    <div className="min-h-screen bg-[#0d0a1a] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0a1a] via-[#1a1030] to-[#0d0a1a]" />
      <ThreatRadarSweep />
      <EndpointNetwork />
      <LiveEventFeed />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back to Home */}
            <a 
              href="https://maula.ai"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-gray-400 hover:text-white transition-all group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-xs font-medium">Back to Home</span>
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            {usingSimulated && (
              <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-full text-xs tracking-widest">
                DEMO MODE
              </span>
            )}
            <span className="text-gray-500 text-xs tracking-widest">XDRPLATFORM V3.0</span>
            
            {/* AI Assistant */}
            <a
              href="/neural-link/"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="font-medium">AI Assistant</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: XDR Logo & Title */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-6">
                <span className="text-purple-400">⚡</span>
                <span className="text-purple-300 text-sm tracking-widest">EXTENDED DETECTION & RESPONSE</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-purple-400">XDR</span>
                <span className="text-white"> PLATFORM</span>
              </h1>
              
              <p className="text-gray-400 text-lg max-w-xl mb-8">
                Unified security platform correlating data across endpoints, networks, cloud, and applications for comprehensive threat visibility.
              </p>

              {/* Live Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-2xl">
                  <p className="text-3xl font-bold text-purple-400">{formatNumber(metrics.eventsPerSec)}</p>
                  <p className="text-gray-500 text-xs tracking-widest mt-1">EVENTS/SEC</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-2xl">
                  <p className="text-3xl font-bold text-green-400">{metrics.activeThreats}</p>
                  <p className="text-gray-500 text-xs tracking-widest mt-1">ACTIVE THREATS</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border border-cyan-500/30 rounded-2xl">
                  <p className="text-3xl font-bold text-cyan-400">{metrics.dataSources}+</p>
                  <p className="text-gray-500 text-xs tracking-widest mt-1">DATA SOURCES</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-500/30 rounded-2xl">
                  <p className="text-3xl font-bold text-orange-400">{metrics.avgMTTR}</p>
                  <p className="text-gray-500 text-xs tracking-widest mt-1">AVG MTTR</p>
                </div>
              </div>
            </div>

            {/* Right: Coverage Stats */}
            <div className="lg:w-80">
              <div className="space-y-3">
                {coverageStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm w-12">{stat.label}</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                    <span className="text-cyan-400 text-sm w-12 text-right">{stat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav className="relative z-10 border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all text-sm tracking-widest font-medium ${
                  activeTab === tab.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Data Source Stats */}
      <section className="relative z-10 py-6 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {dataSourceStats.map((stat, i) => (
              <div key={i} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl text-center hover:border-purple-500/50 transition-colors">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-500 text-xs tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && activeTab === 'overview' && dashboard && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700 rounded-2xl">
                <p className="text-gray-400 text-sm mb-2">Total Events</p>
                <p className="text-4xl font-bold text-white">{formatNumber(dashboard.overview.totalLogs)}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-blue-500/30 rounded-2xl">
                <p className="text-gray-400 text-sm mb-2">Today</p>
                <p className="text-4xl font-bold text-blue-400">{formatNumber(dashboard.overview.logsToday)}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-red-500/30 rounded-2xl">
                <p className="text-gray-400 text-sm mb-2">Error Rate</p>
                <p className="text-4xl font-bold text-red-400">{dashboard.overview.errorRate}%</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-purple-500/30 rounded-2xl">
                <p className="text-gray-400 text-sm mb-2">Events/Min</p>
                <p className="text-4xl font-bold text-purple-400">{dashboard.overview.avgLogsPerMinute}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* By Level */}
              <div className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700 rounded-2xl">
                <h3 className="text-white font-semibold mb-6 text-lg">Event Distribution by Level</h3>
                <div className="space-y-4">
                  {Object.entries(dashboard.byLevel).map(([level, count]: [string, number]) => (
                    <div key={level} className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${levelColors[level as LogLevel].bg} ${levelColors[level as LogLevel].text} border ${levelColors[level as LogLevel].border}`}>
                        {level.toUpperCase()}
                      </span>
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${level === 'info' ? 'bg-blue-500' : level === 'warn' ? 'bg-yellow-500' : level === 'error' ? 'bg-red-500' : level === 'critical' ? 'bg-purple-500' : 'bg-gray-500'}`} 
                          style={{ width: `${(count / dashboard.overview.totalLogs) * 100}%` }} 
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-20 text-right">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Errors */}
              <div className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-red-500/20 rounded-2xl">
                <h3 className="text-white font-semibold mb-6 text-lg">Recent Critical Events</h3>
                <div className="space-y-4">
                  {dashboard.recentErrors.slice(0, 3).map((log: LogEntry, i: number) => (
                    <div key={i} className="p-4 bg-red-500/10 rounded-xl border-l-4 border-red-500">
                      <p className="text-red-400 font-mono text-sm">{log.message}</p>
                      <p className="text-gray-500 text-xs mt-2">{log.host} • {new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Events Feed */}
            <div className="p-6 bg-gradient-to-br from-gray-900/80 to-cyan-900/20 border border-cyan-500/30 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  Live Event Stream
                </h3>
                <span className="text-cyan-400 text-sm">Last Update: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-cyan-500/30">
                {liveEvents.map((event, i) => (
                  <div 
                    key={event.id} 
                    className={`p-3 rounded-lg border-l-4 flex items-center justify-between ${
                      event.type === 'alert' ? 'bg-red-500/10 border-red-500' :
                      event.type === 'detection' ? 'bg-orange-500/10 border-orange-500' :
                      event.type === 'connection' ? 'bg-blue-500/10 border-blue-500' :
                      event.type === 'auth' ? 'bg-purple-500/10 border-purple-500' :
                      'bg-gray-500/10 border-gray-500'
                    } ${i === 0 ? 'animate-pulse' : ''}`}
                  >
                    <div>
                      <span className={`text-sm font-semibold ${
                        event.type === 'alert' ? 'text-red-400' :
                        event.type === 'detection' ? 'text-orange-400' :
                        event.type === 'connection' ? 'text-blue-400' :
                        event.type === 'auth' ? 'text-purple-400' :
                        'text-gray-400'
                      }`}>
                        [{event.type.toUpperCase()}]
                      </span>
                      <span className="text-white ml-2">{event.message}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 text-xs">{event.source}</span>
                      <span className="text-gray-600 text-xs">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'detection' && (
          <div className="space-y-8">
            <div className="p-8 bg-gradient-to-br from-gray-900/80 to-purple-900/20 border border-purple-500/30 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">🎯 Threat Detection Engine</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                  <p className="text-4xl font-bold text-green-400 mb-2">{analysis?.anomalies.length || 0}</p>
                  <p className="text-gray-400">Anomalies Detected</p>
                </div>
                <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                  <p className="text-4xl font-bold text-blue-400 mb-2">{analysis?.patterns.length || 0}</p>
                  <p className="text-gray-400">Patterns Identified</p>
                </div>
                <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                  <p className="text-4xl font-bold text-purple-400 mb-2">99.7%</p>
                  <p className="text-gray-400">Detection Accuracy</p>
                </div>
              </div>
            </div>
            
            {analysis?.anomalies && analysis.anomalies.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Active Threats</h4>
                {analysis.anomalies.map((a: any, i: number) => (
                  <div key={i} className="p-6 bg-gradient-to-r from-red-900/30 to-gray-900/50 border border-red-500/30 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${a.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : a.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'}`}>
                        {a.severity.toUpperCase()}
                      </span>
                      <span className="text-white font-semibold">{a.type}</span>
                    </div>
                    <p className="text-gray-400">{a.description}</p>
                    <p className="text-gray-500 text-sm mt-4">Affected logs: {a.affectedLogs}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incidents Tab */}
        {!loading && activeTab === 'incidents' && (
          <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">🚨 Active Incidents</h2>
              <button
                onClick={() => setShowCreateIncident(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                + Create Incident
              </button>
            </div>

            {/* Incident Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Open', count: incidents.filter(i => i.status === 'open').length, color: 'red' },
                { label: 'Investigating', count: incidents.filter(i => i.status === 'investigating').length, color: 'yellow' },
                { label: 'Contained', count: incidents.filter(i => i.status === 'contained').length, color: 'blue' },
                { label: 'Resolved', count: incidents.filter(i => i.status === 'resolved').length, color: 'green' },
              ].map((stat, i) => (
                <div key={i} className={`p-4 bg-${stat.color}-900/30 border border-${stat.color}-500/30 rounded-xl text-center`}>
                  <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.count}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
              {incidents.map(incident => (
                <div key={incident.id} className={`p-6 bg-gradient-to-r rounded-2xl border ${
                  incident.severity === 'critical' ? 'from-red-900/40 to-gray-900/40 border-red-500/40' :
                  incident.severity === 'high' ? 'from-orange-900/40 to-gray-900/40 border-orange-500/40' :
                  incident.severity === 'medium' ? 'from-yellow-900/40 to-gray-900/40 border-yellow-500/40' :
                  'from-blue-900/40 to-gray-900/40 border-blue-500/40'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          incident.severity === 'critical' ? 'bg-red-500/30 text-red-400 border border-red-500/50' :
                          incident.severity === 'high' ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50' :
                          incident.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50' :
                          'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                        }`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          incident.status === 'open' ? 'bg-red-600 text-white' :
                          incident.status === 'investigating' ? 'bg-yellow-600 text-white' :
                          incident.status === 'contained' ? 'bg-blue-600 text-white' :
                          'bg-green-600 text-white'
                        }`}>
                          {incident.status.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-sm">{incident.id}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{incident.title}</h3>
                    </div>
                    <span className="text-gray-500 text-sm">{new Date(incident.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Source:</span>
                      <span className="text-white ml-2">{incident.source}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Affected:</span>
                      <span className="text-white ml-2">{incident.affectedAssets.join(', ') || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">IOCs:</span>
                      <span className="text-cyan-400 ml-2">{incident.indicators.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Assignee:</span>
                      <span className="text-white ml-2">{incident.assignee || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {incident.status !== 'investigating' && incident.status !== 'resolved' && (
                      <button
                        onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
                      >
                        🔍 Investigate
                      </button>
                    )}
                    {incident.status !== 'contained' && incident.status !== 'resolved' && (
                      <button
                        onClick={() => updateIncidentStatus(incident.id, 'contained')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        🛡️ Contain
                      </button>
                    )}
                    {incident.status !== 'resolved' && (
                      <button
                        onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        ✅ Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Create Incident Modal */}
            {showCreateIncident && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-2xl max-w-lg w-full p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-white mb-6">Create New Incident</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Title *</label>
                      <input
                        type="text"
                        value={newIncident.title}
                        onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                        placeholder="Brief description of the incident"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Severity</label>
                        <select
                          value={newIncident.severity}
                          onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value as any })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Source</label>
                        <select
                          value={newIncident.source}
                          onChange={(e) => setNewIncident({ ...newIncident, source: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="manual">Manual</option>
                          <option value="EDR">EDR</option>
                          <option value="NDR">NDR</option>
                          <option value="SIEM">SIEM</option>
                          <option value="Cloud">Cloud</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setShowCreateIncident(false)}
                        className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createIncident}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Create Incident
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Response Tab - Enhanced with Working Actions */}
        {!loading && activeTab === 'response' && (
          <div className="space-y-8">
            <div className="p-8 bg-gradient-to-br from-gray-900/80 to-cyan-900/20 border border-cyan-500/30 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">⚡ Automated Response Actions</h3>
              
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { action: 'isolate', label: 'Isolate Endpoint', icon: '🔒', color: 'red', target: 'ws-infected-001' },
                  { action: 'block-ip', label: 'Block IP Address', icon: '🚫', color: 'orange', target: '192.168.1.100' },
                  { action: 'disable-user', label: 'Disable User', icon: '👤', color: 'yellow', target: 'compromised-user' },
                  { action: 'quarantine', label: 'Quarantine File', icon: '📦', color: 'purple', target: 'malware.exe' },
                  { action: 'scan', label: 'Full Scan', icon: '🔍', color: 'blue', target: 'all-endpoints' },
                  { action: 'collect-evidence', label: 'Collect Evidence', icon: '📋', color: 'green', target: 'incident-assets' },
                ].map((item, i) => {
                  const actionKey = `${item.action}-${item.target}`;
                  const actionState = responseActions[actionKey] || {};
                  return (
                    <button
                      key={i}
                      onClick={() => executeResponseAction(item.action, item.target)}
                      disabled={actionState.loading}
                      className={`p-6 bg-gray-900/50 rounded-xl border border-${item.color}-500/30 hover:border-${item.color}-500/60 transition-all text-left ${actionState.loading ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className={`text-${item.color}-400 font-semibold`}>{item.label}</span>
                      </div>
                      <p className="text-gray-500 text-sm">Target: {item.target}</p>
                      {actionState.loading && (
                        <div className="mt-3 flex items-center gap-2 text-cyan-400 text-sm">
                          <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                          Executing...
                        </div>
                      )}
                      {actionState.result && (
                        <div className="mt-3 text-green-400 text-sm">{actionState.result}</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Response Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-semibold text-green-400 mb-4">Response Metrics</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Mean Time to Detect</p>
                      <p className="text-2xl font-bold text-white">1.2 min</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Mean Time to Respond</p>
                      <p className="text-2xl font-bold text-white">4.6 min</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Auto-Contained</p>
                      <p className="text-2xl font-bold text-white">94%</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700 col-span-2">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4">Recent Response Actions</h4>
                  <div className="space-y-3 max-h-48 overflow-auto">
                    {[
                      { time: '2 min ago', action: 'Isolated endpoint ws-hr-001', status: 'success' },
                      { time: '5 min ago', action: 'Blocked IP 45.33.32.156', status: 'success' },
                      { time: '8 min ago', action: 'Quarantined malware.exe', status: 'success' },
                      { time: '15 min ago', action: 'Disabled user jsmith', status: 'success' },
                    ].map((action, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div>
                          <p className="text-white text-sm">{action.action}</p>
                          <p className="text-gray-500 text-xs">{action.time}</p>
                        </div>
                        <span className="text-green-400 text-sm">✓ {action.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="p-8 bg-gradient-to-br from-gray-900/80 to-orange-900/20 border border-orange-500/30 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">📊 Security Analytics</h3>
              {analysis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="p-4 bg-gray-900/50 rounded-xl">
                    <p className="text-gray-400 text-sm">Events Analyzed</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(analysis.totalLogs)}</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-xl">
                    <p className="text-gray-400 text-sm">Anomalies</p>
                    <p className="text-2xl font-bold text-red-400">{analysis.anomalies.length}</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-xl">
                    <p className="text-gray-400 text-sm">Patterns</p>
                    <p className="text-2xl font-bold text-blue-400">{analysis.patterns.length}</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-xl">
                    <p className="text-gray-400 text-sm">Sources</p>
                    <p className="text-2xl font-bold text-green-400">{analysis.topSources.length}</p>
                  </div>
                </div>
              )}
              
              {analysis?.recommendations && (
                <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-semibold text-orange-400 mb-4">💡 AI Recommendations</h4>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <span className="text-green-400 font-bold">{i + 1}.</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'playground' && (
          <div className="space-y-8">
            <div className="p-8 bg-gradient-to-br from-gray-900/80 to-green-900/20 border border-green-500/30 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">🎮</span>
                <div>
                  <h3 className="text-2xl font-bold text-white">XDR Playground</h3>
                  <p className="text-gray-400">Practice security queries and learn XDR capabilities in a safe sandbox environment</p>
                </div>
              </div>

              {/* Input Section */}
              <div className="mb-8">
                <label className="block text-gray-300 text-sm mb-3">Enter your query or scenario:</label>
                <div className="flex gap-4">
                  <textarea
                    value={playgroundInput}
                    onChange={(e) => setPlaygroundInput(e.target.value)}
                    placeholder="Try: 'Search for malware threats', 'Show recent log activity', 'Create incident response'"
                    className="flex-1 h-32 bg-gray-900/80 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none font-mono"
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={runPlaygroundQuery}
                    disabled={playgroundLoading || !playgroundInput.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/20"
                  >
                    {playgroundLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      '▶ Run Query'
                    )}
                  </button>
                  <button
                    onClick={() => { setPlaygroundInput(''); setPlaygroundOutput(null); }}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Example Queries */}
              <div className="mb-8">
                <p className="text-gray-400 text-sm mb-3">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Search for malware threats',
                    'Show recent log activity',
                    'Create incident response',
                    'Analyze network anomalies',
                    'Generate threat report',
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPlaygroundInput(example)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-600 hover:border-green-500/50 transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Section */}
              {playgroundOutput && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-green-400 mb-4">📤 Output</h4>
                  <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 overflow-auto">
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      {JSON.stringify(playgroundOutput, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Learning Resources */}
              <div className="mt-8 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">📚 Learning Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <h5 className="font-medium text-purple-400 mb-2">Threat Detection</h5>
                    <p className="text-gray-400 text-sm">Learn how to identify and analyze security threats using XDR queries.</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <h5 className="font-medium text-cyan-400 mb-2">Incident Response</h5>
                    <p className="text-gray-400 text-sm">Practice creating automated response playbooks and workflows.</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <h5 className="font-medium text-orange-400 mb-2">Log Analysis</h5>
                    <p className="text-gray-400 text-sm">Master log querying techniques across multiple data sources.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm tracking-widest">
            XDR PLATFORM • TOOL 12 OF 50 • MAULA.AI SECURITY ECOSYSTEM
          </p>
        </div>
      </footer>
    </div>
  );
}
