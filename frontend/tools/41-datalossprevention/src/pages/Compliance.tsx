/**
 * Compliance Page
 * Monitor compliance status across frameworks
 */

import React, { useState, useEffect } from 'react';
import { Shield, FileCheck, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { getComplianceStatus, generateComplianceReport, getComplianceByFramework } from '../services/api';

const Compliance: React.FC = () => {
  const [complianceData, setComplianceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<string>('GDPR');

  useEffect(() => {
    loadCompliance();
  }, []);

  const loadCompliance = async () => {
    try {
      const response = await getComplianceStatus();
      setComplianceData(response.data);
    } catch (error) {
      console.error('Failed to load compliance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (framework: string) => {
    try {
      await generateComplianceReport({
        framework,
        reportType: 'audit',
        reportingPeriod: {
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
      });
      alert(`Compliance report for ${framework} generated successfully`);
      loadCompliance();
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (score >= 70) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (score >= 50) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const frameworks = [
    { name: 'GDPR', color: 'blue' },
    { name: 'HIPAA', color: 'green' },
    { name: 'PCI-DSS', color: 'purple' },
    { name: 'SOC2', color: 'orange' },
    { name: 'ISO27001', color: 'pink' },
    { name: 'CCPA', color: 'indigo' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dlp-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dlp-darker via-dlp-dark to-dlp-darker p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Compliance Management</h1>
        <p className="text-gray-400">Monitor regulatory compliance across frameworks</p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-dlp-primary to-dlp-accent rounded-2xl p-8 mb-8 border border-dlp-primary/30 shadow-glow-blue">
        <div className="text-center">
          <p className="text-white/80 text-lg mb-2">Overall Compliance Score</p>
          <p className="text-6xl font-bold text-white mb-4">
            {complianceData?.overallScore || 0}%
          </p>
          <p className="text-white/60">
            {complianceData?.frameworks?.length || 0} frameworks monitored
          </p>
        </div>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {frameworks.map((framework) => {
          const data = complianceData?.frameworks?.find((f: any) => f.framework === framework.name);
          const score = data?.complianceScore || 0;
          
          return (
            <div
              key={framework.name}
              className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-dlp-primary/30 transition-all cursor-pointer"
              onClick={() => setSelectedFramework(framework.name)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${framework.color}-500/20 rounded-lg`}>
                  <Shield className={`w-6 h-6 text-${framework.color}-400`} />
                </div>
                <span className={`text-3xl font-bold px-4 py-2 rounded-lg border ${getComplianceColor(score)}`}>
                  {score}%
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{framework.name}</h3>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Status</span>
                  <span className={`font-medium ${
                    data?.status === 'compliant' ? 'text-green-400' :
                    data?.status === 'partial_compliance' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {data?.status?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Gaps</span>
                  <span className="text-orange-400 font-medium">{data?.gaps?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Last Assessed</span>
                  <span className="text-white">
                    {data?.lastAssessed ? new Date(data.lastAssessed).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateReport(framework.name);
                }}
                className="w-full px-4 py-2 bg-dlp-primary/20 text-dlp-primary rounded-lg hover:bg-dlp-primary/30 transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Requirements Breakdown */}
      <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">{selectedFramework} Requirements</h2>

        <div className="space-y-3">
          {complianceData?.frameworks?.find((f: any) => f.framework === selectedFramework)?.requirements?.map((req: any, index: number) => (
            <div
              key={index}
              className="bg-dlp-darker/50 rounded-lg p-4 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-white">{req.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      req.status === 'compliant' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                      req.status === 'partial' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' :
                      'text-red-400 bg-red-500/10 border-red-500/30'
                    }`}>
                      {req.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      req.priority === 'critical' ? 'text-red-400 bg-red-500/10' :
                      req.priority === 'high' ? 'text-orange-400 bg-orange-500/10' :
                      'text-gray-400 bg-gray-500/10'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{req.description}</p>

                  {req.controls && req.controls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {req.controls.map((control: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-dlp-primary/10 text-dlp-primary text-xs rounded"
                        >
                          {control}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {req.status === 'compliant' ? (
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                )}
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-400">
              <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No requirements data available for {selectedFramework}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compliance;
