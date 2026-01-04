import React, { useState } from 'react';
import { Database, Cloud, Server, Plus, Trash2, RefreshCw, Check, X, Wifi, WifiOff } from 'lucide-react';
import { StorageLocation } from '../types';
import { formatBytes, STORAGE_TYPES } from '../constants';

interface StorageManagerProps {
  locations: StorageLocation[];
  onTestConnection: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: (data: Partial<StorageLocation>) => void;
  isLoading: boolean;
}

const StorageManager: React.FC<StorageManagerProps> = ({
  locations,
  onTestConnection,
  onDelete,
  onCreate,
  isLoading,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 's3',
    endpoint: '',
    region: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({ name: '', type: 's3', endpoint: '', region: '' });
    setShowForm(false);
  };

  const getStorageIcon = (type: string) => {
    switch (type) {
      case 's3':
      case 'azure_blob':
      case 'gcs': return <Cloud className="w-5 h-5 text-cyan-400" />;
      case 'nfs':
      case 'smb':
      case 'sftp': return <Server className="w-5 h-5 text-purple-400" />;
      default: return <Database className="w-5 h-5 text-green-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Storage Locations</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Storage
        </button>
      </div>

      {/* Add Storage Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-medium text-white mb-4">Add New Storage Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="Production S3 Bucket"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {STORAGE_TYPES.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Endpoint / Path</label>
              <input
                type="text"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="s3://bucket-name or /mnt/backup"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="us-east-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
              Create Storage
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

      {/* Storage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((storage) => (
          <div key={storage._id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-cyan-500/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-lg">
                  {getStorageIcon(storage.type)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{storage.name}</h3>
                  <p className="text-sm text-slate-400">{storage.type.toUpperCase()}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                storage.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                storage.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {storage.status}
              </span>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 mb-3">
              {storage.connectivity?.isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-slate-400">
                {storage.connectivity?.isConnected ? 'Connected' : 'Disconnected'}
                {storage.connectivity?.latencyMs && ` (${storage.connectivity.latencyMs}ms)`}
              </span>
            </div>

            {/* Capacity Bar */}
            {storage.capacity && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Capacity</span>
                  <span>
                    {formatBytes(storage.capacity.usedBytes)} / {formatBytes(storage.capacity.totalBytes)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      (storage.capacity.usedBytes / storage.capacity.totalBytes) > 0.9 ? 'bg-red-500' :
                      (storage.capacity.usedBytes / storage.capacity.totalBytes) > 0.7 ? 'bg-yellow-500' :
                      'bg-gradient-to-r from-cyan-500 to-purple-500'
                    }`}
                    style={{ width: `${(storage.capacity.usedBytes / storage.capacity.totalBytes) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onTestConnection(storage._id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Test
              </button>
              <button
                onClick={() => onDelete(storage._id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && !isLoading && (
        <div className="text-center py-12 text-slate-400">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No storage locations configured</p>
          <p className="text-sm">Add a storage location to start backing up your data</p>
        </div>
      )}
    </div>
  );
};

export default StorageManager;
