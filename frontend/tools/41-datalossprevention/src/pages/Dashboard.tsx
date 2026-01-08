/**
 * DataLossPrevention Dashboard
 * Main overview with key metrics, charts, and recent activity
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, FileSearch, Users, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getDashboardMetrics, getIncidents } from '../services/api';

interface DashboardMetrics {
  criticalIncidents: number;
  incidents24h: number;
  totalSensitiveFiles: number;
  highRiskFiles: number;
  activePolicies: number;
  policyViolations7d: number;
  highRiskUsers: number;
  dataProtectionScore: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [metricsData, incidentsData] = await Promise.all([
        getDashboardMetrics(),
        getIncidents({ limit: 10, status: 'open' })
      ]);
      
      setMetrics(metricsData.data);
      setRecentIncidents(incidentsData.data || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dlp-primary"></div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dlp-darker via-dlp-dark to-dlp-darker p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Data Loss Prevention Dashboard
        </h1>
        <p className="text-gray-400">Real-time monitoring and protection status</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Data Protection Score */}
        <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-dlp-primary/20 hover:border-dlp-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-dlp-primary/20 rounded-lg">
              <Shield className="w-6 h-6 text-dlp-primary" />
            </div>
            <span className={`text-3xl font-bold ${getScoreColor(metrics?.dataProtectionScore || 0)}`}>
              {metrics?.dataProtectionScore || 0}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Protection Score</h3>
          <p className="text-sm text-gray-400">Overall data security rating</p>
        </div>

        {/* Critical Incidents */}
        <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-3xl font-bold text-red-500">
              {metrics?.criticalIncidents || 0}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Critical Incidents</h3>
          <p className="text-sm text-gray-400">Requiring immediate attention</p>
        </div>

        {/* Sensitive Files */}
        <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-dlp-accent/20 hover:border-dlp-accent/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-dlp-accent/20 rounded-lg">
              <FileSearch className="w-6 h-6 text-dlp-accent" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {metrics?.totalSensitiveFiles || 0}
              </div>
              <div className="text-xs text-red-400 flex items-center justify-end">
                <TrendingUp className="w-3 h-3 mr-1" />
                {metrics?.highRiskFiles || 0} high risk
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Sensitive Files</h3>
          <p className="text-sm text-gray-400">Classified & monitored</p>
        </div>

        {/* High Risk Users */}
        <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-3xl font-bold text-orange-500">
              {metrics?.highRiskUsers || 0}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">High Risk Users</h3>
          <p className="text-sm text-gray-400">On watchlist</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Incidents (24h)</p>
              <p className="text-2xl font-bold text-white">{metrics?.incidents24h || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-dlp-primary" />
          </div>
        </div>

        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Policies</p>
              <p className="text-2xl font-bold text-white">{metrics?.activePolicies || 0}</p>
            </div>
            <Shield className="w-8 h-8 text-dlp-accent" />
          </div>
        </div>

        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Violations (7d)</p>
              <p className="text-2xl font-bold text-white">{metrics?.policyViolations7d || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Incidents</h2>
          <Link to="/maula/incidents" className="text-dlp-primary hover:text-dlp-secondary transition-colors">
            View All →
          </Link>
        </div>

        <div className="space-y-4">
          {recentIncidents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No incidents to display</p>
            </div>
          ) : (
            recentIncidents.map((incident, index) => (
              <div
                key={incident.incidentId || index}
                className="bg-dlp-darker/50 rounded-lg p-4 border border-gray-700/50 hover:border-dlp-primary/30 transition-all cursor-pointer"
                onClick={() => navigate(`/maula/incidents/${incident.incidentId}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(incident.severity)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-semibold text-white">
                          {incident.policyViolated?.policyName || 'Policy Violation'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)} text-white`}>
                          {incident.severity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        <span>{incident.user?.name || 'Unknown User'}</span>
                        <span className="mx-2">•</span>
                        <span>{incident.data?.type || 'Data'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(incident.action?.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    incident.action?.blocked 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {incident.action?.blocked ? 'Blocked' : 'Alerted'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
