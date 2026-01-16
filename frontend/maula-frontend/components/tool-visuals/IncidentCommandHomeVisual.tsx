import React, { useState } from 'react';
import {
  BarChart3,
  AlertTriangle,
  BookOpen,
  Plus,
  Search,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const IncidentCommandHomeVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'playbooks', label: 'Playbooks', icon: BookOpen },
    { id: 'new', label: 'New Incident', icon: Plus },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-rose-950/30 rounded-2xl overflow-hidden border border-rose-500/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-rose-500/20 bg-black/40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-white text-xs font-bold">Incident Response</span>
            <p className="text-white/40 text-[8px]">AI-Powered Security Incident Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 text-[8px] text-green-400 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            Simulation Mode
          </div>
          <button className="px-2 py-1 bg-rose-500 rounded-lg text-[8px] text-white font-medium flex items-center gap-1">
            <span className="text-[8px]">✨</span> AI Assistant
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-3 py-2 bg-black/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-rose-500 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-2.5 h-2.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 overflow-hidden" style={{ height: 'calc(100% - 88px)' }}>
        {activeTab === 'dashboard' && (
          <div className="space-y-2 h-full overflow-hidden">
            {/* Stats Row */}
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { value: '23', label: 'Open Incidents', icon: AlertTriangle, color: 'text-rose-400', trend: 'up' },
                { value: '18', label: 'Investigating', icon: Search, color: 'text-yellow-400' },
                { value: '8', label: 'Contained', icon: Shield, color: 'text-orange-400' },
                { value: '107', label: 'Closed (30d)', icon: CheckCircle2, color: 'text-green-400', trend: 'down' },
                { value: '156', label: 'Total', icon: BarChart3, color: 'text-blue-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <stat.icon className={`w-3 h-3 ${stat.color}`} />
                    {stat.trend && (
                      stat.trend === 'up' 
                        ? <TrendingUp className="w-2 h-2 text-rose-400" />
                        : <TrendingDown className="w-2 h-2 text-green-400" />
                    )}
                  </div>
                  <div className="text-white text-sm font-bold">{stat.value}</div>
                  <div className="text-white/40 text-[7px]">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Time Metrics */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Avg Time to Detect', value: '15m' },
                { label: 'Avg Time to Contain', value: '45m' },
                { label: 'Avg Time to Resolve', value: '3h 0m' },
                { label: 'MTTR', value: '4h 0m' },
              ].map((metric, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/5">
                  <div className="text-white/40 text-[7px] mb-1">{metric.label}</div>
                  <div className="text-rose-400 text-xs font-bold">{metric.value}</div>
                </div>
              ))}
            </div>

            {/* Severity & Category */}
            <div className="grid grid-cols-2 gap-1.5 flex-1">
              {/* By Severity */}
              <div className="bg-white/5 rounded-lg p-2 border border-white/5 overflow-hidden">
                <div className="text-white text-[9px] font-bold mb-1.5">By Severity</div>
                <div className="space-y-1">
                  {[
                    { label: 'Critical', value: 5, color: 'bg-rose-500', dot: 'bg-rose-500' },
                    { label: 'High', value: 28, color: 'bg-orange-500', dot: 'bg-orange-500' },
                    { label: 'Medium', value: 67, color: 'bg-yellow-500', dot: 'bg-yellow-500' },
                    { label: 'Low', value: 45, color: 'bg-gray-400', dot: 'bg-gray-400' },
                    { label: 'Info', value: 11, color: 'bg-blue-500', dot: 'bg-blue-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></div>
                      <span className="text-white/60 text-[7px] flex-1">{item.label}</span>
                      <span className="text-white/80 text-[7px] font-mono">{item.value}</span>
                      <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.min(item.value, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Category */}
              <div className="bg-white/5 rounded-lg p-2 border border-white/5 overflow-hidden">
                <div className="text-white text-[9px] font-bold mb-1.5">By Category</div>
                <div className="space-y-1">
                  {[
                    { label: 'Unauthorized Access', value: 45 },
                    { label: 'Malware', value: 32 },
                    { label: 'Phishing', value: 28 },
                    { label: 'Data Breach', value: 12 },
                    { label: 'DDoS', value: 8 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-white/60 text-[7px]">{item.label}</span>
                      <span className="text-white/80 text-[7px] font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trending */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="text-white text-[9px] font-bold mb-1.5">Trending Categories</div>
              <div className="flex gap-1.5">
                <span className="px-1.5 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded text-[7px] text-rose-400">
                  Phishing 15 ↑
                </span>
                <span className="px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[7px] text-green-400">
                  Malware 8 ↓
                </span>
                <span className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-[7px] text-white/60">
                  Unauthorized-Access 12 →
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-2 h-full overflow-hidden">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <select className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-[8px] text-white/60">
                  <option>All Severities</option>
                </select>
                <select className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-[8px] text-white/60">
                  <option>All Statuses</option>
                </select>
              </div>
              <button className="px-2 py-1 bg-rose-500 rounded-lg text-[8px] text-white font-medium flex items-center gap-1">
                <Plus className="w-2.5 h-2.5" /> New Incident
              </button>
            </div>

            {/* Incident Cards */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { severity: 'CRITICAL', status: 'investigating', statusColor: 'bg-yellow-500', borderColor: 'border-rose-500/50' },
                { severity: 'HIGH', status: 'open', statusColor: 'bg-rose-500', borderColor: 'border-orange-500/50' },
                { severity: 'MEDIUM', status: 'contained', statusColor: 'bg-cyan-500', borderColor: 'border-yellow-500/50' },
                { severity: 'LOW', status: 'closed', statusColor: 'bg-green-500', borderColor: 'border-gray-500/50' },
              ].map((incident, i) => (
                <div key={i} className={`bg-white/5 rounded-lg p-2 border ${incident.borderColor}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-1 py-0.5 rounded text-[6px] font-bold ${
                      incident.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                      incident.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                      incident.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {incident.severity}
                    </span>
                    <span className={`px-1 py-0.5 ${incident.statusColor} rounded text-[6px] text-white font-medium`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="text-white text-[8px] font-medium mb-0.5">Suspicious Login Activity Detected</div>
                  <div className="text-white/40 text-[7px] font-mono">INC-1768455876737</div>
                  <div className="flex items-center justify-between mt-1.5 text-[6px] text-white/40">
                    <span>🏷️ unauthorized-access</span>
                    <span>● Just now</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'playbooks' && (
          <div className="space-y-2 h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-[10px] font-bold">Response Playbooks</h3>
              <button className="px-2 py-1 bg-rose-500 rounded-lg text-[8px] text-white font-medium flex items-center gap-1">
                <Plus className="w-2.5 h-2.5" /> Create Playbook
              </button>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer">
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-white text-[9px] font-bold mb-0.5">Ransomware Response</div>
                  <div className="text-white/50 text-[7px] mb-2">Standard operating procedure for ransomware incidents</div>
                  <div className="flex items-center gap-2 text-[7px] text-white/40">
                    <span>📋 2 steps</span>
                    <span>● ~240min</span>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-white/40" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-[200px] bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-white text-[10px] font-bold mb-3">Create New Incident</h3>
              
              <div className="space-y-2">
                <div>
                  <label className="text-white/60 text-[7px] mb-0.5 block">Title *</label>
                  <input 
                    type="text" 
                    placeholder="Brief description of the incident"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[8px] text-white/40 placeholder:text-white/30"
                  />
                </div>
                
                <div>
                  <label className="text-white/60 text-[7px] mb-0.5 block">Description</label>
                  <textarea 
                    placeholder="Detailed description..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[8px] text-white/40 placeholder:text-white/30 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-white/60 text-[7px] mb-0.5 block">Severity</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[8px] text-white/60">
                      <option>Medium</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-[7px] mb-0.5 block">Category</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[8px] text-white/60">
                      <option>other</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-1.5 mt-2">
                  <button className="flex-1 px-2 py-1.5 bg-white/10 rounded-lg text-[8px] text-white/60 font-medium">
                    Cancel
                  </button>
                  <button className="flex-1 px-2 py-1.5 bg-rose-500 rounded-lg text-[8px] text-white font-medium">
                    Create Incident
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentCommandHomeVisual;
