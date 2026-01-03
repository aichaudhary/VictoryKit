import React, { useState } from 'react';
import { 
  Laptop, Smartphone, Tablet, Cpu, Printer, HelpCircle,
  Search, RefreshCw, Signal, Shield, Ban,
  Wifi
} from 'lucide-react';
import { WirelessClient } from '../types';

interface ClientsPanelProps {
  clients: WirelessClient[];
  isLoading: boolean;
  onRefresh: () => void;
  onBlock: (clientId: string, reason: string) => void;
  onSelect: (client: WirelessClient) => void;
}

const ClientsPanel: React.FC<ClientsPanelProps> = ({
  clients,
  isLoading,
  onRefresh,
  onBlock,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.ipAddress?.includes(searchTerm) ||
      client.device?.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.connectionStatus === statusFilter;
    const matchesDevice = deviceFilter === 'all' || client.device?.deviceType === deviceFilter;
    
    return matchesSearch && matchesStatus && matchesDevice;
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'laptop':
        return <Laptop className="w-5 h-5" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'iot':
        return <Cpu className="w-5 h-5" />;
      case 'printer':
        return <Printer className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      connected: 'bg-green-500/20 text-green-400 border-green-500/50',
      disconnected: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      roaming: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      blocked: 'bg-red-500/20 text-red-400 border-red-500/50',
      quarantined: 'bg-orange-500/20 text-orange-400 border-orange-500/50'
    };
    return colors[status] || colors.disconnected;
  };

  const getTrustBadge = (trustLevel: string) => {
    const colors: Record<string, string> = {
      trusted: 'bg-green-500/20 text-green-400',
      verified: 'bg-blue-500/20 text-blue-400',
      unknown: 'bg-gray-500/20 text-gray-400',
      suspicious: 'bg-orange-500/20 text-orange-400',
      blocked: 'bg-red-500/20 text-red-400'
    };
    return colors[trustLevel] || colors.unknown;
  };

  const getSignalQuality = (rssi: number) => {
    if (rssi >= -50) return { quality: 'Excellent', color: 'text-green-400', bars: 4 };
    if (rssi >= -60) return { quality: 'Good', color: 'text-green-400', bars: 3 };
    if (rssi >= -70) return { quality: 'Fair', color: 'text-yellow-400', bars: 2 };
    return { quality: 'Poor', color: 'text-red-400', bars: 1 };
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  // Client stats
  const stats = {
    connected: clients.filter(c => c.connectionStatus === 'connected').length,
    laptops: clients.filter(c => c.device?.deviceType === 'laptop').length,
    mobile: clients.filter(c => ['smartphone', 'tablet'].includes(c.device?.deviceType || '')).length,
    iot: clients.filter(c => c.device?.deviceType === 'iot').length,
    suspicious: clients.filter(c => c.security?.trustLevel === 'suspicious').length
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
            <Laptop className="w-6 h-6 text-purple-400" />
            Connected Clients
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredClients.length} clients • {stats.connected} connected
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Laptop className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-xs">Laptops</span>
          </div>
          <p className="text-white font-medium">{stats.laptops}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-xs">Mobile</span>
          </div>
          <p className="text-white font-medium">{stats.mobile}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-xs">IoT</span>
          </div>
          <p className="text-white font-medium">{stats.iot}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-xs">Connected</span>
          </div>
          <p className="text-white font-medium">{stats.connected}</p>
        </div>
        {stats.suspicious > 0 && (
          <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-xs">Suspicious</span>
            </div>
            <p className="text-orange-400 font-medium">{stats.suspicious}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by hostname, MAC, IP, or manufacturer..."
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
          <option value="connected">Connected</option>
          <option value="disconnected">Disconnected</option>
          <option value="roaming">Roaming</option>
          <option value="blocked">Blocked</option>
        </select>
        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Devices</option>
          <option value="laptop">Laptops</option>
          <option value="smartphone">Smartphones</option>
          <option value="tablet">Tablets</option>
          <option value="iot">IoT Devices</option>
          <option value="printer">Printers</option>
        </select>
      </div>

      {/* Clients Table */}
      {filteredClients.length > 0 ? (
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 text-xs font-medium p-4">Device</th>
                <th className="text-left text-gray-400 text-xs font-medium p-4">Connection</th>
                <th className="text-left text-gray-400 text-xs font-medium p-4">Signal</th>
                <th className="text-left text-gray-400 text-xs font-medium p-4">Traffic</th>
                <th className="text-left text-gray-400 text-xs font-medium p-4">Security</th>
                <th className="text-right text-gray-400 text-xs font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const signal = getSignalQuality(client.signalQuality?.rssi || -80);
                
                return (
                  <tr 
                    key={client.clientId}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer transition-colors"
                    onClick={() => onSelect(client)}
                  >
                    {/* Device */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          client.connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {getDeviceIcon(client.device?.deviceType || 'unknown')}
                        </div>
                        <div>
                          <p className="text-white font-medium">{client.hostname || 'Unknown'}</p>
                          <p className="text-gray-500 text-xs">{client.macAddress}</p>
                          {client.device?.manufacturer && (
                            <p className="text-gray-600 text-xs">{client.device.manufacturer}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Connection */}
                    <td className="p-4">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(client.connectionStatus)}`}>
                          {client.connectionStatus}
                        </span>
                        {client.currentConnection && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p className="flex items-center gap-1">
                              <Wifi className="w-3 h-3" />
                              {client.currentConnection.ssid}
                            </p>
                            <p>{client.currentConnection.band} CH{client.currentConnection.channel}</p>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Signal */}
                    <td className="p-4">
                      {client.signalQuality ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <Signal className={`w-4 h-4 ${signal.color}`} />
                            <span className={signal.color}>{client.signalQuality.rssi} dBm</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">{signal.quality}</p>
                          <p className="text-gray-600 text-xs">{client.signalQuality.linkSpeed} Mbps</p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                      )}
                    </td>

                    {/* Traffic */}
                    <td className="p-4">
                      {client.trafficStats ? (
                        <div className="text-xs">
                          <p className="text-green-400 flex items-center gap-1">
                            ↓ {formatBytes(client.trafficStats.bytesReceived)}
                          </p>
                          <p className="text-blue-400 flex items-center gap-1">
                            ↑ {formatBytes(client.trafficStats.bytesSent)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                      )}
                    </td>

                    {/* Security */}
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${getTrustBadge(client.security?.trustLevel || 'unknown')}`}>
                        {client.security?.trustLevel || 'Unknown'}
                      </span>
                      {client.security?.threatIndicators?.length > 0 && (
                        <p className="text-orange-400 text-xs mt-1">
                          {client.security.threatIndicators.length} threat(s)
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {client.connectionStatus !== 'blocked' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBlock(client.clientId, 'Manual block from dashboard');
                          }}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                        >
                          <Ban className="w-3 h-3 inline mr-1" />
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
          <Laptop className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No clients found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ClientsPanel;
