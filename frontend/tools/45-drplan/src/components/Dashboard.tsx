import React from 'react';
import { 
  Shield, Server, Building2, Clock, AlertTriangle, 
  CheckCircle, TrendingUp, Calendar, Activity
} from 'lucide-react';
import { DashboardStats, RecoveryPlan, CriticalSystem } from '../types';
import { formatMinutes, getReadinessColor, formatDate } from '../constants';

interface DashboardProps {
  stats: DashboardStats;
  recentPlans: RecoveryPlan[];
  criticalSystems: CriticalSystem[];
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, recentPlans, criticalSystems, onNavigate }) => {
  const statsCards = [
    { label: 'Active Plans', value: stats.activePlans, total: stats.totalPlans, icon: Shield, color: 'bg-blue-500' },
    { label: 'Critical Systems', value: stats.criticalSystems, total: stats.totalSystems, icon: Server, color: 'bg-purple-500' },
    { label: 'Systems at Risk', value: stats.systemsAtRisk, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Active Incidents', value: stats.activeIncidents, icon: Activity, color: 'bg-orange-500' },
    { label: 'Upcoming Tests', value: stats.upcomingTests, icon: Calendar, color: 'bg-green-500' },
    { label: 'Overdue Tests', value: stats.overdueTests, icon: Clock, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Readiness Score */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">DR Readiness Score</h2>
            <p className="text-slate-400">Overall disaster recovery preparedness</p>
          </div>
          <div className="text-right">
            <span className={`text-5xl font-bold ${getReadinessColor(stats.overallReadiness)}`}>
              {stats.overallReadiness}%
            </span>
            <p className="text-slate-400 mt-1">
              {stats.lastTestDate ? `Last test: ${formatDate(stats.lastTestDate)}` : 'No tests completed'}
            </p>
          </div>
        </div>
        <div className="mt-4 bg-slate-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${
              stats.overallReadiness >= 90 ? 'bg-green-500' :
              stats.overallReadiness >= 70 ? 'bg-yellow-500' :
              stats.overallReadiness >= 50 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${stats.overallReadiness}%` }}
          />
        </div>
      </div>

      {/* RTO/RPO Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400">Average RTO</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatMinutes(stats.avgRTO)}</p>
          <p className="text-sm text-slate-500 mt-1">Recovery Time Objective</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-slate-400">Average RPO</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatMinutes(stats.avgRPO)}</p>
          <p className="text-sm text-slate-500 mt-1">Recovery Point Objective</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stat.value}
                  {stat.total && <span className="text-sm text-slate-400">/{stat.total}</span>}
                </p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Systems Status */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Critical Systems Status</h3>
          <button 
            onClick={() => onNavigate('systems')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {criticalSystems.slice(0, 5).map((system) => (
            <div key={system._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  system.status === 'operational' ? 'bg-green-500' :
                  system.status === 'degraded' ? 'bg-yellow-500' :
                  system.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-white font-medium">{system.name}</p>
                  <p className="text-sm text-slate-400">Tier {system.tier} • {system.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">RTO: {formatMinutes(system.rto)}</p>
                <p className="text-sm text-slate-400">RPO: {formatMinutes(system.rpo)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Plans */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recovery Plans</h3>
          <button 
            onClick={() => onNavigate('plans')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {recentPlans.slice(0, 4).map((plan) => (
            <div key={plan._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div>
                <p className="text-white font-medium">{plan.name}</p>
                <p className="text-sm text-slate-400">v{plan.version} • {plan.systems.length} systems</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                plan.status === 'active' ? 'bg-green-500/20 text-green-400' :
                plan.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                plan.status === 'under_review' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {plan.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
