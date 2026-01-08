import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Shield, Menu, ChevronLeft, Bell, Settings, 
  MessageSquare, Search, Activity, Target,
  AlertTriangle, FileText, Zap, Grid, Eye, LogOut
} from 'lucide-react';

// Components
import {
  AlertTriagePanel,
  IncidentInvestigation,
  ThreatHuntingPanel,
  DashboardOverview,
  ReportsGenerator,
  MitreMapping,
  PlaybookManager,
  AIAssistant
} from './components';

// Types and constants
import { 
  Tab, SecurityAlert, Incident, ThreatHunt, 
  Playbook, PlaybookExecution, MitreTechnique,
  DashboardStats, AlertStatus
} from './types';
import { NAV_ITEMS } from './constants';
import NeuralLinkInterface from '../../../neural-link-interface/App';

const BASE_PATH = '/maula';

const CoreApp: React.FC = () => {
  const navigate = useNavigate();
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Data State
  const [alerts, setAlerts] = useState<SecurityAlert[]>(MOCK_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [hunts, setHunts] = useState<ThreatHunt[]>(MOCK_HUNTS);
  const [selectedHunt, setSelectedHunt] = useState<ThreatHunt | null>(null);
  const [playbooks, setPlaybooks] = useState<Playbook[]>(MOCK_PLAYBOOKS);
  const [playbookExecutions, setPlaybookExecutions] = useState<PlaybookExecution[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [techniques] = useState<MitreTechnique[]>(MOCK_TECHNIQUES);
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null);
  
  // AI Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Dashboard Stats
  const [stats] = useState<DashboardStats>({
    open_incidents: incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length,
    alerts_today: alerts.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length,
    threats_neutralized: 47,
    critical_alerts: alerts.filter(a => a.severity === 'critical').length,
    mean_time_to_detect: 12,
    mean_time_to_respond: 28,
    active_hunts: hunts.filter(h => h.status === 'running').length,
    team_online: 8
  });

  // Handlers
  const handleSelectAlert = (alert: SecurityAlert) => {
    setSelectedAlert(alert);
    // If in investigation tab, create incident from alert
  };

  const handleUpdateAlertStatus = (alertId: string, status: AlertStatus) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status } : a
    ));
  };

  const handleUpdateIncidentStatus = (status: Incident['status']) => {
    if (selectedIncident) {
      setIncidents(prev => prev.map(i => 
        i.id === selectedIncident.id ? { ...i, status } : i
      ));
      setSelectedIncident(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleAddNote = (note: string) => {
    if (selectedIncident) {
      const newNote = {
        id: `note_${Date.now()}`,
        content: note,
        author: 'analyst@blueteam',
        timestamp: new Date().toISOString(),
        type: 'general' as const
      };
      const updated = {
        ...selectedIncident,
        notes: [...selectedIncident.notes, newNote]
      };
      setIncidents(prev => prev.map(i => i.id === selectedIncident.id ? updated : i));
      setSelectedIncident(updated);
    }
  };

  const handleCreateHunt = (hunt: Partial<ThreatHunt>) => {
    const newHunt: ThreatHunt = {
      id: `hunt_${Date.now()}`,
      name: hunt.name || 'New Hunt',
      hypothesis: hunt.hypothesis || '',
      status: 'pending',
      query_type: hunt.query_type || 'ioc_search',
      data_sources: hunt.data_sources || [],
      created_by: 'analyst@blueteam',
      created_at: new Date().toISOString(),
      findings: [],
      indicators: hunt.indicators || []
    };
    setHunts(prev => [...prev, newHunt]);
  };

  const handleRunHunt = (huntId: string) => {
    setHunts(prev => prev.map(h => 
      h.id === huntId ? { ...h, status: 'running' } : h
    ));
    // Simulate hunt completion
    setTimeout(() => {
      setHunts(prev => prev.map(h => 
        h.id === huntId ? { ...h, status: 'completed' } : h
      ));
    }, 3000);
  };

  const handlePauseHunt = (huntId: string) => {
    setHunts(prev => prev.map(h => 
      h.id === huntId ? { ...h, status: 'paused' } : h
    ));
  };

  const handleRunPlaybook = (playbookId: string) => {
    const execution: PlaybookExecution = {
      id: `exec_${Date.now()}`,
      playbook_id: playbookId,
      status: 'running',
      started_at: new Date().toISOString(),
      triggered_by: 'analyst@blueteam',
      step_results: []
    };
    setPlaybookExecutions(prev => [...prev, execution]);
  };

  const handleCreatePlaybook = (playbook: Partial<Playbook>) => {
    const newPlaybook: Playbook = {
      id: `pb_${Date.now()}`,
      name: playbook.name || 'New Playbook',
      description: playbook.description || '',
      trigger_type: playbook.trigger_type || 'manual',
      is_active: true,
      steps: [],
      created_by: 'analyst@blueteam',
      created_at: new Date().toISOString()
    };
    setPlaybooks(prev => [...prev, newPlaybook]);
  };

  const handleGenerateReport = (type: string, options: any) => {
    console.log('Generating report:', type, options);
    // Report generation logic
  };

  const handleSendMessage = (message: string) => {
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(message),
        timestamp: new Date().toISOString(),
        suggestions: ['Show MITRE mapping', 'Create incident', 'Run threat hunt']
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsAiLoading(false);
    }, 1500);
  };

  // Icon mapping
  const getIcon = (id: string) => {
    const icons: Record<string, any> = {
      dashboard: Activity,
      alerts: AlertTriangle,
      incidents: Eye,
      hunting: Target,
      mitre: Grid,
      playbooks: Zap,
      reports: FileText,
      settings: Settings
    };
    return icons[id] || Activity;
  };

  // Render main content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            stats={stats}
            recentAlerts={alerts.slice(0, 5)}
            activeIncidents={incidents.filter(i => i.status !== 'closed')}
            onSelectAlert={handleSelectAlert}
            onSelectIncident={setSelectedIncident}
          />
        );
      case 'alerts':
        return (
          <div className="h-full flex gap-4">
            <div className="w-1/2">
              <AlertTriagePanel
                alerts={alerts}
                onSelectAlert={handleSelectAlert}
                onUpdateStatus={handleUpdateAlertStatus}
                selectedAlertId={selectedAlert?.id}
              />
            </div>
            <div className="w-1/2">
              {selectedAlert && (
                <div className="h-full bg-slate-900/50 rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Alert Details</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-gray-500">Title</span>
                      <p className="text-white">{selectedAlert.title}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Description</span>
                      <p className="text-gray-400 text-sm">{selectedAlert.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500">Source</span>
                        <p className="text-white">{selectedAlert.source}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Source IP</span>
                        <p className="text-white font-mono">{selectedAlert.source_ip || 'N/A'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        // Create incident from alert
                        const newIncident: Incident = {
                          id: `inc_${Date.now()}`,
                          title: selectedAlert.title,
                          description: selectedAlert.description,
                          severity: selectedAlert.severity,
                          status: 'open',
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          assigned_to: [],
                          related_alerts: [selectedAlert.id],
                          timeline: [{
                            id: `evt_${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            event_type: 'detection',
                            title: 'Incident Created',
                            description: `Created from alert: ${selectedAlert.title}`,
                            source: 'BlueTeamAI'
                          }],
                          iocs: [],
                          mitre_techniques: [],
                          notes: []
                        };
                        setIncidents(prev => [...prev, newIncident]);
                        setActiveTab('incidents');
                        setSelectedIncident(newIncident);
                      }}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Incident
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'incidents':
        return (
          <div className="h-full flex gap-4">
            <div className="w-72 bg-slate-900/50 rounded-xl border border-white/10 p-4">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-400" />
                Incidents
              </h3>
              <div className="space-y-2">
                {incidents.map(incident => (
                  <button
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedIncident?.id === incident.id 
                        ? 'bg-red-500/20 border border-red-500/50' 
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <span className="text-sm font-medium text-white line-clamp-1">{incident.title}</span>
                    <span className="text-xs text-gray-500">{incident.status}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <IncidentInvestigation
                incident={selectedIncident}
                onAddNote={handleAddNote}
                onUpdateStatus={handleUpdateIncidentStatus}
                onAddIOC={() => {}}
              />
            </div>
          </div>
        );
      case 'hunting':
        return (
          <ThreatHuntingPanel
            hunts={hunts}
            onCreateHunt={handleCreateHunt}
            onRunHunt={handleRunHunt}
            onPauseHunt={handlePauseHunt}
            onSelectHunt={(hunt) => setSelectedHunt(hunt)}
            selectedHuntId={selectedHunt?.id}
          />
        );
      case 'mitre':
        return (
          <MitreMapping
            techniques={techniques}
            onSelectTechnique={setSelectedTechnique}
            selectedTechniqueId={selectedTechnique?.id}
          />
        );
      case 'playbooks':
        return (
          <PlaybookManager
            playbooks={playbooks}
            executions={playbookExecutions}
            onRunPlaybook={handleRunPlaybook}
            onCreatePlaybook={handleCreatePlaybook}
            onSelectPlaybook={(pb) => setSelectedPlaybook(pb)}
            selectedPlaybookId={selectedPlaybook?.id}
          />
        );
      case 'reports':
        return <ReportsGenerator onGenerateReport={handleGenerateReport} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/30">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">BlueTeam AI</h1>
                <p className="text-xs text-blue-400">Security Operations Center</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search alerts, incidents..."
                className="w-64 bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Neural Link */}
            <button
              onClick={() => navigate(`${BASE_PATH}/ai`)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Neural Link AI</span>
            </button>

            {/* AI Assistant Toggle */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${
                chatOpen ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-bold">JD</span>
              </div>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16 h-screen">
        {/* Sidebar */}
        <aside 
          className={`fixed left-0 top-16 bottom-0 bg-slate-900/50 backdrop-blur border-r border-blue-500/20 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = getIcon(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-white'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Threat Level Indicator */}
          {sidebarOpen && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Threat Level</span>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">ELEVATED</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-3/5 h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
                </div>
                <p className="text-xs text-gray-400 mt-2">3 active threats being monitored</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-300 overflow-hidden ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          } ${chatOpen ? 'mr-96' : ''}`}
        >
          <div className="h-full p-6 overflow-y-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {React.createElement(getIcon(activeTab), { className: 'w-6 h-6 text-blue-400' })}
                {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'BlueTeam AI'}
              </h2>
              <p className="text-gray-400 mt-1 text-sm">
                {activeTab === 'dashboard' && 'Security operations overview and key metrics'}
                {activeTab === 'alerts' && 'Triage and manage security alerts'}
                {activeTab === 'incidents' && 'Investigate and respond to security incidents'}
                {activeTab === 'hunting' && 'Proactive threat hunting campaigns'}
                {activeTab === 'mitre' && 'MITRE ATT&CK framework mapping'}
                {activeTab === 'playbooks' && 'Automated response playbooks'}
                {activeTab === 'reports' && 'Generate security reports and exports'}
              </p>
            </div>

            {/* Content Area */}
            <div className="h-[calc(100%-80px)]">
              {renderContent()}
            </div>
          </div>
        </main>

        {/* AI Chat Panel */}
        {chatOpen && (
          <aside className="fixed right-0 top-16 bottom-0 w-96 border-l border-blue-500/20">
            <AIAssistant
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isAiLoading}
            />
          </aside>
        )}
      </div>
    </div>
  );
};

// Helper function for AI responses
const getAIResponse = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes('mitre') || lower.includes('technique')) {
    return "Based on the current alerts, I've identified potential mapping to several MITRE ATT&CK techniques:\n\n• T1059 - Command and Scripting Interpreter\n• T1078 - Valid Accounts\n• T1071 - Application Layer Protocol\n\nWould you like me to create a threat hunt based on these techniques?";
  }
  if (lower.includes('hunt') || lower.includes('threat')) {
    return "I can help you set up a threat hunt. Based on recent activity, I recommend focusing on:\n\n1. **Lateral Movement** - Look for unusual SMB/RDP connections\n2. **Persistence** - Check for new scheduled tasks or services\n3. **Exfiltration** - Monitor for large outbound data transfers\n\nWhich area would you like to prioritize?";
  }
  if (lower.includes('incident') || lower.includes('alert')) {
    return "I've analyzed the recent alerts and identified 3 that may be related to a coordinated attack:\n\n• Failed login attempts from 192.168.1.100\n• Suspicious PowerShell execution on WS-2024-001\n• Outbound connection to known C2 IP\n\nShall I create an incident to correlate these alerts?";
  }
  return "I'm your BlueTeam AI assistant. I can help you with:\n\n• Analyzing security alerts and creating incidents\n• Mapping threats to MITRE ATT&CK techniques\n• Creating and running threat hunts\n• Automating response with playbooks\n• Generating security reports\n\nWhat would you like to do?";
};

// Mock Data
const MOCK_ALERTS: SecurityAlert[] = [
  {
    id: 'alert_001',
    title: 'Multiple Failed Login Attempts Detected',
    description: 'Over 50 failed login attempts detected from a single IP address within 5 minutes',
    severity: 'high',
    status: 'new',
    source: 'Azure AD',
    source_ip: '192.168.1.100',
    timestamp: new Date().toISOString(),
    indicators: ['brute_force', 'credential_attack'],
    mitre_techniques: ['T1110']
  },
  {
    id: 'alert_002',
    title: 'Suspicious PowerShell Execution',
    description: 'Encoded PowerShell command detected with potential malicious payload',
    severity: 'critical',
    status: 'investigating',
    source: 'Microsoft Defender',
    source_ip: '10.0.0.25',
    dest_ip: '10.0.0.1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    indicators: ['encoded_command', 'bypass_attempt'],
    mitre_techniques: ['T1059.001']
  },
  {
    id: 'alert_003',
    title: 'Outbound Connection to Known C2 Server',
    description: 'Network traffic detected to IP associated with Cobalt Strike infrastructure',
    severity: 'critical',
    status: 'new',
    source: 'Firewall',
    source_ip: '10.0.0.50',
    dest_ip: '45.33.32.156',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    indicators: ['c2_traffic', 'beacon_activity'],
    mitre_techniques: ['T1071', 'T1095']
  },
  {
    id: 'alert_004',
    title: 'New Scheduled Task Created',
    description: 'Suspicious scheduled task created with encoded command execution',
    severity: 'medium',
    status: 'new',
    source: 'SIEM',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    indicators: ['persistence', 'scheduled_task'],
    mitre_techniques: ['T1053.005']
  }
];

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc_001',
    title: 'Potential APT Activity - Lateral Movement Detected',
    description: 'Coordinated attack involving credential theft and lateral movement across multiple systems',
    severity: 'critical',
    status: 'in_progress',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_to: ['analyst@blueteam', 'senior@blueteam'],
    related_alerts: ['alert_001', 'alert_002', 'alert_003'],
    timeline: [
      { id: 'evt_1', timestamp: new Date(Date.now() - 86400000).toISOString(), event_type: 'detection', title: 'Initial Detection', description: 'Multiple alerts correlated indicating coordinated attack', source: 'SIEM' },
      { id: 'evt_2', timestamp: new Date(Date.now() - 82800000).toISOString(), event_type: 'investigation', title: 'Scope Identified', description: '5 systems potentially compromised', source: 'BlueTeamAI' },
      { id: 'evt_3', timestamp: new Date(Date.now() - 79200000).toISOString(), event_type: 'containment', title: 'Network Isolation', description: 'Affected systems isolated from network', source: 'analyst@blueteam' }
    ],
    iocs: [
      { type: 'ip', value: '45.33.32.156', first_seen: new Date(Date.now() - 86400000).toISOString(), last_seen: new Date().toISOString(), confidence: 95, threat_type: 'C2' },
      { type: 'hash_sha256', value: 'a1b2c3d4e5f6...', first_seen: new Date(Date.now() - 86400000).toISOString(), last_seen: new Date().toISOString(), confidence: 90, threat_type: 'Malware' }
    ],
    mitre_techniques: [
      { id: 'T1059.001', name: 'PowerShell', tactic: 'Execution' },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion' }
    ],
    notes: [
      { id: 'note_1', content: 'Attacker appears to be using Cobalt Strike', author: 'analyst@blueteam', timestamp: new Date(Date.now() - 75600000).toISOString(), type: 'finding' }
    ]
  }
];

const MOCK_HUNTS: ThreatHunt[] = [
  {
    id: 'hunt_001',
    name: 'Cobalt Strike Beacon Detection',
    hypothesis: 'Attacker may be using Cobalt Strike for C2 communication based on recent alerts',
    status: 'running',
    query_type: 'behavior_pattern',
    data_sources: ['network_traffic', 'endpoint_logs'],
    created_by: 'analyst@blueteam',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    findings: [],
    indicators: ['45.33.32.156', 'beacon.dll', 'rundll32.exe']
  }
];

const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb_001',
    name: 'Ransomware Response',
    description: 'Automated response playbook for ransomware incidents',
    trigger_type: 'automatic',
    trigger_conditions: { alert_type: 'ransomware', severity: 'critical' },
    is_active: true,
    steps: [
      { id: 'step_1', order: 1, name: 'Isolate Host', description: 'Network isolate affected endpoint', action_type: 'containment', action_config: {}, required: true },
      { id: 'step_2', order: 2, name: 'Notify SOC Lead', description: 'Send alert to SOC leadership', action_type: 'notification', action_config: {}, required: true },
      { id: 'step_3', order: 3, name: 'Collect Artifacts', description: 'Gather forensic artifacts from endpoint', action_type: 'query', action_config: {}, required: false }
    ],
    created_by: 'admin@blueteam',
    created_at: new Date(Date.now() - 604800000).toISOString()
  }
];

const MOCK_TECHNIQUES: MitreTechnique[] = [
  { id: 'T1059.001', name: 'PowerShell', tactic: 'Execution', description: 'Adversaries may abuse PowerShell commands and scripts for execution.', detection: 'Monitor for PowerShell execution, especially with encoded commands', mitigation: 'Disable PowerShell for users who do not need it' },
  { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion', description: 'Adversaries may obtain and abuse credentials of existing accounts.', detection: 'Monitor for unusual account usage patterns', mitigation: 'Implement MFA and monitor for credential abuse' },
  { id: 'T1071', name: 'Application Layer Protocol', tactic: 'Command and Control', description: 'Adversaries may communicate using application layer protocols.', detection: 'Analyze network traffic for anomalies', mitigation: 'Use network intrusion detection systems' }
];

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to={BASE_PATH} replace />} />
      <Route path={`${BASE_PATH}`} element={<CoreApp />} />
      <Route path={`${BASE_PATH}/ai`} element={<NeuralLinkInterface />} />
      <Route path="*" element={<Navigate to={BASE_PATH} replace />} />
    </Routes>
  </Router>
);

export default App;
