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
import { analyticsAPI, attackAPI, systemAPI } from '../services/api.ts';
import { AnalyticsData, SystemStatus, Attack } from '../types/index.ts';
import wsService from '../services/websocket.ts';
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
  Legend
);

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentAttacks, setRecentAttacks] = useState<Attack[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState({
    bandwidth: 0,
    packets: 0,
    attacks: 0
  });

  useEffect(() => {
    loadDashboardData();
    setupWebSocket();

    return () => {
      wsService.disconnect();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, statusRes, attacksRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        systemAPI.getStatus(),
        attackAPI.getAll({ limit: 5, status: 'active' })
      ]);

      setAnalytics(analyticsRes.data.data);
      setSystemStatus(statusRes.data.data);
      setRecentAttacks(attacksRes.data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    wsService.connect();
    wsService.on('traffic_update', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        bandwidth: data.bandwidth || prev.bandwidth,
        packets: data.packets || prev.packets
      }));
    });

    wsService.on('attack_detected', (data) => {
      setRealtimeData(prev => ({ ...prev, attacks: prev.attacks + 1 }));
      // Refresh recent attacks
      attackAPI.getAll({ limit: 5, status: 'active' }).then(res => {
        setRecentAttacks(res.data.data);
      });
    });

    wsService.on('system_status', (data) => {
      setSystemStatus(data);
    });
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const trafficChartData = {
    labels: analytics?.timeline.map(t => new Date(t.timestamp).toLocaleTimeString()) || [],
    datasets: [{
      label: 'Bandwidth (Mbps)',
      data: analytics?.timeline.map(t => t.bandwidth) || [],
      borderColor: '#00d4aa',
      backgroundColor: 'rgba(0, 212, 170, 0.1)',
      tension: 0.4
    }]
  };

  const attackTypesData = {
    labels: analytics?.topAttackTypes.map(t => t.type) || [],
    datasets: [{
      data: analytics?.topAttackTypes.map(t => t.count) || [],
      backgroundColor: ['#ff4757', '#ffa502', '#3742fa', '#2ed573', '#ff6b6b']
    }]
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>DDoS Protection Dashboard</h1>
        <div className="realtime-indicators">
          <div className="indicator">
            <span className="label">Current Bandwidth:</span>
            <span className="value">{realtimeData.bandwidth.toFixed(2)} Mbps</span>
          </div>
          <div className="indicator">
            <span className="label">Packets/sec:</span>
            <span className="value">{realtimeData.packets.toLocaleString()}</span>
          </div>
          <div className="indicator">
            <span className="label">Active Attacks:</span>
            <span className="value">{realtimeData.attacks}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Attacks</h3>
          <div className="stat-value">{analytics?.totalAttacks || 0}</div>
          <div className="stat-change positive">+12% from last week</div>
        </div>

        <div className="stat-card">
          <h3>Active Attacks</h3>
          <div className="stat-value">{analytics?.activeAttacks || 0}</div>
          <div className="stat-change negative">+5% from yesterday</div>
        </div>

        <div className="stat-card">
          <h3>Mitigated</h3>
          <div className="stat-value">{analytics?.mitigatedAttacks || 0}</div>
          <div className="stat-change positive">98.5% success rate</div>
        </div>

        <div className="stat-card">
          <h3>Peak Bandwidth</h3>
          <div className="stat-value">{analytics?.peakTraffic || 0} Mbps</div>
          <div className="stat-change neutral">Normal range</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Traffic Overview (Last 24h)</h3>
          <Line data={trafficChartData} options={{
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }} />
        </div>

        <div className="chart-card">
          <h3>Attack Types Distribution</h3>
          <Doughnut data={attackTypesData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' as const }
            }
          }} />
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Attacks</h3>
        <div className="attacks-list">
          {recentAttacks.map((attack) => (
            <div key={attack._id} className="attack-item">
              <div className="attack-info">
                <span className="attack-type">{attack.type.toUpperCase()}</span>
                <span className="attack-target">{attack.target.ip}:{attack.target.port}</span>
                <span className={`attack-severity ${attack.severity}`}>{attack.severity}</span>
              </div>
              <div className="attack-metrics">
                <span>{attack.metrics.bandwidth} Mbps</span>
                <span>{attack.metrics.packets}/s</span>
              </div>
              <div className="attack-time">
                {new Date(attack.detectedAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="system-status">
        <h3>System Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Protection Status:</span>
            <span className={`status-value ${systemStatus?.protection}`}>
              {systemStatus?.protection.toUpperCase()}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Traffic Level:</span>
            <span className={`status-value ${systemStatus?.traffic}`}>
              {systemStatus?.traffic.toUpperCase()}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Active Alerts:</span>
            <span className="status-value">{systemStatus?.alerts || 0}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Uptime:</span>
            <span className="status-value">{systemStatus?.uptime || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;