import React, { useState } from 'react';
import {
  Search, Play, Plus, Clock, Target, FileText, Save,
  ChevronRight, AlertTriangle, Check, Database
} from 'lucide-react';
import type { ThreatHunt, HuntQuery, HuntFinding } from '../types';
import { QUERY_LANGUAGES, MITRE_TACTICS, formatTimestamp } from '../constants';

// Mock threat hunts
const mockHunts: ThreatHunt[] = [
  {
    id: 'HUNT-001',
    name: 'APT29 Infrastructure Hunt',
    hypothesis: 'Adversary may be using legitimate cloud services for C2 communication following recent threat intel on APT29 TTPs',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000),
    createdBy: 'Sarah Chen',
    queries: [
      {
        id: 'Q-001',
        language: 'kql',
        query: 'DeviceNetworkEvents | where RemoteUrl contains "*.blob.core.windows.net" | where InitiatingProcessFileName in ("powershell.exe", "cmd.exe")',
        description: 'Detect suspicious blob storage access from command line tools',
        lastRun: new Date(Date.now() - 3600000),
        resultsCount: 23,
      },
      {
        id: 'Q-002',
        language: 'spl',
        query: 'index=proxy sourcetype=squid | stats count by url, src_ip | where count > 100',
        description: 'Find high-frequency connections to cloud endpoints',
        lastRun: new Date(Date.now() - 7200000),
        resultsCount: 156,
      },
    ],
    findings: [
      {
        id: 'F-001',
        title: 'Suspicious PowerShell blob access pattern',
        description: 'Three workstations showing identical blob storage access patterns with encoded payloads',
        severity: 'high',
        mitreTechnique: 'T1567.002',
        affectedAssets: ['WS-015', 'WS-016', 'WS-017'],
        createdAt: new Date(Date.now() - 3600000),
        status: 'confirmed',
      },
    ],
    tags: ['apt29', 'cloud', 'c2'],
    mitreTactics: ['Command and Control', 'Exfiltration'],
  },
  {
    id: 'HUNT-002',
    name: 'Lateral Movement Detection',
    hypothesis: 'After initial compromise, attacker may be moving laterally using stolen credentials and remote services',
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000),
    createdBy: 'Mike Johnson',
    queries: [],
    findings: [],
    tags: ['lateral_movement', 'credential'],
    mitreTactics: ['Lateral Movement', 'Credential Access'],
  },
  {
    id: 'HUNT-003',
    name: 'Persistence Mechanism Search',
    hypothesis: 'Malware may have established persistence using scheduled tasks or registry modifications',
    status: 'draft',
    createdAt: new Date(Date.now() - 259200000),
    createdBy: 'Alex Rivera',
    queries: [],
    findings: [],
    tags: ['persistence', 'scheduled_tasks'],
    mitreTactics: ['Persistence'],
  },
];

const ThreatHuntingPanel: React.FC = () => {
  const [selectedHunt, setSelectedHunt] = useState<ThreatHunt | null>(null);
  const [activeTab, setActiveTab] = useState<'hunts' | 'new'>('hunts');
  const [queryText, setQueryText] = useState('');
  const [queryLanguage, setQueryLanguage] = useState('kql');

  const stats = {
    active: mockHunts.filter(h => h.status === 'active').length,
    completed: mockHunts.filter(h => h.status === 'completed').length,
    findings: mockHunts.reduce((acc, h) => acc + h.findings.length, 0),
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main Panel */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Threat Hunting</h1>
            <p className="text-gray-400 text-sm mt-1">Proactive threat detection and hypothesis-driven investigation</p>
          </div>
          <button 
            onClick={() => setActiveTab('new')}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Hunt</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Hunts', value: stats.active, icon: Target, color: 'text-violet-400' },
            { label: 'Completed', value: stats.completed, icon: Check, color: 'text-green-400' },
            { label: 'Total Findings', value: stats.findings, icon: AlertTriangle, color: 'text-yellow-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {activeTab === 'hunts' ? (
          /* Hunts List */
          <div className="space-y-4">
            {mockHunts.map((hunt) => (
              <div
                key={hunt.id}
                onClick={() => setSelectedHunt(hunt)}
                className={`bg-[#1E293B] rounded-xl border p-4 cursor-pointer transition-all hover:border-violet-500 ${
                  selectedHunt?.id === hunt.id ? 'border-violet-500' : 'border-[#334155]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        hunt.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        hunt.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {hunt.status.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-sm">{hunt.id}</span>
                    </div>
                    <h3 className="text-white font-medium">{hunt.name}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{hunt.hypothesis}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimestamp(hunt.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Database className="w-4 h-4" />
                    <span>{hunt.queries.length} queries</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{hunt.findings.length} findings</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {hunt.mitreTactics.map((tactic, i) => (
                    <span key={i} className="bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded text-xs">
                      {tactic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* New Hunt Form */
          <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Create New Hunt</h2>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Hunt Name</label>
              <input
                type="text"
                placeholder="Enter hunt name..."
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Hypothesis</label>
              <textarea
                placeholder="What are you hunting for? Describe your hypothesis..."
                rows={3}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">MITRE ATT&CK Tactics</label>
              <div className="flex flex-wrap gap-2">
                {MITRE_TACTICS.map((tactic) => (
                  <button
                    key={tactic.id}
                    className="bg-[#0F172A] border border-[#334155] text-gray-300 px-3 py-1.5 rounded-lg text-sm hover:border-violet-500 hover:text-violet-400 transition-colors"
                  >
                    {tactic.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                <Save className="w-4 h-4" />
                Create Hunt
              </button>
              <button 
                onClick={() => setActiveTab('hunts')}
                className="px-4 py-2 bg-[#334155] text-gray-300 rounded-lg hover:bg-[#475569] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Query Panel */}
      {selectedHunt && (
        <div className="w-[500px] bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">{selectedHunt.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{selectedHunt.hypothesis}</p>
          </div>

          {/* Query Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-400 text-sm">Query Editor</label>
              <select
                value={queryLanguage}
                onChange={(e) => setQueryLanguage(e.target.value)}
                className="bg-[#0F172A] border border-[#334155] rounded px-2 py-1 text-sm text-white focus:outline-none"
              >
                {QUERY_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </div>
            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={`Enter your ${queryLanguage.toUpperCase()} query here...`}
              rows={6}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-violet-400 font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
                <Play className="w-4 h-4" />
                Run Query
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#334155] text-gray-300 rounded-lg text-sm hover:bg-[#475569] transition-colors">
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          {/* Saved Queries */}
          <div>
            <h3 className="text-gray-400 text-sm mb-3">Saved Queries ({selectedHunt.queries.length})</h3>
            <div className="space-y-2">
              {selectedHunt.queries.map((query) => (
                <div key={query.id} className="bg-[#0F172A] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-violet-400 uppercase">{query.language}</span>
                    <span className="text-xs text-gray-500">{query.resultsCount} results</span>
                  </div>
                  <p className="text-gray-300 text-sm">{query.description}</p>
                  <code className="block text-violet-400 text-xs mt-2 truncate">{query.query}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          {selectedHunt.findings.length > 0 && (
            <div>
              <h3 className="text-gray-400 text-sm mb-3">Findings ({selectedHunt.findings.length})</h3>
              <div className="space-y-2">
                {selectedHunt.findings.map((finding) => (
                  <div key={finding.id} className="bg-[#0F172A] rounded-lg p-3 border-l-2 border-yellow-500">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm font-medium">{finding.title}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{finding.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreatHuntingPanel;
