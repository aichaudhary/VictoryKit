import React, { useState } from 'react';
import { 
  Laptop, Smartphone, Monitor, Server, Shield, AlertTriangle,
  CheckCircle, XCircle, Clock, RefreshCw, Search, Filter,
  Eye, Settings, Lock, Unlock, Wifi, Battery, HardDrive
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: string;
  user: string;
  trustScore: number;
  status: string;
  lastSeen: Date;
  os: string;
  compliance: {
    encryption: boolean;
    antivirus: boolean;
    updates: boolean;
    firewall: boolean;
  };
  riskLevel: string;
}

const DeviceTrust: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const devices: Device[] = [
    {
      id: 'DEV-001',
      name: 'MacBook Pro M2',
      type: 'laptop',
      user: 'john.doe@company.com',
      trustScore: 95,
      status: 'trusted',
      lastSeen: new Date(Date.now() - 5 * 60000),
      os: 'macOS 14.1',
      compliance: { encryption: true, antivirus: true, updates: true, firewall: true },
      riskLevel: 'low'
    },
    {
      id: 'DEV-002',
      name: 'Windows 11 Desktop',
      type: 'desktop',
      user: 'jane.smith@company.com',
      trustScore: 78,
      status: 'trusted',
      lastSeen: new Date(Date.now() - 15 * 60000),
      os: 'Windows 11 Pro',
      compliance: { encryption: true, antivirus: true, updates: false, firewall: true },
      riskLevel: 'medium'
    },
    {
      id: 'DEV-003',
      name: 'iPhone 15 Pro',
      type: 'mobile',
      user: 'bob.wilson@company.com',
      trustScore: 88,
      status: 'trusted',
      lastSeen: new Date(Date.now() - 30 * 60000),
      os: 'iOS 17.2',
      compliance: { encryption: true, antivirus: false, updates: true, firewall: true },
      riskLevel: 'low'
    },
    {
      id: 'DEV-004',
      name: 'Ubuntu Server',
      type: 'server',
      user: 'system@company.com',
      trustScore: 92,
      status: 'trusted',
      lastSeen: new Date(Date.now() - 2 * 60000),
      os: 'Ubuntu 22.04 LTS',
      compliance: { encryption: true, antivirus: true, updates: true, firewall: true },
      riskLevel: 'low'
    },
    {
      id: 'DEV-005',
      name: 'Windows 10 VM',
      type: 'vm',
      user: 'external.vendor@partner.com',
      trustScore: 45,
      status: 'quarantined',
      lastSeen: new Date(Date.now() - 120 * 60000),
      os: 'Windows 10 Pro',
      compliance: { encryption: false, antivirus: false, updates: false, firewall: false },
      riskLevel: 'critical'
    }
  ];

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || device.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getDeviceIcon = (type: string) => {
    switch(type) {
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'desktop': return <Monitor className="w-5 h-5" />;
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'server': return <Server className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'trusted': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'quarantined': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Device Trust</h1>
          <p className="text-gray-400 mt-1">Monitor and manage device compliance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Scan Devices
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Compliance Rules
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="server">Server</option>
              <option value="vm">VM</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="trusted">Trusted</option>
              <option value="quarantined">Quarantined</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing <span className="text-white font-medium">{filteredDevices.length}</span> of <span className="text-white font-medium">{devices.length}</span> devices
        </p>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDevices.map((device) => (
          <div key={device.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  device.status === 'trusted' ? 'bg-green-500/20' :
                  device.status === 'quarantined' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}>
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h3 className="font-semibold">{device.name}</h3>
                  <p className="text-sm text-gray-400">{device.os}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                  device.status === 'trusted' ? 'bg-green-500/20 text-green-400' :
                  device.status === 'quarantined' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {getStatusIcon(device.status)}
                  {device.status}
                </span>
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Trust Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Trust Score</span>
                  <span className="text-sm font-bold">{device.trustScore}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      device.trustScore >= 90 ? 'bg-green-500' :
                      device.trustScore >= 70 ? 'bg-yellow-500' :
                      device.trustScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${device.trustScore}%` }}
                  />
                </div>
              </div>

              {/* User & Risk */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">User</p>
                  <p className="text-sm font-medium">{device.user}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Risk Level</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(device.riskLevel)}`}>
                    {device.riskLevel}
                  </span>
                </div>
              </div>

              {/* Compliance Checks */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Compliance</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(device.compliance).map(([check, passed]) => (
                    <div key={check} className="flex items-center gap-2">
                      {passed ? 
                        <CheckCircle className="w-4 h-4 text-green-400" /> : 
                        <XCircle className="w-4 h-4 text-red-400" />
                      }
                      <span className="text-xs capitalize">{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Seen */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-500">Last seen</span>
                <span className="text-xs text-gray-400">
                  {new Date(device.lastSeen).toLocaleString([], { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Device Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{devices.filter(d => d.status === 'trusted').length}</p>
              <p className="text-xs text-gray-400">Trusted Devices</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{devices.filter(d => d.status === 'quarantined').length}</p>
              <p className="text-xs text-gray-400">Quarantined</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold">87%</p>
              <p className="text-xs text-gray-400">Compliance Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold">2.1m</p>
              <p className="text-xs text-gray-400">Avg Scan Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Device Types Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Device Types Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { type: 'Laptops', count: 45, icon: <Laptop className="w-5 h-5" />, color: 'text-blue-400' },
            { type: 'Desktops', count: 23, icon: <Monitor className="w-5 h-5" />, color: 'text-green-400' },
            { type: 'Mobile', count: 67, icon: <Smartphone className="w-5 h-5" />, color: 'text-purple-400' },
            { type: 'Servers', count: 12, icon: <Server className="w-5 h-5" />, color: 'text-orange-400' },
            { type: 'VMs', count: 8, icon: <HardDrive className="w-5 h-5" />, color: 'text-red-400' },
          ].map((item) => (
            <div key={item.type} className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <p className="text-lg font-bold">{item.count}</p>
              <p className="text-xs text-gray-400">{item.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceTrust;
