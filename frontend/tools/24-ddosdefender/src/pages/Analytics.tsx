import React, { useState, useEffect } from 'react';
import { analyticsAPI, attackAPI, trafficAPI } from '../services/api.ts';
import { AnalyticsData, Attack, TrafficData } from '../types/index.ts';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('traffic');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const [analyticsRes, attacksRes, trafficRes] = await Promise.all([
        analyticsAPI.getSummary({ timeRange }),
        attackAPI.getAll({ limit: 1000 }),
        trafficAPI.getAll({ limit: 1000, timeRange })
      ]);

      setAnalyticsData(analyticsRes.data.data);
      setAttacks(attacksRes.data.data);
      setTrafficData(trafficRes.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrafficChartData = () => {
    const labels = trafficData.map(d => new Date(d.timestamp).toLocaleTimeString());
    const data = trafficData.map(d => d.bandwidth);

    return {
      labels,
      datasets: [{
        label: 'Bandwidth (Mbps)',
        data,
        borderColor: '#00d4aa',
        backgroundColor: 'rgba(0, 212, 170, 0.1)',
        tension: 0.4,
        fill: true,
      }]
    };
  };

  const getAttackChartData = () => {
    const attackTypes = attacks.reduce((acc, attack) => {
      acc[attack.type] = (acc[attack.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(attackTypes),
      datasets: [{
        data: Object.values(attackTypes),
        backgroundColor: [
          '#ff4757',
          '#ffa502',
          '#3742fa',
          '#2ed573',
          '#ff6b6b',
          '#4ecdc4',
          '#45b7d1',
          '#96ceb4'
        ],
        borderWidth: 1,
      }]
    };
  };

  const getSeverityChartData = () => {
    const severityCount = attacks.reduce((acc, attack) => {
      acc[attack.severity] = (acc[attack.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(severityCount).map(s => s.toUpperCase()),
      datasets: [{
        label: 'Attacks by Severity',
        data: Object.values(severityCount),
        backgroundColor: [
          '#2ed573', // low
          '#3742fa', // medium
          '#ffa502', // high
          '#ff4757'  // critical
        ],
        borderWidth: 1,
      }]
    };
  };

  const getTopAttackersData = () => {
    const topIPs = attacks.reduce((acc, attack) => {
      attack.source.ips.forEach(ip => {
        acc[ip] = (acc[ip] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const sortedIPs = Object.entries(topIPs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      labels: sortedIPs.map(([ip]) => ip),
      datasets: [{
        label: 'Attack Count',
        data: sortedIPs.map(([,count]) => count),
        backgroundColor: '#00d4aa',
        borderColor: '#00d4aa',
        borderWidth: 1,
      }]
    };
  };

  const getCountryChartData = () => {
    const countryCount = attacks.reduce((acc, attack) => {
      attack.source.countries.forEach(country => {
        acc[country] = (acc[country] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const sortedCountries = Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      labels: sortedCountries.map(([country]) => country),
      datasets: [{
        label: 'Attacks by Country',
        data: sortedCountries.map(([,count]) => count),
        backgroundColor: [
          '#ff4757',
          '#ffa502',
          '#3742fa',
          '#2ed573',
          '#ff6b6b',
          '#4ecdc4',
          '#45b7d1',
          '#96ceb4',
          '#ffeaa7',
          '#dda0dd'
        ],
        borderWidth: 1,
      }]
    };
  };

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const metrics = [
    { value: 'traffic', label: 'Traffic Analysis' },
    { value: 'attacks', label: 'Attack Patterns' },
    { value: 'severity', label: 'Severity Distribution' },
    { value: 'attackers', label: 'Top Attackers' },
    { value: 'countries', label: 'Geographic Analysis' }
  ];

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>DDoS Analytics</h1>
        <div className="header-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Total Attacks</h3>
          <div className="metric">{analyticsData?.totalAttacks || 0}</div>
          <div className="change positive">
            +{analyticsData?.attackChange || 0}% from last period
          </div>
        </div>

        <div className="summary-card">
          <h3>Peak Bandwidth</h3>
          <div className="metric">{analyticsData?.peakBandwidth?.toFixed(2) || 0} Mbps</div>
          <div className="change neutral">
            {analyticsData?.bandwidthChange || 0}% from last period
          </div>
        </div>

        <div className="summary-card">
          <h3>Mitigation Success</h3>
          <div className="metric">{analyticsData?.mitigationRate || 0}%</div>
          <div className="change positive">
            +{analyticsData?.mitigationChange || 0}% from last period
          </div>
        </div>

        <div className="summary-card">
          <h3>Average Response Time</h3>
          <div className="metric">{analyticsData?.avgResponseTime || 0}ms</div>
          <div className="change negative">
            {analyticsData?.responseTimeChange || 0}% from last period
          </div>
        </div>
      </div>

      <div className="analytics-content">
        <div className="metric-selector">
          {metrics.map(metric => (
            <button
              key={metric.value}
              onClick={() => setSelectedMetric(metric.value)}
              className={`metric-btn ${selectedMetric === metric.value ? 'active' : ''}`}
            >
              {metric.label}
            </button>
          ))}
        </div>

        <div className="chart-container">
          {selectedMetric === 'traffic' && (
            <div className="chart-wrapper">
              <h2>Traffic Analysis</h2>
              <Line
                data={getTrafficChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                    title: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#333' },
                      ticks: { color: '#fff' }
                    },
                    x: {
                      grid: { color: '#333' },
                      ticks: { color: '#fff' }
                    }
                  }
                }}
              />
            </div>
          )}

          {selectedMetric === 'attacks' && (
            <div className="chart-wrapper">
              <h2>Attack Types Distribution</h2>
              <Pie
                data={getAttackChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'right' as const },
                    title: { display: false }
                  }
                }}
              />
            </div>
          )}

          {selectedMetric === 'severity' && (
            <div className="chart-wrapper">
              <h2>Attack Severity Distribution</h2>
              <Doughnut
                data={getSeverityChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'right' as const },
                    title: { display: false }
                  }
                }}
              />
            </div>
          )}

          {selectedMetric === 'attackers' && (
            <div className="chart-wrapper">
              <h2>Top Attacking IPs</h2>
              <Bar
                data={getTopAttackersData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                    title: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#333' },
                      ticks: { color: '#fff' }
                    },
                    x: {
                      grid: { color: '#333' },
                      ticks: { color: '#fff' }
                    }
                  }
                }}
              />
            </div>
          )}

          {selectedMetric === 'countries' && (
            <div className="chart-wrapper">
              <h2>Attacks by Country</h2>
              <Bar
                data={getCountryChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                    title: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#333' },
                      ticks: { color: '#fff' }
                    },
                    x: {
                      grid: { color: '#333' },
                      ticks: { color: '#fff' }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="analytics-details">
          <div className="detail-section">
            <h3>Recent Attack Patterns</h3>
            <div className="patterns-list">
              {attacks.slice(0, 5).map((attack) => (
                <div key={attack._id} className="pattern-item">
                  <div className="pattern-info">
                    <span className="attack-type">{attack.type.toUpperCase()}</span>
                    <span className="attack-target">{attack.target.ip}:{attack.target.port}</span>
                  </div>
                  <div className="pattern-metrics">
                    <span>{attack.metrics.bandwidth.toFixed(2)} Mbps</span>
                    <span>{attack.source.ips.length} IPs</span>
                  </div>
                  <div className="pattern-time">
                    {new Date(attack.detectedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>System Performance</h3>
            <div className="performance-metrics">
              <div className="metric-item">
                <span className="label">CPU Usage</span>
                <span className="value">{analyticsData?.systemMetrics?.cpu || 0}%</span>
              </div>
              <div className="metric-item">
                <span className="label">Memory Usage</span>
                <span className="value">{analyticsData?.systemMetrics?.memory || 0}%</span>
              </div>
              <div className="metric-item">
                <span className="label">Network I/O</span>
                <span className="value">{analyticsData?.systemMetrics?.network || 0} Mbps</span>
              </div>
              <div className="metric-item">
                <span className="label">Active Connections</span>
                <span className="value">{analyticsData?.systemMetrics?.connections || 0}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Threat Intelligence</h3>
            <div className="threat-indicators">
              <div className="indicator">
                <span className="label">Known Bad IPs</span>
                <span className="value">{analyticsData?.threatIntel?.badIPs || 0}</span>
              </div>
              <div className="indicator">
                <span className="label">Malicious Domains</span>
                <span className="value">{analyticsData?.threatIntel?.maliciousDomains || 0}</span>
              </div>
              <div className="indicator">
                <span className="label">Botnet Activity</span>
                <span className="value">{analyticsData?.threatIntel?.botnetActivity || 0}</span>
              </div>
              <div className="indicator">
                <span className="label">Zero-Day Threats</span>
                <span className="value">{analyticsData?.threatIntel?.zeroDayThreats || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;