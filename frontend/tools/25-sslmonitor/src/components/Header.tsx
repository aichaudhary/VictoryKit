import React, { useState, useEffect } from 'react';
import { systemAPI } from '../services/api';
import { SystemStatus } from '../types';
import wsService from '../services/websocket';
import './Header.css';

const Header: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Load initial system status
    loadSystemStatus();

    // Connect to WebSocket for real-time updates
    wsService.connect();
    wsService.on('system_status', handleSystemStatusUpdate);
    wsService.on('connected', () => setIsOnline(true));
    wsService.on('disconnected', () => setIsOnline(false));

    // Request system status on connection
    wsService.on('connected', () => {
      wsService.requestSystemStatus();
    });

    return () => {
      clearInterval(timeInterval);
      wsService.off('system_status', handleSystemStatusUpdate);
    };
  }, []);

  const loadSystemStatus = async () => {
    try {
      const response = await systemAPI.getStatus();
      if (response.data.success) {
        setSystemStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const handleSystemStatusUpdate = (data: SystemStatus) => {
    setSystemStatus(data);
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getSystemHealthColor = () => {
    if (!systemStatus) return 'gray';
    if (systemStatus.databaseStatus === 'connected' && Object.values(systemStatus.apiStatus).every(status => status === 'online')) {
      return 'green';
    }
    if (Object.values(systemStatus.apiStatus).some(status => status === 'degraded')) {
      return 'yellow';
    }
    return 'red';
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">SSL/TLS Certificate Monitor</h1>
        <div className="header-subtitle">
          Real-time SSL monitoring and compliance platform
        </div>
      </div>

      <div className="header-center">
        <div className="system-status">
          <div className="status-item">
            <span className="status-label">System:</span>
            <span className={`status-value ${getSystemHealthColor()}`}>
              <span className="status-dot"></span>
              {systemStatus ? 'Online' : 'Loading...'}
            </span>
          </div>

          {systemStatus && (
            <>
              <div className="status-item">
                <span className="status-label">Uptime:</span>
                <span className="status-value">
                  {formatUptime(systemStatus.uptime)}
                </span>
              </div>

              <div className="status-item">
                <span className="status-label">Active Scans:</span>
                <span className="status-value">
                  {systemStatus.activeScans}
                </span>
              </div>

              <div className="status-item">
                <span className="status-label">WebSocket:</span>
                <span className={`status-value ${isOnline ? 'green' : 'red'}`}>
                  <span className="status-dot"></span>
                  {isOnline ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="current-time">
          {currentTime.toLocaleString()}
        </div>

        <div className="user-menu">
          <button className="user-btn">
            <span className="user-avatar">👤</span>
            <span className="user-name">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;