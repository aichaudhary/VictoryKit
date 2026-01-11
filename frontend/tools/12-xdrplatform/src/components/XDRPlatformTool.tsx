/**
 * XDRPlatform Tool Component
 * Tool 12 - AI-Powered Log Analysis & SIEM Integration
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { logAnalyzerApi, simulatedData, type LogEntry, type LogDashboard, type LogAnalysisResult, type LogLevel, type LogSource } from '../api/loganalyzer.api';

const levelColors: Record<LogLevel, { bg: string; text: string }> = {
  debug: { bg: 'bg-gray-600', text: 'text-gray-300' },
  info: { bg: 'bg-blue-600', text: 'text-blue-300' },
  warn: { bg: 'bg-yellow-600', text: 'text-yellow-300' },
  error: { bg: 'bg-red-600', text: 'text-red-300' },
  critical: { bg: 'bg-purple-600', text: 'text-purple-300' },
};

type TabType = 'dashboard' | 'logs' | 'analysis' | 'anomalies';

export default function XDRPlatformTool() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<LogDashboard | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analysis, setAnalysis] = useState<LogAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LogSource | ''>('');

  useEffect(() => { loadDashboard(); }, []);

  useEffect(() => {
    if (activeTab === 'logs') loadLogs();
    if (activeTab === 'analysis') loadAnalysis();
  }, [activeTab, levelFilter, sourceFilter]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const response = await logAnalyzerApi.getDashboard();
      if (response.success && response.data) {
        setDashboard(response.data);
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

  async function loadLogs() {
    setLoading(true);
    try {
      const query: any = { limit: 100 };
      if (searchQuery) query.search = searchQuery;
      if (levelFilter) query.level = levelFilter;
      if (sourceFilter) query.source = sourceFilter;
      
      const response = await logAnalyzerApi.queryLogs(query);
      if (response.success && response.data) {
        setLogs(response.data.logs);
        setUsingSimulated(false);
      } else {
        let filtered = simulatedData.logs;
        if (levelFilter) filtered = filtered.filter(l => l.level === levelFilter);
        if (sourceFilter) filtered = filtered.filter(l => l.source === sourceFilter);
        setLogs(filtered);
        setUsingSimulated(true);
      }
    } catch {
      setLogs(simulatedData.logs);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalysis() {
    setLoading(true);
    try {
      const response = await logAnalyzerApi.analyzeLogs({});
      if (response.success && response.data) {
        setAnalysis(response.data);
        setUsingSimulated(false);
      } else {
        setAnalysis(simulatedData.analysis);
        setUsingSimulated(true);
      }
    } catch {
      setAnalysis(simulatedData.analysis);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  function formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
            <p className="text-gray-400 text-sm">Total Logs</p>
            <p className="text-2xl font-bold text-green-400">{formatNumber(dashboard.overview.totalLogs)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20">
            <p className="text-gray-400 text-sm">Today</p>
            <p className="text-2xl font-bold text-blue-400">{formatNumber(dashboard.overview.logsToday)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20">
            <p className="text-gray-400 text-sm">Error Rate</p>
            <p className="text-2xl font-bold text-red-400">{dashboard.overview.errorRate}%</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
            <p className="text-gray-400 text-sm">Logs/Min</p>
            <p className="text-2xl font-bold text-purple-400">{dashboard.overview.avgLogsPerMinute}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">By Level</h3>
            <div className="space-y-3">
              {Object.entries(dashboard.byLevel).map(([level, count]) => (
                <div key={level} className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs ${levelColors[level as LogLevel].bg}`}>{level.toUpperCase()}</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${levelColors[level as LogLevel].bg}`} style={{ width: `${(count / dashboard.overview.totalLogs) * 100}%` }} />
                  </div>
                  <span className="text-gray-400 text-sm">{formatNumber(count)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Recent Errors</h3>
            <div className="space-y-3">
              {dashboard.recentErrors.map((log, i) => (
                <div key={i} className="p-3 bg-gray-900/50 rounded-lg border-l-2 border-red-500">
                  <p className="text-red-400 text-sm font-mono">{log.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{log.host} • {new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderLogs() {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search logs..." className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" />
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as LogLevel | '')} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
            <option value="">All Levels</option>
            {['debug', 'info', 'warn', 'error', 'critical'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as LogSource | '')} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
            <option value="">All Sources</option>
            {['application', 'system', 'security', 'network', 'database', 'web'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={loadLogs} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Search</button>
        </div>

        <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border-b border-gray-800 hover:bg-gray-800/50 log-line">
                <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${levelColors[log.level].bg}`}>{log.level.toUpperCase()}</span>
                <span className="text-cyan-400 text-sm">[{log.source}]</span>
                <span className="text-gray-300 flex-1">{log.message}</span>
                {log.host && <span className="text-gray-500 text-sm">{log.host}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderAnalysis() {
    if (!analysis) return <div className="text-gray-400">Loading analysis...</div>;
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-white font-semibold">AI Analysis</h3>
            {analysis.simulated && <span className="text-yellow-500 text-sm">(Simulated)</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-gray-900/50 rounded-lg"><p className="text-gray-400 text-sm">Logs Analyzed</p><p className="text-xl font-bold text-white">{formatNumber(analysis.totalLogs)}</p></div>
            <div className="p-3 bg-gray-900/50 rounded-lg"><p className="text-gray-400 text-sm">Anomalies</p><p className="text-xl font-bold text-red-400">{analysis.anomalies.length}</p></div>
            <div className="p-3 bg-gray-900/50 rounded-lg"><p className="text-gray-400 text-sm">Patterns</p><p className="text-xl font-bold text-blue-400">{analysis.patterns.length}</p></div>
            <div className="p-3 bg-gray-900/50 rounded-lg"><p className="text-gray-400 text-sm">Sources</p><p className="text-xl font-bold text-green-400">{analysis.topSources.length}</p></div>
          </div>
          <div>
            <h4 className="text-gray-300 font-medium mb-2">💡 Recommendations</h4>
            <ul className="space-y-1">{analysis.recommendations.map((r, i) => <li key={i} className="text-gray-400 text-sm flex gap-2"><span className="text-green-400">{i + 1}.</span>{r}</li>)}</ul>
          </div>
        </div>

        {analysis.anomalies.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-red-500/30">
            <h3 className="text-white font-semibold mb-4">🚨 Anomalies Detected</h3>
            <div className="space-y-3">
              {analysis.anomalies.map((a, i) => (
                <div key={i} className="p-4 bg-gray-900/50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${a.severity === 'high' ? 'bg-red-600' : a.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'}`}>{a.severity.toUpperCase()}</span>
                    <span className="text-white font-medium">{a.type}</span>
                  </div>
                  <p className="text-gray-400">{a.description}</p>
                  <p className="text-gray-500 text-sm mt-2">Affected logs: {a.affectedLogs}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'logs' as TabType, label: 'Logs', icon: '📜' },
    { id: 'analysis' as TabType, label: 'AI Analysis', icon: '🤖' },
    { id: 'anomalies' as TabType, label: 'Anomalies', icon: '🚨' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-green-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="https://maula.ai"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                MAULA.AI
              </a>
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">📜</div>
              <div><h1 className="text-xl font-bold">XDRPlatform</h1><p className="text-gray-400 text-sm">AI-Powered Log Analysis</p></div>
            </div>
            {usingSimulated && <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">🔄 Simulation Mode</span>}
            <button onClick={() => navigate('/maula/ai')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl">
              <span>✨</span><span>AI Assistant</span>
            </button>
          </div>
          <nav className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-green-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}>
                <span className="mr-2">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'logs' && renderLogs()}
        {!loading && (activeTab === 'analysis' || activeTab === 'anomalies') && renderAnalysis()}
      </main>

      <footer className="border-t border-gray-800 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">XDRPlatform Tool 12 • VictoryKit Security Platform</div>
      </footer>
    </div>
  );
}
