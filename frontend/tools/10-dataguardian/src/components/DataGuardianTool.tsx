import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import DataGuardianForm, { DataGuardianConfig } from "./DataGuardianForm";
import LiveDataGuardianPanel from "./LiveDataGuardianPanel";
import AnimatedDataGuardianResult from "./AnimatedDataGuardianResult";
import {
  dataGuardianApi,
  simulatedData,
  DSRDashboard,
  ConsentDashboard,
  RetentionDashboard,
  DataSubjectRequest,
  DSRType,
  DSRStatus,
  Regulation,
  DataDiscoveryResult,
  PIAResult,
} from "../api/dataguardian.api";

// ============= Tab Type =============
type ActiveTab = 'scanner' | 'dsr' | 'consent' | 'retention' | 'dashboard';

interface DataFinding {
  id: string;
  type: "pii" | "phi" | "pci" | "confidential" | "credentials" | "ip";
  category: string;
  location: string;
  source: string;
  count: number;
  risk: "critical" | "high" | "medium" | "low";
  encrypted: boolean;
  samples?: string[];
}

interface SourceProgress {
  sourceId: string;
  sourceName: string;
  sourceType: "database" | "cloud" | "file" | "api";
  status: "pending" | "scanning" | "completed" | "error";
  progress: number;
  tablesScanned?: number;
  totalTables?: number;
  recordsScanned?: number;
  findingsCount: number;
}

interface ScanEvent {
  id: string;
  timestamp: Date;
  type: "info" | "warning" | "finding" | "complete";
  message: string;
  details?: string;
}

interface Recommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
  regulations: string[];
}

interface ScanResult {
  scanId: string;
  scanName: string;
  completedAt: Date;
  duration: number;
  privacyScore: number;
  protectionLevel: "excellent" | "good" | "moderate" | "poor" | "critical";
  totalRecords: number;
  totalFindings: number;
  findingsByType: { type: string; count: number; risk: string }[];
  findingsBySource: { source: string; sourceType: string; count: number }[];
  topRisks: DataFinding[];
  encryptionStatus: {
    encrypted: number;
    unencrypted: number;
    partial: number;
  };
  regulationCompliance: {
    regulation: string;
    status: "compliant" | "partial" | "non-compliant";
    issues: number;
  }[];
  recommendations: Recommendation[];
  dataMap: {
    category: string;
    locations: string[];
    totalCount: number;
  }[];
}

// Sample data templates
const piiCategories = [
  "Email",
  "Phone",
  "SSN",
  "Name",
  "Address",
  "DOB",
  "Driver License",
  "Passport",
];
const phiCategories = [
  "Medical Record",
  "Diagnosis",
  "Prescription",
  "Lab Result",
  "Insurance ID",
  "Health Plan",
];
const pciCategories = [
  "Credit Card",
  "CVV",
  "Expiration",
  "Cardholder",
  "Bank Account",
  "Routing Number",
];
const confidentialCategories = [
  "Trade Secret",
  "Financial Report",
  "Contract",
  "Strategy Doc",
  "Board Minutes",
];
const credentialCategories = [
  "Password",
  "API Key",
  "Access Token",
  "Private Key",
  "Secret",
  "Connection String",
];

