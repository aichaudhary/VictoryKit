import React from 'react';
import { Activity, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { DASHBOARD_METRICS } from '../constants';
import { VPNSummaryData } from '../types';

interface VPNSummaryProps {
  data: VPNSummaryData;
  isLoading?: boolean;
}

const VPNSummary: React.FC<VPNSummaryProps> = ({ data, isLoading = false }) => {
  const formatValue = (metric: typeof DASHBOARD_METRICS[0], value: number) => {
    switch (metric.format) {
      case 'data':
        return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getMetricValue = (metricId: string) => {
    switch (metricId) {
      case 'total-connections':
        return data.totalConnections;
      case 'active-connections':
        return data.activeConnections;
      case 'security-alerts':
        return data.securityAlerts;
      case 'bandwidth-usage':
        return data.bandwidthUsage;
      default:
        return 0;
    }
  };

  const getMetricColor = (metricId: string) => {
    const colors = {
      'total-connections': 'text-blue-600 bg-blue-50',
      'active-connections': 'text-green-600 bg-green-50',
      'security-alerts': 'text-red-600 bg-red-50',
      'bandwidth-usage': 'text-purple-600 bg-purple-50'
    };
    return colors[metricId as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const getMetricIcon = (metricId: string) => {
    const icons = {
      'total-connections': Activity,
      'active-connections': Shield,
      'security-alerts': AlertTriangle,
      'bandwidth-usage': TrendingUp
    };
    return icons[metricId as keyof typeof icons] || Activity;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {DASHBOARD_METRICS.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-4 h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {DASHBOARD_METRICS.map((metric) => {
        const IconComponent = getMetricIcon(metric.id);
        const value = getMetricValue(metric.id);
        const colorClass = getMetricColor(metric.id);

        return (
          <div key={metric.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className={`text-2xl font-bold mt-1 ${colorClass.split(' ')[0]}`}>
                  {formatValue(metric, value)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${colorClass.split(' ')[1]}`}>
                <IconComponent className={`h-6 w-6 ${colorClass.split(' ')[0]}`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12.5%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VPNSummary;