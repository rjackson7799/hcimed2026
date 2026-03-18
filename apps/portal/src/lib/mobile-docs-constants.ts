/**
 * Mobile Docs Health Dashboard — Constants
 * Colors, thresholds, tab config, and labels.
 * Hex values map to Tailwind equivalents: blue-500, emerald-400, violet-400, pink-400, amber-400
 */

import type { FacilityType } from '@/types/mobile-docs';

export const FACILITY_TYPE_COLORS = {
  SNF: { bg: '#1e3a5f', text: '#60a5fa', fill: '#3b82f6' },              // blue
  'Board & Care': { bg: '#1a3a2e', text: '#34d399', fill: '#34d399' },    // emerald
  Homebound: { bg: '#2d2545', text: '#a78bfa', fill: '#a78bfa' },         // violet
} as const;

export const PIPELINE_STATUS_COLORS = {
  Prospecting: { bg: '#3b2f1a', text: '#fbbf24', fill: '#fbbf24' },       // amber
  Onboarding: { bg: '#1e3a5f', text: '#60a5fa', fill: '#60a5fa' },        // blue
  Active: { bg: '#1a3a2e', text: '#34d399', fill: '#34d399' },            // emerald
  Inactive: { bg: '#1e293b', text: '#64748b', fill: '#475569' },          // slate
} as const;

export const PENETRATION_THRESHOLDS = {
  high: { min: 50, color: '#34d399' },   // emerald-400
  medium: { min: 20, color: '#3b82f6' }, // blue-500
  low: { min: 0, color: '#fbbf24' },     // amber-400
} as const;

export const CADENCE_WINDOWS: Record<string, number> = {
  Weekly: 7,
  Biweekly: 14,
  Monthly: 30,
  Quarterly: 90,
  'As Needed': Infinity,
  TBD: Infinity,
};

export const MOBILE_DOCS_TABS = [
  { id: 'directory', label: 'Directory' },
  { id: 'growth', label: 'Growth & Pipeline' },
  { id: 'operations', label: 'Operations & Coverage' },
  { id: 'map', label: 'Map' },
] as const;

export type MobileDocsTabId = typeof MOBILE_DOCS_TABS[number]['id'];

export const ANCILLARY_COLORS = {
  ccm: '#a78bfa', // violet-400
  rpm: '#f472b6', // pink-400
  awv: '#fbbf24', // amber-400
} as const;

export const FACILITY_STATUS_DOT_COLORS: Record<string, string> = {
  Prospecting: 'bg-amber-400',
  Onboarding: 'bg-blue-400',
  Active: 'bg-emerald-400',
  Inactive: 'bg-slate-500',
};

export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A\u2013Z' },
  { value: 'name-desc', label: 'Name Z\u2013A' },
  { value: 'patients-desc', label: 'Most Patients' },
  { value: 'distance-asc', label: 'Nearest First' },
  { value: 'updated_at-desc', label: 'Recently Updated' },
] as const;

export const NOTE_TYPE_COLORS: Record<string, string> = {
  General: 'bg-slate-600 text-slate-200',
  'Visit Summary': 'bg-teal-700 text-teal-200',
  Outreach: 'bg-amber-700 text-amber-200',
  Partnership: 'bg-blue-700 text-blue-200',
  Clinical: 'bg-teal-700 text-teal-200',
  Administrative: 'bg-indigo-700 text-indigo-200',
};

/* ── Map Constants ── */

export const HCI_BASE_LOCATION = {
  latitude: 34.1478,
  longitude: -118.1445,
  name: 'HCI Medical Group',
  zip: '91101',
} as const;

/** 25-mile service radius in meters (25 × 1609.34) */
export const SERVICE_RADIUS_METERS = 40_233;

/** Pin colors by facility type — from PRD §9.2 */
export const MAP_PIN_COLORS: Record<FacilityType, string> = {
  SNF: '#0f4c75',
  'Board & Care': '#1a7a5c',
  Homebound: '#7c5cbf',
};

/** Pin radius scale: maps active patient count to pixel radius */
export const MAP_PIN_SIZE = {
  min: 6,
  max: 18,
  maxPatients: 22,
} as const;

export const ALERT_SEVERITY_CONFIG = {
  critical: { bgClass: 'bg-red-950/50', borderClass: 'border-red-900', textClass: 'text-red-300', iconClass: 'text-red-400' },
  warning: { bgClass: 'bg-amber-950/50', borderClass: 'border-amber-900', textClass: 'text-amber-300', iconClass: 'text-amber-400' },
  info: { bgClass: 'bg-blue-950/50', borderClass: 'border-blue-900', textClass: 'text-blue-300', iconClass: 'text-blue-400' },
} as const;
