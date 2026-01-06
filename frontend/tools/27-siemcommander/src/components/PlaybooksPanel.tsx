import React, { useState } from 'react';
import {
  Play, Plus, Search, Clock, Settings, ChevronRight,
  CheckCircle, XCircle, AlertTriangle, Zap, Edit, Copy, Trash2
} from 'lucide-react';
import type { Playbook, PlaybookExecution } from '../types';
import { formatTimestamp, formatDuration } from '../constants';

// Mock playbooks
const mockPlaybooks: Playbook[] = [
  {
    id: 'PB-001',
    name: 'Malware Containment',
    description: 'Automated response for malware detection including host isolation, process termination, and evidence collection',
    version: '2.1',
    status: 'active',
    trigger: { type: 'alert', condition: 'severity >= high AND category = malware' },
    steps: [
      { id: 'S1', name: 'Isolate Host', action: 'isolate_endpoint', description: 'Quarantine the affected endpoint from the network', params: { timeout: 30 }, timeout: 60, retries: 3 },
      { id: 'S2', name: 'Collect Memory Dump', action: 'collect_memory', description: 'Capture RAM dump for forensic analysis', params: {}, timeout: 300, retries: 1, dependsOn: ['S1'] },
      { id: 'S3', name: 'Kill Malicious Process', action: 'terminate_process', description: 'Stop the identified malicious process', params: {}, timeout: 30, retries: 2, dependsOn: ['S1'] },
      { id: 'S4', name: 'Collect Artifacts', action: 'collect_artifacts', description: 'Gather logs and suspicious files', params: {}, timeout: 180, retries: 1, dependsOn: ['S2', 'S3'] },
      { id: 'S5', name: 'Notify SOC', action: 'send_notification', description: 'Alert the SOC team with incident details', params: { channel: 'slack' }, timeout: 30, retries: 3, dependsOn: ['S4'] },
    ],
    createdAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 86400000),
    createdBy: 'Sarah Chen',
    tags: ['malware', 'automated', 'containment'],
    avgDuration: 420000,
    successRate: 94.5,
    totalRuns: 156,
  },
  {
    id: 'PB-002',
    name: 'Phishing Response',
    description: 'Respond to reported phishing emails by analyzing URLs, checking reputation, and blocking IOCs',
    version: '1.3',
    status: 'active',
    trigger: { type: 'manual', condition: 'User reported phishing' },
    steps: [
      { id: 'S1', name: 'Extract IOCs', action: 'extract_iocs', description: 'Parse email for URLs, domains, and attachments', params: {}, timeout: 60, retries: 1 },
      { id: 'S2', name: 'Check Reputation', action: 'check_reputation', description: 'Query threat intel for IOC reputation', params: { sources: ['virustotal', 'urlscan'] }, timeout: 120, retries: 2, dependsOn: ['S1'] },
      { id: 'S3', name: 'Block IOCs', action: 'block_iocs', description: 'Add malicious IOCs to blocklist', params: {}, timeout: 60, retries: 2, dependsOn: ['S2'] },
      { id: 'S4', name: 'Search Mailboxes', action: 'search_mailboxes', description: 'Find similar emails across organization', params: {}, timeout: 300, retries: 1, dependsOn: ['S1'] },
      { id: 'S5', name: 'Delete Emails', action: 'delete_emails', description: 'Remove phishing emails from all mailboxes', params: {}, timeout: 180, retries: 2, dependsOn: ['S4'] },
    ],
    createdAt: new Date(Date.now() - 1209600000),
    updatedAt: new Date(Date.now() - 172800000),
    createdBy: 'Mike Johnson',
    tags: ['phishing', 'email', 'automated'],
    avgDuration: 360000,
    successRate: 98.2,
    totalRuns: 89,
  },
  {
    id: 'PB-003',
    name: 'Brute Force Mitigation',
    description: 'Detect and respond to brute force authentication attacks',
    version: '1.0',
    status: 'testing',
    trigger: { type: 'alert', condition: 'rule = brute_force_detection' },
    steps: [
      { id: 'S1', name: 'Block Source IP', action: 'block_ip', description: 'Add attacking IP to firewall blocklist', params: { duration: 3600 }, timeout: 30, retries: 3 },
      { id: 'S2', name: 'Lock Account', action: 'lock_account', description: 'Temporarily lock the targeted account', params: { duration: 900 }, timeout: 30, retries: 2, dependsOn: ['S1'] },
      { id: 'S3', name: 'Notify User', action: 'send_email', description: 'Alert the user about suspicious activity', params: {}, timeout: 60, retries: 2, dependsOn: ['S2'] },
    ],
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 86400000),
    createdBy: 'Alex Rivera',
    tags: ['brute_force', 'authentication'],
    avgDuration: 60000,
    successRate: 91.0,
    totalRuns: 23,
  },
];

