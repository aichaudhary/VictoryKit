import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileSearch, 
  AlertTriangle, 
  Settings, 
  Cloud, 
  Monitor, 
  FileText,
  BarChart3,
  Link2,
  Scan
} from 'lucide-react';

// Import components
import DLPDashboard from './DLPDashboard';
import ContentScanner from './ContentScanner';
import FileScanner from './FileScanner';
import PolicyManager from './PolicyManager';
import IncidentPanel from './IncidentPanel';
import CloudScanner from './CloudScanner';
import EndpointMonitor from './EndpointMonitor';
import ReportsPanel from './ReportsPanel';
import IntegrationsPanel from './IntegrationsPanel';

type TabId = 'dashboard' | 'content' | 'files' | 'policies' | 'incidents' | 'cloud' | 'endpoints' | 'reports' | 'integrations';

interface Tab {
  id: TabId;
  name: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 size={18} /> },
  { id: 'content', name: 'Content Scanner', icon: <Scan size={18} /> },
  { id: 'files', name: 'File Scanner', icon: <FileSearch size={18} /> },
  { id: 'policies', name: 'Policies', icon: <FileText size={18} /> },
  { id: 'incidents', name: 'Incidents', icon: <AlertTriangle size={18} /> },
  { id: 'cloud', name: 'Cloud DLP', icon: <Cloud size={18} /> },
  { id: 'endpoints', name: 'Endpoints', icon: <Monitor size={18} /> },
  { id: 'reports', name: 'Reports', icon: <BarChart3 size={18} /> },
  { id: 'integrations', name: 'Integrations', icon: <Link2 size={18} /> },
];

const DLPTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [stats, setStats] = useState({
    openIncidents: 0,
    totalScans: 0,
    classifiedResources: 0,
    blockedActivities: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4041'}/api/v1/dlp/dashboard/stats`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DLPDashboard />;
      case 'content':
        return <ContentScanner />;
      case 'files':
        return <FileScanner />;
      case 'policies':
        return <PolicyManager />;
      case 'incidents':
        return <IncidentPanel />;
      case 'cloud':
        return <CloudScanner />;
      case 'endpoints':
        return <EndpointMonitor />;
      case 'reports':
        return <ReportsPanel />;
      case 'integrations':
        return <IntegrationsPanel />;
      default:
        return <DLPDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Data Loss Prevention</h1>
              <p className="text-sm text-gray-400">Enterprise DLP System</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.openIncidents}</div>
              <div className="text-xs text-gray-400">Open Incidents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalScans}</div>
              <div className="text-xs text-gray-400">Total Scans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.classifiedResources}</div>
              <div className="text-xs text-gray-400">Classified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.blockedActivities}</div>
              <div className="text-xs text-gray-400">Blocked</div>
            </div>
          </div>

          {/* Settings */}
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-3 text-center text-sm text-gray-500">
        VictoryKit DLP v1.0.0 | Port 4041
      </footer>
    </div>
  );
};

export default DLPTool;
