import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Search,
  Plus,
  Filter,
  Grid,
  List,
  Shield,
  Clock,
  TrendingUp,
  Eye,
  RefreshCw,
  X,
  Globe,
  Layers,
  Activity,
  GitBranch as Route,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { API, APIFilters } from '../types';

const apiTypeIcons: Record<string, React.ReactNode> = {
  REST: <Globe className="w-4 h-4" />,
  GraphQL: <Layers className="w-4 h-4" />,
  gRPC: <Activity className="w-4 h-4" />,
  WebSocket: <TrendingUp className="w-4 h-4" />,
  SOAP: <Server className="w-4 h-4" />,
};

const gradeStyles: Record<string, string> = {
  'A+': 'bg-score-a-plus/20 text-score-a-plus border-score-a-plus/30',
  'A': 'bg-score-a/20 text-score-a border-score-a/30',
  'B': 'bg-score-b/20 text-score-b border-score-b/30',
  'C': 'bg-score-c/20 text-score-c border-score-c/30',
  'D': 'bg-score-d/20 text-score-d border-score-d/30',
  'F': 'bg-score-f/20 text-score-f border-score-f/30',
};

const statusStyles: Record<string, string> = {
  active: 'bg-status-active/20 text-status-active',
  deprecated: 'bg-status-deprecated/20 text-status-deprecated',
  development: 'bg-status-development/20 text-status-development',
  retired: 'bg-status-retired/20 text-status-retired',
};

// Mock data for demo
const mockAPIs: API[] = [
  {
    id: 'api-1',
    name: 'User Management API',
    description: 'Core user authentication and profile management services',
    version: 'v2.1.0',
    type: 'REST',
    status: 'active',
    baseUrl: 'https://api.example.com/users',
    securityGrade: 'A+',
    securityScore: 95,
    authentication: { type: 'oauth2', enabled: true },
    endpoints: [],
    policies: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
    owner: 'Platform Team',
    tags: ['core', 'auth', 'users'],
  },
  {
    id: 'api-2',
    name: 'Payment Gateway',
    description: 'Secure payment processing and transaction management',
    version: 'v3.0.0',
    type: 'REST',
    status: 'active',
    baseUrl: 'https://api.example.com/payments',
    securityGrade: 'A',
    securityScore: 88,
    authentication: { type: 'api_key', enabled: true },
    endpoints: [],
    policies: [],
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-10T16:45:00Z',
    owner: 'Payments Team',
    tags: ['payments', 'transactions', 'pci'],
  },
  {
    id: 'api-3',
    name: 'Product Catalog GraphQL',
    description: 'Product information and inventory queries',
    version: 'v1.5.0',
    type: 'GraphQL',
    status: 'active',
    baseUrl: 'https://api.example.com/graphql/products',
    securityGrade: 'B',
    securityScore: 72,
    authentication: { type: 'jwt', enabled: true },
    endpoints: [],
    policies: [],
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-03-05T10:15:00Z',
    owner: 'E-commerce Team',
    tags: ['products', 'catalog', 'inventory'],
  },
  {
    id: 'api-4',
    name: 'Real-time Notifications',
    description: 'WebSocket-based push notifications service',
    version: 'v2.0.0',
    type: 'WebSocket',
    status: 'active',
    baseUrl: 'wss://api.example.com/notifications',
    securityGrade: 'B',
    securityScore: 78,
    authentication: { type: 'jwt', enabled: true },
    endpoints: [],
    policies: [],
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-03-08T12:00:00Z',
    owner: 'Communications Team',
    tags: ['notifications', 'realtime', 'push'],
  },
  {
    id: 'api-5',
    name: 'Legacy Orders API',
    description: 'Order processing - migrating to new platform',
    version: 'v1.2.0',
    type: 'SOAP',
    status: 'deprecated',
    baseUrl: 'https://legacy.example.com/orders/soap',
    securityGrade: 'D',
    securityScore: 45,
    authentication: { type: 'basic', enabled: true },
    endpoints: [],
    policies: [],
    createdAt: '2022-06-01T10:00:00Z',
    updatedAt: '2023-12-15T09:30:00Z',
    owner: 'Legacy Systems',
    tags: ['orders', 'legacy', 'soap'],
  },
  {
    id: 'api-6',
    name: 'Analytics Service',
    description: 'High-performance analytics data streaming',
    version: 'v1.0.0',
    type: 'gRPC',
    status: 'development',
    baseUrl: 'grpc://analytics.example.com:443',
    securityGrade: 'C',
    securityScore: 65,
    authentication: { type: 'mtls', enabled: true },
    endpoints: [],
    policies: [],
    createdAt: '2024-03-01T14:00:00Z',
    updatedAt: '2024-03-12T17:00:00Z',
    owner: 'Data Team',
    tags: ['analytics', 'streaming', 'grpc'],
  },
  {
    id: 'api-7',
    name: 'Document Storage API',
    description: 'Enterprise document management and storage',
    version: 'v2.3.1',
    type: 'REST',
    status: 'active',
    baseUrl: 'https://api.example.com/documents',
    securityGrade: 'A',
    securityScore: 91,
    authentication: { type: 'oauth2', enabled: true },
    endpoints: [],
    policies: [],
    createdAt: '2023-09-10T10:00:00Z',
    updatedAt: '2024-03-11T13:20:00Z',
    owner: 'Infrastructure Team',
    tags: ['documents', 'storage', 'files'],
  },
  {
    id: 'api-8',
    name: 'Internal Admin API',
    description: 'Administrative functions - internal use only',
    version: 'v1.8.0',
    type: 'REST',
    status: 'active',
    baseUrl: 'https://internal.example.com/admin',
    securityGrade: 'F',
    securityScore: 32,
    authentication: { type: 'basic', enabled: true },
    endpoints: [],
    policies: [],
    createdAt: '2023-03-01T09:00:00Z',
    updatedAt: '2024-02-28T11:45:00Z',
    owner: 'DevOps Team',
    tags: ['admin', 'internal', 'management'],
  },
];

