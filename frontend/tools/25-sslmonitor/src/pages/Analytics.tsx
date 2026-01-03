import React, { useState, useEffect } from 'react';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { AnalyticsData, ComplianceReport, SystemStatus } from '../types';
import { analyticsAPI, complianceAPI, systemAPI } from '../services/api';
import wsService from '../services/websocket';
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
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'certificates' | 'vulnerabilities' | 'compliance' | 'performance'>('certificates');

  useEffect(() => {
    loadAnalyticsData();
    loadComplianceReport();
    loadSystemStatus();

    // Subscribe to real-time updates
    const unsubscribe = wsService.subscribe('analytics_update', (data) => {
      if (data.type === 'metrics_update') {
        updateAnalyticsData(data);
      }
    });

    return unsubscribe;
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.getAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceReport = async () => {
    try {
      const report = await complianceAPI.getComplianceReport();
      setComplianceReport(report);
    } catch (err) {
      console.error('Error loading compliance report:', err);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const status = await systemAPI.getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.error('Error loading system status:', err);
    }
  };

  const updateAnalyticsData = (newData: Partial<AnalyticsData>) => {
    if (analyticsData) {
      setAnalyticsData({ ...analyticsData, ...newData });
    }
  };

  const getChartOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#cccccc',
          font: {
            size: 11
          }
        },
        grid: {
          color: '#444'
        }
      },
      y: {
        ticks: {
          color: '#cccccc',
          font: {
            size: 11
          }
        },
        grid: {
          color: '#444'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  });

  const getCertificateGradeData = () => {
    if (!analyticsData?.certificateGrades) return null;

    return {
      labels: Object.keys(analyticsData.certificateGrades),
      datasets: [{
        label: 'Certificates by Grade',
        data: Object.values(analyticsData.certificateGrades),
        backgroundColor: [
          '#28a745', // A
          '#20c997', // A+
          '#ffc107', // B
          '#fd7e14', // C
          '#dc3545', // D/F
        ],
        borderColor: [
          '#28a745',
          '#20c997',
          '#ffc107',
          '#fd7e14',
          '#dc3545',
        ],
        borderWidth: 2,
      }],
    };
  };

  const getVulnerabilityTrendData = () => {
    if (!analyticsData?.vulnerabilityTrends) return null;

    return {
      labels: analyticsData.vulnerabilityTrends.map(item => item.date),
      datasets: [
        {
          label: 'High Severity',
          data: analyticsData.vulnerabilityTrends.map(item => item.high),
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Medium Severity',
          data: analyticsData.vulnerabilityTrends.map(item => item.medium),
          borderColor: '#fd7e14',
          backgroundColor: 'rgba(253, 126, 20, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Low Severity',
          data: analyticsData.vulnerabilityTrends.map(item => item.low),
          borderColor: '#ffc107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getComplianceTrendData = () => {
    if (!analyticsData?.complianceTrends) return null;

    return {
      labels: analyticsData.complianceTrends.map(item => item.date),
      datasets: [{
        label: 'Compliance Score (%)',
        data: analyticsData.complianceTrends.map(item => item.score),
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    };
  };

  const getScanPerformanceData = () => {
    if (!analyticsData?.scanPerformance) return null;

    return {
      labels: analyticsData.scanPerformance.map(item => item.scanType),
      datasets: [{
        label: 'Average Scan Time (seconds)',
        data: analyticsData.scanPerformance.map(item => item.averageTime),
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        borderColor: '#007bff',
        borderWidth: 1,
      }],
    };
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics">
        <div className="analytics-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => { setError(null); loadAnalyticsData(); }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h2>Analytics Dashboard</h2>
          <p>Comprehensive SSL monitoring analytics and insights</p>
        </div>
        <div className="header-controls">
          <select
            className="form-control"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            className="btn btn-outline-secondary"
            onClick={loadAnalyticsData}
          >
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-certificate"></i>
          </div>
          <div className="metric-content">
            <h3>{analyticsData?.totalCertificates || 0}</h3>
            <p>Total Certificates</p>
            <span className="metric-change positive">
              +{analyticsData?.certificateGrowth || 0}% this period
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className="metric-content">
            <h3>{analyticsData?.averageGrade || 'N/A'}</h3>
            <p>Average Grade</p>
            <span className="metric-change">
              {analyticsData?.gradeTrend || 0 > 0 ? '+' : ''}{analyticsData?.gradeTrend || 0} change
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="metric-content">
            <h3>{analyticsData?.activeAlerts || 0}</h3>
            <p>Active Alerts</p>
            <span className="metric-change negative">
              {analyticsData?.alertGrowth || 0 > 0 ? '+' : ''}{analyticsData?.alertGrowth || 0}% increase
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="metric-content">
            <h3>{analyticsData?.complianceScore || 0}%</h3>
            <p>Compliance Score</p>
            <span className="metric-change positive">
              +{analyticsData?.complianceImprovement || 0}% improvement
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-controls">
          <div className="metric-tabs">
            <button
              className={`tab-btn ${selectedMetric === 'certificates' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('certificates')}
            >
              Certificates
            </button>
            <button
              className={`tab-btn ${selectedMetric === 'vulnerabilities' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('vulnerabilities')}
            >
              Vulnerabilities
            </button>
            <button
              className={`tab-btn ${selectedMetric === 'compliance' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('compliance')}
            >
              Compliance
            </button>
            <button
              className={`tab-btn ${selectedMetric === 'performance' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('performance')}
            >
              Performance
            </button>
          </div>
        </div>

        <div className="charts-grid">
          {selectedMetric === 'certificates' && (
            <>
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Certificate Grades Distribution</h3>
                </div>
                <div className="chart-container">
                  {getCertificateGradeData() && (
                    <Doughnut
                      data={getCertificateGradeData()!}
                      options={{
                        ...getChartOptions(''),
                        plugins: {
                          ...getChartOptions('').plugins,
                          legend: {
                            position: 'bottom' as const,
                            labels: {
                              color: '#ffffff',
                              padding: 20,
                              usePointStyle: true,
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Certificate Expiry Trends</h3>
                </div>
                <div className="chart-container">
                  <Line
                    data={{
                      labels: analyticsData?.expiryTrends?.map(item => item.date) || [],
                      datasets: [{
                        label: 'Expiring Soon',
                        data: analyticsData?.expiryTrends?.map(item => item.expiring) || [],
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.4,
                      }]
                    }}
                    options={getChartOptions('')}
                  />
                </div>
              </div>
            </>
          )}

          {selectedMetric === 'vulnerabilities' && (
            <>
              <div className="chart-card full-width">
                <div className="chart-header">
                  <h3>Vulnerability Trends</h3>
                </div>
                <div className="chart-container">
                  {getVulnerabilityTrendData() && (
                    <Line
                      data={getVulnerabilityTrendData()!}
                      options={getChartOptions('')}
                    />
                  )}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Vulnerability Types</h3>
                </div>
                <div className="chart-container">
                  <Bar
                    data={{
                      labels: analyticsData?.vulnerabilityTypes?.map(item => item.type) || [],
                      datasets: [{
                        label: 'Count',
                        data: analyticsData?.vulnerabilityTypes?.map(item => item.count) || [],
                        backgroundColor: 'rgba(220, 53, 69, 0.8)',
                        borderColor: '#dc3545',
                        borderWidth: 1,
                      }]
                    }}
                    options={getChartOptions('')}
                  />
                </div>
              </div>
            </>
          )}

          {selectedMetric === 'compliance' && (
            <>
              <div className="chart-card full-width">
                <div className="chart-header">
                  <h3>Compliance Score Trends</h3>
                </div>
                <div className="chart-container">
                  {getComplianceTrendData() && (
                    <Line
                      data={getComplianceTrendData()!}
                      options={getChartOptions('')}
                    />
                  )}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Compliance Standards</h3>
                </div>
                <div className="chart-container">
                  <Bar
                    data={{
                      labels: complianceReport?.standards?.map(item => item.name) || [],
                      datasets: [{
                        label: 'Compliance %',
                        data: complianceReport?.standards?.map(item => item.score) || [],
                        backgroundColor: 'rgba(40, 167, 69, 0.8)',
                        borderColor: '#28a745',
                        borderWidth: 1,
                      }]
                    }}
                    options={getChartOptions('')}
                  />
                </div>
              </div>
            </>
          )}

          {selectedMetric === 'performance' && (
            <>
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Scan Performance</h3>
                </div>
                <div className="chart-container">
                  {getScanPerformanceData() && (
                    <Bar
                      data={getScanPerformanceData()!}
                      options={getChartOptions('')}
                    />
                  )}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>System Health</h3>
                </div>
                <div className="system-health">
                  <div className="health-item">
                    <label>CPU Usage:</label>
                    <span>{systemStatus?.cpuUsage || 0}%</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${systemStatus?.cpuUsage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="health-item">
                    <label>Memory Usage:</label>
                    <span>{systemStatus?.memoryUsage || 0}%</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${systemStatus?.memoryUsage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="health-item">
                    <label>Disk Usage:</label>
                    <span>{systemStatus?.diskUsage || 0}%</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${systemStatus?.diskUsage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="health-item">
                    <label>Active Connections:</label>
                    <span>{systemStatus?.activeConnections || 0}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compliance Report Summary */}
      {complianceReport && (
        <div className="compliance-summary">
          <div className="summary-header">
            <h3>Compliance Report Summary</h3>
            <span className="compliance-score">
              Overall Score: {complianceReport.overallScore}%
            </span>
          </div>

          <div className="compliance-details">
            <div className="compliance-item">
              <label>PCI DSS:</label>
              <span className={complianceReport.pciDss ? 'compliant' : 'non-compliant'}>
                {complianceReport.pciDss ? 'Compliant' : 'Non-Compliant'}
              </span>
            </div>
            <div className="compliance-item">
              <label>HIPAA:</label>
              <span className={complianceReport.hipaa ? 'compliant' : 'non-compliant'}>
                {complianceReport.hipaa ? 'Compliant' : 'Non-Compliant'}
              </span>
            </div>
            <div className="compliance-item">
              <label>GDPR:</label>
              <span className={complianceReport.gdpr ? 'compliant' : 'non-compliant'}>
                {complianceReport.gdpr ? 'Compliant' : 'Non-Compliant'}
              </span>
            </div>
            <div className="compliance-item">
              <label>SOX:</label>
              <span className={complianceReport.sox ? 'compliant' : 'non-compliant'}>
                {complianceReport.sox ? 'Compliant' : 'Non-Compliant'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;