import React from 'react';
import { 
  Target, Play, Pause, Plus, 
  Clock, CheckCircle, AlertTriangle, FileText 
} from 'lucide-react';
import { ThreatHunt } from '../types';
import { SEVERITY_COLORS } from '../constants';

interface ThreatHuntingPanelProps {
  hunts: ThreatHunt[];
  onCreateHunt: (hunt: Partial<ThreatHunt>) => void;
  onRunHunt: (huntId: string) => void;
  onPauseHunt: (huntId: string) => void;
  onSelectHunt: (hunt: ThreatHunt) => void;
  selectedHuntId?: string;
}

const ThreatHuntingPanel: React.FC<ThreatHuntingPanelProps> = ({
  hunts,
  onCreateHunt,
  onRunHunt,
  onPauseHunt,
  onSelectHunt,
  selectedHuntId
}) => {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newHunt, setNewHunt] = React.useState({
    name: '',
    hypothesis: '',
    query_type: 'ioc_search' as ThreatHunt['query_type'],
    data_sources: [] as string[],
    indicators: ''
  });

  const handleCreate = () => {
    onCreateHunt({
      name: newHunt.name,
      hypothesis: newHunt.hypothesis,
      query_type: newHunt.query_type,
      data_sources: newHunt.data_sources,
      indicators: newHunt.indicators.split('\n').filter(i => i.trim())
    });
    setShowCreateModal(false);
    setNewHunt({ name: '', hypothesis: '', query_type: 'ioc_search', data_sources: [], indicators: '' });
  };

  const selectedHunt = hunts.find(h => h.id === selectedHuntId);

  return (
    <div className="h-full flex bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
      {/* Hunt List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Threat Hunts
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {hunts.map((hunt) => (
            <div
              key={hunt.id}
              onClick={() => onSelectHunt(hunt)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedHuntId === hunt.id 
                  ? 'bg-purple-500/20 border-purple-500/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  hunt.status === 'running' ? 'bg-green-500/20 text-green-400' :
                  hunt.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  hunt.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {hunt.status.toUpperCase()}
                </span>
                <div className="flex gap-1">
                  {hunt.status === 'running' ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onPauseHunt(hunt.id); }}
                      className="p-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30"
                    >
                      <Pause className="w-3 h-3" />
                    </button>
                  ) : hunt.status !== 'completed' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRunHunt(hunt.id); }}
                      className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              <h3 className="text-sm font-medium text-white mb-1">{hunt.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{hunt.hypothesis}</p>
              
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(hunt.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {hunt.findings.length} findings
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hunt Details */}
      <div className="flex-1 flex flex-col">
        {selectedHunt ? (
          <>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  selectedHunt.query_type === 'ioc_search' ? 'bg-blue-500/20 text-blue-400' :
                  selectedHunt.query_type === 'behavior_pattern' ? 'bg-purple-500/20 text-purple-400' :
                  selectedHunt.query_type === 'anomaly_detection' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {selectedHunt.query_type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{selectedHunt.name}</h2>
              <p className="text-sm text-gray-400">{selectedHunt.hypothesis}</p>
              
              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span>Created by: {selectedHunt.created_by}</span>
                <span>Data Sources: {selectedHunt.data_sources.join(', ')}</span>
              </div>
            </div>

            {/* Findings */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Findings ({selectedHunt.findings.length})
              </h3>
              
              <div className="space-y-3">
                {selectedHunt.findings.map((finding) => (
                  <div key={finding.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${SEVERITY_COLORS[finding.severity].bg} ${SEVERITY_COLORS[finding.severity].text}`}>
                        {finding.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(finding.timestamp).toLocaleString()}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white mb-1">{finding.title}</h4>
                    <p className="text-xs text-gray-400 mb-2">{finding.description}</p>
                    
                    <div className="p-2 bg-black/30 rounded text-xs font-mono text-gray-300 mb-2">
                      {finding.evidence}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Recommended:</span>
                      <span className="text-gray-300">{finding.recommended_action}</span>
                    </div>
                  </div>
                ))}

                {selectedHunt.findings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No findings yet</p>
                    <p className="text-xs">Run the hunt to search for threats</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Select a Hunt</p>
              <p className="text-sm">Choose a threat hunt to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Hunt Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-white/10 p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">Create New Threat Hunt</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hunt Name</label>
                <input
                  type="text"
                  value={newHunt.name}
                  onChange={(e) => setNewHunt(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Cobalt Strike Beacon Detection"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hypothesis</label>
                <textarea
                  value={newHunt.hypothesis}
                  onChange={(e) => setNewHunt(p => ({ ...p, hypothesis: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 h-20"
                  placeholder="What are you hunting for and why?"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Query Type</label>
                <select
                  value={newHunt.query_type}
                  onChange={(e) => setNewHunt(p => ({ ...p, query_type: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ioc_search">IOC Search</option>
                  <option value="behavior_pattern">Behavior Pattern</option>
                  <option value="anomaly_detection">Anomaly Detection</option>
                  <option value="mitre_technique">MITRE Technique</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Indicators (one per line)</label>
                <textarea
                  value={newHunt.indicators}
                  onChange={(e) => setNewHunt(p => ({ ...p, indicators: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500 h-24"
                  placeholder="192.168.1.100&#10;evil-domain.com&#10;abc123hash..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Hunt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatHuntingPanel;
