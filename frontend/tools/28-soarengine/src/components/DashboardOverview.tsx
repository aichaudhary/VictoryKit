import React from 'react';
import { 
  Briefcase, Clock, AlertTriangle, CheckCircle, 
  TrendingUp, Zap, PlugZap, Target 
} from 'lucide-react';
import { DashboardStats, Case, PlaybookExecution } from '../types';
import { SEVERITY_COLORS, SEVERITY_DOT_COLORS } from '../constants';

interface DashboardOverviewProps {
  stats: DashboardStats;
  recentCases: Case[];
  recentExecutions: PlaybookExecution[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  stats, 
  recentCases, 
  recentExecutions 
}) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-red-400">
              {stats.critical_cases} critical
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.open_cases}</div>
          <div className="text-sm text-gray-400">Open Cases</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(stats.mean_time_to_respond)}</div>
          <div className="text-sm text-gray-400">MTTR</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.automation_rate}%</div>
          <div className="text-sm text-gray-400">Automation Rate</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.sla_compliance}%</div>
          <div className="text-sm text-gray-400">SLA Compliance</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
          <div className="text-lg font-semibold text-white">{stats.cases_today}</div>
          <div className="text-xs text-gray-500">Cases Today</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
          <div className="text-lg font-semibold text-white">{stats.active_playbooks}</div>
          <div className="text-xs text-gray-500">Active Playbooks</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
          <div className="text-lg font-semibold text-white">{stats.automations_triggered}</div>
          <div className="text-xs text-gray-500">Automations Today</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <PlugZap className="w-4 h-4 text-green-400" />
            <span className="text-lg font-semibold text-white">
              {stats.integrations_healthy}/{stats.integrations_total}
            </span>
          </div>
          <div className="text-xs text-gray-500">Integrations Healthy</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            Recent Cases
          </h3>
          <div className="space-y-3">
            {recentCases.slice(0, 5).map(caseItem => (
              <div 
                key={caseItem.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT_COLORS[caseItem.severity]}`} />
                  <div>
                    <div className="text-sm font-medium text-white">{caseItem.title}</div>
                    <div className="text-xs text-gray-500">{caseItem.case_type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${SEVERITY_COLORS[caseItem.severity]}`}>
                    {caseItem.severity}
                  </span>
                  {caseItem.sla_breached && (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Playbook Executions */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Recent Executions
          </h3>
          <div className="space-y-3">
            {recentExecutions.slice(0, 5).map(execution => (
              <div 
                key={execution.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {execution.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : execution.status === 'running' ? (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-white">{execution.playbook_name}</div>
                    <div className="text-xs text-gray-500">
                      {execution.steps_completed}/{execution.total_steps} steps
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(execution.started_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
