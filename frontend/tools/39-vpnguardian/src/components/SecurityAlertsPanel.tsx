import React, { useState } from 'react';
import { AlertTriangle, Shield, Clock, MapPin, User, X, Eye } from 'lucide-react';
import { VPNSecurityAlert, THREAT_LEVELS } from '../types';

interface SecurityAlertsPanelProps {
  alerts: VPNSecurityAlert[];
  onAlertClick?: (alert: VPNSecurityAlert) => void;
  onDismissAlert?: (alertId: string) => void;
  onViewDetails?: (alert: VPNSecurityAlert) => void;
  isLoading?: boolean;
}

const SecurityAlertsPanel: React.FC<SecurityAlertsPanelProps> = ({
  alerts,
  onAlertClick,
  onDismissAlert,
  onViewDetails,
  isLoading = false
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const getThreatLevelInfo = (severity: string) => {
    return THREAT_LEVELS.find(level => level.id === severity) || THREAT_LEVELS[0];
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  });

  const getAlertTypeIcon = (type: string) => {
    const icons = {
      'unauthorized-access': Shield,
      'suspicious-traffic': AlertTriangle,
      'weak-encryption': Shield,
      'certificate-expiry': Clock,
      'protocol-anomaly': AlertTriangle,
      'geographic-anomaly': MapPin,
      'brute-force': AlertTriangle,
      'malware-detected': Shield,
      'data-leak': AlertTriangle,
      'policy-violation': Shield,
      'session-anomaly': User,
      'bandwidth-abuse': AlertTriangle
    };
    return icons[type as keyof typeof icons] || AlertTriangle;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Security Alerts</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
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
          <h2 className="text-lg font-semibold text-gray-900">Security Alerts</h2>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Security Alerts</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'Your VPN connections are secure. No alerts detected.'
                : `No ${filter} severity alerts found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const threatLevel = getThreatLevelInfo(alert.severity);
              const IconComponent = getAlertTypeIcon(alert.type);

              return (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg hover:shadow-sm cursor-pointer transition-all ${alert.acknowledged ? 'bg-gray-50' : 'bg-white border-l-4'}`}
                  style={{ borderLeftColor: alert.acknowledged ? 'transparent' : threatLevel.color }}
                  onClick={() => onAlertClick?.(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: threatLevel.bgColor }}
                      >
                        <IconComponent
                          className="h-4 w-4"
                          style={{ color: threatLevel.color }}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{alert.title}</h3>
                          <span
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: threatLevel.bgColor,
                              color: threatLevel.color
                            }}
                          >
                            {threatLevel.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(alert.timestamp)}</span>
                          </div>
                          {alert.connectionId && (
                            <div className="flex items-center space-x-1">
                              <Shield className="h-3 w-3" />
                              <span>Connection: {alert.connectionId}</span>
                            </div>
                          )}
                          {alert.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{alert.location}</span>
                            </div>
                          )}
                          {alert.userId && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>User: {alert.userId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.(alert);
                          }}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissAlert?.(alert.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                        title="Dismiss Alert"
                      >
                        <X className="h-4 w-4" />
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

export default SecurityAlertsPanel;