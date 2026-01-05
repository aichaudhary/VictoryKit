import React, { useState } from 'react';
import { 
  AlertTriangle, Plus, Clock, Users, CheckCircle, 
  MessageSquare, Trash2, Activity
} from 'lucide-react';
import { DRIncident } from '../types';
import { formatDateTime, SEVERITY_COLORS } from '../constants';

interface IncidentsPanelProps {
  incidents: DRIncident[];
  onResolve: (id: string) => void;
  onAddUpdate: (id: string, update: string) => void;
}

const IncidentsPanel: React.FC<IncidentsPanelProps> = ({ 
  incidents, onResolve, onAddUpdate 
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [updateText, setUpdateText] = useState('');

  const filteredIncidents = incidents.filter(inc => 
    filterStatus === 'all' || inc.status === filterStatus
  );

  const handleAddUpdate = (id: string) => {
    if (updateText.trim()) {
      onAddUpdate(id, updateText);
      setUpdateText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Incidents</h2>
          <p className="text-slate-400">Track and manage disaster recovery incidents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
          <Plus className="w-4 h-4" />
          Declare Incident
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {['all', 'declared', 'responding', 'recovering', 'resolved', 'post_mortem'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filterStatus === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <div key={incident._id} className="bg-slate-800 rounded-xl border border-slate-700">
            {/* Header */}
            <div 
              className="p-6 cursor-pointer"
              onClick={() => setExpandedIncident(expandedIncident === incident._id ? null : incident._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    incident.severity === 'critical' ? 'bg-red-500' :
                    incident.severity === 'major' ? 'bg-orange-500' :
                    incident.severity === 'minor' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}>
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[incident.severity]}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        incident.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                        incident.status === 'recovering' ? 'bg-blue-500/20 text-blue-400' :
                        incident.status === 'responding' ? 'bg-yellow-500/20 text-yellow-400' :
                        incident.status === 'declared' ? 'bg-red-500/20 text-red-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1">{incident.description}</p>
                    
                    <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Declared: {formatDateTime(incident.timeline.declaredAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{incident.team.length} responders</span>
                      </div>
                      <span>{incident.affectedSystems.length} systems affected</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {incident.status !== 'resolved' && incident.status !== 'post_mortem' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onResolve(incident._id); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Timeline */}
            {expandedIncident === incident._id && (
              <div className="border-t border-slate-700 p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Timeline */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-4">TIMELINE</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-slate-400">Declared:</span>
                        <span className="text-white">{formatDateTime(incident.timeline.declaredAt)}</span>
                      </div>
                      {incident.timeline.respondedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-slate-400">Response started:</span>
                          <span className="text-white">{formatDateTime(incident.timeline.respondedAt)}</span>
                        </div>
                      )}
                      {incident.timeline.recoveredAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-slate-400">Recovery started:</span>
                          <span className="text-white">{formatDateTime(incident.timeline.recoveredAt)}</span>
                        </div>
                      )}
                      {incident.timeline.resolvedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-slate-400">Resolved:</span>
                          <span className="text-white">{formatDateTime(incident.timeline.resolvedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Updates */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-4">UPDATES</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {incident.updates.map((update, idx) => (
                        <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{update.author}</span>
                            <span className="text-xs text-slate-500">{formatDateTime(update.timestamp)}</span>
                          </div>
                          <p className="text-sm text-slate-400">{update.message}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Update */}
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={updateText}
                        onChange={(e) => setUpdateText(e.target.value)}
                        placeholder="Add an update..."
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddUpdate(incident._id); }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No incidents found</p>
        </div>
      )}
    </div>
  );
};

export default IncidentsPanel;
