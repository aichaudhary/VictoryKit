import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Play,
  GripVertical,
  X,
  AlertTriangle,
  CheckCircle,
  Code,
} from 'lucide-react';
import { rulesApi } from '../services/api';
import { Rule, BotAction } from '../types';
import toast from 'react-hot-toast';

export default function RulesEngine() {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [testRule, setTestRule] = useState<Rule | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: () => rulesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Rule>) => rulesApi.create(data as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      setIsCreating(false);
      toast.success('Rule created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Rule> }) =>
      rulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      setEditingRule(null);
      toast.success('Rule updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: rulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Rule deleted');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: rulesApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });

  const testMutation = useMutation({
    mutationFn: ({ id, testData }: { id: string; testData: any }) =>
      rulesApi.test(id, testData),
    onSuccess: (result) => {
      setTestResult(result.data);
    },
  });

  // Demo rules
  const demoRules: Rule[] = [
    {
      _id: 'rule-1',
      name: 'Block Known Bot User Agents',
      description: 'Block requests with common bot user agents',
      enabled: true,
      priority: 1,
      conditions: [
        { field: 'userAgent', operator: 'contains', value: 'python-requests' },
        { field: 'userAgent', operator: 'contains', value: 'curl' },
        { field: 'userAgent', operator: 'contains', value: 'wget' },
      ],
      conditionLogic: 'or',
      action: 'block',
      rateLimit: undefined,
      matchCount: 45623,
      lastMatched: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'rule-2',
      name: 'Rate Limit Login Attempts',
      description: 'Limit login attempts to prevent credential stuffing',
      enabled: true,
      priority: 2,
      conditions: [
        { field: 'path', operator: 'equals', value: '/api/login' },
        { field: 'method', operator: 'equals', value: 'POST' },
      ],
      conditionLogic: 'and',
      action: 'rate_limit',
      rateLimit: { requests: 5, window: 60 },
      matchCount: 12456,
      lastMatched: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'rule-3',
      name: 'Challenge High Bot Score',
      description: 'Issue CAPTCHA challenge for high bot scores',
      enabled: true,
      priority: 3,
      conditions: [
        { field: 'botScore', operator: 'gte', value: '70' },
      ],
      conditionLogic: 'and',
      action: 'challenge',
      matchCount: 8932,
      lastMatched: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'rule-4',
      name: 'Allow Google Bot',
      description: 'Whitelist legitimate Googlebot traffic',
      enabled: true,
      priority: 0,
      conditions: [
        { field: 'userAgent', operator: 'contains', value: 'Googlebot' },
        { field: 'reverseDns', operator: 'endsWith', value: '.googlebot.com' },
      ],
      conditionLogic: 'and',
      action: 'allow',
      matchCount: 2341,
      lastMatched: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'rule-5',
      name: 'Monitor Suspicious IPs',
      description: 'Log and monitor requests from suspicious IP ranges',
      enabled: false,
      priority: 5,
      conditions: [
        { field: 'geoCountry', operator: 'in', value: 'CN,RU,KP' },
      ],
      conditionLogic: 'and',
      action: 'monitor',
      matchCount: 15678,
      lastMatched: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const rules = rulesData?.data?.data || rulesData?.data || demoRules;

  const filteredRules = rules.filter((rule: Rule) =>
    rule.name.toLowerCase().includes(search.toLowerCase()) ||
    rule.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to get the action type string from action (can be string or object)
  const getActionType = (action: Rule['action']): BotAction => {
    if (typeof action === 'string') return action;
    return action.type;
  };

  const getActionBadge = (action: Rule['action']) => {
    const actionType = getActionType(action);
    switch (actionType) {
      case 'block':
        return 'bg-red-500/20 text-red-400';
      case 'allow':
        return 'bg-green-500/20 text-green-400';
      case 'challenge':
        return 'bg-orange-500/20 text-orange-400';
      case 'rate_limit':
        return 'bg-blue-500/20 text-blue-400';
      case 'monitor':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: '',
    description: '',
    enabled: true,
    priority: 10,
    conditions: [{ field: 'userAgent', operator: 'contains', value: '' }],
    conditionLogic: 'and',
    action: 'block',
  });

  const addCondition = () => {
    setNewRule(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), { field: 'userAgent', operator: 'contains', value: '' }],
    }));
  };

  const removeCondition = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index),
    }));
  };

  const updateCondition = (index: number, field: string, value: string) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Rules Engine</h1>
          <p className="text-slate-400 mt-1">Create and manage bot detection rules</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus size={18} />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRules.map((rule: Rule, index: number) => (
            <motion.div
              key={rule._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-slate-800 rounded-lg border ${
                rule.enabled ? 'border-slate-700' : 'border-slate-700 opacity-60'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="cursor-move text-slate-500 hover:text-slate-300">
                      <GripVertical size={20} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                        Priority: {rule.priority}
                      </span>
                      <div>
                        <h3 className="text-lg font-medium text-white">{rule.name}</h3>
                        <p className="text-sm text-slate-400">{rule.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionBadge(rule.action)}`}>
                      {getActionType(rule.action).replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => toggleMutation.mutate(rule._id)}
                      className="text-slate-400 hover:text-white"
                    >
                      {rule.enabled ? (
                        <ToggleRight size={24} className="text-green-400" />
                      ) : (
                        <ToggleLeft size={24} />
                      )}
                    </button>
                    <button
                      onClick={() => setTestRule(rule)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                    >
                      <Play size={18} />
                    </button>
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this rule?')) {
                          deleteMutation.mutate(rule._id);
                        }
                      }}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Conditions */}
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
                    <Code size={14} />
                    <span>Conditions ({rule.conditionLogic?.toUpperCase()})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rule.conditions.map((condition, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-600 text-slate-300 rounded text-xs font-mono"
                      >
                        {condition.field} {condition.operator} "{condition.value}"
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 flex items-center space-x-6 text-sm text-slate-400">
                  <span>Matched: {rule.matchCount?.toLocaleString()} times</span>
                  {rule.lastMatched && (
                    <span>Last: {new Date(rule.lastMatched).toLocaleString()}</span>
                  )}
                  {rule.rateLimit && (
                    <span className="text-blue-400">
                      Rate Limit: {rule.rateLimit.requests}/{rule.rateLimit.window}s
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Rule Modal */}
      <AnimatePresence>
        {(isCreating || editingRule) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">
                  {editingRule ? 'Edit Rule' : 'Create New Rule'}
                </h2>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingRule(null);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Rule Name</label>
                  <input
                    type="text"
                    value={editingRule?.name || newRule.name}
                    onChange={(e) => {
                      if (editingRule) {
                        setEditingRule({ ...editingRule, name: e.target.value });
                      } else {
                        setNewRule({ ...newRule, name: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g., Block Suspicious User Agents"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Description</label>
                  <textarea
                    value={editingRule?.description || newRule.description}
                    onChange={(e) => {
                      if (editingRule) {
                        setEditingRule({ ...editingRule, description: e.target.value });
                      } else {
                        setNewRule({ ...newRule, description: e.target.value });
                      }
                    }}
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    placeholder="Describe what this rule does..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Priority</label>
                    <input
                      type="number"
                      value={editingRule?.priority || newRule.priority}
                      onChange={(e) => {
                        const priority = parseInt(e.target.value);
                        if (editingRule) {
                          setEditingRule({ ...editingRule, priority });
                        } else {
                          setNewRule({ ...newRule, priority });
                        }
                      }}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Action</label>
                    <select
                      value={getActionType(editingRule?.action || newRule.action || 'block')}
                      onChange={(e) => {
                        const actionValue = e.target.value as BotAction;
                        if (editingRule) {
                          setEditingRule({ ...editingRule, action: actionValue });
                        } else {
                          setNewRule({ ...newRule, action: actionValue });
                        }
                      }}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="block">Block</option>
                      <option value="allow">Allow</option>
                      <option value="challenge">Challenge</option>
                      <option value="rate_limit">Rate Limit</option>
                      <option value="monitor">Monitor</option>
                    </select>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-400">Conditions</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={editingRule?.conditionLogic || newRule.conditionLogic}
                        onChange={(e) => {
                          const logic = e.target.value as Rule['conditionLogic'];
                          if (editingRule) {
                            setEditingRule({ ...editingRule, conditionLogic: logic });
                          } else {
                            setNewRule({ ...newRule, conditionLogic: logic });
                          }
                        }}
                        className="text-xs bg-slate-700 border border-slate-600 text-white rounded px-2 py-1"
                      >
                        <option value="and">Match ALL</option>
                        <option value="or">Match ANY</option>
                      </select>
                      <button
                        onClick={addCondition}
                        className="text-xs text-orange-400 hover:text-orange-300"
                      >
                        + Add Condition
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(editingRule?.conditions || newRule.conditions)?.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <select
                          value={condition.field}
                          onChange={(e) => updateCondition(index, 'field', e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                        >
                          <option value="userAgent">User Agent</option>
                          <option value="ipAddress">IP Address</option>
                          <option value="path">Path</option>
                          <option value="method">Method</option>
                          <option value="botScore">Bot Score</option>
                          <option value="geoCountry">Country</option>
                          <option value="reverseDns">Reverse DNS</option>
                        </select>
                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                          className="w-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                        >
                          <option value="equals">equals</option>
                          <option value="contains">contains</option>
                          <option value="startsWith">starts with</option>
                          <option value="endsWith">ends with</option>
                          <option value="regex">regex</option>
                          <option value="gte">≥</option>
                          <option value="lte">≤</option>
                          <option value="in">in</option>
                        </select>
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                        />
                        <button
                          onClick={() => removeCondition(index)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingRule(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editingRule) {
                        updateMutation.mutate({ id: editingRule._id, data: editingRule });
                      } else {
                        createMutation.mutate(newRule as Rule);
                      }
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Rule Modal */}
      <AnimatePresence>
        {testRule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Test Rule: {testRule.name}</h2>
                <button
                  onClick={() => {
                    setTestRule(null);
                    setTestResult(null);
                    setTestInput('');
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Test Input (JSON)</label>
                  <textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    rows={6}
                    placeholder={`{
  "userAgent": "python-requests/2.28.0",
  "ipAddress": "192.168.1.1",
  "path": "/api/login",
  "method": "POST",
  "botScore": 85
}`}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(testInput);
                      testMutation.mutate({ id: testRule._id, testData: parsed });
                    } catch {
                      toast.error('Invalid JSON');
                    }
                  }}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center space-x-2"
                >
                  <Play size={18} />
                  <span>Run Test</span>
                </button>

                {testResult && (
                  <div className={`p-4 rounded-lg border ${
                    testResult.matched 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-slate-700/50 border-slate-600'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {testResult.matched ? (
                        <CheckCircle className="text-green-400" size={20} />
                      ) : (
                        <AlertTriangle className="text-slate-400" size={20} />
                      )}
                      <span className={`font-medium ${testResult.matched ? 'text-green-400' : 'text-slate-400'}`}>
                        {testResult.matched ? 'Rule Matched!' : 'No Match'}
                      </span>
                    </div>
                    {testResult.matched && (
                      <p className="text-sm text-slate-300">
                        Action: <span className={`font-medium ${getActionBadge(testResult.action as BotAction)}`}>{testResult.action}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
