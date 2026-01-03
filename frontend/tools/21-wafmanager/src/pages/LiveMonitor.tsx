import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  Globe, 
  Clock,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Filter,
  MapPin,
  Zap,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import clsx from 'clsx';
import { useWAFStore } from '../stores/wafStore';
import { webSocketService, RealTimeEvent } from '../services/websocket';

const attackCategories: Record<string, { label: string; icon: string; color: string }> = {
  sqli: { label: 'SQL Injection', icon: '💉', color: 'border-threat-critical bg-threat-critical/10' },
  xss: { label: 'XSS', icon: '📜', color: 'border-threat-high bg-threat-high/10' },
  rce: { label: 'RCE', icon: '💻', color: 'border-threat-critical bg-threat-critical/10' },
  lfi: { label: 'LFI', icon: '📁', color: 'border-threat-high bg-threat-high/10' },
  bot: { label: 'Bot', icon: '🤖', color: 'border-threat-medium bg-threat-medium/10' },
  scanner: { label: 'Scanner', icon: '🔍', color: 'border-threat-low bg-threat-low/10' },
  rate_limit: { label: 'Rate Limit', icon: '⚡', color: 'border-threat-medium bg-threat-medium/10' },
  geo_block: { label: 'Geo Block', icon: '🌍', color: 'border-threat-info bg-threat-info/10' },
};

const countryFlags: Record<string, string> = {
  US: '🇺🇸', CN: '🇨🇳', RU: '🇷🇺', DE: '🇩🇪', UK: '🇬🇧', FR: '🇫🇷', JP: '🇯🇵', BR: '🇧🇷', IN: '🇮🇳', AU: '🇦🇺',
  KR: '🇰🇷', NL: '🇳🇱', SG: '🇸🇬', CA: '🇨🇦', VN: '🇻🇳', ID: '🇮🇩', TH: '🇹🇭', PH: '🇵🇭', MY: '🇲🇾', TW: '🇹🇼',
};

