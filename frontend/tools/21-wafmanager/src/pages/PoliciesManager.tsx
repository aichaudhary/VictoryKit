import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Shield,
  Clock,
  Globe,
  Users,
  FileText,
  Edit3,
  Trash2,
  Copy,
  Play,
  Pause,
  Calendar,
  MapPin,
  AlertTriangle,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getWAFPolicies, deleteWAFPolicy, updateWAFPolicy } from '../services/api';
import type { WAFPolicy } from '../types';

const templateConfig: Record<string, { label: string; description: string; icon: string; color: string }> = {
  'owasp-top10': { label: 'OWASP Top 10', description: 'Core rule set for top 10 vulnerabilities', icon: '🛡️', color: 'text-threat-critical' },
  'api-protection': { label: 'API Protection', description: 'Rules for API endpoint security', icon: '🔌', color: 'text-waf-primary' },
  'bot-protection': { label: 'Bot Protection', description: 'Detect and block malicious bots', icon: '🤖', color: 'text-threat-medium' },
  'rate-limiting': { label: 'Rate Limiting', description: 'Request rate limiting rules', icon: '⚡', color: 'text-threat-high' },
  'custom': { label: 'Custom Policy', description: 'User-defined custom rules', icon: '⚙️', color: 'text-waf-muted' },
};

