import React, { useState } from 'react';
import { 
  Briefcase, Search, Filter, Plus, Clock, User, 
  AlertTriangle, ChevronRight, Tag, Zap 
} from 'lucide-react';
import { Case, CaseSeverity, CaseStatus } from '../types';
import { SEVERITY_COLORS, STATUS_COLORS, SEVERITY_DOT_COLORS } from '../constants';

interface CaseManagementProps {
  cases: Case[];
  selectedCase: Case | null;
  onSelectCase: (caseItem: Case) => void;
  onCreateCase: () => void;
  onUpdateCase: (caseItem: Case) => void;
}

const CaseManagement: React.FC<CaseManagementProps> = ({
  cases,
  selectedCase,
  onSelectCase,
  onCreateCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<CaseSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || caseItem.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex h-full gap-4">
      {/* Cases List */}
      <div className="w-1/3 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            Cases ({filteredCases.length})
          </h3>
          <button
            onClick={onCreateCase}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-colors"
            title="Create new case"
          >
            <Plus className="w-4 h-4" />
            New Case
          </button>
        </div>

        {/* Search & Filters */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as CaseSeverity | 'all')}
              className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              title="Filter by severity"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'all')}
              className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Cases List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredCases.map(caseItem => (
            <button
              key={caseItem.id}
              onClick={() => onSelectCase(caseItem)}
              className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all ${
                selectedCase?.id === caseItem.id
                  ? 'bg-purple-500/20 border-purple-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT_COLORS[caseItem.severity]}`} />
                  <span className="text-sm font-medium text-white truncate max-w-[180px]">
                    {caseItem.title}
                  </span>
                </div>
                {caseItem.sla_breached && (
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
              </div>
              <div className="text-xs text-gray-400 line-clamp-2 mb-2">
                {caseItem.description}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[caseItem.status]}`}>
                    {caseItem.status.replace('_', ' ')}
                  </span>
                  {caseItem.playbook_executions.length > 0 && (
                    <Zap className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(caseItem.created_at)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Case Details */}
      <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-4 overflow-y-auto">
        {selectedCase ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${SEVERITY_COLORS[selectedCase.severity]}`}>
                    {selectedCase.severity}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[selectedCase.status]}`}>
                    {selectedCase.status.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedCase.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{selectedCase.description}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-colors">
                  Run Playbook
                </button>
                <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors">
                  Escalate
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-4 gap-4 p-3 bg-slate-900/50 rounded-lg">
              <div>
                <div className="text-xs text-gray-500">Case Type</div>
                <div className="text-sm text-white">{selectedCase.case_type}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Source</div>
                <div className="text-sm text-white">{selectedCase.source}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Assigned To</div>
                <div className="text-sm text-white flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {selectedCase.assigned_to.join(', ') || 'Unassigned'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Priority</div>
                <div className="text-sm text-white">P{selectedCase.priority}</div>
              </div>
            </div>

            {/* Tags */}
            {selectedCase.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                {selectedCase.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-slate-700 text-gray-300 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Artifacts */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Artifacts ({selectedCase.artifacts.length})</h4>
              <div className="space-y-1">
                {selectedCase.artifacts.map(artifact => (
                  <div 
                    key={artifact.id}
                    className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 bg-slate-700 text-gray-400 rounded uppercase">
                        {artifact.type}
                      </span>
                      <code className="text-sm text-purple-400">{artifact.value}</code>
                    </div>
                    {artifact.is_malicious !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        artifact.is_malicious ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {artifact.is_malicious ? 'Malicious' : 'Clean'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Timeline</h4>
              <div className="space-y-2">
                {selectedCase.timeline.slice(0, 5).map((event, idx) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      {idx < selectedCase.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-700" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="text-sm text-white">{event.title}</div>
                      <div className="text-xs text-gray-400">{event.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(event.timestamp).toLocaleString()} • {event.actor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a case to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseManagement;
