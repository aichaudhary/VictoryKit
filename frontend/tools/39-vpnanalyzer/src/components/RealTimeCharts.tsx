import React, { useEffect, useRef } from 'react';
import { TrendingUp, Activity, Shield, Zap } from 'lucide-react';
import { CHART_COLORS } from '../constants';

interface RealTimeChartsProps {
  connectionData: Array<{
    timestamp: Date;
    connections: number;
    bandwidth: number;
    alerts: number;
  }>;
  isLoading?: boolean;
}

const RealTimeCharts: React.FC<RealTimeChartsProps> = ({
  connectionData,
  isLoading = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || isLoading || connectionData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Find max values for scaling
    const maxConnections = Math.max(...connectionData.map(d => d.connections));
    const maxBandwidth = Math.max(...connectionData.map(d => d.bandwidth));
    const maxAlerts = Math.max(...connectionData.map(d => d.alerts));

    // Draw grid
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxConnections * (5 - i) / 5).toString(), padding - 10, y + 4);
    }

    // Draw connections line
    ctx.strokeStyle = CHART_COLORS.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();

    connectionData.forEach((data, index) => {
      const x = padding + (chartWidth * index) / (connectionData.length - 1);
      const y = padding + chartHeight - (chartHeight * data.connections) / maxConnections;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw bandwidth area (lighter)
    ctx.fillStyle = CHART_COLORS.secondary + '20';
    ctx.beginPath();
    connectionData.forEach((data, index) => {
      const x = padding + (chartWidth * index) / (connectionData.length - 1);
      const y = padding + chartHeight - (chartHeight * data.bandwidth) / maxBandwidth;

      if (index === 0) {
        ctx.moveTo(x, height - padding);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw alerts points
    ctx.fillStyle = CHART_COLORS.danger;
    connectionData.forEach((data, index) => {
      if (data.alerts > 0) {
        const x = padding + (chartWidth * index) / (connectionData.length - 1);
        const y = padding + chartHeight - (chartHeight * data.alerts) / maxAlerts;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

  }, [connectionData, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Real-Time Monitoring</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Connections</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-50"></div>
              <span className="text-gray-600">Bandwidth</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Alerts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Active Connections</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {connectionData.length > 0 ? connectionData[connectionData.length - 1].connections : 0}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Bandwidth (Mbps)</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {(connectionData.length > 0 ? connectionData[connectionData.length - 1].bandwidth : 0).toFixed(1)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Active Alerts</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {connectionData.length > 0 ? connectionData[connectionData.length - 1].alerts : 0}
            </div>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full h-64 border rounded"
          />
          {connectionData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No monitoring data available</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default RealTimeCharts;