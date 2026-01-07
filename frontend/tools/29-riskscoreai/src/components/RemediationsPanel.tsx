import { useState } from 'react';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  ChevronRight,
  User,
  Calendar,
  Target,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { Remediation, RemediationStatus, Severity } from '../types';
import { SEVERITY_COLORS } from '../constants';

// Mock data
const mockRemediations: Remediation[] = [
  {
    id: 'rem-1',
    finding_id: 'f-1',
    organization_id: 'org-1',
    title: 'Disable TLS 1.0/1.1 on all servers',
    description: 'Upgrade TLS configuration to use only TLS 1.2 and TLS 1.3 across all public-facing servers.',
    priority: 'critical',
    status: 'in_progress',
    assignee: 'John Smith',
    due_date: '2024-03-20',
    created_at: '2024-03-10',
    steps: [
      { id: 's1', order: 1, description: 'Audit all servers for TLS configuration', completed: true, completed_at: '2024-03-11' },
      { id: 's2', order: 2, description: 'Update nginx/apache configs to disable TLS 1.0/1.1', completed: true, completed_at: '2024-03-12' },
      { id: 's3', order: 3, description: 'Test compatibility with clients', completed: false },
      { id: 's4', order: 4, description: 'Deploy to production', completed: false },
    ],
    estimated_impact: 8,
    ai_generated: true,
  },
  {
    id: 'rem-2',
    finding_id: 'f-2',
    organization_id: 'org-1',
    title: 'Close exposed RDP ports',
    description: 'Implement VPN access for remote desktop and close port 3389 from public internet.',
    priority: 'high',
    status: 'pending',
    assignee: 'Jane Doe',
    due_date: '2024-03-25',
    created_at: '2024-03-12',
    steps: [
      { id: 's1', order: 1, description: 'Setup VPN infrastructure', completed: false },
      { id: 's2', order: 2, description: 'Configure firewall rules', completed: false },
      { id: 's3', order: 3, description: 'Update access policies', completed: false },
      { id: 's4', order: 4, description: 'Test remote access via VPN', completed: false },
      { id: 's5', order: 5, description: 'Close RDP ports on firewall', completed: false },
    ],
    estimated_impact: 12,
    ai_generated: true,
  },
  {
    id: 'rem-3',
    finding_id: 'f-3',
    organization_id: 'org-1',
    title: 'Reset compromised credentials',
    description: 'Force password reset for all employees found in the data breach and enable MFA.',
    priority: 'high',
    status: 'completed',
    assignee: 'Security Team',
    due_date: '2024-03-15',
    created_at: '2024-03-05',
    completed_at: '2024-03-14',
    steps: [
      { id: 's1', order: 1, description: 'Identify affected accounts', completed: true, completed_at: '2024-03-06' },
      { id: 's2', order: 2, description: 'Send password reset notifications', completed: true, completed_at: '2024-03-07' },
      { id: 's3', order: 3, description: 'Enforce MFA enrollment', completed: true, completed_at: '2024-03-10' },
      { id: 's4', order: 4, description: 'Verify all accounts secured', completed: true, completed_at: '2024-03-14' },
    ],
    estimated_impact: 10,
    actual_impact: 12,
    ai_generated: false,
  },
  {
    id: 'rem-4',
    finding_id: 'f-4',
    organization_id: 'org-1',
    title: 'Patch Apache servers to latest version',
    description: 'Update Apache HTTP Server to address CVE-2024-1234 RCE vulnerability.',
    priority: 'critical',
    status: 'pending',
    due_date: '2024-03-18',
    created_at: '2024-03-14',
    steps: [
      { id: 's1', order: 1, description: 'Test upgrade in staging environment', completed: false },
      { id: 's2', order: 2, description: 'Schedule maintenance window', completed: false },
      { id: 's3', order: 3, description: 'Apply patches to production', completed: false },
      { id: 's4', order: 4, description: 'Verify service functionality', completed: false },
    ],
    estimated_impact: 15,
    ai_generated: true,
  },
];

