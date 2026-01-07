import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:4017/api';

interface ComplianceReport {
  _id: string;
  framework: string;
  period: {
    start: string;
    end: string;
  };
  scores: {
    overall: number;
    categories: Record<string, number>;
  };
  violations: Array<{
    requirement: string;
    severity: string;
  }>;
  generatedAt: string;
}

const ComplianceOverview: React.FC = () => {
  const { data: reports, isLoading } = useQuery<ComplianceReport[]>({
    queryKey: ['compliance-reports'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/compliance/reports?limit=5`);
      return response.data.reports;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFrameworkIcon = (framework: string) => {
    return ShieldCheckIcon; // Could be customized per framework
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Overview</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Overview</h3>
      <div className="space-y-4">
        {reports && reports.length > 0 ? (
          reports.map((report) => {
            const Icon = getFrameworkIcon(report.framework);
            const score = report.scores.overall;
            return (
              <div key={report._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.framework}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceColor(
                      score
                    )}`}
                  >
                    {score}%
                  </span>
                  {report.violations.length > 0 && (
                    <div className="flex items-center text-red-600">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      <span className="text-xs">{report.violations.length}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center py-8">No compliance reports available</p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Overall Compliance Score</span>
          <span className="font-medium text-gray-900">
            {reports && reports.length > 0
              ? Math.round(reports.reduce((acc, r) => acc + r.scores.overall, 0) / reports.length)
              : 0}%
          </span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{
              width: `${reports && reports.length > 0
                ? Math.round(reports.reduce((acc, r) => acc + r.scores.overall, 0) / reports.length)
                : 0}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceOverview;