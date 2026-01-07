import React, { useState } from 'react';
import {
  Bell, Search, Filter, Check, X, AlertTriangle, Eye,
  ChevronRight, Clock, Shield, Monitor, Cloud
} from 'lucide-react';
import type { Alert, AlertSeverity, AlertStatus } from '../types';
import { SEVERITY_BG_COLORS, formatTimestamp } from '../constants';

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    title: 'Multiple Failed Login Attempts',
    description: 'User admin@company.com has 15 failed login attempts in the last 10 minutes from IP 192.168.1.100',
    severity: 'high',
    status: 'new',
    source: 'Azure AD',
    createdAt: new Date(),
    ruleId: 'RULE-001',
    ruleName: 'Brute Force Detection',
    affectedAssets: ['admin@company.com'],
    indicators: ['192.168.1.100', 'admin@company.com'],
    mitreTactic: 'Credential Access',
    mitreTechnique: 'T1110.001',
    tags: ['brute_force', 'authentication'],
    falsePositiveRisk: 20,
    automatedResponse: 'Account temporarily locked',
  },
  {
    id: 'ALT-002',
    title: 'Suspicious Process Execution',
    description: 'cmd.exe spawned by Microsoft Word on WORKSTATION-42',
    severity: 'critical',
    status: 'new',
    source: 'CrowdStrike',
    createdAt: new Date(Date.now() - 180000),
    ruleId: 'RULE-012',
    ruleName: 'Office Macro Execution',
    affectedAssets: ['WORKSTATION-42'],
    indicators: ['cmd.exe', 'winword.exe'],
    mitreTactic: 'Execution',
    mitreTechnique: 'T1059.003',
    tags: ['macro', 'office'],
    falsePositiveRisk: 10,
  },
  {
    id: 'ALT-003',
    title: 'Unusual Cloud API Activity',
    description: 'AWS S3 bucket permissions changed to public from unrecognized IP',
    severity: 'critical',
    status: 'acknowledged',
    source: 'AWS CloudTrail',
    createdAt: new Date(Date.now() - 600000),
    ruleId: 'RULE-025',
    ruleName: 'Cloud Misconfiguration',
    affectedAssets: ['s3://sensitive-data-bucket'],
    indicators: ['PutBucketAcl', 'public-read'],
    mitreTactic: 'Defense Evasion',
    mitreTechnique: 'T1562.007',
    tags: ['aws', 's3', 'misconfiguration'],
    falsePositiveRisk: 5,
    assignedTo: 'Cloud Team',
  },
  {
    id: 'ALT-004',
    title: 'Potential Data Exfiltration',
    description: 'Large outbound data transfer detected from database server to external IP',
    severity: 'high',
    status: 'investigating',
    source: 'Network Monitor',
    createdAt: new Date(Date.now() - 1200000),
    ruleId: 'RULE-030',
    ruleName: 'Data Transfer Anomaly',
    affectedAssets: ['DB-SRV-01'],
    indicators: ['203.0.113.50', '2.5GB transfer'],
    mitreTactic: 'Exfiltration',
    mitreTechnique: 'T1048',
    tags: ['exfiltration', 'database'],
    falsePositiveRisk: 30,
    assignedTo: 'Sarah Chen',
  },
  {
    id: 'ALT-005',
    title: 'Scheduled Task Created',
    description: 'New scheduled task created with suspicious parameters on SERVER-01',
    severity: 'medium',
    status: 'resolved',
    source: 'Sysmon',
    createdAt: new Date(Date.now() - 3600000),
    ruleId: 'RULE-015',
    ruleName: 'Persistence Detection',
    affectedAssets: ['SERVER-01'],
    indicators: ['schtasks.exe', 'base64'],
    mitreTactic: 'Persistence',
    mitreTechnique: 'T1053.005',
    tags: ['persistence', 'scheduled_task'],
    falsePositiveRisk: 40,
    resolvedAt: new Date(Date.now() - 1800000),
    resolution: 'Confirmed as legitimate maintenance task',
  },
  {
    id: 'ALT-006',
    title: 'DNS Query to Known Malicious Domain',
    description: 'Host 10.0.0.55 queried known C2 domain evil-domain.com',
    severity: 'high',
    status: 'new',
    source: 'DNS Logs',
    createdAt: new Date(Date.now() - 120000),
    ruleId: 'RULE-040',
    ruleName: 'Malicious DNS Detection',
    affectedAssets: ['10.0.0.55'],
    indicators: ['evil-domain.com'],
    mitreTactic: 'Command and Control',
    mitreTechnique: 'T1071.004',
    tags: ['dns', 'c2'],
    falsePositiveRisk: 15,
  },
];

const AlertsPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | 'all'>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = searchQuery === '' || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const toggleSelectAlert = (id: string) => {
    setSelectedAlerts(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedAlerts(prev => 
      prev.length === filteredAlerts.length ? [] : filteredAlerts.map(a => a.id)
    );
  };

  const stats = {
    total: mockAlerts.length,
    new: mockAlerts.filter(a => a.status === 'new').length,
    critical: mockAlerts.filter(a => a.severity === 'critical').length,
    acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length,
  };

  const getSourceIcon = (source: string) => {
    if (source.toLowerCase().includes('aws') || source.toLowerCase().includes('cloud')) {
      return <Cloud className="w-4 h-4 text-orange-400" />;
    }
    if (source.toLowerCase().includes('crowd') || source.toLowerCase().includes('endpoint')) {
      return <Monitor className="w-4 h-4 text-blue-400" />;
    }
    return <Shield className="w-4 h-4 text-violet-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Triage</h1>
          <p className="text-gray-400 text-sm mt-1">Review and respond to security alerts</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedAlerts.length > 0 && (
            <>
              <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Check className="w-4 h-4" />
                <span className="text-sm">Acknowledge ({selectedAlerts.length})</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <X className="w-4 h-4" />
                <span className="text-sm">Dismiss ({selectedAlerts.length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: stats.total, icon: Bell, color: 'text-violet-400' },
          { label: 'New', value: stats.new, icon: AlertTriangle, color: 'text-blue-400' },
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Acknowledged', value: stats.acknowledged, icon: Eye, color: 'text-yellow-400' },
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
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as AlertSeverity | 'all')}
            className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as AlertStatus | 'all')}
            className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-[#334155] bg-[#0F172A] text-violet-500 focus:ring-violet-500"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Severity</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Alert</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alert) => (
              <tr 
                key={alert.id}
                className="border-b border-[#334155] hover:bg-[#0F172A] transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.includes(alert.id)}
                    onChange={() => toggleSelectAlert(alert.id)}
                    className="w-4 h-4 rounded border-[#334155] bg-[#0F172A] text-violet-500 focus:ring-violet-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${SEVERITY_BG_COLORS[alert.severity]}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white font-medium text-sm">{alert.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5 truncate max-w-md">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {alert.mitreTactic && (
                        <span className="bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded text-xs">
                          {alert.mitreTactic}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">{alert.ruleName}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(alert.source)}
                    <span className="text-gray-300 text-sm">{alert.source}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimestamp(alert.createdAt)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                    alert.status === 'acknowledged' ? 'bg-yellow-500/20 text-yellow-400' :
                    alert.status === 'investigating' ? 'bg-orange-500/20 text-orange-400' :
                    alert.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {alert.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-[#334155] rounded transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsPanel;
