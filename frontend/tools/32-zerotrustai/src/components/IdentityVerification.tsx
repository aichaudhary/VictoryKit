import React, { useState } from 'react';
import { 
  UserCheck, Search, Filter, Eye, Shield, Key, Fingerprint,
  AlertTriangle, CheckCircle, XCircle, Clock, Globe, Smartphone,
  RefreshCw, UserX, UserPlus, Settings
} from 'lucide-react';

interface TrustSession {
  id: string;
  user: string;
  device: string;
  location: string;
  trustScore: number;
  status: string;
  riskLevel: string;
  lastVerified: Date;
  factors: string[];
}

interface Props {
  sessions: TrustSession[];
}

const IdentityVerification: React.FC<Props> = ({ sessions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.device.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || session.status === selectedStatus;
    const matchesRisk = selectedRisk === 'all' || session.riskLevel === selectedRisk;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'challenged': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'blocked': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getFactorIcon = (factor: string) => {
    switch(factor) {
      case 'password': return <Key className="w-3 h-3" />;
      case 'mfa': return <Shield className="w-3 h-3" />;
      case 'device': return <Smartphone className="w-3 h-3" />;
      case 'biometric': return <Fingerprint className="w-3 h-3" />;
      case 'location': return <Globe className="w-3 h-3" />;
      default: return <UserCheck className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Identity Verification</h1>
          <p className="text-gray-400 mt-1">Monitor and manage user identity trust</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users or devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="challenged">Challenged</option>
              <option value="blocked">Blocked</option>
            </select>
            
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing <span className="text-white font-medium">{filteredSessions.length}</span> of <span className="text-white font-medium">{sessions.length}</span> sessions
        </p>
      </div>

      {/* Sessions Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Device</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Trust Score</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Risk Level</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Factors</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Last Verified</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredSessions.map((session) => (
              <tr 
                key={session.id} 
                className="hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{session.user.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium">{session.user}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{session.device}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{session.trustScore}%</span>
                    <div className="h-2 w-16 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          session.trustScore >= 90 ? 'bg-green-500' :
                          session.trustScore >= 70 ? 'bg-yellow-500' :
                          session.trustScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${session.trustScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    session.status === 'challenged' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {getStatusIcon(session.status)}
                    {session.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(session.riskLevel)}`}>
                    {session.riskLevel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {session.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs">
                        {getFactorIcon(factor)}
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(session.lastVerified).toLocaleString([], { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-600 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-600 rounded-lg">
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Identity Verification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{sessions.filter(s => s.status === 'active').length}</p>
              <p className="text-xs text-gray-400">Active Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{sessions.filter(s => s.status === 'challenged').length}</p>
              <p className="text-xs text-gray-400">Challenged</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{sessions.filter(s => s.status === 'blocked').length}</p>
              <p className="text-xs text-gray-400">Blocked</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold">98.5%</p>
              <p className="text-xs text-gray-400">MFA Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityVerification;
