import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Save,
  ArrowLeft,
  Copy,
  Check,
  X,
  AlertTriangle,
  Info,
  Shield,
  Globe,
  Code,
  FileText,
  Zap,
  TestTube,
} from 'lucide-react';
import clsx from 'clsx';

const BASE_PATH = '/maula';
const policiesPath = `${BASE_PATH}/policies`;

// Default policy template
const defaultPolicyCode = `{
  "name": "New Security Policy",
  "version": "1.0.0",
  "description": "Custom security policy for API protection",
  
  "conditions": {
    "match": "all",
    "rules": [
      {
        "field": "request.path",
        "operator": "matches",
        "value": "/api/v1/*"
      },
      {
        "field": "request.method",
        "operator": "in",
        "value": ["POST", "PUT", "PATCH", "DELETE"]
      }
    ]
  },
  
  "actions": [
    {
      "type": "require_authentication",
      "config": {
        "methods": ["jwt", "oauth2"],
        "header": "Authorization"
      }
    },
    {
      "type": "rate_limit",
      "config": {
        "requests": 100,
        "window": "1m",
        "key": "client_ip"
      }
    },
    {
      "type": "validate_request",
      "config": {
        "schema": "openapi",
        "strict": true
      }
    }
  ],
  
  "on_violation": {
    "action": "block",
    "response": {
      "status": 403,
      "body": {
        "error": "Policy violation",
        "code": "POLICY_BLOCKED"
      }
    },
    "log": true,
    "alert": {
      "severity": "high",
      "channels": ["slack", "email"]
    }
  }
}`;

// Mock existing policy
const mockPolicy = {
  id: 'policy-1',
  name: 'Rate Limiting - Standard',
  description: 'Default rate limiting policy for all public APIs',
  type: 'rate-limit',
  category: 'traffic',
  status: 'active',
  version: '2.1.0',
  code: `{
  "name": "Rate Limiting - Standard",
  "version": "2.1.0",
  "description": "Default rate limiting policy for all public APIs",
  
  "conditions": {
    "match": "any",
    "rules": [
      {
        "field": "request.path",
        "operator": "starts_with",
        "value": "/api/v1/"
      },
      {
        "field": "request.path",
        "operator": "starts_with",
        "value": "/api/v2/"
      }
    ]
  },
  
  "actions": [
    {
      "type": "rate_limit",
      "config": {
        "requests": 100,
        "window": "1m",
        "key": "client_ip",
        "burst": 20
      }
    },
    {
      "type": "rate_limit",
      "config": {
        "requests": 1000,
        "window": "1h",
        "key": "api_key"
      }
    }
  ],
  
  "on_violation": {
    "action": "block",
    "response": {
      "status": 429,
      "body": {
        "error": "Rate limit exceeded",
        "retry_after": "\${remaining_seconds}"
      },
      "headers": {
        "Retry-After": "\${remaining_seconds}",
        "X-RateLimit-Limit": "\${limit}",
        "X-RateLimit-Remaining": "\${remaining}"
      }
    },
    "log": true
  }
}`,
  scope: ['api-1', 'api-2', 'api-3'],
  lastModified: '2024-03-10T14:30:00Z',
  modifiedBy: 'admin@company.com',
};

const availableAPIs = [
  { id: 'api-1', name: 'User Management API' },
  { id: 'api-2', name: 'Payment Gateway' },
  { id: 'api-3', name: 'Product Catalog GraphQL' },
  { id: 'api-4', name: 'Real-time Notifications' },
  { id: 'api-5', name: 'Legacy Orders API' },
];

const policyCategories = [
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'traffic', name: 'Traffic Control', icon: Zap },
  { id: 'access', name: 'Access Control', icon: Globe },
  { id: 'data', name: 'Data Validation', icon: FileText },
  { id: 'compliance', name: 'Compliance', icon: Check },
];

export default function PolicyEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [policyName, setPolicyName] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [policyCategory, setPolicyCategory] = useState('security');
  const [policyCode, setPolicyCode] = useState(defaultPolicyCode);
  const [selectedAPIs, setSelectedAPIs] = useState<string[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>('draft');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing policy
  useEffect(() => {
    if (!isNew && id) {
      // Simulate loading policy
      setPolicyName(mockPolicy.name);
      setPolicyDescription(mockPolicy.description);
      setPolicyCategory(mockPolicy.category);
      setPolicyCode(mockPolicy.code);
      setSelectedAPIs(mockPolicy.scope);
      setStatus(mockPolicy.status as 'active' | 'inactive' | 'draft');
    }
  }, [id, isNew]);

  // Validate JSON on code change
  useEffect(() => {
    try {
      JSON.parse(policyCode);
      setValidationErrors([]);
    } catch (e: any) {
      setValidationErrors([e.message]);
    }
    setHasChanges(true);
  }, [policyCode]);

  const handleSave = async () => {
    if (validationErrors.length > 0) return;
    
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
    
    if (isNew) {
      navigate('/policies');
    }
  };

  const handleTest = async () => {
    if (validationErrors.length > 0) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setTestResult({
      success: true,
      matched: 42,
      blocked: 3,
      allowed: 39,
      duration: 156,
      sample: {
        request: { path: '/api/v1/users', method: 'POST', ip: '192.168.1.1' },
        result: 'allowed',
        applied_rules: ['rate_limit', 'validate_request'],
      },
    });
    
    setIsTesting(false);
  };

  const toggleAPI = (apiId: string) => {
    if (selectedAPIs.includes(apiId)) {
      setSelectedAPIs(selectedAPIs.filter((id) => id !== apiId));
    } else {
      setSelectedAPIs([...selectedAPIs, apiId]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to={policiesPath}
            className="p-2 hover:bg-api-dark rounded-lg text-api-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isNew ? 'Create New Policy' : 'Edit Policy'}
            </h2>
            <p className="text-sm text-api-muted">
              {isNew ? 'Define security rules for your APIs' : `Last modified ${new Date(mockPolicy.lastModified).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleTest}
            disabled={isTesting || validationErrors.length > 0}
            className="api-btn bg-api-dark text-api-muted hover:text-white flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <TestTube className="w-4 h-4" />
                </motion.div>
                Testing...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4" />
                Test Policy
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || validationErrors.length > 0}
            className="api-btn api-btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Save className="w-4 h-4" />
                </motion.div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Policy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left Panel - Settings */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
          {/* Basic Info */}
          <div className="api-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Policy Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-api-muted mb-1">Name</label>
                <input
                  type="text"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="Policy name"
                  className="api-input w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs text-api-muted mb-1">Description</label>
                <textarea
                  value={policyDescription}
                  onChange={(e) => setPolicyDescription(e.target.value)}
                  placeholder="Brief description of what this policy does"
                  rows={3}
                  className="api-input w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-api-muted mb-1">Category</label>
                <select
                  value={policyCategory}
                  onChange={(e) => setPolicyCategory(e.target.value)}
                  className="api-input w-full"
                >
                  {policyCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-api-muted mb-1">Status</label>
                <div className="flex gap-2">
                  {(['draft', 'active', 'inactive'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={clsx(
                        'flex-1 px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                        status === s
                          ? s === 'active'
                            ? 'border-green-500 bg-green-500/20 text-green-400'
                            : s === 'inactive'
                            ? 'border-gray-500 bg-gray-500/20 text-gray-400'
                            : 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                          : 'border-api-border hover:border-api-primary/50'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scope */}
          <div className="api-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Apply To</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => {
                    setApplyToAll(e.target.checked);
                    if (e.target.checked) setSelectedAPIs([]);
                  }}
                  className="w-4 h-4 rounded border-api-border"
                />
                <span className="text-sm text-white">All APIs</span>
              </label>

              {!applyToAll && (
                <div className="space-y-2 pt-2">
                  {availableAPIs.map((api) => (
                    <label
                      key={api.id}
                      className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-api-dark"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAPIs.includes(api.id)}
                        onChange={() => toggleAPI(api.id)}
                        className="w-4 h-4 rounded border-api-border"
                      />
                      <span className="text-sm text-api-muted">{api.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="api-card p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Test Results
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <X className="w-5 h-5 text-red-400" />
                  )}
                  <span className={clsx(
                    'text-sm font-medium',
                    testResult.success ? 'text-green-400' : 'text-red-400'
                  )}>
                    {testResult.success ? 'Policy Valid' : 'Policy Invalid'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-api-dark rounded text-center">
                    <p className="text-lg font-bold text-white">{testResult.matched}</p>
                    <p className="text-xs text-api-muted">Matched</p>
                  </div>
                  <div className="p-2 bg-green-500/10 border border-green-500/30 rounded text-center">
                    <p className="text-lg font-bold text-green-400">{testResult.allowed}</p>
                    <p className="text-xs text-api-muted">Allowed</p>
                  </div>
                  <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-center">
                    <p className="text-lg font-bold text-red-400">{testResult.blocked}</p>
                    <p className="text-xs text-api-muted">Blocked</p>
                  </div>
                </div>

                <div className="text-xs text-api-muted">
                  <p>Tested against last 24h traffic</p>
                  <p>Duration: {testResult.duration}ms</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Panel - Code Editor */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="api-card flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-api-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-api-primary" />
                <span className="text-sm font-medium text-white">Policy Rules (JSON)</span>
              </div>
              <div className="flex items-center gap-2">
                {validationErrors.length > 0 ? (
                  <span className="text-xs text-red-400 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Invalid JSON
                  </span>
                ) : (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Valid
                  </span>
                )}
                <button className="p-1.5 hover:bg-api-dark rounded text-api-muted hover:text-white">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={policyCode}
                onChange={(value) => setPolicyCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  padding: { top: 16 },
                }}
              />
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-3 border-t border-api-border bg-red-500/10">
                {validationErrors.map((error, i) => (
                  <p key={i} className="text-sm text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Quick Reference */}
          <div className="mt-4 p-4 bg-api-dark/50 rounded-lg border border-api-border">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-api-primary" />
              <span className="text-sm font-medium text-white">Quick Reference</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-api-muted">
              <div>
                <p className="font-medium text-white mb-1">Operators</p>
                <p>equals, not_equals</p>
                <p>contains, matches</p>
                <p>in, not_in</p>
                <p>starts_with, ends_with</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Fields</p>
                <p>request.path</p>
                <p>request.method</p>
                <p>request.headers.*</p>
                <p>client.ip</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Actions</p>
                <p>rate_limit</p>
                <p>require_authentication</p>
                <p>validate_request</p>
                <p>transform_response</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Variables</p>
                <p>${'{'}limit{'}'}</p>
                <p>${'{'}remaining{'}'}</p>
                <p>${'{'}client_ip{'}'}</p>
                <p>${'{'}timestamp{'}'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
