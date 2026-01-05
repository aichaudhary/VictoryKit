import React, { useState } from 'react';
import { 
  Building2, Plus, MapPin, Server, Wifi, Clock, 
  CheckCircle, AlertTriangle, Trash2, RefreshCw
} from 'lucide-react';
import { RecoverySite } from '../types';
import { SITE_TYPE_COLORS, formatMinutes, formatDate } from '../constants';

interface SitesManagerProps {
  sites: RecoverySite[];
  onTestConnectivity: (id: string) => void;
  onDelete: (id: string) => void;
}

const SitesManager: React.FC<SitesManagerProps> = ({ sites, onTestConnectivity, onDelete }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredSites = sites.filter(site => 
    filterType === 'all' || site.type === filterType
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Recovery Sites</h2>
          <p className="text-slate-400">Manage primary and disaster recovery locations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
          <Plus className="w-4 h-4" />
          Add Site
        </button>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2">
        {['all', 'primary', 'hot', 'warm', 'cold', 'cloud'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filterType === type 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {type === 'all' ? 'All Sites' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Sites Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredSites.map((site) => (
          <div key={site._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${SITE_TYPE_COLORS[site.type]}`}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{site.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${SITE_TYPE_COLORS[site.type]} bg-opacity-20`}>
                      {site.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{site.location.city}, {site.location.country}</span>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                site.status === 'active' ? 'bg-green-500/20 text-green-400' :
                site.status === 'standby' ? 'bg-blue-500/20 text-blue-400' :
                site.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {site.status === 'active' && <CheckCircle className="w-3 h-3" />}
                {site.status === 'offline' && <AlertTriangle className="w-3 h-3" />}
                {site.status.toUpperCase()}
              </div>
            </div>

            {/* Capacity Info */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Server className="w-3 h-3" />
                  Servers
                </div>
                <p className="text-lg font-semibold text-white">{site.capacity.servers}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Wifi className="w-3 h-3" />
                  Storage
                </div>
                <p className="text-lg font-semibold text-white">{site.capacity.storage}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  Failover
                </div>
                <p className="text-lg font-semibold text-white">{formatMinutes(site.failoverTime)}</p>
              </div>
            </div>

            {/* Systems Count */}
            <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
              <span>{site.systems.length} systems assigned</span>
              {site.lastFailoverTest && (
                <span>Last test: {formatDate(site.lastFailoverTest)}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onTestConnectivity(site._id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
                Test Connectivity
              </button>
              <button 
                onClick={() => onDelete(site._id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No recovery sites found</p>
        </div>
      )}
    </div>
  );
};

export default SitesManager;
