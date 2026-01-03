import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  ArrowLeft, 
  Save, 
  Play, 
  Check, 
  X, 
  AlertTriangle,
  Info,
  Zap,
  Shield,
  FileCode2,
  Copy,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getWAFRule, createWAFRule, updateWAFRule, testWAFRule } from '../services/api';
import type { WAFRule } from '../types';

const patternTypes = [
  { value: 'regex', label: 'Regular Expression', description: 'Full regex pattern matching' },
  { value: 'contains', label: 'Contains', description: 'Simple string containment check' },
  { value: 'exact', label: 'Exact Match', description: 'Exact string comparison' },
  { value: 'prefix', label: 'Prefix', description: 'Starts with pattern' },
  { value: 'suffix', label: 'Suffix', description: 'Ends with pattern' },
];

const targetTypes = [
  { value: 'uri', label: 'URI Path', description: 'Request URI path' },
  { value: 'query', label: 'Query String', description: 'URL query parameters' },
  { value: 'body', label: 'Request Body', description: 'POST/PUT request body' },
  { value: 'header', label: 'Header', description: 'HTTP request header' },
  { value: 'cookie', label: 'Cookie', description: 'Request cookies' },
  { value: 'method', label: 'HTTP Method', description: 'GET, POST, PUT, DELETE, etc.' },
  { value: 'ip', label: 'IP Address', description: 'Client IP address' },
];