// Mock executions
const mockExecutions: PlaybookExecution[] = [
  {
    id: 'EXE-001',
    playbookId: 'PB-001',
    playbookName: 'Malware Containment',
    status: 'completed',
    startedAt: new Date(Date.now() - 1800000),
    completedAt: new Date(Date.now() - 1380000),
    triggeredBy: 'Alert ALT-002',
    stepResults: [
      { stepId: 'S1', status: 'success', output: 'Host isolated successfully' },
      { stepId: 'S2', status: 'success', output: 'Memory dump collected - 4.2GB' },
      { stepId: 'S3', status: 'success', output: 'Process terminated' },
      { stepId: 'S4', status: 'success', output: '23 artifacts collected' },
      { stepId: 'S5', status: 'success', output: 'SOC notified via Slack' },
    ],
  },
  {
    id: 'EXE-002',
    playbookId: 'PB-002',
    playbookName: 'Phishing Response',
    status: 'running',
    startedAt: new Date(Date.now() - 180000),
    triggeredBy: 'Manual - Sarah Chen',
    currentStep: 'S3',
    stepResults: [
      { stepId: 'S1', status: 'success', output: '3 URLs, 1 domain, 1 attachment' },
      { stepId: 'S2', status: 'success', output: 'All IOCs marked malicious' },
    ],
  },
  {
    id: 'EXE-003',
    playbookId: 'PB-001',
    playbookName: 'Malware Containment',
    status: 'failed',
    startedAt: new Date(Date.now() - 7200000),
    completedAt: new Date(Date.now() - 6900000),
    triggeredBy: 'Alert ALT-015',
    stepResults: [
      { stepId: 'S1', status: 'success', output: 'Host isolated' },
      { stepId: 'S2', status: 'failed', output: 'Memory collection failed - insufficient disk space', error: 'DISK_FULL' },
    ],
  },
];

const PlaybooksPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<'library' | 'executions'>('library');
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaybooks = mockPlaybooks.filter(pb =>
    pb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: mockPlaybooks.length,
    active: mockPlaybooks.filter(pb => pb.status === 'active').length,
    running: mockExecutions.filter(e => e.status === 'running').length,
    successRate: Math.round(mockPlaybooks.reduce((acc, pb) => acc + pb.successRate, 0) / mockPlaybooks.length),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SOAR Playbooks</h1>
          <p className="text-gray-400 text-sm mt-1">Automated response orchestration and workflows</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Playbook</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Playbooks', value: stats.total, icon: Zap, color: 'text-violet-400' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Running Now', value: stats.running, icon: Play, color: 'text-blue-400' },
          { label: 'Avg Success Rate', value: `${stats.successRate}%`, icon: AlertTriangle, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#334155]">
        <button
          onClick={() => setActiveView('library')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeView === 'library' 
              ? 'text-violet-400 border-violet-400' 
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Playbook Library
        </button>
        <button
          onClick={() => setActiveView('executions')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeView === 'executions' 
              ? 'text-violet-400 border-violet-400' 
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Execution History
        </button>
      </div>

      {activeView === 'library' ? (
        <div className="flex gap-6">
          {/* Playbooks List */}
          <div className="flex-1 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search playbooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E293B] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* List */}
            {filteredPlaybooks.map((playbook) => (
              <div
                key={playbook.id}
                onClick={() => setSelectedPlaybook(playbook)}
                className={`bg-[#1E293B] rounded-xl border p-4 cursor-pointer transition-all hover:border-violet-500 ${
                  selectedPlaybook?.id === playbook.id ? 'border-violet-500' : 'border-[#334155]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className={`w-5 h-5 ${
                        playbook.status === 'active' ? 'text-green-400' :
                        playbook.status === 'testing' ? 'text-yellow-400' : 'text-gray-400'
                      }`} />
                      <h3 className="text-white font-medium">{playbook.name}</h3>
                      <span className="text-gray-500 text-xs">v{playbook.version}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{playbook.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    playbook.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    playbook.status === 'testing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {playbook.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                  <span>{playbook.steps.length} steps</span>
                  <span>•</span>
                  <span>{playbook.totalRuns} runs</span>
                  <span>•</span>
                  <span className="text-green-400">{playbook.successRate}% success</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selectedPlaybook && (
            <div className="w-[450px] bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedPlaybook.name}</h2>
                  <p className="text-gray-400 text-sm">Version {selectedPlaybook.version}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-[#334155] rounded-lg hover:bg-[#475569] transition-colors">
                    <Edit className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-2 bg-[#334155] rounded-lg hover:bg-[#475569] transition-colors">
                    <Copy className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs uppercase mb-2">Trigger</p>
                <div className="bg-[#0F172A] rounded-lg p-3">
                  <span className="text-violet-400 text-sm font-medium capitalize">{selectedPlaybook.trigger.type}</span>
                  <p className="text-gray-400 text-xs mt-1">{selectedPlaybook.trigger.condition}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs uppercase mb-2">Steps ({selectedPlaybook.steps.length})</p>
                <div className="space-y-2">
                  {selectedPlaybook.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 bg-[#0F172A] rounded-lg p-3">
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{step.name}</p>
                        <p className="text-gray-400 text-xs">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                  <Play className="w-4 h-4" />
                  Run Manually
                </button>
                <button className="px-4 py-2 bg-[#334155] text-gray-300 rounded-lg hover:bg-[#475569] transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Execution History */
        <div className="space-y-4">
          {mockExecutions.map((execution) => (
            <div key={execution.id} className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {execution.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {execution.status === 'running' && <Play className="w-5 h-5 text-blue-400 animate-pulse" />}
                  {execution.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                  <div>
                    <h3 className="text-white font-medium">{execution.playbookName}</h3>
                    <p className="text-gray-400 text-sm">{execution.triggeredBy}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  execution.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  execution.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {execution.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimestamp(execution.startedAt)}</span>
                </div>
                {execution.completedAt && (
                  <span>Duration: {formatDuration(execution.completedAt.getTime() - execution.startedAt.getTime())}</span>
                )}
                <span>{execution.stepResults.filter(s => s.status === 'success').length}/{execution.stepResults.length} steps completed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaybooksPanel;
