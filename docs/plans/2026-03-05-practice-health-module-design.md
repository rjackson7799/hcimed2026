# Practice Health Module — Design & Implementation Plan

## Context

HCI Medical Group needs an AI-powered analytics platform to transform raw eClinicalWorks (eCW) report data into actionable operational intelligence. The current EMR provides extensive raw data tables but no narrative insights, trend analysis, forecasting, or consolidated practice health views. This module addresses that gap by ingesting 3 eCW report exports, calculating KPIs, generating AI-powered insights via Claude API, and presenting everything in a role-based dashboard.

Full PRD: `docs/Practice_Health_Module_PRD_v1.0.md`

---

## Development Roadmap (All Phases)

### Phase 1 — Foundation (CURRENT)
Core data ingestion, KPI engine, AI insight generation, and role-based dashboards.
- Smart report detection and ingestion for 3 eCW report types (371.02, 36.14, 4.06)
- Data validation, duplicate prevention, PHI rejection
- KPI calculation engine: visits/day, RVUs, wRVUs, revenue estimates, payer mix, collection rates
- Provider-level productivity tracking with part-time schedule awareness
- Service line segmentation (HCI Office vs. Mobile Docs)
- AI insight layer via Claude API (daily narratives, operational recommendations)
- Role-based access: Admin (full) and Medical Director (read-only dashboard + upload history)
- Tabbed admin dashboard: Overview, Providers, Financial, Operations

### Phase 2 — Communication & Planning
Automated reporting, alerting, and workforce planning.
- Daily/weekly/monthly email digests to Admin and Medical Director (Resend API)
- Productivity alerts when metrics trend below configurable thresholds
- Vacation/time-off management integrated with forecasting engine
- Schedule-adjusted productivity projections
- New tables: `ph_email_digests`, `ph_time_off_requests`, `ph_alerts`

### Phase 3 — Optimization & Simulation
Scenario modeling, incentive tracking, and deeper AI recommendations.
- Scenario simulator: add provider, increase volume, weekend hours, payer mix shifts
- Bonus/incentive threshold tracking with provider-facing progress dashboards
- Provider role added (sees own metrics only)
- What-if analysis engine with configurable parameters
- New tables: `ph_scenarios`, `ph_bonus_thresholds`, `ph_bonus_tracking`

### Phase 4 — Quality, Expansion & SaaS
Patient feedback, multi-practice support, and standalone product abstraction.
- Patient feedback survey system (text/email, no PHI)
- Balanced scorecard: volume + revenue + quality metrics
- Multi-tenant SaaS architecture with `tenant_id` activation
- EMR adapter framework for systems beyond eCW
- Specialty-specific benchmarking
- New tables: `ph_surveys`, `ph_tenants`, `ph_emr_adapters`

---

## Phase 1 — Detailed Implementation

---

## Decisions

| Decision | Choice |
|----------|--------|
| Phase scope | Phase 1 only |
| Roles | Admin (full access + uploads) and Medical Director (read-only dashboard) |
| Coordinator role | Not needed — Admin handles uploads |
| Medical Director implementation | Existing `admin` role + `title: 'Medical Director'` (already in USER_TITLE enum) |
| AI trigger | Auto-generate insights after upload, cache in DB |
| RVU data | CSV seed file, admin can upload CMS updates annually |
| Deployment | Same Vercel app, new portal module at `/portal/practice-health` |
| Dashboard layout | Tabbed single page: Overview, Providers, Financial, Operations |
| AI model | Claude (Anthropic API) via `@anthropic-ai/sdk` |

---

## File Structure

All new code under `src/portal/` following existing conventions (named exports, lazy loading, React Query hooks, Zod schemas).

