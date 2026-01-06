import React from 'react';
import { 
  Play, Pause, Plus, Settings, Clock, User, 
  CheckCircle, AlertTriangle, ArrowRight, Zap 
} from 'lucide-react';
import { Playbook, PlaybookStep, PlaybookExecution } from '../types';

interface PlaybookManagerProps {
  playbooks: Playbook[];
  executions: PlaybookExecution[];
  onRunPlaybook: (playbookId: string) => void;
  onCreatePlaybook: (playbook: Partial<Playbook>) => void;
  onSelectPlaybook: (playbook: Playbook) => void;
  selectedPlaybookId?: string;
}

const PlaybookManager: React.FC<PlaybookManagerProps> = ({
  playbooks,
  executions,
  onRunPlaybook,
  onCreatePlaybook,
  onSelectPlaybook,
  selectedPlaybookId
}) => {
  const [showCreate, setShowCreate] = React.useState(false);
  const [newPlaybook, setNewPlaybook] = React.useState({
    name: '',
    description: '',
    trigger_type: 'manual' as Playbook['trigger_type'],
    category: 'response'
  });

  const selectedPlaybook = playbooks.find(p => p.id === selectedPlaybookId);
  const recentExecutions = executions.filter(e => e.playbook_id === selectedPlaybookId);

  return (
    <div className="h-full flex bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
      {/* Playbook List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Playbooks
            </h2>
            <button
              onClick={() => setShowCreate(true)}
              className="p-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
              {playbooks.filter(p => p.is_active).length} Active
            </span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
              {executions.filter(e => e.status === 'running').length} Running
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {playbooks.map((playbook) => (
            <div
              key={playbook.id}
              onClick={() => onSelectPlaybook(playbook)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedPlaybookId === playbook.id 
                  ? 'bg-yellow-500/20 border-yellow-500/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  playbook.trigger_type === 'automatic' ? 'bg-purple-500/20 text-purple-400' :
                  playbook.trigger_type === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {playbook.trigger_type.toUpperCase()}
                </span>
                <span className={`w-2 h-2 rounded-full ${playbook.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
              
              <h3 className="text-sm font-medium text-white mb-1">{playbook.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{playbook.description}</p>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">{playbook.steps.length} steps</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onRunPlaybook(playbook.id); }}
                  className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                  title="Run Playbook"
                >
                  <Play className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Playbook Details */}
      <div className="flex-1 flex flex-col">
        {selectedPlaybook ? (
          <>
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedPlaybook.trigger_type === 'automatic' ? 'bg-purple-500/20 text-purple-400' :
                    selectedPlaybook.trigger_type === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedPlaybook.trigger_type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    selectedPlaybook.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedPlaybook.is_active ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => onRunPlaybook(selectedPlaybook.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Run Now
                  </button>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{selectedPlaybook.name}</h2>
              <p className="text-sm text-gray-400">{selectedPlaybook.description}</p>
              
              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span>Created by: {selectedPlaybook.created_by}</span>
                <span>Last run: {selectedPlaybook.last_run ? new Date(selectedPlaybook.last_run).toLocaleString() : 'Never'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Steps */}
              <h3 className="text-sm font-bold text-white mb-4">Playbook Steps</h3>
              <div className="space-y-3 mb-8">
                {selectedPlaybook.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.action_type === 'query' ? 'bg-blue-500/20 text-blue-400' :
                        step.action_type === 'containment' ? 'bg-red-500/20 text-red-400' :
                        step.action_type === 'notification' ? 'bg-yellow-500/20 text-yellow-400' :
                        step.action_type === 'enrichment' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                      {idx < selectedPlaybook.steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-500 rotate-90 my-1" />
                      )}
                    </div>
                    <div className="flex-1 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{step.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          step.action_type === 'query' ? 'bg-blue-500/20 text-blue-400' :
                          step.action_type === 'containment' ? 'bg-red-500/20 text-red-400' :
                          step.action_type === 'notification' ? 'bg-yellow-500/20 text-yellow-400' :
                          step.action_type === 'enrichment' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {step.action_type}
                        </span>
                      </div>
                      {step.description && (
                        <p className="text-xs text-gray-400">{step.description}</p>
                      )}
                      {step.timeout && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3" />
                          Timeout: {step.timeout}s
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Executions */}
              <h3 className="text-sm font-bold text-white mb-4">Recent Executions</h3>
              <div className="space-y-2">
                {recentExecutions.map((execution) => (
                  <div key={execution.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          execution.status === 'completed' ? 'bg-green-500' :
                          execution.status === 'running' ? 'bg-blue-500 animate-pulse' :
                          execution.status === 'failed' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-sm text-white capitalize">{execution.status}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(execution.started_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {execution.triggered_by}
                      </span>
                      {execution.completed_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Duration: {Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)}s
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {recentExecutions.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No executions yet
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Select a Playbook</p>
              <p className="text-sm">Choose a playbook to view details and run</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Playbook Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-white/10 p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">Create New Playbook</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Playbook Name</label>
                <input
                  type="text"
                  value={newPlaybook.name}
                  onChange={(e) => setNewPlaybook(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="e.g., Ransomware Response"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={newPlaybook.description}
                  onChange={(e) => setNewPlaybook(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 h-20"
                  placeholder="What does this playbook do?"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Trigger Type</label>
                <select
                  value={newPlaybook.trigger_type}
                  onChange={(e) => setNewPlaybook(p => ({ ...p, trigger_type: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic (on alert)</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="conditional">Conditional</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onCreatePlaybook(newPlaybook);
                  setShowCreate(false);
                  setNewPlaybook({ name: '', description: '', trigger_type: 'manual', category: 'response' });
                }}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Create Playbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookManager;
