import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileCheck,
  ClipboardList,
  Eye,
  Play,
  FileText,
  BarChart3,
} from 'lucide-react';

interface DashboardStats {
  overallScore: number;
  totalControls: number;
  compliantControls: number;
  activeFrameworks: number;
}

interface RecentAssessment {
  id: string;
  framework: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  score: number;
  gaps: number;
  lastUpdated: string;
}

interface FrameworkStatus {
  name: string;
  shortName: string;
  score: number;
  controls: { passed: number; failed: number; na: number };
  trend: 'up' | 'down' | 'stable';
  color: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    overallScore: 87,
    totalControls: 456,
    compliantControls: 398,
    activeFrameworks: 6,
  });

  const [recentAssessments, setRecentAssessments] = useState<RecentAssessment[]>([
    { id: '1', framework: 'SOC 2 Type II', status: 'completed', score: 94, gaps: 3, lastUpdated: '2 days ago' },
    { id: '2', framework: 'ISO 27001', status: 'in-progress', score: 78, gaps: 12, lastUpdated: '1 hour ago' },
    { id: '3', framework: 'GDPR', status: 'completed', score: 91, gaps: 5, lastUpdated: '1 week ago' },
    { id: '4', framework: 'HIPAA', status: 'scheduled', score: 0, gaps: 0, lastUpdated: 'Scheduled Jan 15' },
    { id: '5', framework: 'PCI DSS', status: 'completed', score: 88, gaps: 8, lastUpdated: '3 days ago' },
  ]);

  const frameworkStatus: FrameworkStatus[] = [
    { name: 'SOC 2 Type II', shortName: 'SOC2', score: 94, controls: { passed: 87, failed: 3, na: 5 }, trend: 'up', color: 'text-green-400' },
    { name: 'ISO 27001', shortName: 'ISO', score: 78, controls: { passed: 98, failed: 15, na: 12 }, trend: 'up', color: 'text-blue-400' },
    { name: 'GDPR', shortName: 'GDPR', score: 91, controls: { passed: 45, failed: 5, na: 2 }, trend: 'stable', color: 'text-purple-400' },
    { name: 'HIPAA', shortName: 'HIPAA', score: 85, controls: { passed: 72, failed: 10, na: 8 }, trend: 'down', color: 'text-pink-400' },
    { name: 'PCI DSS', shortName: 'PCI', score: 88, controls: { passed: 95, failed: 12, na: 3 }, trend: 'up', color: 'text-cyan-400' },
    { name: 'NIST CSF', shortName: 'NIST', score: 82, controls: { passed: 78, failed: 14, na: 6 }, trend: 'stable', color: 'text-orange-400' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-400" />;
      case 'in-progress': return <Clock size={16} className="text-primary-400 animate-pulse" />;
      case 'scheduled': return <Clock size={16} className="text-gray-400" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-green-400" />;
      case 'down': return <TrendingDown size={14} className="text-red-400" />;
      default: return <span className="text-gray-500">—</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-compliance-darker p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Compliance Dashboard</h1>
        <p className="text-gray-400">Regulatory compliance monitoring and assessment tracking</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-compliance-dark/50 rounded-xl p-6 border border-primary-800/50 hover:border-primary-600/50 transition-all hover:shadow-glow-indigo">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-600/20 rounded-lg">
              <Shield size={24} className="text-primary-400" />
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getScoreColor(stats.overallScore)} bg-opacity-20`}>
              {stats.overallScore >= 90 ? 'Excellent' : stats.overallScore >= 70 ? 'Good' : 'Needs Work'}
            </span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Overall Score</h3>
          <p className={`text-3xl font-bold ${getScoreColor(stats.overallScore)}`}>{stats.overallScore}%</p>
        </div>

        <div className="bg-compliance-dark/50 rounded-xl p-6 border border-primary-800/50 hover:border-green-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle size={24} className="text-green-400" />
            </div>
            <span className="text-xs text-green-400 font-semibold bg-green-500/20 px-2 py-1 rounded">87%</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Compliant Controls</h3>
          <p className="text-3xl font-bold text-white">{stats.compliantControls}/{stats.totalControls}</p>
        </div>

        <div className="bg-compliance-dark/50 rounded-xl p-6 border border-primary-800/50 hover:border-yellow-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <AlertTriangle size={24} className="text-yellow-400" />
            </div>
            <span className="text-xs text-red-400 font-semibold bg-red-500/20 px-2 py-1 rounded">-5%</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Open Gaps</h3>
          <p className="text-3xl font-bold text-white">{stats.totalControls - stats.compliantControls}</p>
        </div>

        <div className="bg-compliance-dark/50 rounded-xl p-6 border border-primary-800/50 hover:border-primary-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <ClipboardList size={24} className="text-primary-400" />
            </div>
            <span className="text-xs text-primary-400 font-semibold bg-primary-600/20 px-2 py-1 rounded">Active</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Active Frameworks</h3>
          <p className="text-3xl font-bold text-white">{stats.activeFrameworks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assessments */}
        <div className="lg:col-span-2 bg-compliance-dark/50 rounded-xl border border-primary-800/50">
          <div className="p-6 border-b border-primary-800/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Assessments</h2>
              <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">View All</button>
            </div>
          </div>
          <div className="divide-y divide-primary-800/50">
            {recentAssessments.map((assessment) => (
              <div key={assessment.id} className="p-4 hover:bg-primary-800/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(assessment.status)}
                    <div>
                      <span className="font-medium text-white">{assessment.framework}</span>
                      <p className="text-xs text-gray-500">{assessment.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {assessment.status !== 'scheduled' && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`font-semibold ${getScoreColor(assessment.score)}`}>{assessment.score}%</span>
                        {assessment.gaps > 0 && (
                          <span className="text-yellow-400 text-xs bg-yellow-500/20 px-2 py-0.5 rounded">
                            {assessment.gaps} gaps
                          </span>
                        )}
                      </div>
                    )}
                    <button className="p-2 hover:bg-primary-700/30 rounded-lg text-gray-400 hover:text-primary-400 transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Framework Status */}
        <div className="bg-compliance-dark/50 rounded-xl border border-primary-800/50">
          <div className="p-6 border-b border-primary-800/50">
            <h2 className="text-xl font-semibold text-white">Framework Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {frameworkStatus.map((framework, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-primary-800/20 hover:bg-primary-800/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${framework.color}`}>{framework.shortName}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${getScoreColor(framework.score)}`}>{framework.score}%</span>
                    {getTrendIcon(framework.trend)}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${framework.score >= 90 ? 'bg-green-500' : framework.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${framework.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{framework.controls.passed} passed</span>
                  <span>{framework.controls.failed} failed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-compliance-gradient rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:shadow-glow-indigo transition-all">
          <Play size={20} />
          Start Assessment
        </button>
        <button className="p-4 bg-compliance-dark/50 border border-primary-600/50 rounded-xl text-primary-400 font-semibold flex items-center justify-center gap-2 hover:bg-primary-800/30 transition-all">
          <FileCheck size={20} />
          Run Gap Analysis
        </button>
        <button className="p-4 bg-compliance-dark/50 border border-primary-600/50 rounded-xl text-primary-400 font-semibold flex items-center justify-center gap-2 hover:bg-primary-800/30 transition-all">
          <BarChart3 size={20} />
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
