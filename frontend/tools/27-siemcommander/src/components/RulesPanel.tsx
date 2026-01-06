import React, { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Copy, Play, Pause,
  Shield, Code, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import type { DetectionRule, RuleType, RuleStatus } from '../types';
import { QUERY_LANGUAGES, MITRE_TACTICS, SEVERITY_BG_COLORS, formatTimestamp } from '../constants';

// Mock detection rules
const mockRules: DetectionRule[] = [
  {
    id: 'RULE-001',
    name: 'Brute Force Detection',
    description: 'Detects multiple failed authentication attempts from a single source within a short timeframe',
    query: 'SecurityEvent\n| where EventID == 4625\n| summarize FailedAttempts = count() by SourceIP, TargetAccount\n| where FailedAttempts > 10',
    language: 'kql',
    severity: 'high',
    mitreTactic: 'Credential Access',
    mitreTechnique: 'T1110',
    status: 'enabled',
    type: 'detection',
    createdAt: new Date(Date.now() - 2592000000),
    updatedAt: new Date(Date.now() - 86400000),
    createdBy: 'Sarah Chen',
    tags: ['authentication', 'brute_force'],
    threshold: { field: 'FailedAttempts', operator: '>', value: 10, timeWindow: 300 },
    alertsGenerated: 234,
    lastTriggered: new Date(Date.now() - 3600000),
  },
  {
    id: 'RULE-002',
    name: 'PowerShell Encoded Command',
    description: 'Detects execution of PowerShell with encoded command parameters, often used by attackers',
    query: 'index=sysmon EventCode=1 Image="*\\powershell.exe" CommandLine="*-enc*" OR CommandLine="*-EncodedCommand*"\n| table _time, host, User, CommandLine',
    language: 'spl',
    severity: 'critical',
    mitreTactic: 'Execution',
    mitreTechnique: 'T1059.001',
    status: 'enabled',
    type: 'detection',
    createdAt: new Date(Date.now() - 1296000000),
    updatedAt: new Date(Date.now() - 172800000),
    createdBy: 'Mike Johnson',
    tags: ['powershell', 'encoded', 'execution'],
    alertsGenerated: 89,
    lastTriggered: new Date(Date.now() - 7200000),
  },
  {
    id: 'RULE-003',
    name: 'DNS Tunneling Detection',
    description: 'Identifies potential DNS tunneling based on query length and entropy analysis',
    query: 'title: DNS Tunneling Detection\nstatus: experimental\nlogsource:\n  category: dns\ndetection:\n  selection:\n    query_length: ">50"\n  condition: selection',
    language: 'sigma',
    severity: 'medium',
    mitreTactic: 'Exfiltration',
    mitreTechnique: 'T1048.003',
    status: 'testing',
    type: 'detection',
    createdAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 259200000),
    createdBy: 'Alex Rivera',
    tags: ['dns', 'exfiltration', 'tunneling'],
    alertsGenerated: 12,
    lastTriggered: new Date(Date.now() - 86400000),
  },
  {
    id: 'RULE-004',
    name: 'Suspicious Cloud API Calls',
    description: 'Monitors for sensitive API calls in AWS that could indicate privilege escalation',
    query: 'CloudTrail\n| where eventName in ("PutUserPolicy", "AttachUserPolicy", "CreateAccessKey")\n| where sourceIPAddress !in (known_corporate_ips)\n| project eventTime, userIdentity, eventName, sourceIPAddress',
    language: 'kql',
    severity: 'high',
    mitreTactic: 'Privilege Escalation',
    mitreTechnique: 'T1078',
    status: 'enabled',
    type: 'detection',
    createdAt: new Date(Date.now() - 432000000),
    updatedAt: new Date(Date.now() - 86400000),
    createdBy: 'Emma Wilson',
    tags: ['aws', 'cloud', 'iam'],
    alertsGenerated: 45,
    lastTriggered: new Date(Date.now() - 14400000),
  },
  {
    id: 'RULE-005',
    name: 'Scheduled Task Creation',
    description: 'Detects creation of scheduled tasks which may indicate persistence attempts',
    query: 'index=windows EventCode=4698\n| table _time, host, SubjectUserName, TaskName, TaskContent\n| where TaskContent LIKE "%powershell%"',
    language: 'spl',
    severity: 'medium',
    mitreTactic: 'Persistence',
    mitreTechnique: 'T1053.005',
    status: 'disabled',
    type: 'detection',
    createdAt: new Date(Date.now() - 864000000),
    updatedAt: new Date(Date.now() - 604800000),
    createdBy: 'Sarah Chen',
    tags: ['persistence', 'scheduled_task'],
    alertsGenerated: 156,
  },
];

const RulesPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<RuleStatus | 'all'>('all');
  const [selectedRule, setSelectedRule] = useState<DetectionRule | null>(null);

  const filteredRules = mockRules.filter(rule => {
    const matchesSearch = searchQuery === '' ||
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.mitreTactic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || rule.language === selectedLanguage;
    const matchesStatus = selectedStatus === 'all' || rule.status === selectedStatus;
    return matchesSearch && matchesLanguage && matchesStatus;
  });

  const stats = {
    total: mockRules.length,
    enabled: mockRules.filter(r => r.status === 'enabled').length,
    testing: mockRules.filter(r => r.status === 'testing').length,
    alertsToday: mockRules.reduce((acc, r) => acc + (r.alertsGenerated || 0), 0),
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main List */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Detection Rules</h1>
            <p className="text-gray-400 text-sm mt-1">Manage correlation rules and detection logic</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Rule</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Rules', value: stats.total, icon: Shield, color: 'text-violet-400' },
            { label: 'Enabled', value: stats.enabled, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Testing', value: stats.testing, icon: Clock, color: 'text-yellow-400' },
            { label: 'Alerts Generated', value: stats.alertsToday, icon: AlertTriangle, color: 'text-red-400' },
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

        {/* Filters */}
        <div className="flex items-center gap-4 bg-[#1E293B] rounded-xl border border-[#334155] p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rules by name or MITRE tactic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Languages</option>
            {QUERY_LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as RuleStatus | 'all')}
            className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
            <option value="testing">Testing</option>
          </select>
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              onClick={() => setSelectedRule(rule)}
              className={`bg-[#1E293B] rounded-xl border p-4 cursor-pointer transition-all hover:border-violet-500 ${
                selectedRule?.id === rule.id ? 'border-violet-500' : 'border-[#334155]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_BG_COLORS[rule.severity]}`}>
                      {rule.severity.toUpperCase()}
                    </span>
                    <span className="bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded text-xs uppercase">
                      {rule.language}
                    </span>
                    <span className="text-gray-500 text-sm">{rule.id}</span>
                  </div>
                  <h3 className="text-white font-medium">{rule.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{rule.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {rule.status === 'enabled' && (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Enabled
                    </span>
                  )}
                  {rule.status === 'disabled' && (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <Pause className="w-4 h-4" />
                      Disabled
                    </span>
                  )}
                  {rule.status === 'testing' && (
                    <span className="flex items-center gap-1 text-yellow-400 text-sm">
                      <Clock className="w-4 h-4" />
                      Testing
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {rule.alertsGenerated || 0} alerts
                </span>
                <span>•</span>
                <span>{rule.mitreTactic} ({rule.mitreTechnique})</span>
                {rule.lastTriggered && (
                  <>
                    <span>•</span>
                    <span>Last: {formatTimestamp(rule.lastTriggered)}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedRule && (
        <div className="w-[500px] bg-[#1E293B] rounded-xl border border-[#334155] p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-gray-400 text-sm">{selectedRule.id}</span>
              <h2 className="text-lg font-semibold text-white mt-1">{selectedRule.name}</h2>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-[#334155] rounded-lg hover:bg-[#475569] transition-colors">
                <Edit className="w-4 h-4 text-gray-300" />
              </button>
              <button className="p-2 bg-[#334155] rounded-lg hover:bg-[#475569] transition-colors">
                <Copy className="w-4 h-4 text-gray-300" />
              </button>
              <button className="p-2 bg-[#334155] rounded-lg hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-400" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status & Severity */}
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-gray-400 text-xs uppercase mb-1">Severity</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${SEVERITY_BG_COLORS[selectedRule.severity]}`}>
                  {selectedRule.severity.toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-xs uppercase mb-1">Status</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  selectedRule.status === 'enabled' ? 'bg-green-500/20 text-green-400' :
                  selectedRule.status === 'testing' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {selectedRule.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-400 text-xs uppercase mb-2">Description</p>
              <p className="text-gray-300 text-sm">{selectedRule.description}</p>
            </div>

            {/* MITRE */}
            <div>
              <p className="text-gray-400 text-xs uppercase mb-2">MITRE ATT&CK</p>
              <div className="flex gap-2">
                <span className="bg-violet-500/20 text-violet-400 px-2 py-1 rounded text-sm">
                  {selectedRule.mitreTactic}
                </span>
                <span className="bg-violet-500/20 text-violet-400 px-2 py-1 rounded text-sm">
                  {selectedRule.mitreTechnique}
                </span>
              </div>
            </div>

            {/* Query */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs uppercase">Detection Query</p>
                <span className="text-violet-400 text-xs uppercase">{selectedRule.language}</span>
              </div>
              <pre className="bg-[#0F172A] rounded-lg p-4 text-violet-400 text-xs font-mono overflow-x-auto">
                {selectedRule.query}
              </pre>
            </div>

            {/* Tags */}
            <div>
              <p className="text-gray-400 text-xs uppercase mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {selectedRule.tags.map((tag, i) => (
                  <span key={i} className="bg-[#334155] text-gray-300 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-[#334155]">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                <Play className="w-4 h-4" />
                Test Rule
              </button>
              <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedRule.status === 'enabled' 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}>
                {selectedRule.status === 'enabled' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Disable
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Enable
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesPanel;
