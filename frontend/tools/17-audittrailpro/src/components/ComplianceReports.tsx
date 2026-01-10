import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { DocumentTextIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:4017/api';

interface ComplianceReport {
  _id: string;
  reportId: string;
  framework: string;
  period: {
    start: string;
    end: string;
  };
  scores: {
    overall: number;
    categories: Record<string, number>;
    requirements: Record<string, number>;
  };
  violations: Array<{
    requirement: string;
    severity: string;
    description: string;
    evidence: any;
  }>;
  recommendations: string[];
  generatedAt: string;
}

const ComplianceReports: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery<ComplianceReport[]>({
    queryKey: ['compliance-reports', selectedFramework],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFramework) params.append('framework', selectedFramework);

      const response = await axios.get(`${API_BASE_URL}/compliance/reports?${params}`);
      return response.data.reports;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: { framework: string; startDate: string; endDate: string }) => {
      const response = await axios.post(`${API_BASE_URL}/compliance/reports/generate`, {
        framework: data.framework,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-reports'] });
      toast.success('Compliance report generated successfully');
      setShowGenerateForm(false);
      setSelectedFramework('');
      setStartDate('');
      setEndDate('');
    },
    onError: (error: any) => {
      toast.error(`Failed to generate report: ${error.response?.data?.error || error.message}`);
    },
  });

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFramework || !startDate || !endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    generateReportMutation.mutate({
      framework: selectedFramework,
      startDate,
      endDate,
    });
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const frameworks = ['GDPR', 'HIPAA', 'PCI-DSS', 'SOX', 'ISO-27001', 'NIST'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compliance Reports</h1>
            <p className="mt-2 text-gray-600">
              Automated compliance reporting across multiple frameworks
            </p>
          </div>
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Generate Report Form */}
      {showGenerateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Report</h3>
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="framework" className="block text-sm font-medium text-gray-700">
                  Framework
                </label>
                <select
                  id="framework"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  required
                >
                  <option value="">Select Framework</option>
                  {frameworks.map((framework) => (
                    <option key={framework} value={framework}>
                      {framework}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generateReportMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading compliance reports...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports && reports.length > 0 ? (
              reports.map((report) => (
                <div key={report._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {report.framework} Compliance Report
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Generated: {new Date(report.generatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(
                              report.scores.overall
                            )}`}
                          >
                            {report.scores.overall}% Compliant
                          </span>
                        </div>
                        {report.violations.length > 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            {report.violations.length} violation{report.violations.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Violations Summary */}
                  {report.violations.length > 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Key Violations</h4>
                      <div className="space-y-2">
                        {report.violations.slice(0, 3).map((violation, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm text-red-700">{violation.requirement}</p>
                              <p className="text-xs text-red-600">{violation.description}</p>
                            </div>
                          </div>
                        ))}
                        {report.violations.length > 3 && (
                          <p className="text-sm text-red-600">
                            ...and {report.violations.length - 3} more violations
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.recommendations.length > 0 && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {report.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No compliance reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Generate your first compliance report to get started.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceReports;