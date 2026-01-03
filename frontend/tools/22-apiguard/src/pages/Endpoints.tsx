import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Shield,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  Check,
  GitBranch as Route,
} from 'lucide-react';
import clsx from 'clsx';
import type { Endpoint } from '../types';

const methodColors: Record<string, string> = {
  GET: 'method-get',
  POST: 'method-post',
  PUT: 'method-put',
  PATCH: 'method-patch',
  DELETE: 'method-delete',
};

// Mock endpoints data
const mockEndpoints: (Endpoint & { apiName: string })[] = [
  {
    id: 'ep-1',
    apiId: 'api-1',
    apiName: 'User Management API',
    path: '/users',
    method: 'GET',
    description: 'List all users with pagination and filtering',
    parameters: [
      { name: 'page', location: 'query', type: 'integer', required: false },
      { name: 'limit', location: 'query', type: 'integer', required: false },
      { name: 'status', location: 'query', type: 'string', required: false },
    ],
    securityScore: 98,
    vulnerabilities: [],
    statistics: { requestsLast24h: 145230, averageLatency: 45, errorRate: 0.1 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'ep-2',
    apiId: 'api-1',
    apiName: 'User Management API',
    path: '/users/:id',
    method: 'GET',
    description: 'Get user by ID with full profile details',
    parameters: [
      { name: 'id', location: 'path', type: 'string', required: true },
    ],
    securityScore: 96,
    vulnerabilities: [],
    statistics: { requestsLast24h: 228450, averageLatency: 32, errorRate: 0.05 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'ep-3',
    apiId: 'api-1',
    apiName: 'User Management API',
    path: '/users',
    method: 'POST',
    description: 'Create new user account',
    parameters: [],
    requestSchema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } },
    securityScore: 82,
    vulnerabilities: [
      { severity: 'medium', description: 'Missing request body size limit' },
      { severity: 'low', description: 'Password complexity not enforced' },
    ],
    statistics: { requestsLast24h: 18320, averageLatency: 156, errorRate: 2.3 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'ep-4',
    apiId: 'api-2',
    apiName: 'Payment Gateway',
    path: '/payments',
    method: 'POST',
    description: 'Process payment transaction',
    parameters: [],
    requestSchema: { type: 'object', properties: { amount: { type: 'number' }, currency: { type: 'string' } } },
    securityScore: 95,
    vulnerabilities: [],
    statistics: { requestsLast24h: 89420, averageLatency: 234, errorRate: 0.8 },
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-10T16:45:00Z',
  },
  {
    id: 'ep-5',
    apiId: 'api-2',
    apiName: 'Payment Gateway',
    path: '/payments/:id/refund',
    method: 'POST',
    description: 'Initiate payment refund',
    parameters: [
      { name: 'id', location: 'path', type: 'string', required: true },
    ],
    securityScore: 78,
    vulnerabilities: [
      { severity: 'high', description: 'Missing authorization check for refund amount' },
    ],
    statistics: { requestsLast24h: 1245, averageLatency: 312, errorRate: 1.5 },
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-10T16:45:00Z',
  },
  {
    id: 'ep-6',
    apiId: 'api-3',
    apiName: 'Product Catalog GraphQL',
    path: '/graphql',
    method: 'POST',
    description: 'GraphQL endpoint for product queries',
    parameters: [],
    securityScore: 72,
    vulnerabilities: [
      { severity: 'medium', description: 'Query depth not limited' },
      { severity: 'medium', description: 'Introspection enabled in production' },
    ],
    statistics: { requestsLast24h: 342560, averageLatency: 89, errorRate: 0.3 },
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-03-05T10:15:00Z',
  },
  {
    id: 'ep-7',
    apiId: 'api-4',
    apiName: 'Real-time Notifications',
    path: '/ws/connect',
    method: 'GET',
    description: 'WebSocket connection endpoint',
    parameters: [
      { name: 'token', location: 'query', type: 'string', required: true },
    ],
    securityScore: 85,
    vulnerabilities: [
      { severity: 'low', description: 'WebSocket ping/pong timeout not configured' },
    ],
    statistics: { requestsLast24h: 45230, averageLatency: 12, errorRate: 0.1 },
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-03-08T12:00:00Z',
  },
  {
    id: 'ep-8',
    apiId: 'api-5',
    apiName: 'Legacy Orders API',
    path: '/orders/create',
    method: 'POST',
    description: 'Create new order (legacy SOAP endpoint)',
    parameters: [],
    securityScore: 42,
    vulnerabilities: [
      { severity: 'critical', description: 'SQL injection vulnerability detected' },
      { severity: 'high', description: 'No input sanitization' },
      { severity: 'medium', description: 'SOAP headers not validated' },
    ],
    statistics: { requestsLast24h: 3420, averageLatency: 567, errorRate: 4.2 },
    createdAt: '2022-06-01T10:00:00Z',
    updatedAt: '2023-12-15T09:30:00Z',
  },
  {
    id: 'ep-9',
    apiId: 'api-1',
    apiName: 'User Management API',
    path: '/users/:id',
    method: 'DELETE',
    description: 'Delete user account permanently',
    parameters: [
      { name: 'id', location: 'path', type: 'string', required: true },
    ],
    securityScore: 88,
    vulnerabilities: [
      { severity: 'medium', description: 'Missing soft-delete option' },
    ],
    statistics: { requestsLast24h: 245, averageLatency: 89, errorRate: 1.2 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'ep-10',
    apiId: 'api-6',
    apiName: 'Analytics Service',
    path: '/analytics.AnalyticsService/GetMetrics',
    method: 'POST',
    description: 'gRPC method for fetching metrics',
    parameters: [],
    securityScore: 91,
    vulnerabilities: [],
    statistics: { requestsLast24h: 567890, averageLatency: 15, errorRate: 0.02 },
    createdAt: '2024-03-01T14:00:00Z',
    updatedAt: '2024-03-12T17:00:00Z',
  },
];

export default function Endpoints() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    method: '' as string,
    minScore: '' as string,
    hasVulnerabilities: '' as string,
  });
  const [sortBy, setSortBy] = useState<'path' | 'score' | 'requests' | 'latency'>('requests');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const endpoints = mockEndpoints;

  // Filter and sort endpoints
  const filteredEndpoints = useMemo(() => {
    let result = endpoints.filter((endpoint) => {
      const matchesSearch =
        searchQuery === '' ||
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.apiName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMethod = !filters.method || endpoint.method === filters.method;
      const matchesScore = !filters.minScore || (endpoint.securityScore ?? 0) >= parseInt(filters.minScore);
      const matchesVulnerabilities =
        !filters.hasVulnerabilities ||
        (filters.hasVulnerabilities === 'yes' && (endpoint.vulnerabilities?.length || 0) > 0) ||
        (filters.hasVulnerabilities === 'no' && (endpoint.vulnerabilities?.length || 0) === 0);

      return matchesSearch && matchesMethod && matchesScore && matchesVulnerabilities;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'path':
          comparison = a.path.localeCompare(b.path);
          break;
        case 'score':
          comparison = (a.securityScore ?? 0) - (b.securityScore ?? 0);
          break;
        case 'requests':
          comparison = (a.statistics?.requestsLast24h || 0) - (b.statistics?.requestsLast24h || 0);
          break;
        case 'latency':
          comparison = (a.statistics?.averageLatency || 0) - (b.statistics?.averageLatency || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [endpoints, searchQuery, filters, sortBy, sortOrder]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const clearFilters = () => {
    setFilters({ method: '', minScore: '', hasVulnerabilities: '' });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.method || filters.minScore || filters.hasVulnerabilities || searchQuery;

  // Stats
  const totalEndpoints = endpoints.length;
  const avgSecurityScore = Math.round(endpoints.reduce((sum, ep) => sum + (ep.securityScore ?? 0), 0) / endpoints.length);
  const totalVulnerabilities = endpoints.reduce((sum, ep) => sum + (ep.vulnerabilities?.length || 0), 0);
  const totalRequests = endpoints.reduce((sum, ep) => sum + (ep.statistics?.requestsLast24h || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Endpoints</h2>
          <p className="text-api-muted mt-1">
            {filteredEndpoints.length} of {totalEndpoints} endpoints
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Route className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalEndpoints}</p>
              <p className="text-sm text-api-muted">Total Endpoints</p>
            </div>
          </div>
        </div>

        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgSecurityScore}%</p>
              <p className="text-sm text-api-muted">Avg Security</p>
            </div>
          </div>
        </div>

        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalVulnerabilities}</p>
              <p className="text-sm text-api-muted">Vulnerabilities</p>
            </div>
          </div>
        </div>

        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatNumber(totalRequests)}</p>
              <p className="text-sm text-api-muted">Requests/24h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="api-card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-api-muted" />
            <input
              type="text"
              placeholder="Search by path, description, or API name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="api-input pl-10 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'api-btn flex items-center gap-2',
                showFilters ? 'bg-api-primary text-white' : 'bg-api-dark text-api-muted'
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-api-primary rounded-full" />}
            </button>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="api-input"
            >
              <option value="requests-desc">Most Requests</option>
              <option value="requests-asc">Least Requests</option>
              <option value="score-desc">Highest Score</option>
              <option value="score-asc">Lowest Score</option>
              <option value="latency-asc">Fastest</option>
              <option value="latency-desc">Slowest</option>
              <option value="path-asc">Path A-Z</option>
              <option value="path-desc">Path Z-A</option>
            </select>
          </div>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-api-border grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-api-muted mb-1">HTTP Method</label>
                  <select
                    value={filters.method}
                    onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                    className="api-input w-full"
                  >
                    <option value="">All Methods</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-api-muted mb-1">Min Security Score</label>
                  <select
                    value={filters.minScore}
                    onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                    className="api-input w-full"
                  >
                    <option value="">Any Score</option>
                    <option value="90">90+</option>
                    <option value="80">80+</option>
                    <option value="70">70+</option>
                    <option value="60">60+</option>
                    <option value="50">50+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-api-muted mb-1">Vulnerabilities</label>
                  <select
                    value={filters.hasVulnerabilities}
                    onChange={(e) => setFilters({ ...filters, hasVulnerabilities: e.target.value })}
                    className="api-input w-full"
                  >
                    <option value="">All</option>
                    <option value="yes">Has Vulnerabilities</option>
                    <option value="no">No Vulnerabilities</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="api-btn bg-api-dark text-api-muted hover:text-white"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Endpoints List */}
      {filteredEndpoints.length === 0 ? (
        <div className="api-card p-12 text-center">
          <Route className="w-12 h-12 text-api-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Endpoints Found</h3>
          <p className="text-api-muted mb-4">
            {hasActiveFilters
              ? 'No endpoints match your current filters.'
              : 'No endpoints registered yet.'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="api-btn api-btn-secondary">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEndpoints.map((endpoint, index) => (
            <motion.div
              key={endpoint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="api-card overflow-hidden"
            >
              {/* Main Row */}
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-api-dark/30 transition-colors"
                onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id ?? null)}
              >
                {/* Method Badge */}
                <span className={clsx('px-3 py-1 text-xs font-bold rounded min-w-[70px] text-center', methodColors[endpoint.method])}>
                  {endpoint.method}
                </span>

                {/* Path and API */}
                <div className="flex-1 min-w-0">
                  <code className="text-sm text-white font-medium">{endpoint.path}</code>
                  <p className="text-xs text-api-muted mt-0.5 truncate">{endpoint.apiName}</p>
                </div>

                {/* Description (hidden on mobile) */}
                <div className="hidden lg:block flex-1 min-w-0">
                  <p className="text-sm text-api-muted truncate">{endpoint.description}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6">
                  {/* Security Score */}
                  <div className="text-center">
                    <p className={clsx(
                      'text-sm font-medium',
                      (endpoint.securityScore ?? 0) >= 90 ? 'text-green-400' :
                      (endpoint.securityScore ?? 0) >= 70 ? 'text-yellow-400' :
                      (endpoint.securityScore ?? 0) >= 50 ? 'text-orange-400' :
                      'text-red-400'
                    )}>
                      {endpoint.securityScore ?? 0}%
                    </p>
                    <p className="text-xs text-api-muted">Score</p>
                  </div>

                  {/* Requests */}
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-medium text-white">
                      {formatNumber(endpoint.statistics?.requestsLast24h || 0)}
                    </p>
                    <p className="text-xs text-api-muted">Requests</p>
                  </div>

                  {/* Latency */}
                  <div className="text-center min-w-[50px]">
                    <p className="text-sm font-medium text-white">
                      {endpoint.statistics?.averageLatency || 0}ms
                    </p>
                    <p className="text-xs text-api-muted">Latency</p>
                  </div>

                  {/* Vulnerabilities */}
                  <div className="text-center min-w-[40px]">
                    {endpoint.vulnerabilities && endpoint.vulnerabilities.length > 0 ? (
                      <span className="flex items-center gap-1 text-sm text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        {endpoint.vulnerabilities.length}
                      </span>
                    ) : (
                      <span className="text-sm text-green-400">
                        <Check className="w-4 h-4 mx-auto" />
                      </span>
                    )}
                    <p className="text-xs text-api-muted">Issues</p>
                  </div>
                </div>

                {/* Expand Button */}
                <button className="p-2 hover:bg-api-dark rounded-lg text-api-muted">
                  {expandedEndpoint === endpoint.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedEndpoint === endpoint.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-api-border overflow-hidden"
                  >
                    <div className="p-4 bg-api-dark/30 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">Description</h4>
                        <p className="text-sm text-api-muted">{endpoint.description}</p>
                      </div>

                      {/* Parameters */}
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">Parameters</h4>
                        {endpoint.parameters && endpoint.parameters.length > 0 ? (
                          <div className="space-y-1">
                            {endpoint.parameters.map((param, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <code className="text-api-primary">{param.name}</code>
                                <span className="text-xs text-api-muted px-1.5 py-0.5 bg-api-dark rounded">
                                  {param.location}
                                </span>
                                <span className="text-xs text-api-muted">{param.type}</span>
                                {param.required && (
                                  <span className="text-xs text-red-400">required</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-api-muted">No parameters</p>
                        )}
                      </div>

                      {/* Vulnerabilities */}
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">Vulnerabilities</h4>
                        {endpoint.vulnerabilities && endpoint.vulnerabilities.length > 0 ? (
                          <div className="space-y-2">
                            {endpoint.vulnerabilities.map((vuln, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <AlertTriangle className={clsx(
                                  'w-4 h-4 mt-0.5',
                                  vuln.severity === 'critical' ? 'text-red-500' :
                                  vuln.severity === 'high' ? 'text-orange-500' :
                                  vuln.severity === 'medium' ? 'text-yellow-500' :
                                  'text-blue-400'
                                )} />
                                <div>
                                  <span className={clsx(
                                    'text-xs font-medium px-1.5 py-0.5 rounded capitalize',
                                    vuln.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                    vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                    vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  )}>
                                    {vuln.severity}
                                  </span>
                                  <p className="text-sm text-api-muted mt-1">{vuln.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Check className="w-4 h-4" />
                            No vulnerabilities detected
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Statistics Row */}
                    <div className="p-4 border-t border-api-border flex flex-wrap gap-6">
                      <div>
                        <p className="text-xs text-api-muted">API</p>
                        <p className="text-sm text-white">{endpoint.apiName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-api-muted">Error Rate</p>
                        <p className={clsx(
                          'text-sm',
                          (endpoint.statistics?.errorRate || 0) > 2 ? 'text-red-400' :
                          (endpoint.statistics?.errorRate || 0) > 1 ? 'text-yellow-400' :
                          'text-green-400'
                        )}>
                          {(endpoint.statistics?.errorRate || 0).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-api-muted">Created</p>
                        <p className="text-sm text-white">
                          {new Date(endpoint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-api-muted">Updated</p>
                        <p className="text-sm text-white">
                          {new Date(endpoint.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
