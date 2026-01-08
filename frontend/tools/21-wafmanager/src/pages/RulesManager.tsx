import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FileCode2, 
  Shield, 
  AlertTriangle,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Copy,
  Zap,
  BarChart2,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getWAFRules, toggleWAFRule, deleteWAFRule } from '../services/api';
import type { WAFRule } from '../types';

const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
  sqli: { label: 'SQL Injection', color: 'text-threat-critical', icon: '💉' },
  xss: { label: 'XSS', color: 'text-threat-high', icon: '📜' },
  rce: { label: 'RCE', color: 'text-threat-critical', icon: '💻' },
  lfi: { label: 'LFI', color: 'text-threat-high', icon: '📁' },
  rfi: { label: 'RFI', color: 'text-threat-high', icon: '🌐' },
  csrf: { label: 'CSRF', color: 'text-threat-medium', icon: '🔄' },
  bot: { label: 'Bot', color: 'text-threat-medium', icon: '🤖' },
  scanner: { label: 'Scanner', color: 'text-threat-low', icon: '🔍' },
  protocol: { label: 'Protocol', color: 'text-threat-info', icon: '📡' },
  custom: { label: 'Custom', color: 'text-waf-primary', icon: '⚙️' },
};

const actionConfig: Record<string, { label: string; color: string }> = {
  block: { label: 'Block', color: 'text-threat-critical bg-threat-critical/20' },
  allow: { label: 'Allow', color: 'text-threat-low bg-threat-low/20' },
  challenge: { label: 'Challenge', color: 'text-threat-medium bg-threat-medium/20' },
  log: { label: 'Log Only', color: 'text-threat-info bg-threat-info/20' },
  redirect: { label: 'Redirect', color: 'text-waf-primary bg-waf-primary/20' },
};

