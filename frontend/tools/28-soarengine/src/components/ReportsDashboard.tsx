import React, { useState } from 'react';
import { 
  FileBarChart, Download, Calendar, Filter, 
  TrendingUp, TrendingDown, Clock, Briefcase, Zap, Target 
} from 'lucide-react';
import { MetricsData } from '../types';
import { CHART_COLORS } from '../constants';

interface ReportsDashboardProps {
  metricsHistory: MetricsData[];
  onExport: (type: string, format: string) => void;
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  metricsHistory,
  onExport,
}) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [reportType, setReportType] = useState<string>('executive');

  const totals = metricsHistory.reduce((acc, m) => ({
    cases_opened: acc.cases_opened + m.cases_opened,
    cases_closed: acc.cases_closed + m.cases_closed,
    playbooks_executed: acc.playbooks_executed + m.playbooks_executed,
    automations_run: acc.automations_run + m.automations_run,
    sla_breaches: acc.sla_breaches + m.sla_breaches,
  }), { cases_opened: 0, cases_closed: 0, playbooks_executed: 0, automations_run: 0, sla_breaches: 0 });

  const avgResponseTime = metricsHistory.length > 0
    ? Math.round(metricsHistory.reduce((acc, m) => acc + m.avg_response_time, 0) / metricsHistory.length)
    : 0;

  const closureRate = totals.cases_opened > 0
    ? Math.round((totals.cases_closed / totals.cases_opened) * 100)
    : 0;

  const reportTypes = [
    { id: 'executive', name: 'Executive Summary', description: 'High-level security posture overview' },
    { id: 'incident', name: 'Incident Report', description: 'Detailed incident analysis' },
    { id: 'compliance', name: 'Compliance Report', description: 'Regulatory compliance status' },
    { id: 'performance', name: 'SOC Performance', description: 'Team metrics and KPIs' },
    { id: 'threat', name: 'Threat Intelligence', description: 'Threat landscape analysis' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-purple-400" />
            Reports & Analytics
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Generate reports and track SOC performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            title="Select date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totals.cases_opened}</div>
          <div className="text-sm text-gray-400">Cases Opened</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{closureRate}%</div>
          <div className="text-sm text-gray-400">Closure Rate</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{avgResponseTime}m</div>
          <div className="text-sm text-gray-400">Avg Response</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totals.automations_run}</div>
          <div className="text-sm text-gray-400">Automations Run</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-red-400" />
            {totals.sla_breaches > 0 && <TrendingDown className="w-4 h-4 text-red-400" />}
          </div>
          <div className="text-2xl font-bold text-white">{totals.sla_breaches}</div>
          <div className="text-sm text-gray-400">SLA Breaches</div>
        </div>
      </div>

      {/* Report Generator */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <h4 className="text-white font-semibold mb-4">Generate Report</h4>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map(rt => (
              <button
                key={rt.id}
                onClick={() => setReportType(rt.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reportType === rt.id
                    ? 'bg-purple-500/20 border-purple-500'
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-sm font-medium text-white">{rt.name}</div>
                <div className="text-xs text-gray-400 mt-1">{rt.description}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onExport(reportType, 'pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={() => onExport(reportType, 'html')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Export HTML
            </button>
            <button
              onClick={() => onExport(reportType, 'json')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <h4 className="text-white font-semibold mb-4">Recent Reports</h4>
          <div className="space-y-2">
            {[
              { name: 'Weekly Executive Summary', date: '2026-01-05', format: 'PDF' },
              { name: 'December Compliance Report', date: '2026-01-01', format: 'PDF' },
              { name: 'Q4 SOC Performance', date: '2025-12-31', format: 'HTML' },
              { name: 'Incident Analysis - INC-2024', date: '2025-12-28', format: 'PDF' },
            ].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                <div>
                  <div className="text-sm text-white">{report.name}</div>
                  <div className="text-xs text-gray-500">{report.date}</div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-slate-700 text-gray-400 rounded">
                  {report.format}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Chart Placeholder */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h4 className="text-white font-semibold mb-4">Trend Analysis</h4>
        <div className="h-64 flex items-center justify-center border border-slate-700 rounded-lg bg-slate-900/50">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chart visualization placeholder</p>
            <p className="text-xs mt-1">Connect chart library for visualizations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
