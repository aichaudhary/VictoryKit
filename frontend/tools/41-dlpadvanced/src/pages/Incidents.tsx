/**
 * Incidents Page
 * View, investigate, and respond to DLP incidents
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, User, FileText, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getIncidents, respondToIncident, resolveIncident } from '../services/api';

const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [responseNote, setResponseNote] = useState('');

  useEffect(() => {
    loadIncidents();
  }, [filter]);

  const loadIncidents = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await getIncidents(params);
      setIncidents(response.data || []);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (action: string) => {
    if (!selectedIncident) return;

    try {
      await respondToIncident(selectedIncident.incidentId, {
        action,
        note: responseNote,
        assignedTo: 'current-user', // Would come from auth context
      });
      setResponseNote('');
      loadIncidents();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to respond to incident:', error);
      alert('Failed to respond to incident');
    }
  };

  const handleResolve = async () => {
    if (!selectedIncident) return;

    try {
      await resolveIncident(selectedIncident.incidentId, {
        resolution: responseNote,
        resolvedBy: 'current-user',
      });
      setResponseNote('');
      loadIncidents();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      alert('Failed to resolve incident');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'investigating': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'resolved': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'false_positive': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      case 'escalated': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dlp-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dlp-darker via-dlp-dark to-dlp-darker p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Incidents & Violations</h1>
        <p className="text-gray-400">Monitor and respond to security incidents</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-8">
        {['all', 'open', 'investigating', 'resolved', 'escalated'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-dlp-primary to-dlp-accent text-white shadow-glow-blue'
                : 'bg-dlp-dark text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total</p>
          <p className="text-3xl font-bold text-white">{incidents.length}</p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-red-500/20">
          <p className="text-gray-400 text-sm mb-1">Open</p>
          <p className="text-3xl font-bold text-red-400">
            {incidents.filter(i => i.status === 'open').length}
          </p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-yellow-500/20">
          <p className="text-gray-400 text-sm mb-1">Investigating</p>
          <p className="text-3xl font-bold text-yellow-400">
            {incidents.filter(i => i.status === 'investigating').length}
          </p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-orange-500/20">
          <p className="text-gray-400 text-sm mb-1">Escalated</p>
          <p className="text-3xl font-bold text-orange-400">
            {incidents.filter(i => i.status === 'escalated').length}
          </p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-green-500/20">
          <p className="text-gray-400 text-sm mb-1">Resolved</p>
          <p className="text-3xl font-bold text-green-400">
            {incidents.filter(i => i.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">All Incidents</h2>

        <div className="space-y-4">
          {incidents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No incidents found</p>
              <p className="text-sm">All clear for the selected filter</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident.incidentId}
                onClick={() => {
                  setSelectedIncident(incident);
                  setShowDetailModal(true);
                }}
                className="bg-dlp-darker/50 rounded-lg p-6 border border-gray-700/50 hover:border-dlp-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(incident.severity)}`}></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-white">
                          {incident.policyViolated?.policyName || 'Policy Violation'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)} text-white`}>
                          {incident.severity}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                          {incident.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{incident.user?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <FileText className="w-4 h-4" />
                          <span>{incident.data?.type || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{incident.destination || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(incident.action?.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {incident.data?.preview && (
                        <div className="mt-3 p-3 bg-dlp-darker rounded-lg border border-gray-700">
                          <p className="text-xs text-gray-500 mb-1">Data Preview:</p>
                          <p className="text-sm text-gray-300 truncate">{incident.data.preview}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    incident.action?.blocked 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {incident.action?.blocked ? 'Blocked' : 'Alerted'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedIncident && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-dlp-dark rounded-2xl p-8 border border-gray-700 max-w-4xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Incident Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Policy Information */}
              <div className="bg-dlp-darker rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3">Policy Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Policy Name</p>
                    <p className="text-white">{selectedIncident.policyViolated?.policyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Framework</p>
                    <p className="text-white">{selectedIncident.policyViolated?.framework}</p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-dlp-darker rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3">User Information</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white">{selectedIncident.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Department</p>
                    <p className="text-white">{selectedIncident.user?.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Risk Score</p>
                    <p className="text-orange-400 font-semibold">{selectedIncident.user?.riskScore}/100</p>
                  </div>
                </div>
              </div>

              {/* Data Information */}
              <div className="bg-dlp-darker rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3">Data Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="text-white">{selectedIncident.data?.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Classification</p>
                    <p className="text-white">{selectedIncident.data?.classification}</p>
                  </div>
                </div>
                {selectedIncident.data?.preview && (
                  <div className="mt-3 p-3 bg-dlp-dark rounded border border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Preview:</p>
                    <p className="text-sm text-gray-300">{selectedIncident.data.preview}</p>
                  </div>
                )}
              </div>

              {/* Response Actions */}
              <div className="bg-dlp-darker rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3">Response</h4>
                <textarea
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="w-full px-4 py-3 bg-dlp-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-dlp-primary mb-4"
                  rows={4}
                  placeholder="Add investigation notes or resolution details..."
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRespond('investigate')}
                    className="px-6 py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-all"
                  >
                    Mark Investigating
                  </button>
                  <button
                    onClick={() => handleRespond('escalate')}
                    className="px-6 py-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-all"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={handleResolve}
                    className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
