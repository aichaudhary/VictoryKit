import React, { useState } from 'react';
import { 
  Search, Filter, Download, RefreshCw, ChevronDown,
  AlertTriangle, CheckCircle, XCircle, Info, Eye, Clock
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  category: string;
  severity: string;
  user: string;
  resource: string;
  ip: string;
  outcome: string;
}

interface Props {
  logs: AuditLog[];
}

const AuditLogs: React.FC<Props> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const categories = ['all', 'authentication', 'authorization', 'data_access', 'configuration', 'security', 'system'];
  const severities = ['all', 'info', 'warning', 'error', 'critical'];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    return outcome === 'success' ? 
      <CheckCircle className="w-4 h-4 text-green-400" /> :
      <XCircle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-gray-400 mt-1">Search and analyze security events</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
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
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              {severities.map(sev => (
                <option key={sev} value={sev}>
                  {sev === 'all' ? 'All Severities' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing <span className="text-white font-medium">{filteredLogs.length}</span> of <span className="text-white font-medium">{logs.length}</span> events
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Timestamp</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Severity</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Outcome</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredLogs.map((log) => (
              <tr 
                key={log.id} 
                className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(log.timestamp).toLocaleString([], { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    log.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    log.severity === 'error' ? 'bg-orange-500/20 text-orange-400' :
                    log.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {getSeverityIcon(log.severity)}
                    {log.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {log.category.charAt(0).toUpperCase() + log.category.slice(1).replace('_', ' ')}
                </td>
                <td className="px-4 py-3 text-sm max-w-[200px] truncate">{log.action}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{log.user}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    log.outcome === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {getOutcomeIcon(log.outcome)}
                    {log.outcome}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button 
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Event Details</h3>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Event ID</label>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Timestamp</label>
                  <p className="text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Category</label>
                  <p className="text-sm">{selectedLog.category}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Severity</label>
                  <p className={`text-sm font-medium ${
                    selectedLog.severity === 'critical' ? 'text-red-400' :
                    selectedLog.severity === 'error' ? 'text-orange-400' :
                    selectedLog.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>{selectedLog.severity}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">User</label>
                  <p className="text-sm">{selectedLog.user}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">IP Address</label>
                  <p className="font-mono text-sm">{selectedLog.ip}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Action</label>
                <p className="text-sm">{selectedLog.action}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Resource</label>
                <p className="font-mono text-sm">{selectedLog.resource}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Outcome</label>
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                  selectedLog.outcome === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {getOutcomeIcon(selectedLog.outcome)}
                  {selectedLog.outcome}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
