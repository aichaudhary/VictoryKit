import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { analyticsAPI, certificateAPI, alertAPI, systemAPI } from '../services/api';
import { AnalyticsData, SystemStatus, Alert } from '../types/index';
import wsService from '../services/websocket';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();

    // Connect to WebSocket for real-time updates
    wsService.connect();
    wsService.on('system_status', handleSystemStatusUpdate);
    wsService.on('alert_created', handleAlertCreated);
    wsService.on('certificate_updated', handleCertificateUpdate);

    return () => {
      wsService.off('system_status', handleSystemStatusUpdate);
      wsService.off('alert_created', handleAlertCreated);
      wsService.off('certificate_updated', handleCertificateUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsRes, systemRes, alertsRes, expiringRes] = await Promise.all([
        analyticsAPI.getOverview(),
        systemAPI.getStatus(),
        alertAPI.getAll({ limit: 5 }),
        certificateAPI.getExpiring(30)
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }

      if (systemRes.data.success) {
        setSystemStatus(systemRes.data.data);
      }

      if (alertsRes.data.success) {
        setRecentAlerts(alertsRes.data.data);
      }

      if (expiringRes.data.success) {
        setExpiringSoon(expiringRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemStatusUpdate = (data: SystemStatus) => {
    setSystemStatus(data);
  };

  const handleAlertCreated = (data: Alert) => {
    setRecentAlerts(prev => [data, ...prev.slice(0, 4)]);
  };

  const handleCertificateUpdate = (data: any) => {
    // Refresh analytics when certificate data changes
    loadDashboardData();
  };

  const getGradeColor = (grade: string) => {
    const colors: { [key: string]: string } = {
      'A+': '#28a745',
      'A': '#28a745',
      'A-': '#28a745',
      'B': '#ffc107',
      'C': '#fd7e14',
      'D': '#dc3545',
      'F': '#dc3545',
      'T': '#6c757d',
      'M': '#6c757d'
    };
    return colors[grade] || '#6c757d';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'valid': '#28a745',
      'expired': '#dc3545',
      'expiring_soon': '#ffc107',
      'invalid': '#dc3545',
      'unknown': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'low': '#28a745',
      'medium': '#ffc107',
      'high': '#fd7e14',
      'critical': '#dc3545'
    };
    return colors[severity] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={loadDashboardData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* System Overview Cards */}
      <div className="dashboard-grid">
        <div className="metric-card">
          <div className="metric-icon">🔒</div>
          <div className="metric-content">
            <h3>{analytics?.totalCertificates || 0}</h3>
            <p>Total Certificates</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>{analytics?.validCertificates || 0}</h3>
            <p>Valid Certificates</p>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <h3>{analytics?.expiringSoonCertificates || 0}</h3>
            <p>Expiring Soon</p>
          </div>
        </div>

        <div className="metric-card danger">
          <div className="metric-icon">❌</div>
          <div className="metric-content">
            <h3>{analytics?.expiredCertificates || 0}</h3>
            <p>Expired</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3 style={{ color: getGradeColor(analytics?.averageGrade || 'T') }}>
              {analytics?.averageGrade || 'N/A'}
            </h3>
            <p>Average Grade</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔍</div>
          <div className="metric-content">
            <h3>{systemStatus?.activeScans || 0}</h3>
            <p>Active Scans</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Certificate Grades Distribution</h3>
          <div className="chart-wrapper">
            {analytics?.gradeDistribution && (
              <Doughnut
                data={{
                  labels: Object.keys(analytics.gradeDistribution),
                  datasets: [{
                    data: Object.values(analytics.gradeDistribution),
                    backgroundColor: Object.keys(analytics.gradeDistribution).map(grade => getGradeColor(grade)),
                    borderWidth: 2,
                    borderColor: '#1a1a1a'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#ffffff' }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="chart-container">
          <h3>Expiration Trend (Next 90 Days)</h3>
          <div className="chart-wrapper">
            {analytics?.expirationTrend && (
              <Line
                data={{
                  labels: analytics.expirationTrend.map(item => item.date),
                  datasets: [{
                    label: 'Certificates Expiring',
                    data: analytics.expirationTrend.map(item => item.count),
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { ticks: { color: '#cccccc' } },
                    y: { ticks: { color: '#cccccc' } }
                  },
                  plugins: {
                    legend: { labels: { color: '#ffffff' } }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="activity-section">
        <div className="activity-panel">
          <h3>Recent Alerts</h3>
          <div className="alerts-list">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <div key={alert._id} className={`alert-item ${alert.severity}`}>
                  <div className="alert-icon">
                    {alert.severity === 'critical' ? '🚨' :
                     alert.severity === 'high' ? '⚠️' :
                     alert.severity === 'medium' ? 'ℹ️' : '📝'}
                  </div>
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                    <small>{new Date(alert.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="alert-status">
                    {!alert.acknowledged && (
                      <span className="badge badge-warning">New</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent alerts</p>
            )}
          </div>
        </div>

        <div className="activity-panel">
          <h3>Expiring Soon</h3>
          <div className="expiring-list">
            {expiringSoon.length > 0 ? (
              expiringSoon.slice(0, 5).map((cert: any) => (
                <div key={cert._id} className="expiring-item">
                  <div className="cert-icon">🔒</div>
                  <div className="cert-content">
                    <h4>{cert.domain}</h4>
                    <p>Expires: {new Date(cert.validity.notAfter).toLocaleDateString()}</p>
                    <small>{cert.validity.daysRemaining} days remaining</small>
                  </div>
                  <div className="cert-status">
                    <span className={`badge ${cert.validity.daysRemaining <= 7 ? 'badge-danger' : 'badge-warning'}`}>
                      {cert.validity.daysRemaining <= 7 ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No certificates expiring soon</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;