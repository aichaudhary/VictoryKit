import React, { useState } from 'react';
import { Wifi, WifiOff, Clock, MapPin, Shield, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { VPNConnection, CONNECTION_STATUSES, VPN_PROVIDERS } from '../types';

interface VPNConnectionsListProps {
  connections: VPNConnection[];
  onConnectionClick?: (connection: VPNConnection) => void;
  onDisconnect?: (connectionId: string) => void;
  onConnect?: (connectionId: string) => void;
  isLoading?: boolean;
}

const VPNConnectionsList: React.FC<VPNConnectionsListProps> = ({
  connections,
  onConnectionClick,
  onDisconnect,
  onConnect,
  isLoading = false
}) => {
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  const getStatusInfo = (status: string) => {
    return CONNECTION_STATUSES.find(s => s.id === status) || CONNECTION_STATUSES[2];
  };

  const getProviderInfo = (provider: string) => {
    return VPN_PROVIDERS.find(p => p.id === provider) || VPN_PROVIDERS[VPN_PROVIDERS.length - 1];
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(startTime).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDataUsage = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">VPN Connections</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">VPN Connections</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{connections.filter(c => c.status === 'connected').length} Active</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>{connections.filter(c => c.status === 'disconnected').length} Inactive</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {connections.length === 0 ? (
          <div className="text-center py-12">
            <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No VPN Connections</h3>
            <p className="text-gray-500">Create your first VPN connection to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => {
              const statusInfo = getStatusInfo(connection.status);
              const providerInfo = getProviderInfo(connection.provider);

              return (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedConnection(connection.id);
                    onConnectionClick?.(connection);
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: providerInfo.color }}
                    >
                      {providerInfo.icon}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{connection.name}</h3>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color === '#10B981' ? 'bg-green-100 text-green-800' : statusInfo.color === '#6B7280' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.color === '#10B981' ? 'bg-green-500' : statusInfo.color === '#6B7280' ? 'bg-gray-500' : 'bg-yellow-500'}`}></div>
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{connection.location}</span>
                        </div>
                        {connection.status === 'connected' && connection.startTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(connection.startTime)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>{connection.protocol.toUpperCase()}</span>
                        </div>
                      </div>

                      {connection.status === 'connected' && connection.dataUsage && (
                        <div className="mt-1 text-xs text-gray-500">
                          Data used: {formatDataUsage(connection.dataUsage)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {connection.securityAlerts > 0 && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{connection.securityAlerts}</span>
                      </div>
                    )}

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle menu toggle
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VPNConnectionsList;