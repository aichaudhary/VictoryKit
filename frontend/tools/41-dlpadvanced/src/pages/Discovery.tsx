/**
 * Data Discovery & Scanning Page
 * Initiate scans and view data inventory
 */

import React, { useState, useEffect } from 'react';
import { Search, Play, Pause, FileSearch, FolderOpen, Database, Cloud } from 'lucide-react';
import { startScan, getScanStatus, getScanResults, getDataInventory } from '../services/api';

const Discovery: React.FC = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewScan, setShowNewScan] = useState(false);
  const [scanConfig, setScanConfig] = useState({
    scanType: 'full',
    scanScope: 'all',
    targets: [''],
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await getDataInventory({ limit: 100 });
      setInventory(response.data || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScan = async () => {
    try {
      await startScan(scanConfig);
      setShowNewScan(false);
      loadInventory();
    } catch (error) {
      console.error('Failed to start scan:', error);
      alert('Failed to start scan');
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Restricted': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'Confidential': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Internal': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Public': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'local': return <FolderOpen className="w-5 h-5" />;
      case 'network': return <Database className="w-5 h-5" />;
      case 'cloud': return <Cloud className="w-5 h-5" />;
      default: return <FileSearch className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dlp-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dlp-darker via-dlp-dark to-dlp-darker p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Data Discovery</h1>
            <p className="text-gray-400">Scan and classify sensitive data across your organization</p>
          </div>
          <button
            onClick={() => setShowNewScan(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-dlp-primary to-dlp-accent rounded-lg hover:shadow-glow-blue transition-all"
          >
            <Play className="w-5 h-5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Files</p>
          <p className="text-3xl font-bold text-white">{inventory.length}</p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-red-500/20">
          <p className="text-gray-400 text-sm mb-1">Restricted</p>
          <p className="text-3xl font-bold text-red-400">
            {inventory.filter(f => f.classification === 'Restricted').length}
          </p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-orange-500/20">
          <p className="text-gray-400 text-sm mb-1">Confidential</p>
          <p className="text-3xl font-bold text-orange-400">
            {inventory.filter(f => f.classification === 'Confidential').length}
          </p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-yellow-500/20">
          <p className="text-gray-400 text-sm mb-1">Internal</p>
          <p className="text-3xl font-bold text-yellow-400">
            {inventory.filter(f => f.classification === 'Internal').length}
          </p>
        </div>
      </div>

      {/* Data Inventory */}
      <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Data Inventory</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                className="px-4 py-2 bg-dlp-darker border border-gray-700 rounded-lg text-white pl-10 focus:outline-none focus:border-dlp-primary"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {inventory.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileSearch className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No data discovered yet</p>
              <p className="text-sm">Start a scan to discover and classify sensitive data</p>
            </div>
          ) : (
            inventory.map((file, index) => (
              <div
                key={file.fileId || index}
                className="bg-dlp-darker/50 rounded-lg p-4 border border-gray-700/50 hover:border-dlp-primary/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-2 bg-dlp-primary/10 rounded-lg text-dlp-primary">
                      {getLocationIcon(file.location)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-white">{file.fileName || file.path}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getClassificationColor(file.classification)}`}>
                          {file.classification}
                        </span>
                        {file.autoClassified && (
                          <span className="px-2 py-1 bg-dlp-accent/10 text-dlp-accent text-xs rounded">
                            Auto-classified
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{file.fileType}</span>
                        <span>•</span>
                        <span>{file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size'}</span>
                        <span>•</span>
                        <span>{file.owner || 'Unknown owner'}</span>
                        {file.mlConfidence && (
                          <>
                            <span>•</span>
                            <span>Confidence: {Math.round(file.mlConfidence * 100)}%</span>
                          </>
                        )}
                      </div>

                      {file.dataTypes && file.dataTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {file.dataTypes.slice(0, 5).map((dt: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/30"
                            >
                              {dt.type}
                            </span>
                          ))}
                          {file.dataTypes.length > 5 && (
                            <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded">
                              +{file.dataTypes.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {file.riskScore !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Risk Score</p>
                      <p className={`text-2xl font-bold ${
                        file.riskScore >= 75 ? 'text-red-400' :
                        file.riskScore >= 50 ? 'text-orange-400' :
                        file.riskScore >= 25 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {file.riskScore}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Scan Modal */}
      {showNewScan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dlp-dark rounded-2xl p-8 border border-gray-700 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-6">New Data Discovery Scan</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scan Type</label>
                <select
                  value={scanConfig.scanType}
                  onChange={(e) => setScanConfig({ ...scanConfig, scanType: e.target.value })}
                  className="w-full px-4 py-3 bg-dlp-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:border-dlp-primary"
                >
                  <option value="full">Full Scan</option>
                  <option value="quick">Quick Scan</option>
                  <option value="targeted">Targeted Scan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scan Scope</label>
                <select
                  value={scanConfig.scanScope}
                  onChange={(e) => setScanConfig({ ...scanConfig, scanScope: e.target.value })}
                  className="w-full px-4 py-3 bg-dlp-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:border-dlp-primary"
                >
                  <option value="all">All Locations</option>
                  <option value="local">Local Files</option>
                  <option value="network">Network Drives</option>
                  <option value="cloud">Cloud Storage</option>
                  <option value="database">Databases</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Paths (one per line)</label>
                <textarea
                  value={scanConfig.targets.join('\n')}
                  onChange={(e) => setScanConfig({ ...scanConfig, targets: e.target.value.split('\n') })}
                  className="w-full px-4 py-3 bg-dlp-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:border-dlp-primary"
                  rows={4}
                  placeholder="/path/to/scan&#10;/another/path&#10;s3://bucket-name"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowNewScan(false)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStartScan}
                className="px-6 py-3 bg-gradient-to-r from-dlp-primary to-dlp-accent text-white rounded-lg hover:shadow-glow-blue transition-all"
              >
                Start Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discovery;
