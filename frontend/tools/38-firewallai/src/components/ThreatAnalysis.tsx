import React, { useState } from 'react';
import { AlertTriangle, Brain, TrendingUp, Shield, Activity, Target, Zap } from 'lucide-react';

interface ThreatAnalysisProps {
  analysis: any;
  logs: any[];
  onAnalyze: () => void;
  isLoading: boolean;
}

const ThreatAnalysis: React.FC<ThreatAnalysisProps> = ({
  analysis,
  logs,
  onAnalyze,
  isLoading
}) => {
  const [selectedThreat, setSelectedThreat] = useState<any>(null);

  const threatStats = [
    {
      label: 'Total Threats',
      value: analysis?.total_threats || 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      label: 'High Risk',
      value: analysis?.high_risk_count || 0,
      icon: Target,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    {
      label: 'ML Detections',
      value: analysis?.ml_detections || 0,
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      label: 'Blocked Attacks',
      value: analysis?.blocked_attacks || 0,
      icon: Shield,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    }
  ];

  const threatTypes = [
    { type: 'DDoS', count: analysis?.ddos_attacks || 0, severity: 'high' },
    { type: 'Malware', count: analysis?.malware_detections || 0, severity: 'high' },
    { type: 'Brute Force', count: analysis?.brute_force || 0, severity: 'medium' },
    { type: 'Port Scan', count: analysis?.port_scans || 0, severity: 'medium' },
    { type: 'SQL Injection', count: analysis?.sql_injections || 0, severity: 'high' },
    { type: 'XSS', count: analysis?.xss_attacks || 0, severity: 'medium' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Threat Analysis</h2>
          <p className="text-gray-400 mt-1">AI-powered threat detection and behavioral analysis</p>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Brain className="w-5 h-5" />
          {isLoading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {threatStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-xl border ${stat.bgColor} ${stat.borderColor} backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.borderColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Threat Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Threat Categories
          </h3>

          <div className="space-y-3">
            {threatTypes.map((threat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    threat.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm font-medium">{threat.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    threat.severity === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {threat.severity}
                  </span>
                  <span className="text-sm font-bold text-white">{threat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ML Insights */}
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            ML Insights
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-400">Anomaly Score</span>
                <span className="text-lg font-bold text-purple-400">
                  {analysis?.anomaly_score || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${analysis?.anomaly_score || 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-400">Behavioral Risk</span>
                <span className="text-lg font-bold text-blue-400">
                  {analysis?.behavioral_risk || 'Low'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Based on traffic patterns and user behavior analysis
              </p>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-400">Prediction Accuracy</span>
                <span className="text-lg font-bold text-green-400">
                  {analysis?.prediction_accuracy || 0}%
                </span>
              </div>
              <p className="text-xs text-gray-400">
                ML model accuracy for threat detection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-yellow-400" />
          Recent Threat Activity
        </h3>

        <div className="space-y-3">
          {logs.filter(log => log.threat_level !== 'low').slice(0, 10).map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedThreat?.id === log.id
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-slate-900/50 border-slate-700 hover:bg-slate-700/30'
              }`}
              onClick={() => setSelectedThreat(log)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    log.threat_level === 'high' ? 'bg-red-500' :
                    log.threat_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {log.source_ip} → {log.destination_ip}
                    </p>
                    <p className="text-xs text-gray-400">
                      {log.protocol} • {log.port} • {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.threat_level === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {log.threat_level}
                  </span>
                  <span className="text-xs text-gray-400">
                    {log.threat_type || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {logs.filter(log => log.threat_level !== 'low').length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-gray-400">No recent threats detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Threat Details Panel */}
      {selectedThreat && (
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Threat Details
            </h3>
            <button
              onClick={() => setSelectedThreat(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Source IP</label>
                <p className="font-mono text-white text-lg">{selectedThreat.source_ip}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Destination IP</label>
                <p className="font-mono text-white text-lg">{selectedThreat.destination_ip}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Protocol/Port</label>
                <p className="text-white">{selectedThreat.protocol}/{selectedThreat.port}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Threat Level</label>
                <p className={`font-medium text-lg ${
                  selectedThreat.threat_level === 'high' ? 'text-red-400' :
                  selectedThreat.threat_level === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {selectedThreat.threat_level}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Threat Type</label>
                <p className="text-white">{selectedThreat.threat_type || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">ML Confidence</label>
                <p className="text-white">{selectedThreat.ml_confidence || 0}%</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Timestamp</label>
                <p className="text-white">{new Date(selectedThreat.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Action Taken</label>
                <p className={`font-medium ${
                  selectedThreat.action === 'blocked' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {selectedThreat.action}
                </p>
              </div>
            </div>
          </div>

          {selectedThreat.threat_details && (
            <div className="mt-6">
              <label className="text-sm text-gray-400">Detailed Analysis</label>
              <div className="mt-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 whitespace-pre-wrap">
                  {selectedThreat.threat_details}
                </p>
              </div>
            </div>
          )}

          {selectedThreat.ml_analysis && (
            <div className="mt-4">
              <label className="text-sm text-gray-400">ML Analysis</label>
              <div className="mt-2 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-purple-400 whitespace-pre-wrap">
                  {selectedThreat.ml_analysis}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreatAnalysis;