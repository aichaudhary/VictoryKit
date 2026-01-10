export type Sender = "YOU" | "AGENT" | "SYSTEM";

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  isImage?: boolean;
  groundingUrls?: string[];
}

export interface ChatSession {
  id: string;
  name: string;
  active: boolean;
  messages: Message[];
  settings: SettingsState;
}

export type NeuralTool =
  | "none"
  | "image_gen"
  | "thinking"
  | "deep_research"
  | "shopping"
  | "study"
  | "web_search"
  | "canvas"
  | "quizzes"
  | "browser";

export type WorkspaceMode = "CHAT" | "PORTAL" | "CANVAS";

export interface CanvasState {
  content: string;
  type: "text" | "code" | "html" | "video" | "image";
  language?: string;
  title: string;
}

export interface SettingsState {
  customPrompt: string;
  agentName: string;
  temperature: number;
  maxTokens: number;
  provider: string;
  model: string;
  activeTool: NeuralTool;
  workspaceMode: WorkspaceMode;
  portalUrl: string;
  canvas: CanvasState;
}

export interface NavItem {
  label: string;
  icon: string;
  tool: NeuralTool;
  description: string;
}

// ============================================================================
// DarkWebMonitor Specific Types - Threat Intelligence Gathering
// ============================================================================

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type SourceType =
  | "osint"
  | "darkweb"
  | "social_media"
  | "threat_feed"
  | "honeypot"
  | "ioc"
  | "other";
export type ThreatType =
  | "malware"
  | "phishing"
  | "ransomware"
  | "apt"
  | "botnet"
  | "exploit"
  | "vulnerability"
  | "data_leak"
  | "other";
export type AnalysisType =
  | "threat_landscape"
  | "actor_profile"
  | "campaign_analysis"
  | "ioc_correlation"
  | "trend_analysis";

export interface ThreatIndicators {
  ips: string[];
  domains: string[];
  urls: string[];
  hashes: string[];
  emails: string[];
  fileNames: string[];
}

export interface ThreatSource {
  name: string;
  url: string;
  reliability: string;
  timestamp: string;
}

export interface MLPrediction {
  severity: SeverityLevel;
  confidence: number;
  categories: string[];
  anomalyScore: number;
}

export interface ThreatIntel {
  _id?: string;
  intelId: string;
  sourceType: SourceType;
  threatType: ThreatType;
  severity: SeverityLevel;
  confidenceScore: number;
  title: string;
  description: string;
  indicators: ThreatIndicators;
  targetSectors: string[];
  targetCountries: string[];
  attackVectors: string[];
  mitreTactics: string[];
  mitreTechniques: string[];
  sources: ThreatSource[];
  relatedThreats: string[];
  mlPrediction?: MLPrediction;
  status: "active" | "resolved" | "monitoring" | "archived";
  firstSeen: string;
  lastSeen: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TopThreat {
  intelId: string;
  title: string;
  severity: SeverityLevel;
  confidence: number;
  threatType: ThreatType;
}

export interface TrendData {
  period: string;
  count: number;
  severity: SeverityLevel;
  threatType: ThreatType;
}

export interface CorrelationData {
  indicator: string;
  indicatorType: string;
  relatedThreats: number;
  confidence: number;
}

export interface InsightData {
  type: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  recommendations: string[];
}

export interface ThreatAnalysis {
  _id?: string;
  analysisId: string;
  analysisType: AnalysisType;
  timeRange: {
    start: string;
    end: string;
  };
  filters?: {
    threatTypes: ThreatType[];
    severities: SeverityLevel[];
    sources: SourceType[];
    targetSectors: string[];
    targetCountries: string[];
  };
  totalThreats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  threatDistribution: Record<string, number>;
  topThreats: TopThreat[];
  trends: TrendData[];
  correlations: CorrelationData[];
  insights: InsightData[];
  status: "pending" | "processing" | "completed" | "failed";
  createdAt?: string;
  completedAt?: string;
}

export interface ThreatReport {
  _id?: string;
  reportId: string;
  reportType:
    | "executive_summary"
    | "technical_deep_dive"
    | "ioc_report"
    | "campaign_report"
    | "custom";
  title: string;
  summary: string;
  sections: ReportSection[];
  relatedThreats: string[];
  relatedAnalyses: string[];
  status: "draft" | "review" | "published" | "archived";
  generatedAt?: string;
  publishedAt?: string;
}

export interface ReportSection {
  title: string;
  content: string;
  order: number;
  charts?: any[];
  tables?: any[];
}

export interface IntelStatistics {
  totalThreats: number;
  activeThreats: number;
  resolvedThreats: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  threatsByType: Record<ThreatType, number>;
  threatsBySource: Record<SourceType, number>;
  recentActivity: {
    date: string;
    newThreats: number;
    resolvedThreats: number;
  }[];
  topIndicators: {
    type: string;
    value: string;
    occurrences: number;
  }[];
}

export interface SearchFilters {
  threatTypes?: ThreatType[];
  severities?: SeverityLevel[];
  sourceTypes?: SourceType[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  status?: string[];
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