export function RemediationsPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RemediationStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Severity | 'all'>('all');
  const [selectedRemediation, setSelectedRemediation] = useState<Remediation | null>(null);

  const filteredRemediations = mockRemediations.filter((rem) => {
    const matchesSearch = rem.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rem.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || rem.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats
  const pending = mockRemediations.filter((r) => r.status === 'pending').length;
  const inProgress = mockRemediations.filter((r) => r.status === 'in_progress').length;
  const completed = mockRemediations.filter((r) => r.status === 'completed').length;
  const totalImpact = mockRemediations.reduce((sum, r) => sum + r.estimated_impact, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Wrench className="w-7 h-7 text-amber-500" />
            Remediation Center
          </h1>
          <p className="text-gray-400 mt-1">Track and manage security remediation workflows</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Create Remediation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-gray-400 text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">{pending}</p>
        </div>
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4">
          <div className="flex items-center gap-3 mb-2">
            <Play className="w-5 h-5 text-blue-500" />
            <span className="text-gray-400 text-sm">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{inProgress}</p>
        </div>
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-400 text-sm">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{completed}</p>
        </div>
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-gray-400 text-sm">Est. Score Impact</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">+{totalImpact}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search remediations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RemediationStatus | 'all')}
          className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="verified">Verified</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Severity | 'all')}
          className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Remediations List */}
      <div className="space-y-4">
        {filteredRemediations.map((remediation) => (
          <RemediationCard
            key={remediation.id}
            remediation={remediation}
            onClick={() => setSelectedRemediation(remediation)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRemediations.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No remediations found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters</p>
        </div>
      )}

      {/* Remediation Detail Modal */}
      {selectedRemediation && (
        <RemediationDetailModal
          remediation={selectedRemediation}
          onClose={() => setSelectedRemediation(null)}
        />
      )}
    </div>
  );
}

function RemediationCard({
  remediation,
  onClick,
}: {
  remediation: Remediation;
  onClick: () => void;
}) {
  const completedSteps = remediation.steps.filter((s) => s.completed).length;
  const progress = (completedSteps / remediation.steps.length) * 100;

  const statusConfig = {
    pending: { color: '#F59E0B', icon: Clock, label: 'Pending' },
    in_progress: { color: '#3B82F6', icon: Play, label: 'In Progress' },
    completed: { color: '#10B981', icon: CheckCircle, label: 'Completed' },
    verified: { color: '#22C55E', icon: CheckCircle, label: 'Verified' },
    cancelled: { color: '#6B7280', icon: Pause, label: 'Cancelled' },
  };

  const status = statusConfig[remediation.status];
  const StatusIcon = status.icon;

  return (
    <div
      className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-5 hover:border-amber-500/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Priority Indicator */}
        <div
          className="w-1 h-20 rounded-full"
          style={{ backgroundColor: SEVERITY_COLORS[remediation.priority] }}
        />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-medium">{remediation.title}</h3>
            {remediation.ai_generated && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mb-3">{remediation.description}</p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{completedSteps}/{remediation.steps.length} steps</span>
            </div>
            <div className="w-full bg-[#2A2A2F] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: status.color,
                }}
              />
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-6 text-sm">
            <span
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: status.color + '20', color: status.color }}
            >
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: SEVERITY_COLORS[remediation.priority] + '20',
                color: SEVERITY_COLORS[remediation.priority],
              }}
            >
              {remediation.priority.toUpperCase()}
            </span>
            {remediation.assignee && (
              <span className="flex items-center gap-1 text-gray-400">
                <User className="w-4 h-4" />
                {remediation.assignee}
              </span>
            )}
            {remediation.due_date && (
              <span className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-4 h-4" />
                Due: {new Date(remediation.due_date).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1 text-green-400">
              <Target className="w-4 h-4" />
              +{remediation.estimated_impact} pts
            </span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-500" />
      </div>
    </div>
  );
}

function RemediationDetailModal({
  remediation,
  onClose,
}: {
  remediation: Remediation;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#2A2A2F] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-white">{remediation.title}</h2>
              {remediation.ai_generated && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </span>
              )}
            </div>
            <p className="text-gray-400">{remediation.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Steps */}
          <div>
            <h3 className="text-white font-medium mb-4">Remediation Steps</h3>
            <div className="space-y-3">
              {remediation.steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    step.completed ? 'bg-green-500/10' : 'bg-[#252529]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : 'border-2 border-gray-500'
                    }`}
                  >
                    {step.completed && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={step.completed ? 'text-gray-400' : 'text-white'}>
                      {step.description}
                    </p>
                    {step.completed_at && (
                      <p className="text-gray-500 text-xs mt-1">
                        Completed: {new Date(step.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact */}
          <div className="bg-[#252529] rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Expected Impact</h3>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-gray-400 text-sm">Estimated Score Improvement</p>
                <p className="text-2xl font-bold text-green-500">+{remediation.estimated_impact} points</p>
              </div>
              {remediation.actual_impact && (
                <div>
                  <p className="text-gray-400 text-sm">Actual Impact</p>
                  <p className="text-2xl font-bold text-green-500">+{remediation.actual_impact} points</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {remediation.status === 'pending' && (
              <button className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-black font-medium transition-colors">
                Start Remediation
              </button>
            )}
            {remediation.status === 'in_progress' && (
              <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors">
                Mark as Completed
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#2A2A2F] rounded-lg text-gray-300 hover:bg-[#252529] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
