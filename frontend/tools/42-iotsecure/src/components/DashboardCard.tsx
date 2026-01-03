import React, { useState, useEffect } from 'react';
import { DashboardOverview, RiskBreakdown } from '../types';
import { iotSecureAPI } from '../services/iotSecureAPI';

interface DashboardCardProps {
  onNavigate?: (section: string) => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ onNavigate }) => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [riskBreakdown, setRiskBreakdown] = useState<RiskBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, riskRes] = await Promise.all([
        iotSecureAPI.dashboard.getOverview(),
        iotSecureAPI.dashboard.getRiskScore()
      ]);
      setOverview(overviewRes.data);
      setRiskBreakdown(riskRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return { text: 'text-red-400', bg: 'bg-red-500', label: 'Critical' };
    if (score >= 60) return { text: 'text-orange-400', bg: 'bg-orange-500', label: 'High' };
    if (score >= 40) return { text: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Medium' };
    return { text: 'text-green-400', bg: 'bg-green-500', label: 'Low' };
  };

  if (loading && !overview) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskColor(overview?.overallRiskScore || 0);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          Security Overview
        </h2>
        <span className="text-xs text-slate-400">
          Updated: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>

      {/* Risk Score */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm text-slate-400 mb-1">Overall Risk Score</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${riskInfo.text}`}>
                {overview?.overallRiskScore || 0}
              </span>
              <span className="text-xl text-slate-500">/100</span>
            </div>
            <span className={`text-sm ${riskInfo.text}`}>{riskInfo.label} Risk</span>
          </div>
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-slate-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className={riskInfo.text}
                strokeDasharray={`${(overview?.overallRiskScore || 0) * 3.52} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🔒</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <button
          onClick={() => onNavigate?.('devices')}
          className="bg-slate-700/30 rounded-lg p-4 text-center hover:bg-slate-700/50 transition-colors"
        >
          <div className="text-3xl mb-2">📡</div>
          <div className="text-2xl font-bold text-white">
            {overview?.totalDevices || 0}
          </div>
          <div className="text-xs text-slate-400">Total Devices</div>
          <div className="flex justify-center gap-2 mt-2">
            <span className="text-xs text-green-400">
              ● {overview?.devicesOnline || 0} online
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('vulnerabilities')}
          className="bg-slate-700/30 rounded-lg p-4 text-center hover:bg-slate-700/50 transition-colors"
        >
          <div className="text-3xl mb-2">🔓</div>
          <div className="text-2xl font-bold text-white">
            {overview?.totalVulnerabilities || 0}
          </div>
          <div className="text-xs text-slate-400">Vulnerabilities</div>
          <div className="flex justify-center gap-2 mt-2">
            <span className="text-xs text-red-400">
              {overview?.criticalVulnerabilities || 0} critical
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('alerts')}
          className="bg-slate-700/30 rounded-lg p-4 text-center hover:bg-slate-700/50 transition-colors"
        >
          <div className="text-3xl mb-2">🚨</div>
          <div className="text-2xl font-bold text-white">
            {overview?.activeAlerts || 0}
          </div>
          <div className="text-xs text-slate-400">Active Alerts</div>
          <div className="flex justify-center gap-2 mt-2">
            <span className="text-xs text-orange-400">
              {overview?.unresolvedAlerts || 0} unresolved
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('scans')}
          className="bg-slate-700/30 rounded-lg p-4 text-center hover:bg-slate-700/50 transition-colors"
        >
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-2xl font-bold text-white">
            {overview?.scansCompleted || 0}
          </div>
          <div className="text-xs text-slate-400">Scans Completed</div>
          <div className="flex justify-center gap-2 mt-2">
            <span className="text-xs text-cyan-400">
              {overview?.scansRunning || 0} running
            </span>
          </div>
        </button>
      </div>

      {/* Risk Breakdown */}
      {riskBreakdown && (
        <div className="p-4 border-t border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Risk Factors</h3>
          <div className="space-y-2">
            {riskBreakdown.factors?.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-lg">{factor.icon || '⚡'}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{factor.name}</span>
                    <span className={factor.score > 70 ? 'text-red-400' : factor.score > 40 ? 'text-yellow-400' : 'text-green-400'}>
                      {factor.score}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        factor.score > 70 ? 'bg-red-500' : factor.score > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-sm text-slate-500">No risk factors available</p>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-t border-slate-700/50 flex flex-wrap gap-2">
        <button
          onClick={() => onNavigate?.('scan')}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
        >
          <span>🔍</span> Run Scan
        </button>
        <button
          onClick={() => onNavigate?.('alerts')}
          className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors flex items-center gap-2"
        >
          <span>🚨</span> View Alerts
        </button>
        <button
          onClick={() => onNavigate?.('topology')}
          className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2"
        >
          <span>🌐</span> Network Map
        </button>
      </div>
    </div>
  );
};

export default DashboardCard;
