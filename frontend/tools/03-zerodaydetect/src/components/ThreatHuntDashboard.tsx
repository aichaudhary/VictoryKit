import React, { useState } from 'react';
import {
  Crosshair,
  Search,
  Filter,
  Play,
  Pause,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Terminal,
  Database,
  Network,
  Eye,
  Zap,
  Plus,
  ChevronDown,
  ChevronRight,
  Save,
  Share2,
} from 'lucide-react';

interface HuntQuery {
  id: string;
  name: string;
  description: string;
  category: 'malware' | 'persistence' | 'lateral' | 'exfil' | 'recon' | 'c2';
  query: string;
  mitre: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  dataSource: string;
  lastRun: string | null;
  results: number;
}

interface HuntResult {
  id: string;
  timestamp: string;
  host: string;
  user: string;
  process: string;
  event: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  ioc: string;
  context: string;
}

const HUNT_QUERIES: HuntQuery[] = [
  {
    id: 'H1',
    name: 'PowerShell Download Cradle',
    description: 'Detect PowerShell downloading and executing payloads',
    category: 'malware',
    query:
      'process.name:"powershell.exe" AND process.command_line:(*DownloadString* OR *IEX* OR *Invoke-Expression*)',
    mitre: ['T1059.001', 'T1105'],
    severity: 'critical',
    dataSource: 'Endpoint',
    lastRun: '2024-01-15 10:30',
    results: 3,
  },
  {
    id: 'H2',
    name: 'Suspicious Scheduled Task',
    description: 'Identify scheduled tasks created for persistence',
    category: 'persistence',
    query:
      'event.action:"scheduled-task-created" AND NOT process.name:("svchost.exe" OR "taskeng.exe")',
    mitre: ['T1053.005'],
    severity: 'high',
    dataSource: 'Endpoint',
    lastRun: '2024-01-15 09:15',
    results: 7,
  },
  {
    id: 'H3',
    name: 'SMB Lateral Movement',
    description: 'Detect lateral movement via SMB/Windows shares',
    category: 'lateral',
    query:
      'destination.port:445 AND network.direction:"outbound" AND source.ip:10.* AND NOT destination.ip:10.*',
    mitre: ['T1021.002'],
    severity: 'high',
    dataSource: 'Network',
    lastRun: '2024-01-15 08:00',
    results: 12,
  },
  {
    id: 'H4',
    name: 'DNS Exfiltration',
    description: 'Identify potential DNS tunneling/exfiltration',
    category: 'exfil',
    query: 'dns.question.name:/.{50,}/ OR dns.question.type:TXT AND NOT dns.response_code:NXDOMAIN',
    mitre: ['T1048.003', 'T1071.004'],
    severity: 'critical',
    dataSource: 'DNS',
    lastRun: '2024-01-14 23:45',
    results: 2,
  },
  {
    id: 'H5',
    name: 'Kerberoasting Activity',
    description: 'Detect service ticket requests for offline cracking',
    category: 'recon',
    query: 'event.code:4769 AND winlog.event_data.TicketEncryptionType:0x17',
    mitre: ['T1558.003'],
    severity: 'high',
    dataSource: 'Windows',
    lastRun: null,
    results: 0,
  },
  {
    id: 'H6',
    name: 'Beacon Communication Pattern',
    description: 'Identify periodic C2 beaconing behavior',
    category: 'c2',
    query: 'network.protocol:"http" AND @timestamp:[now-1h TO now] | stats count by destination.ip',
    mitre: ['T1071.001', 'T1573'],
    severity: 'critical',
    dataSource: 'Network',
    lastRun: '2024-01-15 11:00',
    results: 5,
  },
  {
    id: 'H7',
    name: 'LSASS Memory Access',
    description: 'Detect credential dumping via LSASS access',
    category: 'recon',
    query:
      'process.name:"lsass.exe" AND event.action:"process-access" AND NOT process.executable:(*\\Windows\\system32\\*)',
    mitre: ['T1003.001'],
    severity: 'critical',
    dataSource: 'Endpoint',
    lastRun: '2024-01-15 07:30',
    results: 1,
  },
  {
    id: 'H8',
    name: 'Suspicious WMI Execution',
    description: 'WMI used for remote code execution',
    category: 'lateral',
    query: 'process.parent.name:"wmiprvse.exe" AND process.name:("cmd.exe" OR "powershell.exe")',
    mitre: ['T1047'],
    severity: 'high',
    dataSource: 'Endpoint',
    lastRun: '2024-01-15 06:00',
    results: 4,
  },
];

const MOCK_RESULTS: HuntResult[] = [
  {
    id: 'R1',
    timestamp: '2024-01-15 10:28:33',
    host: 'DESKTOP-A1B2C3',
    user: 'john.smith',
    process: 'powershell.exe',
    event: 'Process Created',
    severity: 'critical',
    ioc: 'IEX (New-Object Net.WebClient).DownloadString',
    context: 'Parent: explorer.exe, Suspicious download cradle detected',
  },
  {
    id: 'R2',
    timestamp: '2024-01-15 10:25:17',
    host: 'SRV-WEB-01',
    user: 'SYSTEM',
    process: 'schtasks.exe',
    event: 'Scheduled Task Created',
    severity: 'high',
    ioc: 'WindowsUpdate',
    context: 'Masquerading as Windows Update, runs at 3AM daily',
  },
  {
    id: 'R3',
    timestamp: '2024-01-15 10:22:45',
    host: 'DESKTOP-D4E5F6',
    user: 'admin.user',
    process: 'rundll32.exe',
    event: 'Network Connection',
    severity: 'high',
    ioc: '185.123.xxx.xxx:443',
    context: 'Connection to known C2 infrastructure',
  },
  {
    id: 'R4',
    timestamp: '2024-01-15 10:19:08',
    host: 'SRV-DC-01',
    user: 'attacker$',
    process: 'mimikatz.exe',
    event: 'LSASS Access',
    severity: 'critical',
    ioc: 'sekurlsa::logonpasswords',
    context: 'Credential dumping detected on domain controller',
  },
  {
    id: 'R5',
    timestamp: '2024-01-15 10:15:22',
    host: 'DESKTOP-G7H8I9',
    user: 'jane.doe',
    process: 'certutil.exe',
    event: 'File Download',
    severity: 'high',
    ioc: 'certutil -urlcache -split -f',
    context: 'LOLBin used to download malware',
  },
];

const ThreatHuntDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedQuery, setSelectedQuery] = useState<HuntQuery | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<HuntResult[]>([]);
  const [showCustomQuery, setShowCustomQuery] = useState(false);
  const [customQuery, setCustomQuery] = useState('');

  const categories = [
    { key: 'all', label: 'All', icon: Target },
    { key: 'malware', label: 'Malware', icon: AlertTriangle },
    { key: 'persistence', label: 'Persistence', icon: Clock },
    { key: 'lateral', label: 'Lateral Movement', icon: Network },
    { key: 'exfil', label: 'Exfiltration', icon: Share2 },
    { key: 'recon', label: 'Reconnaissance', icon: Eye },
    { key: 'c2', label: 'C2', icon: Zap },
  ];

  const filteredQueries = HUNT_QUERIES.filter(
    (q) => selectedCategory === 'all' || q.category === selectedCategory
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const runHunt = (query: HuntQuery) => {
    setSelectedQuery(query);
    setIsRunning(true);
    setResults([]);

    // Simulate hunt execution
    setTimeout(() => {
      setIsRunning(false);
      setResults(MOCK_RESULTS.slice(0, Math.floor(Math.random() * 5) + 1));
    }, 2000);
  };

  const stats = {
    totalHunts: HUNT_QUERIES.length,
    activeDetections: HUNT_QUERIES.filter((q) => q.results > 0).length,
    criticalFindings: MOCK_RESULTS.filter((r) => r.severity === 'critical').length,
    lastHunt: '5 min ago',
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-red-500/20 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-red-500/20 bg-gradient-to-r from-slate-800 to-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Threat Hunt</h3>
              <p className="text-xs text-gray-400">Proactive threat detection</p>
            </div>
          </div>
          <button
            onClick={() => setShowCustomQuery(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" /> Custom Query
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-white">{stats.totalHunts}</div>
            <div className="text-xs text-gray-500">Hunt Queries</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-400">{stats.activeDetections}</div>
            <div className="text-xs text-gray-500">w/ Results</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-400">{stats.criticalFindings}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-purple-400">{stats.lastHunt}</div>
            <div className="text-xs text-gray-500">Last Hunt</div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Query List */}
        <div className="w-1/2 border-r border-slate-700/50 overflow-y-auto">
          <div className="p-2 space-y-2">
            {filteredQueries.map((query) => (
              <div
                key={query.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                  selectedQuery?.id === query.id
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-slate-900/30 border-slate-700/50 hover:border-slate-600'
                }`}
                onClick={() => setSelectedQuery(query)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-white">{query.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{query.description}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityColor(query.severity)}`}
                  >
                    {query.severity}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {query.mitre.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Database className="w-3 h-3" /> {query.dataSource}
                  </div>
                  <div className="flex items-center gap-2">
                    {query.results > 0 && (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                        {query.results} hits
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runHunt(query);
                      }}
                      className="p-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex-1 overflow-y-auto">
          {selectedQuery ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white">
                  {isRunning ? 'Running hunt...' : `Results for "${selectedQuery.name}"`}
                </h4>
                <button
                  onClick={() => runHunt(selectedQuery)}
                  disabled={isRunning}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isRunning
                      ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Hunting...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Run Hunt
                    </>
                  )}
                </button>
              </div>

              {/* Query Preview */}
              <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400 font-medium">Query</span>
                </div>
                <code className="text-xs text-green-400 font-mono break-all">
                  {selectedQuery.query}
                </code>
              </div>

              {/* Results List */}
              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg border ${getSeverityColor(result.severity)}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              result.severity === 'critical' ? 'text-red-400' : 'text-orange-400'
                            }`}
                          />
                          <span className="text-sm font-medium text-white">{result.event}</span>
                        </div>
                        <span className="text-xs text-gray-500">{result.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                        <div>
                          <span className="text-gray-500">Host: </span>
                          <span className="text-cyan-400 font-mono">{result.host}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">User: </span>
                          <span className="text-purple-400">{result.user}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Process: </span>
                          <span className="text-yellow-400 font-mono">{result.process}</span>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-900/50 rounded text-xs">
                        <span className="text-gray-500">IOC: </span>
                        <span className="text-red-400 font-mono">{result.ioc}</span>
                      </div>

                      <div className="mt-2 text-xs text-gray-400">{result.context}</div>
                    </div>
                  ))}
                </div>
              ) : (
                !isRunning && (
                  <div className="text-center py-8 text-gray-500">
                    <Crosshair className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No results yet. Click "Run Hunt" to execute the query.</p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a hunt query to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Query Modal */}
      {showCustomQuery && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCustomQuery(false)}
        >
          <div
            className="bg-slate-800 rounded-xl border border-green-500/30 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-green-400" />
                  Custom Hunt Query
                </h3>
                <button
                  onClick={() => setShowCustomQuery(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder='Enter your hunt query (e.g., process.name:"mimikatz.exe")'
                className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-green-400 font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/50 mb-4 resize-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomQuery(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCustomQuery(false);
                    // Add custom query execution logic
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Execute Hunt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatHuntDashboard;
