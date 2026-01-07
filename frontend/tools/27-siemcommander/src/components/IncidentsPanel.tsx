import React, { useState } from 'react';
import {
  Plus, Search, Filter, Clock, User, AlertTriangle, CheckCircle,
  XCircle, ArrowRight, MessageSquare, FileText, Link as LinkIcon
} from 'lucide-react';
import type { Incident, IncidentSeverity, IncidentStatus } from '../types';
import { SEVERITY_BG_COLORS, INCIDENT_CATEGORIES, formatTimestamp, formatDuration } from '../constants';

// Mock incidents data
const mockIncidents: Incident[] = [
  {
    id: 'INC-2024-001',
    title: 'Ransomware Attack on Finance Department',
    description: 'Multiple workstations in finance showing ransomware indicators. Files being encrypted with .locked extension.',
    severity: 'critical',
    status: 'active',
    category: 'malware',
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 600000),
    assignedTo: 'Sarah Chen',
    relatedEvents: ['EVT-001', 'EVT-002', 'EVT-003'],
    affectedAssets: ['FIN-WS-01', 'FIN-WS-02', 'FIN-SRV-01'],
    timeline: [
      { timestamp: new Date(Date.now() - 7200000), action: 'Incident created', user: 'Auto-Detection' },
      { timestamp: new Date(Date.now() - 6600000), action: 'Assigned to Sarah Chen', user: 'SOC Manager' },
      { timestamp: new Date(Date.now() - 5400000), action: 'Containment started - isolating affected hosts', user: 'Sarah Chen' },
      { timestamp: new Date(Date.now() - 3600000), action: 'Backup status verified - last backup 2 hours ago', user: 'Sarah Chen' },
    ],
    notes: [],
    iocs: [
      { type: 'hash', value: 'a1b2c3d4e5f6...', confidence: 95, source: 'VirusTotal' },
      { type: 'ip', value: '45.33.32.156', confidence: 90, source: 'Threat Intel' },
    ],
    tags: ['ransomware', 'finance', 'critical'],
    ttl: 14400000,
    slaDeadline: new Date(Date.now() + 3600000),
  },
  {
    id: 'INC-2024-002',
    title: 'Suspicious Admin Account Activity',
    description: 'Admin account showing unusual login patterns from multiple countries within short timeframe.',
    severity: 'high',
    status: 'investigating',
    category: 'unauthorized_access',
    createdAt: new Date(Date.now() - 18000000),
    updatedAt: new Date(Date.now() - 3600000),
    assignedTo: 'Mike Johnson',
    relatedEvents: ['EVT-004'],
    affectedAssets: ['AD-DC-01'],
    timeline: [
      { timestamp: new Date(Date.now() - 18000000), action: 'Incident created', user: 'UEBA Alert' },
      { timestamp: new Date(Date.now() - 17400000), action: 'Assigned to Mike Johnson', user: 'SOC Manager' },
    ],
    notes: [],
    iocs: [],
    tags: ['impossible_travel', 'admin_account'],
    ttl: 28800000,
  },
  {
    id: 'INC-2024-003',
    title: 'Data Exfiltration Attempt Blocked',
    description: 'DLP system blocked upload of sensitive customer data to external cloud storage.',
    severity: 'medium',
    status: 'contained',
    category: 'data_exfiltration',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 43200000),
    assignedTo: 'Alex Rivera',
    relatedEvents: ['EVT-010', 'EVT-011'],
    affectedAssets: ['HR-WS-05'],
    timeline: [],
    notes: [],
    iocs: [],
    tags: ['dlp', 'insider_threat'],
    ttl: 172800000,
  },
  {
    id: 'INC-2024-004',
    title: 'Phishing Campaign Targeting Executives',
    description: 'Coordinated phishing campaign identified targeting C-level executives with fake DocuSign requests.',
    severity: 'high',
    status: 'resolved',
    category: 'phishing',
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 86400000),
    resolvedAt: new Date(Date.now() - 86400000),
    assignedTo: 'Emma Wilson',
    relatedEvents: ['EVT-020', 'EVT-021', 'EVT-022'],
    affectedAssets: [],
    timeline: [],
    notes: [],
    iocs: [],
    tags: ['phishing', 'executive', 'docusign'],
    ttl: 259200000,
  },
];

const IncidentsPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<IncidentSeverity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | 'all'>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSearch = searchQuery === '' || 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || incident.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || incident.status === selectedStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'new': return <AlertTriangle className="w-4 h-4 text-blue-400" />;
      case 'active': return <ArrowRight className="w-4 h-4 text-red-400" />;
      case 'investigating': return <Search className="w-4 h-4 text-yellow-400" />;
      case 'contained': return <CheckCircle className="w-4 h-4 text-orange-400" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'closed': return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const stats = {
    total: mockIncidents.length,
    active: mockIncidents.filter(i => i.status === 'active').length,
    investigating: mockIncidents.filter(i => i.status === 'investigating').length,
    resolved: mockIncidents.filter(i => i.status === 'resolved').length,
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main List */}
      <div className={`flex-1 space-y-6 ${selectedIncident ? 'max-w-2xl' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Incidents</h1>
            <p className="text-gray-400 text-sm mt-1">Manage and respond to security incidents</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Incident</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Active', value: stats.active, color: 'text-red-400' },
            { label: 'Investigating', value: stats.investigating, color: 'text-yellow-400' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1E293B] rounded-lg border border-[#334155] p-4">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-[#1E293B] rounded-xl border border-[#334155] p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as IncidentSeverity | 'all')}
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
            onChange={(e) => setSelectedStatus(e.target.value as IncidentStatus | 'all')}
            className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Incidents List */}
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              onClick={() => setSelectedIncident(incident)}
              className={`bg-[#1E293B] rounded-xl border p-4 cursor-pointer transition-all hover:border-violet-500 ${
                selectedIncident?.id === incident.id ? 'border-violet-500' : 'border-[#334155]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_BG_COLORS[incident.severity]}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className="text-gray-500 text-sm">{incident.id}</span>
                  </div>
                  <h3 className="text-white font-medium">{incident.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{incident.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {getStatusIcon(incident.status)}
                  <span className="text-gray-300 text-sm capitalize">{incident.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{incident.assignedTo || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimestamp(incident.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  <span>{incident.relatedEvents.length} events</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedIncident && (
        <div className="w-[500px] bg-[#1E293B] rounded-xl border border-[#334155] p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-gray-400 text-sm">{selectedIncident.id}</span>
              <h2 className="text-xl font-bold text-white mt-1">{selectedIncident.title}</h2>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-gray-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Status & Severity */}
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-gray-400 text-xs uppercase mb-1">Severity</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${SEVERITY_BG_COLORS[selectedIncident.severity]}`}>
                  {selectedIncident.severity.toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-xs uppercase mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedIncident.status)}
                  <span className="text-white capitalize">{selectedIncident.status}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-400 text-xs uppercase mb-2">Description</p>
              <p className="text-gray-300 text-sm">{selectedIncident.description}</p>
            </div>

            {/* Category */}
            <div>
              <p className="text-gray-400 text-xs uppercase mb-2">Category</p>
              <span className="bg-violet-500/20 text-violet-400 px-2 py-1 rounded text-sm">
                {INCIDENT_CATEGORIES.find(c => c.id === selectedIncident.category)?.name || selectedIncident.category}
              </span>
            </div>

            {/* Affected Assets */}
            <div>
              <p className="text-gray-400 text-xs uppercase mb-2">Affected Assets</p>
              <div className="flex flex-wrap gap-2">
                {selectedIncident.affectedAssets.map((asset, i) => (
                  <span key={i} className="bg-[#334155] text-gray-300 px-2 py-1 rounded text-sm">
                    {asset}
                  </span>
                ))}
                {selectedIncident.affectedAssets.length === 0 && (
                  <span className="text-gray-500 text-sm">No assets linked</span>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-gray-400 text-xs uppercase mb-2">Timeline</p>
              <div className="space-y-3">
                {selectedIncident.timeline.map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                    <div>
                      <p className="text-white text-sm">{entry.action}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span>{formatTimestamp(entry.timestamp)}</span>
                        <span>•</span>
                        <span>{entry.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedIncident.timeline.length === 0 && (
                  <span className="text-gray-500 text-sm">No timeline entries</span>
                )}
              </div>
            </div>

            {/* IOCs */}
            {selectedIncident.iocs.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs uppercase mb-2">Indicators of Compromise</p>
                <div className="space-y-2">
                  {selectedIncident.iocs.map((ioc, i) => (
                    <div key={i} className="bg-[#0F172A] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <code className="text-violet-400 text-sm">{ioc.value}</code>
                        <span className="text-gray-400 text-xs uppercase">{ioc.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>Confidence: {ioc.confidence}%</span>
                        <span>•</span>
                        <span>Source: {ioc.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-[#334155]">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                <MessageSquare className="w-4 h-4" />
                Add Note
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors">
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsPanel;
