import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface RealTimeEvent {
  type: 'audit_log' | 'security_event' | 'compliance_report';
  data: any;
  timestamp: string;
}

const RealTimeMonitor: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:4018', {
      transports: ['websocket'],
      upgrade: false,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success('Real-time monitoring connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Real-time monitoring disconnected');
    });

    newSocket.on('audit_log', (data) => {
      const event: RealTimeEvent = {
        type: 'audit_log',
        data,
        timestamp: new Date().toISOString(),
      };
      setEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events

      // Show toast for critical events
      if (data.severity === 'critical') {
        toast.error(`Critical audit event: ${data.eventType}`, {
          duration: 6000,
        });
      }
    });

    newSocket.on('security_event', (data) => {
      const event: RealTimeEvent = {
        type: 'security_event',
        data,
        timestamp: new Date().toISOString(),
      };
      setEvents(prev => [event, ...prev.slice(0, 9)]);

      toast.error(`Security event: ${data.type}`, {
        duration: 6000,
      });
    });

    newSocket.on('compliance_report', (data) => {
      const event: RealTimeEvent = {
        type: 'compliance_report',
        data,
        timestamp: new Date().toISOString(),
      };
      setEvents(prev => [event, ...prev.slice(0, 9)]);

      toast.success(`Compliance report generated: ${data.framework}`, {
        duration: 4000,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'audit_log':
        return InformationCircleIcon;
      case 'security_event':
        return ExclamationTriangleIcon;
      case 'compliance_report':
        return CheckCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'audit_log':
        return 'text-blue-600';
      case 'security_event':
        return 'text-red-600';
      case 'compliance_report':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white shadow-lg rounded-lg p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Real-Time Monitor</h3>
          <div className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}
            ></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              No recent events
            </p>
          ) : (
            events.map((event, index) => {
              const Icon = getEventIcon(event.type);
              return (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-2 bg-gray-50 rounded text-xs"
                >
                  <Icon className={`h-4 w-4 mt-0.5 ${getEventColor(event.type)}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">
                      {event.type.replace('_', ' ')}
                    </p>
                    <p className="text-gray-600 truncate">
                      {event.type === 'audit_log'
                        ? `${event.data.eventType} - ${event.data.severity}`
                        : event.type === 'security_event'
                        ? `${event.data.type} - ${event.data.severity}`
                        : `${event.data.framework} report`}
                    </p>
                    <p className="text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitor;