// DRPlan Constants

export const API_BASE_URL = 'https://dplan.maula.ai/api';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'plans', label: 'Recovery Plans', icon: 'FileText' },
  { id: 'systems', label: 'Critical Systems', icon: 'Server' },
  { id: 'sites', label: 'Recovery Sites', icon: 'Building2' },
  { id: 'runbooks', label: 'Runbooks', icon: 'BookOpen' },
  { id: 'tests', label: 'DR Tests', icon: 'FlaskConical' },
  { id: 'contacts', label: 'Contacts', icon: 'Users' },
  { id: 'incidents', label: 'Incidents', icon: 'AlertTriangle' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export const DEFAULT_SETTINGS = {
  notifications: true,
  autoBackup: true,
  testReminders: true,
  theme: 'dark' as const,
};

export const PLAN_STATUS_COLORS = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  archived: 'bg-slate-500',
  under_review: 'bg-yellow-500',
};

export const SYSTEM_STATUS_COLORS = {
  operational: 'bg-green-500',
  degraded: 'bg-yellow-500',
  failed: 'bg-red-500',
  recovering: 'bg-blue-500',
};

export const SITE_TYPE_COLORS = {
  primary: 'bg-blue-500',
  hot: 'bg-green-500',
  warm: 'bg-yellow-500',
  cold: 'bg-slate-500',
  cloud: 'bg-purple-500',
};

export const SEVERITY_COLORS = {
  critical: 'bg-red-500 text-white',
  major: 'bg-orange-500 text-white',
  minor: 'bg-yellow-500 text-black',
  warning: 'bg-blue-500 text-white',
};

export const TIER_LABELS = {
  1: 'Mission Critical',
  2: 'Business Critical',
  3: 'Business Operational',
  4: 'Administrative',
};

export const TEST_TYPE_LABELS = {
  tabletop: 'Tabletop Exercise',
  walkthrough: 'Walkthrough',
  simulation: 'Simulation',
  parallel: 'Parallel Processing',
  full_interruption: 'Full Interruption',
};

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h`;
};

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getReadinessColor = (score: number): string => {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
};

// Default Settings
export const DEFAULT_SETTINGS: SettingsState = {
  notifications: true,
  emailAlerts: true,
  autoRefresh: true,
  refreshInterval: 30,
  theme: 'dark',
};

import { SettingsState } from './types';
