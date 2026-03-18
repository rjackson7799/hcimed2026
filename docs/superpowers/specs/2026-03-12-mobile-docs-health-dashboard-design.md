# Mobile Docs Health Dashboard — Design Spec

**Date:** 2026-03-12
**Author:** Claude (brainstorming session with Ryan)
**Status:** Draft
**PRD Reference:** `docs/Mobile_Docs_Facility_Directory_PRD_v1_0.md`

---

## 1. Purpose

The Mobile Docs program lacks a centralized view of its health and key stats. Operational data lives across spreadsheets, text messages, and institutional memory. Ryan (Admin) needs a strategic executive dashboard to answer:

- Is Mobile Docs growing? (Revenue trajectory, facility count, patient census)
- Where should we invest next? (Pipeline health, penetration opportunities, underperforming facilities)
- What needs attention right now? (Missed cadences, stale data, stalled pipeline)

This spec describes a **new top-level portal page** — "Mobile Docs" — that provides program health monitoring with mock data for initial UI iteration, to be wired to Supabase once the Facility Directory tables are built.

---

## 2. Scope

### In Scope
- New portal page at `/portal/admin/mobile-docs`
- Sidebar navigation entry under Administration
- KPI metric strip (5 cards with trend indicators)
- Revenue & Financial Health section (always visible, not tabbed)
- Growth & Pipeline tab
- Operations & Coverage tab
- Mock data layer for all metrics
- Admin-only access (RoleGuard)

### Out of Scope
- Facility Directory CRUD (add/edit/archive facilities) — separate PRD deliverable
- Map & Geographic Intelligence view — separate PRD deliverable
- Supabase table creation (facilities_directory, facility_census, etc.) — follow-up phase
- Real-time data integration with Practice Health Module — follow-up phase
- Mobile/responsive optimization — standard Tailwind responsive, no mobile-specific work
- Coordinator or Provider views — Admin-only for v1

---

## 3. Architecture

### 3.1 Layout: Hybrid (KPI + Pinned Revenue + Tabs)

```
┌──────────────────────────────────────────────────────────────┐
│  KPI Strip (5 cards)                                         │
│  [Monthly Revenue] [Rev/Visit] [Active Facilities] [Patients] [Pipeline] │
├──────────────────────────────────────────────────────────────┤
│  Revenue & Financial Health (always visible)                  │
│  ┌─────────────────────┐ ┌─────────────────────┐             │
│  │ Revenue Trend Chart  │ │ Rev/Visit + Ancillary│             │
│  └─────────────────────┘ └─────────────────────┘             │
│  ┌──────────────────────────────────────────────┐             │
│  │ Facility Revenue Ranking Table               │             │
│  └──────────────────────────────────────────────┘             │
├──────────────────────────────────────────────────────────────┤
│  [Growth & Pipeline] | [Operations & Coverage]   ← Tabs      │
│  ┌──────────────────────────────────────────────┐             │
│  │ Tab content (see sections 5 & 6)             │             │
│  └──────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow (v1 — Mock Data)

```
mock-data.ts (static data)
    │
    ├── useMobileDocsKpi()        → KPI strip
    ├── useMobileDocsRevenue()    → Revenue section
    ├── useMobileDocsPipeline()   → Growth tab
    └── useMobileDocsOperations() → Operations tab
```

Each hook returns typed data from the mock module. When Supabase tables are ready, hooks switch to real queries with no component changes needed.

### 3.3 File Structure

```
src/portal/
├── components/mobile-docs/
│   ├── MobileDocsPage.tsx              # Page wrapper, tab controller
│   ├── MobileDocsKpiStrip.tsx          # 5 KPI metric cards
│   ├── RevenueSection.tsx              # Always-visible revenue section
│   │   ├── RevenueTrendChart.tsx       # Area chart (recharts)
│   │   ├── RevenueMetrics.tsx          # Per-visit, per-patient, ancillary
│   │   └── FacilityRevenueTable.tsx    # Sortable facility ranking table
│   ├── GrowthTab.tsx                   # Growth & Pipeline tab wrapper
│   │   ├── PipelineFunnelChart.tsx     # Horizontal funnel bars
│   │   ├── FacilityGrowthChart.tsx     # Stacked area chart
│   │   ├── FacilityMixDonut.tsx        # SNF/B&C/Homebound donut
│   │   └── PipelineActivityFeed.tsx    # Recent transitions list
│   └── OperationsTab.tsx              # Operations & Coverage tab wrapper
│       ├── PenetrationRateChart.tsx    # Horizontal progress bars
│       ├── CensusTrendChart.tsx        # Area chart + enrollment cards
│       ├── CadenceComplianceList.tsx   # Traffic-light status list
│       └── AttentionAlerts.tsx         # Proactive alert cards
├── hooks/
│   ├── useMobileDocsKpi.ts
│   ├── useMobileDocsRevenue.ts
│   ├── useMobileDocsPipeline.ts
│   └── useMobileDocsOperations.ts
├── lib/
│   ├── mobile-docs-mock-data.ts        # All mock data in one module
│   └── mobile-docs-constants.ts        # Colors, thresholds, labels (matches practice-health-constants.ts location)
└── types/
    └── mobile-docs.ts                  # TypeScript types for all dashboard data
```

---

## 4. KPI Metric Strip

5 cards using the existing `KpiMetricCard` pattern from Practice Health.

> **PRD Note:** The PRD Section 13.2 defines 4 summary cards (Active Facilities, Total Patients, Avg Penetration, Monthly Charges). This spec expands to 5 cards optimized for Ryan's executive priorities — Revenue and Revenue/Visit replace Avg Penetration at the top level. Avg Penetration is prominently displayed in the Operations tab (Section 7.1) where it has more context alongside per-facility breakdowns.

| Card | Value | Trend Comparison | Source (v1 mock, v2 real) |
|------|-------|-----------------|--------------------------|
| Monthly Revenue | SUM charges this month | vs. previous month % | Mock → `ph_charges` filtered to mobile_docs |
| Revenue / Visit | Monthly charges / visit count | vs. previous month % | Mock → derived from `ph_charges` + `ph_productivity` |
| Active Facilities | COUNT where status = Active | +/- vs. previous month | Mock → `facilities_directory` |
| Total Patients | SUM active_patients across all facilities | vs. previous month % | Mock → `facility_census` |
| In Pipeline | COUNT where status IN (Prospecting, Onboarding) | breakdown text | Mock → `facilities_directory` |

Each card shows: label, large value, trend arrow + percentage (green up = good, red down = bad, gray flat).

---

## 5. Revenue & Financial Health Section (Always Visible)

### 5.1 Revenue Trend Chart
- **Type:** Recharts AreaChart with gradient fill
- **Data:** Monthly charges over time
- **Time Toggle:** 30 Days | 90 Days | 12 Months (3-chip inline selector, default 90 Days)
- **State:** Time range state is local to `RevenueTrendChart.tsx` — no other component needs it. The `useMobileDocsRevenue` hook accepts a `range` parameter and `RevenueTrendChart` calls it with the selected range.
- **Color:** Blue (#3b82f6) area with gradient to transparent

### 5.2 Revenue Metrics Panel
- **Per Visit:** Monthly charges / visit count (large number)
- **Per Patient:** Monthly charges / active patients (large number)
- **Visit Count:** Total visits this month
- **Ancillary Revenue Cards:** 3 mini-cards showing CCM, RPM, AWV revenue contribution
  - CCM color: Purple (#a78bfa)
  - RPM color: Pink (#f472b6)
  - AWV color: Amber (#fbbf24)

### 5.3 Facility Revenue Ranking Table
- **Columns:** Facility Name, Type (badge), Patients, Visits, Revenue, $/Visit, Trend
- **Default Sort:** Revenue descending
- **Type Badges:** SNF = blue, B&C = green, Homebound = purple (matching PRD Section 9.2 colors)
- **Trend Column:** Green ▲ / Red ▼ / Gray — percentage vs. previous period
- **Rows:** All active facilities

---

## 6. Growth & Pipeline Tab

### 6.1 Status Distribution & Pipeline Metrics
- **Layout:** Horizontal bar chart showing all facilities by current status
- **Bars:** Prospecting (amber) | Onboarding (blue) | Active (green) | Inactive (gray)
- **Bar Content:** Shows facility names inside bars, bar width proportional to count
- **Note:** This is a snapshot distribution of all facilities, not a conversion funnel. Active and Inactive are terminal states shown for completeness.
- **Footer Metrics:** Conversion rate (Prospect → Active within 90d), Average days to Active — these metrics below the bars provide the funnel/conversion context

### 6.2 Facility Growth Timeline
- **Type:** Recharts AreaChart, stacked
- **Series:** Active facilities (solid green) + Total including pipeline (dashed blue)
- **Time Range:** Last 6-12 months
- **Purpose:** "Are we growing?" trajectory visualization

### 6.3 Facility Mix Donut
- **Type:** Recharts PieChart with innerRadius (donut)
- **Segments:** SNF (blue #3b82f6), Board & Care (green #34d399), Homebound (purple #a78bfa)
- **Center Text:** Total facility count
- **Legend:** Below chart with count and percentage per type

### 6.4 Pipeline Activity Feed
- **Layout:** Reverse-chronological list of recent pipeline transitions
- **Each Row:** Date | Status badge (colored) | Facility name | Reason/note
- **Badge Colors:** Prospecting = amber, Onboarding = blue, Active = green, Inactive = red
- **Purpose:** "What happened recently?" audit trail

---

## 7. Operations & Coverage Tab

### 7.1 Bed Penetration by Facility
- **Layout:** Horizontal progress bars, one per facility (SNF & B&C only)
- **Data:** active_patients / total_beds × 100
- **Color Coding:** Green (>50%), Blue (20-50%), Amber (<20%)
- **Footer:** Average penetration rate + growth opportunity calculation ("~N beds to reach 35% avg")

### 7.2 Patient Census Trend
- **Type:** Recharts AreaChart (green gradient)
- **Data:** Total active patients across all facilities over time
- **Enrollment Cards:** 3 mini-cards below chart showing CCM enrolled, RPM enrolled, AWV eligible with counts and percentages

### 7.3 Visit Cadence Compliance
- **Layout:** List with traffic-light indicators per facility
- **Status Logic:**
  - Green (on track): last visit within cadence window
  - Amber (due soon): last visit approaching cadence deadline
  - Red (overdue): last visit exceeds cadence by >2 days
- **Columns:** Status dot, Facility name, Cadence setting, Last visit relative date
- **Footer:** Summary counts (on track / due soon / overdue)

### 7.4 Needs Attention (Alert Cards)
- **Layout:** Stacked alert cards with severity color coding
- **Alert Types:**
  - Red (critical): Missed cadence — facility with overdue visits
  - Amber (warning): Low penetration — facility below 20% penetration threshold
  - Amber (warning): Stale census — facility with census >30 days old
  - Blue (info): Pipeline stalled — prospect with no activity for 4+ weeks
- **Each Card:** Severity icon, alert type label, descriptive text with facility name

---

## 8. Routing & Navigation

### Route
```
/portal/admin/mobile-docs → MobileDocsPage
```

### Lazy Import (in App.tsx)
```tsx
const MobileDocsPage = lazy(() =>
  import('@/portal/components/mobile-docs/MobileDocsPage')
    .then(m => ({ default: m.MobileDocsPage }))
);
```
`MobileDocsPage` uses a **named export** (portal page convention per CLAUDE.md).

### Role Guard
```tsx
<Route path="/portal/admin/mobile-docs"
  element={<RoleGuard allowedRoles={['admin']}><MobileDocsPage /></RoleGuard>}
