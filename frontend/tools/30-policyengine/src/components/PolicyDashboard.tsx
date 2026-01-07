import React from 'react';
import { 
  FileText, ShieldCheck, AlertTriangle, Clock, TrendingUp, 
  CheckCircle, XCircle, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'pending_approval' | 'active' | 'archived';
  complianceStatus: 'compliant' | 'non_compliant' | 'partial';
  framework: string;
  lastUpdated: Date;
}

interface Violation {
  id: string;
  policyName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'remediated' | 'exempted';
  description: string;
  detectedAt: Date;
}

interface Stats {
  totalPolicies: number;
  activePolicies: number;
  complianceScore: number;
  openViolations: number;
  pendingApprovals: number;
  frameworksCovered: number;
}

interface Props {
  policies: Policy[];
  stats: Stats;
  violations: Violation[];
}

const PolicyDashboard: React.FC<Props> = ({ policies, stats, violations }) => {
  const frameworks = [
    { name: 'NIST 800-53', coverage: 85, controls: 142, color: 'violet' },
    { name: 'ISO 27001', coverage: 78, controls: 93, color: 'blue' },
    { name: 'CIS Controls', coverage: 92, controls: 18, color: 'green' },
    { name: 'GDPR', coverage: 72, controls: 28, color: 'amber' },
  ];

  const recentActivities = [
    { action: 'Policy approved', policy: 'Network Security Policy', user: 'Admin', time: '2 hours ago', type: 'approval' },
    { action: 'Violation detected', policy: 'Data Protection Policy', user: 'System', time: '4 hours ago', type: 'violation' },
    { action: 'Policy updated', policy: 'Access Control Policy', user: 'John D.', time: '1 day ago', type: 'update' },
    { action: 'Exception granted', policy: 'Encryption Policy', user: 'Admin', time: '2 days ago', type: 'exception' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Policy Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor and manage your security policies</p>
        </div>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Create Policy
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-violet-400" />
            </div>
            <span className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              +3
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.totalPolicies}</h3>
          <p className="text-gray-400 text-sm">Total Policies</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-400" />
            </div>
            <span className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              +5%
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.complianceScore}%</h3>
          <p className="text-gray-400 text-sm">Compliance Score</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <span className="flex items-center text-red-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              +2
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.openViolations}</h3>
          <p className="text-gray-400 text-sm">Open Violations</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.pendingApprovals}</h3>
          <p className="text-gray-400 text-sm">Pending Approvals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Framework Coverage */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Framework Coverage</h2>
          <div className="space-y-4">
            {frameworks.map((fw) => (
              <div key={fw.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{fw.name}</span>
                  <span className="text-sm text-gray-400">{fw.controls} controls</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${fw.color}-500 transition-all`}
                      style={{ width: `${fw.coverage}%`, backgroundColor: fw.color === 'violet' ? '#8B5CF6' : fw.color === 'blue' ? '#3B82F6' : fw.color === 'green' ? '#22C55E' : '#F59E0B' }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${fw.coverage >= 80 ? 'text-green-400' : fw.coverage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {fw.coverage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Violations */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Violations</h2>
          <div className="space-y-3">
            {violations.slice(0, 4).map((violation) => (
              <div key={violation.id} className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  violation.severity === 'critical' ? 'bg-red-500/20' :
                  violation.severity === 'high' ? 'bg-orange-500/20' :
                  violation.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${
                    violation.severity === 'critical' ? 'text-red-400' :
                    violation.severity === 'high' ? 'text-orange-400' :
                    violation.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{violation.description}</p>
                  <p className="text-xs text-gray-400">{violation.policyName}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  violation.status === 'open' ? 'bg-red-500/20 text-red-400' :
                  violation.status === 'acknowledged' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {violation.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activity.type === 'approval' ? 'bg-green-500/20' :
                activity.type === 'violation' ? 'bg-red-500/20' :
                activity.type === 'update' ? 'bg-blue-500/20' : 'bg-amber-500/20'
              }`}>
                {activity.type === 'approval' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                 activity.type === 'violation' ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
                 activity.type === 'update' ? <FileText className="w-5 h-5 text-blue-400" /> :
                 <ShieldCheck className="w-5 h-5 text-amber-400" />}
              </div>
              <div className="flex-1">
                <p className="text-sm"><span className="font-medium">{activity.action}</span> - {activity.policy}</p>
                <p className="text-xs text-gray-400">by {activity.user}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PolicyDashboard;