const categories = [
  { value: 'sqli', label: 'SQL Injection', icon: '💉' },
  { value: 'xss', label: 'XSS', icon: '📜' },
  { value: 'rce', label: 'RCE', icon: '💻' },
  { value: 'lfi', label: 'LFI', icon: '📁' },
  { value: 'rfi', label: 'RFI', icon: '🌐' },
  { value: 'csrf', label: 'CSRF', icon: '🔄' },
  { value: 'bot', label: 'Bot Detection', icon: '🤖' },
  { value: 'scanner', label: 'Scanner Detection', icon: '🔍' },
  { value: 'protocol', label: 'Protocol Attack', icon: '📡' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
];

const actions = [
  { value: 'block', label: 'Block', description: 'Immediately block the request', color: 'text-threat-critical' },
  { value: 'allow', label: 'Allow', description: 'Explicitly allow the request', color: 'text-threat-low' },
  { value: 'challenge', label: 'Challenge', description: 'Present CAPTCHA or JS challenge', color: 'text-threat-medium' },
  { value: 'log', label: 'Log Only', description: 'Log but allow the request', color: 'text-threat-info' },
  { value: 'redirect', label: 'Redirect', description: 'Redirect to another URL', color: 'text-waf-primary' },
];

const severities = [
  { value: 'critical', label: 'Critical', color: 'bg-threat-critical' },
  { value: 'high', label: 'High', color: 'bg-threat-high' },
  { value: 'medium', label: 'Medium', color: 'bg-threat-medium' },
  { value: 'low', label: 'Low', color: 'bg-threat-low' },
];

const defaultRule: Partial<WAFRule> = {
  name: '',
  description: '',
  ruleId: `WAF-${Date.now().toString(36).toUpperCase()}`,
  category: 'custom',
  severity: 'medium',
  action: 'block',
  enabled: true,
  pattern: {
    type: 'regex',
    value: '',
    target: 'uri',
  },
  conditions: [],
  rateLimit: {
    enabled: false,
    requests: 100,
    period: 60,
    action: 'block',
  },
};

export default function RuleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [rule, setRule] = useState<Partial<WAFRule>>(defaultRule);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{ matched: boolean; details?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const { data: existingRule, isLoading } = useQuery({
    queryKey: ['wafRule', id],
    queryFn: () => getWAFRule(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingRule) {
      setRule(existingRule);
    }
  }, [existingRule]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<WAFRule>) => 
      isEditing ? updateWAFRule(id!, data) : createWAFRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wafRules'] });
      toast.success(isEditing ? 'Rule updated successfully' : 'Rule created successfully');
      navigate('/rules');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save rule');
    },
  });

  const handleTest = async () => {
    if (!rule.pattern?.value) {
      toast.error('Please enter a pattern first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate testing - in real app, call testWAFRule API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let matched = false;
      const pattern = rule.pattern.value;

      if (rule.pattern.type === 'regex') {
        try {
          const regex = new RegExp(pattern, 'i');
          matched = regex.test(testInput);
        } catch {
          setTestResult({ matched: false, details: 'Invalid regex pattern' });
          setIsTesting(false);
          return;
        }
      } else if (rule.pattern.type === 'contains') {
        matched = testInput.toLowerCase().includes(pattern.toLowerCase());
      } else if (rule.pattern.type === 'exact') {
        matched = testInput === pattern;
      } else if (rule.pattern.type === 'prefix') {
        matched = testInput.startsWith(pattern);
      } else if (rule.pattern.type === 'suffix') {
        matched = testInput.endsWith(pattern);
      }

      setTestResult({
        matched,
        details: matched ? 'Pattern matched the test input' : 'Pattern did not match',
      });
    } catch (error) {
      toast.error('Test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const updatePattern = (updates: Partial<typeof rule.pattern>) => {
    setRule(prev => ({
      ...prev,
      pattern: { ...prev.pattern!, ...updates },
    }));
    setTestResult(null);
  };

  const updateRateLimit = (updates: Partial<NonNullable<typeof rule.rateLimit>>) => {
    setRule(prev => ({
      ...prev,
      rateLimit: { ...prev.rateLimit!, ...updates },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-waf-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/rules')}
            className="p-2 text-waf-muted hover:text-white hover:bg-waf-dark rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Rule' : 'Create New Rule'}
            </h1>
            <p className="text-waf-muted mt-1">
              {isEditing ? `Editing ${rule.ruleId}` : 'Define a new WAF protection rule'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/rules')}
            className="waf-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => saveMutation.mutate(rule)}
            disabled={saveMutation.isPending || !rule.name || !rule.pattern?.value}
            className="waf-btn-primary"
          >
            <Save className="w-5 h-5" />
            {saveMutation.isPending ? 'Saving...' : 'Save Rule'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="waf-card">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-waf-primary" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-waf-muted mb-2 block">Rule Name *</label>
                <input
                  type="text"
                  value={rule.name || ''}
                  onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., SQL Injection - Union Attack"
                  className="waf-input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-waf-muted mb-2 block">Description</label>
                <textarea
                  value={rule.description || ''}
                  onChange={(e) => setRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule protects against..."
                  rows={2}
                  className="waf-input resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Rule ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rule.ruleId || ''}
                    onChange={(e) => setRule(prev => ({ ...prev, ruleId: e.target.value }))}
                    className="waf-input font-mono"
                  />
                  <button
                    onClick={() => setRule(prev => ({ ...prev, ruleId: `WAF-${Date.now().toString(36).toUpperCase()}` }))}
                    className="p-2 text-waf-muted hover:text-white hover:bg-waf-dark rounded-lg"
                    title="Generate new ID"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Category</label>
                <select
                  value={rule.category || 'custom'}
                  onChange={(e) => setRule(prev => ({ ...prev, category: e.target.value }))}
                  className="waf-select"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pattern Configuration */}
          <div className="waf-card">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-waf-primary" />
              Pattern Configuration
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-waf-muted mb-2 block">Pattern Type</label>
                  <select
                    value={rule.pattern?.type || 'regex'}
                    onChange={(e) => updatePattern({ type: e.target.value as any })}
                    className="waf-select"
                  >
                    {patternTypes.map(pt => (
                      <option key={pt.value} value={pt.value}>{pt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-waf-muted mb-2 block">Target</label>
                  <select
                    value={rule.pattern?.target || 'uri'}
                    onChange={(e) => updatePattern({ target: e.target.value as any })}
                    className="waf-select"
                  >
                    {targetTypes.map(tt => (
                      <option key={tt.value} value={tt.value}>{tt.label}</option>
                    ))}
                  </select>
                </div>
                {(rule.pattern?.target === 'header' || rule.pattern?.target === 'cookie') && (
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Field Name</label>
                    <input
                      type="text"
                      value={rule.pattern?.field || ''}
                      onChange={(e) => updatePattern({ field: e.target.value })}
                      placeholder="e.g., User-Agent"
                      className="waf-input"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-waf-muted mb-2 block">Pattern *</label>
                <div className="border border-waf-border rounded-lg overflow-hidden">
                  <Editor
                    height="120px"
                    language={rule.pattern?.type === 'regex' ? 'plaintext' : 'plaintext'}
                    value={rule.pattern?.value || ''}
                    onChange={(value) => updatePattern({ value: value || '' })}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: 'off',
                      folding: false,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  />
                </div>
                {rule.pattern?.type === 'regex' && (
                  <p className="text-xs text-waf-muted mt-2">
                    💡 Tip: Use (?i) for case-insensitive matching
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Test Pattern */}
          <div className="waf-card">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-waf-primary" />
              Test Pattern
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Test Input</label>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter test input to check against the pattern..."
                  rows={3}
                  className="waf-input font-mono text-sm resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleTest}
                  disabled={isTesting || !rule.pattern?.value}
                  className="waf-btn-primary"
                >
                  <Play className="w-5 h-5" />
                  {isTesting ? 'Testing...' : 'Test Pattern'}
                </button>
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg',
                      testResult.matched
                        ? 'bg-threat-critical/20 text-threat-critical'
                        : 'bg-threat-low/20 text-threat-low'
                    )}
                  >
                    {testResult.matched ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    {testResult.matched ? 'Match Found!' : 'No Match'}
                    <span className="text-sm opacity-75">{testResult.details}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="waf-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-waf-primary" />
                Rate Limiting
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.rateLimit?.enabled || false}
                  onChange={(e) => updateRateLimit({ enabled: e.target.checked })}
                  className="waf-checkbox"
                />
                <span className="text-sm text-waf-muted">Enable</span>
              </label>
            </div>
            {rule.rateLimit?.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="text-sm text-waf-muted mb-2 block">Max Requests</label>
                  <input
                    type="number"
                    value={rule.rateLimit?.requests || 100}
                    onChange={(e) => updateRateLimit({ requests: parseInt(e.target.value) })}
                    min={1}
                    className="waf-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-waf-muted mb-2 block">Time Period (seconds)</label>
                  <input
                    type="number"
                    value={rule.rateLimit?.period || 60}
                    onChange={(e) => updateRateLimit({ period: parseInt(e.target.value) })}
                    min={1}
                    className="waf-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-waf-muted mb-2 block">Action</label>
                  <select
                    value={rule.rateLimit?.action || 'block'}
                    onChange={(e) => updateRateLimit({ action: e.target.value as any })}
                    className="waf-select"
                  >
                    <option value="block">Block</option>
                    <option value="challenge">Challenge</option>
                    <option value="log">Log Only</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action & Severity */}
          <div className="waf-card">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-waf-primary" />
              Action & Severity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Action</label>
                <div className="space-y-2">
                  {actions.map(action => (
                    <label
                      key={action.value}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                        rule.action === action.value
                          ? 'border-waf-primary bg-waf-primary/10'
                          : 'border-waf-border hover:border-waf-primary/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="action"
                        value={action.value}
                        checked={rule.action === action.value}
                        onChange={(e) => setRule(prev => ({ ...prev, action: e.target.value }))}
                        className="sr-only"
                      />
                      <span className={clsx('font-medium', action.color)}>{action.label}</span>
                      <span className="text-xs text-waf-muted flex-1">{action.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-waf-muted mb-2 block">Severity</label>
                <div className="grid grid-cols-2 gap-2">
                  {severities.map(sev => (
                    <label
                      key={sev.value}
                      className={clsx(
                        'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                        rule.severity === sev.value
                          ? 'border-waf-primary bg-waf-primary/10'
                          : 'border-waf-border hover:border-waf-primary/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={sev.value}
                        checked={rule.severity === sev.value}
                        onChange={(e) => setRule(prev => ({ ...prev, severity: e.target.value }))}
                        className="sr-only"
                      />
                      <span className={clsx('w-3 h-3 rounded-full', sev.color)} />
                      <span className="text-sm capitalize text-white">{sev.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enable Toggle */}
          <div className="waf-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Rule Status</h3>
                <p className="text-sm text-waf-muted mt-1">
                  {rule.enabled ? 'Rule is active and protecting' : 'Rule is disabled'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.enabled || false}
                  onChange={(e) => setRule(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-waf-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-threat-low"></div>
              </label>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="waf-card">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Templates</h2>
            <div className="space-y-2">
              {[
                { name: 'SQL Injection', pattern: "(?i)(union\\s+select|select\\s+.*\\s+from|insert\\s+into|delete\\s+from|drop\\s+table)", cat: 'sqli' },
                { name: 'XSS Attack', pattern: "(?i)(<script|javascript:|on\\w+\\s*=)", cat: 'xss' },
                { name: 'Path Traversal', pattern: "(?i)(\\.\\./|\\.\\.\\\\|%2e%2e)", cat: 'lfi' },
                { name: 'Command Injection', pattern: "(?i)(;|\\||`|\\$\\().*(cat|ls|rm|wget|curl)", cat: 'rce' },
              ].map(template => (
                <button
                  key={template.name}
                  onClick={() => {
                    setRule(prev => ({
                      ...prev,
                      name: template.name,
                      category: template.cat,
                      pattern: { ...prev.pattern!, value: template.pattern, type: 'regex' },
                    }));
                    toast.success(`Template "${template.name}" applied`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-waf-dark hover:bg-waf-primary/20 text-sm text-waf-muted hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4 inline-block mr-2" />
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
