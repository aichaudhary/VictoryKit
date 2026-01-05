// DRPlan Types - Disaster Recovery Planning Tool

export interface RecoveryPlan {
  _id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'archived' | 'under_review';
  priority: 'critical' | 'high' | 'medium' | 'low';
  scope: string[];
  objectives: {
    rto: number; // Recovery Time Objective in minutes
    rpo: number; // Recovery Point Objective in minutes
    mtpd: number; // Maximum Tolerable Period of Disruption
  };
  owner: string;
  approvers: string[];
  lastTestedAt?: Date;
  nextTestDate?: Date;
  systems: string[];
  sites: string[];
  runbooks: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecoverySite {
  _id: string;
  name: string;
  type: 'primary' | 'hot' | 'warm' | 'cold' | 'cloud';
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  status: 'active' | 'standby' | 'maintenance' | 'offline';
  capacity: {
    servers: number;
    storage: string;
    bandwidth: string;
  };
  failoverTime: number; // minutes
  lastFailoverTest?: Date;
  contacts: string[];
  systems: string[];
  createdAt: Date;
}

export interface CriticalSystem {
  _id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3 | 4;
  category: 'infrastructure' | 'application' | 'database' | 'network' | 'security' | 'communication';
  status: 'operational' | 'degraded' | 'failed' | 'recovering';
  rto: number;
  rpo: number;
  dependencies: string[];
  owner: string;
  primarySite: string;
  recoverySite: string;
  recoveryProcedure: string;
  lastBackup?: Date;
  healthScore: number;
  createdAt: Date;
}

export interface Runbook {
  _id: string;
  name: string;
  description: string;
  type: 'failover' | 'failback' | 'recovery' | 'backup' | 'test' | 'communication';
  system: string;
  status: 'draft' | 'approved' | 'deprecated';
  steps: RunbookStep[];
  estimatedTime: number;
  prerequisites: string[];
  owner: string;
  lastExecuted?: Date;
  executionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RunbookStep {
  order: number;
  title: string;
  description: string;
  responsible: string;
  estimatedTime: number;
  isAutomated: boolean;
  command?: string;
  verificationSteps: string[];
  rollbackSteps: string[];
}

export interface DRTest {
  _id: string;
  name: string;
  type: 'tabletop' | 'walkthrough' | 'simulation' | 'parallel' | 'full_interruption';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  plan: string;
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  participants: string[];
  systems: string[];
  objectives: string[];
  results?: {
    rtoAchieved: number;
    rpoAchieved: number;
    successRate: number;
    issues: string[];
    recommendations: string[];
  };
  createdAt: Date;
}

export interface EmergencyContact {
  _id: string;
  name: string;
  role: string;
  team: string;
  priority: number;
  phone: string;
  email: string;
  alternatePhone?: string;
  availability: string;
  escalationLevel: 1 | 2 | 3 | 4;
  skills: string[];
  isOnCall: boolean;
  createdAt: Date;
}

export interface DRIncident {
  _id: string;
  title: string;
  description: string;
  type: 'disaster' | 'outage' | 'degradation' | 'test' | 'drill';
  severity: 'critical' | 'major' | 'minor' | 'warning';
  status: 'declared' | 'responding' | 'recovering' | 'resolved' | 'post_mortem';
  affectedSystems: string[];
  affectedSites: string[];
  activatedPlans: string[];
  timeline: {
    declaredAt: Date;
    respondedAt?: Date;
    recoveredAt?: Date;
    resolvedAt?: Date;
  };
  commander: string;
  team: string[];
  updates: IncidentUpdate[];
  createdAt: Date;
}

export interface IncidentUpdate {
  timestamp: Date;
  author: string;
  message: string;
  type: 'status' | 'action' | 'escalation' | 'resolution';
}

export interface DashboardStats {
  totalPlans: number;
  activePlans: number;
  totalSystems: number;
  criticalSystems: number;
  systemsAtRisk: number;
  upcomingTests: number;
  overdueTests: number;
  activeIncidents: number;
  avgRTO: number;
  avgRPO: number;
  lastTestDate?: Date;
  overallReadiness: number;
}

export type Tab = 'dashboard' | 'plans' | 'systems' | 'sites' | 'runbooks' | 'tests' | 'contacts' | 'incidents' | 'reports' | 'settings';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface SettingsState {
  notifications: boolean;
  autoBackup: boolean;
  testReminders: boolean;
  theme: 'light' | 'dark' | 'system';
}
