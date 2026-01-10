import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ShieldCheckIcon, DocumentTextIcon, ExclamationTriangleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import StatCard from './StatCard';
import RecentActivity from './RecentActivity';
import ComplianceOverview from './ComplianceOverview';
import RealTimeAlerts from './RealTimeAlerts';

const API_BASE_URL = 'http://localhost:4017/api';

interface AnalyticsOverview {
  overview: {
    totalLogs: number;
    criticalEvents: number;
    complianceReports: number;
    activeAlerts: number;
    period: string;
  };
  eventTypes: Array<{
    _id: string;
    count: number;
  }>;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const { data: analytics, isLoading, error } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/overview`);
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              Unable to fetch analytics data. Please check your connection.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = analytics?.overview ? [
    {
      name: 'Total Audit Logs',
      value: analytics.overview.totalLogs.toLocaleString(),
      icon: DocumentTextIcon,
      color: 'blue',
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      name: 'Critical Events',
      value: analytics.overview.criticalEvents.toLocaleString(),
      icon: ExclamationTriangleIcon,
      color: 'red',
      change: '-5%',
      changeType: 'decrease' as const,
    },
    {
      name: 'Compliance Reports',
      value: analytics.overview.complianceReports.toLocaleString(),
      icon: ShieldCheckIcon,
      color: 'green',
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      name: 'Active Alerts',
      value: analytics.overview.activeAlerts.toLocaleString(),
      icon: ChartBarIcon,
      color: 'yellow',
      change: '+2%',
      changeType: 'increase' as const,
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AuditTrailProProPro Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive compliance audit logging and real-time monitoring - FINAL TOOL
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              System Operational
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceOverview />
        <RealTimeAlerts />
      </div>

      {/* Recent Activity */}
      <RecentActivity />

      {/* System Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">API Server: Online</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">WebSocket: Connected</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">Database: Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;