import React, { useState } from 'react';
import { 
  Plug, Plus, Settings, CheckCircle, XCircle, 
  AlertTriangle, RefreshCw, Search, ExternalLink 
} from 'lucide-react';
import { Integration, IntegrationCategory } from '../types';
import { INTEGRATION_STATUS_COLORS, INTEGRATION_CATEGORIES, AVAILABLE_INTEGRATIONS } from '../constants';

interface IntegrationHubProps {
  integrations: Integration[];
  onConnect: (integrationType: string) => void;
  onDisconnect: (integrationId: string) => void;
  onSync: (integrationId: string) => void;
}

const IntegrationHub: React.FC<IntegrationHubProps> = ({
  integrations,
  onConnect,
  onDisconnect,
  onSync,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIntegrations = integrations.filter(int =>
    categoryFilter === 'all' || int.category === categoryFilter
  );

  const availableToAdd = AVAILABLE_INTEGRATIONS.filter(
    avail => !integrations.some(int => int.type === avail.id)
  ).filter(avail =>
    categoryFilter === 'all' || avail.category === categoryFilter
  ).filter(avail =>
    avail.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plug className="w-5 h-5 text-purple-400" />
            Integrations ({integrations.length})
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Connect your security tools for orchestrated response
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            categoryFilter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        {INTEGRATION_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id as IntegrationCategory)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              categoryFilter === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredIntegrations.map(integration => (
          <div
            key={integration.id}
            className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <h4 className="text-white font-medium">{integration.name}</h4>
                  <span className="text-xs text-gray-500 capitalize">{integration.category.replace('_', ' ')}</span>
                </div>
              </div>
              {getStatusIcon(integration.status)}
            </div>

            <p className="text-xs text-gray-400 mb-3 line-clamp-2">
              {integration.description}
            </p>

            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-2 py-0.5 rounded ${INTEGRATION_STATUS_COLORS[integration.status]}`}>
                {integration.status}
              </span>
              {integration.last_sync && (
                <span className="text-xs text-gray-500">
                  Synced: {new Date(integration.last_sync).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSync(integration.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-white transition-colors"
                title="Sync integration"
              >
                <RefreshCw className="w-3 h-3" />
                Sync
              </button>
              <button
                className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                title="Integration settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDisconnect(integration.id)}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                title="Disconnect integration"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Capabilities */}
            {integration.capabilities.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="flex flex-wrap gap-1">
                  {integration.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} className="text-xs px-1.5 py-0.5 bg-slate-900 text-gray-400 rounded">
                      {cap}
                    </span>
                  ))}
                  {integration.capabilities.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{integration.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-[600px] max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Add Integration</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {availableToAdd.map(avail => (
                  <button
                    key={avail.id}
                    onClick={() => {
                      onConnect(avail.id);
                      setShowAddModal(false);
                    }}
                    className="flex items-center gap-3 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg border border-slate-700 text-left transition-colors"
                  >
                    <span className="text-2xl">{avail.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{avail.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{avail.category.replace('_', ' ')}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationHub;
