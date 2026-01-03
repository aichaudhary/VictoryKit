/**
 * ThreatModel Tool Component - Tool 18 - Threat Modeling & Analysis
 * Enhanced with AI Analysis, Threat Intelligence, Real-time Collaboration, and Reports
 */
import { useState, useEffect, useRef } from 'react';
import {
  threatModelApi,
  simulatedData,
  type Threat,
  type ThreatDashboard,
  type ThreatModel,
  type STRIDEAnalysis,
  type MITRETechnique,
  type CVE,
  type Report,
  type DREADScore
} from '../api/threatmodel.api';

type TabType = 'dashboard' | 'models' | 'threats' | 'analysis' | 'intel' | 'reports' | 'diagram' | 'mitigations';

export default function ThreatModelTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<ThreatDashboard | null>(null);
  const [models, setModels] = useState<ThreatModel[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [selectedModel, setSelectedModel] = useState<ThreatModel | null>(null);
  const [strideAnalysis, setStrideAnalysis] = useState<STRIDEAnalysis[]>([]);
  const [mitreTechniques, setMitreTechniques] = useState<MITRETechnique[]>([]);
  const [cves, setCves] = useState<CVE[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [analyzing, setAnalyzing] = useState(false);

  const wsRef = useRef<any>(null);

  useEffect(() => {
    loadDashboard();
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'models') loadModels();
    if (activeTab === 'threats') loadThreats();
    if (activeTab === 'analysis') loadAnalysis();
    if (activeTab === 'intel') loadIntelData();
    if (activeTab === 'reports') loadReports();
  }, [activeTab]);

  async function connectWebSocket() {
    try {
      await threatModelApi.ws.connect();
      setWsConnected(true);
      wsRef.current = threatModelApi.ws;

      // Subscribe to real-time updates
      threatModelApi.ws.on('threat_update', (data: any) => {
        console.log('Real-time threat update:', data);
        loadDashboard();
      });

      threatModelApi.ws.on('model_update', (data: any) => {
        console.log('Real-time model update:', data);
        if (activeTab === 'models') loadModels();
      });
    } catch (e) {
      console.error('WebSocket connection failed:', e);
      setWsConnected(false);
    }
  }

  async function loadDashboard() {
    setLoading(true);
    try {
      const r = await threatModelApi.getDashboard();
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

  async function loadModels() {
    setLoading(true);
    try {
      const r = await threatModelApi.getModels();
      if (r.success && r.data) {
        setModels(r.data);
        setUsingSimulated(false);
      } else {
        setModels(simulatedData.models);
        setUsingSimulated(true);
      }
    } catch {
      setModels(simulatedData.models);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadThreats() {
    setLoading(true);
    try {
      const r = await threatModelApi.getThreats();
      if (r.success && r.data) {
        setThreats(r.data);
        setUsingSimulated(false);
      } else {
        setThreats(simulatedData.threats);
        setUsingSimulated(true);
      }
    } catch {
      setThreats(simulatedData.threats);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalysis() {
    if (!selectedModel) return;
    setAnalyzing(true);
    try {
      const r = await threatModelApi.generateSTRIDE(selectedModel._id);
      if (r.success && r.data) {
        setStrideAnalysis(r.data);
      } else {
        setStrideAnalysis(simulatedData.strideAnalysis);
      }
    } catch {
      setStrideAnalysis(simulatedData.strideAnalysis);
    } finally {
      setAnalyzing(false);
    }
  }

  async function loadIntelData() {
    setLoading(true);
    try {
      const [mitreRes, owaspRes] = await Promise.all([
        threatModelApi.getMITRETechniques(),
        threatModelApi.getOWASPTop10()
      ]);
      if (mitreRes.success && mitreRes.data) {
        setMitreTechniques(mitreRes.data);
      } else {
        setMitreTechniques(simulatedData.mitreTechniques);
      }
    } catch {
      setMitreTechniques(simulatedData.mitreTechniques);
    } finally {
      setLoading(false);
    }
  }

  async function loadReports() {
    // Reports would be loaded from API in real implementation
    setReports([]);
  }

  async function runAIAnalysis(modelId: string) {
    setAnalyzing(true);
    try {
      const r = await threatModelApi.analyzeModel(modelId);
      if (r.success && r.data) {
        console.log('AI Analysis complete:', r.data);
        // Update UI with results
        loadDashboard();
      }
    } catch (e) {
      console.error('AI Analysis failed:', e);
    } finally {
      setAnalyzing(false);
    }
  }

  async function searchCVEs(query: string) {
    try {
      const r = await threatModelApi.searchCVEs(query);
      if (r.success && r.data) {
        setCves(r.data);
      }
    } catch (e) {
      console.error('CVE search failed:', e);
    }
  }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-orange-500/20">
            <p className="text-gray-400 text-sm">Total Models</p>
            <p className="text-2xl font-bold text-orange-400">{dashboard.overview.totalModels}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-gray-400 text-sm">Total Threats</p>
            <p className="text-2xl font-bold text-yellow-400">{dashboard.overview.totalThreats}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
            <p className="text-gray-400 text-sm">Mitigated</p>
            <p className="text-2xl font-bold text-green-400">{dashboard.overview.mitigatedThreats}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20">
            <p className="text-gray-400 text-sm">Critical</p>
            <p className="text-2xl font-bold text-red-400">{dashboard.overview.criticalThreats}</p>
          </div>
        </div>

        {/* STRIDE Breakdown */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">STRIDE Analysis Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dashboard.strideBreakdown.map((item, idx) => (
              <div key={idx} className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">{item.category}</span>
                  <span className="text-orange-400 font-semibold">{item.count}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
                <span className="text-gray-500 text-xs">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Threats */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Recent Threats</h3>
          <div className="space-y-3">
            {dashboard.recentThreats.map(t => (
              <div key={t._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${
                    t.severity === 'critical' ? 'bg-red-500' :
                    t.severity === 'high' ? 'bg-orange-500' :
                    t.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="text-white">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.category} • {t.type} • Risk: {t.riskScore?.toFixed(1) || 'N/A'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  t.status === 'mitigated' ? 'bg-green-900/30 text-green-400' :
                  t.status === 'analyzing' ? 'bg-blue-900/30 text-blue-400' :
                  'bg-orange-900/30 text-orange-400'
                }`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Compliance Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboard.complianceStatus.map((item, idx) => (
              <div key={idx} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">{item.framework}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'compliant' ? 'bg-green-900/30 text-green-400' :
                    item.status === 'partial' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>{item.status}</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">{item.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderModels() {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold">Threat Models</h3>
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
            + New Model
          </button>
        </div>

        <div className="grid gap-4">
          {models.map(m => (
            <div key={m._id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold text-lg">{m.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      m.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                      m.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400' :
                      m.status === 'review' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-gray-900/30 text-gray-400'
                    }`}>{m.status}</span>
                    <span className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-xs">
                      {m.methodology}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3">{m.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Scope: {m.scope}</span>
                    <span>Assets: {m.assets.length}</span>
                    <span>Threats: {m.threats.length}</span>
                    <span>Risk: <span className={`font-semibold ${
                      m.riskLevel === 'critical' ? 'text-red-400' :
                      m.riskLevel === 'high' ? 'text-orange-400' :
                      m.riskLevel === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{m.riskLevel}</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedModel(m)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => runAIAnalysis(m._id)}
                    disabled={analyzing}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
                  >
                    {analyzing ? 'Analyzing...' : 'AI Analyze'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderThreats() {
    const filteredThreats = threats.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = filterSeverity === 'all' || t.severity === filterSeverity;
      return matchesSearch && matchesSeverity;
    });

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold">Threat Library</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search threats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredThreats.map(t => (
            <div key={t._id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold">{t.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      t.severity === 'critical' ? 'bg-red-900/30 text-red-400' :
                      t.severity === 'high' ? 'bg-orange-900/30 text-orange-400' :
                      t.severity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-green-900/30 text-green-400'
                    }`}>{t.severity}</span>
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3">{t.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Type: {t.type}</span>
                    <span>Likelihood: {(t.likelihood * 100).toFixed(0)}%</span>
                    <span>Impact: {(t.impact * 100).toFixed(0)}%</span>
                    <span>Risk Score: {t.riskScore?.toFixed(1) || 'N/A'}</span>
                  </div>
                  {t.assets.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-500 text-sm">Assets: </span>
                      <span className="text-gray-400 text-sm">{t.assets.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    t.status === 'mitigated' ? 'bg-green-900/30 text-green-400' :
                    t.status === 'analyzing' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-orange-900/30 text-orange-400'
                  }`}>{t.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderAnalysis() {
    if (!selectedModel) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Select a threat model to view AI analysis</p>
          <button
            onClick={() => setActiveTab('models')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
          >
            Select Model
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold">AI Threat Analysis - {selectedModel.name}</h3>
          <button
            onClick={() => runAIAnalysis(selectedModel._id)}
            disabled={analyzing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {analyzing ? '🔄 Analyzing...' : '🚀 Run AI Analysis'}
          </button>
        </div>

        {strideAnalysis.length > 0 && (
          <div className="grid gap-4">
            {strideAnalysis.map((analysis, idx) => (
              <div key={idx} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-semibold">{analysis.category} - {analysis.threatType}</h4>
                    <p className="text-gray-400">{analysis.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">{analysis.riskScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Risk Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-gray-500 text-sm">Likelihood</span>
                    <div className="text-white font-semibold">{(analysis.likelihood * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Impact</span>
                    <div className="text-white font-semibold">{(analysis.impact * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Affected Components</span>
                    <div className="text-white font-semibold">{analysis.affectedComponents.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Mitigations</span>
                    <div className="text-white font-semibold">{analysis.suggestedMitigations.length}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-gray-300 font-medium">Suggested Mitigations:</h5>
                  <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                    {analysis.suggestedMitigations.map((mitigation, i) => (
                      <li key={i}>{mitigation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {strideAnalysis.length === 0 && !analyzing && (
          <div className="text-center py-12">
            <p className="text-gray-400">No analysis data available. Run AI analysis to get started.</p>
          </div>
        )}
      </div>
    );
  }

  function renderIntel() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold">Threat Intelligence</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search CVEs..."
              onKeyPress={(e) => e.key === 'Enter' && searchCVEs((e.target as HTMLInputElement).value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
            <button
              onClick={() => searchCVEs('recent')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
            >
              Search
            </button>
          </div>
        </div>

        {/* MITRE ATT&CK */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h4 className="text-white font-semibold mb-4">MITRE ATT&CK Techniques</h4>
          <div className="grid gap-3">
            {mitreTechniques.slice(0, 5).map((technique) => (
              <div key={technique.id} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-orange-400 font-mono text-sm">{technique.id}</span>
                    <h5 className="text-white font-medium">{technique.name}</h5>
                  </div>
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                    {technique.tactic}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{technique.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Platforms: {technique.platforms.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CVEs */}
        {cves.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-white font-semibold mb-4">Recent CVEs</h4>
            <div className="grid gap-3">
              {cves.slice(0, 5).map((cve) => (
                <div key={cve.id} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-red-400 font-mono text-sm">{cve.id}</span>
                      <h5 className="text-white font-medium">{cve.description}</h5>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-400">{cve.cvssScore}</div>
                      <div className="text-xs text-gray-500">CVSS Score</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Severity: <span className={`font-semibold ${
                      cve.severity === 'CRITICAL' ? 'text-red-400' :
                      cve.severity === 'HIGH' ? 'text-orange-400' :
                      cve.severity === 'MEDIUM' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{cve.severity}</span></span>
                    <span>Published: {new Date(cve.publishedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderReports() {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold">Reports & Exports</h3>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
            + Generate Report
          </button>
        </div>

        <div className="grid gap-4">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No reports generated yet</p>
              <p className="text-gray-500 text-sm">Generate reports from threat models to get started</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">{report.name}</h4>
                    <p className="text-gray-400 text-sm">{report.type} • {report.format.toUpperCase()}</p>
                    <p className="text-gray-500 text-xs">Generated: {new Date(report.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                      Download
                    </button>
                    <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'models' as TabType, label: 'Models', icon: '🗂️' },
    { id: 'threats' as TabType, label: 'Threats', icon: '⚠️' },
    { id: 'analysis' as TabType, label: 'AI Analysis', icon: '🤖' },
    { id: 'intel' as TabType, label: 'Intelligence', icon: '🔍' },
    { id: 'reports' as TabType, label: 'Reports', icon: '📄' },
    { id: 'diagram' as TabType, label: 'Diagram', icon: '📐' },
    { id: 'mitigations' as TabType, label: 'Mitigations', icon: '🛡️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
                🎯
              </div>
              <div>
                <h1 className="text-xl font-bold">ThreatModel</h1>
                <p className="text-gray-400 text-sm">AI-Powered Threat Modeling & Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {wsConnected && (
                <span className="px-3 py-1 bg-green-900/30 border border-green-500/30 text-green-400 rounded-full text-sm">
                  🔗 Real-time
                </span>
              )}
              {usingSimulated && (
                <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">
                  🔄 Simulation Mode
                </span>
              )}
            </div>
          </div>
          <nav className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
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
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'models' && renderModels()}
        {!loading && activeTab === 'threats' && renderThreats()}
        {!loading && activeTab === 'analysis' && renderAnalysis()}
        {!loading && activeTab === 'intel' && renderIntel()}
        {!loading && activeTab === 'reports' && renderReports()}
        {!loading && activeTab === 'diagram' && (
          <div className="text-gray-400 text-center py-12">Threat model diagram editor coming soon...</div>
        )}
        {!loading && activeTab === 'mitigations' && (
          <div className="text-gray-400 text-center py-12">Mitigation management coming soon...</div>
        )}
      </main>

      <footer className="border-t border-gray-800 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          ThreatModel Tool 18 • VictoryKit Security Platform • AI-Powered Threat Analysis
        </div>
      </footer>
    </div>
  );
}
