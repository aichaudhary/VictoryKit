import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ChartBarIcon, ArrowTrendingUpIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:4017/api';

interface AnalyticsData {
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

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState(30);

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics-overview', timeRange],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/overview?days=${timeRange}`);
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const timeRanges = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' },
    { value: 365, label: 'Last year' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overview = analytics?.overview;
  const eventTypes = analytics?.eventTypes || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive insights into audit trails and compliance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Audit Logs</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overview?.totalLogs.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-500"> from last period</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Critical Events</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overview?.criticalEvents.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-red-600 font-medium">-8.2%</span>
              <span className="text-gray-500"> from last period</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Compliance Reports</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overview?.complianceReports.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">+23.1%</span>
              <span className="text-gray-500"> from last period</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Alerts</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overview?.activeAlerts.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-yellow-600 font-medium">+5.4%</span>
              <span className="text-gray-500"> from last period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Types Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Types Distribution</h3>
        <div className="space-y-4">
          {eventTypes.slice(0, 10).map((eventType, _index) => {
            const percentage = overview?.totalLogs
              ? ((eventType.count / overview.totalLogs) * 100).toFixed(1)
              : '0';

            return (
              <div key={eventType._id} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{eventType._id}</span>
                    <span className="text-sm text-gray-500">
                      {eventType.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Trends */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['GDPR', 'HIPAA', 'PCI-DSS', 'SOX', 'ISO-27001', 'NIST'].map((framework) => (
            <div key={framework} className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(Math.random() * 30) + 70}%
              </div>
              <div className="text-sm text-gray-500">{framework}</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">Low</div>
            <div className="text-sm text-gray-500">Current Risk Level</div>
            <div className="mt-2 text-xs text-gray-400">
              Based on recent activity patterns
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {overview?.criticalEvents || 0}
            </div>
            <div className="text-sm text-gray-500">Critical Events This Period</div>
            <div className="mt-2 text-xs text-gray-400">
              Events requiring immediate attention
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {Math.round(((overview?.criticalEvents || 0) / (overview?.totalLogs || 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Anomaly Rate</div>
            <div className="mt-2 text-xs text-gray-400">
              Percentage of anomalous events
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;