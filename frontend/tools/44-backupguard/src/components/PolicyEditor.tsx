import React, { useState } from 'react';
import { FileCheck, Plus, Trash2, Edit, Play, Shield } from 'lucide-react';
import { RetentionPolicy } from '../types';

interface PolicyEditorProps {
  policies: RetentionPolicy[];
  onApply: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: (data: Partial<RetentionPolicy>) => void;
  isLoading: boolean;
}

const PolicyEditor: React.FC<PolicyEditorProps> = ({
  policies,
  onApply,
  onDelete,
  onCreate,
  isLoading,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    daily: 7,
    weekly: 4,
    monthly: 12,
    yearly: 3,
    dailyEnabled: true,
    weeklyEnabled: true,
    monthlyEnabled: true,
    yearlyEnabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: formData.name,
      description: formData.description,
      status: 'active',
      priority: policies.length + 1,
      retention: {
        daily: { count: formData.daily, enabled: formData.dailyEnabled },
        weekly: { count: formData.weekly, enabled: formData.weeklyEnabled },
        monthly: { count: formData.monthly, enabled: formData.monthlyEnabled },
        yearly: { count: formData.yearly, enabled: formData.yearlyEnabled },
      },
    });
    setShowForm(false);
    setFormData({
      name: '', description: '', daily: 7, weekly: 4, monthly: 12, yearly: 3,
      dailyEnabled: true, weeklyEnabled: true, monthlyEnabled: true, yearlyEnabled: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Retention Policies</h2>
          <p className="text-sm text-slate-400">Configure backup retention using GFS (Grandfather-Father-Son) strategy</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Policy
        </button>
      </div>

      {/* Create Policy Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-medium text-white mb-4">New Retention Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Policy Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="Production Database Policy"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="HIPAA-compliant retention for medical data"
              />
            </div>
          </div>

          <h4 className="text-sm font-medium text-slate-300 mb-3">Retention Schedule (GFS)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Daily</span>
                <input
                  type="checkbox"
                  checked={formData.dailyEnabled}
                  onChange={(e) => setFormData({ ...formData, dailyEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
              <input
                type="number"
                value={formData.daily}
                onChange={(e) => setFormData({ ...formData, daily: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-600 rounded text-white text-center"
                min="0"
                max="365"
              />
              <p className="text-xs text-slate-500 mt-1 text-center">copies</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Weekly</span>
                <input
                  type="checkbox"
                  checked={formData.weeklyEnabled}
                  onChange={(e) => setFormData({ ...formData, weeklyEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
              <input
                type="number"
                value={formData.weekly}
                onChange={(e) => setFormData({ ...formData, weekly: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-600 rounded text-white text-center"
                min="0"
                max="52"
              />
              <p className="text-xs text-slate-500 mt-1 text-center">copies</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Monthly</span>
                <input
                  type="checkbox"
                  checked={formData.monthlyEnabled}
                  onChange={(e) => setFormData({ ...formData, monthlyEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
              <input
                type="number"
                value={formData.monthly}
                onChange={(e) => setFormData({ ...formData, monthly: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-600 rounded text-white text-center"
                min="0"
                max="120"
              />
              <p className="text-xs text-slate-500 mt-1 text-center">copies</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Yearly</span>
                <input
                  type="checkbox"
                  checked={formData.yearlyEnabled}
                  onChange={(e) => setFormData({ ...formData, yearlyEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
              <input
                type="number"
                value={formData.yearly}
                onChange={(e) => setFormData({ ...formData, yearly: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-600 rounded text-white text-center"
                min="0"
                max="99"
              />
              <p className="text-xs text-slate-500 mt-1 text-center">copies</p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
              Create Policy
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Policies List */}
      <div className="space-y-4">
        {policies.map((policy) => (
          <div key={policy._id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-cyan-500/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <FileCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{policy.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      policy.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {policy.status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">
                      Priority: {policy.priority}
                    </span>
                  </div>
                  {policy.description && (
                    <p className="text-sm text-slate-400 mt-1">{policy.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Retention Display */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <RetentionBadge label="Daily" value={policy.retention.daily} />
              <RetentionBadge label="Weekly" value={policy.retention.weekly} />
              <RetentionBadge label="Monthly" value={policy.retention.monthly} />
              <RetentionBadge label="Yearly" value={policy.retention.yearly} />
            </div>

            {/* Compliance */}
            {policy.compliance?.framework && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-blue-500/10 rounded-lg">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Compliance: {policy.compliance.framework}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-slate-700">
              <button
                onClick={() => onApply(policy._id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
              >
                <Play className="w-4 h-4" /> Apply Now
              </button>
              <button
                onClick={() => onDelete(policy._id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}

        {policies.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No retention policies configured</p>
            <p className="text-sm">Create a policy to automatically manage backup retention</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RetentionBadge: React.FC<{
  label: string;
  value: { count: number; enabled: boolean };
}> = ({ label, value }) => (
  <div className={`text-center p-2 rounded-lg ${value.enabled ? 'bg-slate-700' : 'bg-slate-800 opacity-50'}`}>
    <div className="text-lg font-bold text-white">{value.count}</div>
    <div className="text-xs text-slate-400">{label}</div>
    {!value.enabled && <div className="text-xs text-red-400">Disabled</div>}
  </div>
);

export default PolicyEditor;
