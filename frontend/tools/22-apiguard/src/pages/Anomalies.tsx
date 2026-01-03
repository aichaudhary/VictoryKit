import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  Server,
  Globe,
  Activity,
  Zap,
  Eye,
  Check,
  RefreshCw,
  Shield,
  AlertCircle,
  Bell,
  BellOff,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';

// Local types for anomaly data
interface AnomalyDetails {
  baseline?: number;
  current?: number;
  unit?: string;
  confidence: number;
  sourceIPs?: string[];
  newFields?: string[];
}

interface LocalAnomaly {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  description: string;
  detectedAt: string;
  apiId: string;
  apiName: string;
  endpoint: string;
  details: AnomalyDetails;
  indicators: string[];
  affectedResources: string[];
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  dismissReason?: string;
  dismissedBy?: string;
  dismissedAt?: string;
}

// Mock anomalies data
const mockAnomalies: LocalAnomaly[] = [
  {
    id: 'anomaly-1',
    type: 'traffic_spike',
    severity: 'high',
    status: 'active',
    description: 'Traffic spike detected: 500% increase in requests to /api/v1/users endpoint',
    detectedAt: '2024-03-12T11:30:00Z',
    apiId: 'api-1',
    apiName: 'User Management API',
    endpoint: '/api/v1/users',
    details: {
      baseline: 50,
      current: 300,
      unit: 'requests/min',
      confidence: 0.95,
    },
    indicators: [
      'Unusual request volume from single IP range',
      'Pattern matches known scraping behavior',
      'Peak hours mismatch',
    ],
    affectedResources: ['User data', 'Database connections', 'Rate limits'],
  },
  {
    id: 'anomaly-2',
    type: 'auth_failure',
    severity: 'critical',
    status: 'investigating',
    description: 'Brute force attack detected: 847 failed authentication attempts in 5 minutes',
    detectedAt: '2024-03-12T11:15:00Z',
    apiId: 'api-1',
    apiName: 'User Management API',
    endpoint: '/api/v1/auth/login',
    details: {
      baseline: 5,
      current: 847,
      unit: 'failed attempts',
      confidence: 0.99,
      sourceIPs: ['192.168.1.100', '192.168.1.101', '192.168.1.102'],
    },
    indicators: [
      'Multiple failed attempts from same IP range',
      'Sequential password patterns detected',
      'Known attack vector signature',
    ],
    affectedResources: ['User accounts', 'Authentication service'],
  },
  {
    id: 'anomaly-3',
    type: 'latency_anomaly',
    severity: 'medium',
    status: 'active',
    description: 'Unusual latency pattern: P99 latency increased from 200ms to 1.2s',
    detectedAt: '2024-03-12T10:45:00Z',
    apiId: 'api-3',
    apiName: 'Product Catalog GraphQL',
    endpoint: '/graphql',
    details: {
      baseline: 200,
      current: 1200,
      unit: 'ms (P99)',
      confidence: 0.87,
    },
    indicators: [
      'Deep nested query patterns',
      'N+1 query pattern detected',
      'Database query timeout warnings',
    ],
    affectedResources: ['Database', 'Response times', 'User experience'],
  },
  {
    id: 'anomaly-4',
    type: 'data_exfiltration',
    severity: 'critical',
    status: 'resolved',
    description: 'Potential data exfiltration: Large response payloads to unusual destination',
    detectedAt: '2024-03-12T09:30:00Z',
    resolvedAt: '2024-03-12T10:00:00Z',
    resolvedBy: 'security@company.com',
    resolution: 'False positive - legitimate bulk export by authorized service account',
    apiId: 'api-5',
    apiName: 'Legacy Orders API',
    endpoint: '/api/orders/export',
    details: {
      baseline: 100,
      current: 50000,
      unit: 'records/request',
      confidence: 0.92,
    },
    indicators: ['Unusually large response size', 'New destination IP'],
    affectedResources: ['Order data', 'Customer PII'],
  },
  {
    id: 'anomaly-5',
    type: 'error_spike',
    severity: 'high',
    status: 'active',
    description: 'Error rate spike: 500 errors increased from 0.1% to 15%',
    detectedAt: '2024-03-12T08:00:00Z',
    apiId: 'api-2',
    apiName: 'Payment Gateway',
    endpoint: '/api/v1/payments/process',
    details: {
      baseline: 0.1,
      current: 15,
      unit: '% error rate',
      confidence: 0.98,
    },
    indicators: [
      'Upstream service timeout',
      'Database connection pool exhausted',
      'Payment processor API returning 503',
    ],
    affectedResources: ['Payment processing', 'Revenue', 'Customer transactions'],
  },
  {
    id: 'anomaly-6',
    type: 'schema_violation',
    severity: 'low',
    status: 'dismissed',
    description: 'Schema drift detected: New undocumented field in response payload',
    detectedAt: '2024-03-11T16:00:00Z',
    dismissedAt: '2024-03-11T17:00:00Z',
    dismissedBy: 'dev@company.com',
    dismissReason: 'New feature deployment - schema update pending',
    apiId: 'api-4',
    apiName: 'Real-time Notifications',
    endpoint: '/api/notifications/settings',
    details: {
      newFields: ['preference_v2', 'notification_channels'],
      confidence: 0.75,
    },
    indicators: ['Response structure changed', 'Breaking change potential'],
    affectedResources: ['API consumers', 'Documentation'],
  },
];

