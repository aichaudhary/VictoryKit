import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, XCircle, Filter, Search, ArrowUpDown } from 'lucide-react';

interface Threat {
  id: string;
  threatId: string;
  threatType: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: string;
  source: {
    type: string;
    macAddress?: string;
    identifier?: string;
  };
  description: string;
  detectionTime: string;
  mlConfidence?: number;
}

const ThreatsPage: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API calls
  const mockThreats: Threat[] = [
    {
      id: '1',
      threatId: 'THREAT-001',
      threatType: 'rogue_ap',
      severity: 'critical',
      status: 'active',
      source: { type: 'access_point', macAddress: 'AA:BB:CC:DD:EE:FF', identifier: 'Unknown AP' },
      description: 'Rogue access point detected broadcasting fake SSID',
      detectionTime: new Date(Date.now() - 120000).toISOString(),
      mlConfidence: 0.95
    },
    {
      id: '2',
      threatId: 'THREAT-002',
      threatType: 'deauth_attack',
      severity: 'high',
      status: 'investigating',
      source: { type: 'device', macAddress: '11:22:33:44:55:66' },
      description: 'Deauthentication attack targeting multiple clients',
      detectionTime: new Date(Date.now() - 900000).toISOString(),
      mlConfidence: 0.88
    },
    {
      id: '3',
      threatId: 'THREAT-003',
      threatType: 'unauthorized_device',
      severity: 'medium',
      status: 'contained',
      source: { type: 'device', macAddress: 'FF:EE:DD:CC:BB:AA', identifier: 'Unknown Device' },
      description: 'Unauthorized device attempting to connect',
      detectionTime: new Date(Date.now() - 3600000).toISOString(),
      mlConfidence: 0.92
    }
  ];

  useEffect(() => {
    loadThreats();
  }, []);

  const loadThreats = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setThreats(mockThreats);
      setLoading(false);
    }, 500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'investigating': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'contained': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'resolved': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredThreats = threats.filter(threat => {
    const matchesFilter = filter === 'all' || threat.status === filter;
    const matchesSearch = threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.threatType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Threat Management</h1>
          <p className="text-gray-400 mt-1">Monitor and respond to wireless security threats</p>
        </div>
        <button
          onClick={loadThreats}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Threats</p>
              <p className="text-2xl font-bold text-white">{threats.filter(t => t.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Investigating</p>
              <p className="text-2xl font-bold text-white">{threats.filter(t => t.status === 'investigating').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Contained</p>
              <p className="text-2xl font-bold text-white">{threats.filter(t => t.status === 'contained').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-white">{threats.filter(t => t.status === 'resolved').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search threats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="investigating">Investigating</option>
          <option value="contained">Contained</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Threats Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Threat ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Detected</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredThreats.map((threat) => (
                <tr key={threat.id} className="hover:bg-gray-900/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusIcon(threat.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {threat.threatId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {threat.threatType.replace(/_/g, ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                    {threat.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(threat.detectionTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {threat.mlConfidence ? `${(threat.mlConfidence * 100).toFixed(0)}%` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">View</button>
                    <button className="text-red-400 hover:text-red-300">Block</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ThreatsPage;
