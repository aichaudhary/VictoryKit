import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const BASE_PATH = '/maula';
const withBase = (path: string) => (path === '/' ? BASE_PATH : `${BASE_PATH}${path}`);

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/traffic-monitor', label: 'Traffic Monitor', icon: '📈' },
    { path: '/attack-detection', label: 'Attack Detection', icon: '🚨' },
    { path: '/mitigation-center', label: 'Mitigation Center', icon: '🛡️' },
    { path: '/protection-rules', label: 'Protection Rules', icon: '⚙️' },
    { path: '/analytics', label: 'Analytics', icon: '📋' },
    { path: '/incident-response', label: 'Incident Response', icon: '🚑' },
    { path: '/settings', label: 'Settings', icon: '🔧' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>DDoSShield</h2>
        <p>DDoS Protection Platform</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const fullPath = withBase(item.path);
          const isActive = location.pathname === fullPath;
          return (
            <Link
              key={item.path}
              to={fullPath}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-item">
            <span className="status-dot active"></span>
            <span>Protection Active</span>
          </div>
          <div className="status-item">
            <span className="status-dot warning"></span>
            <span>Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;