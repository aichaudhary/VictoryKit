import React, { useState } from 'react';
import { 
  BookOpen, Plus, Play, CheckCircle, Clock, 
  ListOrdered, Trash2, Edit2, AlertTriangle
} from 'lucide-react';
import { Runbook } from '../types';
import { formatMinutes, formatDate } from '../constants';

interface RunbooksManagerProps {
  runbooks: Runbook[];
  onExecute: (id: string) => void;
  onValidate: (id: string) => void;
  onDelete: (id: string) => void;
}

const RunbooksManager: React.FC<RunbooksManagerProps> = ({ 
  runbooks, onExecute, onValidate, onDelete 
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedRunbook, setExpandedRunbook] = useState<string | null>(null);

  const filteredRunbooks = runbooks.filter(rb => 
    filterType === 'all' || rb.type === filterType
  );

  const typeColors: Record<string, string> = {
    failover: 'bg-orange-500',
    failback: 'bg-green-500',
    recovery: 'bg-blue-500',
    backup: 'bg-purple-500',
    test: 'bg-yellow-500',
    communication: 'bg-pink-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Runbooks</h2>
          <p className="text-slate-400">Step-by-step recovery procedures</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
          <Plus className="w-4 h-4" />
          New Runbook
        </button>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'failover', 'failback', 'recovery', 'backup', 'test', 'communication'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filterType === type 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Runbooks List */}
      <div className="space-y-4">
        {filteredRunbooks.map((runbook) => (
          <div key={runbook._id} className="bg-slate-800 rounded-xl border border-slate-700">
            {/* Header */}
            <div 
              className="p-6 cursor-pointer"
              onClick={() => setExpandedRunbook(expandedRunbook === runbook._id ? null : runbook._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${typeColors[runbook.type]}`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{runbook.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${typeColors[runbook.type]} bg-opacity-20`}>
                        {runbook.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        runbook.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        runbook.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {runbook.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1">{runbook.description}</p>
                    
                    <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <ListOrdered className="w-4 h-4" />
                        <span>{runbook.steps.length} steps</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>~{formatMinutes(runbook.estimatedTime)}</span>
                      </div>
                      <span>Executed {runbook.executionCount} times</span>
                      {runbook.lastExecuted && (
                        <span>Last: {formatDate(runbook.lastExecuted)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {runbook.status === 'approved' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onExecute(runbook._id); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      <Play className="w-4 h-4" />
                      Execute
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onValidate(runbook._id); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Validate
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(runbook._id); }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Steps */}
            {expandedRunbook === runbook._id && (
              <div className="border-t border-slate-700 p-6">
                <h4 className="text-sm font-semibold text-slate-400 mb-4">PROCEDURE STEPS</h4>
                <div className="space-y-4">
                  {runbook.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                        {step.order}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-white font-medium">{step.title}</h5>
                          {step.isAutomated && (
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                              Automated
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mt-1">{step.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>Responsible: {step.responsible}</span>
                          <span>Est. Time: {formatMinutes(step.estimatedTime)}</span>
                        </div>
                        {step.command && (
                          <pre className="mt-2 p-2 bg-slate-900 rounded text-xs text-green-400 overflow-x-auto">
                            {step.command}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRunbooks.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No runbooks found</p>
        </div>
      )}
    </div>
  );
};

export default RunbooksManager;
