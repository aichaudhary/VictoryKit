import React, { useState } from 'react';
import { BarChart3, Download, Calendar, FileText, TrendingUp, Clock, Shield, AlertTriangle } from 'lucide-react';

interface ReportConfig {
  type: string;
  dateRange: string;
  format: string;
  filters: Record<string, boolean>;
}

const ReportsPanel: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'summary',
    dateRange: '7d',
    format: 'pdf',
    filters: {
      incidents: true,
      policies: true,
      scans: true,
      compliance: true,
    },
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    // Download would happen here
  };

  const reportTypes = [
    { id: 'summary', name: 'Executive Summary', description: 'High-level overview of DLP status', icon: FileText },
    { id: 'incidents', name: 'Incident Report', description: 'Detailed incident analysis', icon: AlertTriangle },
    { id: 'compliance', name: 'Compliance Report', description: 'Regulatory compliance status', icon: Shield },
    { id: 'trends', name: 'Trend Analysis', description: 'Historical data trends', icon: TrendingUp },
  ];

  const savedReports = [
    { name: 'Q4 2024 Executive Summary', date: '2024-01-15', type: 'Executive Summary', size: '2.4 MB' },
    { name: 'December Incident Report', date: '2024-01-01', type: 'Incident Report', size: '1.8 MB' },
    { name: 'HIPAA Compliance Audit', date: '2023-12-15', type: 'Compliance Report', size: '3.1 MB' },
    { name: 'November Trend Analysis', date: '2023-12-01', type: 'Trend Analysis', size: '4.2 MB' },
  ];

  return (
    <div className="space-y-6">
      {/* Report Generator */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Generate Report
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm text-slate-400 mb-3">Report Type</label>
            <div className="grid grid-cols-2 gap-3">
              {reportTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setReportConfig({ ...reportConfig, type: type.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      reportConfig.type === type.id
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${
                      reportConfig.type === type.id ? 'text-purple-400' : 'text-slate-400'
                    }`} />
                    <p className="font-medium text-sm">{type.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Date Range</label>
              <div className="flex gap-2">
                {['24h', '7d', '30d', '90d', 'custom'].map(range => (
                  <button
                    key={range}
                    onClick={() => setReportConfig({ ...reportConfig, dateRange: range })}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      reportConfig.dateRange === range
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {range === '24h' ? 'Last 24h' :
                     range === '7d' ? '7 Days' :
                     range === '30d' ? '30 Days' :
                     range === '90d' ? '90 Days' : 'Custom'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Export Format</label>
              <div className="flex gap-2">
                {['pdf', 'csv', 'xlsx', 'json'].map(format => (
                  <button
                    key={format}
                    onClick={() => setReportConfig({ ...reportConfig, format })}
                    className={`px-4 py-2 rounded-lg text-sm uppercase transition-all ${
                      reportConfig.format === format
                        ? 'bg-pink-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Include Sections</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(reportConfig.filters).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setReportConfig({
                      ...reportConfig,
                      filters: { ...reportConfig.filters, [key]: !value }
                    })}
                    className={`px-3 py-1.5 rounded text-sm capitalize transition-all ${
                      value
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={isGenerating}
          className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Generate & Download Report
            </>
          )}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-slate-400">Reports Generated</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-xs text-slate-400">Compliance Score</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">23</p>
              <p className="text-xs text-slate-400">Pending Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">Weekly</p>
              <p className="text-xs text-slate-400">Auto-Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Reports */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-400" />
          Saved Reports
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Report Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Size</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {savedReports.map((report, i) => (
                <tr key={i} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <span className="font-medium">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{report.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{report.date}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{report.size}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 text-sm flex items-center gap-1 ml-auto">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Scheduled Reports
          </h3>
          <button className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm">
            + Add Schedule
          </button>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Weekly Executive Summary', schedule: 'Every Monday 9:00 AM', recipients: 3, enabled: true },
            { name: 'Monthly Compliance Report', schedule: '1st of month 8:00 AM', recipients: 5, enabled: true },
            { name: 'Daily Incident Digest', schedule: 'Daily 6:00 PM', recipients: 2, enabled: false },
          ].map((schedule, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                schedule.enabled ? 'bg-slate-800/50 border-purple-500/30' : 'bg-slate-900/30 border-slate-700/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${schedule.enabled ? 'bg-purple-500/20' : 'bg-slate-700'}`}>
                  <Calendar className={`w-5 h-5 ${schedule.enabled ? 'text-purple-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <p className="font-medium">{schedule.name}</p>
                  <p className="text-sm text-slate-400">{schedule.schedule}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">{schedule.recipients} recipients</span>
                <button className={`w-10 h-6 rounded-full p-1 transition-colors ${
                  schedule.enabled ? 'bg-purple-500' : 'bg-slate-700'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    schedule.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPanel;
