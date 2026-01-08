/**
 * IncidentResponse Tool Component
 * Tool 11 - AI-Powered Security Incident Management
 * 
 * React component for managing security incidents, playbooks, and response workflows
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  incidentResponseApi,
  simulatedData,
  type Incident,
  type IncidentDashboard,
  type Playbook,
  type AIAnalysis,
  type IncidentSeverity,
  type IncidentStatus,
  type IncidentCategory,
} from '../api/incidentresponse.api';

// ============= Severity Colors =============

const severityColors: Record<IncidentSeverity, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-500' },
  high: { bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-500' },
  medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-500' },
  low: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-500' },
  informational: { bg: 'bg-gray-900/30', text: 'text-gray-400', border: 'border-gray-500' },
};

const statusColors: Record<IncidentStatus, { bg: string; text: string }> = {
  open: { bg: 'bg-red-600', text: 'text-white' },
  investigating: { bg: 'bg-yellow-600', text: 'text-white' },
  contained: { bg: 'bg-blue-600', text: 'text-white' },
  eradicated: { bg: 'bg-purple-600', text: 'text-white' },
  recovered: { bg: 'bg-teal-600', text: 'text-white' },
  closed: { bg: 'bg-green-600', text: 'text-white' },
};

// ============= Sub-Components =============

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

function StatsCard({ title, value, subtitle, icon, trend, color = 'rose' }: StatsCardProps) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-gray-400';

  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 border border-${color}-500/20 hover:border-${color}-500/40 transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && <span className={`${trendColor} text-sm font-medium`}>{trendIcon}</span>}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-400 text-sm">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

interface IncidentCardProps {
  incident: Incident;
  onSelect: (incident: Incident) => void;
}

function IncidentCard({ incident, onSelect }: IncidentCardProps) {
  const severity = severityColors[incident.severity];
  const status = statusColors[incident.status];
  const timeAgo = getTimeAgo(incident.createdAt);

  return (
    <div
      className={`bg-gray-800/50 rounded-xl p-4 border ${severity.border} border-opacity-50 hover:border-opacity-100 cursor-pointer transition-all hover:bg-gray-800/70`}
      onClick={() => onSelect(incident)}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${severity.bg} ${severity.text}`}>
          {incident.severity.toUpperCase()}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.text}`}>
          {incident.status}
        </span>
      </div>
      
      <h3 className="text-white font-semibold mb-1 line-clamp-2">{incident.title}</h3>
      <p className="text-gray-400 text-sm mb-3">{incident.incidentId}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>📁 {incident.category}</span>
        <span>🕐 {timeAgo}</span>
      </div>
      
      {incident.assignee && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <span className="text-xs text-gray-400">👤 {incident.assignee}</span>
        </div>
      )}
    </div>
  );
}

interface PlaybookCardProps {
  playbook: Playbook;
  onExecute?: (playbook: Playbook) => void;
}

function PlaybookCard({ playbook, onExecute }: PlaybookCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xl">📋</span>
        {playbook.automatable && (
          <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">Auto</span>
        )}
      </div>
      
      <h3 className="text-white font-semibold mb-1">{playbook.name}</h3>
      <p className="text-gray-400 text-sm mb-3">{playbook.description}</p>
      
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <span>📊 {playbook.steps.length} steps</span>
        <span>⏱️ ~{playbook.estimatedTime}min</span>
      </div>
      
      {onExecute && (
        <button
          onClick={() => onExecute(playbook)}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
        >
          Execute Playbook
        </button>
      )}
    </div>
  );
}

function AnalysisPanel({ analysis }: { analysis: AIAnalysis }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🤖</span>
        <div>
          <h3 className="text-white font-semibold">AI Analysis</h3>
          <p className="text-gray-400 text-sm">
            Confidence: {(analysis.confidence * 100).toFixed(0)}%
            {analysis.simulated && <span className="ml-2 text-yellow-500">(Simulated)</span>}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-gray-300 font-medium mb-2">🔍 Findings</h4>
          <ul className="space-y-1">
            {analysis.findings.map((finding, i) => (
              <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                {finding}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-gray-300 font-medium mb-2">💡 Recommendations</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                <span className="text-green-400">{i + 1}.</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {analysis.threatActorProfile && (
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <h4 className="text-gray-300 font-medium mb-2">👤 Threat Actor Profile</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Likelihood:</span>
                <span className="text-white ml-2">{analysis.threatActorProfile.likelihood}</span>
              </div>
              <div>
                <span className="text-gray-500">Motivation:</span>
                <span className="text-white ml-2">{analysis.threatActorProfile.motivation}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============= Helper Functions =============

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

// ============= Main Component =============

type TabType = 'dashboard' | 'incidents' | 'playbooks' | 'create';

export default function IncidentResponseTool() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<IncidentDashboard | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingSimulated, setUsingSimulated] = useState(false);

  // Filter states
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | ''>('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('');

  // New incident form
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'medium' as IncidentSeverity,
    category: 'other' as IncidentCategory,
  });

  // ============= Data Fetching =============

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'incidents') {
      loadIncidents();
    } else if (activeTab === 'playbooks') {
      loadPlaybooks();
    }
  }, [activeTab, severityFilter, statusFilter]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const response = await incidentResponseApi.getDashboard();
      if (response.success && response.data) {
        setDashboard(response.data);
        setUsingSimulated(false);
      } else {
        // Use simulated data
        setDashboard(simulatedData.dashboard);
        setUsingSimulated(true);
      }
    } catch (err) {
      setDashboard(simulatedData.dashboard);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadIncidents() {
    setLoading(true);
    try {
      const filters: any = {};
      if (severityFilter) filters.severity = severityFilter;
      if (statusFilter) filters.status = statusFilter;

      const response = await incidentResponseApi.getIncidents(filters);
      if (response.success && response.data) {
        setIncidents(response.data.incidents);
        setUsingSimulated(false);
      } else {
        // Generate simulated incidents
        const simIncidents = [
          simulatedData.generateIncident('critical', 'investigating'),
          simulatedData.generateIncident('high', 'open'),
          simulatedData.generateIncident('medium', 'contained'),
          simulatedData.generateIncident('low', 'closed'),
        ];
        setIncidents(simIncidents);
        setUsingSimulated(true);
      }
    } catch (err) {
      const simIncidents = [
        simulatedData.generateIncident('critical', 'investigating'),
        simulatedData.generateIncident('high', 'open'),
      ];
      setIncidents(simIncidents);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadPlaybooks() {
    setLoading(true);
    try {
      const response = await incidentResponseApi.getPlaybooks();
      if (response.success && response.data) {
        setPlaybooks(response.data.playbooks);
        setUsingSimulated(false);
      } else {
        setPlaybooks(simulatedData.playbooks);
        setUsingSimulated(true);
      }
    } catch (err) {
      setPlaybooks(simulatedData.playbooks);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeIncident(incident: Incident) {
    setLoading(true);
    try {
      const response = await incidentResponseApi.analyzeIncident(incident.incidentId);
      if (response.success && response.data) {
        setAnalysis(response.data);
      } else {
        setAnalysis(simulatedData.aiAnalysis);
      }
    } catch (err) {
      setAnalysis(simulatedData.aiAnalysis);
    } finally {
      setLoading(false);
    }
  }

  async function createIncident() {
    if (!newIncident.title) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await incidentResponseApi.createIncident(newIncident);
      if (response.success && response.data) {
        setIncidents([response.data.incident, ...incidents]);
        setNewIncident({ title: '', description: '', severity: 'medium', category: 'other' });
        setActiveTab('incidents');
      } else {
        // Simulate creation
        const simIncident = {
          ...simulatedData.generateIncident(newIncident.severity, 'open'),
          title: newIncident.title,
          description: newIncident.description,
          category: newIncident.category,
        };
        setIncidents([simIncident, ...incidents]);
        setNewIncident({ title: '', description: '', severity: 'medium', category: 'other' });
        setActiveTab('incidents');
        setUsingSimulated(true);
      }
    } catch (err) {
      setError('Failed to create incident');
    } finally {
      setLoading(false);
    }
  }

  async function updateIncidentStatus(incident: Incident, status: IncidentStatus) {
    try {
      const response = await incidentResponseApi.updateStatus(incident.incidentId, status);
      if (response.success && response.data) {
        setIncidents(incidents.map(i =>
          i.incidentId === incident.incidentId ? response.data!.incident : i
        ));
        if (selectedIncident?.incidentId === incident.incidentId) {
          setSelectedIncident(response.data.incident);
        }
      } else {
        // Simulate update
        const updated = { ...incident, status, updatedAt: new Date().toISOString() };
        setIncidents(incidents.map(i => i.incidentId === incident.incidentId ? updated : i));
        if (selectedIncident?.incidentId === incident.incidentId) {
          setSelectedIncident(updated);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }

  // ============= Render Functions =============

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading dashboard...</div>;

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatsCard
            icon="🚨"
            title="Open Incidents"
            value={dashboard.overview.open}
            trend="up"
            color="red"
          />
          <StatsCard
            icon="🔍"
            title="Investigating"
            value={dashboard.overview.investigating}
            color="yellow"
          />
          <StatsCard
            icon="🛡️"
            title="Contained"
            value={dashboard.overview.contained}
            color="blue"
          />
          <StatsCard
            icon="✅"
            title="Closed (30d)"
            value={dashboard.overview.closed}
            trend="down"
            color="green"
          />
          <StatsCard
            icon="📊"
            title="Total"
            value={dashboard.overview.total}
            color="purple"
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-gray-400 text-sm">Avg Time to Detect</p>
            <p className="text-2xl font-bold text-cyan-400">{formatMinutes(dashboard.metrics.avgTimeToDetect)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20">
            <p className="text-gray-400 text-sm">Avg Time to Contain</p>
            <p className="text-2xl font-bold text-blue-400">{formatMinutes(dashboard.metrics.avgTimeToContain)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
            <p className="text-gray-400 text-sm">Avg Time to Resolve</p>
            <p className="text-2xl font-bold text-purple-400">{formatMinutes(dashboard.metrics.avgTimeToResolve)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-rose-500/20">
            <p className="text-gray-400 text-sm">MTTR</p>
            <p className="text-2xl font-bold text-rose-400">{formatMinutes(dashboard.metrics.mttr)}</p>
          </div>
        </div>

        {/* Severity & Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">By Severity</h3>
            <div className="space-y-3">
              {Object.entries(dashboard.bySeverity).map(([sev, count]) => (
                <div key={sev} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${severityColors[sev as IncidentSeverity].border.replace('border', 'bg')}`} />
                  <span className="text-gray-300 capitalize flex-1">{sev}</span>
                  <span className="text-white font-medium">{count}</span>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${severityColors[sev as IncidentSeverity].border.replace('border', 'bg')}`}
                      style={{ width: `${(count / dashboard.overview.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">By Category</h3>
            <div className="space-y-3">
              {Object.entries(dashboard.byCategory).slice(0, 5).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-gray-300 capitalize flex-1">{cat.replace('-', ' ')}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trending */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Trending Categories</h3>
          <div className="flex flex-wrap gap-3">
            {dashboard.trending.map((item, i) => (
              <div
                key={i}
                className={`px-4 py-2 rounded-lg border ${
                  item.trend === 'up'
                    ? 'border-red-500/30 bg-red-900/20 text-red-400'
                    : item.trend === 'down'
                    ? 'border-green-500/30 bg-green-900/20 text-green-400'
                    : 'border-gray-500/30 bg-gray-900/20 text-gray-400'
                }`}
              >
                <span className="capitalize">{item.category}</span>
                <span className="ml-2 font-medium">{item.count}</span>
                <span className="ml-1">
                  {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderIncidents() {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as IncidentSeverity | '')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="informational">Informational</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | '')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="eradicated">Eradicated</option>
            <option value="recovered">Recovered</option>
            <option value="closed">Closed</option>
          </select>

          <button
            onClick={() => setActiveTab('create')}
            className="ml-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
          >
            + New Incident
          </button>
        </div>

        {/* Incidents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.incidentId}
              incident={incident}
              onSelect={(inc) => {
                setSelectedIncident(inc);
                analyzeIncident(inc);
              }}
            />
          ))}
        </div>

        {incidents.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p>No incidents found matching your filters</p>
          </div>
        )}

        {/* Selected Incident Detail Modal */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-700 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded ${severityColors[selectedIncident.severity].bg} ${severityColors[selectedIncident.severity].text}`}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded ${statusColors[selectedIncident.status].bg} ${statusColors[selectedIncident.status].text}`}>
                      {selectedIncident.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedIncident.title}</h2>
                  <p className="text-gray-400">{selectedIncident.incidentId}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedIncident(null);
                    setAnalysis(null);
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  {selectedIncident.status !== 'investigating' && (
                    <button
                      onClick={() => updateIncidentStatus(selectedIncident, 'investigating')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
                    >
                      🔍 Investigate
                    </button>
                  )}
                  {selectedIncident.status !== 'contained' && (
                    <button
                      onClick={() => updateIncidentStatus(selectedIncident, 'contained')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      🛡️ Contain
                    </button>
                  )}
                  {selectedIncident.status !== 'closed' && (
                    <button
                      onClick={() => updateIncidentStatus(selectedIncident, 'closed')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                    >
                      ✅ Close
                    </button>
                  )}
                </div>

                {/* Description */}
                {selectedIncident.description && (
                  <div>
                    <h3 className="text-gray-300 font-medium mb-2">Description</h3>
                    <p className="text-gray-400">{selectedIncident.description}</p>
                  </div>
                )}

                {/* Affected Assets */}
                {selectedIncident.affectedAssets.length > 0 && (
                  <div>
                    <h3 className="text-gray-300 font-medium mb-2">Affected Assets</h3>
                    <div className="space-y-2">
                      {selectedIncident.affectedAssets.map((asset, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <span className="text-lg">💻</span>
                          <div>
                            <p className="text-white">{asset.name}</p>
                            <p className="text-gray-500 text-sm">{asset.type} • {asset.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indicators */}
                {selectedIncident.indicators.length > 0 && (
                  <div>
                    <h3 className="text-gray-300 font-medium mb-2">Indicators of Compromise</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.indicators.map((ioc, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-sm text-gray-300"
                        >
                          {ioc.type}: {ioc.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                {analysis && <AnalysisPanel analysis={analysis} />}

                {/* Timeline */}
                {selectedIncident.timeline.length > 0 && (
                  <div>
                    <h3 className="text-gray-300 font-medium mb-2">Timeline</h3>
                    <div className="space-y-3 border-l-2 border-gray-700 pl-4">
                      {selectedIncident.timeline.map((entry, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[21px] w-3 h-3 bg-rose-500 rounded-full border-2 border-gray-900" />
                          <p className="text-white font-medium">{entry.action}</p>
                          <p className="text-gray-400 text-sm">{entry.details}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(entry.timestamp).toLocaleString()} • {entry.performedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderPlaybooks() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Response Playbooks</h2>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            + Create Playbook
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playbooks.map((playbook) => (
            <PlaybookCard key={playbook.playbookId} playbook={playbook} />
          ))}
        </div>

        {playbooks.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-4">📋</p>
            <p>No playbooks available</p>
          </div>
        )}
      </div>
    );
  }

  function renderCreateForm() {
    const categories: IncidentCategory[] = [
      'malware', 'phishing', 'data-breach', 'ddos', 'unauthorized-access', 'insider-threat', 'ransomware', 'other'
    ];

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Create New Incident</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                placeholder="Brief description of the incident"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                placeholder="Detailed description..."
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-rose-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Severity</label>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value as IncidentSeverity })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="informational">Informational</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Category</label>
                <select
                  value={newIncident.category}
                  onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value as IncidentCategory })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-rose-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setActiveTab('incidents')}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createIncident}
                disabled={loading}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Incident'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============= Main Render =============

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'incidents', label: 'Incidents', icon: '🚨' },
    { id: 'playbooks', label: 'Playbooks', icon: '📋' },
    { id: 'create', label: 'New Incident', icon: '➕' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-rose-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center">
                🚨
              </div>
              <div>
                <h1 className="text-xl font-bold">IncidentResponse</h1>
                <p className="text-gray-400 text-sm">AI-Powered Security Incident Management</p>
              </div>
            </div>

            {usingSimulated && (
              <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">
                🔄 Simulation Mode
              </span>
            )}

            {/* AI Assistant Button */}
            <button
              onClick={() => navigate('/maula/ai')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <span>✨</span>
              <span>AI Assistant</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'incidents' && renderIncidents()}
            {activeTab === 'playbooks' && renderPlaybooks()}
            {activeTab === 'create' && renderCreateForm()}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>IncidentResponse Tool 11 • VictoryKit Security Platform</p>
        </div>
      </footer>
    </div>
  );
}
