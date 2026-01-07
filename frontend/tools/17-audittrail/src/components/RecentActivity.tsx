import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { DocumentTextIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:4017/api';

interface AuditLog {
  _id: string;
  eventId: string;
  timestamp: string;
  eventType: string;
  severity: string;
  source: {
    userId?: string;
    ip?: string;
  };
  action: {
    type: string;
    resource?: string;
  };
}

const RecentActivity: React.FC = () => {
  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['recent-logs'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/audit/logs?limit=10&sort=-timestamp`);
      return response.data.logs;
    },
    refetchInterval: 30000,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('security') || eventType.includes('alert')) {
      return ExclamationTriangleIcon;
    } else if (eventType.includes('compliance') || eventType.includes('audit')) {
      return ShieldCheckIcon;
    }
    return DocumentTextIcon;
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
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
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {logs && logs.length > 0 ? (
          logs.map((log) => {
            const Icon = getEventIcon(log.eventType);
            return (
              <div key={log._id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {log.eventType}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                        log.severity
                      )}`}
                    >
                      {log.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {log.action.type} {log.action.resource && `on ${log.action.resource}`}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                    <span>{log.source.userId || 'System'}</span>
                    <span>{log.source.ip || 'N/A'}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;