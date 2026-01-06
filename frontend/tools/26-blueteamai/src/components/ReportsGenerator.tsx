import React from 'react';
import { 
  FileText, Download, Calendar, Filter, 
  BarChart3, PieChart, TrendingUp, Clock 
} from 'lucide-react';

interface ReportsGeneratorProps {
  onGenerateReport: (type: string, options: ReportOptions) => void;
}

interface ReportOptions {
  format: 'pdf' | 'html' | 'markdown';
  dateRange: string;
  includeCharts: boolean;
  includeSummary: boolean;
  includeDetails: boolean;
}

const ReportsGenerator: React.FC<ReportsGeneratorProps> = ({ onGenerateReport }) => {
  const [selectedType, setSelectedType] = React.useState<string>('incident');
  const [options, setOptions] = React.useState<ReportOptions>({
    format: 'pdf',
    dateRange: 'last_7_days',
    includeCharts: true,
    includeSummary: true,
    includeDetails: true
  });

  const reportTypes = [
    { 
      id: 'incident', 
      name: 'Incident Report', 
      description: 'Detailed incident analysis and timeline',
      icon: FileText,
      color: 'bg-red-500/20 text-red-400'
    },
    { 
      id: 'threat_hunt', 
      name: 'Threat Hunt Report', 
      description: 'Hunt findings and recommendations',
      icon: TrendingUp,
      color: 'bg-purple-500/20 text-purple-400'
    },
    { 
      id: 'daily_summary', 
      name: 'Daily Summary', 
      description: 'Daily security operations overview',
      icon: BarChart3,
      color: 'bg-blue-500/20 text-blue-400'
    },
    { 
      id: 'executive', 
      name: 'Executive Report', 
      description: 'High-level metrics for leadership',
      icon: PieChart,
      color: 'bg-green-500/20 text-green-400'
    },
  ];

  const handleGenerate = () => {
    onGenerateReport(selectedType, options);
  };

  return (
    <div className="h-full bg-slate-900/50 rounded-xl border border-white/10 p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-400" />
        Generate Reports
      </h2>

      {/* Report Type Selection */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-3">Report Type</label>
        <div className="grid grid-cols-2 gap-3">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedType === type.id 
                  ? 'bg-blue-500/20 border-blue-500/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${type.color}`}>
                  <type.icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-white">{type.name}</span>
              </div>
              <p className="text-xs text-gray-400">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Date Range</label>
          <select
            value={options.dateRange}
            onChange={(e) => setOptions(p => ({ ...p, dateRange: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="last_24h">Last 24 Hours</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Output Format</label>
          <div className="flex gap-2">
            {['pdf', 'html', 'markdown'].map((format) => (
              <button
                key={format}
                onClick={() => setOptions(p => ({ ...p, format: format as any }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  options.format === format 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-400 mb-2">Include Sections</label>
          {[
            { key: 'includeSummary', label: 'Executive Summary' },
            { key: 'includeCharts', label: 'Charts & Visualizations' },
            { key: 'includeDetails', label: 'Detailed Findings' }
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options[item.key as keyof ReportOptions] as boolean}
                onChange={(e) => setOptions(p => ({ ...p, [item.key]: e.target.checked }))}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-white">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Generate Report
      </button>

      {/* Recent Reports */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-white mb-3">Recent Reports</h3>
        <div className="space-y-2">
          {[
            { name: 'Daily Summary - Jan 6, 2026', type: 'daily_summary', time: '2 hours ago' },
            { name: 'Incident #INC-2024-089', type: 'incident', time: 'Yesterday' },
            { name: 'Threat Hunt: Cobalt Strike', type: 'threat_hunt', time: '3 days ago' },
          ].map((report, idx) => (
            <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-sm text-white">{report.name}</span>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  {report.time}
                </div>
              </div>
              <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsGenerator;
