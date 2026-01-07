import React, { useState } from 'react';
import {
  FileText, Download, Calendar, Clock, Filter, ChevronRight,
  BarChart2, PieChart, Shield, TrendingUp, Plus, RefreshCw
} from 'lucide-react';
import type { Report, ReportType, ReportFormat } from '../types';
import { REPORT_TYPES, formatTimestamp } from '../constants';

// Mock reports
const mockReports: Report[] = [
  {
    id: 'RPT-001',
    name: 'Executive Security Summary - Q4 2024',
    type: 'executive',
    format: 'pdf',
    description: 'High-level overview of security posture, major incidents, and KPIs for executive leadership',
    createdAt: new Date(Date.now() - 86400000),
    createdBy: 'Sarah Chen',
    dateRange: { start: new Date(Date.now() - 7776000000), end: new Date() },
    status: 'completed',
    downloadUrl: '#',
    size: '2.4 MB',
    tags: ['executive', 'quarterly'],
  },
  {
    id: 'RPT-002',
    name: 'SOC Operations Report - Week 52',
    type: 'operational',
    format: 'pdf',
    description: 'Weekly operational metrics including alert volumes, MTTR, and analyst performance',
    createdAt: new Date(Date.now() - 172800000),
    createdBy: 'System',
    dateRange: { start: new Date(Date.now() - 604800000), end: new Date() },
    status: 'completed',
    downloadUrl: '#',
    size: '1.8 MB',
    schedule: 'weekly',
    tags: ['weekly', 'operations'],
  },
  {
    id: 'RPT-003',
    name: 'PCI-DSS Compliance Report',
    type: 'compliance',
    format: 'pdf',
    description: 'Compliance status for PCI-DSS requirements with evidence and audit trail',
    createdAt: new Date(Date.now() - 604800000),
    createdBy: 'Mike Johnson',
    dateRange: { start: new Date(Date.now() - 2592000000), end: new Date() },
    status: 'completed',
    downloadUrl: '#',
    size: '4.1 MB',
    tags: ['compliance', 'pci-dss'],
  },
  {
    id: 'RPT-004',
    name: 'Incident Response Summary - INC-2024-001',
    type: 'incident',
    format: 'pdf',
    description: 'Post-incident report for the ransomware attack on Finance Department',
    createdAt: new Date(Date.now() - 259200000),
    createdBy: 'Sarah Chen',
    status: 'completed',
    downloadUrl: '#',
    size: '3.2 MB',
    tags: ['incident', 'ransomware'],
  },
  {
    id: 'RPT-005',
    name: 'Threat Intelligence Weekly Digest',
    type: 'threat_intel',
    format: 'pdf',
    description: 'Weekly threat landscape analysis with emerging threats and IOC updates',
    createdAt: new Date(Date.now() - 86400000),
    createdBy: 'System',
    dateRange: { start: new Date(Date.now() - 604800000), end: new Date() },
    status: 'completed',
    downloadUrl: '#',
    size: '1.2 MB',
    schedule: 'weekly',
    tags: ['threat-intel', 'weekly'],
  },
  {
    id: 'RPT-006',
    name: 'Monthly Security Metrics Export',
    type: 'operational',
    format: 'csv',
    description: 'Raw metrics data export for dashboard integration',
    createdAt: new Date(),
    createdBy: 'System',
    dateRange: { start: new Date(Date.now() - 2592000000), end: new Date() },
    status: 'generating',
    tags: ['metrics', 'export'],
  },
];

const ReportsPanel: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ReportType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'reports' | 'scheduled' | 'new'>('reports');

  const filteredReports = mockReports.filter(report =>
    selectedType === 'all' || report.type === selectedType
  );

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'executive': return <TrendingUp className="w-4 h-4 text-violet-400" />;
      case 'operational': return <BarChart2 className="w-4 h-4 text-blue-400" />;
      case 'compliance': return <Shield className="w-4 h-4 text-green-400" />;
      case 'incident': return <FileText className="w-4 h-4 text-red-400" />;
      case 'threat_intel': return <PieChart className="w-4 h-4 text-orange-400" />;
      case 'custom': return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const stats = {
    total: mockReports.length,
    thisWeek: mockReports.filter(r => r.createdAt > new Date(Date.now() - 604800000)).length,
    scheduled: mockReports.filter(r => r.schedule).length,
    generating: mockReports.filter(r => r.status === 'generating').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 text-sm mt-1">Generate and manage security reports</p>
        </div>
        <button 
          onClick={() => setActiveTab('new')}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Report</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: stats.total, icon: FileText, color: 'text-violet-400' },
          { label: 'This Week', value: stats.thisWeek, icon: Calendar, color: 'text-blue-400' },
          { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-green-400' },
          { label: 'Generating', value: stats.generating, icon: RefreshCw, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#334155]">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reports' 
              ? 'text-violet-400 border-violet-400' 
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          All Reports
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'scheduled' 
              ? 'text-violet-400 border-violet-400' 
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Scheduled Reports
        </button>
      </div>

      {activeTab === 'reports' && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ReportType | 'all')}
              className="bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Types</option>
              {REPORT_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Reports List */}
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#1E293B] rounded-xl border border-[#334155] p-4 hover:border-violet-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#0F172A] rounded-lg">
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{report.name}</h3>
                        <span className="bg-[#334155] text-gray-300 px-2 py-0.5 rounded text-xs uppercase">
                          {report.format}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{report.description}</p>
                    </div>
                  </div>
                  {report.status === 'completed' ? (
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 text-yellow-400 text-sm">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTimestamp(report.createdAt)}</span>
                  </div>
                  <span>•</span>
                  <span>By {report.createdBy}</span>
                  {report.size && (
                    <>
                      <span>•</span>
                      <span>{report.size}</span>
                    </>
                  )}
                  {report.schedule && (
                    <>
                      <span>•</span>
                      <span className="text-green-400 capitalize">{report.schedule}</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {report.tags.map((tag, i) => (
                    <span key={i} className="bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'scheduled' && (
        <div className="space-y-3">
          {mockReports.filter(r => r.schedule).map((report) => (
            <div
              key={report.id}
              className="bg-[#1E293B] rounded-xl border border-[#334155] p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(report.type)}
                  <div>
                    <h3 className="text-white font-medium">{report.name}</h3>
                    <p className="text-gray-400 text-sm">
                      Runs <span className="text-green-400 capitalize">{report.schedule}</span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'new' && (
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Create New Report</h2>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Report Name</label>
            <input
              type="text"
              placeholder="Enter report name..."
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Report Type</label>
            <select className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500">
              {REPORT_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Date Range</label>
            <div className="flex gap-4">
              <input
                type="date"
                className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
              />
              <input
                type="date"
                className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Output Format</label>
            <div className="flex gap-4">
              {['PDF', 'CSV', 'JSON'].map(format => (
                <button
                  key={format}
                  className="px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-white hover:border-violet-500 transition-colors"
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className="px-4 py-2 bg-[#334155] text-gray-300 rounded-lg hover:bg-[#475569] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPanel;