/>
```

### Sidebar Entry
Add to PortalSidebar.tsx admin navigation group. Add `MapPin` to the existing `lucide-react` import statement.
```
{ label: 'Mobile Docs', href: '/portal/admin/mobile-docs', icon: MapPin }
```
Position: Below "Practice Health" in the Administration section.

### SEO/Sitemap
This route is portal-internal: do NOT add to `dynamicRoutes` in `vite.config.ts` or SEO config in `src/config/seo.ts`.

---

## 9. Reusable Components & Utilities

### From Practice Health (reuse directly)
| Component/Utility | File | Usage |
|-------------------|------|-------|
| `KpiMetricCard` | `src/portal/components/practice-health/KpiMetricCard.tsx` | KPI strip cards |
| *(N/A — build inline)* | Revenue time toggle uses a simple 3-chip selector local to `RevenueTrendChart.tsx` (the existing `DateRangeSelector` presets don't match the needed 30d/90d/12m intervals) | |
| `formatCurrency` | `src/portal/utils/practice-health-formatters.ts` | Revenue display |
| `formatPercentage` | `src/portal/utils/practice-health-formatters.ts` | Penetration rates |
| `formatTrend` | `src/portal/utils/practice-health-formatters.ts` | Trend calculations |
| `formatNumber` | `src/portal/utils/practice-health-formatters.ts` | Patient counts |

### From shadcn/ui
- `Card` — chart containers
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` — tab navigation
- `Table`, `TableHeader`, `TableRow`, `TableCell` — revenue ranking table
- `Badge` — facility type badges

### From Recharts
- `AreaChart` + `Area` — revenue trend, census trend, facility growth
- `PieChart` + `Pie` + `Cell` — facility mix donut
- `BarChart` + `Bar` — pipeline funnel (horizontal)
- `ResponsiveContainer` — all charts
- `Tooltip`, `Legend`, `XAxis`, `YAxis`, `CartesianGrid` — standard chart elements

---

## 10. Type Definitions

All types are exported. `TrendData` is structurally identical to the return type of `formatTrend()` in `practice-health-formatters.ts` — when wiring to real data in v2, use `formatTrend()` to produce `TrendData` values.

```typescript
// src/portal/types/mobile-docs.ts

export type FacilityType = 'SNF' | 'Board & Care' | 'Homebound';
export type FacilityStatus = 'Prospecting' | 'Onboarding' | 'Active' | 'Inactive';
export type VisitCadence = 'Weekly' | 'Biweekly' | 'Monthly' | 'Quarterly' | 'As Needed' | 'TBD';

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

export interface TrendData {
  direction: 'up' | 'down' | 'flat';
  percentage: number;
  label: string;
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
```

---

## 11. Mock Data Strategy

All mock data lives in `src/portal/lib/mobile-docs-mock-data.ts`. The mock module exports functions matching the hook interface:

```typescript
export function getMockKpiData(): MobileDocsKpi { ... }
export function getMockRevenueTrend(range: '30d' | '90d' | '12m'): RevenueTrendPoint[] { ... }
export function getMockFacilityRevenue(): FacilityRevenue[] { ... }
export function getMockAncillaryRevenue(): AncillaryRevenue { ... }
export function getMockPipelineStages(): PipelineStage[] { ... }
export function getMockPipelineMetrics(): PipelineMetrics { ... }
export function getMockPipelineActivity(): PipelineTransition[] { ... }
export function getMockFacilityMix(): FacilityMix[] { ... }
export function getMockFacilityGrowth(): FacilityGrowthPoint[] { ... }
export function getMockPenetrationData(): PenetrationData[] { ... }
export function getMockCensusTrend(): CensusTrendPoint[] { ... }
export function getMockEnrollment(): EnrollmentSummary { ... }
export function getMockCadenceStatus(): CadenceStatus[] { ... }
export function getMockAlerts(): AttentionAlert[] { ... }
```

Mock data uses realistic values based on the PRD's financial model and operational parameters. All mock functions reference the following canonical facility roster for consistency:

| # | Name | Type | Status | Beds | Patients |
|---|------|------|--------|------|----------|
| 1 | Huntington Senior Living | SNF | Active | 86 | 22 |
| 2 | Elegant Care Villa | SNF | Active | 65 | 18 |
| 3 | Pacific Gardens SNF | SNF | Active | 120 | 15 |
| 4 | Sunset Hills SNF | SNF | Active | 45 | 8 |
| 5 | Valley Board & Care | B&C | Active | 6 | 5 |
| 6 | Rose Hills Board & Care | B&C | Active | 6 | 4 |
| 7 | Golden Oaks Board & Care | B&C | Active | 6 | 3 |
| 8 | Williams Residence | Homebound | Active | — | 1 |
| 9 | Chen Residence | Homebound | Prospecting | — | 0 |
| 10 | Rosemead Senior Care | SNF | Prospecting | 80 | 0 |
| 11 | Arcadia Board & Care | B&C | Prospecting | 6 | 0 |
| 12 | Park View SNF | SNF | Onboarding | 90 | 0 |
| 13 | Alhambra Gardens | SNF | Inactive | 50 | 0 |
| 14 | Sierra Vista B&C | B&C | Inactive | 6 | 0 |

**Hook return pattern:** All hooks return `{ data, isLoading, error }` consistent with React Query conventions. Components show skeleton loading states during data fetch. While mock data won't error, establishing this pattern ensures smooth transition to real Supabase queries in v2.

---

## 12. Constants

```typescript
// src/portal/lib/mobile-docs-constants.ts
// Note: hex values map to Tailwind equivalents — blue-500, emerald-400, violet-400, pink-400, amber-400

export const FACILITY_TYPE_COLORS = {
  SNF: { bg: '#1e3a5f', text: '#60a5fa', fill: '#3b82f6' },
  'Board & Care': { bg: '#1a3a2e', text: '#34d399', fill: '#34d399' },
  Homebound: { bg: '#2d2545', text: '#a78bfa', fill: '#a78bfa' },
};

export const PIPELINE_STATUS_COLORS = {
  Prospecting: { bg: '#3b2f1a', text: '#fbbf24', fill: '#fbbf24' },
  Onboarding: { bg: '#1e3a5f', text: '#60a5fa', fill: '#60a5fa' },
  Active: { bg: '#1a3a2e', text: '#34d399', fill: '#34d399' },
  Inactive: { bg: '#1e293b', text: '#64748b', fill: '#475569' },
};

export const PENETRATION_THRESHOLDS = {
  high: { min: 50, color: '#34d399' },
  medium: { min: 20, color: '#3b82f6' },
  low: { min: 0, color: '#fbbf24' },
};

export const CADENCE_WINDOWS = {
  Weekly: 7,
  Biweekly: 14,
  Monthly: 30,
  Quarterly: 90,
  'As Needed': Infinity,
  TBD: Infinity,
};

export const MOBILE_DOCS_TABS = [
  { id: 'growth', label: 'Growth & Pipeline' },
  { id: 'operations', label: 'Operations & Coverage' },
] as const;

export const ANCILLARY_COLORS = {
  ccm: '#a78bfa',
  rpm: '#f472b6',
  awv: '#fbbf24',
};
```

---

## 13. Verification Plan

### Manual Testing
1. Navigate to `/portal/admin/mobile-docs` — page loads with KPI strip, revenue section, and default Growth tab
2. Verify 5 KPI cards display with values and trend arrows
3. Click 30d / 90d / 12mo toggles — revenue chart updates
4. Verify facility revenue table shows all mock facilities, sorted by revenue descending
5. Switch to Growth & Pipeline tab — pipeline funnel, growth chart, donut, and activity feed render
6. Switch to Operations & Coverage tab — penetration bars, census chart, cadence list, and alerts render
7. Verify sidebar shows "Mobile Docs" entry with MapPin icon
8. Log in as non-admin role — verify Mobile Docs page is not accessible (RoleGuard)

### Build Verification
```bash
bun run type-check    # No TypeScript errors
bun run lint          # No ESLint errors
bun run build         # Production build succeeds
```

### Accessibility
- KPI cards: aria-labels for screen readers
- Charts: alt text descriptions
- Color coding always paired with text/icons (not color-only)
- Tab navigation keyboard accessible (shadcn Tabs handles this)