export default function APIInventory() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [_selectedAPI, _setSelectedAPI] = useState<API | null>(null);
  const [filters, setFilters] = useState<APIFilters>({
    type: undefined,
    status: undefined,
    securityGrade: undefined,
  });

  // Use mock data for demo
  const apis = mockAPIs;
  const isLoading = false;

  // Filter APIs
  const filteredAPIs = useMemo(() => {
    return apis.filter((api) => {
      const matchesSearch =
        searchQuery === '' ||
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = !filters.type || api.type === filters.type;
      const matchesStatus = !filters.status || api.status === filters.status;
      const matchesGrade = !filters.securityGrade || api.securityGrade === filters.securityGrade;

      return matchesSearch && matchesType && matchesStatus && matchesGrade;
    });
  }, [apis, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({ type: undefined, status: undefined, securityGrade: undefined });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.type || filters.status || filters.securityGrade || searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">API Inventory</h2>
          <p className="text-api-muted mt-1">
            {filteredAPIs.length} of {apis.length} APIs
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="api-btn api-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Register API
        </button>
      </div>

      {/* Search and Filters */}
      <div className="api-card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-api-muted" />
            <input
              type="text"
              placeholder="Search APIs by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="api-input pl-10 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'api-btn flex items-center gap-2',
                showFilters ? 'bg-api-primary text-white' : 'bg-api-dark text-api-muted'
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-api-primary rounded-full" />
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-api-dark rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-api-card text-white' : 'text-api-muted hover:text-white'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-api-card text-white' : 'text-api-muted hover:text-white'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
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
                {/* Type Filter */}
                <div>
                  <label className="block text-sm text-api-muted mb-1">API Type</label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                    className="api-input w-full"
                  >
                    <option value="">All Types</option>
                    <option value="REST">REST</option>
                    <option value="GraphQL">GraphQL</option>
                    <option value="gRPC">gRPC</option>
                    <option value="WebSocket">WebSocket</option>
                    <option value="SOAP">SOAP</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm text-api-muted mb-1">Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                    className="api-input w-full"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="deprecated">Deprecated</option>
                    <option value="development">Development</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                {/* Security Grade Filter */}
                <div>
                  <label className="block text-sm text-api-muted mb-1">Security Grade</label>
                  <select
                    value={filters.securityGrade || ''}
                    onChange={(e) => setFilters({ ...filters, securityGrade: e.target.value || undefined })}
                    className="api-input w-full"
                  >
                    <option value="">All Grades</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>

                {/* Clear Filters */}
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

      {/* API Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-api-primary animate-spin" />
        </div>
      ) : filteredAPIs.length === 0 ? (
        <div className="api-card p-12 text-center">
          <Server className="w-12 h-12 text-api-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No APIs Found</h3>
          <p className="text-api-muted mb-4">
            {hasActiveFilters
              ? 'No APIs match your current filters.'
              : 'Start by registering your first API.'}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="api-btn api-btn-secondary">
              Clear Filters
            </button>
          ) : (
            <button onClick={() => setShowAddModal(true)} className="api-btn api-btn-primary">
              Register API
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAPIs.map((api, index) => (
            <motion.div
              key={api.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="api-card p-5 hover:border-api-primary/50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/apis/${api.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-api-dark rounded-lg">
                    {apiTypeIcons[api.type] || <Server className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-api-primary transition-colors">
                      {api.name}
                    </h3>
                    <p className="text-sm text-api-muted">{api.version}</p>
                  </div>
                </div>
                {api.securityGrade && (
                  <span className={clsx('px-2 py-0.5 text-xs font-medium rounded border', gradeStyles[api.securityGrade] || '')}>
                    {api.securityGrade}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-api-muted line-clamp-2 mb-4">
                {api.description}
              </p>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1 text-api-muted">
                  <Shield className="w-4 h-4" />
                  <span>{api.securityScore}%</span>
                </div>
                <div className="flex items-center gap-1 text-api-muted">
                  <Route className="w-4 h-4" />
                  <span>{api.endpoints?.length || 0} endpoints</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-api-border">
                <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full', statusStyles[api.status])}>
                  {api.status}
                </span>
                <div className="flex items-center gap-1 text-xs text-api-muted">
                  <Clock className="w-3 h-3" />
                  Updated {new Date(api.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Tags */}
              {api.tags && api.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {api.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-api-dark text-api-muted rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {api.tags.length > 3 && (
                    <span className="px-2 py-0.5 text-xs bg-api-dark text-api-muted rounded">
                      +{api.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="api-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-api-border">
                <th className="text-left p-4 text-sm font-medium text-api-muted">API Name</th>
                <th className="text-left p-4 text-sm font-medium text-api-muted hidden md:table-cell">Type</th>
                <th className="text-left p-4 text-sm font-medium text-api-muted hidden lg:table-cell">Version</th>
                <th className="text-left p-4 text-sm font-medium text-api-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-api-muted">Grade</th>
                <th className="text-left p-4 text-sm font-medium text-api-muted hidden xl:table-cell">Score</th>
                <th className="text-left p-4 text-sm font-medium text-api-muted hidden lg:table-cell">Owner</th>
                <th className="text-right p-4 text-sm font-medium text-api-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAPIs.map((api) => (
                <tr
                  key={api.id}
                  className="border-b border-api-border hover:bg-api-dark/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/apis/${api.id}`)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-api-dark rounded-lg">
                        {apiTypeIcons[api.type] || <Server className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{api.name}</p>
                        <p className="text-xs text-api-muted truncate max-w-[200px]">{api.baseUrl}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-api-muted">{api.type}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm text-api-muted">{api.version}</span>
                  </td>
                  <td className="p-4">
                    <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full', statusStyles[api.status] || '')}>
                      {api.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {api.securityGrade ? (
                      <span className={clsx('px-2 py-0.5 text-xs font-medium rounded border', gradeStyles[api.securityGrade] || '')}>
                        {api.securityGrade}
                      </span>
                    ) : (
                      <span className="text-sm text-api-muted">—</span>
                    )}
                  </td>
                  <td className="p-4 hidden xl:table-cell">
                    <span className="text-sm text-white">{api.securityScore}%</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm text-api-muted">{api.owner}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/apis/${api.id}`);
                      }}
                      className="p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add API Modal */}
      <AnimatePresence>
        {showAddModal && (
          <RegisterAPIModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Register API Modal Component
function RegisterAPIModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'REST',
    baseUrl: '',
    version: 'v1.0.0',
    authType: 'api_key',
    owner: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API registration
    console.log('Registering API:', formData);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-api-card border border-api-border rounded-xl z-50 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-api-border">
          <h3 className="text-lg font-semibold text-white">Register New API</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-api-dark rounded-lg text-api-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm text-api-muted mb-1">API Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., User Management API"
              className="api-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-api-muted mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the API..."
              rows={3}
              className="api-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-api-muted mb-1">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="api-input w-full"
              >
                <option value="REST">REST</option>
                <option value="GraphQL">GraphQL</option>
                <option value="gRPC">gRPC</option>
                <option value="WebSocket">WebSocket</option>
                <option value="SOAP">SOAP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-api-muted mb-1">Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="v1.0.0"
                className="api-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-api-muted mb-1">Base URL *</label>
            <input
              type="url"
              required
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
              className="api-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-api-muted mb-1">Authentication</label>
              <select
                value={formData.authType}
                onChange={(e) => setFormData({ ...formData, authType: e.target.value })}
                className="api-input w-full"
              >
                <option value="none">None</option>
                <option value="api_key">API Key</option>
                <option value="oauth2">OAuth 2.0</option>
                <option value="jwt">JWT</option>
                <option value="basic">Basic Auth</option>
                <option value="mtls">mTLS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-api-muted mb-1">Owner</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Team name"
                className="api-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-api-muted mb-1">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Comma-separated tags (e.g., auth, core, public)"
              className="api-input w-full"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button type="button" onClick={onClose} className="api-btn bg-api-dark text-api-muted flex-1">
              Cancel
            </button>
            <button type="submit" className="api-btn api-btn-primary flex-1">
              Register API
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
