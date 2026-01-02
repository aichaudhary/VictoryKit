import { useState, useEffect, useCallback } from "react";
import {
  Cloud,
  Shield,
  AlertTriangle,
  CheckCircle,
  Server,
  Database,
  Lock,
  Eye,
  Zap,
  RefreshCw,
  Globe,
  Activity,
  AlertCircle,
  TrendingUp,
  Target,
  Settings,
} from "lucide-react";
import cloudSecureAPI, { CloudFinding, Scan, DashboardData, AttackPath } from "../services/api";

interface ScanResult {
  score: number;
  totalResources: number;
  findings: CloudFinding[];
  complianceStatus: { framework: string; score: number }[];
  scanTime: string;
  attackPaths?: { id: string; name: string; severity: string; riskScore: number }[];
}

const mockFindings: CloudFinding[] = [
  {
    id: "1",
    resource: "s3://prod-bucket",
    provider: "aws",
    severity: "critical",
    category: "Storage",
    description: "S3 bucket publicly accessible",
    recommendation: "Enable bucket policy restrictions",
  },
  {
    id: "2",
    resource: "vm-prod-001",
    provider: "azure",
    severity: "high",
    category: "Compute",
    description: "VM has public IP without NSG",
    recommendation: "Attach Network Security Group",
  },
  {
    id: "3",
    resource: "gke-cluster-main",
    provider: "gcp",
    severity: "medium",
    category: "Kubernetes",
    description: "Legacy ABAC enabled",
    recommendation: "Migrate to RBAC authorization",
  },
  {
    id: "4",
    resource: "rds-production",
    provider: "aws",
    severity: "high",
    category: "Database",
    description: "RDS instance not encrypted",
    recommendation: "Enable encryption at rest",
  },
  {
    id: "5",
    resource: "storage-account-01",
    provider: "azure",
    severity: "low",
    category: "Storage",
    description: "Soft delete not enabled",
    recommendation: "Enable soft delete for blobs",
  },
];

