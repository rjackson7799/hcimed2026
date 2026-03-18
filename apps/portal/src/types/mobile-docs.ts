/**
 * Mobile Docs Health Dashboard — Type Definitions
 * Types for the executive health monitoring dashboard.
 */

export type FacilityType = 'SNF' | 'Board & Care' | 'Homebound';
export type FacilityStatus = 'Prospecting' | 'Onboarding' | 'Active' | 'Inactive';
export type VisitCadence = 'Weekly' | 'Biweekly' | 'Monthly' | 'Quarterly' | 'As Needed' | 'TBD';

// Structurally identical to the return type of formatTrend() in practice-health-formatters.ts
export interface TrendData {
  direction: 'up' | 'down' | 'flat';
  percentage: number;
  label: string;
}

export interface MobileDocsKpi {
  monthlyRevenue: number;
  revenuePerVisit: number;
  activeFacilities: number;
  totalPatients: number;
  pipelineCount: number;
  pipelineBreakdown: { prospecting: number; onboarding: number };
  trends: {
    revenue: TrendData;
    revenuePerVisit: TrendData;
    facilities: TrendData;
    patients: TrendData;
  };
}

export interface FacilityRevenue {
  facilityId: string;
  name: string;
  type: FacilityType;
  activePatients: number;
  visits: number;
  monthlyCharges: number;
  revenuePerVisit: number;
  trend: TrendData;
}

export interface RevenueTrendPoint {
  date: string;
  charges: number;
}

export interface AncillaryRevenue {
  ccm: number;
  rpm: number;
  awv: number;
}

export interface PipelineStage {
  stage: FacilityStatus;
  count: number;
  facilities: string[];
}

export interface PipelineMetrics {
  conversionRate: number;
  avgDaysToActive: number;
}

export interface PipelineTransition {
  date: string;
  facilityName: string;
  fromStatus: FacilityStatus | null;
  toStatus: FacilityStatus;
  reason: string;
}

export interface FacilityMix {
  type: FacilityType;
  count: number;
  percentage: number;
}

export interface FacilityGrowthPoint {
  date: string;
  active: number;
  total: number;
}

export interface PenetrationData {
  facilityId: string;
  name: string;
  activePatients: number;
  totalBeds: number;
  penetrationRate: number;
}

export interface CensusTrendPoint {
  date: string;
  totalPatients: number;
}

export interface EnrollmentSummary {
  ccmEnrolled: number;
  rpmEnrolled: number;
  awvEligible: number;
  totalPatients: number;
}

export interface CadenceStatus {
  facilityId: string;
  name: string;
  cadence: VisitCadence;
  lastVisitDate: string;
  daysOverdue: number;
  status: 'on_track' | 'due_soon' | 'overdue';
}

export interface AttentionAlert {
  type: 'missed_cadence' | 'low_penetration' | 'stale_census' | 'pipeline_stalled';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  facilityName?: string;
}

// ─── Database Enum Types ────────────────────────────────────────

export type ContactRole = 'DON' | 'Administrator' | 'Owner' | 'Discharge Planner' | 'Social Worker' | 'Caregiver' | 'MA Plan Coordinator' | 'Other';
export type ContactType = 'Administrative' | 'Clinical' | 'Caregiver' | 'Referral';
export type NoteType = 'General' | 'Visit Summary' | 'Outreach' | 'Partnership' | 'Clinical' | 'Administrative';

// ─── Database Row Types ─────────────────────────────────────────

export interface Facility {
  id: string;
  tenant_id: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  total_beds: number | null;
  pos_code: number | null;
  distance_miles: number | null;
  drive_minutes: number | null;
  visit_cadence: VisitCadence;
  assigned_provider_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacilityContact {
  id: string;
  facility_id: string;
  name: string;
  role: ContactRole;
  title: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
  contact_type: ContactType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FacilityNote {
  id: string;
  facility_id: string;
  author_id: string;
  author_name: string;
  note_type: NoteType;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface FacilityCensus {
  id: string;
  facility_id: string;
  snapshot_date: string;
  active_patients: number;
  new_admissions: number;
  discharges: number;
  ccm_enrolled: number;
  rpm_enrolled: number;
  awv_eligible: number;
  updated_by: string;
}

export interface FacilityPipelineEntry {
  id: string;
  facility_id: string;
  from_status: FacilityStatus | null;
  to_status: FacilityStatus;
  changed_by: string;
  change_reason: string | null;
  changed_at: string;
}