```
src/portal/
├── components/practice-health/
│   ├── PracticeHealthTabs.tsx          # Tabbed container
│   ├── ReportUploader.tsx              # Smart upload with auto-detection + PHI rejection
│   ├── ReportUploadHistory.tsx         # Upload history table
│   ├── SummaryHeader.tsx               # Date selector + service line toggle + KPI cards
│   ├── KpiMetricCard.tsx               # Metric card with trend arrow
│   ├── AiInsightsPanel.tsx             # AI narrative + alerts + recommendations
│   ├── AiInsightCard.tsx               # Single expandable insight
│   ├── ProviderProductivityTable.tsx    # Provider comparison with sparklines
│   ├── ProviderSparkline.tsx           # Inline 30-day recharts sparkline
│   ├── ChargesCollectionsChart.tsx      # Line chart
│   ├── PayerMixChart.tsx               # Donut chart
│   ├── RevenueCycleLagChart.tsx         # Bar chart
│   ├── VisitVolumeChart.tsx            # Bar chart
│   ├── NoShowTrendChart.tsx            # Line chart
│   ├── WaitTimeDurationChart.tsx        # Combined chart
│   ├── ScheduleUtilizationChart.tsx     # Bar chart
│   ├── EmLevelDistribution.tsx          # Stacked bar
│   ├── ServiceLineToggle.tsx            # All | HCI Office | Mobile Docs
│   └── DateRangeSelector.tsx            # Day/week/month/custom
├── hooks/
│   ├── usePracticeHealthUpload.ts       # Upload mutation + client-side pipeline
│   ├── usePracticeHealthUploads.ts      # Upload history query
│   ├── useKpiData.ts                    # KPI snapshots with filters
│   ├── useProviderProductivity.ts       # Provider metrics + sparkline data
│   ├── useFinancialMetrics.ts           # Collections, payer mix, AR
│   ├── useOperationalMetrics.ts         # Visit volume, no-shows, wait times
│   ├── useAiInsights.ts                 # Cached AI insights query + regenerate mutation
│   ├── usePracticeProviders.ts          # Provider roster query
│   └── useRvuLookup.ts                 # RVU table management
├── lib/
│   ├── report-detection.ts              # Column signature matching
│   ├── report-parsers.ts               # Parse + normalize + clean per report type
│   ├── phi-scanner.ts                   # PHI column header blacklist
│   ├── kpi-calculator.ts               # KPI formulas (used server-side)
│   └── practice-health-constants.ts     # Signatures, PHI blacklist, benchmarks
├── schemas/
│   ├── chargesReportSchema.ts           # Zod for 371.02 rows
│   ├── collectionsReportSchema.ts       # Zod for 36.14 rows
│   ├── productivityReportSchema.ts      # Zod for 4.06 rows
│   ├── providerSchema.ts               # Provider roster
│   └── rvuLookupSchema.ts              # RVU CSV validation
├── pages/
│   └── PracticeHealthPage.tsx           # Route-level page with tabs
├── types/
│   └── practice-health.ts              # All TypeScript interfaces
└── utils/
    └── practice-health-formatters.ts    # Currency, duration, %, RVU formatters

api/
├── practice-health-upload.ts            # Validate + insert + calculate KPIs
├── practice-health-ai-insights.ts       # Claude API structured prompt + cache
└── practice-health-rvu-upload.ts        # RVU seed/update
```

---

## Database Schema (Supabase)

**8 new tables**, all prefixed `ph_` to namespace from existing outreach tables.

### Core Tables

**`ph_uploads`** — tracks every file upload
- id (UUID PK), uploaded_by (FK profiles), upload_date, report_type ('371.02'|'36.14'|'4.06'|'rvu'), file_name, file_size_bytes, status ('processing'|'success'|'error'|'duplicate'), row_count, date_range_start/end, validation_errors (JSONB), error_message, overwritten_upload_id

**`ph_providers`** — provider roster with schedule config
- id (UUID PK), name, normalized_name, npi, role ('physician'|'np'|'pa'), employment_type ('w2'|'1099'), scheduled_days_per_week (NUMERIC), fte (GENERATED as days/5.0), service_lines (TEXT[]), is_active, hire_date

**`ph_facilities`** — facility registry with POS-to-service-line mapping
- id (UUID PK), name, normalized_name, pos_code (INT), service_line ('hci_office'|'mobile_docs'), address, is_active

**`ph_rvu_lookup`** — CMS Physician Fee Schedule reference
- id (UUID PK), cpt_code, description, work_rvu, practice_expense_rvu, malpractice_rvu, total_rvu, conversion_factor, effective_date. UNIQUE(cpt_code, effective_date)

**`ph_charges`** — line-item billing from 371.02
- id (UUID PK), upload_id (FK), service_date, claim_date, facility, facility_pos, service_line, rendering_provider, provider_id (FK ph_providers), cpt_code, cpt_description, cpt_group, primary_payer, secondary_payer, icd_codes[], icd_names[], billed_charge, payer_charge, self_charge, units, modifiers[], is_billable, work_rvu, total_rvu

**`ph_collections`** — financial summary from 36.14
- id (UUID PK), upload_id (FK), period_start, period_end, facility, service_line, charges, payer_charges, self_charges, payments, payer_payments, patient_payments, contractual_adj, payer_withheld, writeoffs, refunds, claim_count, patient_count, ar_change

