import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  LayoutDashboard, 
  Server, 
  FileCode2, 
  ScrollText, 
  AlertTriangle, 
  BarChart3, 
  Radar, 
  Settings, 
  Menu, 
  X,
  Wifi,
  WifiOff,
  Radio,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Zap,
  MessageSquare
} from 'lucide-react';
import { useWAFStore } from '../stores/wafStore';
import { wsService } from '../services/websocket';
import clsx from 'clsx';

const BASE_PATH = '';
const resolvePath = (path: string) => path;

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/live', label: 'Live Monitor', icon: Radio },
  { path: '/instances', label: 'WAF Instances', icon: Server },
  { path: '/rules', label: 'Rules Manager', icon: FileCode2 },
  { path: '/policies', label: 'Policies', icon: ScrollText },
  { path: '/attacks', label: 'Attack Logs', icon: AlertTriangle },
  { path: '/traffic', label: 'Traffic Analytics', icon: BarChart3 },
  { path: '/threats', label: 'Threat Intel', icon: Radar },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    connectionStatus, 
    attackCount, 
    trafficStats,
    sidebarCollapsed,
    toggleSidebar,
    liveMode,
    toggleLiveMode,
    soundEnabled,
    toggleSound,
    resetAttackCount
  } = useWAFStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Connect to WebSocket on mount
  useEffect(() => {
    wsService.connect();
    return () => {
      wsService.disconnect();
    };
  }, []);

  // Reset attack count when viewing dashboard
  useEffect(() => {
    if (location.pathname === BASE_PATH) {
      resetAttackCount();
    }
  }, [location.pathname, resetAttackCount]);

  return (
    <div className="min-h-screen bg-waf-darker flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-waf-dark border-r border-waf-border z-40"
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-waf-border">
          <a href="https://maula.ai" className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Back to MAULA.AI">
            <ChevronLeft className="w-6 h-6 text-gray-400 hover:text-white" />
          </a>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-waf-primary to-waf-secondary flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-lg font-bold text-white">WAFManager</h1>
                <p className="text-xs text-waf-muted">MAULA.AI Security</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const fullPath = resolvePath(item.path);
              const isActive = location.pathname === fullPath || 
                (item.path !== '/' && location.pathname.startsWith(fullPath));
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={resolvePath(item.path)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group',
                      isActive
                        ? 'bg-waf-primary/10 text-waf-primary'
                        : 'text-waf-muted hover:text-white hover:bg-waf-card'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-waf-primary rounded-r-full"
                      />
                    )}
                    <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive && 'text-waf-primary')} />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {/* Attack badge for Attack Logs */}
                    {item.path === '/attacks' && attackCount > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-threat-critical text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {attackCount > 99 ? '99+' : attackCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-waf-border">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 py-2 text-waf-muted hover:text-white transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-waf-dark border-b border-waf-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-waf-primary to-waf-secondary flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white">WAFManager</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`${BASE_PATH}/ai`)}
            className="p-2 rounded-lg border border-waf-primary/40 text-waf-primary hover:bg-waf-primary/10"
            aria-label="Open Neural Link AI"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-waf-muted hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 h-full bg-waf-dark"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-20 px-4">
                <nav>
                  <ul className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === resolvePath(item.path);
                      return (
                        <li key={item.path}>
                          <NavLink
                            to={resolvePath(item.path)}
                            onClick={() => setMobileMenuOpen(false)}
                            className={clsx(
                              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                              isActive
                                ? 'bg-waf-primary/10 text-waf-primary'
                                : 'text-waf-muted hover:text-white hover:bg-waf-card'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className={clsx(
          'flex-1 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[260px]',
          'pt-16 lg:pt-0'
        )}
      >
        {/* Top Bar */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-waf-border bg-waf-dark/50 backdrop-blur-xl sticky top-0 z-30">
          {/* Page Title */}
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">
              {navItems.find(item => 
                resolvePath(item.path) === location.pathname || 
                (item.path !== '/' && location.pathname.startsWith(resolvePath(item.path)))
              )?.label || 'Dashboard'}
            </h2>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Traffic Stats */}
            <div className="flex items-center gap-6 px-4 py-2 bg-waf-card rounded-xl border border-waf-border">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-threat-info" />
                <span className="text-sm font-medium text-white">{trafficStats.requestsPerSecond.toFixed(0)}</span>
                <span className="text-xs text-waf-muted">req/s</span>
              </div>
              <div className="w-px h-6 bg-waf-border" />
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-threat-critical" />
                <span className="text-sm font-medium text-white">{trafficStats.blockedPerSecond.toFixed(0)}</span>
                <span className="text-xs text-waf-muted">blocked/s</span>
              </div>
              <div className="w-px h-6 bg-waf-border" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{trafficStats.avgLatency.toFixed(0)}</span>
                <span className="text-xs text-waf-muted">ms</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`${BASE_PATH}/ai`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-waf-primary/40 bg-waf-primary/10 text-waf-primary font-semibold hover:bg-waf-primary/20 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Neural Link AI</span>
            </button>

            {/* Live Mode Toggle */}
            <button
              onClick={toggleLiveMode}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                liveMode
                  ? 'bg-threat-low/20 text-threat-low border border-threat-low/30'
                  : 'bg-waf-card text-waf-muted border border-waf-border'
              )}
            >
              <Radio className={clsx('w-4 h-4', liveMode && 'animate-pulse')} />
              <span className="text-sm font-medium">Live</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 text-waf-muted hover:text-white transition-colors"
              title={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Connection Status */}
            <div className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              connectionStatus === 'connected' ? 'bg-threat-low/10 text-threat-low' :
              connectionStatus === 'error' ? 'bg-threat-critical/10 text-threat-critical' :
              'bg-waf-card text-waf-muted'
            )}>
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span className="text-sm font-medium capitalize">{connectionStatus}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
