/**
 * Incident Card Component
 * Displays incident summary with status and severity
 */

import { Clock, User, Tag, ChevronRight } from 'lucide-react';
import type { Incident } from '../api/demoData';

interface IncidentCardProps {
  incident: Incident;
  onClick: (incident: Incident) => void;
}

const severityColors = {
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  informational: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
};

const statusColors = {
  open: { bg: 'bg-red-600', text: 'text-white' },
  investigating: { bg: 'bg-yellow-600', text: 'text-white' },
  contained: { bg: 'bg-blue-600', text: 'text-white' },
  eradicated: { bg: 'bg-purple-600', text: 'text-white' },
  recovered: { bg: 'bg-teal-600', text: 'text-white' },
  closed: { bg: 'bg-green-600', text: 'text-white' },
};

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function IncidentCard({ incident, onClick }: IncidentCardProps) {
  const severity = severityColors[incident.severity];
  const status = statusColors[incident.status];

  return (
    <div
      className={`glass-card rounded-xl p-4 border-l-4 ${severity.border} cursor-pointer hover:bg-gray-800/50 transition-all group`}
      onClick={() => onClick(incident)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severity.bg} ${severity.text}`}>
            {incident.severity.toUpperCase()}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.text}`}>
            {incident.status}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
      </div>

      <h3 className="text-white font-semibold mb-1 line-clamp-2 group-hover:text-primary-300 transition-colors">
        {incident.title}
      </h3>
      <p className="text-gray-500 text-sm mb-3">{incident.id}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Tag className="w-3 h-3" />
          <span>{incident.category}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{getTimeAgo(incident.createdAt)}</span>
        </div>
        {incident.assignee && incident.assignee !== 'Unassigned' && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{incident.assignee}</span>
          </div>
        )}
      </div>

      {incident.aiInsights && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">AI Risk Score</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${incident.aiInsights.riskScore >= 80 ? 'bg-red-500' : incident.aiInsights.riskScore >= 60 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                  style={{ width: `${incident.aiInsights.riskScore}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-white">{incident.aiInsights.riskScore}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
