import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Activity,
  Bot,
  Lock,
  Fingerprint,
  FileCode,
  Globe,
  BarChart3,
  AlertTriangle,
  Settings,
  Wifi,
  WifiOff,
  Menu,
  X,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { useWebSocket } from '../services/websocket';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Shield },
  { name: 'Live Traffic', href: '/traffic', icon: Activity },
  { name: 'Detected Bots', href: '/bots', icon: Bot },
  { name: 'Challenges', href: '/challenges', icon: Lock },
  { name: 'Fingerprints', href: '/fingerprints', icon: Fingerprint },
  { name: 'Rules Engine', href: '/rules', icon: FileCode },
  { name: 'IP Reputation', href: '/reputation', icon: Globe },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const BASE_PATH = '/maula';
const resolvePath = (href: string) => (href === '/' ? BASE_PATH : `${BASE_PATH}${href}`);

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, botDetections } = useWebSocket();

  const recentDetection = botDetections[0];
  const currentPage = navigation.find((item) => location.pathname.startsWith(resolvePath(item.href)))?.name || 'BotDefender';

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-orange-500" />
          <span className="text-xl font-bold text-white">BotDefender</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`${BASE_PATH}/ai`)}
            className="p-2 rounded-lg bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
            aria-label="Open Neural Link AI"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-700 text-white"
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className={`fixed left-0 top-0 bottom-0 w-64 bg-slate-800 border-r border-slate-700 z-40 ${
              sidebarOpen ? 'block' : 'hidden'
            } lg:block`}
          >
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Shield className="w-10 h-10 text-orange-500" />
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    } animate-pulse`}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">BotDefender</h1>
                  <p className="text-xs text-slate-400">Bot Detection Platform</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-slate-700">
              <div className={`flex items-center space-x-2 text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                {isConnected && (
                  <span className="ml-auto text-xs text-slate-500">{botDetections.length} events</span>
                )}
              </div>
            </div>

            <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
              {navigation.map((item) => {
                const targetPath = resolvePath(item.href);
                const isActive = location.pathname === targetPath || location.pathname.startsWith(`${targetPath}/`);
                return (
                  <NavLink
                    key={item.name}
                    to={targetPath}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                    {item.name === 'Incidents' && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">2</span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {recentDetection && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      recentDetection.data.classification === 'bad' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  <span className="text-sm text-white truncate">
                    {recentDetection.data.ipAddress || 'Unknown IP'}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      recentDetection.data.action === 'block'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {recentDetection.data.action}
                  </span>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">BotDefender</p>
              <h2 className="text-2xl font-semibold text-white">{currentPage}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(`${BASE_PATH}/ai`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-400/40 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Neural Link AI</span>
              </button>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 ${
                  isConnected ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                }`}
              >
                {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-sm font-medium">{isConnected ? 'Live Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-1">
            <div className="rounded-2xl bg-slate-900/60 p-5">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