**`ph_productivity`** — appointment-level data from 4.06
- id (UUID PK), upload_id (FK), appointment_date, facility, service_line, rendering_provider, provider_id (FK), visit_type, visit_status, is_televisit, scheduled_duration_min, actual_duration_min, variance_min, wait_time_min, clinician_time_min, appointment_start_time, appointment_end_time

**`ph_kpi_daily`** — pre-computed daily KPI snapshots
- id (UUID PK), date, provider_id (FK), service_line. Volume: visits, no_shows, cancellations, televisits, new_patients, established_patients. Financial: billed_amount, est_collections, revenue_per_visit. Productivity: rvu_total, wrvu_total, avg_visit_duration_min, avg_wait_time_min, avg_clinician_time_min, schedule_utilization. Clinical: avg_diagnoses_per_encounter, quality_code_encounters, total_encounters. UNIQUE(date, provider_id, service_line)

**`ph_ai_insights`** — cached AI-generated insights
- id (UUID PK), insight_date, insight_type ('daily_summary'|'recommendation'|'trend'|'alert'), service_line, category ('productivity'|'revenue'|'coding'|'efficiency'), severity ('critical'|'warning'|'info'), title, narrative, supporting_data (JSONB), generated_by_upload_id (FK), model_version

### RLS Policies
All `ph_` tables: admin role gets full CRUD. Non-admin roles get no access (no policy = no rows returned).

---

## Data Flow

```
Admin uploads CSV/Excel
        │
        ▼
[Client-side pipeline]
  1. Parse (PapaParse / xlsx)
  2. PHI scan → reject if patient columns found
  3. Report type auto-detection via column signatures
  4. Zod validation per report type
  5. Data cleaning (names, dates, currency, durations)
        │
        ▼
POST /api/practice-health-upload
  1. Auth verify (admin role)
  2. Create ph_uploads record (status: processing)
  3. Insert rows → ph_charges / ph_collections / ph_productivity
  4. For charges: RVU lookup + provider matching
  5. Calculate KPIs → upsert ph_kpi_daily
  6. Update ph_uploads status → success
        │
        ▼
POST /api/practice-health-ai-insights (triggered on upload success)
  1. Fetch current + historical KPI data
  2. Build structured prompt with practice context
  3. Call Anthropic API (Claude)
  4. Parse response → insert ph_ai_insights
        │
        ▼
Dashboard reads pre-computed ph_kpi_daily + cached ph_ai_insights
```

---

## Dashboard Layout

Tabbed single page at `/portal/practice-health`:

```
┌─────────────────────────────────────────────────┐
│ Summary Header                                  │
│ [Date Selector]  [Service Line: All|HCI|Mobile] │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │Visits│ │Billed│ │Est.  │ │wRVUs │ │Coll. │  │
│ │  ▲8% │ │ ▲12% │ │Coll. │ │ ▼3%  │ │Rate  │  │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
├─────────────────────────────────────────────────┤
│ [Overview] [Providers] [Financial] [Operations] │
├─────────────────────────────────────────────────┤
│ Tab content (charts + tables per tab)           │
│                                                 │
│ Overview: AI Insights + Visit Volume + Charges  │
│ Providers: Productivity Table + E/M Dist        │
│ Financial: Charges vs Collections, Payer Mix,   │
│            Revenue Cycle Lag                    │
│ Operations: Visit Volume, No-Shows, Wait Times, │
│             Schedule Utilization                │
└─────────────────────────────────────────────────┘
│ [Upload Report] button → opens dialog           │
└─────────────────────────────────────────────────┘
```

---

## Implementation Sequence

### Step 1: Database + Types + Seed Data ✅ COMPLETE (2026-03-05)
- SQL migration applied: 9 `ph_` tables + indexes + RLS policies + `updated_at` trigger
- `src/portal/types/practice-health.ts` — all TypeScript interfaces
- Updated `src/portal/types/database.ts`, `enums.ts`, `index.ts`
- Created `src/portal/lib/practice-health-constants.ts` + `src/portal/utils/practice-health-formatters.ts`
- Seeded: 3 providers, 3 facilities, 35 RVU codes (E/M, home visits, SNF, CCM, RPM, AWV, TCM, G2211)
- Migration file: `docs/migrations/2026-03-05-practice-health-tables.sql`

