import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, Play, AlertTriangle, CheckCircle, Settings, Loader2 } from 'lucide-react';
import { dlpAPI } from '../services/dlpAPI';
import { CLOUD_INTEGRATIONS } from '../constants';

interface ScanJob {
  id: string;
  provider: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress: number;
  findings: number;
  scannedItems: number;
  error?: string;
}

const CloudScanner: React.FC = () => {
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, any>>({});
  const [scanJobs, setScanJobs] = useState<ScanJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIntegrationStatus();
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      const status = await dlpAPI.integrations.status();
      setIntegrationStatus(status);
    } catch (error) {
      console.error('Failed to load integration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startScan = async (provider: string) => {
    const jobId = `${provider}-${Date.now()}`;
    const newJob: ScanJob = {
      id: jobId,
      provider,
      status: 'running',
      progress: 0,
      findings: 0,
      scannedItems: 0,
    };

    setScanJobs(prev => [...prev, newJob]);

    // Simulate scan progress
    const progressInterval = setInterval(() => {
      setScanJobs(prev => prev.map(job => {
        if (job.id === jobId && job.status === 'running') {
          const newProgress = Math.min(job.progress + Math.random() * 15, 100);
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return {
              ...job,
              progress: 100,
              status: 'complete',
              findings: Math.floor(Math.random() * 10),
              scannedItems: Math.floor(Math.random() * 500) + 100,
            };
          }
          return { ...job, progress: newProgress };
        }
        return job;
      }));
    }, 500);
  };

  const scanAll = async () => {
    const connectedProviders = Object.entries(integrationStatus)
      .filter(([_, status]) => status.configured)
      .map(([key]) => key);
    
    for (const provider of connectedProviders) {
      await startScan(provider);
    }
  };

  const getProviderIcon = (type: string) => {
    const icons: Record<string, string> = {
      microsoft365: '🟦',
      google: '🟨',
      slack: '💬',
      aws: '🟠',
      azure: '🔵',
      dropbox: '📦',
      box: '📁',
    };
    return icons[type] || '☁️';
  };

  const getStatusBadge = (configured: boolean, status?: string) => {
    if (!configured) {
      return <span className="px-2 py-1 text-xs bg-slate-700 text-slate-400 rounded">Not Configured</span>;
    }
    if (status === 'error') {
      return <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Error</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">Connected</span>;
  };

  const runningJobs = scanJobs.filter(j => j.status === 'running');
  const completedJobs = scanJobs.filter(j => j.status === 'complete');
  const totalFindings = completedJobs.reduce((sum, j) => sum + j.findings, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Connected Services</p>
          <p className="text-2xl font-bold mt-1">
            {Object.values(integrationStatus).filter((s: any) => s.configured).length}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Active Scans</p>
          <p className="text-2xl font-bold mt-1 text-purple-400">{runningJobs.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Items Scanned</p>
          <p className="text-2xl font-bold mt-1">
            {completedJobs.reduce((sum, j) => sum + j.scannedItems, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Violations Found</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{totalFindings}</p>
        </div>
      </div>

      {/* Cloud Services */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="w-5 h-5 text-purple-400" />
            Cloud Services
          </h3>
          <div className="flex gap-2">
            <button
              onClick={loadIntegrationStatus}
              disabled={isLoading}
              className="p-2 hover:bg-slate-800 rounded-lg"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={scanAll}
              disabled={runningJobs.length > 0}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Scan All Connected
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLOUD_INTEGRATIONS.map((integration) => {
            const status = integrationStatus[integration.id] || { configured: false };
            const activeJob = scanJobs.find(j => j.provider === integration.id && j.status === 'running');
            const lastJob = [...scanJobs].reverse().find(j => j.provider === integration.id && j.status === 'complete');

            return (
              <div
                key={integration.id}
                className={`p-4 rounded-xl border transition-all ${
                  status.configured
                    ? 'bg-slate-800/50 border-purple-500/30 hover:border-purple-500/50'
                    : 'bg-slate-900/30 border-slate-700/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{integration.icon}</span>
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-xs text-slate-400">{integration.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(status.configured, status.status)}
                </div>

                {activeJob && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-purple-400">Scanning...</span>
                      <span>{Math.round(activeJob.progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${activeJob.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {lastJob && !activeJob && (
                  <div className="text-xs text-slate-400 mb-3">
                    Last scan: {lastJob.scannedItems} items, {lastJob.findings} findings
                  </div>
                )}

                <div className="flex gap-2">
                  {status.configured ? (
                    <>
                      <button
                        onClick={() => startScan(integration.id)}
                        disabled={!!activeJob}
                        className="flex-1 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {activeJob ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Scanning
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Scan
                          </>
                        )}
                      </button>
                      <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600">
                      Configure
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scan Results */}
      {completedJobs.length > 0 && (
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Scan Results</h3>
          <div className="space-y-3">
            {completedJobs.slice(-5).reverse().map((job) => (
              <div
                key={job.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  job.findings > 0
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-green-500/10 border-green-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getProviderIcon(job.provider)}</span>
                  <div>
                    <p className="font-medium capitalize">{job.provider.replace('365', ' 365')}</p>
                    <p className="text-xs text-slate-400">{job.scannedItems} items scanned</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {job.findings > 0 ? (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">{job.findings} violations</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>Clean</span>
                    </div>
                  )}
                  <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudScanner;
