import React, { useState } from 'react';
import {
  LayoutDashboard, Briefcase, BookOpen, Link2, Search,
  Zap, FileBarChart, Bot, Settings, Shield, Bell, ChevronRight, LogOut, User
} from 'lucide-react';
import {
  DashboardOverview,
  CaseManagement,
  PlaybookBuilder,
  IntegrationHub,
  EnrichmentPanel,
  AutomationManager,
  ReportsDashboard,
  AIAssistant,
} from './components';
import {
  Tab, Case, Playbook, Integration, Automation,
  EnrichmentResult, MetricsData, DashboardStats, SOARSettings
} from './types';
import { DEFAULT_SETTINGS } from './constants';

// Mock data
const mockCases: Case[] = [
  {
    id: 'CASE-001',
    title: 'Ransomware Detected on PROD-DB-01',
    description: 'CryptoLocker variant detected during routine scan. Server isolated pending investigation.',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'John Smith',
    created_at: '2026-01-05T08:30:00Z',
    updated_at: '2026-01-05T14:22:00Z',
    tags: ['ransomware', 'production', 'critical-asset'],
    related_alerts: ['ALT-1001', 'ALT-1002', 'ALT-1003'],
    playbook_id: 'PB-001',
    artifacts: [
      { type: 'hash_md5', value: 'd41d8cd98f00b204e9800998ecf8427e', source: 'EDR' },
      { type: 'ip', value: '185.143.223.47', source: 'Firewall' }
    ],
    timeline: [
      { timestamp: '2026-01-05T08:30:00Z', action: 'Case created from alert ALT-1001', user: 'System' },
      { timestamp: '2026-01-05T08:35:00Z', action: 'Assigned to John Smith', user: 'System' },
      { timestamp: '2026-01-05T09:00:00Z', action: 'Malware containment playbook initiated', user: 'John Smith' },
      { timestamp: '2026-01-05T14:22:00Z', action: 'Server isolated successfully', user: 'John Smith' }
    ],
    notes: [
      { id: 'N1', content: 'Initial triage complete. Confirmed CryptoLocker variant.', author: 'John Smith', created_at: '2026-01-05T09:15:00Z' }
    ],
    sla_due: '2026-01-05T20:30:00Z'
  },
  {
    id: 'CASE-002',
    title: 'Data Exfiltration Attempt Blocked',
    description: 'Large data transfer to external IP blocked by DLP. Source: WORKSTATION-042',
    status: 'open',
    priority: 'high',
    assignee: 'Sarah Johnson',
    created_at: '2026-01-05T10:15:00Z',
    updated_at: '2026-01-05T10:15:00Z',
    tags: ['dlp', 'data-exfil', 'insider-threat'],
    related_alerts: ['ALT-1010'],
    artifacts: [
      { type: 'ip', value: '91.234.56.78', source: 'DLP' },
      { type: 'hostname', value: 'WORKSTATION-042', source: 'DLP' }
    ],
    timeline: [
      { timestamp: '2026-01-05T10:15:00Z', action: 'Case created from DLP alert', user: 'System' }
    ],
    notes: [],
    sla_due: '2026-01-05T22:15:00Z'
  },
  {
    id: 'CASE-003',
    title: 'Compromised Admin Credentials',
    description: 'Admin account used from unusual location. MFA bypass attempt detected.',
    status: 'open',
    priority: 'critical',
    assignee: 'Mike Chen',
    created_at: '2026-01-05T11:45:00Z',
    updated_at: '2026-01-05T11:45:00Z',
    tags: ['credential-theft', 'admin-account', 'mfa-bypass'],
    related_alerts: ['ALT-1015', 'ALT-1016'],
    artifacts: [
      { type: 'ip', value: '103.45.67.89', source: 'SIEM' },
      { type: 'username', value: 'admin_jdoe', source: 'IAM' }
    ],
    timeline: [
      { timestamp: '2026-01-05T11:45:00Z', action: 'Case created from SIEM correlation', user: 'System' }
    ],
    notes: [],
    sla_due: '2026-01-05T19:45:00Z'
  }
];

const mockPlaybooks: Playbook[] = [
  {
    id: 'PB-001',
    name: 'Malware Containment',
    description: 'Automated response for malware incidents including isolation, artifact collection, and threat hunting',
    category: 'incident_response',
    steps: [
      { id: 'S1', name: 'Isolate Host', action: 'isolate', target: 'affected_host', condition: 'always', next_step: 'S2' },
      { id: 'S2', name: 'Collect Memory Dump', action: 'collect_artifact', target: 'memory', condition: 'success', next_step: 'S3' },
      { id: 'S3', name: 'Scan Network for IOCs', action: 'scan', target: 'network', condition: 'success', next_step: 'S4' },
      { id: 'S4', name: 'Block IOCs at Firewall', action: 'block', target: 'firewall', condition: 'iocs_found', next_step: 'S5' },
      { id: 'S5', name: 'Notify SOC Lead', action: 'notify', target: 'soc_lead', condition: 'always', next_step: undefined }
    ],
    triggers: [{ type: 'alert', condition: 'severity >= critical AND category = malware' }],
    enabled: true,
    created_at: '2025-11-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    last_run: '2026-01-05T09:00:00Z',
    run_count: 47,
    success_rate: 94
  },
  {
    id: 'PB-002',
    name: 'Phishing Response',
    description: 'Handle phishing reports including email analysis, sender blocking, and user notification',
    category: 'incident_response',
    steps: [
      { id: 'S1', name: 'Analyze Email Headers', action: 'analyze', target: 'email', condition: 'always', next_step: 'S2' },
      { id: 'S2', name: 'Check URL Reputation', action: 'enrich', target: 'urls', condition: 'urls_found', next_step: 'S3' },
      { id: 'S3', name: 'Block Sender Domain', action: 'block', target: 'email_gateway', condition: 'malicious', next_step: 'S4' },
      { id: 'S4', name: 'Remove from All Mailboxes', action: 'remediate', target: 'mailboxes', condition: 'malicious', next_step: 'S5' },
      { id: 'S5', name: 'Notify Affected Users', action: 'notify', target: 'users', condition: 'always', next_step: undefined }
    ],
    triggers: [{ type: 'manual', condition: undefined }],
    enabled: true,
    created_at: '2025-10-15T00:00:00Z',
    updated_at: '2025-12-20T00:00:00Z',
    last_run: '2026-01-04T16:30:00Z',
    run_count: 156,
    success_rate: 98
  },
  {
    id: 'PB-003',
    name: 'Credential Compromise Response',
    description: 'Immediate response to credential compromise including password reset and session revocation',
    category: 'identity',
    steps: [
      { id: 'S1', name: 'Disable Account', action: 'disable', target: 'user_account', condition: 'always', next_step: 'S2' },
      { id: 'S2', name: 'Revoke All Sessions', action: 'revoke', target: 'sessions', condition: 'success', next_step: 'S3' },
      { id: 'S3', name: 'Force Password Reset', action: 'reset', target: 'password', condition: 'success', next_step: 'S4' },
      { id: 'S4', name: 'Review Access Logs', action: 'audit', target: 'logs', condition: 'success', next_step: 'S5' },
      { id: 'S5', name: 'Generate Report', action: 'report', target: 'incident', condition: 'always', next_step: undefined }
    ],
    triggers: [{ type: 'alert', condition: 'category = credential_compromise' }],
    enabled: true,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-12-15T00:00:00Z',
    last_run: '2026-01-03T22:00:00Z',
    run_count: 23,
    success_rate: 100
  }
];

const mockIntegrations: Integration[] = [
  { id: 'INT-001', name: 'Splunk Enterprise', category: 'siem', status: 'healthy', last_sync: '2026-01-05T14:30:00Z', events_processed: 1250000 },
  { id: 'INT-002', name: 'CrowdStrike Falcon', category: 'edr', status: 'healthy', last_sync: '2026-01-05T14:28:00Z', events_processed: 890000 },
  { id: 'INT-003', name: 'Palo Alto Firewall', category: 'firewall', status: 'healthy', last_sync: '2026-01-05T14:25:00Z', events_processed: 2100000 },
  { id: 'INT-004', name: 'VirusTotal', category: 'threat_intel', status: 'healthy', last_sync: '2026-01-05T14:30:00Z', events_processed: 45000 },
  { id: 'INT-005', name: 'ServiceNow ITSM', category: 'ticketing', status: 'warning', last_sync: '2026-01-05T13:00:00Z', events_processed: 12500 },
  { id: 'INT-006', name: 'Microsoft Sentinel', category: 'siem', status: 'healthy', last_sync: '2026-01-05T14:29:00Z', events_processed: 980000 },
];