const anomalyTypeIcons: Record<string, React.ElementType> = {
  traffic_spike: Activity,
  auth_failure: Shield,
  latency_anomaly: Clock,
  data_exfiltration: Globe,
  error_spike: AlertCircle,
  schema_violation: Server,
};

const severityColors: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/20 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  low: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
};

const statusColors: Record<string, string> = {
  active: 'text-red-400 bg-red-500/20',
  investigating: 'text-yellow-400 bg-yellow-500/20',
  resolved: 'text-green-400 bg-green-500/20',
  dismissed: 'text-gray-400 bg-gray-500/20',
};

export default function Anomalies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);

  const filteredAnomalies = mockAnomalies.filter((anomaly) => {
    const matchesSearch =
      anomaly.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anomaly.apiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anomaly.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || anomaly.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || anomaly.status === statusFilter;
    const matchesType = typeFilter === 'all' || anomaly.type === typeFilter;
    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const anomalyTypes = [...new Set(mockAnomalies.map((a) => a.type))];

  const stats = {
    total: mockAnomalies.length,
    active: mockAnomalies.filter((a) => a.status === 'active').length,
    critical: mockAnomalies.filter((a) => a.severity === 'critical').length,
    investigating: mockAnomalies.filter((a) => a.status === 'investigating').length,
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Anomaly Detection</h2>
          <p className="text-api-muted mt-1">ML-powered anomaly detection and analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="api-btn bg-api-dark text-api-muted flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Configure Alerts
          </button>
          <button className="api-btn api-btn-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-api-primary/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-api-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-api-muted">Total Anomalies</p>
            </div>
          </div>
        </div>
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-xs text-api-muted">Active</p>
            </div>
          </div>
        </div>
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.critical}</p>
              <p className="text-xs text-api-muted">Critical</p>
            </div>
          </div>
        </div>
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.investigating}</p>
              <p className="text-xs text-api-muted">Investigating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="api-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-api-muted" />
            <input
              type="text"
              placeholder="Search anomalies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="api-input w-full pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'api-btn flex items-center gap-2',
              showFilters ? 'bg-api-primary text-white' : 'bg-api-dark text-api-muted'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={clsx('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-4 mt-4 border-t border-api-border grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-xs text-api-muted mb-1">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="api-input w-full"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-api-muted mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="api-input w-full"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-api-muted mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="api-input w-full"
              >
                <option value="all">All Types</option>
                {anomalyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.map((anomaly, index) => {
          const TypeIcon = anomalyTypeIcons[anomaly.type] || AlertTriangle;
          const isExpanded = expandedAnomaly === anomaly.id;

          return (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                'api-card overflow-hidden transition-colors',
                anomaly.status === 'active' && 'border-l-4 border-l-red-500',
                anomaly.status === 'investigating' && 'border-l-4 border-l-yellow-500'
              )}
            >
              {/* Main Row */}
              <div
                className="p-5 cursor-pointer hover:bg-api-dark/30 transition-colors"
                onClick={() => setExpandedAnomaly(isExpanded ? null : anomaly.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className={clsx(
                    'p-3 rounded-lg',
                    severityColors[anomaly.severity]
                  )}>
                    <TypeIcon className="w-5 h-5" />
                  </div>

                  {/* Anomaly Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={clsx(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            statusColors[anomaly.status]
                          )}>
                            {anomaly.status}
                          </span>
                          <span className={clsx(
                            'px-2 py-0.5 text-xs font-medium rounded border capitalize',
                            severityColors[anomaly.severity]
                          )}>
                            {anomaly.severity}
                          </span>
                        </div>
                        <p className="text-white font-medium mt-2">{anomaly.description}</p>
                      </div>

                      <button className="p-1 text-api-muted">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-api-muted">
                      <span className="flex items-center gap-1">
                        <Server className="w-4 h-4" />
                        {anomaly.apiName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {anomaly.endpoint}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(anomaly.detectedAt)}
                      </span>
                      {anomaly.details?.confidence && (
                        <span className="px-2 py-0.5 bg-api-dark rounded">
                          {Math.round(anomaly.details.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
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
                    className="border-t border-api-border overflow-hidden"
                  >
                    <div className="p-5 bg-api-dark/30 space-y-5">
                      {/* Metrics */}
                      {anomaly.details && (
                        <div>
                          <h4 className="text-sm font-medium text-white mb-3">Metrics</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {anomaly.details.baseline !== undefined && (
                              <div className="p-3 bg-api-card rounded-lg border border-api-border">
                                <p className="text-xs text-api-muted mb-1">Baseline</p>
                                <p className="text-lg font-bold text-white">
                                  {anomaly.details.baseline}
                                  <span className="text-xs text-api-muted ml-1">
                                    {anomaly.details.unit}
                                  </span>
                                </p>
                              </div>
                            )}
                            {anomaly.details.current !== undefined && (
                              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                <p className="text-xs text-api-muted mb-1">Current</p>
                                <p className="text-lg font-bold text-red-400">
                                  {anomaly.details.current}
                                  <span className="text-xs text-api-muted ml-1">
                                    {anomaly.details.unit}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Indicators */}
                      {anomaly.indicators && anomaly.indicators.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-white mb-3">Indicators</h4>
                          <ul className="space-y-2">
                            {anomaly.indicators.map((indicator, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-api-muted">
                                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Affected Resources */}
                      {anomaly.affectedResources && anomaly.affectedResources.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-white mb-3">Affected Resources</h4>
                          <div className="flex flex-wrap gap-2">
                            {anomaly.affectedResources.map((resource, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-api-dark rounded-full text-sm text-api-muted"
                              >
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolution Info */}
                      {anomaly.status === 'resolved' && anomaly.resolution && (
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <h4 className="text-sm font-medium text-green-400 mb-2">Resolution</h4>
                          <p className="text-sm text-api-muted">{anomaly.resolution}</p>
                          {anomaly.resolvedBy && (
                            <p className="text-xs text-api-muted mt-2">
                              Resolved by {anomaly.resolvedBy} on {new Date(anomaly.resolvedAt!).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {anomaly.status === 'dismissed' && anomaly.dismissReason && (
                        <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Dismissed</h4>
                          <p className="text-sm text-api-muted">{anomaly.dismissReason}</p>
                          {anomaly.dismissedBy && (
                            <p className="text-xs text-api-muted mt-2">
                              Dismissed by {anomaly.dismissedBy}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      {(anomaly.status === 'active' || anomaly.status === 'investigating') && (
                        <div className="flex items-center gap-3 pt-2">
                          <button className="api-btn api-btn-primary text-sm flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Investigate
                          </button>
                          <button className="api-btn bg-green-500/20 text-green-400 border border-green-500/30 text-sm flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Mark Resolved
                          </button>
                          <button className="api-btn bg-api-dark text-api-muted text-sm flex items-center gap-2">
                            <BellOff className="w-4 h-4" />
                            Dismiss
                          </button>
                          <button className="api-btn bg-api-dark text-api-muted text-sm flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Create Incident
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAnomalies.length === 0 && (
        <div className="api-card p-12 text-center">
          <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No anomalies detected</h3>
          <p className="text-api-muted">
            {searchQuery || severityFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'All systems are operating normally'}
          </p>
        </div>
      )}
    </div>
  );
}
