import React, { useState, useEffect } from 'react';
import './Header.css';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState({
    protection: 'active',
    traffic: 'normal',
    alerts: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <h1>DDoS Protection Dashboard</h1>
        <div className="system-indicators">
          <div className="indicator">
            <span className={`status-dot ${systemStatus.protection}`}></span>
            <span>Protection: {systemStatus.protection.toUpperCase()}</span>
          </div>
          <div className="indicator">
            <span className={`status-dot ${systemStatus.traffic}`}></span>
            <span>Traffic: {systemStatus.traffic.toUpperCase()}</span>
          </div>
          {systemStatus.alerts > 0 && (
            <div className="indicator alert">
              <span className="alert-count">{systemStatus.alerts}</span>
              <span>Active Alerts</span>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="time-display">
          {currentTime.toLocaleString()}
        </div>
        <div className="user-menu">
          <span>Admin</span>
          <div className="user-avatar">A</div>
        </div>
      </div>
    </header>
  );
};

export default Header;