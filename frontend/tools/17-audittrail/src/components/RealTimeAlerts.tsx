import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ExclamationTriangleIcon, XCircleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:4017/api';

interface SecurityEvent {
  _id: string;
  type: string;
  severity: string;
  source: any;
  target: any;
  details: any;
  timestamp: string;
  resolved: boolean;
}

const RealTimeAlerts: React.FC = () => {
  const { data: events, isLoading } = useQuery<SecurityEvent[]>({
    queryKey: ['security-events'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/security/events?resolved=false&limit=10`);
      return response.data.events;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return XCircleIcon;
      case 'high':
        return ShieldExclamationIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
      <div className="space-y-4">
        {events && events.length > 0 ? (
          events.map((event) => {
            const Icon = getSeverityIcon(event.severity);
            return (
              <div key={event._id} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${getSeverityColor(event.severity)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.type}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(
                        event.severity
                      )}`}
                    >
                      {event.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {event.details?.description || 'Security event detected'}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                    <span>Source: {event.source?.ip || 'Unknown'}</span>
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
            <p className="mt-1 text-sm text-gray-500">
              All systems are operating normally.
            </p>
          </div>
        )}
      </div>

      {events && events.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Active Alerts</span>
            <span className="font-medium text-gray-900">{events.length}</span>
          </div>
          <div className="mt-2 flex space-x-1">
            {events.slice(0, 5).map((event, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  event.severity === 'critical'
                    ? 'bg-red-500'
                    : event.severity === 'high'
                    ? 'bg-orange-500'
                    : event.severity === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
              ></div>
            ))}
            {events.length > 5 && (
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeAlerts;