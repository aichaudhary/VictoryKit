import React, { useState } from 'react';
import { 
  Wifi, WifiOff, Search, RefreshCw, Plus,
  Shield, ShieldCheck, ShieldAlert, ShieldOff, 
  Users, Radio, ChevronRight,
  Unlock, AlertTriangle
} from 'lucide-react';
import { WirelessNetwork } from '../types';

interface NetworksPanelProps {
  networks: WirelessNetwork[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelect: (network: WirelessNetwork) => void;
  onAddNetwork: () => void;
}

const NetworksPanel: React.FC<NetworksPanelProps> = ({
  networks,
  isLoading,
  onRefresh,
  onSelect,
  onAddNetwork
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [securityFilter, setSecurityFilter] = useState<string>('all');

  const filteredNetworks = networks.filter(network => {
    const matchesSearch = 
      network.ssid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      network.bssid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      network.networkId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || network.networkType === typeFilter;
    const matchesSecurity = securityFilter === 'all' || network.security?.encryptionType === securityFilter;
    
    return matchesSearch && matchesType && matchesSecurity;
  });

  const getSecurityIcon = (protocol: string) => {
    switch (protocol) {
      case 'WPA3':
        return <ShieldCheck className="w-4 h-4 text-green-400" />;
      case 'WPA2-Enterprise':
        return <Shield className="w-4 h-4 text-green-400" />;
      case 'WPA2':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'WPA':
        return <ShieldAlert className="w-4 h-4 text-yellow-400" />;
      case 'WEP':
        return <ShieldOff className="w-4 h-4 text-red-400" />;
      case 'Open':
        return <Unlock className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSecurityColor = (protocol: string) => {
    const colors: Record<string, string> = {
      'WPA3': 'bg-green-500/20 text-green-400 border-green-500/50',
      'WPA2-Enterprise': 'bg-green-500/20 text-green-400 border-green-500/50',
      'WPA2': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'WPA': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'WEP': 'bg-red-500/20 text-red-400 border-red-500/50',
      'Open': 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    return colors[protocol] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-gray-500/20 text-gray-400',
      maintenance: 'bg-yellow-500/20 text-yellow-400',
      disabled: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || colors.inactive;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      corporate: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      guest: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
      iot: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
      byod: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
      secured: { bg: 'bg-green-500/20', text: 'text-green-400' }
    };
    return colors[type] || { bg: 'bg-gray-500/20', text: 'text-gray-400' };
  };

  const getThreatLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400'
    };
    return colors[level] || colors.low;
  };

  // Network stats
  const stats = {
    total: networks.length,
    active: networks.filter(n => n.status === 'active').length,
    secure: networks.filter(n => ['WPA3-Enterprise', 'WPA3-Personal', 'WPA2-Enterprise'].includes(n.security?.encryptionType || '')).length,
    atrisk: networks.filter(n => ['WEP', 'Open'].includes(n.security?.encryptionType || '') || n.threatAssessment?.threatLevel === 'high').length
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
            <Radio className="w-6 h-6 text-blue-400" />
            Wireless Networks
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredNetworks.length} networks • {stats.active} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddNetwork}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Network
          </button>
          <button
            onClick={onRefresh}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-xs">Total Networks</span>
          </div>
          <p className="text-white font-semibold text-lg">{stats.total}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-xs">Active</span>
          </div>
          <p className="text-white font-semibold text-lg">{stats.active}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-xs">Secure (WPA3/2-E)</span>
          </div>
          <p className="text-white font-semibold text-lg">{stats.secure}</p>
        </div>
        {stats.atrisk > 0 && (
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs">At Risk</span>
            </div>
            <p className="text-red-400 font-semibold text-lg">{stats.atrisk}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by SSID, BSSID, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Types</option>
          <option value="corporate">Corporate</option>
          <option value="guest">Guest</option>
          <option value="iot">IoT</option>
          <option value="byod">BYOD</option>
        </select>
        <select
          value={securityFilter}
          onChange={(e) => setSecurityFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Security</option>
          <option value="WPA3">WPA3</option>
          <option value="WPA2-Enterprise">WPA2-Enterprise</option>
          <option value="WPA2">WPA2</option>
          <option value="WPA">WPA</option>
          <option value="WEP">WEP (Insecure)</option>
          <option value="Open">Open (No Security)</option>
        </select>
      </div>

      {/* Networks Grid */}
      {filteredNetworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNetworks.map((network) => {
            const typeStyle = getTypeBadge(network.networkType);
            
            return (
              <div
                key={network.networkId}
                onClick={() => onSelect(network)}
                className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 cursor-pointer transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      network.status === 'active' ? 'bg-green-500/20' : 'bg-gray-700'
                    }`}>
                      {network.status === 'active' ? (
                        <Wifi className="w-5 h-5 text-green-400" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{network.ssid}</h3>
                      <p className="text-gray-500 text-xs">{network.bssid}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${typeStyle.bg} ${typeStyle.text}`}>
                    {network.networkType}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded border ${getSecurityColor(network.security?.encryptionType || 'Unknown')}`}>
                    {getSecurityIcon(network.security?.encryptionType || 'Unknown')}
                    <span className="ml-1">{network.security?.encryptionType || 'Unknown'}</span>
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(network.status)}`}>
                    {network.status}
                  </span>
                </div>

                {/* Network Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      Band
                    </span>
                    <span className="text-white">{network.frequency?.band} CH{network.frequency?.channel}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Status
                    </span>
                    <span className="text-white capitalize">{network.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      Signal
                    </span>
                    <span className="text-white">{network.signalMetrics?.rssi || 'N/A'} dBm</span>
                  </div>
                </div>

                {/* Threat Assessment */}
                {network.threatAssessment && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">Threat Level</span>
                      <span className={`text-xs font-medium capitalize ${getThreatLevelColor(network.threatAssessment.threatLevel)}`}>
                        {network.threatAssessment.threatLevel}
                      </span>
                    </div>
                    {network.threatAssessment.riskScore !== undefined && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              network.threatAssessment.riskScore > 70 ? 'bg-red-500' :
                              network.threatAssessment.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${network.threatAssessment.riskScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
          <Radio className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No networks found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default NetworksPanel;
