import React, { useState } from 'react';
import {
  Plus, Search, Settings, RefreshCw, CheckCircle, XCircle,
  AlertTriangle, Database, Cloud, Shield, Monitor, Mail,
  Activity, Clock, ChevronRight
} from 'lucide-react';
import type { DataSource, DataSourceStatus, DataSourceType } from '../types';
import { formatTimestamp, formatNumber } from '../constants';

// Mock data sources
const mockDataSources: DataSource[] = [
  {
    id: 'DS-001',
    name: 'Palo Alto Firewall',
    type: 'firewall',
    status: 'connected',
    host: '10.0.0.1',
    port: 514,
    protocol: 'syslog',
    lastEventTime: new Date(),
    eventsPerSecond: 2500,
    totalEvents: 156000000,
    healthStatus: 'healthy',
    config: { format: 'CEF', timezone: 'UTC' },
    createdAt: new Date(Date.now() - 7776000000),
    tags: ['perimeter', 'production'],
  },
  {
    id: 'DS-002',
    name: 'CrowdStrike Falcon',
    type: 'endpoint',
    status: 'connected',
    host: 'api.crowdstrike.com',
    protocol: 'api',
    lastEventTime: new Date(Date.now() - 30000),
    eventsPerSecond: 850,
    totalEvents: 89000000,
    healthStatus: 'healthy',
    config: { clientId: 'xxx...', region: 'us-1' },
    createdAt: new Date(Date.now() - 5184000000),
    tags: ['endpoint', 'edr'],
  },
  {
    id: 'DS-003',
    name: 'AWS CloudTrail',
    type: 'cloud',
    status: 'connected',
    host: 's3://cloudtrail-logs-bucket',
    protocol: 's3',
    lastEventTime: new Date(Date.now() - 60000),
    eventsPerSecond: 120,
    totalEvents: 45000000,
    healthStatus: 'healthy',
    config: { region: 'us-east-1', accounts: ['123456789', '987654321'] },
    createdAt: new Date(Date.now() - 2592000000),
    tags: ['aws', 'cloud'],
  },
  {
    id: 'DS-004',
    name: 'Microsoft 365',
    type: 'cloud',
    status: 'connected',
    host: 'graph.microsoft.com',
    protocol: 'api',
    lastEventTime: new Date(Date.now() - 120000),
    eventsPerSecond: 350,
    totalEvents: 67000000,
    healthStatus: 'degraded',
    healthMessage: 'API rate limiting detected',
    config: { tenant: 'company.onmicrosoft.com' },
    createdAt: new Date(Date.now() - 4320000000),
    tags: ['o365', 'email', 'azure'],
  },
  {
    id: 'DS-005',
    name: 'Suricata IDS',
    type: 'ids',
    status: 'connected',
    host: '10.0.0.50',
    port: 514,
    protocol: 'syslog',
    lastEventTime: new Date(Date.now() - 15000),
    eventsPerSecond: 1200,
    totalEvents: 234000000,
    healthStatus: 'healthy',
    config: { rulesets: ['emerging-threats', 'custom'] },
    createdAt: new Date(Date.now() - 6048000000),
    tags: ['ids', 'network'],
  },
  {
    id: 'DS-006',
    name: 'Windows Event Logs',
    type: 'application',
    status: 'connected',
    host: '*.company.local',
    protocol: 'winrm',
    lastEventTime: new Date(Date.now() - 45000),
    eventsPerSecond: 3200,
    totalEvents: 890000000,
    healthStatus: 'healthy',
    config: { eventIds: [4624, 4625, 4688, 4697], dc: true },
    createdAt: new Date(Date.now() - 8640000000),
    tags: ['windows', 'authentication', 'ad'],
  },
  {
    id: 'DS-007',
    name: 'Proofpoint Email',
    type: 'email',
    status: 'error',
    host: 'api.proofpoint.com',
    protocol: 'api',
    lastEventTime: new Date(Date.now() - 3600000),
    eventsPerSecond: 0,
    totalEvents: 12000000,
    healthStatus: 'unhealthy',
    healthMessage: 'API credentials expired',
    config: { tenant: 'company' },
    createdAt: new Date(Date.now() - 1296000000),
    tags: ['email', 'phishing'],
  },
  {
    id: 'DS-008',
    name: 'Zscaler Proxy',
    type: 'proxy',
    status: 'disconnected',
    host: 'admin.zscaler.net',
    protocol: 'api',
    lastEventTime: new Date(Date.now() - 86400000),
    eventsPerSecond: 0,
    totalEvents: 45000000,
    healthStatus: 'unhealthy',
    healthMessage: 'Connection timeout',
    config: {},
    createdAt: new Date(Date.now() - 3456000000),
    tags: ['proxy', 'web'],
  },
];

const DataSourcesPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DataSourceType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<DataSourceStatus | 'all'>('all');

  const filteredSources = mockDataSources.filter(source => {
    const matchesSearch = searchQuery === '' ||
      source.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || source.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || source.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: mockDataSources.length,
    connected: mockDataSources.filter(s => s.status === 'connected').length,
    eps: mockDataSources.reduce((acc, s) => acc + s.eventsPerSecond, 0),
    totalEvents: mockDataSources.reduce((acc, s) => acc + s.totalEvents, 0),
  };

  const getTypeIcon = (type: DataSourceType) => {
    const icons: Record<DataSourceType, React.ReactNode> = {
      firewall: <Shield className="w-5 h-5 text-orange-400" />,
      ids: <Activity className="w-5 h-5 text-blue-400" />,
      ips: <Shield className="w-5 h-5 text-purple-400" />,
      endpoint: <Monitor className="w-5 h-5 text-green-400" />,
      cloud: <Cloud className="w-5 h-5 text-cyan-400" />,
      application: <Database className="w-5 h-5 text-violet-400" />,
      network: <Activity className="w-5 h-5 text-yellow-400" />,
      database: <Database className="w-5 h-5 text-pink-400" />,
      email: <Mail className="w-5 h-5 text-red-400" />,
      proxy: <Shield className="w-5 h-5 text-gray-400" />,
    };
    return icons[type];
  };

  const getStatusBadge = (status: DataSourceStatus) => {
    switch (status) {
      case 'connected':
        return <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle className="w-4 h-4" /> Connected</span>;
      case 'disconnected':
        return <span className="flex items-center gap-1 text-gray-400 text-sm"><XCircle className="w-4 h-4" /> Disconnected</span>;
      case 'error':
        return <span className="flex items-center gap-1 text-red-400 text-sm"><AlertTriangle className="w-4 h-4" /> Error</span>;
      case 'configuring':
        return <span className="flex items-center gap-1 text-yellow-400 text-sm"><Settings className="w-4 h-4 animate-spin" /> Configuring</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Sources</h1>
          <p className="text-gray-400 text-sm mt-1">Manage log sources and data integrations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Data Source</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Sources', value: stats.total, icon: Database, color: 'text-violet-400' },
          { label: 'Connected', value: stats.connected, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Events/Second', value: formatNumber(stats.eps), icon: Activity, color: 'text-blue-400' },
          { label: 'Total Events', value: formatNumber(stats.totalEvents), icon: Database, color: 'text-yellow-400' },
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
            placeholder="Search data sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DataSourceType | 'all')}
          className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Types</option>
          <option value="firewall">Firewall</option>
          <option value="ids">IDS/IPS</option>
          <option value="endpoint">Endpoint</option>
          <option value="cloud">Cloud</option>
          <option value="application">Application</option>
          <option value="email">Email</option>
          <option value="proxy">Proxy</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as DataSourceStatus | 'all')}
          className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Statuses</option>
          <option value="connected">Connected</option>
          <option value="disconnected">Disconnected</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="bg-[#1E293B] rounded-xl border border-[#334155] p-4 hover:border-violet-500 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#0F172A] rounded-lg">
                  {getTypeIcon(source.type)}
                </div>
                <div>
                  <h3 className="text-white font-medium">{source.name}</h3>
                  <p className="text-gray-400 text-sm">{source.host}</p>
                </div>
              </div>
              {getStatusBadge(source.status)}
            </div>

            {source.healthStatus === 'degraded' || source.healthStatus === 'unhealthy' ? (
              <div className={`mt-3 p-2 rounded-lg text-sm ${
                source.healthStatus === 'unhealthy' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
              }`}>
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {source.healthMessage}
              </div>
            ) : null}

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#334155]">
              <div>
                <p className="text-gray-500 text-xs">Events/sec</p>
                <p className="text-white font-medium">{formatNumber(source.eventsPerSecond)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Total Events</p>
                <p className="text-white font-medium">{formatNumber(source.totalEvents)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Last Event</p>
                <p className="text-white font-medium text-sm">
                  {source.status === 'connected' ? formatTimestamp(source.lastEventTime) : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-wrap gap-2">
                {source.tags.map((tag, i) => (
                  <span key={i} className="bg-[#334155] text-gray-300 px-2 py-0.5 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 bg-[#334155] rounded hover:bg-[#475569] transition-colors">
                  <RefreshCw className="w-4 h-4 text-gray-300" />
                </button>
                <button className="p-1.5 bg-[#334155] rounded hover:bg-[#475569] transition-colors">
                  <Settings className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSourcesPanel;
