import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
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
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { trafficAPI } from '../services/api.ts';
import { TrafficData } from '../types/index.ts';
import wsService from '../services/websocket.ts';
import './TrafficMonitor.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const TrafficMonitor: React.FC = () => {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [realtimeData, setRealtimeData] = useState<TrafficData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [selectedProtocol, setSelectedProtocol] = useState('all');
  const [isLive, setIsLive] = useState(true);
  const maxDataPoints = 100;
  const chartRef = useRef<any>(null);

  useEffect(() => {
    loadHistoricalData();
    if (isLive) {
      setupWebSocket();
    } else {
      wsService.disconnect();
    }

    return () => {
      wsService.disconnect();
    };
  }, [selectedTimeframe, selectedProtocol, isLive]);

  const loadHistoricalData = async () => {
    try {
      const end = new Date();
      const start = new Date();

      switch (selectedTimeframe) {
        case '1h':
          start.setHours(start.getHours() - 1);
          break;
        case '6h':
          start.setHours(start.getHours() - 6);
          break;
        case '24h':
          start.setHours(start.getHours() - 24);
          break;
        case '7d':
          start.setDate(start.getDate() - 7);
          break;
      }

      const response = await trafficAPI.getHistorical({
        start,
        end,
        granularity: selectedTimeframe === '7d' ? '1h' : '1m'
      });

      setTrafficData(response.data.data);
    } catch (error) {
      console.error('Failed to load traffic data:', error);
    }
  };

  const setupWebSocket = () => {
    wsService.connect();
    wsService.subscribeToTraffic({
      protocol: selectedProtocol !== 'all' ? selectedProtocol : undefined
    });

    wsService.on('traffic_update', (data: TrafficData) => {
      setRealtimeData(prev => {
        const newData = [...prev, data];
        // Keep only the last maxDataPoints
        return newData.slice(-maxDataPoints);
      });
    });
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  const filteredData = trafficData.filter(item =>
    selectedProtocol === 'all' || item.protocol === selectedProtocol
  );

  const combinedData = isLive ? [...filteredData, ...realtimeData] : filteredData;

  const bandwidthChartData = {
    datasets: [{
      label: 'Bandwidth (Mbps)',
      data: combinedData.map(item => ({
        x: new Date(item.timestamp),
        y: item.bandwidth
      })),
      borderColor: '#00d4aa',
      backgroundColor: 'rgba(0, 212, 170, 0.1)',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4
    }]
  };

  const packetsChartData = {
    datasets: [{
      label: 'Packets/sec',
      data: combinedData.map(item => ({
        x: new Date(item.timestamp),
        y: item.packets
      })),
      borderColor: '#3742fa',
      backgroundColor: 'rgba(55, 66, 250, 0.1)',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4
    }]
  };

  const connectionsChartData = {
    datasets: [{
      label: 'Active Connections',
      data: combinedData.map(item => ({
        x: new Date(item.timestamp),
        y: item.connections
      })),
      borderColor: '#ffa502',
      backgroundColor: 'rgba(255, 165, 2, 0.1)',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM dd'
          }
        },
        grid: {
          color: '#333'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#333'
        }
      }
    }
  };

  const protocolStats = combinedData.reduce((acc, item) => {
    acc[item.protocol] = (acc[item.protocol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSources = combinedData
    .filter(item => item.source.ip)
    .reduce((acc, item) => {
      const key = `${item.source.country} (${item.source.ip})`;
      acc[key] = (acc[key] || 0) + item.bandwidth;
      return acc;
    }, {} as Record<string, number>);

  const topSourcesSorted = Object.entries(topSources)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  return (
    <div className="traffic-monitor">
      <div className="monitor-header">
        <h1>Traffic Monitor</h1>
        <div className="controls">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="form-input"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          <select
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value)}
            className="form-input"
          >
            <option value="all">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="HTTP">HTTP</option>
            <option value="HTTPS">HTTPS</option>
            <option value="ICMP">ICMP</option>
          </select>

          <button
            onClick={toggleLiveMode}
            className={`btn ${isLive ? 'btn-danger' : 'btn-primary'}`}
          >
            {isLive ? 'Stop Live' : 'Start Live'}
          </button>
        </div>
      </div>

      <div className="current-stats">
        <div className="stat-box">
          <h3>Current Bandwidth</h3>
          <div className="stat-value">
            {combinedData.length > 0
              ? combinedData[combinedData.length - 1].bandwidth.toFixed(2)
              : '0.00'} Mbps
          </div>
        </div>
        <div className="stat-box">
          <h3>Peak Bandwidth</h3>
          <div className="stat-value">
            {Math.max(...combinedData.map(d => d.bandwidth), 0).toFixed(2)} Mbps
          </div>
        </div>
        <div className="stat-box">
          <h3>Total Packets</h3>
          <div className="stat-value">
            {combinedData.reduce((sum, d) => sum + d.packets, 0).toLocaleString()}
          </div>
        </div>
        <div className="stat-box">
          <h3>Active Connections</h3>
          <div className="stat-value">
            {combinedData.length > 0
              ? combinedData[combinedData.length - 1].connections
              : 0}
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Bandwidth Over Time</h3>
          <div className="chart-container">
            <Line ref={chartRef} data={bandwidthChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-wrapper">
          <h3>Packets Per Second</h3>
          <div className="chart-container">
            <Line data={packetsChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-wrapper">
          <h3>Active Connections</h3>
          <div className="chart-container">
            <Line data={connectionsChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="side-panels">
        <div className="panel">
          <h3>Protocol Distribution</h3>
          <div className="protocol-list">
            {Object.entries(protocolStats).map(([protocol, count]) => (
              <div key={protocol} className="protocol-item">
                <span className="protocol-name">{protocol}</span>
                <span className="protocol-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Top Traffic Sources</h3>
          <div className="source-list">
            {topSourcesSorted.map(([source, bandwidth]) => (
              <div key={source} className="source-item">
                <span className="source-name">{source}</span>
                <span className="source-bandwidth">{bandwidth.toFixed(2)} Mbps</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficMonitor;