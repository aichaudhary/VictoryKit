import React, { useState } from 'react';
import { Shield, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Filter, Search } from 'lucide-react';

interface RuleManagerProps {
  rules: any[];
  vendors: any[];
  onCreateRule: (rule: any) => void;
  onUpdateRule: (ruleId: string, updates: any) => void;
  onDeleteRule: (ruleId: string) => void;
}

const RuleManager: React.FC<RuleManagerProps> = ({
  rules,
  vendors,
  onCreateRule,
  onUpdateRule,
  onDeleteRule
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRules = rules.filter(rule => {
    const matchesFilter = filter === 'all' ||
      (filter === 'enabled' && rule.enabled) ||
      (filter === 'disabled' && !rule.enabled) ||
      (filter === 'vendor' && rule.vendor_id);

    const matchesSearch = !searchTerm ||
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCreateRule = (ruleData: any) => {
    onCreateRule(ruleData);
    setShowCreateForm(false);
  };

  const handleUpdateRule = (ruleId: string, updates: any) => {
    onUpdateRule(ruleId, updates);
    setEditingRule(null);
  };

  const RuleForm: React.FC<{
    rule?: any;
    onSubmit: (rule: any) => void;
    onCancel: () => void;
  }> = ({ rule, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(rule || {
      name: '',
      description: '',
      vendor_id: '',
      source_ip: '',
      destination_ip: '',
      protocol: 'tcp',
      port: '',
      action: 'allow',
      priority: 1,
      enabled: true
    });

    return (
      <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">
          {rule ? 'Edit Rule' : 'Create New Rule'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rule Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="Enter rule name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Vendor</label>
            <select
              value={formData.vendor_id}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Select Vendor</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Source IP</label>
            <input
              type="text"
              value={formData.source_ip}
              onChange={(e) => setFormData({ ...formData, source_ip: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="192.168.1.0/24 or any"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Destination IP</label>
            <input
              type="text"
              value={formData.destination_ip}
              onChange={(e) => setFormData({ ...formData, destination_ip: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="10.0.0.0/8 or any"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Protocol</label>
            <select
              value={formData.protocol}
              onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
            >
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="icmp">ICMP</option>
              <option value="any">Any</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Port</label>
            <input
              type="text"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="80, 443, 1-1024 or any"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Action</label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
            >
              <option value="allow">Allow</option>
              <option value="block">Block</option>
              <option value="log">Log Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Priority</label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              min="1"
              max="100"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white h-20"
            placeholder="Rule description"
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded border-blue-500/30"
            />
            <span className="text-sm text-gray-400">Enable Rule</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(formData)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              {rule ? 'Update' : 'Create'} Rule
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Firewall Rules</h2>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            {filteredRules.length} rules
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-blue-500/30 rounded-lg text-sm w-64"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-blue-500/30 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Rules</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
            <option value="vendor">By Vendor</option>
          </select>

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingRule) && (
        <RuleForm
          rule={editingRule}
          onSubmit={editingRule ? (data) => handleUpdateRule(editingRule.id, data) : handleCreateRule}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingRule(null);
          }}
        />
      )}

      {/* Rules Table */}
      <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source → Dest</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Protocol/Port</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredRules.map((rule) => {
                const vendor = vendors.find(v => v.id === rule.vendor_id);
                return (
                  <tr key={rule.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onUpdateRule(rule.id, { enabled: !rule.enabled })}
                        className="flex items-center"
                      >
                        {rule.enabled ? (
                          <ToggleRight className="w-6 h-6 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{rule.name}</p>
                        <p className="text-xs text-gray-400">{rule.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {vendor?.name || 'Global'}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-300">
                      {rule.source_ip || 'any'} → {rule.destination_ip || 'any'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {rule.protocol}/{rule.port || 'any'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        rule.action === 'allow'
                          ? 'bg-green-500/20 text-green-400'
                          : rule.action === 'block'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {rule.priority}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="p-1 hover:bg-slate-600 rounded"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => onDeleteRule(rule.id)}
                          className="p-1 hover:bg-slate-600 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRules.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400">No firewall rules found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Your First Rule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleManager;