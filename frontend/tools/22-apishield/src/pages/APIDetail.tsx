import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Server,
  Shield,
  FileText,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Edit,
  Play,
  Lock,
  Activity,
  Eye,
  BarChart3,
  GitBranch as Route,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import clsx from 'clsx';
import type { API, Endpoint } from '../types';

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

const methodColors: Record<string, string> = {
  GET: 'method-get',
  POST: 'method-post',
  PUT: 'method-put',
  PATCH: 'method-patch',
  DELETE: 'method-delete',
};

// Mock API data
const mockAPI: API = {
  id: 'api-1',
  name: 'User Management API',
  description: 'Core user authentication, authorization, and profile management services. Handles user registration, login, password reset, profile updates, and session management.',
  version: 'v2.1.0',
  type: 'REST',
  status: 'active',
  baseUrl: 'https://api.example.com/users',
  securityGrade: 'A+',
  securityScore: 95,
  authentication: {
    type: 'oauth2',
    enabled: true,
  },
  rateLimit: {
    enabled: true,
    requests: 1000,
    window: '1m',
  },
  endpoints: [],
  policies: [],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-03-01T14:30:00Z',
  owner: 'Platform Team',
  tags: ['core', 'auth', 'users', 'identity'],
  documentation: 'https://docs.example.com/api/users',
  healthCheckUrl: 'https://api.example.com/users/health',
};

