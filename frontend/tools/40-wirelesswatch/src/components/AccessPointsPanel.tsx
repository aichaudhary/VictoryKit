import React, { useState } from 'react';
import { 
  Radio, Users, Clock, MapPin, 
  Search, RefreshCw, Cpu
} from 'lucide-react';
import { AccessPoint } from '../types';

interface AccessPointsPanelProps {
  accessPoints: AccessPoint[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelect: (ap: AccessPoint) => void;
}

const AccessPointsPanel: React.FC<AccessPointsPanelProps> = ({ 
  accessPoints, 
  isLoading, 
  onRefresh,
  onSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAPs = accessPoints.filter(ap => {
    const matchesSearch = 
      ap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.ipAddress?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || ap.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      online: 'bg-green-500/20 text-green-400 border-green-500/50',
      offline: 'bg-red-500/20 text-red-400 border-red-500/50',
      degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      maintenance: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    };
    return colors[status] || colors.offline;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            Access Points
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredAPs.length} access points • {filteredAPs.filter(ap => ap.status === 'online').length} online
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, MAC, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="degraded">Degraded</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Access Points Grid */}
      {filteredAPs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAPs.map((ap) => (
            <div
              key={ap.apId}
              onClick={() => onSelect(ap)}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-cyan-500/50 cursor-pointer transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${ap.status === 'online' ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                    <Radio className={`w-5 h-5 ${ap.status === 'online' ? 'text-green-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{ap.name}</h3>
                    <p className="text-gray-500 text-xs">{ap.macAddress}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(ap.status)}`}>
                  {ap.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                    <Users className="w-3 h-3" />
                    Clients
                  </div>
                  <p className="text-white font-medium">{ap.connectedClients?.total || 0}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                    <Clock className="w-3 h-3" />
                    Uptime
                  </div>
                  <p className="text-white font-medium">
                    {ap.performance?.uptime ? formatUptime(ap.performance.uptime) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Radio Bands */}
              <div className="flex gap-2 mb-3">
                {ap.radios?.map((radio, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded"
                  >
                    {radio.band} CH{radio.channel}
                  </span>
                ))}
              </div>

              {/* Location & Hardware */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                {ap.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {ap.location.building} {ap.location.floor && `- ${ap.location.floor}`}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  {ap.hardware?.manufacturer || 'Unknown'}
                </div>
              </div>

              {/* Performance Bar */}
              {ap.performance && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">CPU/Memory</span>
                    <span className="text-gray-400">
                      {ap.performance.cpuUtilization}% / {ap.performance.memoryUtilization}%
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          ap.performance.cpuUtilization > 80 ? 'bg-red-500' :
                          ap.performance.cpuUtilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${ap.performance.cpuUtilization}%` }}
                      />
                    </div>
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          ap.performance.memoryUtilization > 80 ? 'bg-red-500' :
                          ap.performance.memoryUtilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${ap.performance.memoryUtilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
          <Radio className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No access points found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default AccessPointsPanel;
