/**
 * Mobile Docs Health Dashboard — Mock Data
 * Realistic mock data using the canonical facility roster from the design spec.
 * All functions are designed to match the hook return interfaces.
 */

import type {
  MobileDocsKpi,
  FacilityRevenue,
  RevenueTrendPoint,
  AncillaryRevenue,
  PipelineStage,
  PipelineMetrics,
  PipelineTransition,
  FacilityMix,
  FacilityGrowthPoint,
  PenetrationData,
  CensusTrendPoint,
  EnrollmentSummary,
  CadenceStatus,
  AttentionAlert,
  Facility,
  FacilityContact,
  FacilityNote,
  FacilityCensus,
  FacilityPipelineEntry,
  FacilityStatus,
} from '@/portal/types/mobile-docs';

// ─── KPI ──────────────────────────────────────────────────────────

export function getMockKpiData(): MobileDocsKpi {
  return {
    monthlyRevenue: 47200,
    revenuePerVisit: 189,
    activeFacilities: 14,
    totalPatients: 127,
    pipelineCount: 6,
    pipelineBreakdown: { prospecting: 3, onboarding: 3 },
    trends: {
      revenue: { direction: 'up', percentage: 12.3, label: '12.3% vs last month' },
      revenuePerVisit: { direction: 'up', percentage: 3.1, label: '3.1%' },
      facilities: { direction: 'up', percentage: 16.7, label: '+2 this month' },
      patients: { direction: 'up', percentage: 8.5, label: '8.5% vs last month' },
    },
  };
}

// ─── Revenue ──────────────────────────────────────────────────────

export function getMockRevenueTrend(range: '30d' | '90d' | '12m'): RevenueTrendPoint[] {
  const today = new Date();
  const points: RevenueTrendPoint[] = [];
  const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;

  for (let i = days; i >= 0; i -= range === '12m' ? 30 : range === '90d' ? 7 : 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const base = 35000 + (days - i) * (12000 / days);
    const variance = Math.sin(i * 0.3) * 3000;
    points.push({
      date: date.toISOString().split('T')[0],
      charges: Math.round(base + variance),
    });
  }
  return points;
}

export function getMockFacilityRevenue(): FacilityRevenue[] {
  return [
    { facilityId: '1', name: 'Huntington Senior Living', type: 'SNF', activePatients: 22, visits: 48, monthlyCharges: 8930, revenuePerVisit: 186, trend: { direction: 'up', percentage: 5.2, label: '5.2%' } },
    { facilityId: '2', name: 'Elegant Care Villa', type: 'SNF', activePatients: 18, visits: 36, monthlyCharges: 7215, revenuePerVisit: 200, trend: { direction: 'up', percentage: 8.1, label: '8.1%' } },
    { facilityId: '3', name: 'Pacific Gardens SNF', type: 'SNF', activePatients: 15, visits: 32, monthlyCharges: 6890, revenuePerVisit: 215, trend: { direction: 'down', percentage: 2.3, label: '2.3%' } },
    { facilityId: '4', name: 'Sunset Hills SNF', type: 'SNF', activePatients: 8, visits: 18, monthlyCharges: 3420, revenuePerVisit: 190, trend: { direction: 'up', percentage: 15.0, label: '15.0%' } },
    { facilityId: '5', name: 'Valley Board & Care', type: 'Board & Care', activePatients: 5, visits: 10, monthlyCharges: 4120, revenuePerVisit: 412, trend: { direction: 'up', percentage: 12.0, label: '12.0%' } },
    { facilityId: '6', name: 'Rose Hills Board & Care', type: 'Board & Care', activePatients: 4, visits: 8, monthlyCharges: 3450, revenuePerVisit: 431, trend: { direction: 'flat', percentage: 0, label: '0%' } },
    { facilityId: '7', name: 'Golden Oaks Board & Care', type: 'Board & Care', activePatients: 3, visits: 6, monthlyCharges: 2580, revenuePerVisit: 430, trend: { direction: 'up', percentage: 22.0, label: '22.0%' } },
    { facilityId: '8', name: 'Williams Residence', type: 'Homebound', activePatients: 1, visits: 2, monthlyCharges: 890, revenuePerVisit: 445, trend: { direction: 'flat', percentage: 0, label: '—' } },
  ];
}

export function getMockAncillaryRevenue(): AncillaryRevenue {
  return { ccm: 6045, rpm: 5355, awv: 3210 };
}

// ─── Pipeline ─────────────────────────────────────────────────────

export function getMockPipelineStages(): PipelineStage[] {
  return [
    { stage: 'Prospecting', count: 3, facilities: ['Rosemead Senior Care', 'Arcadia Board & Care', 'Chen Residence'] },
    { stage: 'Onboarding', count: 3, facilities: ['Sunset Hills SNF', 'Golden Oaks Board & Care', 'Park View SNF'] },
    { stage: 'Active', count: 14, facilities: ['Huntington Senior Living', 'Elegant Care Villa', 'Pacific Gardens SNF', 'Valley Board & Care', 'Rose Hills Board & Care', 'Williams Residence'] },
    { stage: 'Inactive', count: 2, facilities: ['Alhambra Gardens', 'Sierra Vista B&C'] },
  ];
}

export function getMockPipelineMetrics(): PipelineMetrics {
  return { conversionRate: 68, avgDaysToActive: 34 };
}

export function getMockPipelineActivity(): PipelineTransition[] {
  return [
    { date: '2026-03-10', facilityName: 'Golden Oaks Board & Care', fromStatus: 'Onboarding', toStatus: 'Active', reason: 'First patient visit completed' },
    { date: '2026-03-07', facilityName: 'Park View SNF', fromStatus: 'Prospecting', toStatus: 'Onboarding', reason: 'Meeting with DON scheduled' },
    { date: '2026-03-03', facilityName: 'Rosemead Senior Care', fromStatus: null, toStatus: 'Prospecting', reason: 'Initial outreach call — left voicemail' },
    { date: '2026-02-28', facilityName: 'Sunset Hills SNF', fromStatus: 'Onboarding', toStatus: 'Active', reason: '5 initial patients admitted' },
    { date: '2026-02-25', facilityName: 'Alhambra Gardens', fromStatus: 'Active', toStatus: 'Inactive', reason: 'Partnership terminated — all patients discharged' },
    { date: '2026-02-20', facilityName: 'Arcadia Board & Care', fromStatus: null, toStatus: 'Prospecting', reason: 'Referral from Valley Board & Care owner' },
  ];
}

