import React, { useState } from 'react';
import { 
  Server, Plus, Activity, AlertTriangle, CheckCircle, 
  RefreshCw, ArrowRightLeft, Trash2, Settings
} from 'lucide-react';
import { CriticalSystem } from '../types';
import { formatMinutes, TIER_LABELS, SYSTEM_STATUS_COLORS } from '../constants';

interface SystemsManagerProps {
  systems: CriticalSystem[];
  onFailover: (id: string) => void;
  onFailback: (id: string) => void;
  onDelete: (id: string) => void;
}

const SystemsManager: React.FC<SystemsManagerProps> = ({ 
  systems, onFailover, onFailback, onDelete 
}) => {
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredSystems = systems.filter(system => {
    if (filterTier && system.tier !== filterTier) return false;
    if (filterStatus !== 'all' && system.status !== filterStatus) return false;
    return true;
  });

  const tierCounts = systems.reduce((acc, sys) => {
    acc[sys.tier] = (acc[sys.tier] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Critical Systems</h2>
          <p className="text-slate-400">Monitor and manage system recovery status</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
          <Plus className="w-4 h-4" />
          Add System
        </button>
      </div>

      {/* Tier Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((tier) => (
          <button
            key={tier}
            onClick={() => setFilterTier(filterTier === tier ? null : tier)}
            className={`p-4 rounded-xl border transition ${
              filterTier === tier 
                ? 'bg-blue-600 border-blue-500' 
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <p className="text-2xl font-bold text-white">{tierCounts[tier] || 0}</p>
            <p className="text-sm text-slate-400">Tier {tier}</p>
            <p className="text-xs text-slate-500 mt-1">{TIER_LABELS[tier as keyof typeof TIER_LABELS]}</p>
          </button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {['all', 'operational', 'degraded', 'failed', 'recovering'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filterStatus === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Systems Grid */}
      <div className="grid gap-4">
        {filteredSystems.map((system) => (
          <div key={system._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${SYSTEM_STATUS_COLORS[system.status]}`}>
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{system.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      system.tier === 1 ? 'bg-red-500/20 text-red-400' :
                      system.tier === 2 ? 'bg-orange-500/20 text-orange-400' :
                      system.tier === 3 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      Tier {system.tier}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      system.status === 'operational' ? 'bg-green-500/20 text-green-400' :
                      system.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                      system.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {system.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">{system.description}</p>
                  
                  <div className="grid grid-cols-4 gap-6 mt-4">
                    <div>
                      <p className="text-xs text-slate-500">Category</p>
                      <p className="text-sm text-slate-300">{system.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">RTO</p>
                      <p className="text-sm text-slate-300">{formatMinutes(system.rto)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">RPO</p>
                      <p className="text-sm text-slate-300">{formatMinutes(system.rpo)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Health Score</p>
                      <p className={`text-sm font-medium ${
                        system.healthScore >= 90 ? 'text-green-400' :
                        system.healthScore >= 70 ? 'text-yellow-400' :
                        system.healthScore >= 50 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {system.healthScore}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span>Owner: {system.owner}</span>
                    <span>•</span>
                    <span>Dependencies: {system.dependencies.length}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {system.status === 'operational' && (
                  <button 
                    onClick={() => onFailover(system._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
                    title="Initiate Failover"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Failover
                  </button>
                )}
                {system.status === 'recovering' && (
                  <button 
                    onClick={() => onFailback(system._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    title="Initiate Failback"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Failback
                  </button>
                )}
                <button 
                  onClick={() => onDelete(system._id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSystems.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No systems found matching filters</p>
        </div>
      )}
    </div>
  );
};

export default SystemsManager;
