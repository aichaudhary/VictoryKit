import { create } from 'zustand';
import type { AttackLog, RealTimeEvent, WAFInstance, ThreatIndicator } from '../types';

interface TrafficStats {
  requestsPerSecond: number;
  blockedPerSecond: number;
  avgLatency: number;
}

interface InstanceHealth {
  instanceId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
}

interface WAFState {
  // Connection status
  connectionStatus: 'connected' | 'disconnected' | 'error';
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'error') => void;

  // Real-time attacks
  realtimeAttacks: AttackLog[];
  addRealtimeAttack: (attack: AttackLog) => void;
  clearRealtimeAttacks: () => void;

  // Real-time events
  realtimeEvents: RealTimeEvent[];
  addRealtimeEvent: (event: RealTimeEvent) => void;
  clearRealtimeEvents: () => void;

  // Attack counter
  attackCount: number;
  incrementAttackCount: () => void;
  resetAttackCount: () => void;

  // Traffic stats
  trafficStats: TrafficStats;
  updateTrafficStats: (stats: TrafficStats) => void;

  // Instance health
  instanceHealth: Record<string, InstanceHealth>;
  updateInstanceHealth: (health: InstanceHealth) => void;

  // Threat indicators
  threatIndicators: ThreatIndicator[];
  addThreatIndicator: (indicator: ThreatIndicator) => void;

  // Selected instance
  selectedInstanceId: string | null;
  setSelectedInstanceId: (id: string | null) => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Live mode
  liveMode: boolean;
  toggleLiveMode: () => void;

  // Sound notifications
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const useWAFStore = create<WAFState>((set) => ({
  // Connection status
  connectionStatus: 'disconnected',
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Real-time attacks (keep last 100)
  realtimeAttacks: [],
  addRealtimeAttack: (attack) => set((state) => ({
    realtimeAttacks: [attack, ...state.realtimeAttacks].slice(0, 100),
  })),
  clearRealtimeAttacks: () => set({ realtimeAttacks: [] }),

  // Real-time events (keep last 200)
  realtimeEvents: [],
  addRealtimeEvent: (event) => set((state) => ({
    realtimeEvents: [event, ...state.realtimeEvents].slice(0, 200),
  })),
  clearRealtimeEvents: () => set({ realtimeEvents: [] }),

  // Attack counter
  attackCount: 0,
  incrementAttackCount: () => set((state) => ({ attackCount: state.attackCount + 1 })),
  resetAttackCount: () => set({ attackCount: 0 }),

  // Traffic stats
  trafficStats: {
    requestsPerSecond: 0,
    blockedPerSecond: 0,
    avgLatency: 0,
  },
  updateTrafficStats: (stats) => set({ trafficStats: stats }),

  // Instance health
  instanceHealth: {},
  updateInstanceHealth: (health) => set((state) => ({
    instanceHealth: {
      ...state.instanceHealth,
      [health.instanceId]: health,
    },
  })),

  // Threat indicators (keep last 50)
  threatIndicators: [],
  addThreatIndicator: (indicator) => set((state) => ({
    threatIndicators: [indicator, ...state.threatIndicators].slice(0, 50),
  })),

  // Selected instance
  selectedInstanceId: null,
  setSelectedInstanceId: (id) => set({ selectedInstanceId: id }),

  // Theme
  theme: 'dark',
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),

  // Live mode
  liveMode: true,
  toggleLiveMode: () => set((state) => ({ 
    liveMode: !state.liveMode 
  })),

  // Sound notifications
  soundEnabled: true,
  toggleSound: () => set((state) => ({ 
    soundEnabled: !state.soundEnabled 
  })),
}));
