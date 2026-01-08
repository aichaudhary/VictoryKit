import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const BASE_PATH = '/maula';
const withBase = (path: string) => (path === '/' ? BASE_PATH : `${BASE_PATH}${path}`);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: '/',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & Status'
    },
    {
      path: '/certificates',
      icon: '🔒',
      label: 'Certificates',
      description: 'SSL/TLS Monitoring'
    },
    {
      path: '/domains',
      icon: '🌐',
      label: 'Domains',
      description: 'Domain Management'
    },
    {
      path: '/alerts',
      icon: '🚨',
      label: 'Alerts',
      description: 'Security Alerts'
    },
    {
      path: '/scans',
      icon: '🔍',
      label: 'Scans',
      description: 'Scan Management'
    },
    {
      path: '/analytics',
      icon: '📈',
      label: 'Analytics',
      description: 'Reports & Insights'
    },
    {
      path: '/compliance',
      icon: '✅',
      label: 'Compliance',
      description: 'Standards & Reports'
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Settings',
      description: 'Configuration'
    },
    {
      path: '/ai',
      icon: '🧠',
      label: 'Neural Link AI',
      description: 'Embedded Assistant'
    }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🔐</span>
          {!isCollapsed && <span className="logo-text">SSLMonitor</span>}
        </div>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const targetPath = withBase(item.path);
            const isActive = location.pathname === targetPath;

            return (
              <li key={targetPath} className="nav-item">
                <Link
                  to={targetPath}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="sidebar-info">
            <div className="version">v1.0.0</div>
            <div className="status">
              <span className="status-dot online"></span>
              System Online
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;