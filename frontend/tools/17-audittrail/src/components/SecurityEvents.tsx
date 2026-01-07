import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:4017/api';

interface SecurityEvent {
  _id: string;
  eventId: string;
  type: string;
  severity: string;
  source: any;
  target: any;
  details: any;
  correlationId?: string;
  incidentId?: string;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

const SecurityEvents: React.FC = () => {
  const [showResolved, setShowResolved] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery<SecurityEvent[]>({
    queryKey: ['security-events', showResolved],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/security/events?resolved=${showResolved}`);
      return response.data.events;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const resolveEventMutation = useMutation({
    mutationFn: async ({ eventId, resolution }: { eventId: string; resolution: string }) => {
      // In a real implementation, you'd have an endpoint to resolve events
      // For now, we'll simulate this by updating local state
      return { eventId, resolution };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      toast.success('Security event resolved');
      setSelectedEvent(null);
    },
    onError: () => {
      toast.error('Failed to resolve security event');
    },
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return XCircleIcon;
      case 'high':
        return ExclamationTriangleIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const handleResolveEvent = (event: SecurityEvent) => {
    const resolution = prompt('Enter resolution details:');
    if (resolution) {
      resolveEventMutation.mutate({ eventId: event._id, resolution });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Events</h1>
            <p className="mt-2 text-gray-600">
              Real-time security monitoring and incident response
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Show Resolved</span>
            </label>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading security events...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {events && events.length > 0 ? (
              events.map((event) => {
                const Icon = getSeverityIcon(event.severity);
                return (
                  <div key={event._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${getSeverityColor(event.severity)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{event.type}</h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                                event.severity
                              )}`}
                            >
                              {event.severity}
                            </span>
                            {event.resolved && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Resolved
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Source:</span> {event.source?.ip || 'Unknown'} {event.source?.userId && `(${event.source.userId})`}
                            </div>
                            <div>
                              <span className="font-medium">Target:</span> {event.target?.resource || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Event ID:</span> {event.eventId}
                            </div>
                            <div>
                              <span className="font-medium">Timestamp:</span> {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </div>

                          {event.details?.description && (
                            <p className="mt-2 text-sm text-gray-700">{event.details.description}</p>
                          )}

                          {event.correlationId && (
                            <p className="mt-2 text-xs text-gray-500">
                              Correlation ID: {event.correlationId}
                            </p>
                          )}

                          {event.incidentId && (
                            <p className="mt-2 text-xs text-gray-500">
                              Incident ID: {event.incidentId}
                            </p>
                          )}

                          {event.resolved && event.resolution && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-sm text-green-800">
                                <span className="font-medium">Resolution:</span> {event.resolution}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {!event.resolved && (
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleResolveEvent(event)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            Resolve
                          </button>
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {showResolved ? 'No resolved security events' : 'No active security events'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {showResolved
                    ? 'All security events have been resolved.'
                    : 'Security monitoring is active. Events will appear here when detected.'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Security Event Details</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEvent.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEvent.severity}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEvent.eventId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedEvent.source, null, 2)}
                  </pre>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Target</label>
                  <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedEvent.target, null, 2)}
                  </pre>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Details</label>
                  <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityEvents;