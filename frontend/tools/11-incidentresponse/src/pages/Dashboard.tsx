import React from 'react';
import {
  AlertTriangle,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Activity,
  Siren,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Active Incidents',
      value: '5',
      change: '+2',
      trend: 'up',
      icon: <Siren className="w-6 h-6" />,
      color: 'from-red-500 to-red-600',
      alert: true,
    },
    {
      title: 'Mean Response Time',
      value: '4.2m',
      change: '-1.3m',
      trend: 'down',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-incident-500 to-incident-600',
    },
    {
      title: 'Resolved Today',
      value: '12',
      change: '+4',
      trend: 'up',
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Active Responders',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
    },
  ];

  const activeIncidents = [
    {
      id: 'INC-2024-001',
      title: 'Ransomware Attack - Production DB',
      severity: 'critical',
      status: 'in-progress',
      assignee: 'John Smith',
      duration: '2h 15m',
      affected: '45 systems',
    },
    {
      id: 'INC-2024-002',
      title: 'Data Exfiltration Attempt',
      severity: 'critical',
      status: 'investigating',
      assignee: 'Sarah Chen',
      duration: '45m',
      affected: '3 endpoints',
    },
    {
      id: 'INC-2024-003',
      title: 'Phishing Campaign Detected',
      severity: 'high',
      status: 'in-progress',
      assignee: 'Mike Johnson',
      duration: '1h 30m',
      affected: '120 users',
    },
    {
      id: 'INC-2024-004',
      title: 'Unauthorized Access - Finance Server',
      severity: 'high',
      status: 'investigating',
      assignee: 'Emily Davis',
      duration: '30m',
      affected: '1 server',
    },
    {
      id: 'INC-2024-005',
      title: 'DDoS Attack on API Gateway',
      severity: 'medium',
      status: 'mitigating',
      assignee: 'Alex Turner',
      duration: '15m',
      affected: 'API services',
    },
  ];

  const severityColors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const statusColors: Record<string, string> = {
    'in-progress': 'bg-incident-500/20 text-incident-400',
    'investigating': 'bg-blue-500/20 text-blue-400',
    'mitigating': 'bg-purple-500/20 text-purple-400',
    'resolved': 'bg-green-500/20 text-green-400',
    'escalated': 'bg-red-500/20 text-red-400',
  };

  const recentTimeline = [
    { time: '2 min ago', event: 'Containment measures applied', type: 'action', incident: 'INC-2024-001' },
    { time: '5 min ago', event: 'Malware sample collected', type: 'forensics', incident: 'INC-2024-001' },
    { time: '8 min ago', event: 'Network segment isolated', type: 'action', incident: 'INC-2024-002' },
    { time: '12 min ago', event: 'Playbook initiated: Ransomware Response', type: 'playbook', incident: 'INC-2024-001' },
    { time: '15 min ago', event: 'Alert escalated to SOC Manager', type: 'escalation', incident: 'INC-2024-002' },
  ];

  return (
    <div className="flex-1 bg-dark-200 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Incident Response Dashboard</h1>
            <p className="text-gray-400 mt-1">Real-time incident management and response coordination</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg animate-pulse">
              <Siren className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold">5 Active Incidents</span>
            </div>
            <button className="px-4 py-2 bg-incident-gradient text-white rounded-lg font-medium hover:shadow-incident transition-all">
              + Declare Incident
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-dark-300 rounded-xl p-5 border ${
                stat.alert ? 'border-red-500/50 animate-pulse' : 'border-incident-500/20'
              } hover:border-incident-500/40 transition-all`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${
                    stat.trend === 'up' && stat.title.includes('Active') 
                      ? 'text-red-400' 
                      : stat.trend === 'down' 
                        ? 'text-green-400' 
                        : 'text-green-400'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Incidents */}
          <div className="lg:col-span-2 bg-dark-300 rounded-xl border border-incident-500/20">
            <div className="p-4 border-b border-incident-500/20 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Siren className="w-5 h-5 text-incident-400" />
                Active Incidents
              </h2>
              <button className="text-incident-400 text-sm hover:text-incident-300">View All →</button>
            </div>
            <div className="divide-y divide-dark-100">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="p-4 hover:bg-dark-200/50 transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-incident-400 font-mono text-sm">{incident.id}</span>
                        <span className={`px-2 py-0.5 text-xs rounded border ${severityColors[incident.severity]}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${statusColors[incident.status]}`}>
                          {incident.status.replace('-', ' ')}
                        </span>
                      </div>
                      <h3 className="text-white font-medium mt-2">{incident.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {incident.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {incident.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {incident.affected}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-incident-400 hover:bg-incident-500/10 rounded-lg transition-all">
                      <Activity className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Timeline */}
          <div className="bg-dark-300 rounded-xl border border-incident-500/20">
            <div className="p-4 border-b border-incident-500/20">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-incident-400" />
                Live Timeline
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {recentTimeline.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-incident-500 mt-1.5"></div>
                    {index < recentTimeline.length - 1 && (
                      <div className="absolute top-4 left-1.5 w-0.5 h-full bg-incident-500/30 -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{item.event}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-incident-400 font-mono">{item.incident}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Response Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-300 rounded-xl p-5 border border-incident-500/20">
            <h3 className="text-gray-400 text-sm mb-3">Incident Severity Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-red-400 text-sm">Critical</span>
                <div className="flex-1 mx-3 h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-white font-semibold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-400 text-sm">High</span>
                <div className="flex-1 mx-3 h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-white font-semibold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 text-sm">Medium</span>
                <div className="flex-1 mx-3 h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <span className="text-white font-semibold">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-400 text-sm">Low</span>
                <div className="flex-1 mx-3 h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <span className="text-white font-semibold">0</span>
              </div>
            </div>
          </div>

          <div className="bg-dark-300 rounded-xl p-5 border border-incident-500/20">
            <h3 className="text-gray-400 text-sm mb-3">Response Team Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-2xl font-bold text-green-400">6</p>
                <p className="text-xs text-gray-400">Available</p>
              </div>
              <div className="text-center p-3 bg-incident-500/10 rounded-lg border border-incident-500/20">
                <p className="text-2xl font-bold text-incident-400">8</p>
                <p className="text-xs text-gray-400">Responding</p>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <p className="text-2xl font-bold text-yellow-400">2</p>
                <p className="text-xs text-gray-400">On-Call</p>
              </div>
              <div className="text-center p-3 bg-gray-500/10 rounded-lg border border-gray-500/20">
                <p className="text-2xl font-bold text-gray-400">4</p>
                <p className="text-xs text-gray-400">Offline</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-300 rounded-xl p-5 border border-incident-500/20">
            <h3 className="text-gray-400 text-sm mb-3">Response Metrics (Today)</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Avg. Detection Time</span>
                  <span className="text-white font-semibold">2.3 min</span>
                </div>
                <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-incident-gradient rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Avg. Response Time</span>
                  <span className="text-white font-semibold">4.2 min</span>
                </div>
                <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-incident-gradient rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Avg. Resolution Time</span>
                  <span className="text-white font-semibold">1.5 hrs</span>
                </div>
                <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-incident-gradient rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
