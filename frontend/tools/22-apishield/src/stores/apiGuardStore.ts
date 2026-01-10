import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RealTimeEvent, API, SecurityGrade } from '../types';

interface APIMetrics {
  requests: number;
  errors: number;
  latency: number;
}

interface APIShieldState {
  // Connection
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'connecting';
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'error' | 'connecting') => void;

  // Real-time events
  realTimeEvents: RealTimeEvent[];
  addRealTimeEvent: (event: RealTimeEvent) => void;
  clearRealTimeEvents: () => void;
  maxEvents: number;

  // Live mode
  liveMode: boolean;
  toggleLiveMode: () => void;
  setLiveMode: (enabled: boolean) => void;

  // Anomaly counter
  openAnomalyCount: number;
  incrementAnomalyCount: () => void;
  setAnomalyCount: (count: number) => void;

  // API metrics (for live updates)
  apiMetrics: Record<string, APIMetrics>;
  updateAPIMetrics: (apiId: string, metrics: APIMetrics) => void;

  // API scores (for live updates)
  apiScores: Record<string, { score: number; grade: SecurityGrade }>;
  updateAPIScore: (apiId: string, score: number, grade: string) => void;

  // Selected API (for detail views)
  selectedAPI: API | null;
  setSelectedAPI: (api: API | null) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Notifications
  soundEnabled: boolean;
  toggleSound: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;

  // Filters (persisted)
  savedFilters: {
    apis: Record<string, unknown>;
    endpoints: Record<string, unknown>;
    anomalies: Record<string, unknown>;
  };
  setSavedFilter: (category: 'apis' | 'endpoints' | 'anomalies', filters: Record<string, unknown>) => void;

  // Time range preference
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const useAPIShieldStore = create<APIShieldState>()(
  persist(
    (set, get) => ({
      // Connection
      connectionStatus: 'connecting',
      setConnectionStatus: (status) => set({ connectionStatus: status }),

      // Real-time events
      realTimeEvents: [],
      maxEvents: 100,
      addRealTimeEvent: (event) => {
        const { realTimeEvents, maxEvents, soundEnabled, notificationsEnabled } = get();
        
        // Play sound for critical/high severity events
        if (soundEnabled && event.severity && ['critical', 'high'].includes(event.severity)) {
          try {
            const audio = new Audio('/alert.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch (e) {
            // Ignore audio errors
          }
        }

        // Show browser notification for critical events
        if (notificationsEnabled && event.severity === 'critical' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('APIShield Alert', {
              body: event.message,
              icon: '/api-icon.svg',
            });
          }
        }

        set({
          realTimeEvents: [event, ...realTimeEvents].slice(0, maxEvents),
        });
      },
      clearRealTimeEvents: () => set({ realTimeEvents: [] }),

      // Live mode
      liveMode: true,
      toggleLiveMode: () => set((state) => ({ liveMode: !state.liveMode })),
      setLiveMode: (enabled) => set({ liveMode: enabled }),

      // Anomaly counter
      openAnomalyCount: 0,
      incrementAnomalyCount: () => set((state) => ({ openAnomalyCount: state.openAnomalyCount + 1 })),
      setAnomalyCount: (count) => set({ openAnomalyCount: count }),

      // API metrics
      apiMetrics: {},
      updateAPIMetrics: (apiId, metrics) => set((state) => ({
        apiMetrics: { ...state.apiMetrics, [apiId]: metrics },
      })),

      // API scores
      apiScores: {},
      updateAPIScore: (apiId, score, grade) => set((state) => ({
        apiScores: { ...state.apiScores, [apiId]: { score, grade: grade as SecurityGrade } },
      })),

      // Selected API
      selectedAPI: null,
      setSelectedAPI: (api) => set({ selectedAPI: api }),

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Theme
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Notifications
      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      notificationsEnabled: false,
      toggleNotifications: () => {
        const { notificationsEnabled } = get();
        if (!notificationsEnabled && 'Notification' in window) {
          Notification.requestPermission();
        }
        set({ notificationsEnabled: !notificationsEnabled });
      },

      // Filters
      savedFilters: {
        apis: {},
        endpoints: {},
        anomalies: {},
      },
      setSavedFilter: (category, filters) => set((state) => ({
        savedFilters: { ...state.savedFilters, [category]: filters },
      })),

      // Time range
      timeRange: '24h',
      setTimeRange: (range) => set({ timeRange: range }),
    }),
    {
      name: 'apishield-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled,
        savedFilters: state.savedFilters,
        timeRange: state.timeRange,
      }),
    }
  )
);

export default useAPIShieldStore;
