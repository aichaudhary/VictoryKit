import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Plus,
  Search,
  Filter,
  Check,
  Clock,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  ChevronDown,
  AlertTriangle,
  Lock,
  Globe,
  Server,
  Zap,
  FileText,
  Eye,
} from 'lucide-react';
import clsx from 'clsx';

// Local types for policy data
interface LocalPolicy {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  version: string;
  scope: string[];
  rules: number;
  lastModified: string;
  modifiedBy: string;
  violations: { last24h: number; last7d: number };
}

// Mock policies data
const mockPolicies: LocalPolicy[] = [
  {
    id: 'policy-1',
    name: 'Rate Limiting - Standard',
    description: 'Default rate limiting policy for all public APIs. Limits requests to 100/minute per client.',
    type: 'rate-limit',
    category: 'traffic',
    status: 'active',
    version: '2.1.0',
    scope: ['api-1', 'api-2', 'api-3'],
    rules: 8,
    lastModified: '2024-03-10T14:30:00Z',
    modifiedBy: 'admin@company.com',
    violations: { last24h: 45, last7d: 312 },
  },
  {
    id: 'policy-2',
    name: 'Authentication Required',
    description: 'Enforces JWT authentication on all protected endpoints. Validates token signature and expiration.',
    type: 'authentication',
    category: 'security',
    status: 'active',
    version: '3.0.0',
    scope: ['api-1', 'api-2', 'api-4', 'api-5'],
    rules: 12,
    lastModified: '2024-03-08T10:00:00Z',
    modifiedBy: 'security@company.com',
    violations: { last24h: 128, last7d: 892 },
  },
  {
    id: 'policy-3',
    name: 'SQL Injection Prevention',
    description: 'Detects and blocks SQL injection attempts in query parameters and request bodies.',
    type: 'security',
    category: 'security',
    status: 'active',
    version: '1.5.2',
    scope: ['*'],
    rules: 24,
    lastModified: '2024-03-05T16:45:00Z',
    modifiedBy: 'security@company.com',
    violations: { last24h: 3, last7d: 18 },
  },
  {
    id: 'policy-4',
    name: 'CORS Configuration',
    description: 'Cross-Origin Resource Sharing policy for frontend applications. Whitelist of allowed origins.',
    type: 'cors',
    category: 'access',
    status: 'active',
    version: '1.2.0',
    scope: ['api-1', 'api-3'],
    rules: 5,
    lastModified: '2024-02-28T09:15:00Z',
    modifiedBy: 'admin@company.com',
    violations: { last24h: 0, last7d: 2 },
  },
  {
    id: 'policy-5',
    name: 'IP Whitelist - Internal',
    description: 'Restricts access to internal APIs from approved IP ranges only.',
    type: 'ip-filter',
    category: 'access',
    status: 'active',
    version: '1.0.0',
    scope: ['api-5'],
    rules: 3,
    lastModified: '2024-02-20T11:30:00Z',
    modifiedBy: 'ops@company.com',
    violations: { last24h: 15, last7d: 67 },
  },
  {
    id: 'policy-6',
    name: 'Request Validation Schema',
    description: 'Validates request payloads against OpenAPI schema definitions.',
    type: 'validation',
    category: 'data',
    status: 'active',
    version: '2.0.0',
    scope: ['api-1', 'api-2'],
    rules: 15,
    lastModified: '2024-03-01T13:00:00Z',
    modifiedBy: 'dev@company.com',
    violations: { last24h: 234, last7d: 1456 },
  },
  {
    id: 'policy-7',
    name: 'GraphQL Depth Limiting',
    description: 'Prevents deeply nested GraphQL queries that could cause performance issues.',
    type: 'graphql',
    category: 'performance',
    status: 'active',
    version: '1.1.0',
    scope: ['api-3'],
    rules: 4,
    lastModified: '2024-02-15T08:00:00Z',
    modifiedBy: 'dev@company.com',
    violations: { last24h: 12, last7d: 89 },
  },
  {
    id: 'policy-8',
    name: 'PCI-DSS Compliance',
    description: 'Enforces PCI-DSS requirements for payment-related API endpoints.',
    type: 'compliance',
    category: 'compliance',
    status: 'draft',
    version: '0.9.0',
    scope: ['api-2'],
    rules: 32,
    lastModified: '2024-03-11T17:00:00Z',
    modifiedBy: 'compliance@company.com',
    violations: { last24h: 0, last7d: 0 },
  },
  {
    id: 'policy-9',
    name: 'Logging & Audit Trail',
    description: 'Captures detailed request/response logs for security audit purposes.',
    type: 'logging',
    category: 'monitoring',
    status: 'inactive',
    version: '1.3.0',
    scope: ['*'],
    rules: 6,
    lastModified: '2024-01-30T12:00:00Z',
    modifiedBy: 'admin@company.com',
    violations: { last24h: 0, last7d: 0 },
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  security: Shield,
  traffic: Zap,
  access: Lock,
  data: FileText,
  performance: Server,
  compliance: Check,
  monitoring: Eye,
};

const categoryColors: Record<string, string> = {
  security: 'text-red-400 bg-red-500/20',
  traffic: 'text-yellow-400 bg-yellow-500/20',
  access: 'text-purple-400 bg-purple-500/20',
  data: 'text-blue-400 bg-blue-500/20',
  performance: 'text-green-400 bg-green-500/20',
  compliance: 'text-cyan-400 bg-cyan-500/20',
  monitoring: 'text-orange-400 bg-orange-500/20',
};

export default function Policies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPolicies = mockPolicies.filter((policy) => {
    const matchesSearch =
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || policy.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(mockPolicies.map((p) => p.category))];

  const stats = {
    total: mockPolicies.length,
    active: mockPolicies.filter((p) => p.status === 'active').length,
    violations24h: mockPolicies.reduce((sum, p) => sum + (p.violations?.last24h ?? 0), 0),
    totalRules: mockPolicies.reduce((sum, p) => sum + (p.rules ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Policies</h2>
          <p className="text-api-muted mt-1">Manage API security and governance rules</p>
        </div>
        <Link
          to="/policies/new"
          className="api-btn api-btn-primary flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          Create Policy
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-api-primary/20 rounded-lg">
              <FileText className="w-5 h-5 text-api-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-api-muted">Total Policies</p>
            </div>
          </div>
        </div>
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-xs text-api-muted">Active Policies</p>
            </div>
          </div>
        </div>
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.violations24h.toLocaleString()}</p>
              <p className="text-xs text-api-muted">Violations (24h)</p>
            </div>
          </div>
        </div>
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalRules}</p>
              <p className="text-xs text-api-muted">Total Rules</p>
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
              placeholder="Search policies..."
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
              <label className="block text-xs text-api-muted mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="api-input w-full"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
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
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {filteredPolicies.map((policy, index) => {
          const CategoryIcon = categoryIcons[policy.category] || FileText;
          
          return (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="api-card p-5 hover:border-api-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div className={clsx('p-3 rounded-lg', categoryColors[policy.category])}>
                  <CategoryIcon className="w-5 h-5" />
                </div>

                {/* Policy Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/policies/${policy.id}`}
                          className="text-lg font-semibold text-white hover:text-api-primary"
                        >
                          {policy.name}
                        </Link>
                        <span className="text-xs text-api-muted">v{policy.version}</span>
                      </div>
                      <p className="text-sm text-api-muted mt-1 line-clamp-2">
                        {policy.description}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className={clsx(
                      'px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 capitalize',
                      policy.status === 'active' && 'bg-green-500/20 text-green-400',
                      policy.status === 'inactive' && 'bg-gray-500/20 text-gray-400',
                      policy.status === 'draft' && 'bg-yellow-500/20 text-yellow-400'
                    )}>
                      {policy.status}
                    </span>
                  </div>

                  {/* Policy Meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm">
                    <div className="flex items-center gap-1 text-api-muted">
                      <Shield className="w-4 h-4" />
                      <span>{policy.rules} rules</span>
                    </div>
                    <div className="flex items-center gap-1 text-api-muted">
                      <Globe className="w-4 h-4" />
                      <span>
                        {Array.isArray(policy.scope) && policy.scope[0] === '*'
                          ? 'All APIs'
                          : `${Array.isArray(policy.scope) ? policy.scope.length : 0} APIs`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-api-muted">
                      <Clock className="w-4 h-4" />
                      <span>Modified {new Date(policy.lastModified).toLocaleDateString()}</span>
                    </div>
                    {policy.violations && policy.violations.last24h > 0 && (
                      <div className="flex items-center gap-1 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{policy.violations.last24h} violations (24h)</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={clsx(
                      'px-2 py-0.5 text-xs rounded capitalize',
                      categoryColors[policy.category]
                    )}>
                      {policy.category}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded bg-api-dark text-api-muted">
                      {policy.type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {policy.status === 'active' ? (
                    <button className="p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-yellow-400 transition-colors">
                      <Pause className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-green-400 transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <Link
                    to={`/policies/${policy.id}`}
                    className="p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button className="p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPolicies.length === 0 && (
        <div className="api-card p-12 text-center">
          <Shield className="w-12 h-12 text-api-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No policies found</h3>
          <p className="text-api-muted mb-4">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first security policy'}
          </p>
          <Link
            to="/policies/new"
            className="api-btn api-btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Policy
          </Link>
        </div>
      )}
    </div>
  );
}