export function getMockFacilityMix(): FacilityMix[] {
  return [
    { type: 'SNF', count: 9, percentage: 41 },
    { type: 'Board & Care', count: 8, percentage: 36 },
    { type: 'Homebound', count: 5, percentage: 23 },
  ];
}

export function getMockFacilityGrowth(): FacilityGrowthPoint[] {
  return [
    { date: '2025-09', active: 6, total: 8 },
    { date: '2025-10', active: 7, total: 10 },
    { date: '2025-11', active: 8, total: 11 },
    { date: '2025-12', active: 9, total: 13 },
    { date: '2026-01', active: 10, total: 15 },
    { date: '2026-02', active: 12, total: 18 },
    { date: '2026-03', active: 14, total: 22 },
  ];
}

// ─── Operations ───────────────────────────────────────────────────

export function getMockPenetrationData(): PenetrationData[] {
  return [
    { facilityId: '5', name: 'Valley Board & Care', activePatients: 5, totalBeds: 6, penetrationRate: 83.3 },
    { facilityId: '6', name: 'Rose Hills Board & Care', activePatients: 4, totalBeds: 6, penetrationRate: 66.7 },
    { facilityId: '7', name: 'Golden Oaks Board & Care', activePatients: 3, totalBeds: 6, penetrationRate: 50.0 },
    { facilityId: '2', name: 'Elegant Care Villa', activePatients: 18, totalBeds: 65, penetrationRate: 27.7 },
    { facilityId: '1', name: 'Huntington Senior Living', activePatients: 22, totalBeds: 86, penetrationRate: 25.6 },
    { facilityId: '4', name: 'Sunset Hills SNF', activePatients: 8, totalBeds: 45, penetrationRate: 17.8 },
    { facilityId: '3', name: 'Pacific Gardens SNF', activePatients: 15, totalBeds: 120, penetrationRate: 12.5 },
  ];
}

export function getMockCensusTrend(): CensusTrendPoint[] {
  return [
    { date: '2025-09', totalPatients: 45 },
    { date: '2025-10', totalPatients: 55 },
    { date: '2025-11', totalPatients: 68 },
    { date: '2025-12', totalPatients: 78 },
    { date: '2026-01', totalPatients: 92 },
    { date: '2026-02', totalPatients: 110 },
    { date: '2026-03', totalPatients: 127 },
  ];
}

export function getMockEnrollment(): EnrollmentSummary {
  return { ccmEnrolled: 42, rpmEnrolled: 28, awvEligible: 67, totalPatients: 127 };
}

export function getMockCadenceStatus(): CadenceStatus[] {
  return [
    { facilityId: '1', name: 'Huntington Senior Living', cadence: 'Weekly', lastVisitDate: '2026-03-10', daysOverdue: 0, status: 'on_track' },
    { facilityId: '2', name: 'Elegant Care Villa', cadence: 'Weekly', lastVisitDate: '2026-03-07', daysOverdue: 0, status: 'on_track' },
    { facilityId: '3', name: 'Pacific Gardens SNF', cadence: 'Weekly', lastVisitDate: '2026-02-28', daysOverdue: 5, status: 'overdue' },
    { facilityId: '4', name: 'Sunset Hills SNF', cadence: 'Weekly', lastVisitDate: '2026-03-09', daysOverdue: 0, status: 'on_track' },
    { facilityId: '5', name: 'Valley Board & Care', cadence: 'Biweekly', lastVisitDate: '2026-03-04', daysOverdue: 0, status: 'on_track' },
    { facilityId: '6', name: 'Rose Hills Board & Care', cadence: 'Biweekly', lastVisitDate: '2026-03-01', daysOverdue: 0, status: 'on_track' },
    { facilityId: '7', name: 'Golden Oaks Board & Care', cadence: 'Biweekly', lastVisitDate: '2026-03-06', daysOverdue: 0, status: 'on_track' },
    { facilityId: '8', name: 'Williams Residence', cadence: 'Monthly', lastVisitDate: '2026-02-14', daysOverdue: 0, status: 'due_soon' },
  ];
}

export function getMockAlerts(): AttentionAlert[] {
  return [
    { type: 'missed_cadence', severity: 'critical', title: 'Missed Cadence', description: 'Pacific Gardens SNF — weekly visit overdue by 5 days', facilityName: 'Pacific Gardens SNF' },
    { type: 'low_penetration', severity: 'warning', title: 'Low Penetration', description: 'Pacific Gardens (12.5%) and Sunset Hills (17.8%) — below 20% threshold', facilityName: 'Pacific Gardens SNF' },
    { type: 'stale_census', severity: 'warning', title: 'Stale Census', description: '3 facilities have census data older than 30 days' },
    { type: 'pipeline_stalled', severity: 'info', title: 'Pipeline Stalled', description: 'Rosemead Senior Care — in Prospecting for 6 weeks, no activity', facilityName: 'Rosemead Senior Care' },
  ];
}

// ─── Facility Directory ──────────────────────────────────────────
// Mutable in-memory store for mock CRUD operations.
// Lazily initialized from seed data on first access.

const TENANT_ID = '00000000-0000-0000-0000-000000000000';
const ADMIN_ID = 'admin-0000-0000-0000-000000000001';
const now = '2026-03-12T08:00:00Z';

function seedFacilities(): Facility[] {
  return [
    { id: 'fac-001', tenant_id: TENANT_ID, name: 'Huntington Senior Living', type: 'SNF', status: 'Active', address_line1: '100 W California Blvd', address_line2: null, city: 'Pasadena', state: 'CA', zip: '91105', latitude: 34.1478120, longitude: -118.1445170, phone: '(626) 555-0101', total_beds: 86, pos_code: 32, distance_miles: 1.2, drive_minutes: 5, visit_cadence: 'Weekly', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-002', tenant_id: TENANT_ID, name: 'Elegant Care Villa', type: 'SNF', status: 'Active', address_line1: '450 S Lake Ave', address_line2: 'Suite 100', city: 'Pasadena', state: 'CA', zip: '91101', latitude: 34.1399870, longitude: -118.1330990, phone: '(626) 555-0102', total_beds: 65, pos_code: 32, distance_miles: 0.8, drive_minutes: 4, visit_cadence: 'Weekly', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-003', tenant_id: TENANT_ID, name: 'Pacific Gardens SNF', type: 'SNF', status: 'Active', address_line1: '2200 E Colorado Blvd', address_line2: null, city: 'Pasadena', state: 'CA', zip: '91107', latitude: 34.1458560, longitude: -118.1028640, phone: '(626) 555-0103', total_beds: 120, pos_code: 32, distance_miles: 3.1, drive_minutes: 10, visit_cadence: 'Weekly', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-004', tenant_id: TENANT_ID, name: 'Sunset Hills SNF', type: 'SNF', status: 'Active', address_line1: '1800 N Fair Oaks Ave', address_line2: null, city: 'Pasadena', state: 'CA', zip: '91103', latitude: 34.1678230, longitude: -118.1490560, phone: '(626) 555-0104', total_beds: 45, pos_code: 32, distance_miles: 2.4, drive_minutes: 8, visit_cadence: 'Weekly', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-005', tenant_id: TENANT_ID, name: 'Valley Board & Care', type: 'Board & Care', status: 'Active', address_line1: '315 N Garfield Ave', address_line2: null, city: 'Pasadena', state: 'CA', zip: '91101', latitude: 34.1525430, longitude: -118.1365780, phone: '(626) 555-0105', total_beds: 6, pos_code: 33, distance_miles: 0.5, drive_minutes: 3, visit_cadence: 'Biweekly', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-006', tenant_id: TENANT_ID, name: 'Rose Hills Board & Care', type: 'Board & Care', status: 'Active', address_line1: '820 E Washington Blvd', address_line2: null, city: 'Pasadena', state: 'CA', zip: '91104', latitude: 34.1521890, longitude: -118.1234560, phone: '(626) 555-0106', total_beds: 6, pos_code: 33, distance_miles: 1.8, drive_minutes: 7, visit_cadence: 'Biweekly', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-007', tenant_id: TENANT_ID, name: 'Golden Oaks Board & Care', type: 'Board & Care', status: 'Active', address_line1: '1040 N Allen Ave', address_line2: null, city: 'Pasadena', state: 'CA', zip: '91104', latitude: 34.1612340, longitude: -118.1267890, phone: '(626) 555-0107', total_beds: 6, pos_code: 33, distance_miles: 2.0, drive_minutes: 7, visit_cadence: 'Biweekly', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-008', tenant_id: TENANT_ID, name: 'Williams Residence', type: 'Homebound', status: 'Active', address_line1: '555 S Madison Ave', address_line2: null, city: 'Pasadena', state: 'CA', zip: '91106', latitude: 34.1378900, longitude: -118.1412340, phone: null, total_beds: null, pos_code: 99, distance_miles: 1.0, drive_minutes: 4, visit_cadence: 'Monthly', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-009', tenant_id: TENANT_ID, name: 'Rosemead Senior Care', type: 'SNF', status: 'Prospecting', address_line1: '3500 Rosemead Blvd', address_line2: null, city: 'Rosemead', state: 'CA', zip: '91770', latitude: 34.0635120, longitude: -118.0728900, phone: '(626) 555-0201', total_beds: 78, pos_code: 32, distance_miles: 8.5, drive_minutes: 18, visit_cadence: 'TBD', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-010', tenant_id: TENANT_ID, name: 'Arcadia Board & Care', type: 'Board & Care', status: 'Prospecting', address_line1: '120 E Duarte Rd', address_line2: null, city: 'Arcadia', state: 'CA', zip: '91006', latitude: 34.1394560, longitude: -118.0356780, phone: '(626) 555-0202', total_beds: 6, pos_code: 33, distance_miles: 6.2, drive_minutes: 14, visit_cadence: 'TBD', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-011', tenant_id: TENANT_ID, name: 'Chen Residence', type: 'Homebound', status: 'Prospecting', address_line1: '780 S San Gabriel Blvd', address_line2: null, city: 'San Gabriel', state: 'CA', zip: '91776', latitude: 34.0856780, longitude: -118.1023450, phone: null, total_beds: null, pos_code: 99, distance_miles: 5.4, drive_minutes: 12, visit_cadence: 'TBD', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-012', tenant_id: TENANT_ID, name: 'Park View SNF', type: 'SNF', status: 'Onboarding', address_line1: '900 S Fremont Ave', address_line2: null, city: 'Alhambra', state: 'CA', zip: '91803', latitude: 34.0878900, longitude: -118.1378900, phone: '(626) 555-0301', total_beds: 55, pos_code: 32, distance_miles: 4.8, drive_minutes: 12, visit_cadence: 'TBD', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-013', tenant_id: TENANT_ID, name: 'Magnolia Care Home', type: 'Board & Care', status: 'Onboarding', address_line1: '245 W Main St', address_line2: null, city: 'Alhambra', state: 'CA', zip: '91801', latitude: 34.0945670, longitude: -118.1312340, phone: '(626) 555-0302', total_beds: 6, pos_code: 33, distance_miles: 4.2, drive_minutes: 11, visit_cadence: 'TBD', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-014', tenant_id: TENANT_ID, name: 'Rivera Residence', type: 'Homebound', status: 'Onboarding', address_line1: '1200 N Atlantic Blvd', address_line2: null, city: 'Alhambra', state: 'CA', zip: '91801', latitude: 34.1012340, longitude: -118.1278900, phone: null, total_beds: null, pos_code: 99, distance_miles: 3.9, drive_minutes: 10, visit_cadence: 'TBD', assigned_provider_id: null, is_archived: false, created_at: now, updated_at: now },
    { id: 'fac-015', tenant_id: TENANT_ID, name: 'Alhambra Gardens', type: 'SNF', status: 'Inactive', address_line1: '500 S Garfield Ave', address_line2: null, city: 'Alhambra', state: 'CA', zip: '91801', latitude: 34.0867890, longitude: -118.1345670, phone: '(626) 555-0401', total_beds: 40, pos_code: 32, distance_miles: 4.5, drive_minutes: 11, visit_cadence: 'TBD', assigned_provider_id: null, is_archived: true, created_at: now, updated_at: now },
    { id: 'fac-016', tenant_id: TENANT_ID, name: 'Sierra Vista B&C', type: 'Board & Care', status: 'Inactive', address_line1: '330 W Valley Blvd', address_line2: null, city: 'San Gabriel', state: 'CA', zip: '91776', latitude: 34.0912340, longitude: -118.1056780, phone: '(626) 555-0402', total_beds: 6, pos_code: 33, distance_miles: 5.0, drive_minutes: 13, visit_cadence: 'TBD', assigned_provider_id: null, is_archived: true, created_at: now, updated_at: now },
  ];
}

function seedContacts(): FacilityContact[] {
  return [
    { id: 'con-001', facility_id: 'fac-001', name: 'Maria Santos', role: 'DON', title: 'Director of Nursing', phone: '(626) 555-1101', email: 'msantos@huntingtonsl.com', is_primary: true, contact_type: 'Clinical', notes: null, created_at: now, updated_at: now },
    { id: 'con-002', facility_id: 'fac-002', name: 'James Park', role: 'Administrator', title: 'Facility Administrator', phone: '(626) 555-1102', email: 'jpark@elegantcare.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
    { id: 'con-003', facility_id: 'fac-003', name: 'Linda Chen', role: 'DON', title: 'Director of Nursing', phone: '(626) 555-1103', email: 'lchen@pacificgardens.com', is_primary: true, contact_type: 'Clinical', notes: null, created_at: now, updated_at: now },
    { id: 'con-004', facility_id: 'fac-004', name: 'Robert Kim', role: 'Administrator', title: 'Executive Director', phone: '(626) 555-1104', email: 'rkim@sunsethills.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
    { id: 'con-005', facility_id: 'fac-005', name: 'Patricia Gomez', role: 'Owner', title: 'Owner/Operator', phone: '(626) 555-1105', email: 'pgomez@valleybc.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
    { id: 'con-006', facility_id: 'fac-006', name: 'David Nguyen', role: 'Owner', title: 'Owner/Operator', phone: '(626) 555-1106', email: 'dnguyen@rosehillsbc.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
    { id: 'con-007', facility_id: 'fac-007', name: 'Susan Lee', role: 'Owner', title: 'Owner/Operator', phone: '(626) 555-1107', email: 'slee@goldenoaksbc.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
    { id: 'con-008', facility_id: 'fac-008', name: 'Karen Williams', role: 'Caregiver', title: 'Family Caregiver', phone: '(626) 555-1108', email: 'kwilliams@email.com', is_primary: true, contact_type: 'Caregiver', notes: null, created_at: now, updated_at: now },
    { id: 'con-009', facility_id: 'fac-009', name: 'Tony Reyes', role: 'Administrator', title: 'Facility Administrator', phone: '(626) 555-1201', email: 'treyes@rosemeadsc.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
    { id: 'con-010', facility_id: 'fac-010', name: 'Helen Tran', role: 'Owner', title: 'Owner/Operator', phone: '(626) 555-1202', email: 'htran@arcadiabc.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
    { id: 'con-011', facility_id: 'fac-011', name: 'Michael Chen', role: 'Caregiver', title: 'Son / Primary Caregiver', phone: '(626) 555-1203', email: 'mchen@email.com', is_primary: true, contact_type: 'Caregiver', notes: null, created_at: now, updated_at: now },
    { id: 'con-012', facility_id: 'fac-012', name: 'Angela Martinez', role: 'DON', title: 'Director of Nursing', phone: '(626) 555-1301', email: 'amartinez@parkviewsnf.com', is_primary: true, contact_type: 'Clinical', notes: null, created_at: now, updated_at: now },
    { id: 'con-013', facility_id: 'fac-013', name: 'George Huang', role: 'Owner', title: 'Owner/Operator', phone: '(626) 555-1302', email: 'ghuang@magnoliacare.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
    { id: 'con-014', facility_id: 'fac-014', name: 'Carmen Rivera', role: 'Caregiver', title: 'Daughter / Caregiver', phone: '(626) 555-1303', email: 'crivera@email.com', is_primary: true, contact_type: 'Caregiver', notes: null, created_at: now, updated_at: now },
    { id: 'con-015', facility_id: 'fac-015', name: 'Frank Wilson', role: 'Administrator', title: 'Former Administrator', phone: '(626) 555-1401', email: 'fwilson@alhambragardens.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
    { id: 'con-016', facility_id: 'fac-016', name: 'Nancy Yamamoto', role: 'Owner', title: 'Former Owner', phone: '(626) 555-1402', email: 'nyamamoto@sierravista.com', is_primary: true, contact_type: 'Administrative', notes: null, created_at: now, updated_at: now },
  ];
}

function seedCensus(): FacilityCensus[] {
  return [
    // ── Historical snapshots (Oct 2025 – Feb 2026) ──────────────
    // Oct 2025
    { id: 'cen-009', facility_id: 'fac-001', snapshot_date: '2025-10-01', active_patients: 12, new_admissions: 3, discharges: 1, ccm_enrolled: 4, rpm_enrolled: 2, awv_eligible: 6, updated_by: ADMIN_ID },
    { id: 'cen-010', facility_id: 'fac-002', snapshot_date: '2025-10-01', active_patients: 10, new_admissions: 2, discharges: 1, ccm_enrolled: 3, rpm_enrolled: 2, awv_eligible: 5, updated_by: ADMIN_ID },
    { id: 'cen-011', facility_id: 'fac-003', snapshot_date: '2025-10-01', active_patients: 8, new_admissions: 2, discharges: 1, ccm_enrolled: 2, rpm_enrolled: 1, awv_eligible: 4, updated_by: ADMIN_ID },
    { id: 'cen-012', facility_id: 'fac-004', snapshot_date: '2025-10-01', active_patients: 3, new_admissions: 1, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-013', facility_id: 'fac-005', snapshot_date: '2025-10-01', active_patients: 2, new_admissions: 1, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-014', facility_id: 'fac-006', snapshot_date: '2025-10-01', active_patients: 2, new_admissions: 1, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-015', facility_id: 'fac-007', snapshot_date: '2025-10-01', active_patients: 1, new_admissions: 1, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 0, updated_by: ADMIN_ID },
    { id: 'cen-016', facility_id: 'fac-008', snapshot_date: '2025-10-01', active_patients: 1, new_admissions: 1, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 0, updated_by: ADMIN_ID },
    // Nov 2025
    { id: 'cen-017', facility_id: 'fac-001', snapshot_date: '2025-11-01', active_patients: 14, new_admissions: 3, discharges: 1, ccm_enrolled: 4, rpm_enrolled: 3, awv_eligible: 7, updated_by: ADMIN_ID },
    { id: 'cen-018', facility_id: 'fac-002', snapshot_date: '2025-11-01', active_patients: 12, new_admissions: 3, discharges: 1, ccm_enrolled: 4, rpm_enrolled: 2, awv_eligible: 6, updated_by: ADMIN_ID },
    { id: 'cen-019', facility_id: 'fac-003', snapshot_date: '2025-11-01', active_patients: 9, new_admissions: 2, discharges: 1, ccm_enrolled: 3, rpm_enrolled: 1, awv_eligible: 4, updated_by: ADMIN_ID },
    { id: 'cen-020', facility_id: 'fac-004', snapshot_date: '2025-11-01', active_patients: 4, new_admissions: 1, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 0, awv_eligible: 2, updated_by: ADMIN_ID },
    { id: 'cen-021', facility_id: 'fac-005', snapshot_date: '2025-11-01', active_patients: 3, new_admissions: 1, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-022', facility_id: 'fac-006', snapshot_date: '2025-11-01', active_patients: 2, new_admissions: 0, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-023', facility_id: 'fac-007', snapshot_date: '2025-11-01', active_patients: 1, new_admissions: 0, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 0, updated_by: ADMIN_ID },
    { id: 'cen-024', facility_id: 'fac-008', snapshot_date: '2025-11-01', active_patients: 1, new_admissions: 0, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 0, updated_by: ADMIN_ID },
    // Dec 2025
    { id: 'cen-025', facility_id: 'fac-001', snapshot_date: '2025-12-01', active_patients: 16, new_admissions: 3, discharges: 1, ccm_enrolled: 5, rpm_enrolled: 3, awv_eligible: 8, updated_by: ADMIN_ID },
    { id: 'cen-026', facility_id: 'fac-002', snapshot_date: '2025-12-01', active_patients: 13, new_admissions: 2, discharges: 1, ccm_enrolled: 4, rpm_enrolled: 2, awv_eligible: 7, updated_by: ADMIN_ID },
    { id: 'cen-027', facility_id: 'fac-003', snapshot_date: '2025-12-01', active_patients: 11, new_admissions: 3, discharges: 1, ccm_enrolled: 3, rpm_enrolled: 2, awv_eligible: 6, updated_by: ADMIN_ID },
    { id: 'cen-028', facility_id: 'fac-004', snapshot_date: '2025-12-01', active_patients: 5, new_admissions: 1, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 1, awv_eligible: 2, updated_by: ADMIN_ID },
    { id: 'cen-029', facility_id: 'fac-005', snapshot_date: '2025-12-01', active_patients: 3, new_admissions: 1, discharges: 1, ccm_enrolled: 1, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-030', facility_id: 'fac-006', snapshot_date: '2025-12-01', active_patients: 3, new_admissions: 1, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-031', facility_id: 'fac-007', snapshot_date: '2025-12-01', active_patients: 2, new_admissions: 1, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-032', facility_id: 'fac-008', snapshot_date: '2025-12-01', active_patients: 1, new_admissions: 0, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 0, updated_by: ADMIN_ID },
    // Jan 2026
    { id: 'cen-033', facility_id: 'fac-001', snapshot_date: '2026-01-01', active_patients: 18, new_admissions: 3, discharges: 1, ccm_enrolled: 6, rpm_enrolled: 3, awv_eligible: 9, updated_by: ADMIN_ID },
    { id: 'cen-034', facility_id: 'fac-002', snapshot_date: '2026-01-01', active_patients: 15, new_admissions: 3, discharges: 1, ccm_enrolled: 5, rpm_enrolled: 3, awv_eligible: 8, updated_by: ADMIN_ID },
    { id: 'cen-035', facility_id: 'fac-003', snapshot_date: '2026-01-01', active_patients: 12, new_admissions: 2, discharges: 1, ccm_enrolled: 4, rpm_enrolled: 2, awv_eligible: 6, updated_by: ADMIN_ID },
    { id: 'cen-036', facility_id: 'fac-004', snapshot_date: '2026-01-01', active_patients: 6, new_admissions: 1, discharges: 0, ccm_enrolled: 2, rpm_enrolled: 1, awv_eligible: 3, updated_by: ADMIN_ID },
    { id: 'cen-037', facility_id: 'fac-005', snapshot_date: '2026-01-01', active_patients: 4, new_admissions: 1, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 0, awv_eligible: 2, updated_by: ADMIN_ID },
    { id: 'cen-038', facility_id: 'fac-006', snapshot_date: '2026-01-01', active_patients: 3, new_admissions: 0, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-039', facility_id: 'fac-007', snapshot_date: '2026-01-01', active_patients: 2, new_admissions: 0, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-040', facility_id: 'fac-008', snapshot_date: '2026-01-01', active_patients: 1, new_admissions: 0, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 0, updated_by: ADMIN_ID },
    // Feb 2026
    { id: 'cen-041', facility_id: 'fac-001', snapshot_date: '2026-02-01', active_patients: 20, new_admissions: 3, discharges: 1, ccm_enrolled: 7, rpm_enrolled: 4, awv_eligible: 11, updated_by: ADMIN_ID },
    { id: 'cen-042', facility_id: 'fac-002', snapshot_date: '2026-02-01', active_patients: 16, new_admissions: 2, discharges: 1, ccm_enrolled: 5, rpm_enrolled: 3, awv_eligible: 8, updated_by: ADMIN_ID },
    { id: 'cen-043', facility_id: 'fac-003', snapshot_date: '2026-02-01', active_patients: 14, new_admissions: 3, discharges: 1, ccm_enrolled: 4, rpm_enrolled: 3, awv_eligible: 7, updated_by: ADMIN_ID },
    { id: 'cen-044', facility_id: 'fac-004', snapshot_date: '2026-02-01', active_patients: 7, new_admissions: 1, discharges: 0, ccm_enrolled: 2, rpm_enrolled: 1, awv_eligible: 3, updated_by: ADMIN_ID },
    { id: 'cen-045', facility_id: 'fac-005', snapshot_date: '2026-02-01', active_patients: 4, new_admissions: 0, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 0, awv_eligible: 2, updated_by: ADMIN_ID },
    { id: 'cen-046', facility_id: 'fac-006', snapshot_date: '2026-02-01', active_patients: 3, new_admissions: 0, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-047', facility_id: 'fac-007', snapshot_date: '2026-02-01', active_patients: 2, new_admissions: 0, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 1, updated_by: ADMIN_ID },
    { id: 'cen-048', facility_id: 'fac-008', snapshot_date: '2026-02-01', active_patients: 1, new_admissions: 0, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 0, updated_by: ADMIN_ID },
    // ── Current month (Mar 2026) — existing entries ─────────────
    { id: 'cen-001', facility_id: 'fac-001', snapshot_date: '2026-03-01', active_patients: 22, new_admissions: 3, discharges: 1, ccm_enrolled: 8, rpm_enrolled: 5, awv_eligible: 12, updated_by: ADMIN_ID },
    { id: 'cen-002', facility_id: 'fac-002', snapshot_date: '2026-03-01', active_patients: 18, new_admissions: 2, discharges: 1, ccm_enrolled: 6, rpm_enrolled: 4, awv_eligible: 10, updated_by: ADMIN_ID },
    { id: 'cen-003', facility_id: 'fac-003', snapshot_date: '2026-03-01', active_patients: 15, new_admissions: 1, discharges: 2, ccm_enrolled: 5, rpm_enrolled: 3, awv_eligible: 8, updated_by: ADMIN_ID },
    { id: 'cen-004', facility_id: 'fac-004', snapshot_date: '2026-03-01', active_patients: 8, new_admissions: 2, discharges: 0, ccm_enrolled: 3, rpm_enrolled: 2, awv_eligible: 5, updated_by: ADMIN_ID },
    { id: 'cen-005', facility_id: 'fac-005', snapshot_date: '2026-03-01', active_patients: 5, new_admissions: 1, discharges: 0, ccm_enrolled: 2, rpm_enrolled: 1, awv_eligible: 3, updated_by: ADMIN_ID },
    { id: 'cen-006', facility_id: 'fac-006', snapshot_date: '2026-03-01', active_patients: 4, new_admissions: 0, discharges: 0, ccm_enrolled: 2, rpm_enrolled: 1, awv_eligible: 3, updated_by: ADMIN_ID },
    { id: 'cen-007', facility_id: 'fac-007', snapshot_date: '2026-03-01', active_patients: 3, new_admissions: 1, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 1, awv_eligible: 2, updated_by: ADMIN_ID },
    { id: 'cen-008', facility_id: 'fac-008', snapshot_date: '2026-03-01', active_patients: 1, new_admissions: 0, discharges: 0, ccm_enrolled: 1, rpm_enrolled: 1, awv_eligible: 1, updated_by: ADMIN_ID },
  ];
}

function seedNotes(): FacilityNote[] {
  return [
    { id: 'note-001', facility_id: 'fac-001', author_id: ADMIN_ID, author_name: 'Dr. Sarah Mitchell', note_type: 'Visit Summary', content: 'Completed weekly rounds. 22 patients seen. 2 new referrals from DON for CCM enrollment. Facility census stable.', is_pinned: false, created_at: '2026-03-10T14:30:00Z' },
    { id: 'note-002', facility_id: 'fac-001', author_id: ADMIN_ID, author_name: 'Lisa Park', note_type: 'Partnership', content: 'Met with Maria Santos (DON) to discuss expanding to weekend coverage. They are interested — follow up next week with proposal.', is_pinned: true, created_at: '2026-03-08T11:00:00Z' },
    { id: 'note-003', facility_id: 'fac-002', author_id: ADMIN_ID, author_name: 'Dr. Sarah Mitchell', note_type: 'Visit Summary', content: 'Weekly visit completed. 18 patients stable. James Park mentioned upcoming state inspection — offered to coordinate care documentation.', is_pinned: false, created_at: '2026-03-07T15:00:00Z' },
    { id: 'note-004', facility_id: 'fac-003', author_id: ADMIN_ID, author_name: 'Lisa Park', note_type: 'Clinical', content: 'Cadence overdue by 5 days. Dr. Mitchell rescheduling for this week. Linda Chen expressed concern about coverage gaps.', is_pinned: true, created_at: '2026-03-05T09:00:00Z' },
    { id: 'note-005', facility_id: 'fac-003', author_id: ADMIN_ID, author_name: 'Dr. Sarah Mitchell', note_type: 'Visit Summary', content: 'Completed delayed visit. All 15 patients reviewed. 2 patients require medication adjustment. Census stable.', is_pinned: false, created_at: '2026-02-28T16:00:00Z' },
    { id: 'note-006', facility_id: 'fac-005', author_id: ADMIN_ID, author_name: 'Lisa Park', note_type: 'General', content: 'Patricia Gomez inquiring about adding RPM services for 2 diabetic patients. Sent information packet.', is_pinned: false, created_at: '2026-03-04T10:30:00Z' },
    { id: 'note-007', facility_id: 'fac-009', author_id: ADMIN_ID, author_name: 'Lisa Park', note_type: 'Outreach', content: 'Left voicemail with Tony Reyes. No callback yet. Will follow up again next week. Facility has 78 beds — good expansion opportunity.', is_pinned: false, created_at: '2026-03-03T09:00:00Z' },
    { id: 'note-008', facility_id: 'fac-012', author_id: ADMIN_ID, author_name: 'Lisa Park', note_type: 'Partnership', content: 'Meeting with Angela Martinez (DON) scheduled for March 15. Will discuss partnership terms and initial patient onboarding plan.', is_pinned: true, created_at: '2026-03-07T14:00:00Z' },
    { id: 'note-009', facility_id: 'fac-004', author_id: ADMIN_ID, author_name: 'Dr. Sarah Mitchell', note_type: 'Visit Summary', content: 'Weekly rounds completed. 8 patients seen. 2 new admissions this week. Robert Kim very supportive of expansion.', is_pinned: false, created_at: '2026-03-09T13:00:00Z' },
    { id: 'note-010', facility_id: 'fac-007', author_id: ADMIN_ID, author_name: 'Lisa Park', note_type: 'Administrative', content: 'Updated parking access code for Golden Oaks. New code: #4521. Susan Lee confirmed gate hours Mon-Fri 7am-7pm.', is_pinned: false, created_at: '2026-03-06T08:30:00Z' },
  ];
}

// Module-level mutable stores — lazily initialized
let _facilities: Facility[] | null = null;
let _contacts: FacilityContact[] | null = null;
let _census: FacilityCensus[] | null = null;
let _notes: FacilityNote[] | null = null;

function getFacilitiesStore(): Facility[] {
  if (!_facilities) _facilities = seedFacilities();
  return _facilities;
}

function getContactsStore(): FacilityContact[] {
  if (!_contacts) _contacts = seedContacts();
  return _contacts;
}

function getCensusStore(): FacilityCensus[] {
  if (!_census) _census = seedCensus();
  return _census;
}

function getNotesStore(): FacilityNote[] {
  if (!_notes) _notes = seedNotes();
  return _notes;
}

// ─── Pipeline Store ──────────────────────────────────────────────

let _pipeline: FacilityPipelineEntry[] | null = null;

function getPipelineStore(): FacilityPipelineEntry[] {
  if (!_pipeline) _pipeline = seedPipeline();
  return _pipeline;
}

function seedPipeline(): FacilityPipelineEntry[] {
  return [
    // ── Active facilities (fac-001 through fac-008): 3 entries each ──
    // fac-001 Huntington Senior Living
    { id: 'pip-001', facility_id: 'fac-001', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — identified via referral from Elegant Care Villa', changed_at: '2025-06-02T09:00:00Z' },
    { id: 'pip-002', facility_id: 'fac-001', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with DON completed — partnership terms agreed', changed_at: '2025-08-05T14:00:00Z' },
    { id: 'pip-003', facility_id: 'fac-001', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed — 5 initial patients admitted', changed_at: '2025-10-01T10:00:00Z' },
    // fac-002 Elegant Care Villa
    { id: 'pip-004', facility_id: 'fac-002', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — cold call to facility administrator', changed_at: '2025-06-05T10:00:00Z' },
    { id: 'pip-005', facility_id: 'fac-002', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with administrator completed — contract signed', changed_at: '2025-08-10T11:00:00Z' },
    { id: 'pip-006', facility_id: 'fac-002', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed — 4 initial patients admitted', changed_at: '2025-10-03T09:00:00Z' },
    // fac-003 Pacific Gardens SNF
    { id: 'pip-007', facility_id: 'fac-003', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — identified via SNF industry directory', changed_at: '2025-06-10T09:30:00Z' },
    { id: 'pip-008', facility_id: 'fac-003', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with DON completed — tour of facility done', changed_at: '2025-08-15T13:00:00Z' },
    { id: 'pip-009', facility_id: 'fac-003', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed — 3 initial patients admitted', changed_at: '2025-10-07T10:00:00Z' },
    // fac-004 Sunset Hills SNF
    { id: 'pip-010', facility_id: 'fac-004', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — referral from hospital discharge planner', changed_at: '2025-06-15T10:00:00Z' },
    { id: 'pip-011', facility_id: 'fac-004', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with executive director completed', changed_at: '2025-08-20T14:30:00Z' },
    { id: 'pip-012', facility_id: 'fac-004', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed — 2 initial patients admitted', changed_at: '2025-10-10T09:00:00Z' },
    // fac-005 Valley Board & Care
    { id: 'pip-013', facility_id: 'fac-005', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — identified via local board & care network', changed_at: '2025-06-18T09:00:00Z' },
    { id: 'pip-014', facility_id: 'fac-005', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with owner/operator completed', changed_at: '2025-08-22T11:00:00Z' },
    { id: 'pip-015', facility_id: 'fac-005', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed — 1 initial patient admitted', changed_at: '2025-10-12T10:00:00Z' },
    // fac-006 Rose Hills Board & Care
    { id: 'pip-016', facility_id: 'fac-006', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — referral from Valley Board & Care owner', changed_at: '2025-06-20T10:00:00Z' },
    { id: 'pip-017', facility_id: 'fac-006', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with owner completed — reviewed patient needs', changed_at: '2025-08-25T13:00:00Z' },
    { id: 'pip-018', facility_id: 'fac-006', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed — 1 initial patient admitted', changed_at: '2025-10-15T09:30:00Z' },
    // fac-007 Golden Oaks Board & Care
    { id: 'pip-019', facility_id: 'fac-007', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — identified via community health fair', changed_at: '2025-06-22T09:00:00Z' },
    { id: 'pip-020', facility_id: 'fac-007', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with owner completed — discussed service model', changed_at: '2025-08-28T14:00:00Z' },
    { id: 'pip-021', facility_id: 'fac-007', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed — 1 initial patient admitted', changed_at: '2025-10-18T10:00:00Z' },
    // fac-008 Williams Residence
    { id: 'pip-022', facility_id: 'fac-008', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — family caregiver requested home visit services', changed_at: '2025-06-25T10:00:00Z' },
    { id: 'pip-023', facility_id: 'fac-008', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'In-home assessment completed — care plan drafted', changed_at: '2025-08-30T11:00:00Z' },
    { id: 'pip-024', facility_id: 'fac-008', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed', changed_at: '2025-10-20T09:00:00Z' },

    // ── Prospecting facilities (fac-009, fac-010, fac-011): 1 entry each ──
    { id: 'pip-025', facility_id: 'fac-009', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach call — left voicemail with administrator', changed_at: '2026-01-15T09:00:00Z' },
    { id: 'pip-026', facility_id: 'fac-010', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Referral from Valley Board & Care owner', changed_at: '2026-02-10T10:00:00Z' },
    { id: 'pip-027', facility_id: 'fac-011', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Family caregiver inquiry via website contact form', changed_at: '2026-02-20T14:00:00Z' },

    // ── Onboarding facilities (fac-012, fac-013, fac-014): 2 entries each ──
    { id: 'pip-028', facility_id: 'fac-012', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — identified via hospital discharge network', changed_at: '2025-12-05T09:00:00Z' },
    { id: 'pip-029', facility_id: 'fac-012', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with DON completed — tour scheduled', changed_at: '2026-02-03T14:00:00Z' },
    { id: 'pip-030', facility_id: 'fac-013', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — cold call to owner/operator', changed_at: '2025-12-10T10:00:00Z' },
    { id: 'pip-031', facility_id: 'fac-013', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with owner completed — contract under review', changed_at: '2026-02-08T11:00:00Z' },
    { id: 'pip-032', facility_id: 'fac-014', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Family caregiver referral from Pacific Gardens DON', changed_at: '2025-12-15T09:30:00Z' },
    { id: 'pip-033', facility_id: 'fac-014', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'In-home assessment scheduled — care plan in progress', changed_at: '2026-02-12T13:00:00Z' },

    // ── Inactive facilities (fac-015, fac-016): 4 entries each ──
    { id: 'pip-034', facility_id: 'fac-015', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — identified via SNF industry directory', changed_at: '2025-03-10T09:00:00Z' },
    { id: 'pip-035', facility_id: 'fac-015', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with administrator completed', changed_at: '2025-05-15T14:00:00Z' },
    { id: 'pip-036', facility_id: 'fac-015', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed — 3 initial patients admitted', changed_at: '2025-07-01T10:00:00Z' },
    { id: 'pip-037', facility_id: 'fac-015', from_status: 'Active', to_status: 'Inactive', changed_by: ADMIN_ID, change_reason: 'Partnership terminated — all patients discharged', changed_at: '2025-12-15T16:00:00Z' },
    { id: 'pip-038', facility_id: 'fac-016', from_status: null, to_status: 'Prospecting', changed_by: ADMIN_ID, change_reason: 'Initial outreach — referral from community health worker', changed_at: '2025-03-15T10:00:00Z' },
    { id: 'pip-039', facility_id: 'fac-016', from_status: 'Prospecting', to_status: 'Onboarding', changed_by: ADMIN_ID, change_reason: 'First meeting with owner completed', changed_at: '2025-05-20T11:00:00Z' },
    { id: 'pip-040', facility_id: 'fac-016', from_status: 'Onboarding', to_status: 'Active', changed_by: ADMIN_ID, change_reason: 'First patient visit completed — 1 initial patient admitted', changed_at: '2025-07-10T09:00:00Z' },
    { id: 'pip-041', facility_id: 'fac-016', from_status: 'Active', to_status: 'Inactive', changed_by: ADMIN_ID, change_reason: 'Facility closed — owner retired', changed_at: '2026-01-08T15:00:00Z' },
  ];
}

export function getMockFacilityPipelineHistory(facilityId: string): FacilityPipelineEntry[] {
  return getPipelineStore()
    .filter((p) => p.facility_id === facilityId)
    .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
}

export function addMockPipelineTransition(
  facilityId: string,
  fromStatus: FacilityStatus | null,
  toStatus: FacilityStatus,
  reason: string
): FacilityPipelineEntry {
  const entry: FacilityPipelineEntry = {
    id: nextMockId('pip'),
    facility_id: facilityId,
    from_status: fromStatus,
    to_status: toStatus,
    changed_by: ADMIN_ID,
    change_reason: reason,
    changed_at: new Date().toISOString(),
  };
  getPipelineStore().push(entry);
  return entry;
}

export function getMockFacilities(): Facility[] {
  return [...getFacilitiesStore()];
}

export function getMockFacilityById(id: string): Facility | undefined {
  return getFacilitiesStore().find((f) => f.id === id);
}

export function getMockFacilityContacts(facilityId: string): FacilityContact[] {
  return getContactsStore()
    .filter((c) => c.facility_id === facilityId)
    .sort((a, b) => (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1));
}

export function getMockFacilityNotes(facilityId: string): FacilityNote[] {
  return getNotesStore()
    .filter((n) => n.facility_id === facilityId)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

export function getMockFacilityCensus(facilityId: string): FacilityCensus | undefined {
  return getCensusStore()
    .filter((c) => c.facility_id === facilityId)
    .sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date))[0];
}

export function getMockFacilityCensusTrend(facilityId: string): FacilityCensus[] {
  return getCensusStore()
    .filter((c) => c.facility_id === facilityId)
    .sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));
}

// ─── Mock Mutation Helpers ─────────────────────────────────────────

let _nextId = 100;
function nextMockId(prefix: string): string {
  return `${prefix}-${String(_nextId++).padStart(3, '0')}`;
}

export function addMockFacility(data: Omit<Facility, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Facility {
  const facility: Facility = {
    ...data,
    id: nextMockId('fac'),
    tenant_id: TENANT_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  getFacilitiesStore().push(facility);
  return facility;
}

export function updateMockFacility(id: string, data: Partial<Facility>): Facility | undefined {
  const store = getFacilitiesStore();
  const idx = store.findIndex((f) => f.id === id);
  if (idx === -1) return undefined;
  store[idx] = { ...store[idx], ...data, updated_at: new Date().toISOString() };
  return store[idx];
}

export function archiveMockFacility(id: string): boolean {
  const facility = updateMockFacility(id, { is_archived: true });
  return !!facility;
}

export function addMockContact(facilityId: string, data: Omit<FacilityContact, 'id' | 'facility_id' | 'created_at' | 'updated_at'>): FacilityContact {
  const contact: FacilityContact = {
    ...data,
    id: nextMockId('con'),
    facility_id: facilityId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  getContactsStore().push(contact);
  return contact;
}

export function addMockNote(facilityId: string, data: Omit<FacilityNote, 'id' | 'facility_id' | 'created_at'>): FacilityNote {
  const note: FacilityNote = {
    ...data,
    id: nextMockId('note'),
    facility_id: facilityId,
    created_at: new Date().toISOString(),
  };
  getNotesStore().push(note);
  return note;
}

export function updateMockContact(
  contactId: string,
  data: Partial<Omit<FacilityContact, 'id' | 'facility_id' | 'created_at'>>
): FacilityContact | undefined {
  const store = getContactsStore();
  const idx = store.findIndex((c) => c.id === contactId);
  if (idx === -1) return undefined;
  store[idx] = { ...store[idx], ...data, updated_at: new Date().toISOString() };
  return store[idx];
}

export function deleteMockContact(contactId: string): boolean {
  const store = getContactsStore();
  const idx = store.findIndex((c) => c.id === contactId);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function setMockPrimaryContact(facilityId: string, contactId: string): boolean {
  const store = getContactsStore();
  const facilityContacts = store.filter((c) => c.facility_id === facilityId);
  const currentPrimary = facilityContacts.find((c) => c.is_primary);
  const newPrimary = facilityContacts.find((c) => c.id === contactId);
  if (!newPrimary) return false;
  if (currentPrimary) {
    currentPrimary.is_primary = false;
    currentPrimary.updated_at = new Date().toISOString();
  }
  newPrimary.is_primary = true;
  newPrimary.updated_at = new Date().toISOString();
  return true;
}

export function toggleMockNotePin(noteId: string): FacilityNote | undefined {
  const store = getNotesStore();
  const idx = store.findIndex((n) => n.id === noteId);
  if (idx === -1) return undefined;
  store[idx] = { ...store[idx], is_pinned: !store[idx].is_pinned };
  return store[idx];
}

export function addMockCensus(
  facilityId: string,
  data: Omit<FacilityCensus, 'id' | 'facility_id'>
): FacilityCensus {
  const census: FacilityCensus = {
    ...data,
    id: nextMockId('cen'),
    facility_id: facilityId,
  };
  getCensusStore().push(census);
  return census;
}