const mockEndpoints: Endpoint[] = [
  {
    id: 'ep-1',
    apiId: 'api-1',
    path: '/users',
    method: 'GET',
    description: 'List all users with pagination',
    parameters: [
      { name: 'page', location: 'query', type: 'integer', required: false },
      { name: 'limit', location: 'query', type: 'integer', required: false },
    ],
    responseSchema: { type: 'array', items: { type: 'object' } },
    securityScore: 98,
    vulnerabilities: [],
    statistics: { requestsLast24h: 45230, averageLatency: 45, errorRate: 0.1 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'ep-2',
    apiId: 'api-1',
    path: '/users/:id',
    method: 'GET',
    description: 'Get user by ID',
    parameters: [
      { name: 'id', location: 'path', type: 'string', required: true },
    ],
    securityScore: 96,
    vulnerabilities: [],
    statistics: { requestsLast24h: 128450, averageLatency: 32, errorRate: 0.05 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'ep-3',
    apiId: 'api-1',
    path: '/users',
    method: 'POST',
    description: 'Create new user',
    parameters: [],
    requestSchema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } },
    securityScore: 92,
    vulnerabilities: [{ severity: 'low', description: 'Missing request body validation' }],
    statistics: { requestsLast24h: 8320, averageLatency: 156, errorRate: 2.3 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'ep-4',
    apiId: 'api-1',
    path: '/users/:id',
    method: 'PUT',
    description: 'Update user profile',
    parameters: [
      { name: 'id', location: 'path', type: 'string', required: true },
    ],
    securityScore: 94,
    vulnerabilities: [],
    statistics: { requestsLast24h: 12560, averageLatency: 78, errorRate: 0.8 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'ep-5',
    apiId: 'api-1',
    path: '/users/:id',
    method: 'DELETE',
    description: 'Delete user account',
    parameters: [
      { name: 'id', location: 'path', type: 'string', required: true },
    ],
    securityScore: 88,
    vulnerabilities: [{ severity: 'medium', description: 'Missing authorization check for admin role' }],
    statistics: { requestsLast24h: 245, averageLatency: 89, errorRate: 1.2 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'ep-6',
    apiId: 'api-1',
    path: '/auth/login',
    method: 'POST',
    description: 'User login with credentials',
    parameters: [],
    requestSchema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } },
    securityScore: 97,
    vulnerabilities: [],
    statistics: { requestsLast24h: 89320, averageLatency: 123, errorRate: 3.5 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
];

export default function APIDetail() {
  const { apiId: _apiId } = useParams<{ apiId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'security' | 'analytics'>('overview');
  const [copied, setCopied] = useState(false);

  // Use mock data (in production, fetch by _apiId)
  const api = mockAPI;
  const endpoints = mockEndpoints;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate traffic data
  const trafficData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    requests: Math.floor(Math.random() * 15000) + 5000,
    latency: Math.floor(Math.random() * 30) + 30,
  }));

  // Method distribution
  const methodDistribution = [
    { method: 'GET', count: 3, color: '#22c55e' },
    { method: 'POST', count: 2, color: '#3b82f6' },
    { method: 'PUT', count: 1, color: '#f59e0b' },
    { method: 'DELETE', count: 1, color: '#ef4444' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'endpoints', label: 'Endpoints', icon: Route },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/apis')}
          className="p-2 hover:bg-api-card rounded-lg text-api-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-api-card rounded-lg">
              <Server className="w-5 h-5 text-api-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">{api.name}</h1>
            {api.securityGrade && (
              <span className={clsx('px-2 py-0.5 text-sm font-medium rounded border', gradeStyles[api.securityGrade] || '')}>
                {api.securityGrade}
              </span>
            )}
            <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full', statusStyles[api.status] || '')}>
              {api.status}
            </span>
          </div>
          <p className="text-api-muted">{api.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="api-btn bg-api-card text-api-muted hover:text-white">
            <Edit className="w-4 h-4" />
          </button>
          <button className="api-btn api-btn-primary flex items-center gap-2">
            <Play className="w-4 h-4" />
            Run Scan
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{api.securityScore}%</p>
              <p className="text-sm text-api-muted">Security Score</p>
            </div>
          </div>
        </div>

        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Route className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{endpoints.length}</p>
              <p className="text-sm text-api-muted">Endpoints</p>
            </div>
          </div>
        </div>

        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {formatNumber(endpoints.reduce((sum, ep) => sum + (ep.statistics?.requestsLast24h || 0), 0))}
              </p>
              <p className="text-sm text-api-muted">Requests/24h</p>
            </div>
          </div>
        </div>

        <div className="api-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {endpoints.reduce((sum, ep) => sum + (ep.vulnerabilities?.length || 0), 0)}
              </p>
              <p className="text-sm text-api-muted">Vulnerabilities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-api-border">
        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'text-api-primary border-api-primary'
                    : 'text-api-muted hover:text-white border-transparent'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="api-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4">API Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-api-border">
                  <span className="text-api-muted">Base URL</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-white bg-api-dark px-2 py-1 rounded">{api.baseUrl}</code>
                    <button
                      onClick={() => copyToClipboard(api.baseUrl)}
                      className="p-1.5 hover:bg-api-dark rounded text-api-muted hover:text-white"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-api-border">
                  <span className="text-api-muted">Type</span>
                  <span className="text-white">{api.type}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-api-border">
                  <span className="text-api-muted">Version</span>
                  <span className="text-white">{api.version}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-api-border">
                  <span className="text-api-muted">Authentication</span>
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span className="text-white capitalize">{api.authentication?.type?.replace('_', ' ') || 'None'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-api-border">
                  <span className="text-api-muted">Rate Limiting</span>
                  <span className="text-white">
                    {api.rateLimit?.enabled ? `${api.rateLimit.requests}/${api.rateLimit.window}` : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-api-border">
                  <span className="text-api-muted">Owner</span>
                  <span className="text-white">{api.owner}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-api-muted">Last Updated</span>
                  <span className="text-white">{new Date(api.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Traffic Chart */}
            <div className="api-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Traffic (24h)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} tickFormatter={formatNumber} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke="#3b82f6"
                      fill="url(#colorTraffic)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="api-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {api.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-api-dark text-api-muted rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Method Distribution */}
            <div className="api-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Endpoints by Method</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={methodDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {methodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {methodDistribution.map((item) => (
                  <div key={item.method} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-api-muted">{item.method}: {item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="api-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                {api.documentation && (
                  <a
                    href={api.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-white transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Documentation</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {api.healthCheckUrl && (
                  <a
                    href={api.healthCheckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-white transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Health Check</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'endpoints' && (
        <div className="api-card overflow-hidden">
          <div className="p-4 border-b border-api-border">
            <h3 className="text-lg font-semibold text-white">{endpoints.length} Endpoints</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-api-border bg-api-dark/50">
                  <th className="text-left p-4 text-sm font-medium text-api-muted">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-api-muted">Path</th>
                  <th className="text-left p-4 text-sm font-medium text-api-muted hidden md:table-cell">Description</th>
                  <th className="text-left p-4 text-sm font-medium text-api-muted">Score</th>
                  <th className="text-left p-4 text-sm font-medium text-api-muted hidden lg:table-cell">Requests/24h</th>
                  <th className="text-left p-4 text-sm font-medium text-api-muted hidden lg:table-cell">Latency</th>
                  <th className="text-left p-4 text-sm font-medium text-api-muted">Issues</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((endpoint) => (
                  <tr key={endpoint.id} className="border-b border-api-border hover:bg-api-dark/30 transition-colors">
                    <td className="p-4">
                      <span className={clsx('px-2 py-1 text-xs font-bold rounded', methodColors[endpoint.method])}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="p-4">
                      <code className="text-sm text-white">{endpoint.path}</code>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-api-muted">{endpoint.description}</span>
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        'text-sm font-medium',
                        (endpoint.securityScore ?? 0) >= 90 ? 'text-green-400' :
                        (endpoint.securityScore ?? 0) >= 70 ? 'text-yellow-400' :
                        'text-red-400'
                      )}>
                        {endpoint.securityScore ?? 0}%
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-api-muted">
                        {formatNumber(endpoint.statistics?.requestsLast24h || 0)}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-api-muted">
                        {endpoint.statistics?.averageLatency || 0}ms
                      </span>
                    </td>
                    <td className="p-4">
                      {endpoint.vulnerabilities && endpoint.vulnerabilities.length > 0 ? (
                        <span className="flex items-center gap-1 text-sm text-yellow-400">
                          <AlertTriangle className="w-4 h-4" />
                          {endpoint.vulnerabilities.length}
                        </span>
                      ) : (
                        <span className="text-sm text-green-400">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="api-card p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Security Assessment</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-api-dark rounded-lg">
                <span className="text-api-muted">Authentication</span>
                <span className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  OAuth 2.0 Enabled
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-api-dark rounded-lg">
                <span className="text-api-muted">Rate Limiting</span>
                <span className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  1000 req/min
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-api-dark rounded-lg">
                <span className="text-api-muted">HTTPS</span>
                <span className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  TLS 1.3
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-api-dark rounded-lg">
                <span className="text-api-muted">Input Validation</span>
                <span className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  Partial
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-api-dark rounded-lg">
                <span className="text-api-muted">CORS Policy</span>
                <span className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  Configured
                </span>
              </div>
            </div>
          </div>

          <div className="api-card p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Vulnerabilities</h3>
            <div className="space-y-3">
              {endpoints
                .flatMap(ep => ep.vulnerabilities?.map(v => ({ ...v, endpoint: ep.path, method: ep.method })) || [])
                .map((vuln, i) => (
                  <div key={i} className="p-3 bg-api-dark rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={clsx(
                        'w-5 h-5 mt-0.5',
                        vuln.severity === 'critical' ? 'text-red-500' :
                        vuln.severity === 'high' ? 'text-orange-500' :
                        vuln.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-400'
                      )} />
                      <div>
                        <p className="text-white">{vuln.description}</p>
                        <p className="text-sm text-api-muted mt-1">
                          <span className={clsx('method-badge mr-2', methodColors[vuln.method])}>{vuln.method}</span>
                          {vuln.endpoint}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              {endpoints.every(ep => !ep.vulnerabilities || ep.vulnerabilities.length === 0) && (
                <div className="text-center py-8 text-api-muted">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p>No vulnerabilities detected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="api-card p-5 text-center">
              <p className="text-3xl font-bold text-white">
                {formatNumber(endpoints.reduce((sum, ep) => sum + (ep.statistics?.requestsLast24h || 0), 0))}
              </p>
              <p className="text-sm text-api-muted mt-1">Total Requests (24h)</p>
            </div>
            <div className="api-card p-5 text-center">
              <p className="text-3xl font-bold text-white">
                {Math.round(endpoints.reduce((sum, ep) => sum + (ep.statistics?.averageLatency || 0), 0) / endpoints.length)}ms
              </p>
              <p className="text-sm text-api-muted mt-1">Avg Latency</p>
            </div>
            <div className="api-card p-5 text-center">
              <p className="text-3xl font-bold text-white">
                {(endpoints.reduce((sum, ep) => sum + (ep.statistics?.errorRate || 0), 0) / endpoints.length).toFixed(2)}%
              </p>
              <p className="text-sm text-api-muted mt-1">Error Rate</p>
            </div>
          </div>

          <div className="api-card p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Endpoint Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-api-border">
                    <th className="text-left p-3 text-sm font-medium text-api-muted">Endpoint</th>
                    <th className="text-right p-3 text-sm font-medium text-api-muted">Requests</th>
                    <th className="text-right p-3 text-sm font-medium text-api-muted">Latency</th>
                    <th className="text-right p-3 text-sm font-medium text-api-muted">Error Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints
                    .sort((a, b) => (b.statistics?.requestsLast24h || 0) - (a.statistics?.requestsLast24h || 0))
                    .map((endpoint) => (
                      <tr key={endpoint.id} className="border-b border-api-border">
                        <td className="p-3">
                          <span className={clsx('px-2 py-0.5 text-xs font-bold rounded mr-2', methodColors[endpoint.method])}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm text-white">{endpoint.path}</code>
                        </td>
                        <td className="p-3 text-right text-white">
                          {formatNumber(endpoint.statistics?.requestsLast24h || 0)}
                        </td>
                        <td className="p-3 text-right text-white">
                          {endpoint.statistics?.averageLatency || 0}ms
                        </td>
                        <td className="p-3 text-right">
                          <span className={clsx(
                            (endpoint.statistics?.errorRate || 0) > 2 ? 'text-red-400' :
                            (endpoint.statistics?.errorRate || 0) > 1 ? 'text-yellow-400' :
                            'text-green-400'
                          )}>
                            {(endpoint.statistics?.errorRate || 0).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
