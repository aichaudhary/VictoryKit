import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Wifi, Users, TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SecurityDashboardProps {
  onNavigate?: (page: string) => void;
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ onNavigate }) => {
  const [securityScore, setSecurityDashboard] = useState(87);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API calls
  const threatData = [
    { time: '00:00', threats: 2 },
    { time: '04:00', threats: 1 },
    { time: '08:00', threats: 5 },
    { time: '12:00', threats: 3 },
    { time: '16:00', threats: 7 },
    { time: '20:00', threats: 4 },
    { time: '24:00', threats: 2 }
  ];

  const deviceTypes = [
    { name: 'Laptops', value: 145, color: '#3b82f6' },
    { name: 'Phones', value: 289, color: '#10b981' },
    { name: 'IoT', value: 67, color: '#f59e0b' },
    { name: 'Tablets', value: 42, color: '#8b5cf6' }
  ];

  const metrics = [
    {
      title: 'Security Score',
      value: securityScore,
      change: '+5%',
      trend: 'up',
      icon: Shield,
      color: 'bg-green-500'
    },
    {
      title: 'Active Threats',
      value: 3,
      change: '-2',
      trend: 'down',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Access Points',
      value: 48,
      change: '+2',
      trend: 'up',
      icon: Wifi,
      color: 'bg-blue-500'
    },
    {
      title: 'Connected Devices',
      value: 543,
      change: '+12',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  const recentThreats = [
    {
      id: 1,
      type: 'Rogue AP Detected',
      severity: 'high',
      location: 'Building A - Floor 3',
      time: '2 minutes ago',
      status: 'investigating'
    },
    {
      id: 2,
      type: 'Weak Encryption',
      severity: 'medium',
      location: 'Conference Room B',
      time: '15 minutes ago',
      status: 'resolved'
    },
    {
      id: 3,
      type: 'Unauthorized Device',
      severity: 'high',
      location: 'Lobby WiFi',
      time: '1 hour ago',
      status: 'blocked'
    }
  ];

  const refresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSecurityDashboard(Math.floor(Math.random() * 20) + 80);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">WirelessHunter Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time wireless network security monitoring</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = metric.trend === 'up' ? 'text-green-400' : 'text-red-400';
          
          return (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{metric.change}</span>
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">{metric.title}</h3>
              <p className="text-3xl font-bold text-white mt-2">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Activity Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Threat Activity (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={threatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={deviceTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Threats</h3>
          <button
            onClick={() => onNavigate?.('threats')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {recentThreats.map((threat) => (
            <div key={threat.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-2 h-2 rounded-full ${
                  threat.severity === 'high' ? 'bg-red-500' : 
                  threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <h4 className="text-white font-medium">{threat.type}</h4>
                  <p className="text-sm text-gray-400">{threat.location} • {threat.time}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                threat.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                threat.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {threat.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate?.('scanner')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
        >
          <Activity className="w-5 h-5" />
          <span className="font-medium">Start Network Scan</span>
        </button>
        <button
          onClick={() => onNavigate?.('assessment')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
        >
          <Shield className="w-5 h-5" />
          <span className="font-medium">Run Security Assessment</span>
        </button>
        <button
          onClick={() => onNavigate?.('compliance')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
        >
          <Activity className="w-5 h-5" />
          <span className="font-medium">Generate Compliance Report</span>
        </button>
      </div>
    </div>
  );
};

export default SecurityDashboard;