export default function LiveMonitor() {
  const { 
    connectionStatus, 
    realtimeAttacks, 
    isLiveMode, 
    soundEnabled,
    setLiveMode,
    setSoundEnabled,
    addRealtimeAttack,
  } = useWAFStore();

  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalEvents: 0,
    blockedCount: 0,
    challengedCount: 0,
    eventsPerSecond: 0,
  });

  // Simulate real-time events for demo
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const categories = Object.keys(attackCategories);
      const countries = Object.keys(countryFlags);
      const actions: ('blocked' | 'challenged' | 'logged')[] = ['blocked', 'challenged', 'logged'];
      const severities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];
      
      const newEvent: RealTimeEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: Math.random() > 0.3 ? 'attack' : Math.random() > 0.5 ? 'rate_limit' : 'geo_block',
        timestamp: new Date(),
        data: {
          clientIP: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
          country: countries[Math.floor(Math.random() * countries.length)],
          method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
          uri: ['/api/login', '/api/users', '/api/admin', '/api/search', '/wp-admin', '/phpmyadmin'][Math.floor(Math.random() * 6)],
          category: categories[Math.floor(Math.random() * categories.length)],
          severity: severities[Math.floor(Math.random() * 4)],
          action: actions[Math.floor(Math.random() * 3)],
          ruleId: `WAF-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
        },
      };

      if (!filterCategory || newEvent.data.category === filterCategory) {
        setEvents(prev => [newEvent, ...prev.slice(0, 99)]);
        
        // Update stats
        setStats(prev => ({
          totalEvents: prev.totalEvents + 1,
          blockedCount: prev.blockedCount + (newEvent.data.action === 'blocked' ? 1 : 0),
          challengedCount: prev.challengedCount + (newEvent.data.action === 'challenged' ? 1 : 0),
          eventsPerSecond: prev.eventsPerSecond,
        }));

        // Play sound for critical events
        if (soundEnabled && newEvent.data.severity === 'critical' && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
    }, Math.random() * 1500 + 500);

    return () => clearInterval(interval);
  }, [isPaused, filterCategory, soundEnabled]);

  // Calculate events per second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const recentEvents = events.filter(e => now - new Date(e.timestamp).getTime() < 1000);
      setStats(prev => ({ ...prev, eventsPerSecond: recentEvents.length }));
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Hidden audio element for alerts */}
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={clsx(
            'w-3 h-3 rounded-full animate-pulse',
            connectionStatus === 'connected' ? 'bg-threat-low' : 
            connectionStatus === 'connecting' ? 'bg-threat-medium' : 'bg-threat-critical'
          )} />
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Live Monitor
              {!isPaused && <span className="text-xs bg-threat-critical/20 text-threat-critical px-2 py-0.5 rounded animate-pulse">LIVE</span>}
            </h1>
            <p className="text-waf-muted mt-1">Real-time attack detection feed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={clsx(
              'waf-btn-secondary',
              isPaused && 'border-threat-medium text-threat-medium'
            )}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={clsx(
              'p-2 border rounded-lg transition-colors',
              soundEnabled 
                ? 'border-waf-primary text-waf-primary' 
                : 'border-waf-border text-waf-muted hover:text-white'
            )}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 border border-waf-border rounded-lg text-waf-muted hover:text-white transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="waf-card py-4 border-l-4 border-waf-primary">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-waf-primary" />
            <div>
              <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
              <p className="text-sm text-waf-muted">Total Events</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4 border-l-4 border-threat-critical">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-threat-critical" />
            <div>
              <p className="text-3xl font-bold text-white">{stats.blockedCount}</p>
              <p className="text-sm text-waf-muted">Blocked</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4 border-l-4 border-threat-medium">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-threat-medium" />
            <div>
              <p className="text-3xl font-bold text-white">{stats.challengedCount}</p>
              <p className="text-sm text-waf-muted">Challenged</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4 border-l-4 border-threat-low">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-threat-low" />
            <div>
              <p className="text-3xl font-bold text-white">{stats.eventsPerSecond}</p>
              <p className="text-sm text-waf-muted">Events/sec</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory(null)}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            !filterCategory
              ? 'bg-waf-primary text-white'
              : 'bg-waf-card text-waf-muted hover:text-white border border-waf-border'
          )}
        >
          All Events
        </button>
        {Object.entries(attackCategories).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterCategory(filterCategory === key ? null : key)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1',
              filterCategory === key
                ? 'bg-waf-primary text-white'
                : 'bg-waf-card text-waf-muted hover:text-white border border-waf-border'
            )}
          >
            {config.icon} {config.label}
          </button>
        ))}
      </div>

      {/* Event Stream */}
      <div className="waf-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-waf-border">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-waf-primary" />
            Event Stream
          </h2>
          <button
            onClick={() => setEvents([])}
            className="text-sm text-waf-muted hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline-block mr-1" />
            Clear
          </button>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {events.map((event, index) => {
              const category = attackCategories[event.data.category] || { label: event.data.category, icon: '❓', color: 'border-waf-border bg-waf-dark' };
              const flag = countryFlags[event.data.country] || '🌐';

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={clsx(
                    'border-l-4 p-4 hover:bg-waf-dark/50 transition-colors cursor-pointer',
                    category.color,
                    index !== events.length - 1 && 'border-b border-waf-border/30'
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Time & Category */}
                    <div className="flex items-center gap-3 lg:w-48">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{category.label}</p>
                        <p className="text-xs text-waf-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{flag}</span>
                        <span className="font-mono text-sm text-waf-text">{event.data.clientIP}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'text-xs font-medium px-2 py-0.5 rounded',
                          event.data.method === 'GET' && 'bg-threat-low/20 text-threat-low',
                          event.data.method === 'POST' && 'bg-threat-medium/20 text-threat-medium',
                          event.data.method === 'PUT' && 'bg-threat-info/20 text-threat-info',
                          event.data.method === 'DELETE' && 'bg-threat-critical/20 text-threat-critical',
                        )}>
                          {event.data.method}
                        </span>
                        <span className="text-sm text-waf-muted truncate max-w-[200px]">{event.data.uri}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-4">
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium capitalize',
                        event.data.severity === 'critical' && 'bg-threat-critical/20 text-threat-critical',
                        event.data.severity === 'high' && 'bg-threat-high/20 text-threat-high',
                        event.data.severity === 'medium' && 'bg-threat-medium/20 text-threat-medium',
                        event.data.severity === 'low' && 'bg-threat-low/20 text-threat-low',
                      )}>
                        {event.data.severity}
                      </span>
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium capitalize',
                        event.data.action === 'blocked' && 'bg-threat-critical/20 text-threat-critical',
                        event.data.action === 'challenged' && 'bg-threat-medium/20 text-threat-medium',
                        event.data.action === 'logged' && 'bg-threat-info/20 text-threat-info',
                      )}>
                        {event.data.action}
                      </span>
                      <span className="text-xs font-mono text-waf-muted">{event.data.ruleId}</span>
                      <button className="p-1 text-waf-muted hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {events.length === 0 && (
            <div className="p-12 text-center">
              {isPaused ? (
                <>
                  <Pause className="w-12 h-12 text-waf-muted mx-auto mb-4" />
                  <p className="text-waf-muted">Stream paused</p>
                  <button onClick={() => setIsPaused(false)} className="waf-btn-primary mt-4">
                    <Play className="w-5 h-5" />
                    Resume
                  </button>
                </>
              ) : (
                <>
                  <Activity className="w-12 h-12 text-waf-muted mx-auto mb-4 animate-pulse" />
                  <p className="text-waf-muted">Waiting for events...</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {connectionStatus === 'connected' ? (
          <>
            <Wifi className="w-4 h-4 text-threat-low" />
            <span className="text-threat-low">Connected to real-time feed</span>
          </>
        ) : connectionStatus === 'connecting' ? (
          <>
            <RefreshCw className="w-4 h-4 text-threat-medium animate-spin" />
            <span className="text-threat-medium">Connecting...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-threat-critical" />
            <span className="text-threat-critical">Disconnected - Using simulated data</span>
          </>
        )}
      </div>
    </div>
  );
}
