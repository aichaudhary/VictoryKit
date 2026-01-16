/**
 * Playbook Card Component
 * Shows playbook with execution steps
 */

import { useState } from 'react';
import { Play, CheckCircle, Loader2, Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import type { Playbook } from '../api/demoData';

interface PlaybookCardProps {
  playbook: Playbook;
  onExecute: (playbook: Playbook) => void;
}

const severityColors = {
  critical: 'border-red-500/30',
  high: 'border-orange-500/30',
  medium: 'border-yellow-500/30',
  low: 'border-blue-500/30',
  informational: 'border-gray-500/30',
};

export function PlaybookCard({ playbook, onExecute }: PlaybookCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const completedSteps = playbook.steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / playbook.steps.length) * 100;

  const handleExecute = async () => {
    setIsExecuting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExecuting(false);
    onExecute(playbook);
  };

  return (
    <div className={`glass-card rounded-xl border ${severityColors[playbook.severity]} overflow-hidden`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold">{playbook.name}</h3>
            <p className="text-gray-400 text-sm mt-1">{playbook.description}</p>
          </div>
          <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-medium rounded">
            {playbook.category}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{completedSteps}/{playbook.steps.length} steps completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{playbook.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{playbook.automatedActions.length} automated actions</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute
              </>
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Steps */}
      {isExpanded && (
        <div className="border-t border-gray-800 p-4 bg-gray-900/50">
          <h4 className="text-white font-medium mb-3 text-sm">Playbook Steps</h4>
          <div className="space-y-2">
            {playbook.steps.map(step => (
              <div
                key={step.order}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  step.status === 'completed'
                    ? 'bg-green-500/10'
                    : step.status === 'running'
                    ? 'bg-yellow-500/10'
                    : 'bg-gray-800/50'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : step.status === 'running' ? (
                    <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${step.status === 'completed' ? 'text-green-300' : step.status === 'running' ? 'text-yellow-300' : 'text-gray-300'}`}>
                    {step.order}. {step.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{step.description}</p>
                </div>
                {step.automated && (
                  <span className="flex-shrink-0 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                    Auto
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
