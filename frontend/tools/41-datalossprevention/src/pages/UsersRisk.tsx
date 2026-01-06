/**
 * Users & Risk Page
 * Monitor user behavior and risk scores
 */

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Eye } from 'lucide-react';
import { getUsers, getUserRisk, overrideUserRisk } from '../services/api';

const UsersRisk: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      const params: any = {};
      if (filter === 'high') {
        params.riskLevel = 'high,critical';
      } else if (filter === 'watchlist') {
        params.watchlist = true;
      }
      const response = await getUsers(params);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 75) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (riskScore >= 50) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    if (riskScore >= 25) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-green-400 bg-green-500/10 border-green-500/30';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <div className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dlp-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dlp-darker via-dlp-dark to-dlp-darker p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Users & Risk Management</h1>
        <p className="text-gray-400">Monitor user behavior and insider threat risks</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-8">
        {['all', 'high', 'watchlist'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-dlp-primary to-dlp-accent text-white shadow-glow-blue'
                : 'bg-dlp-dark text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {f === 'all' ? 'All Users' : f === 'high' ? 'High Risk' : 'Watchlist'}
          </button>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Users</p>
          <p className="text-3xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-red-500/20">
          <p className="text-gray-400 text-sm mb-1">High Risk</p>
          <p className="text-3xl font-bold text-red-400">
            {users.filter(u => u.riskScore >= 75).length}
          </p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-orange-500/20">
          <p className="text-gray-400 text-sm mb-1">Watchlist</p>
          <p className="text-3xl font-bold text-orange-400">
            {users.filter(u => u.watchlist).length}
          </p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-yellow-500/20">
          <p className="text-gray-400 text-sm mb-1">Avg Risk Score</p>
          <p className="text-3xl font-bold text-yellow-400">
            {users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.riskScore, 0) / users.length) : 0}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">All Users</h2>

        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No users found</p>
              <p className="text-sm">Adjust filters to see users</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.userId}
                onClick={() => {
                  setSelectedUser(user);
                  setShowDetailModal(true);
                }}
                className="bg-dlp-darker/50 rounded-lg p-4 border border-gray-700/50 hover:border-dlp-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-dlp-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-dlp-primary font-bold text-lg">
                        {user.name?.charAt(0) || '?'}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-white text-lg">{user.name}</h3>
                        {user.watchlist && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                            Watchlist
                          </span>
                        )}
                        {getTrendIcon(user.riskTrend)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{user.email}</span>
                        <span>•</span>
                        <span>{user.department}</span>
                        <span>•</span>
                        <span>{user.role}</span>
                      </div>

                      {user.recentActivity && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>Files: {user.recentActivity.filesAccessed24h || 0}</span>
                          <span>•</span>
                          <span>Data: {((user.recentActivity.dataTransferred24h || 0) / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>Incidents: {user.incidents?.total || 0}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Risk Score</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold px-3 py-1 rounded border ${getRiskColor(user.riskScore)}`}>
                          {user.riskScore}
                        </span>
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-dlp-dark rounded-2xl p-8 border border-gray-700 max-w-4xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">User Risk Profile</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-dlp-darker rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3">Basic Information</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Department</p>
                    <p className="text-white">{selectedUser.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Role</p>
                    <p className="text-white">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Manager</p>
                    <p className="text-white">{selectedUser.manager || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="text-white capitalize">{selectedUser.status}</p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-dlp-darker rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3">Risk Assessment</h4>
                <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-400">Current Score</p>
                    <p className={`text-2xl font-bold ${getRiskColor(selectedUser.riskScore).split(' ')[0]}`}>
                      {selectedUser.riskScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Previous Score</p>
                    <p className="text-xl text-white">{selectedUser.previousRiskScore || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Trend</p>
                    <p className="text-white capitalize flex items-center space-x-1">
                      {getTrendIcon(selectedUser.riskTrend)}
                      <span>{selectedUser.riskTrend}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Level</p>
                    <p className="text-white capitalize">{selectedUser.riskLevel}</p>
                  </div>
                </div>
                {selectedUser.riskFactors && selectedUser.riskFactors.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs mb-2">Risk Factors:</p>
                    <div className="space-y-2">
                      {selectedUser.riskFactors.map((factor: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-dlp-dark rounded">
                          <span className="text-sm text-white">{factor.description}</span>
                          <span className={`text-xs font-medium ${
                            factor.severity === 'critical' ? 'text-red-400' :
                            factor.severity === 'high' ? 'text-orange-400' :
                            factor.severity === 'medium' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`}>
                            Weight: {factor.weight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              {selectedUser.recentActivity && (
                <div className="bg-dlp-darker rounded-lg p-4 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-3">Recent Activity</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Files Accessed (24h)</p>
                      <p className="text-white text-lg">{selectedUser.recentActivity.filesAccessed24h || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Data Transferred (24h)</p>
                      <p className="text-white text-lg">
                        {((selectedUser.recentActivity.dataTransferred24h || 0) / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Devices Used</p>
                      <p className="text-white text-lg">{selectedUser.recentActivity.devicesUsed7d || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                {selectedUser.watchlist ? (
                  <button
                    onClick={async () => {
                      await overrideUserRisk(selectedUser.userId, { action: 'remove_watchlist' });
                      loadUsers();
                      setShowDetailModal(false);
                    }}
                    className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                  >
                    Remove from Watchlist
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await overrideUserRisk(selectedUser.userId, { action: 'add_watchlist', reason: 'Manual review' });
                      loadUsers();
                      setShowDetailModal(false);
                    }}
                    className="px-6 py-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-all"
                  >
                    Add to Watchlist
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersRisk;
