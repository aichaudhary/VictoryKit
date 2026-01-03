import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Server, 
  RefreshCw, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Cloud,
  Zap,
  Settings2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getWAFInstances, createWAFInstance, deleteWAFInstance, syncWAFInstance } from '../services/api';
import type { WAFInstance } from '../types';

const providerLogos: Record<string, { name: string; color: string; icon: string }> = {
  aws: { name: 'AWS WAF', color: '#FF9900', icon: '☁️' },
  cloudflare: { name: 'Cloudflare', color: '#F38020', icon: '🔶' },
  akamai: { name: 'Akamai', color: '#0096D6', icon: '🌐' },
  f5: { name: 'F5 BIG-IP', color: '#E4002B', icon: '🛡️' },
  imperva: { name: 'Imperva', color: '#00B5E2', icon: '🔒' },
  azure: { name: 'Azure WAF', color: '#0078D4', icon: '☁️' },
  gcp: { name: 'Cloud Armor', color: '#4285F4', icon: '🛡️' },
  fastly: { name: 'Fastly', color: '#FF282D', icon: '⚡' },
  sucuri: { name: 'Sucuri', color: '#2E7D32', icon: '🌿' },
};

const statusConfig = {
  active: { label: 'Active', color: 'text-threat-low', bgColor: 'bg-threat-low/20', icon: CheckCircle2 },
  inactive: { label: 'Inactive', color: 'text-waf-muted', bgColor: 'bg-waf-muted/20', icon: XCircle },
  error: { label: 'Error', color: 'text-threat-critical', bgColor: 'bg-threat-critical/20', icon: XCircle },
  syncing: { label: 'Syncing', color: 'text-threat-info', bgColor: 'bg-threat-info/20', icon: RefreshCw },
};

