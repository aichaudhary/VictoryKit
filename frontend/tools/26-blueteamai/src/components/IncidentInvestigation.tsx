import React from 'react';
import { 
  FileSearch, Clock, User, Link, Server, 
  AlertTriangle, FileText 
} from 'lucide-react';
import { Incident, IOC } from '../types';
import { SEVERITY_COLORS, INCIDENT_STATUS_COLORS } from '../constants';

interface IncidentInvestigationProps {
  incident: Incident | null;
  onAddNote: (note: string) => void;
  onUpdateStatus: (status: Incident['status']) => void;
  onAddIOC: (ioc: IOC) => void;
}

const IncidentInvestigation: React.FC<IncidentInvestigationProps> = ({
  incident,
  onAddNote,
  onUpdateStatus,
  onAddIOC
}) => {
  const [activeTab, setActiveTab] = React.useState<'timeline' | 'iocs' | 'mitre' | 'notes'>('timeline');
  const [noteInput, setNoteInput] = React.useState('');

  if (!incident) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900/50 rounded-xl border border-white/10">
        <div className="text-center text-gray-500">
          <FileSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No Incident Selected</p>
          <p className="text-sm">Select an incident to begin investigation</p>
        </div>
      </div>
    );
  }

  const handleAddNote = () => {
    if (noteInput.trim()) {
      onAddNote(noteInput);
      setNoteInput('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-xl border border-white/10">
      {/* Incident Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${SEVERITY_COLORS[incident.severity].bg} ${SEVERITY_COLORS[incident.severity].text}`}>
                {incident.severity.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${INCIDENT_STATUS_COLORS[incident.status].bg} ${INCIDENT_STATUS_COLORS[incident.status].text}`}>
                {incident.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">#{incident.id}</span>
            </div>
            <h2 className="text-lg font-bold text-white">{incident.title}</h2>
          </div>
          
          <div className="flex gap-2">
            <select 
              value={incident.status}
              onChange={(e) => onUpdateStatus(e.target.value as Incident['status'])}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="contained">Contained</option>
              <option value="eradicated">Eradicated</option>
              <option value="recovered">Recovered</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mb-3">{incident.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Created: {new Date(incident.created_at).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {incident.assigned_to.join(', ') || 'Unassigned'}
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {incident.related_alerts.length} Related Alerts
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'iocs', label: 'IOCs', icon: Link },
          { id: 'mitre', label: 'MITRE ATT&CK', icon: Server },
          { id: 'notes', label: 'Notes', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {incident.timeline.map((event, idx) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    event.event_type === 'detection' ? 'bg-red-500' :
                    event.event_type === 'containment' ? 'bg-blue-500' :
                    event.event_type === 'eradication' ? 'bg-yellow-500' :
                    event.event_type === 'recovery' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`} />
                  {idx < incident.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-white/10 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400">{event.event_type}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white">{event.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'iocs' && (
          <div className="space-y-2">
            {incident.iocs.map((ioc) => (
              <div key={ioc.value} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                    {ioc.type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    ioc.confidence > 80 ? 'bg-red-500/20 text-red-400' :
                    ioc.confidence > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ioc.confidence}% confidence
                  </span>
                </div>
                <code className="text-sm text-white font-mono">{ioc.value}</code>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>First: {new Date(ioc.first_seen).toLocaleDateString()}</span>
                  <span>Last: {new Date(ioc.last_seen).toLocaleDateString()}</span>
                  {ioc.threat_type && <span className="text-orange-400">{ioc.threat_type}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mitre' && (
          <div className="space-y-2">
            {incident.mitre_techniques.map((technique) => (
              <div key={technique.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">
                    {technique.id}
                  </span>
                  <span className="text-sm font-medium text-white">{technique.name}</span>
                </div>
                <span className="text-xs text-purple-400">{technique.tactic}</span>
                {technique.description && (
                  <p className="text-xs text-gray-400 mt-2">{technique.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add investigation note..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button 
                onClick={handleAddNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Add Note
              </button>
            </div>
            
            {incident.notes.map((note) => (
              <div key={note.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">{new Date(note.timestamp).toLocaleString()}</span>
                  <span className="text-xs text-blue-400">@{note.author}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    note.type === 'finding' ? 'bg-yellow-500/20 text-yellow-400' :
                    note.type === 'action' ? 'bg-green-500/20 text-green-400' :
                    note.type === 'recommendation' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {note.type}
                  </span>
                </div>
                <p className="text-sm text-white">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentInvestigation;
