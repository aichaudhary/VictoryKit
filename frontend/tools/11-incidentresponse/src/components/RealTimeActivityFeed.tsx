/**
 * Real-Time Activity Feed Component
 * Displays live incident updates and actions
 */

import React, { useEffect, useState } from 'react';
import { useIncidentWebSocket, WebSocketEvent } from '../hooks/useWebSocket';

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  incidentId?: string;
  details?: Record<string, unknown>;
}

interface RealTimeActivityFeedProps {
  userId?: string;
  incidentId?: string;
  maxItems?: number;
  onEventClick?: (event: ActivityItem) => void;
}

const eventMessages: Record<string, (data: WebSocketEvent) => { message: string; severity: ActivityItem['severity'] }> = {
  'incident:created': (data) => ({
    message: `New incident created: ${data.incident?.title || data.incidentId}`,
    severity: data.incident?.severity === 'critical' ? 'error' : 'warning',
  }),
  'incident:updated': (data) => ({
    message: `Incident ${data.incidentId} updated`,
    severity: 'info',
  }),
  'incident:timeline': (data) => ({
    message: `Timeline event: ${data.event?.event || 'New activity'}`,
    severity: 'info',
  }),
  'incident:enrichment': (data) => ({
    message: `IOC enrichment complete: ${data.results?.enrichedCount || 0} indicators analyzed`,
    severity: 'success',
  }),
  'incident:siem': (data) => ({
    message: `SIEM search complete: ${data.eventsFound || 0} events found`,
    severity: 'info',
  }),
  'incident:edr': (data) => ({
    message: `EDR scan complete: ${data.matchCount || 0} matches, ${data.endpointsAffected || 0} endpoints`,
    severity: (data.matchCount ?? 0) > 0 ? 'warning' : 'success',
  }),
  'incident:analysis': (data) => ({
    message: `AI analysis complete (${data.provider || 'AI'}): Risk score ${data.riskScore || 'N/A'}`,
    severity: (data.riskScore ?? 0) > 70 ? 'error' : 'info',
  }),
  'incident:notification': (data) => ({
    message: `Notifications sent via ${(data.channels as string[])?.join(', ') || 'channels'}`,
    severity: 'success',
  }),
  'incident:containment': (data) => ({
    message: `Containment action: ${data.action || 'Action taken'}`,
    severity: 'warning',
  }),
  'incident:ticket': (data) => ({
    message: `Ticket created in ${data.system}: ${data.ticketId}`,
    severity: 'success',
  }),
  'alert:critical': () => ({
    message: 'CRITICAL ALERT: Immediate attention required!',
    severity: 'error',
  }),
  'dashboard:update': () => ({
    message: 'Dashboard data updated',
    severity: 'info',
  }),
};

export const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({
  userId,
  incidentId,
  maxItems = 20,
  onEventClick,
}) => {
  const { connected, events, lastEvent } = useIncidentWebSocket({ userId, incidentId });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const mappedActivities: ActivityItem[] = events.slice(0, maxItems).map((event, idx) => {
      const config = eventMessages[event.type] || (() => ({ message: `Event: ${event.type}`, severity: 'info' as const }));
      const { message, severity } = config(event);

      return {
        id: `${event.type}-${idx}-${event.receivedAt}`,
        type: event.type,
        message,
        timestamp: (event.receivedAt as string) || new Date().toISOString(),
        severity,
        incidentId: (event.incidentId as string) || incidentId,
        details: event,
      };
    });

    setActivities(mappedActivities);
  }, [events, maxItems, isPaused, incidentId]);

  const getSeverityClasses = (severity?: ActivityItem['severity']): string => {
    switch (severity) {
      case 'error':
        return 'bg-red-900/30 border-red-500 text-red-300';
      case 'warning':
        return 'bg-yellow-900/30 border-yellow-500 text-yellow-300';
      case 'success':
        return 'bg-green-900/30 border-green-500 text-green-300';
      default:
        return 'bg-blue-900/30 border-blue-500 text-blue-300';
    }
  };

  const getSeverityIcon = (severity?: ActivityItem['severity']): string => {
    switch (severity) {
      case 'error':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <h3 className="text-white font-semibold">Real-Time Activity</h3>
          <span className="text-gray-400 text-sm">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isPaused 
                ? 'bg-yellow-600 text-white hover:bg-yellow-500' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <span className="text-gray-500 text-xs">{activities.length} events</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <span className="text-4xl mb-2">📡</span>
            <p>Waiting for real-time events...</p>
            <p className="text-xs mt-1">Events will appear here as they occur</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-800/50 ${
                  lastEvent?.type === activity.type && 
                  (lastEvent?.receivedAt as string) === activity.timestamp 
                    ? 'animate-pulse' 
                    : ''
                }`}
                onClick={() => onEventClick?.(activity)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getSeverityIcon(activity.severity)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${getSeverityClasses(activity.severity).split(' ').pop()}`}>
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(activity.timestamp)}
                      </span>
                      {activity.incidentId && (
                        <span className="text-xs text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">
                          {activity.incidentId}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {activity.type.replace('incident:', '').replace(':', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      {lastEvent && (
        <div className="px-4 py-2 bg-gray-800/50 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Last update: {formatTime((lastEvent.receivedAt as string) || new Date().toISOString())}
          </p>
        </div>
      )}
    </div>
  );
};

export default RealTimeActivityFeed;