export default function RulesManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['wafRules', { category: selectedCategory, severity: selectedSeverity }],
    queryFn: () => getWAFRules({ 
      category: selectedCategory ? [selectedCategory] : undefined,
      severity: selectedSeverity ? [selectedSeverity] : undefined,
      search: searchQuery || undefined,
    }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => toggleWAFRule(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wafRules'] });
      toast.success('Rule updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWAFRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wafRules'] });
      toast.success('Rule deleted');
    },
  });

  // Mock data for demo
  const mockRules: WAFRule[] = [
    {
      _id: '1', name: 'SQL Injection - Union Select', description: 'Blocks SQL injection attempts using UNION SELECT', ruleId: 'WAF-001',
      category: 'sqli', severity: 'critical', action: 'block', enabled: true,
      pattern: { type: 'regex', value: '(?i)(union\\s+select|select\\s+.*\\s+from)', target: 'query' },
      conditions: [], hitCount: 4521, lastTriggeredAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '2', name: 'XSS - Script Injection', description: 'Detects and blocks script tag injections', ruleId: 'WAF-002',
      category: 'xss', severity: 'high', action: 'block', enabled: true,
      pattern: { type: 'regex', value: '(?i)<script[^>]*>.*</script>', target: 'body' },
      conditions: [], hitCount: 3892, lastTriggeredAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '3', name: 'Bot Detection - User Agent', description: 'Identifies common malicious bots', ruleId: 'WAF-003',
      category: 'bot', severity: 'medium', action: 'challenge', enabled: true,
      pattern: { type: 'regex', value: '(?i)(bot|crawler|spider|scraper)', target: 'header', field: 'User-Agent' },
      conditions: [], hitCount: 2847, lastTriggeredAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '4', name: 'Path Traversal - LFI', description: 'Blocks local file inclusion attempts', ruleId: 'WAF-004',
      category: 'lfi', severity: 'high', action: 'block', enabled: true,
      pattern: { type: 'regex', value: '(?i)(\\.\\./|\\.\\.\\\\|%2e%2e)', target: 'uri' },
      conditions: [], hitCount: 1456, lastTriggeredAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '5', name: 'Vulnerability Scanner Detection', description: 'Detects automated vulnerability scanners', ruleId: 'WAF-005',
      category: 'scanner', severity: 'low', action: 'log', enabled: true,
      pattern: { type: 'contains', value: 'nikto|sqlmap|nmap|acunetix', target: 'header', field: 'User-Agent' },
      conditions: [], hitCount: 923, lastTriggeredAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '6', name: 'Remote Code Execution - Command Injection', description: 'Blocks shell command injection attempts', ruleId: 'WAF-006',
      category: 'rce', severity: 'critical', action: 'block', enabled: true,
      pattern: { type: 'regex', value: '(?i)(;|\\||\\$\\(|`).*(cat|ls|rm|wget|curl|bash)', target: 'body' },
      conditions: [], hitCount: 567, lastTriggeredAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '7', name: 'Rate Limit - Login Attempts', description: 'Rate limits login endpoint requests', ruleId: 'WAF-007',
      category: 'custom', severity: 'medium', action: 'challenge', enabled: true,
      pattern: { type: 'exact', value: '/api/auth/login', target: 'uri' },
      conditions: [], rateLimit: { enabled: true, requests: 5, period: 60, action: 'challenge' },
      hitCount: 12456, lastTriggeredAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '8', name: 'CSRF Token Validation', description: 'Validates CSRF tokens on state-changing requests', ruleId: 'WAF-008',
      category: 'csrf', severity: 'medium', action: 'block', enabled: false,
      pattern: { type: 'regex', value: '^(POST|PUT|DELETE)$', target: 'method' },
      conditions: [], hitCount: 234, lastTriggeredAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    },
  ];

  const displayRules = rules.length > 0 ? rules : mockRules;
  const filteredRules = displayRules.filter(rule => 
    !searchQuery || 
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.ruleId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: filteredRules.length,
    enabled: filteredRules.filter(r => r.enabled).length,
    critical: filteredRules.filter(r => r.severity === 'critical').length,
    totalHits: filteredRules.reduce((sum, r) => sum + r.hitCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Rules Manager</h1>
          <p className="text-waf-muted mt-1">Create and manage WAF protection rules</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={editorPath()} className="waf-btn-primary">
            <Plus className="w-5 h-5" />
            Create Rule
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-waf-primary/20 flex items-center justify-center">
              <FileCode2 className="w-5 h-5 text-waf-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-waf-muted">Total Rules</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-threat-low/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-threat-low" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.enabled}</p>
              <p className="text-sm text-waf-muted">Enabled</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-threat-critical/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-threat-critical" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.critical}</p>
              <p className="text-sm text-waf-muted">Critical Rules</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-threat-info/20 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-threat-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{(stats.totalHits / 1000).toFixed(1)}k</p>
              <p className="text-sm text-waf-muted">Total Hits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="waf-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-waf-muted" />
            <input
              type="text"
              placeholder="Search rules by name, description, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-waf-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        selectedCategory === key
                          ? 'bg-waf-primary text-white'
                          : 'bg-waf-dark text-waf-muted hover:text-white'
                      )}
                    >
                      {config.icon} {config.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Severity</label>
                <div className="flex flex-wrap gap-2">
                  {['critical', 'high', 'medium', 'low'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSelectedSeverity(selectedSeverity === sev ? null : sev)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
                        selectedSeverity === sev
                          ? 'bg-waf-primary text-white'
                          : 'bg-waf-dark text-waf-muted hover:text-white'
                      )}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.map((rule, index) => {
          const category = categoryConfig[rule.category] || { label: rule.category, color: 'text-waf-muted', icon: '📋' };
          const action = actionConfig[rule.action] || { label: rule.action, color: 'text-waf-muted bg-waf-dark' };

          return (
            <motion.div
              key={rule._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                'waf-card hover:border-waf-primary/50 transition-all',
                !rule.enabled && 'opacity-60'
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Rule Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{category.icon}</span>
                    <h3 className="font-semibold text-white truncate">{rule.name}</h3>
                    <span className="text-xs font-mono text-waf-muted bg-waf-dark px-2 py-0.5 rounded">
                      {rule.ruleId}
                    </span>
                  </div>
                  <p className="text-sm text-waf-muted mb-3 line-clamp-2">{rule.description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={clsx('waf-badge', category.color)}>
                      {category.label}
                    </span>
                    <span className={clsx(
                      'waf-badge',
                      rule.severity === 'critical' && 'waf-badge-critical',
                      rule.severity === 'high' && 'waf-badge-high',
                      rule.severity === 'medium' && 'waf-badge-medium',
                      rule.severity === 'low' && 'waf-badge-low'
                    )}>
                      {rule.severity}
                    </span>
                    <span className={clsx('waf-badge', action.color)}>
                      {action.label}
                    </span>
                    {rule.rateLimit?.enabled && (
                      <span className="waf-badge bg-waf-primary/20 text-waf-primary">
                        <Zap className="w-3 h-3 mr-1" />
                        Rate Limit: {rule.rateLimit.requests}/{rule.rateLimit.period}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{rule.hitCount.toLocaleString()}</p>
                    <p className="text-xs text-waf-muted">Hits</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMutation.mutate({ id: rule._id, enabled: !rule.enabled })}
                      className={clsx(
                        'p-2 rounded-lg transition-colors',
                        rule.enabled 
                          ? 'bg-threat-low/20 text-threat-low hover:bg-threat-low/30' 
                          : 'bg-waf-dark text-waf-muted hover:text-white'
                      )}
                      title={rule.enabled ? 'Disable' : 'Enable'}
                    >
                      {rule.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <Link
                      to={`/rules/editor/${rule._id}`}
                      className="p-2 text-waf-muted hover:text-white hover:bg-waf-dark rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-5 h-5" />
                    </Link>
                    <button
                      className="p-2 text-waf-muted hover:text-white hover:bg-waf-dark rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this rule?')) {
                          deleteMutation.mutate(rule._id);
                        }
                      }}
                      className="p-2 text-waf-muted hover:text-threat-critical hover:bg-threat-critical/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pattern Preview */}
              <div className="mt-4 pt-4 border-t border-waf-border">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-waf-muted uppercase">Pattern:</span>
                  <code className="flex-1 text-sm font-mono text-waf-text bg-waf-dark px-3 py-1.5 rounded-lg truncate">
                    [{rule.pattern.type}] {rule.pattern.target}{rule.pattern.field ? `.${rule.pattern.field}` : ''}: {rule.pattern.value}
                  </code>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredRules.length === 0 && (
        <div className="waf-card py-12 text-center">
          <FileCode2 className="w-12 h-12 text-waf-muted mx-auto mb-4" />
          <p className="text-waf-muted">No rules found matching your criteria</p>
          <Link to={editorPath()} className="waf-btn-primary mt-4 inline-flex">
            <Plus className="w-5 h-5" />
            Create First Rule
          </Link>
        </div>
      )}
    </div>
  );
}
