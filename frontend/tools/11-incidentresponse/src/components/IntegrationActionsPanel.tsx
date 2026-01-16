/**
 * Integration Actions Panel
 * Quick access to real-world integrations for incident response
 */

import React, { useState } from 'react';
import { incidentApi } from '../api/incidentresponse.api';

interface IntegrationActionsPanelProps {
  incidentId: string;
  onActionComplete?: (action: string, result: unknown) => void;
}

interface ActionState {
  loading: boolean;
  result?: unknown;
  error?: string;
}

export const IntegrationActionsPanel: React.FC<IntegrationActionsPanelProps> = ({
  incidentId,
  onActionComplete,
}) => {
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({});

  const updateActionState = (action: string, state: Partial<ActionState>) => {
    setActionStates((prev) => ({
      ...prev,
      [action]: { ...prev[action], ...state },
    }));
  };

  const executeAction = async (action: string, apiCall: () => Promise<unknown>) => {
    updateActionState(action, { loading: true, error: undefined });
    try {
      const result = await apiCall();
      updateActionState(action, { loading: false, result });
      onActionComplete?.(action, result);
    } catch (error) {
      updateActionState(action, {
        loading: false,
        error: error instanceof Error ? error.message : 'Action failed',
      });
    }
  };

  const integrations = [
    {
      id: 'enrich',
      title: 'Enrich IOCs',
      description: 'Query threat intelligence for all indicators',
      icon: '🔍',
      color: 'purple',
      action: () =>
        fetch(`http://localhost:4011/api/v1/incidentcommand/incidents/${incidentId}/enrich-iocs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).then((r) => r.json()),
    },
    {
      id: 'siem',
      title: 'Search SIEM',
      description: 'Correlate events across SIEM platforms',
      icon: '📊',
      color: 'blue',
      action: () =>
        fetch(`http://localhost:4011/api/v1/incidentcommand/incidents/${incidentId}/siem-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeRange: '24h' }),
        }).then((r) => r.json()),
    },
    {
      id: 'edr',
      title: 'EDR Hunt',
      description: 'Search endpoints for IOC matches',
      icon: '🖥️',
      color: 'green',
      action: () =>
        fetch(`http://localhost:4011/api/v1/incidentcommand/incidents/${incidentId}/edr-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).then((r) => r.json()),
    },
    {
      id: 'ai',
      title: 'AI Analysis',
      description: 'Generate AI-powered incident analysis',
      icon: '🤖',
      color: 'cyan',
      action: () =>
        fetch(`http://localhost:4011/api/v1/incidentcommand/incidents/${incidentId}/ai-analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisType: 'comprehensive' }),
        }).then((r) => r.json()),
    },
    {
      id: 'notify',
      title: 'Send Alerts',
      description: 'Notify team via Slack, Teams, Email',
      icon: '📢',
      color: 'yellow',
      action: () =>
        fetch(`http://localhost:4011/api/v1/incidentcommand/incidents/${incidentId}/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channels: ['slack', 'email'] }),
        }).then((r) => r.json()),
    },
    {
      id: 'ticket',
      title: 'Create Ticket',
      description: 'Create ServiceNow/Jira ticket',
      icon: '🎫',
      color: 'orange',
      action: () =>
        fetch(
          `http://localhost:4011/api/v1/incidentcommand/incidents/${incidentId}/create-tickets`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        ).then((r) => r.json()),
    },
    {
      id: 'pager',
      title: 'Page On-Call',
      description: 'Escalate via PagerDuty',
      icon: '🚨',
      color: 'red',
      action: () =>
        fetch(`http://localhost:4011/api/v1/incidentcommand/incidents/${incidentId}/page-oncall`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).then((r) => r.json()),
    },
    {
      id: 'summary',
      title: 'Exec Summary',
      description: 'Generate executive summary',
      icon: '📝',
      color: 'indigo',
      action: () =>
        fetch(
          `http://localhost:4011/api/v1/incidentcommand/incidents/${incidentId}/executive-summary`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        ).then((r) => r.json()),
    },
  ];

  const getColorClasses = (color: string, loading: boolean) => {
    const colors: Record<string, string> = {
      purple: 'bg-purple-600 hover:bg-purple-500 border-purple-500',
      blue: 'bg-blue-600 hover:bg-blue-500 border-blue-500',
      green: 'bg-green-600 hover:bg-green-500 border-green-500',
      cyan: 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500',
      yellow: 'bg-yellow-600 hover:bg-yellow-500 border-yellow-500',
      orange: 'bg-orange-600 hover:bg-orange-500 border-orange-500',
      red: 'bg-red-600 hover:bg-red-500 border-red-500',
      indigo: 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500',
    };
    return loading ? 'bg-gray-700 border-gray-600 cursor-wait' : colors[color] || colors.blue;
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h3>
        <p className="text-gray-400 text-xs mt-1">Execute real-world integrations</p>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {integrations.map((integration) => {
          const state = actionStates[integration.id] || {};

          return (
            <button
              key={integration.id}
              onClick={() => executeAction(integration.id, integration.action)}
              disabled={state.loading}
              className={`
                p-3 rounded-lg border transition-all text-left
                ${getColorClasses(integration.color, state.loading)}
                ${state.loading ? 'opacity-70' : ''}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{integration.icon}</span>
                <span className="text-white font-medium text-sm">{integration.title}</span>
              </div>
              <p className="text-white/70 text-xs">{integration.description}</p>

              {state.loading && (
                <div className="mt-2 flex items-center gap-1">
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              )}

              {Boolean(state.result) && !state.loading && (
                <div className="mt-2 text-xs text-green-300 flex items-center gap-1">
                  <span>✓</span> Complete
                </div>
              )}

              {state.error && (
                <div className="mt-2 text-xs text-red-300 truncate">⚠ {state.error}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Results Panel */}
      {Object.entries(actionStates).some(([_, state]) => state.result) && (
        <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700">
          <details className="text-sm">
            <summary className="text-gray-400 cursor-pointer hover:text-white">
              View Action Results
            </summary>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(actionStates)
                .filter(([_, state]) => state.result)
                .map(([action, state]) => (
                  <div key={action} className="bg-gray-900 p-2 rounded text-xs">
                    <span className="text-cyan-400 font-medium">{action}:</span>
                    <pre className="text-gray-400 mt-1 overflow-x-auto">
                      {JSON.stringify(state.result, null, 2).slice(0, 500)}
                      {JSON.stringify(state.result).length > 500 && '...'}
                    </pre>
                  </div>
                ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default IntegrationActionsPanel;