const DataGuardianTool: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Dashboard states
  const [dsrDashboard, setDsrDashboard] = useState<DSRDashboard | null>(null);
  const [consentDashboard, setConsentDashboard] = useState<ConsentDashboard | null>(null);
  const [retentionDashboard, setRetentionDashboard] = useState<RetentionDashboard | null>(null);
  const [complianceScore, setComplianceScore] = useState<number>(0);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  
  // DSR states
  const [dsrList, setDsrList] = useState<DataSubjectRequest[]>([]);
  const [isLoadingDSR, setIsLoadingDSR] = useState(false);
  const [showDSRForm, setShowDSRForm] = useState(false);
  const [dsrFormData, setDsrFormData] = useState({
    type: 'access' as DSRType,
    email: '',
    name: '',
    regulation: 'GDPR' as Regulation,
  });
  
  // Data Discovery states
  const [discoveryResult, setDiscoveryResult] = useState<DataDiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryEmail, setDiscoveryEmail] = useState('');
  
  // PIA states
  const [piaResult, setPiaResult] = useState<PIAResult | null>(null);
  const [isPIARunning, setIsPIARunning] = useState(false);

  // Scanner states (existing)
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("");
  const [overallProgress, setOverallProgress] = useState(0);
  const [sourceProgress, setSourceProgress] = useState<SourceProgress[]>([]);
  const [findings, setFindings] = useState<DataFinding[]>([]);
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalFindings: 0,
    piiCount: 0,
    phiCount: 0,
    pciCount: 0,
    encryptedCount: 0,
    unencryptedCount: 0,
  });
  const [result, setResult] = useState<ScanResult | null>(null);
  const [config, setConfig] = useState<DataGuardianConfig | null>(null);

  // Load dashboard on mount
  useEffect(() => {
    loadUnifiedDashboard();
  }, []);

  const loadUnifiedDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const response = await dataGuardianApi.getUnifiedDashboard();
      if (response.success && response.data) {
        setDsrDashboard(response.data.dsr);
        setConsentDashboard(response.data.consent);
        setRetentionDashboard(response.data.retention);
        setComplianceScore(response.data.complianceScore);
        setApiConnected(true);
      } else {
        // Use simulated data
        setDsrDashboard(simulatedData.dsrDashboard);
        setConsentDashboard(simulatedData.consentDashboard);
        setRetentionDashboard(simulatedData.retentionDashboard);
        setComplianceScore(simulatedData.unifiedDashboard.complianceScore);
        setApiConnected(false);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // Fallback to simulated
      setDsrDashboard(simulatedData.dsrDashboard);
      setConsentDashboard(simulatedData.consentDashboard);
      setRetentionDashboard(simulatedData.retentionDashboard);
      setComplianceScore(simulatedData.unifiedDashboard.complianceScore);
      setApiConnected(false);
    }
    setIsLoadingDashboard(false);
  };

  const loadDSRList = async () => {
    setIsLoadingDSR(true);
    try {
      const response = await dataGuardianApi.getDSRs({ limit: 20 });
      if (response.success && response.data) {
        setDsrList(response.data.dsrs);
      } else {
        // Generate simulated DSRs
        setDsrList([
          simulatedData.generateDSR('access', 'pending'),
          simulatedData.generateDSR('erasure', 'in-progress'),
          simulatedData.generateDSR('portability', 'completed'),
        ]);
      }
    } catch (error) {
      console.error('Failed to load DSRs:', error);
      setDsrList([
        simulatedData.generateDSR('access', 'pending'),
        simulatedData.generateDSR('erasure', 'in-progress'),
      ]);
    }
    setIsLoadingDSR(false);
  };

  const handleCreateDSR = async () => {
    try {
      const response = await dataGuardianApi.createDSR({
        type: dsrFormData.type,
        dataSubject: {
          email: dsrFormData.email,
          name: dsrFormData.name,
        },
        regulation: dsrFormData.regulation,
      });
      
      if (response.success && response.data) {
        setDsrList(prev => [response.data!.dsr, ...prev]);
      } else {
        // Simulate creating a DSR
        const newDSR = simulatedData.generateDSR(dsrFormData.type, 'pending');
        newDSR.dataSubject.email = dsrFormData.email;
        newDSR.dataSubject.name = dsrFormData.name;
        newDSR.regulation = dsrFormData.regulation;
        setDsrList(prev => [newDSR, ...prev]);
      }
      
      setShowDSRForm(false);
      setDsrFormData({ type: 'access', email: '', name: '', regulation: 'GDPR' });
    } catch (error) {
      console.error('Failed to create DSR:', error);
    }
  };

  const handleDataDiscovery = async () => {
    if (!discoveryEmail) return;
    
    setIsDiscovering(true);
    try {
      const response = await dataGuardianApi.discoverData({ email: discoveryEmail });
      if (response.success && response.data) {
        setDiscoveryResult(response.data);
      } else {
        // Use simulated discovery result
        setDiscoveryResult({
          ...simulatedData.discoveryResult,
          query: discoveryEmail,
        });
      }
    } catch (error) {
      console.error('Discovery failed:', error);
      setDiscoveryResult({
        ...simulatedData.discoveryResult,
        query: discoveryEmail,
      });
    }
    setIsDiscovering(false);
  };

  const handlePIA = async () => {
    setIsPIARunning(true);
    try {
      const response = await dataGuardianApi.performPIA({
        projectName: 'New Project Assessment',
        dataCategories: ['personal', 'behavioral', 'financial'],
        processingPurposes: ['analytics', 'marketing', 'service-delivery'],
      });
      if (response.success && response.data) {
        setPiaResult(response.data);
      } else {
        setPiaResult(simulatedData.piaResult);
      }
    } catch (error) {
      console.error('PIA failed:', error);
      setPiaResult(simulatedData.piaResult);
    }
    setIsPIARunning(false);
  };

  const addEvent = useCallback(
    (type: ScanEvent["type"], message: string, details?: string) => {
      const event: ScanEvent = {
        id: `event-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        type,
        message,
        details,
      };
      setEvents((prev) => [...prev, event]);
    },
    []
  );

  const addFinding = useCallback((finding: Omit<DataFinding, "id">) => {
    const newFinding: DataFinding = {
      ...finding,
      id: `finding-${Date.now()}-${Math.random()}`,
    };
    setFindings((prev) => [...prev, newFinding]);

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalFindings: prev.totalFindings + 1,
      piiCount: finding.type === "pii" ? prev.piiCount + 1 : prev.piiCount,
      phiCount: finding.type === "phi" ? prev.phiCount + 1 : prev.phiCount,
      pciCount: finding.type === "pci" ? prev.pciCount + 1 : prev.pciCount,
      encryptedCount: finding.encrypted
        ? prev.encryptedCount + 1
        : prev.encryptedCount,
      unencryptedCount: !finding.encrypted
        ? prev.unencryptedCount + 1
        : prev.unencryptedCount,
    }));

    return newFinding;
  }, []);

  const generateMaskedSample = (type: string, category: string): string => {
    switch (category.toLowerCase()) {
      case "email":
        return "j***@e***.com";
      case "phone":
        return "(***) ***-1234";
      case "ssn":
        return "***-**-6789";
      case "credit card":
        return "**** **** **** 4321";
      case "name":
        return "J*** D**";
      case "address":
        return "*** M*** St, ***";
      case "password":
        return "********";
      case "api key":
        return "sk-***...***xyz";
      default:
        return "***REDACTED***";
    }
  };

  const runScan = useCallback(
    async (scanConfig: DataGuardianConfig) => {
      setConfig(scanConfig);
      setIsScanning(true);
      setScanComplete(false);
      setFindings([]);
      setEvents([]);
      setOverallProgress(0);
      setStats({
        totalRecords: 0,
        totalFindings: 0,
        piiCount: 0,
        phiCount: 0,
        pciCount: 0,
        encryptedCount: 0,
        unencryptedCount: 0,
      });

      const startTime = Date.now();

      // Initialize source progress
      const initialProgress: SourceProgress[] = scanConfig.dataSources.map(
        (source) => ({
          sourceId: source.id,
          sourceName: source.name,
          sourceType: source.type,
          status: "pending",
          progress: 0,
          findingsCount: 0,
        })
      );
      setSourceProgress(initialProgress);

      addEvent(
        "info",
        "Privacy scan initiated",
        `Scanning ${scanConfig.dataSources.length} data sources`
      );
      setCurrentPhase("Initializing scan...");

      await new Promise((r) => setTimeout(r, 500));

      // Scan each source
      for (let i = 0; i < scanConfig.dataSources.length; i++) {
        const source = scanConfig.dataSources[i];
        setCurrentPhase(`Scanning ${source.name}...`);

        // Update source status to scanning
        setSourceProgress((prev) =>
          prev.map((sp) =>
            sp.sourceId === source.id
              ? { ...sp, status: "scanning" as const }
              : sp
          )
        );

        addEvent(
          "info",
          `Connecting to ${source.name}`,
          `Type: ${source.type}`
        );
        await new Promise((r) => setTimeout(r, 400));

        // Simulate scanning progress
        const totalRecords = Math.floor(Math.random() * 50000) + 10000;
        const tableCount = Math.floor(Math.random() * 20) + 5;

        for (
          let progress = 0;
          progress <= 100;
          progress += Math.floor(Math.random() * 15) + 5
        ) {
          await new Promise((r) => setTimeout(r, 200));

          const currentProgress = Math.min(progress, 100);
          setSourceProgress((prev) =>
            prev.map((sp) =>
              sp.sourceId === source.id
                ? {
                    ...sp,
                    progress: currentProgress,
                    recordsScanned: Math.floor(
                      (currentProgress / 100) * totalRecords
                    ),
                    totalTables: tableCount,
                    tablesScanned: Math.floor(
                      (currentProgress / 100) * tableCount
                    ),
                  }
                : sp
            )
          );

          // Calculate overall progress
          const totalProgress =
            ((i + currentProgress / 100) / scanConfig.dataSources.length) * 100;
          setOverallProgress(totalProgress);

          // Update total records
          setStats((prev) => ({
            ...prev,
            totalRecords: prev.totalRecords + Math.floor(Math.random() * 500),
          }));

          // Random chance to find sensitive data
          if (Math.random() > 0.6) {
            const typeRoll = Math.random();
            let type: DataFinding["type"];
            let categories: string[];

            if (typeRoll < 0.35 && scanConfig.dataCategories.includes("pii")) {
              type = "pii";
              categories = piiCategories;
            } else if (
              typeRoll < 0.5 &&
              scanConfig.dataCategories.includes("phi")
            ) {
              type = "phi";
              categories = phiCategories;
            } else if (
              typeRoll < 0.65 &&
              scanConfig.dataCategories.includes("pci")
            ) {
              type = "pci";
              categories = pciCategories;
            } else if (
              typeRoll < 0.8 &&
              scanConfig.dataCategories.includes("confidential")
            ) {
              type = "confidential";
              categories = confidentialCategories;
            } else if (scanConfig.dataCategories.includes("credentials")) {
              type = "credentials";
              categories = credentialCategories;
            } else {
              continue;
            }

            const category =
              categories[Math.floor(Math.random() * categories.length)];
            const location =
              source.type === "database"
                ? `${source.name}/table_${Math.floor(
                    Math.random() * 20
                  )}/column_${category.toLowerCase().replace(" ", "_")}`
                : source.type === "cloud"
                ? `${source.name}/bucket/path/file_${Math.floor(
                    Math.random() * 100
                  )}.csv`
                : `${source.name}/documents/file_${Math.floor(
                    Math.random() * 50
                  )}.${
                    ["xlsx", "csv", "json", "xml"][
                      Math.floor(Math.random() * 4)
                    ]
                  }`;

            const risks: DataFinding["risk"][] = [
              "critical",
              "high",
              "medium",
              "low",
            ];
            const riskWeights =
              type === "pii" || type === "phi" || type === "pci"
                ? [0.2, 0.4, 0.3, 0.1]
                : [0.1, 0.2, 0.4, 0.3];

            const riskRoll = Math.random();
            let risk: DataFinding["risk"] = "low";
            let cumulative = 0;
            for (let r = 0; r < risks.length; r++) {
              cumulative += riskWeights[r];
              if (riskRoll < cumulative) {
                risk = risks[r];
                break;
              }
            }

            const encrypted = Math.random() > 0.4;
            const count = Math.floor(Math.random() * 500) + 10;

            addFinding({
              type,
              category,
              location,
              source: source.name,
              count,
              risk,
              encrypted,
              samples: [generateMaskedSample(type, category)],
            });

            setSourceProgress((prev) =>
              prev.map((sp) =>
                sp.sourceId === source.id
                  ? { ...sp, findingsCount: sp.findingsCount + 1 }
                  : sp
              )
            );

            addEvent(
              "finding",
              `Found ${category} data`,
              `${count} records in ${location}`
            );
          }
        }

        // Complete this source
        setSourceProgress((prev) =>
          prev.map((sp) =>
            sp.sourceId === source.id
              ? { ...sp, status: "completed" as const, progress: 100 }
              : sp
          )
        );
        addEvent(
          "complete",
          `Completed scanning ${source.name}`,
          `${totalRecords.toLocaleString()} records processed`
        );
      }

      setCurrentPhase("Analyzing results...");
      await new Promise((r) => setTimeout(r, 800));

      setCurrentPhase("Generating recommendations...");
      await new Promise((r) => setTimeout(r, 600));

      // Generate final result
      const endTime = Date.now();
      const allFindings = [...findings];

      const findingsByType = scanConfig.dataCategories
        .map((type) => ({
          type,
          count: allFindings.filter((f) => f.type === type).length,
          risk: "mixed",
        }))
        .filter((f) => f.count > 0);

      const findingsBySource = scanConfig.dataSources.map((source) => ({
        source: source.name,
        sourceType: source.type,
        count: allFindings.filter((f) => f.source === source.name).length,
      }));

      const totalFindings = allFindings.length;
      const criticalCount = allFindings.filter(
        (f) => f.risk === "critical"
      ).length;
      const highCount = allFindings.filter((f) => f.risk === "high").length;
      const unencryptedSensitive = allFindings.filter(
        (f) =>
          !f.encrypted &&
          (f.type === "pii" || f.type === "phi" || f.type === "pci")
      ).length;

      // Calculate privacy score
      let privacyScore = 100;
      privacyScore -= criticalCount * 8;
      privacyScore -= highCount * 4;
      privacyScore -= unencryptedSensitive * 3;
      privacyScore = Math.max(0, Math.min(100, privacyScore));

      const protectionLevel: ScanResult["protectionLevel"] =
        privacyScore >= 90
          ? "excellent"
          : privacyScore >= 75
          ? "good"
          : privacyScore >= 60
          ? "moderate"
          : privacyScore >= 40
          ? "poor"
          : "critical";

      const recommendations: Recommendation[] = [];

      if (unencryptedSensitive > 0) {
        recommendations.push({
          id: "rec-1",
          priority: "critical",
          category: "Encryption",
          title: "Encrypt sensitive data at rest",
          description: `${unencryptedSensitive} sensitive data fields are stored without encryption. Implement AES-256 encryption.`,
          impact: "High security improvement",
          effort: "medium",
          regulations: ["GDPR", "HIPAA", "PCI-DSS"],
        });
      }

      if (allFindings.some((f) => f.type === "pii")) {
        recommendations.push({
          id: "rec-2",
          priority: "high",
          category: "Data Minimization",
          title: "Review PII data collection",
          description:
            "Audit collected PII to ensure only necessary data is retained.",
          impact: "Reduced compliance risk",
          effort: "low",
          regulations: ["GDPR", "CCPA"],
        });
      }

      if (allFindings.some((f) => f.type === "credentials")) {
        recommendations.push({
          id: "rec-3",
          priority: "critical",
          category: "Secrets Management",
          title: "Move credentials to secure vault",
          description:
            "Detected hardcoded credentials. Migrate to HashiCorp Vault or AWS Secrets Manager.",
          impact: "Critical security fix",
          effort: "medium",
          regulations: [],
        });
      }

      recommendations.push({
        id: "rec-4",
        priority: "medium",
        category: "Access Control",
        title: "Implement data access logging",
        description:
          "Enable comprehensive audit logging for all sensitive data access.",
        impact: "Improved visibility",
        effort: "low",
        regulations: ["SOC 2", "HIPAA"],
      });

      const regulationCompliance = scanConfig.privacyRegulations.map((reg) => {
        const regFindings = allFindings.filter(
          (f) =>
            (reg === "gdpr" && f.type === "pii") ||
            (reg === "hipaa" && f.type === "phi") ||
            (reg === "pci-dss" && f.type === "pci")
        );

        const unencryptedCount = regFindings.filter((f) => !f.encrypted).length;

        return {
          regulation: reg.toUpperCase(),
          status:
            unencryptedCount === 0 && regFindings.length < 5
              ? ("compliant" as const)
              : unencryptedCount < 3
              ? ("partial" as const)
              : ("non-compliant" as const),
          issues: unencryptedCount + Math.floor(regFindings.length / 3),
        };
      });

      const dataMap = [...new Set(allFindings.map((f) => f.category))].map(
        (cat) => ({
          category: cat,
          locations: [
            ...new Set(
              allFindings
                .filter((f) => f.category === cat)
                .map((f) => f.location)
            ),
          ],
          totalCount: allFindings
            .filter((f) => f.category === cat)
            .reduce((sum, f) => sum + f.count, 0),
        })
      );

      const finalResult: ScanResult = {
        scanId: `scan-${Date.now()}`,
        scanName: scanConfig.scanName || "Privacy Scan",
        completedAt: new Date(),
        duration: endTime - startTime,
        privacyScore,
        protectionLevel,
        totalRecords: stats.totalRecords,
        totalFindings,
        findingsByType,
        findingsBySource,
        topRisks: allFindings
          .sort((a, b) => {
            const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return riskOrder[a.risk] - riskOrder[b.risk];
          })
          .slice(0, 10),
        encryptionStatus: {
          encrypted: stats.encryptedCount,
          unencrypted: stats.unencryptedCount,
          partial: Math.floor(Math.random() * 5),
        },
        regulationCompliance,
        recommendations,
        dataMap,
      };

      setResult(finalResult);
      setIsScanning(false);
      setScanComplete(true);
      setCurrentPhase("Scan complete");
      addEvent(
        "complete",
        "Privacy scan completed",
        `Found ${totalFindings} sensitive data locations`
      );
    },
    [addEvent, addFinding, findings, stats]
  );

  const handleReset = useCallback(() => {
    setScanComplete(false);
    setResult(null);
    setFindings([]);
    setEvents([]);
    setSourceProgress([]);
    setOverallProgress(0);
    setCurrentPhase("");
    setStats({
      totalRecords: 0,
      totalFindings: 0,
      piiCount: 0,
      phiCount: 0,
      pciCount: 0,
      encryptedCount: 0,
      unencryptedCount: 0,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <a
              href="https://maula.ai"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-green-400 hover:text-white bg-green-900/50 hover:bg-green-800/50 rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              MAULA.AI
            </a>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
              <span className="text-xs text-green-500">
                {apiConnected ? 'API Connected' : 'Simulation Mode'}
              </span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-100 mb-2">
              🛡️ DataGuardian
            </h1>
            <p className="text-green-400/70">
              AI-Powered Data Privacy & Protection Platform
            </p>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-950/50 rounded-xl p-1 flex gap-1 border border-green-800/30">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'dsr', label: '📝 DSR Management', icon: '📝' },
              { id: 'consent', label: '✅ Consent', icon: '✅' },
              { id: 'retention', label: '📁 Retention', icon: '📁' },
              { id: 'scanner', label: '🔍 PII Scanner', icon: '🔍' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-green-400 hover:bg-green-800/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
            {/* Compliance Score */}
            <div className="bg-green-950/50 rounded-2xl border border-green-800/30 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-green-100 mb-1">Privacy Compliance Score</h2>
                  <p className="text-green-500/70 text-sm">Overall privacy health across your organization</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-400">{complianceScore.toFixed(1)}%</div>
                  <div className={`text-sm ${complianceScore >= 90 ? 'text-green-400' : complianceScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {complianceScore >= 90 ? 'Excellent' : complianceScore >= 70 ? 'Good' : 'Needs Attention'}
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-green-900/30 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    complianceScore >= 90 ? 'bg-green-500' : complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${complianceScore}%` }}
                ></div>
              </div>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* DSR Overview */}
              <div className="bg-green-950/50 rounded-2xl border border-green-800/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📝</span>
                  <h3 className="text-lg font-semibold text-green-100">Data Subject Requests</h3>
                </div>
                {dsrDashboard ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-400/70">Total DSRs</span>
                      <span className="text-xl font-bold text-green-300">{dsrDashboard.overview.total}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-yellow-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-yellow-400">{dsrDashboard.overview.pending}</div>
                        <div className="text-xs text-yellow-500/70">Pending</div>
                      </div>
                      <div className="bg-blue-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-blue-400">{dsrDashboard.overview.inProgress}</div>
                        <div className="text-xs text-blue-500/70">In Progress</div>
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-green-400">{dsrDashboard.overview.completed}</div>
                        <div className="text-xs text-green-500/70">Completed</div>
                      </div>
                      <div className="bg-red-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-red-400">{dsrDashboard.overview.overdue}</div>
                        <div className="text-xs text-red-500/70">Overdue</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-green-800/30">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500/70">Compliance Rate</span>
                        <span className="text-green-400 font-medium">{dsrDashboard.complianceRate}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-green-800/30 rounded"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 bg-green-800/30 rounded"></div>
                      <div className="h-16 bg-green-800/30 rounded"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Consent Overview */}
              <div className="bg-green-950/50 rounded-2xl border border-green-800/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-semibold text-green-100">Consent Management</h3>
                </div>
                {consentDashboard ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-400/70">Total Consents</span>
                      <span className="text-xl font-bold text-green-300">{consentDashboard.overview.total.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-green-400">{consentDashboard.overview.granted.toLocaleString()}</div>
                        <div className="text-xs text-green-500/70">Granted</div>
                      </div>
                      <div className="bg-red-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-red-400">{consentDashboard.overview.denied.toLocaleString()}</div>
                        <div className="text-xs text-red-500/70">Denied</div>
                      </div>
                      <div className="bg-orange-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-orange-400">{consentDashboard.overview.withdrawn}</div>
                        <div className="text-xs text-orange-500/70">Withdrawn</div>
                      </div>
                      <div className="bg-gray-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-gray-400">{consentDashboard.overview.expired}</div>
                        <div className="text-xs text-gray-500/70">Expired</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-green-800/30">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500/70">Consent Rate</span>
                        <span className="text-green-400 font-medium">{consentDashboard.consentRate}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-green-800/30 rounded"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 bg-green-800/30 rounded"></div>
                      <div className="h-16 bg-green-800/30 rounded"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Retention Overview */}
              <div className="bg-green-950/50 rounded-2xl border border-green-800/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📁</span>
                  <h3 className="text-lg font-semibold text-green-100">Data Retention</h3>
                </div>
                {retentionDashboard ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-400/70">Active Policies</span>
                      <span className="text-xl font-bold text-green-300">{retentionDashboard.overview.activePolicies}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-blue-400">{(retentionDashboard.overview.recordsManaged / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-blue-500/70">Records Managed</div>
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-green-400">{(retentionDashboard.overview.recordsDisposed / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-green-500/70">Disposed</div>
                      </div>
                      <div className="bg-yellow-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-yellow-400">{retentionDashboard.pendingApprovals}</div>
                        <div className="text-xs text-yellow-500/70">Pending Approval</div>
                      </div>
                      <div className="bg-purple-900/20 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-purple-400">{retentionDashboard.overview.legalHoldActive}</div>
                        <div className="text-xs text-purple-500/70">Legal Holds</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-green-800/30">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500/70">Compliance Rate</span>
                        <span className="text-green-400 font-medium">{retentionDashboard.complianceRate}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-green-800/30 rounded"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 bg-green-800/30 rounded"></div>
                      <div className="h-16 bg-green-800/30 rounded"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-green-950/50 rounded-2xl border border-green-800/30 p-6">
              <h3 className="text-lg font-semibold text-green-100 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('dsr')}
                  className="p-4 bg-green-900/30 rounded-xl hover:bg-green-800/40 transition-colors text-left"
                >
                  <span className="text-2xl mb-2 block">📝</span>
                  <span className="text-green-200 font-medium">New DSR</span>
                  <p className="text-xs text-green-500/70 mt-1">Create data subject request</p>
                </button>
                <button 
                  onClick={() => setActiveTab('scanner')}
                  className="p-4 bg-green-900/30 rounded-xl hover:bg-green-800/40 transition-colors text-left"
                >
                  <span className="text-2xl mb-2 block">🔍</span>
                  <span className="text-green-200 font-medium">PII Scan</span>
                  <p className="text-xs text-green-500/70 mt-1">Scan for sensitive data</p>
                </button>
                <button 
                  onClick={handlePIA}
                  disabled={isPIARunning}
                  className="p-4 bg-green-900/30 rounded-xl hover:bg-green-800/40 transition-colors text-left disabled:opacity-50"
                >
                  <span className="text-2xl mb-2 block">📋</span>
                  <span className="text-green-200 font-medium">Run PIA</span>
                  <p className="text-xs text-green-500/70 mt-1">Privacy Impact Assessment</p>
                </button>
                <button 
                  onClick={loadUnifiedDashboard}
                  disabled={isLoadingDashboard}
                  className="p-4 bg-green-900/30 rounded-xl hover:bg-green-800/40 transition-colors text-left disabled:opacity-50"
                >
                  <span className="text-2xl mb-2 block">🔄</span>
                  <span className="text-green-200 font-medium">Refresh</span>
                  <p className="text-xs text-green-500/70 mt-1">Update all dashboards</p>
                </button>
              </div>
            </div>

            {/* PIA Result Modal */}
            {piaResult && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-green-950 rounded-2xl border border-green-800/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-green-100">Privacy Impact Assessment</h3>
                    <button onClick={() => setPiaResult(null)} className="text-green-500 hover:text-green-300">✕</button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        piaResult.riskLevel === 'low' ? 'bg-green-900 text-green-400' :
                        piaResult.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-400' :
                        piaResult.riskLevel === 'high' ? 'bg-orange-900 text-orange-400' :
                        'bg-red-900 text-red-400'
                      }`}>
                        {piaResult.riskScore}
                      </div>
                      <div>
                        <div className="text-green-200 font-medium">{piaResult.projectName}</div>
                        <div className={`text-sm ${
                          piaResult.riskLevel === 'low' ? 'text-green-400' :
                          piaResult.riskLevel === 'medium' ? 'text-yellow-400' :
                          piaResult.riskLevel === 'high' ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {piaResult.riskLevel.toUpperCase()} RISK
                        </div>
                        {piaResult.dpiaRequired && (
                          <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded mt-1 inline-block">DPIA Required</span>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-green-800/30 pt-4">
                      <h4 className="text-green-200 font-medium mb-2">Findings</h4>
                      <div className="space-y-2">
                        {piaResult.findings.map((finding, i) => (
                          <div key={i} className="bg-green-900/20 rounded-lg p-3">
                            <div className="text-green-300 font-medium">{finding.area}</div>
                            <p className="text-sm text-green-400/70 mt-1">{finding.finding}</p>
                            <div className="mt-2 flex gap-2 text-xs">
                              <span className="bg-red-900/30 text-red-400 px-2 py-0.5 rounded">{finding.risk}</span>
                            </div>
                            <p className="text-xs text-green-500 mt-2">💡 {finding.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DSR Tab */}
        {activeTab === 'dsr' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-green-950/50 rounded-2xl border border-green-800/30 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-green-100">Data Subject Requests</h2>
                <div className="flex gap-3">
                  <button
                    onClick={loadDSRList}
                    disabled={isLoadingDSR}
                    className="px-4 py-2 bg-green-800/50 text-green-300 rounded-lg hover:bg-green-700/50 transition-colors disabled:opacity-50"
                  >
                    {isLoadingDSR ? 'Loading...' : '🔄 Refresh'}
                  </button>
                  <button
                    onClick={() => setShowDSRForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                  >
                    + New DSR
                  </button>
                </div>
              </div>

              {/* DSR Form Modal */}
              {showDSRForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-green-950 rounded-2xl border border-green-800/30 p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold text-green-100 mb-4">Create Data Subject Request</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-green-400 mb-1">Request Type</label>
                        <select
                          value={dsrFormData.type}
                          onChange={(e) => setDsrFormData(prev => ({ ...prev, type: e.target.value as DSRType }))}
                          className="w-full bg-green-900/50 border border-green-700 rounded-lg px-3 py-2 text-green-200"
                        >
                          <option value="access">Access Request</option>
                          <option value="erasure">Erasure (Right to be Forgotten)</option>
                          <option value="portability">Data Portability</option>
                          <option value="rectification">Rectification</option>
                          <option value="restriction">Processing Restriction</option>
                          <option value="objection">Objection</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-green-400 mb-1">Subject Email</label>
                        <input
                          type="email"
                          value={dsrFormData.email}
                          onChange={(e) => setDsrFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="user@example.com"
                          className="w-full bg-green-900/50 border border-green-700 rounded-lg px-3 py-2 text-green-200 placeholder-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-green-400 mb-1">Subject Name</label>
                        <input
                          type="text"
                          value={dsrFormData.name}
                          onChange={(e) => setDsrFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          className="w-full bg-green-900/50 border border-green-700 rounded-lg px-3 py-2 text-green-200 placeholder-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-green-400 mb-1">Regulation</label>
                        <select
                          value={dsrFormData.regulation}
                          onChange={(e) => setDsrFormData(prev => ({ ...prev, regulation: e.target.value as Regulation }))}
                          className="w-full bg-green-900/50 border border-green-700 rounded-lg px-3 py-2 text-green-200"
                        >
                          <option value="GDPR">GDPR</option>
                          <option value="CCPA">CCPA</option>
                          <option value="LGPD">LGPD</option>
                          <option value="PIPEDA">PIPEDA</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowDSRForm(false)}
                          className="flex-1 px-4 py-2 bg-green-800/50 text-green-300 rounded-lg hover:bg-green-700/50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateDSR}
                          disabled={!dsrFormData.email}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50"
                        >
                          Create DSR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DSR List */}
              <div className="space-y-3">
                {dsrList.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-green-500/70 mb-4">No DSRs found. Click "Load DSRs" or create a new one.</p>
                    <button
                      onClick={loadDSRList}
                      className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600"
                    >
                      Load DSRs
                    </button>
                  </div>
                ) : (
                  dsrList.map((dsr) => (
                    <div key={dsr.requestId} className="bg-green-900/20 rounded-xl p-4 border border-green-800/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-200 font-medium">{dsr.requestId}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              dsr.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                              dsr.status === 'in-progress' ? 'bg-blue-900/50 text-blue-400' :
                              dsr.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-gray-900/50 text-gray-400'
                            }`}>
                              {dsr.status}
                            </span>
                            <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded">
                              {dsr.type}
                            </span>
                          </div>
                          <p className="text-sm text-green-400/70 mt-1">{dsr.dataSubject.email}</p>
                          <p className="text-xs text-green-500/50 mt-1">
                            Regulation: {dsr.regulation} | Due: {new Date(dsr.timeline.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {dsr.daysRemaining !== undefined && (
                            <span className={`text-sm ${dsr.daysRemaining <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                              {dsr.daysRemaining} days left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Data Discovery Section */}
            <div className="bg-green-950/50 rounded-2xl border border-green-800/30 p-6">
              <h3 className="text-lg font-semibold text-green-100 mb-4">Data Discovery</h3>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={discoveryEmail}
                  onChange={(e) => setDiscoveryEmail(e.target.value)}
                  placeholder="Enter email or identifier to search..."
                  className="flex-1 bg-green-900/50 border border-green-700 rounded-lg px-4 py-2 text-green-200 placeholder-green-600"
                />
                <button
                  onClick={handleDataDiscovery}
                  disabled={!discoveryEmail || isDiscovering}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50"
                >
                  {isDiscovering ? 'Searching...' : '🔍 Discover'}
                </button>
              </div>

              {discoveryResult && (
                <div className="bg-green-900/20 rounded-xl p-4 border border-green-800/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-200 font-medium">Results for: {discoveryResult.query}</span>
                    <span className="text-xs text-green-500">{discoveryResult.systemsSearched} systems searched</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{discoveryResult.recordsFound}</div>
                      <div className="text-xs text-green-500/70">Records Found</div>
                    </div>
                    <div className="text-center p-3 bg-green-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{discoveryResult.categories.length}</div>
                      <div className="text-xs text-green-500/70">Data Categories</div>
                    </div>
                    <div className="text-center p-3 bg-green-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">{discoveryResult.sensitiveData.length}</div>
                      <div className="text-xs text-yellow-500/70">Sensitive Findings</div>
                    </div>
                  </div>
                  {discoveryResult.recommendations.length > 0 && (
                    <div className="border-t border-green-800/30 pt-3">
                      <p className="text-sm text-green-400 font-medium mb-2">Recommendations:</p>
                      <ul className="text-xs text-green-500/70 space-y-1">
                        {discoveryResult.recommendations.map((rec, i) => (
                          <li key={i}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Consent Tab - Placeholder */}
        {activeTab === 'consent' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-green-950/50 rounded-2xl border border-green-800/30 p-6">
              <h2 className="text-xl font-semibold text-green-100 mb-6">Consent Management</h2>
              {consentDashboard && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-900/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{consentDashboard.overview.total.toLocaleString()}</div>
                    <div className="text-sm text-green-500/70">Total Consents</div>
                  </div>
                  <div className="bg-green-900/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{consentDashboard.consentRate}%</div>
                    <div className="text-sm text-green-500/70">Consent Rate</div>
                  </div>
                  <div className="bg-yellow-900/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{consentDashboard.expiringThisMonth}</div>
                    <div className="text-sm text-yellow-500/70">Expiring Soon</div>
                  </div>
                  <div className="bg-red-900/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-red-400">{consentDashboard.overview.withdrawn}</div>
                    <div className="text-sm text-red-500/70">Withdrawn</div>
                  </div>
                </div>
              )}
              <div className="text-center py-8 text-green-500/70">
                <p>Consent preference center and detailed management coming soon.</p>
                <p className="text-sm mt-2">Use the API at /consent/* endpoints for full functionality.</p>
              </div>
            </div>
          </div>
        )}

        {/* Retention Tab - Placeholder */}
        {activeTab === 'retention' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-green-950/50 rounded-2xl border border-green-800/30 p-6">
              <h2 className="text-xl font-semibold text-green-100 mb-6">Data Retention Policies</h2>
              {retentionDashboard && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-900/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{retentionDashboard.overview.activePolicies}</div>
                    <div className="text-sm text-green-500/70">Active Policies</div>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">{(retentionDashboard.overview.recordsManaged / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-blue-500/70">Records Managed</div>
                  </div>
                  <div className="bg-purple-900/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400">{retentionDashboard.overview.legalHoldActive}</div>
                    <div className="text-sm text-purple-500/70">Legal Holds</div>
                  </div>
                  <div className="bg-yellow-900/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{retentionDashboard.pendingApprovals}</div>
                    <div className="text-sm text-yellow-500/70">Pending Approvals</div>
                  </div>
                </div>
              )}
              <div className="text-center py-8 text-green-500/70">
                <p>Retention policy management and legal hold controls coming soon.</p>
                <p className="text-sm mt-2">Use the API at /retention/* endpoints for full functionality.</p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Tab (Original) */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left Column - Form */}
            <div className="lg:col-span-1">
              <div className="bg-green-950/50 backdrop-blur-sm rounded-2xl border border-green-800/30 p-6">
                <DataGuardianForm onSubmit={runScan} isScanning={isScanning} />
              </div>
            </div>

            {/* Middle Column - Live Panel */}
            <div className="lg:col-span-1">
              <LiveDataGuardianPanel
                isScanning={isScanning}
                currentPhase={currentPhase}
                overallProgress={overallProgress}
                sourceProgress={sourceProgress}
                findings={findings}
                events={events}
                stats={stats}
              />
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-1">
              {scanComplete && result ? (
                <AnimatedDataGuardianResult
                  result={result}
                  onReset={handleReset}
                />
              ) : (
                <div className="bg-green-950/30 rounded-2xl border border-green-800/30 p-8 h-full flex flex-col items-center justify-center text-center">
                  <div className="shield-container mb-6">
                    <div className="w-20 h-20 rounded-full bg-green-900/30 flex items-center justify-center">
                      <span className="text-4xl">🛡️</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-green-200 mb-2">
                    Privacy Analysis Results
                  </h3>
                  <p className="text-green-500/70 max-w-xs">
                    Configure your data sources and start a scan to discover and
                    protect sensitive data across your organization.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
                    <div className="p-3 bg-green-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-400">6</p>
                      <p className="text-xs text-green-500">Data Types</p>
                    </div>
                    <div className="p-3 bg-green-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-400">8</p>
                      <p className="text-xs text-green-500">Regulations</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 text-green-600 text-sm">
          Part of VictoryKit Security Suite • DataGuardian v2.0
        </footer>
      </div>
    </div>
  );
};

export default DataGuardianTool;
