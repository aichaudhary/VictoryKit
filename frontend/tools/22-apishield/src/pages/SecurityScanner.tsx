import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Play,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Server,
  Target,
  Zap,
  FileText,
  Download,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
} from 'lucide-react';
import clsx from 'clsx';
import type { SecurityScan } from '../types';

// Mock scan results
const mockScans: SecurityScan[] = [
  {
    id: 'scan-1',
    apiId: 'api-1',
    apiName: 'User Management API',
    type: 'full',
    status: 'completed',
    startedAt: '2024-03-12T10:30:00Z',
    completedAt: '2024-03-12T10:35:42Z',
    findings: {
      critical: 0,
      high: 1,
      medium: 3,
      low: 5,
      info: 12,
    },
    score: 85,
    duration: 342,
  },
  {
    id: 'scan-2',
    apiId: 'api-2',
    apiName: 'Payment Gateway',
    type: 'quick',
    status: 'completed',
    startedAt: '2024-03-12T09:15:00Z',
    completedAt: '2024-03-12T09:17:23Z',
    findings: {
      critical: 0,
      high: 0,
      medium: 1,
      low: 2,
      info: 8,
    },
    score: 92,
    duration: 143,
  },
  {
    id: 'scan-3',
    apiId: 'api-5',
    apiName: 'Legacy Orders API',
    type: 'full',
    status: 'completed',
    startedAt: '2024-03-11T14:00:00Z',
    completedAt: '2024-03-11T14:12:15Z',
    findings: {
      critical: 2,
      high: 4,
      medium: 7,
      low: 3,
      info: 5,
    },
    score: 38,
    duration: 735,
  },
  {
    id: 'scan-4',
    apiId: 'api-3',
    apiName: 'Product Catalog GraphQL',
    type: 'compliance',
    status: 'running',
    startedAt: '2024-03-12T11:45:00Z',
    progress: 67,
  },
];

const mockFindings = [
  {
    id: 'finding-1',
    severity: 'critical',
    title: 'SQL Injection Vulnerability',
    description: 'User input is directly concatenated into SQL query without sanitization',
    endpoint: 'POST /orders/create',
    api: 'Legacy Orders API',
    cwe: 'CWE-89',
    owasp: 'A03:2021 - Injection',
    remediation: 'Use parameterized queries or prepared statements instead of string concatenation',
    detected: '2024-03-11T14:05:23Z',
  },
  {
    id: 'finding-2',
    severity: 'critical',
    title: 'Missing Authentication',
    description: 'Admin endpoint accessible without authentication token validation',
    endpoint: 'DELETE /admin/users/:id',
    api: 'Legacy Orders API',
    cwe: 'CWE-306',
    owasp: 'A07:2021 - Identification and Authentication Failures',
    remediation: 'Implement proper JWT/OAuth2 token validation for all protected endpoints',
    detected: '2024-03-11T14:06:12Z',
  },
  {
    id: 'finding-3',
    severity: 'high',
    title: 'Broken Object Level Authorization',
    description: 'Users can access other users resources by modifying the ID parameter',
    endpoint: 'GET /users/:id/profile',
    api: 'User Management API',
    cwe: 'CWE-639',
    owasp: 'A01:2021 - Broken Access Control',
    remediation: 'Verify that the authenticated user has permission to access the requested resource',
    detected: '2024-03-12T10:32:45Z',
  },
  {
    id: 'finding-4',
    severity: 'high',
    title: 'Excessive Data Exposure',
    description: 'API returns sensitive user data including password hashes in response',
    endpoint: 'GET /users',
    api: 'Legacy Orders API',
    cwe: 'CWE-200',
    owasp: 'A02:2021 - Cryptographic Failures',
    remediation: 'Filter response data to only include necessary fields, never expose password hashes',
    detected: '2024-03-11T14:07:34Z',
  },
  {
    id: 'finding-5',
    severity: 'medium',
    title: 'Rate Limiting Not Configured',
    description: 'API endpoint has no rate limiting, vulnerable to brute force attacks',
    endpoint: 'POST /auth/login',
    api: 'User Management API',
    cwe: 'CWE-307',
    owasp: 'A04:2021 - Insecure Design',
    remediation: 'Implement rate limiting with exponential backoff for failed attempts',
    detected: '2024-03-12T10:33:12Z',
  },
  {
    id: 'finding-6',
    severity: 'medium',
    title: 'GraphQL Introspection Enabled',
    description: 'GraphQL introspection is enabled in production, exposing schema details',
    endpoint: 'POST /graphql',
    api: 'Product Catalog GraphQL',
    cwe: 'CWE-200',
    owasp: 'A05:2021 - Security Misconfiguration',
    remediation: 'Disable introspection in production environment',
    detected: '2024-03-10T16:22:00Z',
  },
  {
    id: 'finding-7',
    severity: 'low',
    title: 'Missing Security Headers',
    description: 'Response missing X-Content-Type-Options header',
    endpoint: 'All endpoints',
    api: 'User Management API',
    cwe: 'CWE-693',
    owasp: 'A05:2021 - Security Misconfiguration',
    remediation: 'Add X-Content-Type-Options: nosniff header to all responses',
    detected: '2024-03-12T10:34:00Z',
  },
];

