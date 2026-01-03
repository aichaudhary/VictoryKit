import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Fingerprint,
  Search,
  Filter,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  X,
  Cpu,
  HardDrive,
  Chrome,
  Languages,
} from 'lucide-react';
import { fingerprintApi } from '../services/api';
import { Fingerprint as FingerprintType } from '../types';

export default function Fingerprints() {
  const [search, setSearch] = useState('');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [selectedFingerprint, setSelectedFingerprint] = useState<FingerprintType | null>(null);

  const { data: fingerprintsData, isLoading } = useQuery({
    queryKey: ['fingerprints', filterDevice],
    queryFn: () => fingerprintApi.getAll({ deviceType: filterDevice }),
  });

  // Demo data
  const demoFingerprints: FingerprintType[] = Array.from({ length: 20 }, (_, i) => ({
    _id: `fp-${i}`,
    hash: `fp_${Math.random().toString(36).substring(2, 15)}`,
    ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    components: {
      userAgent: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Mozilla/5.0 (Linux; Android 12)'][Math.floor(Math.random() * 3)],
      language: ['en-US', 'zh-CN', 'de-DE', 'fr-FR', 'es-ES'][Math.floor(Math.random() * 5)],
      timezone: ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'][Math.floor(Math.random() * 4)],
      screenResolution: ['1920x1080', '2560x1440', '1366x768', '3840x2160'][Math.floor(Math.random() * 4)],
      platform: ['Win32', 'MacIntel', 'Linux x86_64', 'iPhone'][Math.floor(Math.random() * 4)],
      hardwareConcurrency: [4, 8, 12, 16][Math.floor(Math.random() * 4)],
      deviceMemory: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
      canvas: `canvas_${Math.random().toString(36).substring(7)}`,
      webgl: `webgl_${Math.random().toString(36).substring(7)}`,
      audio: `audio_${Math.random().toString(36).substring(7)}`,
      fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia'].slice(0, Math.floor(Math.random() * 4) + 1),
      plugins: Math.floor(Math.random() * 5) + 1,
    },
    botScore: Math.floor(Math.random() * 100),
    deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as FingerprintType['deviceType'],
    browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
    os: ['Windows 10', 'macOS', 'Linux', 'Android', 'iOS'][Math.floor(Math.random() * 5)],
    isBot: Math.random() > 0.7,
    firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
    requestCount: Math.floor(Math.random() * 500) + 10,
    country: ['US', 'CN', 'DE', 'GB', 'JP'][Math.floor(Math.random() * 5)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const fingerprints = fingerprintsData?.data || demoFingerprints;

  const filteredFingerprints = fingerprints.filter((fp: FingerprintType) => {
    if (search && !fp.hash.includes(search) && !fp.ipAddress.includes(search)) {
      return false;
    }
    return true;
  });

  const stats = {
    total: fingerprints.length,
    desktop: fingerprints.filter((f: FingerprintType) => f.deviceType === 'desktop').length,
    mobile: fingerprints.filter((f: FingerprintType) => f.deviceType === 'mobile').length,
    tablet: fingerprints.filter((f: FingerprintType) => f.deviceType === 'tablet').length,
    bots: fingerprints.filter((f: FingerprintType) => f.isBot).length,
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return Monitor;
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Device Fingerprints</h1>
          <p className="text-slate-400 mt-1">Analyze and track device fingerprints</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-purple-400 mb-1">
            <Fingerprint size={18} />
            <span className="text-sm">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-blue-400 mb-1">
            <Monitor size={18} />
            <span className="text-sm">Desktop</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.desktop}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-green-400 mb-1">
            <Smartphone size={18} />
            <span className="text-sm">Mobile</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.mobile}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-orange-400 mb-1">
            <Tablet size={18} />
            <span className="text-sm">Tablet</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.tablet}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-red-400 mb-1">
            <Fingerprint size={18} />
            <span className="text-sm">Bots</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.bots}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by fingerprint or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>
      </div>

      {/* Fingerprints Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFingerprints.map((fp: FingerprintType) => {
            const DeviceIcon = getDeviceIcon(fp.deviceType || 'desktop');
            return (
              <motion.div
                key={fp._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-800 rounded-lg border ${
                  fp.isBot ? 'border-red-500/50' : 'border-slate-700'
                } p-4 hover:bg-slate-700/50 cursor-pointer transition-colors`}
                onClick={() => setSelectedFingerprint(fp)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      fp.isBot ? 'bg-red-500/20' : 'bg-purple-500/20'
                    }`}>
                      <DeviceIcon size={20} className={fp.isBot ? 'text-red-400' : 'text-purple-400'} />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-white">{fp.hash.substring(0, 16)}...</p>
                      <p className="text-xs text-slate-400">{fp.browser} on {fp.os}</p>
                    </div>
                  </div>
                  {fp.isBot && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">BOT</span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">IP Address</span>
                    <span className="text-white font-mono">{fp.ipAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bot Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            fp.botScore > 70 ? 'bg-red-500' : 
                            fp.botScore > 40 ? 'bg-orange-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${fp.botScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{fp.botScore}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Requests</span>
                    <span className="text-white">{fp.requestCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Country</span>
                    <span className="text-white">{fp.country}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
                  <span>Last seen: {new Date(fp.lastSeen).toLocaleDateString()}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFingerprint(fp);
                    }}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Fingerprint Detail Modal */}
      {selectedFingerprint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex items-center space-x-3">
                <Fingerprint className="w-8 h-8 text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">{selectedFingerprint.hash}</h2>
                  <p className="text-sm text-slate-400">{selectedFingerprint.browser} on {selectedFingerprint.os}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFingerprint(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Device Type</p>
                  <p className="text-white capitalize">{selectedFingerprint.deviceType}</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">IP Address</p>
                  <p className="text-white font-mono">{selectedFingerprint.ipAddress}</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Country</p>
                  <p className="text-white">{selectedFingerprint.country}</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Bot Score</p>
                  <p className={`font-bold ${
                    selectedFingerprint.botScore > 70 ? 'text-red-400' : 
                    selectedFingerprint.botScore > 40 ? 'text-orange-400' : 
                    'text-green-400'
                  }`}>{selectedFingerprint.botScore}%</p>
                </div>
              </div>

              {/* Components */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Fingerprint Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Chrome size={18} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-400">User Agent</p>
                      <p className="text-sm text-white truncate max-w-[250px]">{selectedFingerprint.components.userAgent}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Languages size={18} className="text-green-400" />
                    <div>
                      <p className="text-xs text-slate-400">Language</p>
                      <p className="text-sm text-white">{selectedFingerprint.components.language}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Globe size={18} className="text-purple-400" />
                    <div>
                      <p className="text-xs text-slate-400">Timezone</p>
                      <p className="text-sm text-white">{selectedFingerprint.components.timezone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Monitor size={18} className="text-orange-400" />
                    <div>
                      <p className="text-xs text-slate-400">Screen Resolution</p>
                      <p className="text-sm text-white">{selectedFingerprint.components.screenResolution}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <Cpu size={18} className="text-red-400" />
                    <div>
                      <p className="text-xs text-slate-400">Hardware Concurrency</p>
                      <p className="text-sm text-white">{selectedFingerprint.components.hardwareConcurrency} cores</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <HardDrive size={18} className="text-cyan-400" />
                    <div>
                      <p className="text-xs text-slate-400">Device Memory</p>
                      <p className="text-sm text-white">{selectedFingerprint.components.deviceMemory} GB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Canvas & WebGL Hashes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Rendering Fingerprints</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Canvas Hash</p>
                    <p className="text-sm text-white font-mono">{selectedFingerprint.components.canvas}</p>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">WebGL Hash</p>
                    <p className="text-sm text-white font-mono">{selectedFingerprint.components.webgl}</p>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Audio Hash</p>
                    <p className="text-sm text-white font-mono">{selectedFingerprint.components.audio}</p>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">{selectedFingerprint.requestCount}</p>
                  <p className="text-xs text-slate-400">Total Requests</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                  <p className="text-sm font-medium text-white">{new Date(selectedFingerprint.firstSeen).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">First Seen</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                  <p className="text-sm font-medium text-white">{new Date(selectedFingerprint.lastSeen).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">Last Seen</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
