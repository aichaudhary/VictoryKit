import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, XCircle, Filter, Search,
  ChevronDown, ExternalLink, FileText, Shield, RefreshCw
} from 'lucide-react';

interface Violation {
  id: string;
  policyId: string;
  policyName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'remediated' | 'exempted';
  description: string;
  detectedAt: Date;
  resource: string;
}

interface Props {
  violations: Violation[];
}

const PolicyViolations: React.FC<Props> = ({ violations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredViolations = violations.filter(v => {
    const matchesSearch = v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.policyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || v.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const stats = {
    critical: violations.filter(v => v.severity === 'critical' && v.status === 'open').length,
    high: violations.filter(v => v.severity === 'high' && v.status === 'open').length,
    medium: violations.filter(v => v.severity === 'medium' && v.status === 'open').length,
    low: violations.filter(v => v.severity === 'low' && v.status === 'open').length,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'acknowledged': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'remediated': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'exempted': return <Shield className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Policy Violations</h1>
          <p className="text-gray-400 mt-1">Monitor and remediate policy violations</p>
        </div>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Run Scan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-red-400">{stats.critical}</h3>
              <p className="text-sm text-gray-400">Critical</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-400">{stats.high}</h3>
              <p className="text-sm text-gray-400">High</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-yellow-400">{stats.medium}</h3>
              <p className="text-sm text-gray-400">Medium</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-400">{stats.low}</h3>
              <p className="text-sm text-gray-400">Low</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search violations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="relative">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="remediated">Remediated</option>
            <option value="exempted">Exempted</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Violations List */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Violation</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Policy</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Severity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Resource</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Detected</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredViolations.map((violation) => (
                <tr key={violation.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium">{violation.description}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{violation.policyName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(violation.severity)}`}>
                      {violation.severity}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(violation.status)}
                      <span className="text-sm capitalize">{violation.status}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <code className="text-xs bg-gray-700 px-2 py-1 rounded">{violation.resource}</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">
                    {new Date(violation.detectedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1 text-xs bg-violet-600 hover:bg-violet-700 rounded-lg">
                        Remediate
                      </button>
                      <button className="p-1 hover:bg-gray-600 rounded">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PolicyViolations;