const scanTypes = [
  {
    id: 'quick',
    name: 'Quick Scan',
    description: 'Fast vulnerability check (~2 min)',
    icon: Zap,
    color: 'text-yellow-400',
  },
  {
    id: 'full',
    name: 'Full Scan',
    description: 'Comprehensive security analysis (~10 min)',
    icon: Shield,
    color: 'text-blue-400',
  },
  {
    id: 'compliance',
    name: 'Compliance Scan',
    description: 'OWASP, PCI-DSS, HIPAA checks (~15 min)',
    icon: FileText,
    color: 'text-purple-400',
  },
  {
    id: 'penetration',
    name: 'Pen Test Simulation',
    description: 'Simulated attack scenarios (~30 min)',
    icon: Target,
    color: 'text-red-400',
  },
];

export default function SecurityScanner() {
  const [selectedAPI, setSelectedAPI] = useState<string>('');
  const [selectedScanType, setSelectedScanType] = useState<string>('full');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const apis = [
    { id: 'api-1', name: 'User Management API' },
    { id: 'api-2', name: 'Payment Gateway' },
    { id: 'api-3', name: 'Product Catalog GraphQL' },
    { id: 'api-4', name: 'Real-time Notifications' },
    { id: 'api-5', name: 'Legacy Orders API' },
  ];

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scan progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 500);
  };

  const filteredFindings = mockFindings.filter(
    (f) => severityFilter === 'all' || f.severity === severityFilter
  );

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Scanner</h2>
          <p className="text-api-muted mt-1">Scan APIs for vulnerabilities and security issues</p>
        </div>
      </div>

      {/* Scan Configuration */}
      <div className="api-card p-5">
        <h3 className="text-lg font-semibold text-white mb-4">New Security Scan</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Selection */}
          <div>
            <label className="block text-sm text-api-muted mb-2">Select API</label>
            <select
              value={selectedAPI}
              onChange={(e) => setSelectedAPI(e.target.value)}
              className="api-input w-full"
              disabled={isScanning}
            >
              <option value="">All APIs</option>
              {apis.map((api) => (
                <option key={api.id} value={api.id}>
                  {api.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scan Type Selection */}
          <div className="lg:col-span-2">
            <label className="block text-sm text-api-muted mb-2">Scan Type</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {scanTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedScanType(type.id)}
                    disabled={isScanning}
                    className={clsx(
                      'p-3 rounded-lg border transition-all text-left',
                      selectedScanType === type.id
                        ? 'border-api-primary bg-api-primary/10'
                        : 'border-api-border hover:border-api-primary/50 bg-api-dark'
                    )}
                  >
                    <Icon className={clsx('w-5 h-5 mb-2', type.color)} />
                    <p className="text-sm font-medium text-white">{type.name}</p>
                    <p className="text-xs text-api-muted mt-1">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scan Progress / Start Button */}
        <div className="mt-6">
          {isScanning ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-api-muted">Scanning in progress...</span>
                <span className="text-sm text-white">{Math.round(scanProgress)}%</span>
              </div>
              <div className="h-2 bg-api-dark rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-api-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-api-muted">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing endpoints and checking for vulnerabilities...
              </div>
            </div>
          ) : (
            <button
              onClick={startScan}
              className="api-btn api-btn-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Scan
            </button>
          )}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="api-card p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Scans</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-api-border">
                <th className="text-left p-3 text-sm font-medium text-api-muted">API</th>
                <th className="text-left p-3 text-sm font-medium text-api-muted">Type</th>
                <th className="text-left p-3 text-sm font-medium text-api-muted">Status</th>
                <th className="text-left p-3 text-sm font-medium text-api-muted">Findings</th>
                <th className="text-left p-3 text-sm font-medium text-api-muted">Score</th>
                <th className="text-left p-3 text-sm font-medium text-api-muted hidden lg:table-cell">Duration</th>
                <th className="text-left p-3 text-sm font-medium text-api-muted hidden lg:table-cell">Date</th>
                <th className="text-right p-3 text-sm font-medium text-api-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockScans.map((scan) => (
                <tr key={scan.id} className="border-b border-api-border hover:bg-api-dark/30">
                  <td className="p-3">
                    <span className="text-sm text-white">{scan.apiName}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-api-muted capitalize">{scan.type}</span>
                  </td>
                  <td className="p-3">
                    {scan.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-sm text-green-400">
                        <Check className="w-4 h-4" />
                        Completed
                      </span>
                    ) : scan.status === 'running' ? (
                      <span className="flex items-center gap-1 text-sm text-blue-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {scan.progress}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-red-400">
                        <X className="w-4 h-4" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {scan.findings && (
                      <div className="flex items-center gap-2">
                        {scan.findings.critical > 0 && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded">
                            {scan.findings.critical}C
                          </span>
                        )}
                        {scan.findings.high > 0 && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-500/20 text-orange-400 rounded">
                            {scan.findings.high}H
                          </span>
                        )}
                        {scan.findings.medium > 0 && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded">
                            {scan.findings.medium}M
                          </span>
                        )}
                        {scan.findings.low > 0 && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
                            {scan.findings.low}L
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {scan.score !== undefined && (
                      <span className={clsx(
                        'text-sm font-medium',
                        scan.score >= 80 ? 'text-green-400' :
                        scan.score >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      )}>
                        {scan.score}%
                      </span>
                    )}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    {scan.duration && (
                      <span className="text-sm text-api-muted">
                        {Math.floor(scan.duration / 60)}m {scan.duration % 60}s
                      </span>
                    )}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <span className="text-sm text-api-muted">
                      {new Date(scan.startedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-white">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-white">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Findings */}
      <div className="api-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Security Findings</h3>
          
          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="api-input text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Severity Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-400">
              {mockFindings.filter((f) => f.severity === 'critical').length}
            </p>
            <p className="text-xs text-api-muted">Critical</p>
          </div>
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-400">
              {mockFindings.filter((f) => f.severity === 'high').length}
            </p>
            <p className="text-xs text-api-muted">High</p>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {mockFindings.filter((f) => f.severity === 'medium').length}
            </p>
            <p className="text-xs text-api-muted">Medium</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-400">
              {mockFindings.filter((f) => f.severity === 'low').length}
            </p>
            <p className="text-xs text-api-muted">Low</p>
          </div>
          <div className="p-3 bg-gray-500/10 border border-gray-500/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-400">{mockFindings.length}</p>
            <p className="text-xs text-api-muted">Total</p>
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <div key={finding.id} className="border border-api-border rounded-lg overflow-hidden">
              <div
                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-api-dark/30 transition-colors"
                onClick={() =>
                  setExpandedFinding(expandedFinding === finding.id ? null : finding.id)
                }
              >
                {getSeverityIcon(finding.severity)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-white">{finding.title}</h4>
                      <p className="text-sm text-api-muted mt-1">{finding.description}</p>
                    </div>
                    <span className={clsx(
                      'px-2 py-0.5 text-xs font-medium rounded border capitalize flex-shrink-0',
                      getSeverityStyle(finding.severity)
                    )}>
                      {finding.severity}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-api-muted">
                    <span className="flex items-center gap-1">
                      <Server className="w-3 h-3" />
                      {finding.api}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {finding.endpoint}
                    </span>
                    {finding.owasp && (
                      <span className="px-1.5 py-0.5 bg-api-dark rounded">
                        {finding.owasp.split(' - ')[0]}
                      </span>
                    )}
                  </div>
                </div>

                <button className="p-1 text-api-muted">
                  {expandedFinding === finding.id ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {expandedFinding === finding.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-api-border overflow-hidden"
                  >
                    <div className="p-4 bg-api-dark/30 space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-white mb-2">Remediation</h5>
                        <p className="text-sm text-api-muted">{finding.remediation}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-api-muted mb-1">CWE Reference</h5>
                          <a
                            href={`https://cwe.mitre.org/data/definitions/${finding.cwe?.split('-')[1]}.html`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-api-primary hover:underline flex items-center gap-1"
                          >
                            {finding.cwe}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-api-muted mb-1">OWASP Category</h5>
                          <span className="text-sm text-white">{finding.owasp}</span>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-api-muted mb-1">Detected</h5>
                          <span className="text-sm text-white">
                            {new Date(finding.detected).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button className="api-btn api-btn-primary text-sm">
                          Mark as Resolved
                        </button>
                        <button className="api-btn bg-api-dark text-api-muted text-sm">
                          Create Ticket
                        </button>
                        <button className="api-btn bg-api-dark text-api-muted text-sm">
                          Ignore
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
