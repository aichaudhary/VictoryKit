import React, { useState } from 'react';
import { 
  Zap, Plus, Play, Pause, Edit, Trash2, 
  Clock, CheckCircle, AlertTriangle, Settings 
} from 'lucide-react';
import { Automation } from '../types';

interface AutomationManagerProps {
  automations: Automation[];
  onCreateAutomation: () => void;
  onToggleAutomation: (id: string, enabled: boolean) => void;
  onDeleteAutomation: (id: string) => void;
}

const AutomationManager: React.FC<AutomationManagerProps> = ({
  automations,
  onCreateAutomation,
  onToggleAutomation,
  onDeleteAutomation,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredAutomations = automations.filter(auto =>
    typeFilter === 'all' || auto.type === typeFilter
  );

  const getTypeColor = (type: Automation['type']) => {
    switch (type) {
      case 'enrichment': return 'bg-blue-500/20 text-blue-400';
      case 'response': return 'bg-red-500/20 text-red-400';
      case 'notification': return 'bg-yellow-500/20 text-yellow-400';
      case 'integration': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTriggerDescription = (trigger: Automation['trigger']) => {
    if (trigger.type === 'schedule') {
      return `Scheduled: ${trigger.schedule}`;
    }
    if (trigger.type === 'event') {
      return `On event: ${trigger.event_type}`;
    }
    return 'Conditional trigger';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Automations ({automations.length})
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Automate repetitive security tasks
          </p>
        </div>
        <button
          onClick={onCreateAutomation}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Automation
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2">
        {['all', 'enrichment', 'response', 'notification', 'integration', 'custom'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              typeFilter === type
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredAutomations.map(automation => (
          <div
            key={automation.id}
            className={`bg-slate-800/50 rounded-xl border p-4 transition-all ${
              automation.is_enabled
                ? 'border-slate-700'
                : 'border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${automation.is_enabled ? 'bg-yellow-500/20' : 'bg-slate-700'}`}>
                  <Zap className={`w-5 h-5 ${automation.is_enabled ? 'text-yellow-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className="text-white font-medium">{automation.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(automation.type)}`}>
                    {automation.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onToggleAutomation(automation.id, !automation.is_enabled)}
                className={`p-1.5 rounded-lg transition-colors ${
                  automation.is_enabled
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
                title={automation.is_enabled ? 'Disable automation' : 'Enable automation'}
              >
                {automation.is_enabled ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {automation.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Clock className="w-3 h-3" />
              {getTriggerDescription(automation.trigger)}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  {automation.execution_count} runs
                </span>
                {automation.last_triggered && (
                  <span>
                    Last: {new Date(automation.last_triggered).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Edit automation">
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => onDeleteAutomation(automation.id)}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete automation"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            {/* Actions Preview */}
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="text-xs text-gray-500 mb-1">Actions ({automation.actions.length})</div>
              <div className="flex flex-wrap gap-1">
                {automation.actions.slice(0, 3).map(action => (
                  <span key={action.id} className="text-xs px-1.5 py-0.5 bg-slate-900 text-gray-400 rounded">
                    {action.type}
                  </span>
                ))}
                {automation.actions.length > 3 && (
                  <span className="text-xs text-gray-500">+{automation.actions.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAutomations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No automations found</p>
          <button
            onClick={onCreateAutomation}
            className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
          >
            Create your first automation
          </button>
        </div>
      )}
    </div>
  );
};

export default AutomationManager;
