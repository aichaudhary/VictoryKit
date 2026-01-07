import React, { useState } from 'react';
import { 
  Clock, GitBranch, CheckCircle, AlertTriangle, XCircle,
  User, Shield, Database, Settings, Key, Filter, Calendar
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  category: string;
  severity: string;
  user: string;
  resource: string;
  ip: string;
  outcome: string;
}

interface Props {
  logs: AuditLog[];
}

const AuditTimeline: React.FC<Props> = ({ logs }) => {
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'authentication': return <Key className="w-4 h-4" />;
      case 'authorization': return <Shield className="w-4 h-4" />;
      case 'data_access': return <Database className="w-4 h-4" />;
      case 'configuration': return <Settings className="w-4 h-4" />;
      case 'security': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'border-red-500 bg-red-500/20';
      case 'error': return 'border-orange-500 bg-orange-500/20';
      case 'warning': return 'border-yellow-500 bg-yellow-500/20';
      default: return 'border-teal-500 bg-teal-500/20';
    }
  };

  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, AuditLog[]>);

  const filteredGroupedLogs = Object.entries(groupedLogs).reduce((acc, [date, dateLogs]) => {
    const filtered = dateLogs.filter(log => 
      selectedCategory === 'all' || log.category === selectedCategory
    );
    if (filtered.length > 0) acc[date] = filtered;
    return acc;
  }, {} as Record<string, AuditLog[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Timeline</h1>
          <p className="text-gray-400 mt-1">Chronological view of security events</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data_access">Data Access</option>
            <option value="configuration">Configuration</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.length}</p>
              <p className="text-xs text-gray-400">Total Events</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.filter(l => l.outcome === 'success').length}</p>
              <p className="text-xs text-gray-400">Successful</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.filter(l => l.severity === 'warning').length}</p>
              <p className="text-xs text-gray-400">Warnings</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.filter(l => l.severity === 'critical' || l.severity === 'error').length}</p>
              <p className="text-xs text-gray-400">Errors/Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="space-y-8">
          {Object.entries(filteredGroupedLogs).map(([date, dateLogs]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold">{date}</h3>
                <span className="text-sm text-gray-400">({dateLogs.length} events)</span>
              </div>

              {/* Events */}
              <div className="ml-4 pl-8 border-l-2 border-gray-700 space-y-4">
                {dateLogs.map((log, index) => (
                  <div key={log.id} className="relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[41px] w-4 h-4 rounded-full border-2 ${getSeverityColor(log.severity)}`} />
                    
                    {/* Event Card */}
                    <div className="bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700/70 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            log.category === 'authentication' ? 'bg-blue-500/20 text-blue-400' :
                            log.category === 'authorization' ? 'bg-violet-500/20 text-violet-400' :
                            log.category === 'data_access' ? 'bg-green-500/20 text-green-400' :
                            log.category === 'configuration' ? 'bg-amber-500/20 text-amber-400' :
                            log.category === 'security' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {getCategoryIcon(log.category)}
                          </div>
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-gray-400">by {log.user}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <div className="mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                              log.outcome === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {log.outcome === 'success' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {log.outcome}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          {log.resource}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.ip}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditTimeline;
