/**
 * Compliance Audit Panel Component
 * SOC2, HIPAA, GDPR compliance checking with findings and recommendations
 */

import React, { useState } from 'react';
import type { ComplianceReport, ComplianceCheck } from '../types/iam.types';
import { runComplianceCheck } from '../api/iam.api';

type Framework = 'SOC2' | 'HIPAA' | 'GDPR' | 'PCI-DSS' | 'ISO27001';

const ComplianceAuditPanel: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState<Framework>('SOC2');
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  const frameworks: { id: Framework; name: string; icon: string; description: string }[] = [
    { id: 'SOC2', name: 'SOC 2', icon: '🔐', description: 'Service Organization Control' },
    { id: 'HIPAA', name: 'HIPAA', icon: '🏥', description: 'Health Insurance Portability' },
    { id: 'GDPR', name: 'GDPR', icon: '🇪🇺', description: 'General Data Protection Regulation' },
    { id: 'PCI-DSS', name: 'PCI-DSS', icon: '💳', description: 'Payment Card Industry' },
    { id: 'ISO27001', name: 'ISO 27001', icon: '📋', description: 'Information Security Management' },
  ];

  const runAudit = async () => {
    setIsRunning(true);
    setReport(null);
    
    // Simulate audit running
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = runComplianceCheck(selectedFramework);
    setReport(result);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'compliant': return 'text-green-400 bg-green-500/20';
      case 'fail':
      case 'non_compliant': return 'text-red-400 bg-red-500/20';
      case 'warning':
      case 'partial': return 'text-yellow-400 bg-yellow-500/20';
      case 'not_applicable': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'compliant': return '✓';
      case 'fail':
      case 'non_compliant': return '✗';
      case 'warning':
      case 'partial': return '⚠';
      case 'not_applicable': return '—';
      default: return '?';
    }
  };

  const getSeverityColor = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-6 border border-orange-500/20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Compliance Audit Panel
        </h2>
        <p className="text-gray-400">
          Run compliance checks against major security frameworks and get actionable recommendations.
        </p>
      </div>

      {/* Framework Selection */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Select Compliance Framework</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {frameworks.map(fw => (
            <button
              key={fw.id}
              onClick={() => {
                setSelectedFramework(fw.id);
                setReport(null);
              }}
              className={`p-4 rounded-lg border transition-all text-center ${
                selectedFramework === fw.id
                  ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                  : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{fw.icon}</span>
              <p className="text-sm font-semibold text-white mt-2">{fw.name}</p>
              <p className="text-xs text-gray-500 mt-1">{fw.description}</p>
            </button>
          ))}
        </div>
        
        <button
          onClick={runAudit}
          disabled={isRunning}
          className="mt-6 w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50"
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Running {selectedFramework} Audit...
            </span>
          ) : (
            `🔍 Run ${selectedFramework} Compliance Audit`
          )}
        </button>
      </div>

      {/* Audit Results */}
      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20">
              <p className="text-3xl font-bold text-green-400">{report.passedChecks}</p>
              <p className="text-sm text-gray-400">Passed</p>
            </div>
            <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/20">
              <p className="text-3xl font-bold text-red-400">{report.failedChecks}</p>
              <p className="text-sm text-gray-400">Failed</p>
            </div>
            <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/20">
              <p className="text-3xl font-bold text-yellow-400">{report.warnings}</p>
              <p className="text-sm text-gray-400">Warnings</p>
            </div>
            <div className={`rounded-xl p-4 border ${
              report.overallScore >= 80 ? 'bg-green-900/20 border-green-500/20' :
              report.overallScore >= 60 ? 'bg-yellow-900/20 border-yellow-500/20' :
              'bg-red-900/20 border-red-500/20'
            }`}>
              <p className={`text-3xl font-bold ${
                report.overallScore >= 80 ? 'text-green-400' :
                report.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>{report.overallScore}%</p>
              <p className="text-sm text-gray-400">Overall Score</p>
            </div>
          </div>

          {/* Score Gauge */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Compliance Score</h3>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                report.overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
                report.overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {report.overallScore >= 80 ? 'Compliant' : 
                 report.overallScore >= 60 ? 'Partially Compliant' : 'Non-Compliant'}
              </span>
            </div>
            
            <div className="relative h-8 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${
                  report.overallScore >= 80 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                  report.overallScore >= 60 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                  'bg-gradient-to-r from-red-600 to-red-400'
                }`}
                style={{ width: `${report.overallScore}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{report.overallScore}%</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0%</span>
              <span>Non-Compliant</span>
              <span>60%</span>
              <span>Partial</span>
              <span>80%</span>
              <span>Compliant</span>
              <span>100%</span>
            </div>
          </div>

          {/* Detailed Checks */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance Checks</h3>
            <div className="space-y-3">
              {report.checks.map((check, idx) => {
                const checkKey = check.checkId || `check-${idx}`;
                return (
                <div 
                  key={checkKey}
                  className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCheck(expandedCheck === checkKey ? null : checkKey)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getStatusColor(check.status)}`}>
                        {getStatusIcon(check.status)}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium">{check.name}</p>
                        <p className="text-sm text-gray-400">{check.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(check.severity)}`}>
                        {check.severity.toUpperCase()}
                      </span>
                      <span className="text-gray-500">{expandedCheck === checkKey ? '▲' : '▼'}</span>
                    </div>
                  </button>
                  
                  {expandedCheck === checkKey && (
                    <div className="p-4 border-t border-gray-700 space-y-4">
                      <div>
                        <h5 className="text-sm font-semibold text-gray-400 mb-1">Description</h5>
                        <p className="text-gray-300">{check.description}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-semibold text-gray-400 mb-1">Finding</h5>
                        <p className={`${
                          check.status === 'pass' ? 'text-green-400' :
                          check.status === 'fail' ? 'text-red-400' : 'text-yellow-400'
                        }`}>{check.finding}</p>
                      </div>
                      
                      {check.recommendation && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-400 mb-1">Recommendation</h5>
                          <p className="text-cyan-400">{check.recommendation}</p>
                        </div>
                      )}
                      
                      {check.evidence && check.evidence.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-400 mb-2">Evidence</h5>
                          <div className="space-y-1">
                            {check.evidence.map((ev, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-gray-600">•</span>
                                {ev}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {check.affectedResources && check.affectedResources.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-400 mb-2">Affected Resources</h5>
                          <div className="flex flex-wrap gap-2">
                            {check.affectedResources.map((resource, i) => (
                              <span key={i} className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded font-mono">
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>

          {/* Recommendations Summary */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Top Recommendations</h3>
            <div className="space-y-3">
              {report.checks
                .filter(c => c.status === 'fail' || c.status === 'warning')
                .sort((a, b) => {
                  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                  return severityOrder[a.severity] - severityOrder[b.severity];
                })
                .slice(0, 5)
                .map((check, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-gray-900/50 rounded-lg border-l-4"
                    style={{ borderColor: check.severity === 'critical' ? '#ef4444' : check.severity === 'high' ? '#f97316' : check.severity === 'medium' ? '#eab308' : '#3b82f6' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{check.name}</p>
                        <p className="text-sm text-cyan-400 mt-1">{check.recommendation}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(check.severity)}`}>
                        {check.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Export Report</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                <span>📄</span> Export PDF
              </button>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                <span>📊</span> Export CSV
              </button>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                <span>📋</span> Copy JSON
              </button>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                <span>📧</span> Email Report
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Report generated: {new Date().toLocaleString()} | Framework: {selectedFramework}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ComplianceAuditPanel;
