import React, { useState, useEffect } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity, AlertTriangle, Shield } from 'lucide-react';

interface RealTimeChartsProps {
  trafficData: any[];
  alertData: any[];
  performanceData: any[];
  timeRange: string;
}

const RealTimeCharts: React.FC<RealTimeChartsProps> = ({
  trafficData,
  alertData,
  performanceData,
  timeRange
}) => {
  const [selectedChart, setSelectedChart] = useState('traffic');
  const [isLive, setIsLive] = useState(true);

  // Mock chart data - in real implementation, this would come from props
  const mockTrafficData = [
    { time: '00:00', inbound: 1200, outbound: 800, blocked: 50 },
    { time: '04:00', inbound: 1100, outbound: 900, blocked: 45 },
    { time: '08:00', inbound: 1800, outbound: 1200, blocked: 80 },
    { time: '12:00', inbound: 2200, outbound: 1500, blocked: 120 },
    { time: '16:00', inbound: 2500, outbound: 1800, blocked: 150 },
    { time: '20:00', inbound: 1900, outbound: 1300, blocked: 90 },
  ];

  const mockAlertData = [
    { time: '00:00', critical: 2, high: 5, medium: 12, low: 8 },
    { time: '04:00', critical: 1, high: 3, medium: 8, low: 6 },
    { time: '08:00', critical: 3, high: 8, medium: 15, low: 12 },
    { time: '12:00', critical: 4, high: 12, medium: 20, low: 18 },
    { time: '16:00', critical: 5, high: 15, medium: 25, low: 22 },
    { time: '20:00', critical: 3, high: 10, medium: 18, low: 15 },
  ];

  const mockPerformanceData = [
    { time: '00:00', cpu: 45, memory: 62, latency: 12 },
    { time: '04:00', cpu: 38, memory: 58, latency: 10 },
    { time: '08:00', cpu: 72, memory: 75, latency: 18 },
    { time: '12:00', cpu: 85, memory: 82, latency: 25 },
    { time: '16:00', cpu: 78, memory: 79, latency: 22 },
    { time: '20:00', cpu: 65, memory: 68, latency: 15 },
  ];

  const TrafficChart: React.FC = () => (
    <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Traffic Flow Analysis
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Last 24 hours</span>
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Chart Area - Simplified representation */}
        <div className="h-64 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-end h-full">
            {mockTrafficData.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div className="flex flex-col items-center gap-1 w-8">
                  <div
                    className="w-2 bg-blue-500 rounded-t"
                    style={{ height: `${(data.inbound / 2500) * 100}%` }}
                  />
                  <div
                    className="w-2 bg-green-500"
                    style={{ height: `${(data.outbound / 2500) * 100}%` }}
                  />
                  <div
                    className="w-2 bg-red-500 rounded-b"
                    style={{ height: `${(data.blocked / 2500) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{data.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-sm text-gray-400">Inbound</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-sm text-gray-400">Outbound</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-sm text-gray-400">Blocked</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {mockTrafficData.reduce((sum, d) => sum + d.inbound, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Inbound</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {mockTrafficData.reduce((sum, d) => sum + d.outbound, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Outbound</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {mockTrafficData.reduce((sum, d) => sum + d.blocked, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Blocked</div>
          </div>
        </div>
      </div>
    </div>
  );

  const AlertChart: React.FC = () => (
    <div className="bg-slate-800/50 backdrop-blur border border-red-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Alert Trends
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Last 24 hours</span>
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Chart Area */}
        <div className="h-64 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-end h-full">
            {mockAlertData.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div className="flex flex-col items-center gap-1 w-8">
                  <div
                    className="w-2 bg-red-600 rounded-t"
                    style={{ height: `${(data.critical / 25) * 100}%` }}
                  />
                  <div
                    className="w-2 bg-orange-500"
                    style={{ height: `${(data.high / 25) * 100}%` }}
                  />
                  <div
                    className="w-2 bg-yellow-500"
                    style={{ height: `${(data.medium / 25) * 100}%` }}
                  />
                  <div
                    className="w-2 bg-blue-500 rounded-b"
                    style={{ height: `${(data.low / 25) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{data.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded" />
            <span className="text-sm text-gray-400">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded" />
            <span className="text-sm text-gray-400">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span className="text-sm text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-sm text-gray-400">Low</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {mockAlertData.reduce((sum, d) => sum + d.critical, 0)}
            </div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {mockAlertData.reduce((sum, d) => sum + d.high, 0)}
            </div>
            <div className="text-sm text-gray-400">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {mockAlertData.reduce((sum, d) => sum + d.medium, 0)}
            </div>
            <div className="text-sm text-gray-400">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {mockAlertData.reduce((sum, d) => sum + d.low, 0)}
            </div>
            <div className="text-sm text-gray-400">Low</div>
          </div>
        </div>
      </div>
    </div>
  );

  const PerformanceChart: React.FC = () => (
    <div className="bg-slate-800/50 backdrop-blur border border-green-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          System Performance
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Real-time metrics</span>
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Chart Area */}
        <div className="h-64 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-end h-full">
            {mockPerformanceData.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div className="flex flex-col items-center gap-1 w-8">
                  <div
                    className="w-2 bg-purple-500 rounded-t"
                    style={{ height: `${data.cpu}%` }}
                  />
                  <div
                    className="w-2 bg-cyan-500"
                    style={{ height: `${data.memory}%` }}
                  />
                  <div
                    className="w-2 bg-yellow-500 rounded-b"
                    style={{ height: `${data.latency * 2}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{data.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded" />
            <span className="text-sm text-gray-400">CPU Usage (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded" />
            <span className="text-sm text-gray-400">Memory Usage (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span className="text-sm text-gray-400">Latency (ms)</span>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {mockPerformanceData[mockPerformanceData.length - 1].cpu}%
            </div>
            <div className="text-sm text-gray-400">Current CPU</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {mockPerformanceData[mockPerformanceData.length - 1].memory}%
            </div>
            <div className="text-sm text-gray-400">Current Memory</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {mockPerformanceData[mockPerformanceData.length - 1].latency}ms
            </div>
            <div className="text-sm text-gray-400">Current Latency</div>
          </div>
        </div>
      </div>
    </div>
  );

  const ThreatDistributionChart: React.FC = () => (
    <div className="bg-slate-800/50 backdrop-blur border border-orange-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-400" />
          Threat Distribution
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">By category</span>
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Pie Chart Representation */}
        <div className="h-64 bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center">
            <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400">Interactive pie chart would go here</p>
            <p className="text-sm text-gray-500">Showing threat categories distribution</p>
          </div>
        </div>

        {/* Threat Categories */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-sm text-gray-400">Malware</span>
            <span className="text-sm font-bold text-red-400">35%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-sm text-gray-400">DDoS</span>
            <span className="text-sm font-bold text-orange-400">28%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-sm text-gray-400">Intrusion</span>
            <span className="text-sm font-bold text-yellow-400">22%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-sm text-gray-400">Other</span>
            <span className="text-sm font-bold text-blue-400">15%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Real-Time Analytics</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                isLive
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              {isLive ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedChart('traffic')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedChart === 'traffic'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            Traffic
          </button>
          <button
            onClick={() => setSelectedChart('alerts')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedChart === 'alerts'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setSelectedChart('performance')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedChart === 'performance'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setSelectedChart('threats')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedChart === 'threats'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            Threats
          </button>
        </div>
      </div>

      {/* Chart Content */}
      {selectedChart === 'traffic' && <TrafficChart />}
      {selectedChart === 'alerts' && <AlertChart />}
      {selectedChart === 'performance' && <PerformanceChart />}
      {selectedChart === 'threats' && <ThreatDistributionChart />}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Traffic Volume</span>
          </div>
          <div className="text-2xl font-bold text-white">2.4M</div>
          <div className="text-sm text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12.5%
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-400">Active Alerts</span>
          </div>
          <div className="text-2xl font-bold text-white">23</div>
          <div className="text-sm text-red-400 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            -8.2%
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">System Health</span>
          </div>
          <div className="text-2xl font-bold text-white">98.5%</div>
          <div className="text-sm text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +0.3%
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-400">Threat Blocks</span>
          </div>
          <div className="text-2xl font-bold text-white">1,247</div>
          <div className="text-sm text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +15.7%
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeCharts;