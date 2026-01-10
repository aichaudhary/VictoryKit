import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  PlayCircle,
  FileText,
  Target,
  Activity,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { incidentApi } from '../services/api';
import { Incident } from '../types';
import toast from 'react-hot-toast';

export default function IncidentsPage() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: incidentsData, isLoading } = useQuery({
    queryKey: ['incidents', statusFilter, severityFilter],
    queryFn: () => {
      const params: Record<string, string | number | undefined> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      return incidentApi.getAll(params);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      incidentApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident status updated');
    },
  });

  // Demo data
  const demoIncidents: Incident[] = [
    {
      _id: 'INC-001',
      id: 'INC-001',
      title: 'Credential Stuffing Attack Detected',
      description: 'Large-scale credential stuffing attack from multiple IPs targeting login endpoint',
      severity: 'critical',
      status: 'active',
      type: 'credential_stuffing',
      attackType: 'credential_stuffing',
      sourceIPs: ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.10'],
      targetEndpoints: ['/api/auth/login', '/api/auth/signin'],
      requestCount: 45678,
      blockedCount: 42345,
      startTime: new Date(Date.now() - 3600000).toISOString(),
      detectionMethod: 'ml_classification',
      notes: [
        { author: 'System', content: 'Automated detection triggered', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { author: 'Admin', content: 'Escalated to security team', timestamp: new Date(Date.now() - 1800000).toISOString() },
      ],
    },
    {
      _id: 'INC-002',
      id: 'INC-002',
      title: 'High-Volume Scraping Activity',
      description: 'Aggressive content scraping detected from datacenter IP range',
      severity: 'high',
      status: 'investigating',
      type: 'scraping',
      attackType: 'scraping',
      sourceIPs: ['185.220.101.1', '185.220.101.2', '185.220.101.3'],
      targetEndpoints: ['/products/*', '/catalog/*', '/api/products'],
      requestCount: 89234,
      blockedCount: 67890,
      startTime: new Date(Date.now() - 7200000).toISOString(),
      detectionMethod: 'rate_limiting',
      notes: [
        { author: 'System', content: 'Rate limit threshold exceeded', timestamp: new Date(Date.now() - 7200000).toISOString() },
      ],
    },
    {
      _id: 'INC-003',
      id: 'INC-003',
      title: 'DDoS Attack Attempt',
      description: 'Distributed denial of service attack targeting main API endpoints',
      severity: 'critical',
      status: 'mitigated',
      type: 'ddos',
      attackType: 'ddos',
      sourceIPs: ['Multiple IPs (1,234 unique sources)'],
      targetEndpoints: ['/api/*', '/', '/health'],
      requestCount: 1234567,
      blockedCount: 1234000,
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date(Date.now() - 82800000).toISOString(),
      detectionMethod: 'behavioral_analysis',
      notes: [
        { author: 'System', content: 'DDoS protection activated', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { author: 'Admin', content: 'Attack mitigated, monitoring for recurrence', timestamp: new Date(Date.now() - 82800000).toISOString() },
      ],
    },
    {
      _id: 'INC-004',
      id: 'INC-004',
      title: 'Bot Farm Detection',
      description: 'Coordinated bot farm activity detected across multiple sessions',
      severity: 'medium',
      status: 'resolved',
      type: 'fraud',
      attackType: 'automation',
      sourceIPs: ['45.33.32.156', '45.33.32.157'],
      targetEndpoints: ['/api/checkout', '/api/cart'],
      requestCount: 12345,
      blockedCount: 11000,
      startTime: new Date(Date.now() - 172800000).toISOString(),
      endTime: new Date(Date.now() - 86400000).toISOString(),
      detectionMethod: 'fingerprinting',
      notes: [],
    },
  ];

  const incidents = incidentsData?.data || demoIncidents;

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical': return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: AlertTriangle };
      case 'high': return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: AlertTriangle };
      case 'medium': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', icon: Activity };
      default: return { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: CheckCircle };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-red-400', bg: 'bg-red-500/20', icon: PlayCircle };
      case 'investigating': return { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Eye };
      case 'mitigated': return { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Shield };
      case 'resolved': return { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/20', icon: Clock };
    }
  };

  const stats = {
    active: incidents.filter((i: Incident) => i.status === 'active').length,
    investigating: incidents.filter((i: Incident) => i.status === 'investigating').length,
    mitigated: incidents.filter((i: Incident) => i.status === 'mitigated').length,
    resolved: incidents.filter((i: Incident) => i.status === 'resolved').length,
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Incidents</h1>
          <p className="text-slate-400 mt-1">Security incident management and response</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active', value: stats.active, status: 'active' },
          { label: 'Investigating', value: stats.investigating, status: 'investigating' },
          { label: 'Mitigated', value: stats.mitigated, status: 'mitigated' },
          { label: 'Resolved', value: stats.resolved, status: 'resolved' },
        ].map((stat, i) => {
          const config = getStatusConfig(stat.status);
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-xl border ${config.bg} border-slate-700`}
            >
              <div className="flex items-center space-x-3">
                <config.icon size={24} className={config.color} />
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className={`text-sm ${config.color}`}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="investigating">Investigating</option>
          <option value="mitigated">Mitigated</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.map((incident: Incident) => {
          const severityConfig = getSeverityConfig(incident.severity);
          const statusConfig = getStatusConfig(incident.status);
          const isExpanded = expandedId === (incident.id || incident._id);

          return (
            <motion.div
              key={incident.id || incident._id}
              layout
              className={`bg-slate-800 rounded-xl border ${
                incident.status === 'active' ? 'border-red-500/50' : 'border-slate-700'
              } overflow-hidden`}
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(incident.id || incident._id)}
                className="p-4 cursor-pointer hover:bg-slate-700/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${severityConfig.bg}`}>
                      <severityConfig.icon size={20} className={severityConfig.color} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 text-sm font-mono">{incident.id || incident._id}</span>
                        <h3 className="text-white font-semibold">{incident.title}</h3>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">{incident.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${severityConfig.bg} ${severityConfig.color}`}>
                      {incident.severity}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusConfig.bg} ${statusConfig.color}`}>
                      {incident.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Target size={14} />
                    <span>{incident.attackType?.replace('_', ' ') || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Activity size={14} />
                    <span>{incident.requestCount?.toLocaleString() || '0'} requests</span>
                  </div>
                  <div className="flex items-center space-x-2 text-red-400">
                    <Shield size={14} />
                    <span>{incident.blockedCount?.toLocaleString() || '0'} blocked</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Clock size={14} />
                    <span>Started {new Date(incident.startTime || Date.now()).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-700"
                  >
                    <div className="p-4 space-y-4">
                      {/* Source IPs */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                          <Globe size={14} className="mr-2" />
                          Source IPs
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {incident.sourceIPs?.map((ip, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono">
                              {ip}
                            </span>
                          )) || <span className="text-slate-500">No source IPs</span>}
                        </div>
                      </div>

                      {/* Target Endpoints */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                          <Target size={14} className="mr-2" />
                          Target Endpoints
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {incident.targetEndpoints?.map((endpoint, i) => (
                            <span key={i} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-sm font-mono">
                              {endpoint}
                            </span>
                          )) || <span className="text-slate-500">No target endpoints</span>}
                        </div>
                      </div>

                      {/* Timeline / Notes */}
                      {incident.notes && incident.notes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                            <MessageSquare size={14} className="mr-2" />
                            Timeline
                          </h4>
                          <div className="space-y-2">
                            {incident.notes.map((note, i) => (
                              <div key={i} className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-lg">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white">{note.author}</span>
                                    <span className="text-xs text-slate-500">{new Date(note.timestamp).toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm text-slate-300 mt-1">{note.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-3 pt-4 border-t border-slate-700">
                        {incident.status === 'active' && (
                          <>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: incident.id || incident._id, status: 'investigating' })}
                              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                              <Eye size={16} />
                              <span>Investigate</span>
                            </button>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: incident.id || incident._id, status: 'mitigated' })}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                              <Shield size={16} />
                              <span>Mark Mitigated</span>
                            </button>
                          </>
                        )}
                        {incident.status === 'investigating' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: incident.id || incident._id, status: 'mitigated' })}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            <Shield size={16} />
                            <span>Mark Mitigated</span>
                          </button>
                        )}
                        {(incident.status === 'mitigated' || incident.status === 'investigating') && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: incident.id || incident._id, status: 'resolved' })}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            <CheckCircle size={16} />
                            <span>Resolve</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedIncident(incident)}
                          className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                        >
                          <FileText size={16} />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* No Incidents */}
      {incidents.length === 0 && !isLoading && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Shield size={48} className="mx-auto text-green-400 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No Active Incidents</h3>
          <p className="text-slate-400">All systems are operating normally with no detected security incidents.</p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedIncident(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-sm font-mono">{selectedIncident.id || selectedIncident._id}</span>
                    <h2 className="text-xl font-bold text-white">{selectedIncident.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="p-2 hover:bg-slate-700 rounded-lg"
                  >
                    <XCircle size={20} className="text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-slate-300">{selectedIncident.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-400">Attack Type</p>
                    <p className="text-white capitalize">{selectedIncident.attackType?.replace('_', ' ') || 'Unknown'}</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-400">Detection Method</p>
                    <p className="text-white capitalize">{selectedIncident.detectionMethod?.replace('_', ' ') || 'Unknown'}</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-400">Total Requests</p>
                    <p className="text-white">{selectedIncident.requestCount?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-400">Blocked</p>
                    <p className="text-red-400">{selectedIncident.blockedCount?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Source IPs</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.sourceIPs?.map((ip, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-700 text-slate-300 rounded font-mono text-sm">
                        {ip}
                      </span>
                    )) || <span className="text-slate-500">No source IPs</span>}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Target Endpoints</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.targetEndpoints?.map((ep, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded font-mono text-sm">
                        {ep}
                      </span>
                    )) || <span className="text-slate-500">No target endpoints</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
