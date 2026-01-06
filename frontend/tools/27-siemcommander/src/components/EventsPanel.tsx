import React, { useState } from 'react';
import {
  Search, Filter, RefreshCw, Download, ChevronDown, ChevronRight,
  Eye, AlertTriangle, Clock, Monitor, Shield, Database, Cloud, Mail
} from 'lucide-react';
import type { SecurityEvent, EventSeverity, EventSource } from '../types';
import { SEVERITY_BG_COLORS, EVENT_SOURCES, formatTimestamp } from '../constants';

// Mock events data
const mockEvents: SecurityEvent[] = [
  {
    id: 'EVT-001',
    timestamp: new Date(),
    source: 'firewall',
    sourceName: 'Palo Alto FW-01',
    sourceIP: '192.168.1.50',
    destinationIP: '45.33.32.156',
    severity: 'critical',
    category: 'Intrusion',
    title: 'Suspicious outbound connection to known C2 server',
    description: 'Traffic detected to IP associated with APT29 infrastructure',
    rawLog: '2024-01-15 14:32:15 THREAT id=123456 type=spyware...',
    normalizedFields: {},
    mitreTactic: 'Command and Control',
    mitreTechnique: 'T1071.001',
    indicators: ['45.33.32.156', 'apt29', 'c2'],
    status: 'new',
    tags: ['apt', 'c2', 'critical'],
  },
  {
    id: 'EVT-002',
    timestamp: new Date(Date.now() - 120000),
    source: 'endpoint',
    sourceName: 'CrowdStrike',
    sourceIP: '10.0.0.25',
    severity: 'high',
    category: 'Malware',
    title: 'PowerShell execution with encoded command',
    description: 'Suspicious encoded PowerShell command detected on WORKSTATION-15',
    rawLog: 'powershell.exe -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...',
    normalizedFields: {},
    mitreTactic: 'Execution',
    mitreTechnique: 'T1059.001',
    indicators: ['encoded_powershell', 'WORKSTATION-15'],
    status: 'investigating',
    assignedTo: 'analyst1',
    tags: ['powershell', 'encoded'],
  },
  {
    id: 'EVT-003',
    timestamp: new Date(Date.now() - 300000),
    source: 'ids',
    sourceName: 'Suricata IDS',
    sourceIP: '192.168.10.100',
    destinationIP: '8.8.8.8',
    severity: 'medium',
    category: 'Policy Violation',
    title: 'DNS tunneling attempt detected',
    description: 'Abnormal DNS query patterns suggesting data exfiltration',
    rawLog: 'DNS query for: encoded-data.exfil.malicious.com',
    normalizedFields: {},
    mitreTactic: 'Exfiltration',
    mitreTechnique: 'T1048.003',
    indicators: ['dns_tunnel', 'exfil'],
    status: 'new',
    tags: ['dns', 'exfiltration'],
  },
  {
    id: 'EVT-004',
    timestamp: new Date(Date.now() - 600000),
    source: 'cloud',
    sourceName: 'AWS CloudTrail',
    sourceIP: '203.0.113.50',
    severity: 'high',
    category: 'Unauthorized Access',
    title: 'IAM policy change from unknown IP',
    description: 'Admin IAM policy was modified from an IP not in known corporate range',
    rawLog: '{"eventSource":"iam.amazonaws.com","eventName":"PutUserPolicy"...}',
    normalizedFields: {},
    mitreTactic: 'Privilege Escalation',
    mitreTechnique: 'T1078',
    indicators: ['iam_change', 'unknown_ip'],
    status: 'escalated',
    tags: ['aws', 'iam', 'privilege'],
  },
  {
    id: 'EVT-005',
    timestamp: new Date(Date.now() - 900000),
    source: 'email',
    sourceName: 'Proofpoint',
    sourceIP: '185.234.72.10',
    severity: 'medium',
    category: 'Phishing',
    title: 'Credential harvesting link detected in email',
    description: 'Email with link to fake Microsoft login page blocked',
    rawLog: 'Subject: Urgent: Update your password...',
    normalizedFields: {},
    mitreTactic: 'Initial Access',
    mitreTechnique: 'T1566.002',
    indicators: ['phishing', 'credential_harvest'],
    status: 'resolved',
    tags: ['phishing', 'email'],
  },
];

const EventsPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<EventSeverity | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<EventSource | 'all'>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.sourceIP.includes(searchQuery);
    const matchesSeverity = selectedSeverity === 'all' || event.severity === selectedSeverity;
    const matchesSource = selectedSource === 'all' || event.source === selectedSource;
    return matchesSearch && matchesSeverity && matchesSource;
  });

  const getSourceIcon = (source: EventSource) => {
    const icons: Record<EventSource, React.ReactNode> = {
      firewall: <Shield className="w-4 h-4" />,
      ids: <Eye className="w-4 h-4" />,
      ips: <Shield className="w-4 h-4" />,
      endpoint: <Monitor className="w-4 h-4" />,
      cloud: <Cloud className="w-4 h-4" />,
      application: <Database className="w-4 h-4" />,
      network: <Database className="w-4 h-4" />,
      database: <Database className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      proxy: <Shield className="w-4 h-4" />,
    };
    return icons[source];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Events</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time event stream from all data sources</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-gray-300 hover:bg-[#334155] transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-gray-300 hover:bg-[#334155] transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-[#1E293B] rounded-xl border border-[#334155] p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by IP, hostname, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as EventSeverity | 'all')}
            className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value as EventSource | 'all')}
            className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Sources</option>
            {EVENT_SOURCES.map(source => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-8"></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Severity</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Event</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Source IP</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <React.Fragment key={event.id}>
                <tr 
                  className="border-b border-[#334155] hover:bg-[#0F172A] cursor-pointer transition-colors"
                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                >
                  <td className="px-4 py-3">
                    {expandedEvent === event.id ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${SEVERITY_BG_COLORS[event.severity]}`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-violet-400">{getSourceIcon(event.source)}</span>
                      <span className="text-gray-300 text-sm">{event.sourceName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium truncate max-w-md">{event.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-violet-400 text-sm bg-violet-500/10 px-2 py-0.5 rounded">
                      {event.sourceIP}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      event.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                      event.status === 'escalated' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
                {expandedEvent === event.id && (
                  <tr className="bg-[#0F172A]">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
                          <p className="text-gray-400 text-sm">{event.description}</p>
                          
                          <h4 className="text-sm font-semibold text-gray-300 mt-4 mb-2">MITRE ATT&CK</h4>
                          <div className="flex gap-2">
                            {event.mitreTactic && (
                              <span className="bg-violet-500/20 text-violet-400 px-2 py-1 rounded text-xs">
                                {event.mitreTactic}
                              </span>
                            )}
                            {event.mitreTechnique && (
                              <span className="bg-violet-500/20 text-violet-400 px-2 py-1 rounded text-xs">
                                {event.mitreTechnique}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-sm font-semibold text-gray-300 mt-4 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag, i) => (
                              <span key={i} className="bg-[#334155] text-gray-300 px-2 py-0.5 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-2">Raw Log</h4>
                          <pre className="bg-[#1E293B] p-3 rounded-lg text-xs text-gray-400 overflow-x-auto">
                            {event.rawLog}
                          </pre>
                          
                          <div className="flex gap-2 mt-4">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
                              <AlertTriangle className="w-4 h-4" />
                              Create Incident
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#334155] text-gray-300 rounded-lg text-sm hover:bg-[#475569] transition-colors">
                              <Eye className="w-4 h-4" />
                              Investigate
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsPanel;
