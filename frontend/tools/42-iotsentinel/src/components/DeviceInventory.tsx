import React, { useState, useEffect } from 'react';
import { Device, DeviceStatus, DeviceType } from '../types';
import { iotSentinelAPI } from '../services/iotSentinelAPI';
import { DEVICE_TYPE_ICONS, RISK_COLORS, STATUS_COLORS } from '../constants';

interface DeviceInventoryProps {
  onDeviceSelect?: (device: Device) => void;
  onScanRequest?: () => void;
}

export const DeviceInventory: React.FC<DeviceInventoryProps> = ({ 
  onDeviceSelect, 
  onScanRequest 
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '' as DeviceStatus | '',
    type: '' as DeviceType | '',
    riskLevel: '' as 'low' | 'medium' | 'high' | 'critical' | ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDevices();
  }, [filter]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (filter.status) params.status = filter.status;
      if (filter.type) params.type = filter.type;
      if (filter.riskLevel) params.riskLevel = filter.riskLevel;
      
      const response = await iotSentinelAPI.devices.getAll(params);
      setDevices(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuarantine = async (deviceId: string, reason: string) => {
    try {
      await iotSentinelAPI.devices.quarantine(deviceId, reason);
      fetchDevices();
    } catch (err) {
      console.error('Failed to quarantine device:', err);
    }
  };

  const handleScan = async (deviceId: string) => {
    try {
      await iotSentinelAPI.devices.scan(deviceId);
    } catch (err) {
      console.error('Failed to scan device:', err);
    }
  };

  const filteredDevices = devices.filter(device => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      device.name.toLowerCase().includes(query) ||
      device.ip?.toLowerCase().includes(query) ||
      device.mac?.toLowerCase().includes(query) ||
      device.manufacturer?.toLowerCase().includes(query)
    );
  });

  const getRiskBadgeClass = (level: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[level] || colors.low;
  };

  const getStatusBadgeClass = (status: string) => {
    const colors: Record<string, string> = {
      online: 'bg-green-500/20 text-green-400',
      offline: 'bg-gray-500/20 text-gray-400',
      degraded: 'bg-yellow-500/20 text-yellow-400',
      quarantined: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || colors.offline;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">📡</span>
            Device Inventory
            <span className="text-sm font-normal text-slate-400">
              ({filteredDevices.length} devices)
            </span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => fetchDevices()}
              className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={onScanRequest}
              className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
            >
              🔍 Discover Devices
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as DeviceStatus | '' })}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="degraded">Degraded</option>
            <option value="quarantined">Quarantined</option>
          </select>
          <select
            value={filter.riskLevel}
            onChange={(e) => setFilter({ ...filter, riskLevel: e.target.value as any })}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Device Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
        {filteredDevices.map((device) => (
          <div
            key={device._id}
            onClick={() => onDeviceSelect?.(device)}
            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-cyan-500/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{DEVICE_TYPE_ICONS[device.type] || '📡'}</span>
                <div>
                  <h3 className="font-medium text-white truncate max-w-[150px]">{device.name}</h3>
                  <p className="text-xs text-slate-400">{device.manufacturer || 'Unknown'}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(device.status)}`}>
                {device.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">IP:</span>
                <span className="text-white font-mono">{device.ip || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MAC:</span>
                <span className="text-white font-mono text-xs">{device.mac || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-white capitalize">{device.type.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-600/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded border ${getRiskBadgeClass(device.riskScore?.level || 'low')}`}>
                  Risk: {device.riskScore?.level || 'N/A'}
                </span>
                {device.vulnerabilities?.total > 0 && (
                  <span className="text-xs text-orange-400">
                    ⚠️ {device.vulnerabilities.total} vulns
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleScan(device._id); }}
                  className="p-1 hover:bg-slate-600 rounded transition-colors"
                  title="Scan Device"
                >
                  🔍
                </button>
                {device.status !== 'quarantined' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuarantine(device._id, 'Manual quarantine'); }}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    title="Quarantine Device"
                  >
                    🔒
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredDevices.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <span className="text-4xl mb-4 block">📡</span>
            <p className="text-slate-400">No devices found</p>
            <button
              onClick={onScanRequest}
              className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
            >
              Discover Devices
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceInventory;
