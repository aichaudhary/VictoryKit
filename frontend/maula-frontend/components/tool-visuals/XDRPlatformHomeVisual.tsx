import React, { useState } from 'react';
import {
  Zap,
  Eye,
  Activity,
  BarChart3,
  Gamepad2,
  AlertTriangle,
  Shield,
  Cloud,
  Mail,
  Key,
} from 'lucide-react';

const XDRPlatformHomeVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'detection', label: 'Detection', icon: AlertTriangle },
    { id: 'response', label: 'Response', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'playground', label: 'Playground', icon: Gamepad2 },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-950 via-[#0d0a14] to-purple-950/30 rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20 bg-black/40">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-[7px] text-white font-bold flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" />
            EXTENDED DETECTION & RESPONSE
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-[7px] text-yellow-400 font-bold">
            DEMO MODE
          </div>
          <span className="text-[7px] text-white/40">XDRPLATFORM V3.0</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 overflow-hidden" style={{ height: 'calc(100% - 52px)' }}>
        {/* Title & Coverage Section */}
        <div className="flex gap-3 mb-2">
          {/* Left - Title & Stats */}
          <div className="flex-1">
            <h2 className="text-lg font-black text-white mb-1">
              XDR <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">PLATFORM</span>
            </h2>
            <p className="text-[7px] text-white/50 mb-2 leading-relaxed">
              Unified security platform correlating data across endpoints, networks, cloud, and applications.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <div className="text-purple-400 text-[10px] font-bold">11.3K</div>
                <div className="text-white/40 text-[6px]">EVENTS/SEC</div>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5 border border-red-500/20">
                <div className="text-red-400 text-[10px] font-bold">2</div>
                <div className="text-white/40 text-[6px]">ACTIVE THREATS</div>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <div className="text-cyan-400 text-[10px] font-bold">54+</div>
                <div className="text-white/40 text-[6px]">DATA SOURCES</div>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <div className="text-green-400 text-[10px] font-bold">4.6m</div>
                <div className="text-white/40 text-[6px]">AVG MTTR</div>
              </div>
            </div>

            {/* Log Events */}
            <div className="bg-black/40 rounded-lg p-1.5 border border-purple-500/10 text-[6px] font-mono space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-white/40">13:01:32</span>
                <span className="text-yellow-400">[HIGH]</span>
                <span className="text-white/60">Privilege Escalation</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white/40">13:01:28</span>
                <span className="text-red-400">[CRITICAL]</span>
                <span className="text-white/60">Malware Detected</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white/40">13:01:26</span>
                <span className="text-yellow-400">[HIGH]</span>
                <span className="text-white/60">Data Exfiltration</span>
              </div>
            </div>
          </div>

          {/* Right - Coverage Bars */}
          <div className="w-28 space-y-1">
            {[
              { label: 'EDR', value: 71, color: 'bg-orange-500' },
              { label: 'NDR', value: 94, color: 'bg-purple-500' },
              { label: 'Cloud', value: 96, color: 'bg-purple-500' },
              { label: 'Email', value: 84, color: 'bg-yellow-500' },
              { label: 'IAM', value: 86, color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-white/60 text-[7px] w-8">{item.label}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }}></div>
                </div>
                <span className="text-white/60 text-[7px] w-6 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-1">
            <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
              <div className="text-white/40 text-[6px] mb-0.5">Total Events</div>
              <div className="text-white text-sm font-bold">2.5M</div>
            </div>
            <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
              <div className="text-white/40 text-[6px] mb-0.5">Today</div>
              <div className="text-pink-400 text-sm font-bold">85.0K</div>
            </div>
            <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
              <div className="text-white/40 text-[6px] mb-0.5">Error Rate</div>
              <div className="text-red-400 text-sm font-bold">2.3%</div>
            </div>
            <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
              <div className="text-white/40 text-[6px] mb-0.5">Events/Min</div>
              <div className="text-purple-400 text-sm font-bold">59</div>
            </div>
          </div>

          {/* Event Distribution */}
          <div className="bg-white/5 rounded-lg p-2 border border-white/5">
            <div className="text-white text-[8px] font-bold mb-1">Event Distribution</div>
            <div className="space-y-0.5">
              {[
                { level: 'DEBUG', value: '800.0K', color: 'bg-gray-400', width: 40 },
                { level: 'INFO', value: '1.2M', color: 'bg-blue-500', width: 60 },
                { level: 'WARN', value: '350.0K', color: 'bg-yellow-500', width: 25 },
                { level: 'ERROR', value: '140.0K', color: 'bg-red-500', width: 12 },
                { level: 'CRITICAL', value: '10.0K', color: 'bg-purple-500', width: 8 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className={`px-1 py-0.5 rounded text-[5px] font-bold ${
                    item.level === 'DEBUG' ? 'bg-gray-500/20 text-gray-300' :
                    item.level === 'INFO' ? 'bg-blue-500/20 text-blue-400' :
                    item.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400' :
                    item.level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>{item.level}</span>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.width}%` }}></div>
                  </div>
                  <span className="text-white/50 text-[6px] w-8 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Critical Events */}
        <div className="bg-white/5 rounded-lg p-2 border border-white/5 mb-2">
          <div className="text-white text-[8px] font-bold mb-1">Recent Critical Events</div>
          <div className="space-y-1">
            <div className="bg-red-500/10 border-l-2 border-red-500 rounded-r px-2 py-1">
              <div className="text-red-400 text-[7px] font-medium">Database connection timeout</div>
              <div className="text-white/40 text-[6px]">prod-db-01 • 1:01:04 PM</div>
            </div>
            <div className="bg-red-500/10 border-l-2 border-red-500 rounded-r px-2 py-1">
              <div className="text-red-400 text-[7px] font-medium">Multiple failed login attempts detected</div>
              <div className="text-white/40 text-[6px]">auth-server • 1:00:04 PM</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-black/40 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[7px] font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-2.5 h-2.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default XDRPlatformHomeVisual;
