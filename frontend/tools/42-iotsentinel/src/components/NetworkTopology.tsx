import React, { useState, useEffect, useRef } from 'react';
import { NetworkTopology as TopologyData, TopologyNode, TopologyEdge } from '../types';
import { iotSentinelAPI } from '../services/iotSentinelAPI';
import { DEVICE_TYPE_ICONS } from '../constants';

interface NetworkTopologyProps {
  onNodeSelect?: (node: TopologyNode) => void;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({ onNodeSelect }) => {
  const [topology, setTopology] = useState<TopologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'tree' | 'force'>('grid');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTopology();
  }, []);

  const fetchTopology = async () => {
    try {
      setLoading(true);
      const response = await iotSentinelAPI.segments.getTopology();
      setTopology(response.data);
    } catch (err) {
      console.error('Failed to fetch topology:', err);
      // Use mock data for demo
      setTopology(generateMockTopology());
    } finally {
      setLoading(false);
    }
  };

  const generateMockTopology = (): TopologyData => {
    const nodes: TopologyNode[] = [
      { id: 'router', type: 'router', label: 'Main Router', status: 'online', riskLevel: 'low', x: 400, y: 100 },
      { id: 'firewall', type: 'firewall', label: 'Firewall', status: 'online', riskLevel: 'low', x: 400, y: 200 },
      { id: 'switch1', type: 'switch', label: 'Switch - IoT', status: 'online', riskLevel: 'medium', x: 200, y: 300 },
      { id: 'switch2', type: 'switch', label: 'Switch - Office', status: 'online', riskLevel: 'low', x: 600, y: 300 },
      { id: 'cam1', type: 'camera', label: 'Camera - Lobby', status: 'online', riskLevel: 'high', x: 100, y: 400 },
      { id: 'cam2', type: 'camera', label: 'Camera - Parking', status: 'offline', riskLevel: 'critical', x: 180, y: 450 },
      { id: 'thermo1', type: 'thermostat', label: 'HVAC Control', status: 'online', riskLevel: 'medium', x: 260, y: 400 },
      { id: 'sensor1', type: 'sensor', label: 'Motion Sensor', status: 'online', riskLevel: 'low', x: 340, y: 450 },
      { id: 'printer', type: 'printer', label: 'Network Printer', status: 'online', riskLevel: 'medium', x: 520, y: 400 },
      { id: 'ap1', type: 'access_point', label: 'WiFi AP 1', status: 'online', riskLevel: 'low', x: 600, y: 450 },
      { id: 'laptop1', type: 'workstation', label: 'Admin PC', status: 'online', riskLevel: 'low', x: 680, y: 400 },
    ];

    const edges: TopologyEdge[] = [
      { source: 'router', target: 'firewall', type: 'wired' },
      { source: 'firewall', target: 'switch1', type: 'wired' },
      { source: 'firewall', target: 'switch2', type: 'wired' },
      { source: 'switch1', target: 'cam1', type: 'wired' },
      { source: 'switch1', target: 'cam2', type: 'wired' },
      { source: 'switch1', target: 'thermo1', type: 'wired' },
      { source: 'switch1', target: 'sensor1', type: 'wireless' },
      { source: 'switch2', target: 'printer', type: 'wired' },
      { source: 'switch2', target: 'ap1', type: 'wired' },
      { source: 'switch2', target: 'laptop1', type: 'wireless' },
    ];

    return { nodes, edges };
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, string> = {
      router: '🌐',
      firewall: '🔥',
      switch: '🔀',
      camera: '📹',
      thermostat: '🌡️',
      sensor: '📡',
      printer: '🖨️',
      access_point: '📶',
      workstation: '💻',
      server: '🖥️',
      ...DEVICE_TYPE_ICONS
    };
    return icons[type] || '📱';
  };

  const getRiskBorder = (level: string) => {
    const borders: Record<string, string> = {
      critical: 'border-red-500 shadow-red-500/50',
      high: 'border-orange-500 shadow-orange-500/50',
      medium: 'border-yellow-500 shadow-yellow-500/50',
      low: 'border-green-500 shadow-green-500/50'
    };
    return borders[level] || borders.low;
  };

  const getStatusIndicator = (status: string) => {
    const indicators: Record<string, string> = {
      online: 'bg-green-500',
      offline: 'bg-red-500',
      degraded: 'bg-yellow-500',
      quarantined: 'bg-purple-500'
    };
    return indicators[status] || 'bg-gray-500';
  };

  const handleNodeClick = (node: TopologyNode) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          Network Topology
        </h2>
        <div className="flex items-center gap-3">
          {/* View Mode */}
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            {(['grid', 'tree', 'force'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === mode
                    ? 'bg-cyan-500/30 text-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-slate-700 rounded hover:bg-slate-600"
            >
              ➖
            </button>
            <span className="px-2 text-sm text-slate-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 bg-slate-700 rounded hover:bg-slate-600"
            >
              ➕
            </button>
          </div>
          
          <button
            onClick={fetchTopology}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-b border-slate-700/50 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Risk Level:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Status:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Offline</span>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="relative h-[500px] overflow-auto bg-slate-900/50"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        {/* Draw edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {topology?.edges.map((edge, idx) => {
            const sourceNode = topology.nodes.find(n => n.id === edge.source);
            const targetNode = topology.nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            
            return (
              <line
                key={idx}
                x1={(sourceNode.x || 0) + 30}
                y1={(sourceNode.y || 0) + 30}
                x2={(targetNode.x || 0) + 30}
                y2={(targetNode.y || 0) + 30}
                stroke={edge.type === 'wireless' ? '#60A5FA' : '#64748B'}
                strokeWidth="2"
                strokeDasharray={edge.type === 'wireless' ? '5,5' : '0'}
              />
            );
          })}
        </svg>

        {/* Draw nodes */}
        {topology?.nodes.map((node) => (
          <div
            key={node.id}
            onClick={() => handleNodeClick(node)}
            className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 ${
              selectedNode?.id === node.id ? 'scale-110' : ''
            }`}
            style={{ left: node.x || 0, top: node.y || 0 }}
          >
            <div
              className={`w-16 h-16 rounded-xl bg-slate-800 border-2 flex flex-col items-center justify-center shadow-lg ${
                getRiskBorder(node.riskLevel || 'low')
              } ${selectedNode?.id === node.id ? 'ring-2 ring-cyan-400' : ''}`}
            >
              <span className="text-2xl">{getNodeIcon(node.type)}</span>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusIndicator(node.status)} ${
                node.status === 'online' ? 'animate-pulse' : ''
              }`} />
            </div>
            <div className="text-xs text-center mt-1 text-slate-400 max-w-16 truncate">
              {node.label}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <span className="text-2xl">{getNodeIcon(selectedNode.type)}</span>
                {selectedNode.label}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className={`px-2 py-0.5 rounded ${
                  selectedNode.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedNode.status}
                </span>
                <span className={`px-2 py-0.5 rounded border ${getRiskBorder(selectedNode.riskLevel || 'low')}`}>
                  {selectedNode.riskLevel} risk
                </span>
                <span className="text-slate-400">Type: {selectedNode.type}</span>
                {selectedNode.ip && <span className="text-slate-400 font-mono">IP: {selectedNode.ip}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30">
                🔍 Scan
              </button>
              <button className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                🔒 Quarantine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkTopology;
