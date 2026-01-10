import { useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Filter,
  Eye,
  Trash2,
  Share2,
  FileBarChart,
  FileCheck,
  Users,
  Shield,
  TrendingUp,
} from 'lucide-react';
import type { Report, ReportType } from '../types';
import { REPORT_TYPES } from '../constants';

// Mock data
const mockReports: Report[] = [
  {
    id: 'r1',
    organization_id: 'org-1',
    type: 'executive_summary',
    title: 'Q1 2024 Executive Security Summary',
    generated_at: '2024-03-15T10:30:00Z',
    generated_by: 'John Smith',
    format: 'pdf',
    sections: [
      { id: 's1', title: 'Executive Overview', order: 1, included: true },
      { id: 's2', title: 'Risk Score Trend', order: 2, included: true },
      { id: 's3', title: 'Key Findings', order: 3, included: true },
      { id: 's4', title: 'Recommendations', order: 4, included: true },
    ],
    download_url: '#',
  },
  {
    id: 'r2',
    organization_id: 'org-1',
    type: 'detailed_risk',
    title: 'March 2024 Detailed Risk Analysis',
    generated_at: '2024-03-14T15:45:00Z',
    generated_by: 'Security Team',
    format: 'pdf',
    sections: [],
    download_url: '#',
  },
  {
    id: 'r3',
    organization_id: 'org-1',
    type: 'vendor_assessment',
    title: 'Critical Vendor Assessment Report',
    generated_at: '2024-03-12T09:00:00Z',
    generated_by: 'Jane Doe',
    format: 'pdf',
    sections: [],
    download_url: '#',
  },
  {
    id: 'r4',
    organization_id: 'org-1',
    type: 'compliance',
    title: 'SOC 2 Compliance Gap Analysis',
    generated_at: '2024-03-10T14:20:00Z',
    generated_by: 'Compliance Team',
    format: 'pdf',
    sections: [],
    download_url: '#',
  },
  {
    id: 'r5',
    organization_id: 'org-1',
    type: 'trend_analysis',
    title: '12-Month Risk Trend Analysis',
    generated_at: '2024-03-01T11:00:00Z',
    generated_by: 'Security Team',
    format: 'html',
    sections: [],
    download_url: '#',
  },
];

const reportTypeIcons: Record<ReportType, typeof FileText> = {
  executive_summary: FileBarChart,
  detailed_risk: Shield,
  vendor_assessment: Users,
  compliance: FileCheck,
  trend_analysis: TrendingUp,
};

export function ReportsPanel() {
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const filteredReports = mockReports.filter(
    (report) => typeFilter === 'all' || report.type === typeFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-amber-500" />
            Reports
          </h1>
          <p className="text-gray-400 mt-1">Generate and manage security reports</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Generate Report
        </button>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-5 gap-4">
        {REPORT_TYPES.map((type) => {
          const Icon = reportTypeIcons[type.id as ReportType] || FileText;
          const count = mockReports.filter((r) => r.type === type.id).length;

          return (
            <button
              key={type.id}
              onClick={() => setTypeFilter(typeFilter === type.id ? 'all' : type.id as ReportType)}
              className={`bg-[#1A1A1F] rounded-xl border p-4 text-left transition-colors ${
                typeFilter === type.id
                  ? 'border-amber-500'
                  : 'border-[#2A2A2F] hover:border-amber-500/30'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${typeFilter === type.id ? 'text-amber-500' : 'text-gray-400'}`} />
              <p className="text-white text-sm font-medium">{type.name}</p>
              <p className="text-gray-500 text-xs mt-1">{count} reports</p>
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2F] flex items-center justify-between">
          <h3 className="text-white font-medium">
            {typeFilter === 'all' ? 'All Reports' : REPORT_TYPES.find((t) => t.id === typeFilter)?.name}
          </h3>
          <span className="text-gray-500 text-sm">{filteredReports.length} reports</span>
        </div>

        <div className="divide-y divide-[#2A2A2F]">
          {filteredReports.map((report) => {
            const Icon = reportTypeIcons[report.type] || FileText;

            return (
              <div
                key={report.id}
                className="p-4 flex items-center gap-4 hover:bg-[#252529] transition-colors"
              >
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-amber-500" />
                </div>

                <div className="flex-1">
                  <h4 className="text-white font-medium">{report.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(report.generated_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(report.generated_at).toLocaleTimeString()}
                    </span>
                    <span>by {report.generated_by}</span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-[#252529] rounded-full text-gray-400 text-xs uppercase">
                  {report.format}
                </span>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[#2A2A2F] rounded-lg transition-colors" title="View">
                    <Eye className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-[#2A2A2F] rounded-lg transition-colors" title="Download">
                    <Download className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-[#2A2A2F] rounded-lg transition-colors" title="Share">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-[#2A2A2F] rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No reports found</p>
          <p className="text-gray-500 text-sm">Generate your first report to get started</p>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <GenerateReportModal onClose={() => setShowGenerateModal(false)} />
      )}
    </div>
  );
}

function GenerateReportModal({ onClose }: { onClose: () => void }) {
  const [reportType, setReportType] = useState<ReportType>('executive_summary');
  const [format, setFormat] = useState('pdf');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Generate Report</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              {REPORT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-sm mt-1">
              {REPORT_TYPES.find((t) => t.id === reportType)?.description}
            </p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Format</label>
            <div className="flex gap-3">
              {['pdf', 'html', 'json'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    format === f
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                      : 'border-[#2A2A2F] text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Date Range</label>
            <div className="flex gap-3">
              <input
                type="date"
                className="flex-1 bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="date"
                className="flex-1 bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#2A2A2F] rounded-lg text-gray-300 hover:bg-[#252529] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-black font-medium transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
