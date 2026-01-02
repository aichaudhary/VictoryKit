import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Search, Eye, Shield, Download, MoreVertical } from 'lucide-react';
import { dlpAPI } from '../services/dlpAPI';
import { DLPIncident } from '../types';
import { SEVERITY_STYLES } from '../constants';

const IncidentPanel: React.FC = () => {
  const [incidents, setIncidents] = useState<DLPIncident[]>([]);
  const [, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<DLPIncident | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await dlpAPI.incidents.list({});
      setIncidents(data);
    } catch (error) {
      // Load sample incidents
      setIncidents([
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          type: 'content_scan',
          severity: 'critical',
          status: 'open',
          source: 'Microsoft OneDrive',
          destination: 'External Share',
          dataTypes: ['credit_card', 'ssn'],
          matchCount: 15,
          policyId: '1',
          policyName: 'PCI-DSS Compliance',
          user: 'john.doe@company.com',
          action: 'blocked',
          description: 'Credit card numbers detected in shared document',
          filePath: '/documents/financial-report-q4.xlsx',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          type: 'file_transfer',
          severity: 'high',
          status: 'investigating',
          source: 'Endpoint: LAPTOP-A1B2C3',
          destination: 'USB Drive',
          dataTypes: ['source_code', 'api_key'],
          matchCount: 8,
          policyId: '4',
          policyName: 'Intellectual Property',
          user: 'jane.smith@company.com',
          action: 'alerted',
          description: 'Source code files copied to removable media',
          filePath: '/dev/project-alpha/src/',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          type: 'email',
          severity: 'high',
          status: 'resolved',
          source: 'Outlook',
          destination: 'external@competitor.com',
          dataTypes: ['email', 'phone'],
          matchCount: 45,
          policyId: '3',
          policyName: 'GDPR Personal Data',
          user: 'mike.wilson@company.com',
          action: 'blocked',
          description: 'Customer PII list attached to external email',
          resolution: 'User educated on data handling policies',
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          type: 'cloud_storage',
          severity: 'medium',
          status: 'dismissed',
          source: 'Google Drive',
          destination: 'Public Link',
          dataTypes: ['address'],
          matchCount: 3,
          policyId: '3',
          policyName: 'GDPR Personal Data',
          user: 'sarah.johnson@company.com',
          action: 'logged',
          description: 'Marketing materials with office addresses shared publicly',
          resolution: 'False positive - public business addresses',
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          type: 'content_scan',
          severity: 'critical',
          status: 'open',
          source: 'Slack',
          destination: '#general',
          dataTypes: ['private_key', 'api_key'],
          matchCount: 2,
          policyId: '4',
          policyName: 'Intellectual Property',
          user: 'dev.team@company.com',
          action: 'blocked',
          description: 'AWS credentials posted in Slack channel',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = (id: string, status: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status: status as any } : inc
    ));
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filter !== 'all' && inc.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        inc.description.toLowerCase().includes(query) ||
        inc.user?.toLowerCase().includes(query) ||
        inc.source.toLowerCase().includes(query) ||
        inc.policyName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'investigating': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'dismissed': return <CheckCircle className="w-4 h-4 text-slate-400" />;
      default: return null;
    }
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      blocked: 'bg-red-500/20 text-red-400',
      encrypted: 'bg-blue-500/20 text-blue-400',
      alerted: 'bg-yellow-500/20 text-yellow-400',
      logged: 'bg-slate-500/20 text-slate-400',
      quarantined: 'bg-purple-500/20 text-purple-400',
    };
    return styles[action] || 'bg-slate-500/20 text-slate-400';
  };

  const openCount = incidents.filter(i => i.status === 'open').length;
  const criticalCount = incidents.filter(i => i.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Total Incidents</p>
          <p className="text-2xl font-bold mt-1">{incidents.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm text-slate-400">Open</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{openCount}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm text-slate-400">Critical</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{criticalCount}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-slate-400">Resolved Today</p>
          <p className="text-2xl font-bold mt-1 text-green-400">
            {incidents.filter(i => i.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incidents..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'investigating', 'resolved', 'dismissed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filter === status
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Incident</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Policy</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Time</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredIncidents.map(incident => (
                <tr key={incident.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${SEVERITY_STYLES[incident.severity]}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{incident.description}</p>
                      <p className="text-xs text-slate-400">{incident.source} → {incident.destination}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-purple-400">{incident.policyName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{incident.user}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${getActionBadge(incident.action)}`}>
                      {incident.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(incident.status)}
                      <span className="text-sm capitalize">{incident.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(incident.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="p-1.5 hover:bg-slate-700 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <div className="relative group">
                        <button className="p-1.5 hover:bg-slate-700 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-40">
                          {incident.status === 'open' && (
                            <button
                              onClick={() => updateStatus(incident.id, 'investigating')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700"
                            >
                              Investigate
                            </button>
                          )}
                          {incident.status !== 'resolved' && (
                            <button
                              onClick={() => updateStatus(incident.id, 'resolved')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700"
                            >
                              Mark Resolved
                            </button>
                          )}
                          <button
                            onClick={() => updateStatus(incident.id, 'dismissed')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-purple-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Incident Details</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-sm ${SEVERITY_STYLES[selectedIncident.severity]}`}>
                  {selectedIncident.severity}
                </span>
                <span className={`px-3 py-1 rounded text-sm ${getActionBadge(selectedIncident.action)}`}>
                  {selectedIncident.action}
                </span>
                <span className="text-sm text-slate-400">
                  {new Date(selectedIncident.timestamp).toLocaleString()}
                </span>
              </div>

              <h4 className="text-xl font-medium">{selectedIncident.description}</h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Policy</p>
                  <p className="text-purple-400">{selectedIncident.policyName}</p>
                </div>
                <div>
                  <p className="text-slate-400">User</p>
                  <p>{selectedIncident.user}</p>
                </div>
                <div>
                  <p className="text-slate-400">Source</p>
                  <p>{selectedIncident.source}</p>
                </div>
                <div>
                  <p className="text-slate-400">Destination</p>
                  <p>{selectedIncident.destination}</p>
                </div>
                <div>
                  <p className="text-slate-400">Data Types</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedIncident.dataTypes.map((type, i) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400">Matches</p>
                  <p className="text-red-400 font-medium">{selectedIncident.matchCount} findings</p>
                </div>
              </div>

              {selectedIncident.filePath && (
                <div>
                  <p className="text-sm text-slate-400">File Path</p>
                  <p className="font-mono text-sm bg-slate-800 px-3 py-2 rounded mt-1">
                    {selectedIncident.filePath}
                  </p>
                </div>
              )}

              {selectedIncident.resolution && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-400 font-medium">Resolution</p>
                  <p className="text-sm mt-1">{selectedIncident.resolution}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedIncident.status === 'open' && (
                  <button
                    onClick={() => {
                      updateStatus(selectedIncident.id, 'investigating');
                      setSelectedIncident(null);
                    }}
                    className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg"
                  >
                    Start Investigation
                  </button>
                )}
                {selectedIncident.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      updateStatus(selectedIncident.id, 'resolved');
                      setSelectedIncident(null);
                    }}
                    className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg"
                  >
                    Mark Resolved
                  </button>
                )}
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentPanel;
