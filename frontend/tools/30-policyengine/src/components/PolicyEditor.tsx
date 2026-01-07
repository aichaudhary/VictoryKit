import React, { useState } from 'react';
import { 
  FileText, Plus, Edit, Trash2, Eye, Copy, Search, Filter,
  CheckCircle, Clock, Archive, AlertCircle, ChevronDown
} from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'pending_approval' | 'active' | 'archived';
  complianceStatus: 'compliant' | 'non_compliant' | 'partial';
  framework: string;
  lastUpdated: Date;
  owner: string;
  controls: string[];
}

interface Props {
  policies: Policy[];
}

const PolicyEditor: React.FC<Props> = ({ policies }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'access_control', label: 'Access Control' },
    { id: 'data_protection', label: 'Data Protection' },
    { id: 'network_security', label: 'Network Security' },
    { id: 'incident_response', label: 'Incident Response' },
    { id: 'compliance', label: 'Compliance' },
  ];

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending_approval': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'draft': return <Edit className="w-4 h-4 text-gray-400" />;
      case 'archived': return <Archive className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'pending_approval': return 'bg-amber-500/20 text-amber-400';
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      case 'archived': return 'bg-gray-700 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Policy Editor</h1>
          <p className="text-gray-400 mt-1">Create and manage security policies</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search policies..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-violet-500"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPolicies.map((policy) => (
          <div 
            key={policy.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-violet-500/50 transition-colors cursor-pointer"
            onClick={() => setSelectedPolicy(policy)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-400" />
              </div>
              <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(policy.status)}`}>
                {getStatusIcon(policy.status)}
                {policy.status.replace('_', ' ')}
              </span>
            </div>
            
            <h3 className="font-semibold mb-1">{policy.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{policy.framework}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{policy.category.replace('_', ' ')}</span>
              <span>{policy.controls.length} controls</span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  policy.complianceStatus === 'compliant' ? 'bg-green-500' :
                  policy.complianceStatus === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-400 capitalize">{policy.complianceStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-700 rounded" onClick={(e) => { e.stopPropagation(); }}>
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-700 rounded" onClick={(e) => { e.stopPropagation(); }}>
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-700 rounded" onClick={(e) => { e.stopPropagation(); }}>
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Policy Card */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gray-800/50 border border-dashed border-gray-600 rounded-xl p-5 flex flex-col items-center justify-center min-h-[200px] hover:border-violet-500 hover:bg-gray-800 transition-colors"
        >
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <span className="text-gray-400">Create New Policy</span>
        </button>
      </div>

      {/* Policy Templates */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Policy Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Access Control', framework: 'NIST 800-53', controls: 12 },
            { name: 'Data Classification', framework: 'ISO 27001', controls: 8 },
            { name: 'Incident Response', framework: 'NIST CSF', controls: 15 },
            { name: 'Password Policy', framework: 'CIS Controls', controls: 6 },
          ].map((template, idx) => (
            <div key={idx} className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
              <h4 className="font-medium mb-1">{template.name}</h4>
              <p className="text-xs text-gray-400 mb-2">{template.framework}</p>
              <span className="text-xs text-violet-400">{template.controls} controls</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PolicyEditor;