export default function PoliciesManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['wafPolicies'],
    queryFn: getWAFPolicies,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWAFPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wafPolicies'] });
      toast.success('Policy deleted');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => 
      updateWAFPolicy(id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wafPolicies'] });
      toast.success('Policy updated');
    },
  });

  // Mock data for demo
  const mockPolicies: WAFPolicy[] = [
    {
      _id: '1', name: 'Production OWASP Policy', description: 'Complete OWASP Top 10 protection for production environments',
      template: 'owasp-top10', enabled: true, priority: 100, rules: [], geoBlocking: { enabled: true, mode: 'block', countries: ['CN', 'RU', 'KP'] },
      ipWhitelist: ['10.0.0.0/8', '192.168.0.0/16'], ipBlacklist: ['185.234.218.0/24'],
      schedule: { enabled: true, timezone: 'UTC', activeHours: { start: '00:00', end: '23:59' }, activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '2', name: 'API Gateway Protection', description: 'Enhanced security for REST API endpoints with rate limiting',
      template: 'api-protection', enabled: true, priority: 90, rules: [], geoBlocking: { enabled: false, mode: 'block', countries: [] },
      ipWhitelist: [], ipBlacklist: [],
      schedule: { enabled: false },
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '3', name: 'Bot Mitigation Policy', description: 'Aggressive bot detection and blocking',
      template: 'bot-protection', enabled: true, priority: 80, rules: [], geoBlocking: { enabled: false, mode: 'block', countries: [] },
      ipWhitelist: [], ipBlacklist: [],
      schedule: { enabled: true, timezone: 'UTC', activeHours: { start: '09:00', end: '18:00' }, activeDays: ['mon', 'tue', 'wed', 'thu', 'fri'] },
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '4', name: 'DDoS Rate Limiting', description: 'Rate limiting to prevent DDoS attacks',
      template: 'rate-limiting', enabled: false, priority: 70, rules: [], geoBlocking: { enabled: false, mode: 'block', countries: [] },
      ipWhitelist: [], ipBlacklist: [],
      schedule: { enabled: false },
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      _id: '5', name: 'Custom Security Policy', description: 'Organization-specific security rules',
      template: 'custom', enabled: true, priority: 60, rules: [], geoBlocking: { enabled: true, mode: 'challenge', countries: ['IR', 'SY'] },
      ipWhitelist: ['203.0.113.0/24'], ipBlacklist: [],
      schedule: { enabled: false },
      createdAt: new Date(), updatedAt: new Date(),
    },
  ];

  const displayPolicies = policies.length > 0 ? policies : mockPolicies;
  const filteredPolicies = displayPolicies
    .filter(policy => 
      !searchQuery || 
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(policy => !selectedTemplate || policy.template === selectedTemplate)
    .sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Policies Manager</h1>
          <p className="text-waf-muted mt-1">Manage WAF security policies and templates</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="waf-btn-primary">
          <Plus className="w-5 h-5" />
          Create Policy
        </button>
      </div>

      {/* Template Filter */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedTemplate(null)}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium transition-all',
            !selectedTemplate
              ? 'bg-waf-primary text-white'
              : 'bg-waf-card text-waf-muted hover:text-white border border-waf-border'
          )}
        >
          All Policies
        </button>
        {Object.entries(templateConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedTemplate(selectedTemplate === key ? null : key)}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              selectedTemplate === key
                ? 'bg-waf-primary text-white'
                : 'bg-waf-card text-waf-muted hover:text-white border border-waf-border'
            )}
          >
            <span>{config.icon}</span>
            {config.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="waf-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-waf-muted" />
          <input
            type="text"
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="waf-input pl-10"
          />
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPolicies.map((policy, index) => {
          const template = templateConfig[policy.template] || templateConfig.custom;

          return (
            <motion.div
              key={policy._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                'waf-card hover:border-waf-primary/50 transition-all',
                !policy.enabled && 'opacity-60'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                    'bg-gradient-to-br from-waf-dark to-waf-card border border-waf-border'
                  )}>
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{policy.name}</h3>
                    <span className={clsx('text-sm', template.color)}>{template.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'px-2 py-1 rounded text-xs font-medium',
                    policy.enabled
                      ? 'bg-threat-low/20 text-threat-low'
                      : 'bg-waf-dark text-waf-muted'
                  )}>
                    {policy.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-waf-muted mb-4">{policy.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-waf-dark rounded-lg text-waf-muted">
                  <Shield className="w-3 h-3" />
                  Priority: {policy.priority}
                </span>
                {policy.geoBlocking?.enabled && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-threat-medium/20 rounded-lg text-threat-medium">
                    <Globe className="w-3 h-3" />
                    Geo: {policy.geoBlocking.countries.length} countries
                  </span>
                )}
                {(policy.ipWhitelist?.length || 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-threat-low/20 rounded-lg text-threat-low">
                    <Check className="w-3 h-3" />
                    {policy.ipWhitelist?.length} whitelist
                  </span>
                )}
                {(policy.ipBlacklist?.length || 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-threat-critical/20 rounded-lg text-threat-critical">
                    <AlertTriangle className="w-3 h-3" />
                    {policy.ipBlacklist?.length} blacklist
                  </span>
                )}
                {policy.schedule?.enabled && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-waf-primary/20 rounded-lg text-waf-primary">
                    <Clock className="w-3 h-3" />
                    Scheduled
                  </span>
                )}
              </div>

              {/* Schedule Details */}
              {policy.schedule?.enabled && (
                <div className="bg-waf-dark rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-waf-primary" />
                      <span className="text-waf-muted">
                        {policy.schedule.activeHours?.start} - {policy.schedule.activeHours?.end}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                        <span
                          key={day}
                          className={clsx(
                            'w-6 h-6 rounded text-xs flex items-center justify-center uppercase',
                            policy.schedule?.activeDays?.includes(day)
                              ? 'bg-waf-primary text-white'
                              : 'bg-waf-card text-waf-muted'
                          )}
                        >
                          {day[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Geo Blocking Details */}
              {policy.geoBlocking?.enabled && policy.geoBlocking.countries.length > 0 && (
                <div className="bg-waf-dark rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-threat-medium" />
                    <span className="text-sm text-waf-muted">
                      {policy.geoBlocking.mode === 'block' ? 'Blocked' : 'Challenged'} Countries:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {policy.geoBlocking.countries.map(country => (
                      <span key={country} className="px-2 py-1 bg-waf-card rounded text-xs text-waf-text">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-waf-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: policy._id, enabled: !policy.enabled })}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      policy.enabled
                        ? 'bg-threat-low/20 text-threat-low hover:bg-threat-low/30'
                        : 'bg-waf-dark text-waf-muted hover:text-white'
                    )}
                    title={policy.enabled ? 'Disable' : 'Enable'}
                  >
                    {policy.enabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button
                    className="p-2 text-waf-muted hover:text-white hover:bg-waf-dark rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-waf-muted hover:text-white hover:bg-waf-dark rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this policy?')) {
                        deleteMutation.mutate(policy._id);
                      }
                    }}
                    className="p-2 text-waf-muted hover:text-threat-critical hover:bg-threat-critical/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <button className="waf-btn-secondary text-sm">
                  <FileText className="w-4 h-4" />
                  View Rules
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="waf-card py-12 text-center">
          <Shield className="w-12 h-12 text-waf-muted mx-auto mb-4" />
          <p className="text-waf-muted">No policies found</p>
          <button onClick={() => setShowCreateModal(true)} className="waf-btn-primary mt-4">
            <Plus className="w-5 h-5" />
            Create First Policy
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-waf-card border border-waf-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-waf-border">
              <h2 className="text-xl font-bold text-white">Create New Policy</h2>
              <p className="text-waf-muted mt-1">Choose a template to get started</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(templateConfig).map(([key, config]) => (
                <button
                  key={key}
                  className="p-4 border border-waf-border rounded-lg hover:border-waf-primary hover:bg-waf-primary/10 text-left transition-all"
                >
                  <span className="text-3xl mb-2 block">{config.icon}</span>
                  <h3 className={clsx('font-semibold', config.color)}>{config.label}</h3>
                  <p className="text-sm text-waf-muted mt-1">{config.description}</p>
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-waf-border flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="waf-btn-secondary">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
