import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
  Globe,
  Clock,
  Fingerprint,
  Eye,
  MapPin,
  Crosshair
} from 'lucide-react';
import clsx from 'clsx';
import { getAttackLogs } from '../services/api';
import type { AttackLog } from '../types';

const attackCategories: Record<string, { label: string; icon: string; color: string }> = {
  sqli: { label: 'SQL Injection', icon: '💉', color: 'text-threat-critical bg-threat-critical/20' },
  xss: { label: 'XSS', icon: '📜', color: 'text-threat-high bg-threat-high/20' },
  rce: { label: 'RCE', icon: '💻', color: 'text-threat-critical bg-threat-critical/20' },
  lfi: { label: 'LFI', icon: '📁', color: 'text-threat-high bg-threat-high/20' },
  rfi: { label: 'RFI', icon: '🌐', color: 'text-threat-high bg-threat-high/20' },
  csrf: { label: 'CSRF', icon: '🔄', color: 'text-threat-medium bg-threat-medium/20' },
  bot: { label: 'Bot', icon: '🤖', color: 'text-threat-medium bg-threat-medium/20' },
  scanner: { label: 'Scanner', icon: '🔍', color: 'text-threat-low bg-threat-low/20' },
  rate_limit: { label: 'Rate Limit', icon: '⚡', color: 'text-threat-medium bg-threat-medium/20' },
  geo_block: { label: 'Geo Block', icon: '🌍', color: 'text-threat-info bg-threat-info/20' },
  protocol: { label: 'Protocol', icon: '📡', color: 'text-waf-primary bg-waf-primary/20' },
};

const actionColors: Record<string, string> = {
  blocked: 'text-threat-critical bg-threat-critical/20',
  challenged: 'text-threat-medium bg-threat-medium/20',
  logged: 'text-threat-info bg-threat-info/20',
  allowed: 'text-threat-low bg-threat-low/20',
};