export default function WAFInstances() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WAFInstance | null>(null);

  const { data: instances = [], isLoading } = useQuery({
    queryKey: ['wafInstances'],
    queryFn: getWAFInstances,
  });

  const syncMutation = useMutation({
    mutationFn: syncWAFInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wafInstances'] });
      toast.success('Instance synced successfully');
    },
    onError: () => {
      toast.error('Failed to sync instance');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWAFInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wafInstances'] });
      toast.success('Instance deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete instance');
    },
  });

  // Mock data for demo
  const mockInstances: WAFInstance[] = [
    {
      _id: '1',
      name: 'Production API Gateway',
      provider: 'aws',
      status: 'active',
      endpoint: 'https://api.example.com',
      region: 'us-east-1',
      config: { mode: 'blocking', ruleGroups: [], customRules: [], ipWhitelist: [], ipBlacklist: [] },
      stats: { totalRequests: 1254789, blockedRequests: 23456, allowedRequests: 1231333, challengedRequests: 0, lastSyncedAt: new Date() },
      healthCheck: { status: 'healthy', latency: 12, lastCheckedAt: new Date() },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '2',
      name: 'Web Application Firewall',
      provider: 'cloudflare',
      status: 'active',
      endpoint: 'https://www.example.com',
      config: { mode: 'blocking', ruleGroups: [], customRules: [], ipWhitelist: [], ipBlacklist: [] },
      stats: { totalRequests: 987654, blockedRequests: 15678, allowedRequests: 971976, challengedRequests: 1234, lastSyncedAt: new Date() },
      healthCheck: { status: 'healthy', latency: 8, lastCheckedAt: new Date() },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '3',
      name: 'Edge Protection CDN',
      provider: 'akamai',
      status: 'active',
      endpoint: 'https://cdn.example.com',
      region: 'global',
      config: { mode: 'monitoring', ruleGroups: [], customRules: [], ipWhitelist: [], ipBlacklist: [] },
      stats: { totalRequests: 543210, blockedRequests: 8765, allowedRequests: 534445, challengedRequests: 456, lastSyncedAt: new Date() },
      healthCheck: { status: 'degraded', latency: 45, lastCheckedAt: new Date() },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '4',
      name: 'Azure Front Door WAF',
      provider: 'azure',
      status: 'active',
      endpoint: 'https://app.azurefd.net',
      region: 'West Europe',
      config: { mode: 'blocking', ruleGroups: [], customRules: [], ipWhitelist: [], ipBlacklist: [] },
      stats: { totalRequests: 321098, blockedRequests: 5432, allowedRequests: 315666, challengedRequests: 789, lastSyncedAt: new Date() },
      healthCheck: { status: 'healthy', latency: 15, lastCheckedAt: new Date() },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '5',
      name: 'GCP Cloud Armor',
      provider: 'gcp',
      status: 'inactive',
      endpoint: 'https://gcp.example.com',
      region: 'us-central1',
      config: { mode: 'learning', ruleGroups: [], customRules: [], ipWhitelist: [], ipBlacklist: [] },
      stats: { totalRequests: 0, blockedRequests: 0, allowedRequests: 0, challengedRequests: 0, lastSyncedAt: new Date() },
      healthCheck: { status: 'unhealthy', latency: 0, lastCheckedAt: new Date() },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const displayInstances = instances.length > 0 ? instances : mockInstances;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">WAF Instances</h1>
          <p className="text-waf-muted mt-1">Manage your Web Application Firewall instances across cloud providers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="waf-btn-primary"
        >
          <Plus className="w-5 h-5" />
          Add Instance
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-threat-info/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-threat-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{displayInstances.length}</p>
              <p className="text-sm text-waf-muted">Total Instances</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-threat-low/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-threat-low" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {displayInstances.filter(i => i.status === 'active').length}
              </p>
              <p className="text-sm text-waf-muted">Active</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-threat-medium/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-threat-medium" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {displayInstances.filter(i => i.healthCheck?.status === 'degraded').length}
              </p>
              <p className="text-sm text-waf-muted">Degraded</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-waf-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-waf-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {displayInstances.reduce((sum, i) => sum + (i.stats?.totalRequests || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-waf-muted">Total Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instances Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayInstances.map((instance, index) => {
          const provider = providerLogos[instance.provider] || { name: instance.provider, color: '#6b7280', icon: '🌐' };
          const status = statusConfig[instance.status];
          const StatusIcon = status.icon;
          const healthStatus = instance.healthCheck?.status || 'healthy';

          return (
            <motion.div
              key={instance._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="waf-card hover:border-waf-primary/50 cursor-pointer group"
              onClick={() => setSelectedInstance(instance)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${provider.color}20` }}
                  >
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-waf-primary transition-colors">
                      {instance.name}
                    </h3>
                    <p className="text-sm text-waf-muted">{provider.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    status.bgColor, status.color
                  )}>
                    <StatusIcon className={clsx('w-3 h-3', instance.status === 'syncing' && 'animate-spin')} />
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Endpoint */}
              <div className="mb-4">
                <p className="text-xs text-waf-muted mb-1">Endpoint</p>
                <p className="text-sm font-mono text-waf-text truncate">{instance.endpoint}</p>
                {instance.region && (
                  <p className="text-xs text-waf-muted mt-1">Region: {instance.region}</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-waf-border">
                <div>
                  <p className="text-lg font-bold text-white">
                    {((instance.stats?.totalRequests || 0) / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-waf-muted">Requests</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-threat-critical">
                    {((instance.stats?.blockedRequests || 0) / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-waf-muted">Blocked</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-threat-info">
                    {instance.healthCheck?.latency || 0}ms
                  </p>
                  <p className="text-xs text-waf-muted">Latency</p>
                </div>
              </div>

              {/* Health & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    healthStatus === 'healthy' && 'bg-threat-low',
                    healthStatus === 'degraded' && 'bg-threat-medium animate-pulse',
                    healthStatus === 'unhealthy' && 'bg-threat-critical animate-pulse'
                  )} />
                  <span className="text-sm text-waf-muted capitalize">{healthStatus}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      syncMutation.mutate(instance._id);
                    }}
                    className="p-2 text-waf-muted hover:text-white hover:bg-waf-card rounded-lg transition-colors"
                    title="Sync"
                  >
                    <RefreshCw className={clsx('w-4 h-4', syncMutation.isPending && 'animate-spin')} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open settings
                    }}
                    className="p-2 text-waf-muted hover:text-white hover:bg-waf-card rounded-lg transition-colors"
                    title="Settings"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(instance.endpoint, '_blank');
                    }}
                    className="p-2 text-waf-muted hover:text-white hover:bg-waf-card rounded-lg transition-colors"
                    title="Open"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add New Instance Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: displayInstances.length * 0.1 }}
          onClick={() => setShowAddModal(true)}
          className="waf-card border-dashed border-2 flex flex-col items-center justify-center py-12 text-waf-muted hover:text-waf-primary hover:border-waf-primary transition-colors"
        >
          <Plus className="w-12 h-12 mb-4" />
          <p className="font-medium">Add New Instance</p>
          <p className="text-sm mt-1">Connect a WAF provider</p>
        </motion.button>
      </div>

      {/* Add Instance Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-waf-card border border-waf-border rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Add WAF Instance</h2>
              <p className="text-waf-muted mb-6">Select a WAF provider to connect:</p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {Object.entries(providerLogos).map(([key, provider]) => (
                  <button
                    key={key}
                    className="p-4 border border-waf-border rounded-xl hover:border-waf-primary hover:bg-waf-primary/10 transition-all flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl">{provider.icon}</span>
                    <span className="text-sm font-medium text-white">{provider.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="waf-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
