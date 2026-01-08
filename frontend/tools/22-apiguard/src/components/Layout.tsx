import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Server,
  GitBranch,
  Shield,
  FileText,
  AlertTriangle,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Bell,
  Volume2,
  VolumeX,
  Activity,
  Zap,
  Bot
} from 'lucide-react';
import clsx from 'clsx';
import { useAPIGuardStore } from '../stores/apiGuardStore';

const BASE_PATH = '/maula';
const buildPath = (href: string) => (href === '/' ? BASE_PATH : `${BASE_PATH}${href}`);

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'API Inventory', href: '/apis', icon: Server },
  { name: 'Endpoints', href: '/endpoints', icon: GitBranch },
  { name: 'Security Scanner', href: '/security', icon: Shield },
  { name: 'Policies', href: '/policies', icon: FileText },
  { name: 'Anomalies', href: '/anomalies', icon: AlertTriangle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const {
    sidebarCollapsed,
    toggleSidebar,
    connectionStatus,
    liveMode,
    toggleLiveMode,
    soundEnabled,
    toggleSound,
    openAnomalyCount,
    realTimeEvents,
  } = useAPIGuardStore();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const currentPage = navigation.find(item => location.pathname.startsWith(buildPath(item.href)))?.name || 'APIGuard';
  const recentEventsCount = realTimeEvents.filter((e) => {
    const ts = e.timestamp instanceof Date ? e.timestamp.getTime() : new Date(e.timestamp).getTime();
    return ts > Date.now() - 60000;
  }).length;

  return (
    <div className="flex h-screen bg-api-dark overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-api-card border-r border-api-border transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-api-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-api-primary to-api-secondary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-white"
              >
                APIGuard
              </motion.div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-api-dark text-api-muted hover:text-white transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const targetPath = buildPath(item.href);
              const isActive = location.pathname.startsWith(targetPath);
            const Icon = item.icon;
            const showBadge = item.name === 'Anomalies' && openAnomalyCount > 0;

            return (
                  <NavLink
                    key={item.name}
                    to={buildPath(item.href)}
                className={clsx(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative',
                  isActive
                    ? 'bg-api-primary text-white shadow-lg shadow-api-primary/25'
                    : 'text-api-muted hover:text-white hover:bg-api-dark'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
                {showBadge && (
                  <span className={clsx(
                    'absolute flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-severity-critical text-white',
                    sidebarCollapsed ? '-top-1 -right-1' : 'ml-auto'
                  )}>
                    {openAnomalyCount > 99 ? '99+' : openAnomalyCount}
                  </span>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-api-card border border-api-border rounded-md text-sm text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Connection Status */}
        <div className={clsx(
          'p-4 border-t border-api-border',
          sidebarCollapsed && 'flex justify-center'
        )}>
          <div className={clsx(
            'flex items-center gap-2',
            sidebarCollapsed && 'flex-col'
          )}>
            <div className={clsx(
              'w-2 h-2 rounded-full',
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            )} />
            {!sidebarCollapsed && (
              <span className="text-xs text-api-muted">
                {connectionStatus === 'connected' ? 'Live Connected' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-api-card border-r border-api-border z-50 lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-api-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-api-primary to-api-secondary rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-white">APIGuard</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-api-dark text-api-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {navigation.map((item) => {
                  const targetPath = buildPath(item.href);
                  const isActive = location.pathname.startsWith(targetPath);
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={buildPath(item.href)}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        isActive
                          ? 'bg-api-primary text-white'
                          : 'text-api-muted hover:text-white hover:bg-api-dark'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-api-card border-b border-api-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-api-dark text-api-muted lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">{currentPage}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`${BASE_PATH}/ai`)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-api-primary/10 border border-api-primary/30 text-white/90 hover:bg-api-primary/20 transition-colors"
            >
              <Bot className="w-4 h-4 text-api-primary" />
              <span className="text-sm font-medium hidden sm:inline text-white">Neural Link AI</span>
              <span className="text-sm font-medium sm:hidden text-white">AI</span>
            </button>
            {/* Live Events Counter */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-api-dark rounded-lg">
              <Activity className="w-4 h-4 text-api-primary" />
              <span className="text-sm text-api-muted">
                <span className="text-white font-medium">{recentEventsCount}</span> events/min
              </span>
            </div>

            {/* Live Mode Toggle */}
            <button
              onClick={toggleLiveMode}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
                liveMode 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-api-dark text-api-muted border border-api-border'
              )}
            >
              {liveMode ? <Zap className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-sm font-medium hidden sm:inline">
                {liveMode ? 'Live' : 'Paused'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg hover:bg-api-dark text-api-muted hover:text-white transition-colors"
              title={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-api-dark text-api-muted hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {openAnomalyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-severity-critical text-white rounded-full">
                  {openAnomalyCount > 9 ? '9+' : openAnomalyCount}
                </span>
              )}
            </button>

            {/* Connection Indicator */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-api-border">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : connectionStatus === 'error' ? (
                <WifiOff className="w-5 h-5 text-red-500" />
              ) : (
                <Wifi className="w-5 h-5 text-yellow-500 animate-pulse" />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-api-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
