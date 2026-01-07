import React, { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Zap,
  DollarSign,
  Server,
  Power,
  RefreshCw
} from 'lucide-react';
import { drPlanAPI } from '../services/api';

interface DashboardStats {
  activePlans: number;
  rtoAchievement: number;
  rpoAchievement: number;
  testSuccessRate: number;
  avgFailoverTime: number;
  complianceScore: number;
  predictedDowntimeCost: number;
  drInfrastructureCost: number;
}

interface DRPlan {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'testing';
  rtoTarget: number;
  rpoTarget: number;
  lastTested: string;
  nextTest: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

interface DRTest {
  _id: string;
  planName: string;
  testType: string;
  status: 'completed' | 'in-progress' | 'failed' | 'scheduled';
  startTime: string;
  duration: number;
  rtoAchieved: number;
  rpoAchieved: number;
  successRate: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activePlans: 0,
    rtoAchievement: 0,
    rpoAchievement: 0,
    testSuccessRate: 0,
    avgFailoverTime: 0,
    complianceScore: 0,
    predictedDowntimeCost: 0,
    drInfrastructureCost: 0,
  });
  const [drPlans, setDRPlans] = useState<DRPlan[]>([]);
  const [recentTests, setRecentTests] = useState<DRTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, plansRes, testsRes] = await Promise.all([
        drPlanAPI.dashboard.getStats(),
        drPlanAPI.drPlans.list({ status: 'active', limit: 6 }),
        drPlanAPI.drTesting.getRecent({ limit: 5 }),
      ]);

      setStats(statsRes.data);
      setDRPlans(plansRes.data.drPlans || []);
      setRecentTests(testsRes.data.tests || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'text-drplan-primary bg-drplan-primary/10 border-drplan-primary/30',
      inactive: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
      testing: 'text-drplan-accent bg-drplan-accent/10 border-drplan-accent/30',
      completed: 'text-green-500 bg-green-500/10 border-green-500/30',
      'in-progress': 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      failed: 'text-red-500 bg-red-500/10 border-red-500/30',
      scheduled: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    };
    return colors[status] || 'text-gray-500 bg-gray-500/10 border-gray-500/30';
  };

  const getCriticalityColor = (criticality: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-500',
      high: 'text-orange-500',
      medium: 'text-yellow-500',
      low: 'text-green-500',
    };
    return colors[criticality] || 'text-gray-500';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-drplan-darker to-drplan-dark">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-drplan-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading DR Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-drplan-darker to-drplan-dark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Disaster Recovery Dashboard
            </h1>
            <p className="text-gray-400">
              Real-time monitoring of DR plans, RTO/RPO compliance, and failover readiness
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Last Updated</p>
            <p className="text-white font-medium">{lastUpdate.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-drplan-primary/20 to-drplan-secondary/10 rounded-xl p-6 border border-drplan-primary/30 glow-green">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-drplan-primary" />
              <div className="text-3xl font-bold text-white">{stats.activePlans}</div>
            </div>
            <p className="text-gray-400 text-sm">Active DR Plans</p>
            <div className="mt-2 flex items-center text-drplan-accent text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Continuously monitored</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl p-6 border border-green-500/30 glow-emerald">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-green-500" />
              <div className="text-3xl font-bold text-white">{stats.rtoAchievement}%</div>
            </div>
            <p className="text-gray-400 text-sm">RTO Achievement</p>
            <div className="mt-2 text-green-400 text-xs">
              Avg: {formatTime(stats.avgFailoverTime)} failover
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-emerald-500" />
              <div className="text-3xl font-bold text-white">{stats.rpoAchievement}%</div>
            </div>
            <p className="text-gray-400 text-sm">RPO Achievement</p>
            <div className="mt-2 text-emerald-400 text-xs">
              Data loss protection
            </div>
          </div>

          <div className="bg-gradient-to-br from-drplan-accent/20 to-drplan-primary/10 rounded-xl p-6 border border-drplan-accent/30">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-drplan-accent" />
              <div className="text-3xl font-bold text-white">{stats.testSuccessRate}%</div>
            </div>
            <p className="text-gray-400 text-sm">Test Success Rate</p>
            <div className="mt-2 text-drplan-accent text-xs">
              Weekly automated testing
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-drplan-dark/50 rounded-xl p-6 border border-drplan-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-lg flex items-center justify-center border border-orange-500/30">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.predictedDowntimeCost)}
                  </p>
                  <p className="text-gray-400 text-sm">Predicted Downtime Cost (Annual)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Risk Level</p>
                <p className="text-orange-400 font-medium">Moderate</p>
              </div>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-3/5"></div>
            </div>
          </div>

          <div className="bg-drplan-dark/50 rounded-xl p-6 border border-drplan-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-drplan-primary/20 to-drplan-secondary/10 rounded-lg flex items-center justify-center border border-drplan-primary/30">
                  <DollarSign className="w-6 h-6 text-drplan-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.drInfrastructureCost)}
                  </p>
                  <p className="text-gray-400 text-sm">DR Infrastructure Cost (Monthly)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">ROI</p>
                <p className="text-drplan-primary font-medium">
                  {((stats.predictedDowntimeCost / 12 / stats.drInfrastructureCost) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-dr-gradient w-4/5"></div>
            </div>
          </div>
        </div>

        {/* Active DR Plans */}
        <div className="bg-drplan-dark/50 rounded-xl p-6 border border-drplan-primary/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Power className="w-6 h-6 text-drplan-primary mr-3" />
              Active DR Plans
            </h2>
            <button className="px-4 py-2 bg-dr-gradient text-white rounded-lg hover:shadow-lg hover:shadow-drplan-primary/20 transition-all flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Initiate Failover</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drPlans.map((plan) => (
              <div
                key={plan._id}
                className="bg-gradient-to-br from-drplan-primary/10 to-transparent rounded-lg p-4 border border-drplan-primary/20 hover:border-drplan-primary/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${getCriticalityColor(
                      plan.criticality
                    )}`}
                  >
                    {plan.criticality.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {plan.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">RTO Target:</span>
                    <span className="text-drplan-accent font-medium">
                      {formatTime(plan.rtoTarget)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">RPO Target:</span>
                    <span className="text-drplan-accent font-medium">
                      {formatTime(plan.rpoTarget)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Tested:</span>
                    <span className="text-white">
                      {new Date(plan.lastTested).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(
                    plan.status
                  )} text-center`}
                >
                  {plan.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent DR Tests */}
        <div className="bg-drplan-dark/50 rounded-xl p-6 border border-drplan-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Activity className="w-6 h-6 text-drplan-accent mr-3" />
              Recent DR Tests
            </h2>
            <button className="px-4 py-2 bg-gradient-to-r from-drplan-accent/20 to-drplan-primary/20 text-drplan-accent border border-drplan-accent/30 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Run DR Test</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-drplan-primary/20">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Plan Name
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Test Type
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    RTO Achieved
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    RPO Achieved
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTests.map((test) => (
                  <tr
                    key={test._id}
                    className="border-b border-drplan-primary/10 hover:bg-drplan-primary/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{test.planName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(test.startTime).toLocaleString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-300">{test.testType}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(
                          test.status
                        )}`}
                      >
                        {test.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {formatTime(test.duration)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-drplan-accent font-medium">
                        {formatTime(test.rtoAchieved)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-drplan-accent font-medium">
                        {formatTime(test.rpoAchieved)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-medium ${
                            test.successRate >= 95
                              ? 'text-green-500'
                              : test.successRate >= 85
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}
                        >
                          {test.successRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