export default function CloudSecureTool() {
  const [provider, setProvider] = useState<string>("all");
  const [scanType, setScanType] = useState<string>("full");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveFindings, setLiveFindings] = useState<CloudFinding[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentResource, setCurrentResource] = useState("");
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(["CIS", "SOC2", "PCI-DSS", "HIPAA"]);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resources = [
    "EC2 Instances",
    "S3 Buckets",
    "RDS Databases",
    "VPCs",
    "IAM Policies",
    "Lambda Functions",
    "Azure VMs",
    "GKE Clusters",
    "Security Groups",
    "Key Vaults",
    "Storage Accounts",
    "Cloud SQL",
  ];

  // Check API health on mount
  useEffect(() => {
    const checkAPI = async () => {
      try {
        await cloudSecureAPI.checkHealth();
        setApiConnected(true);
        // Load dashboard data
        const dashResponse = await cloudSecureAPI.getDashboard();
        if (dashResponse.success) {
          setDashboardData(dashResponse.data);
        }
      } catch (err) {
        console.warn("CloudSecure API not available, using mock mode");
        setApiConnected(false);
      }
    };
    checkAPI();
  }, []);

  // Poll for scan status
  useEffect(() => {
    if (!currentScanId || !isScanning) return;

    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await cloudSecureAPI.getScanStatus(currentScanId);
        const scan = statusResponse.data.scan;
        
        setScanProgress(scan.progress);
        setCurrentResource(resources[Math.floor(Math.random() * resources.length)]);

        if (scan.status === 'completed') {
          clearInterval(pollInterval);
          setIsScanning(false);
          setScanProgress(100);
          
          // Get full results
          const resultsResponse = await cloudSecureAPI.getScanResults(currentScanId);
          const { scan: completedScan, findings } = resultsResponse.data;
          
          setLiveFindings(findings.slice(0, 10));
          setResult({
            score: calculateSecurityScore(completedScan.results!),
            totalResources: completedScan.results!.totalResources,
            findings: findings,
            complianceStatus: completedScan.results!.complianceScores,
            scanTime: new Date(completedScan.completedAt!).toLocaleTimeString(),
          });
        } else if (scan.status === 'failed') {
          clearInterval(pollInterval);
          setIsScanning(false);
          setError('Scan failed. Please try again.');
        }
      } catch (err) {
        console.error('Error polling scan status:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [currentScanId, isScanning]);

  const calculateSecurityScore = (results: any): number => {
    if (!results) return 0;
    const { findingsCount } = results;
    const totalFindings = findingsCount.critical + findingsCount.high + findingsCount.medium + findingsCount.low;
    if (totalFindings === 0) return 100;
    
    const weightedScore = 
      (findingsCount.critical * 25) + 
      (findingsCount.high * 15) + 
      (findingsCount.medium * 5) + 
      (findingsCount.low * 1);
    
    return Math.max(0, Math.min(100, 100 - Math.round(weightedScore / results.totalResources * 10)));
  };

  const handleScan = async () => {
    setIsScanning(true);
    setLiveFindings([]);
    setScanProgress(0);
    setResult(null);
    setError(null);

    if (apiConnected) {
      try {
        const scanConfig = {
          name: `Security Scan - ${new Date().toISOString()}`,
          providers: provider === 'all' ? ['aws', 'azure', 'gcp'] : [provider],
          scanType,
          frameworks: selectedFrameworks,
        };

        const response = await cloudSecureAPI.startScan(scanConfig);
        setCurrentScanId(response.data.scan._id);
      } catch (err: any) {
        setError(err.message || 'Failed to start scan');
        setIsScanning(false);
      }
    } else {
      // Mock mode - simulate scan
      const mockInterval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 15, 95));
        setCurrentResource(
          resources[Math.floor(Math.random() * resources.length)]
        );
        if (Math.random() > 0.6 && liveFindings.length < 5) {
          const finding = mockFindings[liveFindings.length];
          if (finding) setLiveFindings((prev) => [...prev, finding]);
        }
      }, 800);

      setTimeout(() => {
        clearInterval(mockInterval);
        setIsScanning(false);
        setScanProgress(100);
        setResult({
          score: 72,
          totalResources: 156,
          findings: mockFindings,
          complianceStatus: [
            { framework: "CIS AWS", score: 78 },
            { framework: "SOC 2", score: 85 },
            { framework: "PCI-DSS", score: 65 },
            { framework: "HIPAA", score: 70 },
          ],
          scanTime: new Date().toLocaleTimeString(),
          attackPaths: [
            { id: "1", name: "Public S3 → IAM Escalation → RDS Access", severity: "critical", riskScore: 92 },
            { id: "2", name: "Open SSH → EC2 Pivot → S3 Exfil", severity: "high", riskScore: 78 },
          ],
        });
      }, 6000);
    }
  };

  const toggleFramework = (fw: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(fw) 
        ? prev.filter(f => f !== fw)
        : [...prev, fw]
    );
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "text-red-400",
      high: "text-orange-400",
      medium: "text-yellow-400",
      low: "text-green-400",
    };
    return colors[severity as keyof typeof colors] || "text-gray-400";
  };

  const getProviderIcon = (prov: string) => {
    if (prov === "aws") return "🟠";
    if (prov === "azure") return "🔵";
    return "🔴";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 mb-4 animate-cloudFloat">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CloudSecure</h1>
          <p className="text-sky-300">Cloud Security Posture Management</p>
          
          {/* API Connection Status */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {apiConnected === null ? (
              <span className="flex items-center gap-2 text-sm text-sky-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting to API...
              </span>
            ) : apiConnected ? (
              <span className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                API Connected (Live Mode)
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                Demo Mode (API Offline)
              </span>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            </div>
          )}
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-sky-900/30 backdrop-blur-sm rounded-2xl border border-sky-700/50 p-6">
            <h2 className="text-lg font-semibold text-sky-100 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" />
              Scan Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sky-300 mb-2">
                  Cloud Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="cloud-input w-full"
                >
                  <option value="all">All Providers</option>
                  <option value="aws">Amazon Web Services</option>
                  <option value="azure">Microsoft Azure</option>
                  <option value="gcp">Google Cloud Platform</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sky-300 mb-2">
                  Scan Type
                </label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  className="cloud-input w-full"
                >
                  <option value="full">Full Security Scan</option>
                  <option value="compliance">Compliance Check</option>
                  <option value="config">Configuration Audit</option>
                  <option value="iam">IAM Analysis</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["CIS", "SOC2", "PCI-DSS", "HIPAA"].map((fw) => (
                  <label
                    key={fw}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedFrameworks.includes(fw)
                        ? "bg-sky-800/50 border border-sky-500/50"
                        : "bg-sky-950/50 border border-sky-700/30 hover:border-sky-500/30"
                    }`}
                    onClick={() => toggleFramework(fw)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFrameworks.includes(fw)}
                      onChange={() => toggleFramework(fw)}
                      className="rounded text-sky-500"
                    />
                    <span className="text-sm text-sky-200">{fw}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Scanning Cloud...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Start Security Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-sky-900/30 backdrop-blur-sm rounded-2xl border border-sky-700/50 p-6">
            <h2 className="text-lg font-semibold text-sky-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-400" />
              Live Scan Activity
              {isScanning && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
              )}
            </h2>

            {isScanning && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-sky-300 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-sky-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-xs text-sky-400 mt-2 animate-pulse">
                  Scanning: {currentResource}
                </p>
              </div>
            )}

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {liveFindings.length === 0 && !isScanning && (
                <div className="text-center py-8 text-sky-500">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start a scan to see live findings</p>
                </div>
              )}
              {liveFindings.map((finding, idx) => (
                <div
                  key={finding.id}
                  className={`finding-card ${finding.severity} animate-fadeIn`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      {getProviderIcon(finding.provider)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase ${getSeverityColor(
                            finding.severity
                          )}`}
                        >
                          {finding.severity}
                        </span>
                        <span className="text-xs text-sky-400">
                          {finding.category}
                        </span>
                      </div>
                      <p className="text-sm text-sky-100 truncate">
                        {finding.resource}
                      </p>
                      <p className="text-xs text-sky-400 mt-1">
                        {finding.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-sky-900/30 backdrop-blur-sm rounded-2xl border border-sky-700/50 p-6">
            <h2 className="text-lg font-semibold text-sky-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-400" />
              Security Posture
            </h2>

            {!result ? (
              <div className="text-center py-12 text-sky-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Complete a scan to view results</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Score Ring */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#0c4a6e"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={
                          result.score >= 80
                            ? "#22c55e"
                            : result.score >= 60
                            ? "#eab308"
                            : "#ef4444"
                        }
                        strokeWidth="8"
                        strokeDasharray={`${result.score * 2.83} 283`}
                        className="score-ring"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {result.score}
                      </span>
                      <span className="text-xs text-sky-400">Score</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-sky-950/50 text-center">
                    <Server className="w-5 h-5 mx-auto text-sky-400 mb-1" />
                    <p className="text-xl font-bold text-white">
                      {result.totalResources}
                    </p>
                    <p className="text-xs text-sky-400">Resources</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-950/50 text-center">
                    <AlertTriangle className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                    <p className="text-xl font-bold text-white">
                      {result.findings.length}
                    </p>
                    <p className="text-xs text-sky-400">Findings</p>
                  </div>
                </div>

                {/* Compliance */}
                <div>
                  <p className="text-sm font-medium text-sky-300 mb-2">
                    Compliance
                  </p>
                  <div className="space-y-2">
                    {result.complianceStatus.map((c) => (
                      <div
                        key={c.framework}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs text-sky-400 w-16">
                          {c.framework}
                        </span>
                        <div className="flex-1 h-2 bg-sky-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              c.score >= 80
                                ? "bg-green-500"
                                : c.score >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${c.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-sky-300 w-8">
                          {c.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attack Paths */}
                {result.attackPaths && result.attackPaths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-sky-300 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-red-400" />
                      Attack Paths Detected
                    </p>
                    <div className="space-y-2">
                      {result.attackPaths.map((path) => (
                        <div
                          key={path.id}
                          className={`p-2 rounded-lg border ${
                            path.severity === 'critical'
                              ? 'bg-red-900/20 border-red-500/30'
                              : 'bg-orange-900/20 border-orange-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold uppercase ${
                              path.severity === 'critical' ? 'text-red-400' : 'text-orange-400'
                            }`}>
                              {path.severity}
                            </span>
                            <span className="text-xs text-sky-300">
                              Risk: {path.riskScore}%
                            </span>
                          </div>
                          <p className="text-xs text-sky-200">{path.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-sky-500 text-center">
                  Scanned at {result.scanTime}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
