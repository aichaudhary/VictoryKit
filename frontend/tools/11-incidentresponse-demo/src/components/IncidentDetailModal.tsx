/**
 * Incident Detail Modal
 * Shows full incident details with timeline, indicators, and AI insights
 */

import { useState } from 'react';
import {
  X,
  Clock,
  User,
  Tag,
  AlertTriangle,
  Shield,
  Brain,
  Play,
  ChevronRight,
  Server,
  Globe,
  Hash,
  Mail,
  Link,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import type { Incident } from '../api/demoData';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onExecutePlaybook: () => void;
}

const severityColors = {
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  informational: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
};

const statusColors = {
  open: { bg: 'bg-red-600', text: 'text-white' },
  investigating: { bg: 'bg-yellow-600', text: 'text-white' },
  contained: { bg: 'bg-blue-600', text: 'text-white' },
  eradicated: { bg: 'bg-purple-600', text: 'text-white' },
  recovered: { bg: 'bg-teal-600', text: 'text-white' },
  closed: { bg: 'bg-green-600', text: 'text-white' },
};

const indicatorIcons = {
  ip: Server,
  domain: Globe,
  hash: Hash,
  email: Mail,
  url: Link,
};

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function IncidentDetailModal({ incident, onClose, onExecutePlaybook }: IncidentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'indicators' | 'ai'>('overview');
  const [isExecuting, setIsExecuting] = useState(false);

  if (!incident) return null;

  const severity = severityColors[incident.severity];
  const status = statusColors[incident.status];

  const handleExecutePlaybook = async () => {
    setIsExecuting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExecuting(false);
    onExecutePlaybook();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-800 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severity.bg} ${severity.text}`}>
                {incident.severity.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.text}`}>
                {incident.status}
              </span>
              <span className="text-gray-500 text-sm">{incident.id}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{incident.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{incident.description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-4">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {(['overview', 'timeline', 'indicators', 'ai'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary-400 border-b-2 border-primary-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'ai' ? 'AI Insights' : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Details */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary-400" />
                    Incident Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category</span>
                      <span className="text-white capitalize">{incident.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Source</span>
                      <span className="text-white">{incident.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Assignee</span>
                      <span className="text-white">{incident.assignee || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created</span>
                      <span className="text-white">{formatTime(incident.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-white">{formatTime(incident.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Affected Assets */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary-400" />
                    Affected Assets ({incident.affectedAssets.length})
                  </h3>
                  <div className="space-y-2">
                    {incident.affectedAssets.map((asset, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg"
                      >
                        <Server className="w-4 h-4 text-gray-500" />
                        <span className="text-white text-sm font-mono">{asset}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* AI Insights Summary */}
                {incident.aiInsights && (
                  <div className="glass-card rounded-xl p-4 border-primary-500/30">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary-400" />
                      AI Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">Risk Score</span>
                          <span className="text-2xl font-bold text-white">{incident.aiInsights.riskScore}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              incident.aiInsights.riskScore >= 80
                                ? 'bg-red-500'
                                : incident.aiInsights.riskScore >= 60
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${incident.aiInsights.riskScore}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Threat Type</span>
                        <p className="text-white font-medium">{incident.aiInsights.threatType}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Predicted Impact</span>
                        <p className="text-white">{incident.aiInsights.predictedImpact}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-400" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleExecutePlaybook}
                      disabled={isExecuting}
                      className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Execute Playbook
                        </>
                      )}
                    </button>
                    <button className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all">
                      <User className="w-5 h-5" />
                      Assign to Me
                    </button>
                    <button className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all">
                      <AlertTriangle className="w-5 h-5" />
                      Escalate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {incident.timeline.map((entry, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary-400" />
                    </div>
                    {index < incident.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-700 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{entry.action}</h4>
                        <span className="text-gray-500 text-sm">{formatTime(entry.timestamp)}</span>
                      </div>
                      {entry.details && <p className="text-gray-400 text-sm">{entry.details}</p>}
                      <div className="flex items-center gap-1 mt-2 text-gray-500 text-xs">
                        <User className="w-3 h-3" />
                        <span>{entry.performedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Indicators Tab */}
          {activeTab === 'indicators' && (
            <div className="space-y-4">
              {incident.indicators.map((indicator, index) => {
                const Icon = indicatorIcons[indicator.type] || Tag;
                return (
                  <div key={index} className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-gray-800 rounded-lg">
                        <Icon className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-white font-mono text-sm">{indicator.value}</p>
                        <p className="text-gray-500 text-xs uppercase">{indicator.type}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        indicator.confidence === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : indicator.confidence === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {indicator.confidence} confidence
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'ai' && incident.aiInsights && (
            <div className="space-y-6">
              {/* Risk Score */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Risk Assessment</h3>
                <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={incident.aiInsights.riskScore >= 80 ? '#ef4444' : incident.aiInsights.riskScore >= 60 ? '#f97316' : '#eab308'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${incident.aiInsights.riskScore * 2.51} 251`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{incident.aiInsights.riskScore}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Threat Classification</span>
                      <p className="text-white font-medium text-lg">{incident.aiInsights.threatType}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Related Incidents</span>
                      <p className="text-white font-medium">{incident.aiInsights.relatedIncidents} similar incidents found</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="glass-card rounded-xl p-6 border-primary-500/30">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary-400" />
                  AI Recommendation
                </h3>
                <p className="text-gray-300 leading-relaxed">{incident.aiInsights.recommendation}</p>
              </div>

              {/* Impact Analysis */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Predicted Impact</h3>
                <p className="text-gray-300">{incident.aiInsights.predictedImpact}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