### Step 2: Report Ingestion Pipeline ✅ COMPLETE (2026-03-05)
- `lib/phi-scanner.ts` — PHI column blacklist checker (24-pattern normalized matching)
- `lib/report-detection.ts` — column signature matching with confidence scoring
- `lib/report-parsers.ts` — unified CSV/Excel pipeline with PapaParse + xlsx
- Zod schemas: `chargesReportSchema.ts`, `collectionsReportSchema.ts`, `productivityReportSchema.ts`
- `api/practice-health-upload.ts` — serverless upload handler (auth, dedup, provider matching, RVU lookup, batch insert, KPI calc)
- `ReportUploader` + `ReportUploadHistory` components
- `usePracticeHealthUpload` + `usePracticeHealthUploads` hooks

### Step 3: KPI Engine ✅ COMPLETE (2026-03-05, integrated into Step 2)
- KPI calculation in `api/practice-health-upload.ts` — runs synchronously after data insert
- Calculates volume, financial, productivity, operational, clinical KPIs per (date, provider_id, service_line)
- Upserts into `ph_kpi_daily` using UNIQUE constraint
- Dashboard query hooks to be created in Step 4

### Step 4: Dashboard UI
- `PracticeHealthPage.tsx` (route-level, tabbed)
- `SummaryHeader`, `DateRangeSelector`, `ServiceLineToggle`, `KpiMetricCard`
- Overview tab charts
- Providers tab: `ProviderProductivityTable` with `ProviderSparkline`, `EmLevelDistribution`
- Financial tab: `ChargesCollectionsChart`, `PayerMixChart`, `RevenueCycleLagChart`
- Operations tab: `VisitVolumeChart`, `NoShowTrendChart`, `WaitTimeDurationChart`, `ScheduleUtilizationChart`

### Step 5: AI Insight Layer
- `api/practice-health-ai-insights.ts` — Claude API serverless function with structured prompt
- `useAiInsights` + `useGenerateAiInsights` hooks
- `AiInsightsPanel` + `AiInsightCard` components
- Auto-trigger after upload success

### Step 6: Integration
- Add route to `App.tsx` with lazy loading + RoleGuard
- Add sidebar nav item to `PortalSidebar.tsx` (Activity icon)
- Add `@anthropic-ai/sdk` dependency
- Add `ANTHROPIC_API_KEY` to Vercel env vars
- End-to-end testing with sample eCW exports

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Client-side parsing | Immediate validation feedback (PHI, format). Existing CsvUploader pattern. Small file sizes (max 10MB, 5000 rows) |
| KPI calc in upload function | Small data volume (3 providers). Synchronous = dashboard immediately current. No job queue needed on Vercel |
| Pre-computed ph_kpi_daily | Dashboard reads pre-computed snapshots — sub-2s load times. No complex aggregation queries at render time |
| `ph_` table prefix | Namespaces from existing outreach tables. Clean separation |
| No separate upload page | Admin uploads from dashboard dialog. No Coordinator role = no separate upload-only interface |
| recharts for all charts | Already a dependency, used extensively in existing dashboard |
| xlsx (SheetJS) for Excel | Already in package.json. Same validation pipeline as CSV |

---

## New Dependencies

- `@anthropic-ai/sdk` — Anthropic API client for AI insight serverless function

## Environment Variables

- `ANTHROPIC_API_KEY` — add to Vercel env vars

## Files to Modify

- [App.tsx](src/App.tsx) — add practice health route
- [PortalSidebar.tsx](src/portal/components/layout/PortalSidebar.tsx) — add nav item
- [database.ts](src/portal/types/database.ts) — add new table types
- [enums.ts](src/portal/types/enums.ts) — add practice health enums if needed

## Verification

1. Upload a sample 371.02 CSV → verify PHI rejection, auto-detection, validation, data insertion
2. Upload 36.14 and 4.06 CSVs → verify KPI calculation populates ph_kpi_daily
3. Verify dashboard loads with correct metrics, charts render, date/service line filters work
4. Verify AI insights generate after upload and display in panel
5. Verify Medical Director (admin + title) sees dashboard + read-only upload history, but Upload button is hidden
6. Verify non-admin users cannot access /portal/practice-health
7. Run `bun run build` and `bun run type-check` for clean compilation

---

## Phase 2–4 Notes

Phases 2–4 will be planned and implemented in separate conversations. The database schema was designed from the outset to accommodate all phases — future-phase tables (`ph_email_digests`, `ph_alerts`, `ph_scenarios`, `ph_bonus_thresholds`, etc.) will be added via incremental migrations when those phases begin.

See the full PRD for detailed requirements: `docs/Practice_Health_Module_PRD_v1.0.md`
