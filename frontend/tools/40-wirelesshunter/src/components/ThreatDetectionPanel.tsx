import React, { useState } from 'react';
import { 
  Shield, Radio, Lock, Activity, Play, Square, Clock,
  AlertTriangle, AlertOctagon, CheckCircle,
  Target, Radar, Brain
} from 'lucide-react';
import { ThreatDetectionResult } from '../types';

interface ThreatDetectionPanelProps {
  onRunScan: (scanType: string) => Promise<ThreatDetectionResult>;
  lastScanResults?: ThreatDetectionResult[];
}

interface ScanConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  features: string[];
}

const ThreatDetectionPanel: React.FC<ThreatDetectionPanelProps> = ({
  onRunScan,
  lastScanResults = []
}) => {
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ThreatDetectionResult[]>(lastScanResults);
  const [selectedResult, setSelectedResult] = useState<ThreatDetectionResult | null>(null);

  const scanTypes: ScanConfig[] = [
    {
      id: 'rogue-ap',
      name: 'Rogue AP Detection',
      description: 'Detect unauthorized access points that may pose security risks',
      icon: <Radio className="w-6 h-6" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      features: [
        'Identify unknown access points',
        'Compare against authorized AP list',
        'Check MAC address patterns',
        'Detect evil twin attacks'
      ]
    },
    {
      id: 'weak-encryption',
      name: 'Weak Encryption Scan',
      description: 'Find networks using outdated or weak encryption protocols',
      icon: <Lock className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      features: [
        'WEP detection (critical)',
        'WPA vulnerabilities',
        'Open network discovery',
        'Cipher strength analysis'
      ]
    },
    {
      id: 'signal-anomalies',
      name: 'Signal Analysis',
      description: 'Analyze RF patterns for interference and anomalies',
      icon: <Activity className="w-6 h-6" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      features: [
        'Signal strength mapping',
        'Interference detection',
        'Channel utilization',
        'Noise floor analysis'
      ]
    },
    {
      id: 'threat-hunting',
      name: 'Advanced Threat Hunt',
      description: 'Comprehensive security analysis using AI and behavior patterns',
      icon: <Brain className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      features: [
        'AI-powered threat detection',
        'Behavioral analysis',
        'Historical pattern matching',
        'Zero-day threat hunting'
      ]
    }
  ];

  const handleRunScan = async (scanType: string) => {
    setActiveScan(scanType);
    setScanProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const result = await onRunScan(scanType);
      setScanProgress(100);
      clearInterval(progressInterval);
      
      // Add to results
      setScanResults(prev => [result, ...prev].slice(0, 10));
      setSelectedResult(result);
      
      setTimeout(() => {
        setActiveScan(null);
        setScanProgress(0);
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      setActiveScan(null);
      setScanProgress(0);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/50',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      info: 'bg-green-500/20 text-green-400 border-green-500/50'
    };
    return colors[severity] || colors.info;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-red-400" />
            Threat Detection
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Proactively scan for wireless security threats
          </p>
        </div>
        {activeScan && (
          <div className="flex items-center gap-3 bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/30">
            <div className="animate-pulse">
              <Radar className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
            <span className="text-cyan-400 text-sm">Scanning...</span>
            <span className="text-cyan-300 text-sm font-medium">{Math.round(scanProgress)}%</span>
          </div>
        )}
      </div>

      {/* Scan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scanTypes.map((scan) => (
          <div 
            key={scan.id}
            className={`p-5 rounded-xl border transition-all ${
              activeScan === scan.id 
                ? 'bg-gray-800/80 border-cyan-500/50' 
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${scan.bgColor}`}>
                  <span className={scan.color}>{scan.icon}</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">{scan.name}</h3>
                  <p className="text-gray-500 text-sm">{scan.description}</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-4">
              {scan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-3 h-3 text-gray-600" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Progress Bar */}
            {activeScan === scan.id && (
              <div className="mb-4">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => handleRunScan(scan.id)}
              disabled={activeScan !== null}
              className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeScan === scan.id
                  ? 'bg-cyan-500/20 text-cyan-400 cursor-wait'
                  : activeScan
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : `${scan.bgColor} ${scan.color} hover:opacity-80`
              }`}
            >
              {activeScan === scan.id ? (
                <>
                  <Square className="w-4 h-4" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Scan
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Results Section */}
      {scanResults.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Scan Results
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Results List */}
            <div className="space-y-3">
              {scanResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedResult(result)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedResult === result
                      ? 'bg-gray-700/50 border-cyan-500/50'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(result.severity || 'info')}
                      <span className="text-white font-medium capitalize">
                        {result.scanType?.replace('-', ' ') || 'Scan'}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(result.severity || 'info')}`}>
                      {result.threatCount || 0} threats
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{result.scannedItems || 0} items scanned</span>
                    <span>{result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'Just now'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Result Details */}
            {selectedResult && (
              <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                <h4 className="text-white font-medium mb-3">Scan Details</h4>
                
                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Scan Type</p>
                    <p className="text-white capitalize">
                      {selectedResult.scanType?.replace('-', ' ') || 'Unknown'}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Severity</p>
                    <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(selectedResult.severity || 'info')}`}>
                      {selectedResult.severity || 'Info'}
                    </span>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Items Scanned</p>
                    <p className="text-white">{selectedResult.scannedItems || 0}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Threats Found</p>
                    <p className="text-white">{selectedResult.threatCount || 0}</p>
                  </div>
                </div>

                {/* Findings */}
                {selectedResult.findings && selectedResult.findings.length > 0 && (
                  <div>
                    <h5 className="text-gray-400 text-sm mb-2">Findings</h5>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedResult.findings.map((finding: any, idx: number) => (
                        <div 
                          key={idx}
                          className="p-3 bg-gray-700/30 rounded-lg border border-gray-600"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {finding.severity === 'critical' || finding.severity === 'high' ? (
                              <AlertOctagon className="w-4 h-4 text-red-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                            <span className="text-white text-sm">{finding.title || finding.type}</span>
                          </div>
                          <p className="text-gray-500 text-xs">{finding.description}</p>
                          {finding.recommendation && (
                            <p className="text-cyan-400 text-xs mt-1">
                              💡 {finding.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No findings message */}
                {(!selectedResult.findings || selectedResult.findings.length === 0) && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-10 h-10 mx-auto text-green-400 mb-2" />
                    <p className="text-green-400">No threats detected</p>
                    <p className="text-gray-500 text-sm">Your wireless environment is secure</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {scanResults.length === 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
          <Shield className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No scan results yet</p>
          <p className="text-gray-500 text-sm mt-1">Run a scan to detect potential threats</p>
        </div>
      )}
    </div>
  );
};

export default ThreatDetectionPanel;
