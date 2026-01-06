import React, { useState } from 'react';
import { 
  BookOpen, Plus, Play, Pause, Edit, Trash2, 
  CheckCircle, XCircle, Clock, ChevronRight, 
  GitBranch, Zap, Settings 
} from 'lucide-react';
import { Playbook, PlaybookExecution, PlaybookStep } from '../types';
import { PLAYBOOK_STATUS_COLORS, EXECUTION_STATUS_COLORS, PLAYBOOK_CATEGORIES } from '../constants';

interface PlaybookBuilderProps {
  playbooks: Playbook[];
  executions: PlaybookExecution[];
  selectedPlaybook: Playbook | null;
  onSelectPlaybook: (playbook: Playbook) => void;
  onCreatePlaybook: () => void;
  onRunPlaybook: (playbook: Playbook) => void;
}

const PlaybookBuilder: React.FC<PlaybookBuilderProps> = ({
  playbooks,
  executions,
  selectedPlaybook,
  onSelectPlaybook,
  onCreatePlaybook,
  onRunPlaybook,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'steps' | 'executions'>('steps');

  const filteredPlaybooks = playbooks.filter(pb => 
    categoryFilter === 'all' || pb.category === categoryFilter
  );

  const playbookExecutions = executions.filter(e => 
    e.playbook_id === selectedPlaybook?.id
  );

  const renderStepIcon = (type: PlaybookStep['type']) => {
    switch (type) {
      case 'action': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'decision': return <GitBranch className="w-4 h-4 text-blue-400" />;
      case 'manual': return <Settings className="w-4 h-4 text-gray-400" />;
      case 'wait': return <Clock className="w-4 h-4 text-purple-400" />;
      default: return <ChevronRight className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Playbooks List */}
      <div className="w-1/3 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Playbooks ({filteredPlaybooks.length})
          </h3>
          <button
            onClick={onCreatePlaybook}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-colors"
            title="Create new playbook"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-3 py-2 mb-4 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          title="Filter by category"
        >
          <option value="all">All Categories</option>
          {PLAYBOOK_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Playbooks List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredPlaybooks.map(playbook => (
            <button
              key={playbook.id}
              onClick={() => onSelectPlaybook(playbook)}
              className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all ${
                selectedPlaybook?.id === playbook.id
                  ? 'bg-purple-500/20 border-purple-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-white">{playbook.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${PLAYBOOK_STATUS_COLORS[playbook.status]}`}>
                  {playbook.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 line-clamp-2 mb-2">
                {playbook.description}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{playbook.steps.length} steps</span>
                <span>{playbook.execution_count} runs • {playbook.success_rate}% success</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Playbook Details */}
      <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        {selectedPlaybook ? (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${PLAYBOOK_STATUS_COLORS[selectedPlaybook.status]}`}>
                      {selectedPlaybook.status}
                    </span>
                    <span className="text-xs text-gray-500">v{selectedPlaybook.version}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedPlaybook.name}</h2>
                  <p className="text-sm text-gray-400 mt-1">{selectedPlaybook.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onRunPlaybook(selectedPlaybook)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm text-white transition-colors"
                    title="Run playbook"
                  >
                    <Play className="w-4 h-4" />
                    Run
                  </button>
                  <button className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors" title="Edit playbook">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setActiveTab('steps')}
                  className={`text-sm pb-2 border-b-2 transition-colors ${
                    activeTab === 'steps' 
                      ? 'text-purple-400 border-purple-400' 
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  Steps ({selectedPlaybook.steps.length})
                </button>
                <button
                  onClick={() => setActiveTab('executions')}
                  className={`text-sm pb-2 border-b-2 transition-colors ${
                    activeTab === 'executions' 
                      ? 'text-purple-400 border-purple-400' 
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  Executions ({playbookExecutions.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'steps' ? (
                <div className="space-y-2">
                  {selectedPlaybook.steps.map((step, idx) => (
                    <div 
                      key={step.id}
                      className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm text-white font-medium">
                          {idx + 1}
                        </div>
                        {idx < selectedPlaybook.steps.length - 1 && (
                          <div className="w-0.5 h-8 bg-slate-700 mt-2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {renderStepIcon(step.type)}
                          <span className="text-sm font-medium text-white">{step.name}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-slate-700 text-gray-400 rounded">
                            {step.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{step.description}</p>
                        {step.action && (
                          <div className="mt-2 text-xs text-purple-400">
                            → {step.action.action_name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {playbookExecutions.map(execution => (
                    <div 
                      key={execution.id}
                      className="p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {execution.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : execution.status === 'failed' ? (
                            <XCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded ${EXECUTION_STATUS_COLORS[execution.status]}`}>
                            {execution.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(execution.started_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Triggered by: {execution.triggered_by}</span>
                        <span>{execution.steps_completed}/{execution.total_steps} steps</span>
                      </div>
                      {execution.error && (
                        <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                          {execution.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a playbook to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaybookBuilder;
