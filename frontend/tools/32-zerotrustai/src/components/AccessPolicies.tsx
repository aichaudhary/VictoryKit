import React, { useState } from 'react';
import { 
  FileText, Plus, Edit, Trash2, ToggleLeft, ToggleRight,
  Search, Filter, Eye, Settings, Shield, Lock, Unlock,
  CheckCircle, XCircle, AlertTriangle, Clock
} from 'lucide-react';

interface AccessPolicy {
  id: string;
  name: string;
  resource: string;
  conditions: string[];
  action: string;
  enabled: boolean;
}

interface Props {
  policies: AccessPolicy[];
}

const AccessPolicies: React.FC<Props> = ({ policies }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         policy.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = selectedAction === 'all' || policy.action === selectedAction;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'enabled' && policy.enabled) || 
                         (selectedStatus === 'disabled' && !policy.enabled);
    return matchesSearch && matchesAction && matchesStatus;
  });

  const togglePolicy = (policyId: string) => {
    // In a real app, this would update the policy status
    console.log('Toggling policy:', policyId);
  };

  const deletePolicy = (policyId: string) => {
    // In a real app, this would delete the policy
    console.log('Deleting policy:', policyId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Access Policies</h1>
          <p className="text-gray-400 mt-1">Manage Zero Trust access control policies</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Policy
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Actions</option>
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
              <option value="challenge">Challenge</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing <span className="text-white font-medium">{filteredPolicies.length}</span> of <span className="text-white font-medium">{policies.length}</span> policies
        </p>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {filteredPolicies.map((policy) => (
          <div key={policy.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  policy.action === 'allow' ? 'bg-green-500/20' :
                  policy.action === 'deny' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}>
                  {policy.action === 'allow' ? 
                    <CheckCircle className={`w-6 h-6 ${
                      policy.enabled ? 'text-green-400' : 'text-gray-400'
                    }`} /> :
                    policy.action === 'deny' ? 
                    <XCircle className={`w-6 h-6 ${
                      policy.enabled ? 'text-red-400' : 'text-gray-400'
                    }`} /> :
                    <AlertTriangle className={`w-6 h-6 ${
                      policy.enabled ? 'text-yellow-400' : 'text-gray-400'
                    }`} />
                  }
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{policy.name}</h3>
                  <p className="text-sm text-gray-400">{policy.resource}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  policy.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {policy.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button 
                  onClick={() => togglePolicy(policy.id)}
                  className={`p-2 rounded-lg ${
                    policy.enabled ? 'hover:bg-red-500/20' : 'hover:bg-green-500/20'
                  }`}
                >
                  {policy.enabled ? 
                    <ToggleRight className="w-5 h-5 text-green-400" /> : 
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  }
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => deletePolicy(policy.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            {/* Conditions */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {policy.conditions.map((condition, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-gray-700 rounded-lg text-xs font-mono text-gray-300"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Action:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  policy.action === 'allow' ? 'bg-green-500/20 text-green-400' :
                  policy.action === 'deny' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {policy.action.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Last modified: 2 days ago</span>
                <span>Created by: admin</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Templates */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Policy Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Admin Access', description: 'High-privilege admin console access', icon: <Shield className="w-5 h-5" /> },
            { name: 'Data Access', description: 'Sensitive data access with MFA', icon: <Lock className="w-5 h-5" /> },
            { name: 'External Access', description: 'Partner/external user access', icon: <Unlock className="w-5 h-5" /> },
            { name: 'Time-based', description: 'Access restricted by time windows', icon: <Clock className="w-5 h-5" /> },
            { name: 'Location-based', description: 'Access based on geographic location', icon: <Settings className="w-5 h-5" /> },
            { name: 'Device Trust', description: 'Access requiring trusted devices', icon: <CheckCircle className="w-5 h-5" /> },
          ].map((template, idx) => (
            <div key={idx} className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  {template.icon}
                </div>
                <h3 className="font-medium">{template.name}</h3>
              </div>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{policies.filter(p => p.enabled).length}</p>
              <p className="text-xs text-gray-400">Active Policies</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{policies.length}</p>
              <p className="text-xs text-gray-400">Total Policies</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-lg font-bold">23</p>
              <p className="text-xs text-gray-400">Policy Violations (24h)</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold">1.2s</p>
              <p className="text-xs text-gray-400">Avg Evaluation Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessPolicies;