const mockAutomations: Automation[] = [
  {
    id: 'AUTO-001',
    name: 'Auto-Enrich IOCs',
    description: 'Automatically enrich all new IOCs with threat intelligence',
    trigger: { type: 'event', event: 'new_ioc' },
    conditions: [{ field: 'ioc_type', operator: 'in', value: ['ip', 'domain', 'hash'] }],
    actions: [{ type: 'enrich', target: 'ioc', params: { sources: ['virustotal', 'abuseipdb', 'otx'] } }],
    enabled: true,
    created_at: '2025-12-01T00:00:00Z',
    last_triggered: '2026-01-05T14:20:00Z',
    trigger_count: 2340
  },
  {
    id: 'AUTO-002',
    name: 'Critical Alert Escalation',
    description: 'Escalate critical alerts that are unassigned for more than 15 minutes',
    trigger: { type: 'schedule', schedule: '*/15 * * * *' },
    conditions: [
      { field: 'severity', operator: 'equals', value: 'critical' },
      { field: 'assigned', operator: 'equals', value: false },
      { field: 'age_minutes', operator: 'greater_than', value: 15 }
    ],
    actions: [
      { type: 'assign', target: 'alert', params: { assignee: 'soc_lead' } },
      { type: 'notify', target: 'slack', params: { channel: '#soc-critical' } }
    ],
    enabled: true,
    created_at: '2025-11-15T00:00:00Z',
    last_triggered: '2026-01-05T14:00:00Z',
    trigger_count: 89
  }
];

