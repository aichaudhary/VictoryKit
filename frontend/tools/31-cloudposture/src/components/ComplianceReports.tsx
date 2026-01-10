import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, CheckCircle, AlertTriangle,
  Clock, Eye, Plus, Filter, Search, Shield, Building, Globe
} from 'lucide-react';

interface ComplianceReport {
  id: string;
  name: string;
  framework: string;
  type: string;
  status: string;
  complianceScore: number;
  generatedAt: Date;
  period: string;
  findings: number;
  recommendations: number;
}

const ComplianceReports: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);

  const reports: ComplianceReport[] = [
    {
      id: 'RPT-001',
      name: 'SOC 2 Type II Annual Assessment',
      framework: 'SOC 2',
      type: 'Annual',
      status: 'completed',
      complianceScore: 96,
      generatedAt: new Date('2025-12-15'),
      period: 'Jan 2025 - Dec 2025',
      findings: 3,
      recommendations: 8,
    },
    {
      id: 'RPT-002',
      name: 'ISO 27001 Certification Audit',
      framework: 'ISO 27001',
      type: 'Certification',
      status: 'completed',
      complianceScore: 94,
      generatedAt: new Date('2025-11-20'),
      period: 'Q4 2025',
      findings: 5,
      recommendations: 12,
    },
    {
      id: 'RPT-003',
      name: 'HIPAA Security Risk Assessment',
      framework: 'HIPAA',
      type: 'Quarterly',
      status: 'completed',
      complianceScore: 92,
      generatedAt: new Date('2025-12-01'),
      period: 'Q4 2025',
      findings: 7,
      recommendations: 15,
    },
    {
      id: 'RPT-004',
      name: 'GDPR Data Protection Impact Assessment',
      framework: 'GDPR',
      type: 'Annual',
      status: 'in_progress',
      complianceScore: 89,
      generatedAt: new Date('2025-12-20'),
      period: '2025',
      findings: 4,
      recommendations: 10,
    },
    {
      id: 'RPT-005',
      name: 'PCI DSS Quarterly Scan Report',
      framework: 'PCI DSS',
      type: 'Quarterly',
      status: 'completed',
      complianceScore: 98,
      generatedAt: new Date('2025-12-10'),
      period: 'Q4 2025',
      findings: 1,
      recommendations: 3,
    },
    {
      id: 'RPT-006',
      name: 'NIST CSF Gap Analysis',
      framework: 'NIST CSF',
      type: 'Annual',
      status: 'pending',
      complianceScore: 0,
      generatedAt: new Date('2025-12-25'),
      period: '2025',
      findings: 0,
      recommendations: 0,
    },
  ];

  const frameworks = ['all', 'SOC 2', 'ISO 27001', 'HIPAA', 'GDPR', 'PCI DSS', 'NIST CSF'];

  const getFrameworkIcon = (framework: string) => {
    switch(framework) {
      case 'SOC 2': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'ISO 27001': return <Globe className="w-5 h-5 text-teal-400" />;
      case 'HIPAA': return <Building className="w-5 h-5 text-red-400" />;
      case 'GDPR': return <FileText className="w-5 h-5 text-violet-400" />;
      default: return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredReports = reports.filter(r => 
    selectedFramework === 'all' || r.framework === selectedFramework
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance Reports</h1>
          <p className="text-gray-400 mt-1">Generate and manage compliance documentation</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {/* Framework Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {frameworks.slice(1).map(framework => {
          const frameworkReports = reports.filter(r => r.framework === framework);
          const avgScore = frameworkReports.length > 0 
            ? Math.round(frameworkReports.reduce((acc, r) => acc + r.complianceScore, 0) / frameworkReports.length)
            : 0;
          
          return (
            <button
              key={framework}
              onClick={() => setSelectedFramework(framework === selectedFramework ? 'all' : framework)}
              className={`p-4 rounded-xl border transition-all ${
                selectedFramework === framework 
                  ? 'bg-teal-500/20 border-teal-500' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                {getFrameworkIcon(framework)}
              </div>
              <p className="text-sm font-medium text-center">{framework}</p>
              <p className={`text-lg font-bold text-center ${
                avgScore >= 90 ? 'text-green-400' : avgScore >= 80 ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {avgScore > 0 ? `${avgScore}%` : '-'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold">Reports</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-700">
          {filteredReports.map(report => (
            <div 
              key={report.id}
              className="p-4 hover:bg-gray-700/30 transition-colors cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    report.status === 'completed' ? 'bg-green-500/20' :
                    report.status === 'in_progress' ? 'bg-blue-500/20' : 'bg-gray-500/20'
                  }`}>
                    {getFrameworkIcon(report.framework)}
                  </div>
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{report.framework}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">{report.type}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">{report.period}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {report.status === 'completed' && (
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        report.complianceScore >= 90 ? 'text-green-400' :
                        report.complianceScore >= 80 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {report.complianceScore}%
                      </p>
                      <p className="text-xs text-gray-400">Score</p>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    report.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {report.status === 'in_progress' ? 'In Progress' : 
                     report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-600 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    {report.status === 'completed' && (
                      <button className="p-2 hover:bg-gray-600 rounded-lg">
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {report.status === 'completed' && (
                <div className="flex items-center gap-6 mt-3 pl-16">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    {report.findings} findings
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle className="w-3 h-3 text-blue-400" />
                    {report.recommendations} recommendations
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    Generated {new Date(report.generatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Schedule Report</h3>
          <p className="text-sm text-gray-400 mb-4">Set up automated report generation on a schedule.</p>
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Configure Schedule
          </button>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Export All Reports</h3>
          <p className="text-sm text-gray-400 mb-4">Download all completed reports in a single archive.</p>
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Export Archive
          </button>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Compliance Dashboard</h3>
          <p className="text-sm text-gray-400 mb-4">View real-time compliance status across all frameworks.</p>
          <button className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Open Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReports;
