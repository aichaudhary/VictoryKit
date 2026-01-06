import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  AlertTriangle,
  Wrench,
  FileText,
  BarChart3,
  Bot,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Shield,
} from 'lucide-react';
import type { Tab } from './types';
import { NAV_ITEMS, THEME } from './constants';
import {
  RiskDashboard,
  OrganizationsPanel,
  VendorRiskPanel,
  RiskFactorsPanel,
  RemediationsPanel,
  ReportsPanel,
  BenchmarksPanel,
  AIAssistantPanel,
  SettingsPanel,
} from './components';

const iconMap = {
  LayoutDashboard,
  Building2,
  Users,
  AlertTriangle,
  Wrench,
  FileText,
  BarChart3,
  Bot,
  Settings,
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <RiskDashboard />;
      case 'organizations':
        return <OrganizationsPanel />;
      case 'vendors':
        return <VendorRiskPanel />;
      case 'risks':
        return <RiskFactorsPanel />;
      case 'remediations':
        return <RemediationsPanel />;
      case 'reports':
        return <ReportsPanel />;
      case 'benchmarks':
        return <BenchmarksPanel />;
      case 'assistant':
        return <AIAssistantPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <RiskDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-[#1A1A1F] border-r border-[#2A2A2F] transition-all duration-300 z-50 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#2A2A2F]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="text-white font-bold text-lg">RiskScore</span>
                <span className="text-amber-500 font-bold text-lg">AI</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-[#252529] rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <Menu className="w-5 h-5 text-gray-400" />
            ) : (
              <X className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'text-gray-400 hover:text-white hover:bg-[#252529]'
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2A2A2F]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-500 font-medium">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">John Doe</p>
                <p className="text-gray-500 text-sm truncate">Security Admin</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Bar */}
        <header className="h-16 bg-[#1A1A1F] border-b border-[#2A2A2F] flex items-center justify-between px-6 sticky top-0 z-40">
          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search organizations, vendors, findings..."
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-[#252529] rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-[#2A2A2F]">
                    <h3 className="text-white font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <NotificationItem
                      title="Score dropped below threshold"
                      message="CloudCore Services score dropped to 62"
                      time="5 min ago"
                      type="warning"
                    />
                    <NotificationItem
                      title="Critical finding detected"
                      message="New CVE-2024-1234 vulnerability found"
                      time="1 hour ago"
                      type="error"
                    />
                    <NotificationItem
                      title="Remediation completed"
                      message="Credential reset workflow completed"
                      time="3 hours ago"
                      type="success"
                    />
                  </div>
                  <div className="p-3 border-t border-[#2A2A2F]">
                    <button className="w-full text-center text-amber-500 hover:text-amber-400 text-sm font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Score Badge */}
            <div className="flex items-center gap-2 bg-[#252529] px-4 py-2 rounded-lg">
              <Shield className="w-5 h-5 text-amber-500" />
              <span className="text-white font-medium">78</span>
              <span className="text-amber-500 font-bold">C</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{renderContent()}</div>
      </main>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}

function NotificationItem({
  title,
  message,
  time,
  type,
}: {
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'error' | 'success';
}) {
  const colors = {
    warning: 'text-amber-500',
    error: 'text-red-500',
    success: 'text-green-500',
  };

  return (
    <div className="p-4 hover:bg-[#252529] transition-colors cursor-pointer border-b border-[#2A2A2F] last:border-b-0">
      <div className="flex items-start gap-3">
        <div
          className={`w-2 h-2 rounded-full mt-2 ${
            type === 'warning'
              ? 'bg-amber-500'
              : type === 'error'
              ? 'bg-red-500'
              : 'bg-green-500'
          }`}
        />
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{title}</p>
          <p className="text-gray-400 text-sm">{message}</p>
          <p className="text-gray-500 text-xs mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