const mockMetrics: MetricsData[] = [
  { timestamp: '2026-01-01', cases_opened: 45, cases_closed: 42, avg_response_time: 25, playbooks_executed: 67, automations_run: 234, sla_breaches: 2 },
  { timestamp: '2026-01-02', cases_opened: 52, cases_closed: 48, avg_response_time: 22, playbooks_executed: 78, automations_run: 256, sla_breaches: 1 },
  { timestamp: '2026-01-03', cases_opened: 38, cases_closed: 44, avg_response_time: 18, playbooks_executed: 55, automations_run: 198, sla_breaches: 0 },
  { timestamp: '2026-01-04', cases_opened: 61, cases_closed: 52, avg_response_time: 28, playbooks_executed: 89, automations_run: 312, sla_breaches: 3 },
  { timestamp: '2026-01-05', cases_opened: 33, cases_closed: 35, avg_response_time: 20, playbooks_executed: 45, automations_run: 178, sla_breaches: 0 },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [playbooks, setPlaybooks] = useState<Playbook[]>(mockPlaybooks);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);
  const [metricsHistory] = useState<MetricsData[]>(mockMetrics);
  const [enrichmentResults, setEnrichmentResults] = useState<EnrichmentResult[]>([]);
  const [settings, setSettings] = useState<SOARSettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState(3);

  const stats: DashboardStats = {
    open_cases: cases.filter(c => c.status === 'open' || c.status === 'in_progress').length,
    critical_cases: cases.filter(c => c.priority === 'critical' && c.status !== 'closed').length,
    active_playbooks: playbooks.filter(p => p.enabled).length,
    integrations_healthy: integrations.filter(i => i.status === 'healthy').length,
    total_integrations: integrations.length,
    automations_enabled: automations.filter(a => a.enabled).length,
    alerts_today: 127,
    mttr_minutes: 23,
    automation_rate: 78
  };

  const handleCreateCase = (caseData: Partial<Case>) => {
    const newCase: Case = {
      id: `CASE-${String(cases.length + 1).padStart(3, '0')}`,
      title: caseData.title || 'New Case',
      description: caseData.description || '',
      status: 'open',
      priority: caseData.priority || 'medium',
      assignee: caseData.assignee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: caseData.tags || [],
      related_alerts: [],
      artifacts: [],
      timeline: [{ timestamp: new Date().toISOString(), action: 'Case created', user: 'Current User' }],
      notes: [],
      sla_due: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    };
    setCases([newCase, ...cases]);
  };

  const handleUpdateCase = (updatedCase: Case) => {
    setCases(cases.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  const handleRunPlaybook = (playbookId: string, caseId?: string) => {
    setPlaybooks(playbooks.map(p =>
      p.id === playbookId
        ? { ...p, last_run: new Date().toISOString(), run_count: p.run_count + 1 }
        : p
    ));
  };

  const handleSavePlaybook = (playbook: Playbook) => {
    const exists = playbooks.find(p => p.id === playbook.id);
    if (exists) {
      setPlaybooks(playbooks.map(p => p.id === playbook.id ? playbook : p));
    } else {
      setPlaybooks([...playbooks, playbook]);
    }
  };

  const handleConfigureIntegration = (integrationId: string, config: any) => {
    setIntegrations(integrations.map(i =>
      i.id === integrationId ? { ...i, ...config } : i
    ));
  };

  const handleEnrichIOC = async (ioc: string, type: string): Promise<EnrichmentResult> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result: EnrichmentResult = {
      ioc,
      type: type as any,
      sources: [
        { name: 'VirusTotal', score: Math.floor(Math.random() * 100), verdict: Math.random() > 0.5 ? 'malicious' : 'clean', details: { detection_ratio: '45/70' } },
        { name: 'AbuseIPDB', score: Math.floor(Math.random() * 100), verdict: Math.random() > 0.5 ? 'suspicious' : 'clean', details: { reports: 12 } },
        { name: 'AlienVault OTX', score: Math.floor(Math.random() * 100), verdict: 'unknown', details: { pulses: 3 } }
      ],
      overall_score: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString()
    };
    setEnrichmentResults([result, ...enrichmentResults.slice(0, 9)]);
    return result;
  };

  const handleSaveAutomation = (automation: Automation) => {
    const exists = automations.find(a => a.id === automation.id);
    if (exists) {
      setAutomations(automations.map(a => a.id === automation.id ? automation : a));
    } else {
      setAutomations([...automations, automation]);
    }
  };

  const handleToggleAutomation = (automationId: string) => {
    setAutomations(automations.map(a =>
      a.id === automationId ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const handleExportReport = (reportType: string, format: string) => {
    console.log(`Exporting ${reportType} report as ${format}`);
    // In real implementation, this would trigger report generation
  };

  const handleUpdateSettings = (newSettings: Partial<SOARSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            stats={stats}
            recentCases={cases.slice(0, 5)}
            activePlaybooks={playbooks.filter(p => p.enabled).slice(0, 5)}
            onViewCase={(id) => { setActiveTab('cases'); }}
            onRunPlaybook={handleRunPlaybook}
          />
        );
      case 'cases':
        return (
          <CaseManagement
            cases={cases}
            onCreateCase={handleCreateCase}
            onUpdateCase={handleUpdateCase}
            onRunPlaybook={handleRunPlaybook}
            playbooks={playbooks}
          />
        );
      case 'playbooks':
        return (
          <PlaybookBuilder
            playbooks={playbooks}
            onSave={handleSavePlaybook}
            onRun={handleRunPlaybook}
          />
        );
      case 'integrations':
        return (
          <IntegrationHub
            integrations={integrations}
            onConfigure={handleConfigureIntegration}
            onSync={(id) => console.log('Syncing integration:', id)}
          />
        );
      case 'enrichment':
        return (
          <EnrichmentPanel
            results={enrichmentResults}
            onEnrich={handleEnrichIOC}
          />
        );
      case 'automations':
        return (
          <AutomationManager
            automations={automations}
            onSave={handleSaveAutomation}
            onToggle={handleToggleAutomation}
          />
        );
      case 'reports':
        return (
          <ReportsDashboard
            metricsHistory={metricsHistory}
            onExport={handleExportReport}
          />
        );
      case 'assistant':
        return (
          <AIAssistant
            onCreateCase={handleCreateCase}
            onRunPlaybook={handleRunPlaybook}
            onEnrichIOC={handleEnrichIOC}
          />
        );
      case 'settings':
        return (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                <input
                  type="text"
                  value={settings.organization_name}
                  onChange={(e) => handleUpdateSettings({ organization_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default SLA (hours)</label>
                <input
                  type="number"
                  value={settings.default_sla_hours}
                  onChange={(e) => handleUpdateSettings({ default_sla_hours: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Enable Auto-Enrichment</span>
                <button
                  onClick={() => handleUpdateSettings({ auto_enrich: !settings.auto_enrich })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.auto_enrich ? 'bg-purple-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.auto_enrich ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Enable Notifications</span>
                <button
                  onClick={() => handleUpdateSettings({ notifications_enabled: !settings.notifications_enabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications_enabled ? 'bg-purple-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.notifications_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', name: 'Cases', icon: Briefcase },
    { id: 'playbooks', name: 'Playbooks', icon: BookOpen },
    { id: 'integrations', name: 'Integrations', icon: Link2 },
    { id: 'enrichment', name: 'Enrichment', icon: Search },
    { id: 'automations', name: 'Automations', icon: Zap },
    { id: 'reports', name: 'Reports', icon: FileBarChart },
    { id: 'assistant', name: 'AI Assistant', icon: Bot },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SOAR Engine</h1>
              <p className="text-xs text-gray-500">Security Orchestration</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
                {item.id === 'cases' && stats.critical_cases > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                    {stats.critical_cases}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">John Analyst</p>
              <p className="text-xs text-gray-500">SOC Analyst</p>
            </div>
            <button className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {navItems.find(n => n.id === activeTab)?.name}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Notifications">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">All Systems Operational</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