export default function AttackLogs() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: [] as string[],
    action: '' as string,
    severity: '' as string,
    startDate: '',
    endDate: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AttackLog | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attackLogs', page, filters],
    queryFn: () => getAttackLogs({ page, limit: 20, ...filters }),
  });

  // Mock data
  const mockLogs: AttackLog[] = Array.from({ length: 20 }, (_, i) => ({
    _id: `${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
    clientIP: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    country: ['US', 'CN', 'RU', 'DE', 'UK', 'FR', 'JP', 'BR', 'IN', 'AU'][Math.floor(Math.random() * 10)],
    method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
    uri: ['/api/users', '/api/login', '/api/admin', '/api/search', '/api/upload'][Math.floor(Math.random() * 5)],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    category: Object.keys(attackCategories)[Math.floor(Math.random() * Object.keys(attackCategories).length)],
    severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as 'critical' | 'high' | 'medium' | 'low',
    action: ['blocked', 'challenged', 'logged'][Math.floor(Math.random() * 3)] as 'blocked' | 'challenged' | 'logged',
    ruleId: `WAF-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
    ruleName: 'Sample Protection Rule',
    matchedPattern: '(?i)(union\\s+select|select\\s+.*\\s+from)',
    requestPayload: 'id=1 UNION SELECT username, password FROM users',
    responseCode: [200, 403, 429, 500][Math.floor(Math.random() * 4)],
  }));

  const logs = data?.logs || mockLogs;
  const totalPages = data?.totalPages || 10;
  const total = data?.total || 200;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Attack Logs</h1>
          <p className="text-waf-muted mt-1">
            {total.toLocaleString()} attacks detected in the last 7 days
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="waf-btn-secondary">
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <button className="waf-btn-primary">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="waf-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-waf-muted" />
            <input
              type="text"
              placeholder="Search by IP, URI, or rule ID..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="waf-input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'waf-btn-secondary',
              showFilters && 'border-waf-primary text-waf-primary'
            )}
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={clsx('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-4 pt-4 border-t border-waf-border grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div>
              <label className="text-sm text-waf-muted mb-2 block">Category</label>
              <select
                value={filters.category[0] || ''}
                onChange={(e) => setFilters(f => ({ ...f, category: e.target.value ? [e.target.value] : [] }))}
                className="waf-select"
              >
                <option value="">All Categories</option>
                {Object.entries(attackCategories).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-waf-muted mb-2 block">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
                className="waf-select"
              >
                <option value="">All Actions</option>
                <option value="blocked">Blocked</option>
                <option value="challenged">Challenged</option>
                <option value="logged">Logged</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-waf-muted mb-2 block">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value }))}
                className="waf-select"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-waf-muted mb-2 block">Date Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                  className="waf-input text-sm flex-1"
                />
                <span className="text-waf-muted">-</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                  className="waf-input text-sm flex-1"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Logs Table */}
      <div className="waf-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-waf-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-waf-muted">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-waf-muted">Client</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-waf-muted">Request</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-waf-muted">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-waf-muted">Severity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-waf-muted">Action</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-waf-muted">Rule</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-waf-muted">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const category = attackCategories[log.category] || { label: log.category, icon: '❓', color: 'text-waf-muted bg-waf-dark' };
                const actionColor = actionColors[log.action] || 'text-waf-muted bg-waf-dark';

                return (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-waf-border/50 hover:bg-waf-dark/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-waf-text">
                        <Clock className="w-4 h-4 text-waf-muted" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-waf-text">{log.clientIP}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-waf-dark rounded text-waf-muted">
                          {log.country}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'text-xs font-medium px-2 py-0.5 rounded',
                          log.method === 'GET' && 'bg-threat-low/20 text-threat-low',
                          log.method === 'POST' && 'bg-threat-medium/20 text-threat-medium',
                          log.method === 'PUT' && 'bg-threat-info/20 text-threat-info',
                          log.method === 'DELETE' && 'bg-threat-critical/20 text-threat-critical',
                        )}>
                          {log.method}
                        </span>
                        <span className="text-sm text-waf-text truncate max-w-[200px]">{log.uri}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={clsx('inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium', category.color)}>
                        {category.icon} {category.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium capitalize',
                        log.severity === 'critical' && 'bg-threat-critical/20 text-threat-critical',
                        log.severity === 'high' && 'bg-threat-high/20 text-threat-high',
                        log.severity === 'medium' && 'bg-threat-medium/20 text-threat-medium',
                        log.severity === 'low' && 'bg-threat-low/20 text-threat-low',
                      )}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium capitalize', actionColor)}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-waf-muted">{log.ruleId}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-2 hover:bg-waf-dark rounded-lg text-waf-muted hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-waf-border">
          <div className="text-sm text-waf-muted">
            Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, total)} of {total.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-waf-border rounded-lg text-waf-muted hover:text-white hover:bg-waf-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm text-waf-text">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-waf-border rounded-lg text-waf-muted hover:text-white hover:bg-waf-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-waf-card border border-waf-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-waf-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Attack Details</h2>
                <span className={clsx(
                  'px-3 py-1 rounded-lg text-sm font-medium capitalize',
                  actionColors[selectedLog.action]
                )}>
                  {selectedLog.action}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-waf-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-waf-muted mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Timestamp</span>
                  </div>
                  <p className="text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div className="bg-waf-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-waf-muted mb-1">
                    <Fingerprint className="w-4 h-4" />
                    <span className="text-sm">Client IP</span>
                  </div>
                  <p className="text-white font-mono">{selectedLog.clientIP}</p>
                </div>
                <div className="bg-waf-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-waf-muted mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Country</span>
                  </div>
                  <p className="text-white">{selectedLog.country}</p>
                </div>
                <div className="bg-waf-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-waf-muted mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Rule ID</span>
                  </div>
                  <p className="text-white font-mono">{selectedLog.ruleId}</p>
                </div>
              </div>

              <div className="bg-waf-dark rounded-lg p-4">
                <div className="flex items-center gap-2 text-waf-muted mb-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Request</span>
                </div>
                <p className="text-white font-mono">
                  <span className={clsx(
                    'px-2 py-0.5 rounded mr-2',
                    selectedLog.method === 'GET' && 'bg-threat-low/20 text-threat-low',
                    selectedLog.method === 'POST' && 'bg-threat-medium/20 text-threat-medium',
                  )}>
                    {selectedLog.method}
                  </span>
                  {selectedLog.uri}
                </p>
              </div>

              <div className="bg-waf-dark rounded-lg p-4">
                <div className="flex items-center gap-2 text-waf-muted mb-2">
                  <Crosshair className="w-4 h-4" />
                  <span className="text-sm">Matched Pattern</span>
                </div>
                <code className="text-sm text-threat-critical font-mono break-all">{selectedLog.matchedPattern}</code>
              </div>

              {selectedLog.requestPayload && (
                <div className="bg-waf-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-waf-muted mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Request Payload</span>
                  </div>
                  <code className="text-sm text-waf-text font-mono break-all">{selectedLog.requestPayload}</code>
                </div>
              )}

              <div className="bg-waf-dark rounded-lg p-4">
                <div className="flex items-center gap-2 text-waf-muted mb-2">
                  <span className="text-sm">User Agent</span>
                </div>
                <p className="text-sm text-waf-text break-all">{selectedLog.userAgent}</p>
              </div>
            </div>
            <div className="p-6 border-t border-waf-border flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="waf-btn-secondary">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
