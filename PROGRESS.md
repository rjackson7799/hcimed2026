# Development Progress

Tracking document for Pasadena Health Hub (hcimed.com) development.

**Last updated:** 2026-03-05

---

## Current State

### Completed Features

- [x] Core site structure and HCI branding (Layout, Header, Footer)
- [x] Home page with hero, services overview, and CTAs
- [x] Our Story page with Dr. Jackson and Apple Evangelista NP bios
- [x] Contact page with email form (Resend integration)
- [x] FAQ page
- [x] Appointment request form (new/existing patient flow, email notification)
- [x] Multi-step careers application form (5 steps: personal info, position, qualifications, documents, review)
- [x] Internal Medicine service pages (Physical Exams, Acute Care, Women's Health, Men's Health, Diagnostics)
- [x] Senior Care Plus program page
- [x] Senior Care service pages (Prevention/Wellness, Chronic Care, Transition Care, Remote Monitoring)
- [x] Insurance Update page with alert banner
- [x] Markdown blog system with frontmatter parsing
- [x] SEO infrastructure (meta tags, sitemap, structured data, robots.txt)
- [x] Accessibility controls (font size, high contrast, reduced motion)
- [x] Mobile responsive design with sticky footer CTAs
- [x] Cookie consent banner
- [x] Vercel deployment with Bun
- [x] Domain setup with redirects (hcimedgroup.com → hcimed.com)
- [x] Security headers (X-Frame-Options, XSS Protection, etc.)
- [x] Branded confirmation emails for contact and careers forms
- [x] Vercel serverless API functions (3 endpoints)
- [x] Skip-to-content keyboard navigation

### Patient Outreach Tracking Portal (`src/portal/`)

- [x] **Milestone 0:** Supabase client, type foundations, enums, formatters, constants
- [x] **Milestone 1:** Dual-path auth (`/hci-login`, `/partner-login`), session timeout (30 min), role-based guards
- [x] **Milestone 2:** Portal shell with shadcn Sidebar, role-aware navigation, mobile bottom nav
- [x] **Milestone 3:** Admin project CRUD, CSV upload with validation/dedup, staff assignment, user management
- [x] **Milestone 4:** Staff patient queue (search, filter, pagination), one-tap call logging with dispositions, call history
- [x] **Milestone 5:** Broker forwarding, broker portal, email notifications, messaging
- [x] **Milestone 6:** Admin dashboard with real-time charts, CSV export, staff activity tracking
- [x] **Milestone 7:** Audit log viewer, print styles, HIPAA compliance polish

### Practice Health Module (`src/portal/` — Phase 1 in progress)

AI-powered analytics platform for eClinicalWorks data. Transforms raw billing, collections, and productivity reports into KPIs, dashboards, and AI-generated insights.

- [x] **Step 1:** Database schema + types + seed data *(migration applied 2026-03-05)*
  - 9 Supabase tables (`ph_` prefix): uploads, providers, facilities, rvu_lookup, charges, collections, productivity, kpi_daily, ai_insights
  - RLS policies: admin role gets full CRUD on all `ph_` tables; non-admin gets no access
  - TypeScript interfaces, enums, constants, formatters
  - SQL migration with indexes, `updated_at` trigger, seed data (3 providers, 3 facilities, 35 RVU codes)
- [x] **Step 2:** Report ingestion pipeline + KPI calculation *(2026-03-05)*
  - PHI scanner (`phi-scanner.ts`): column header blacklist with normalized matching
  - Report auto-detection (`report-detection.ts`): column signature matching for 371.02, 36.14, 4.06
  - 3 Zod schemas: `chargesReportSchema.ts`, `collectionsReportSchema.ts`, `productivityReportSchema.ts`
  - Report parsers (`report-parsers.ts`): CSV/Excel parsing, validation, cleaning, duplicate detection, service line mapping
  - Upload API (`api/practice-health-upload.ts`): auth, duplicate check, provider matching, RVU lookup, batch insert, KPI calculation + upsert
  - React Query hooks: `usePracticeHealthUpload` (mutation) + `usePracticeHealthUploads` (history query)
  - UI: `ReportUploader` (drag-and-drop with PHI rejection, auto-detection badge, validation preview, period date picker for 36.14) + `ReportUploadHistory` (status table)
  - KPI engine integrated into upload API (Step 3 combined): calculates volume, financial, productivity, clinical KPIs per date/provider/service_line
- [x] **Step 3:** KPI calculation engine *(included in Step 2 upload API)*
- [x] **Step 4:** Dashboard UI + route integration *(2026-03-05)*
  - 5 React Query hooks: `useKpiData` (aggregated KPIs + trend), `usePracticeProviders`, `useProviderProductivity` (per-provider metrics + sparklines), `useFinancialMetrics` (charges/collections, payer mix, revenue cycle lag), `useOperationalMetrics` (visit volume, no-shows, wait times, utilization)
  - `PracticeHealthPage` — route-level tabbed page (Overview, Providers, Financial, Operations) with `SummaryHeader` (date range selector, service line toggle, 5 KPI metric cards with trend arrows, Upload Report dialog)
  - Overview tab: `VisitVolumeChart` (stacked bar) + `ChargesCollectionsChart` (dual-line) + `ReportUploadHistory`
  - Providers tab: `ProviderProductivityTable` (with inline `ProviderSparkline`, benchmark badges) + `EmLevelDistribution` (stacked bar per provider)
  - Financial tab: `ChargesCollectionsChart` + `PayerMixChart` (donut) + `RevenueCycleLagChart` (bar with benchmark)
  - Operations tab: `VisitVolumeChart` + `NoShowTrendChart` (line with threshold) + `WaitTimeDurationChart` (composed bar+line) + `ScheduleUtilizationChart` (bar with target)
  - Route at `/portal/admin/practice-health` with `RoleGuard` (admin only), lazy-loaded in `App.tsx`
  - Sidebar nav item with Activity icon in `PortalSidebar.tsx`
- [ ] **Step 5:** AI insight layer (Claude API via Anthropic SDK)
- [ ] **Step 6:** End-to-end testing

Full design: `docs/plans/2026-03-05-practice-health-module-design.md`
Full PRD: `docs/Practice_Health_Module_PRD_v1.0.md`

### Known Issues / Recent Fixes

- Fixed careers form auto-submit bug on Step 5 (2026-01-12)
- Fixed careers form resume requirement and early submission (2026-01-12)
- Fixed Resend email from address to use verified domain (2026-01-12)
- Fixed user deactivation status not updating in UI (2026-02-25) — RLS policy + optimistic cache fix
- Added hard-delete for inactive users with audit log preservation (2026-02-25)

---

## Upcoming Development Tasks

### Practice Health Module
- [ ] Phase 1: Foundation — Steps 1-4 complete; AI insights remaining (IN PROGRESS)
- [ ] Phase 2: Communication & Planning — email digests, alerts, vacation management
- [ ] Phase 3: Optimization & Simulation — scenario simulator, bonus/incentive tracking
- [ ] Phase 4: Quality, Expansion & SaaS — patient surveys, multi-tenant, EMR adapters

### Patient Outreach Portal
- [x] All 8 milestones complete (MVP feature-complete)
- [ ] Phase 2: Dark mode, notification bell, bulk actions, keyboard shortcuts
- [ ] Phase 2: Offline-resilient logging, data anonymization, cross-project search

### Content & Blog
- [ ] _Add tasks here_

### Feature Enhancements
- [ ] _Add tasks here_

### Performance & Technical
- [ ] _Add tasks here_

### SEO & Analytics
- [ ] _Add tasks here_

### Accessibility
- [ ] _Add tasks here_

### Infrastructure
- [ ] _Add tasks here_

---

## Changelog

### 2026-03-05
- **Practice Health Module — Step 4 (Dashboard UI + Route Integration):**
  - 5 data hooks: `useKpiData` (current/previous period aggregation for trend arrows), `usePracticeProviders` (active roster), `useProviderProductivity` (per-provider metrics with 30-day sparkline data and benchmark status), `useFinancialMetrics` (charges/collections time series, payer mix from `ph_charges`, revenue cycle lag), `useOperationalMetrics` (visit volume, no-show rate, wait time/duration, schedule utilization)
  - `SummaryHeader` with `DateRangeSelector` (Day/Week/Month presets + custom), `ServiceLineToggle` (All/HCI Office/Mobile Docs), 5 `KpiMetricCard` components (Visits, Billed, Est. Collections, wRVUs, Collection Rate) with color-coded trend arrows via `formatTrend()`
  - `PracticeHealthPage` — tabbed page using shadcn Tabs with 4 tabs: Overview, Providers, Financial, Operations
  - Overview tab: `VisitVolumeChart` (stacked bar — new vs established), `ChargesCollectionsChart` (dual-line), `ReportUploadHistory`
  - Providers tab: `ProviderProductivityTable` (visits, visits/day, wRVUs, wRVU/day, billed, avg wait, inline `ProviderSparkline`, benchmark color badges), `EmLevelDistribution` (stacked bar 99211-99215 per provider)
  - Financial tab: `ChargesCollectionsChart`, `PayerMixChart` (donut with top 8 payers), `RevenueCycleLagChart` (bar with 45-day benchmark line)
  - Operations tab: `VisitVolumeChart`, `NoShowTrendChart` (line with 20% threshold), `WaitTimeDurationChart` (composed bar+line with 15-min benchmark), `ScheduleUtilizationChart` (bar with 85% target)
  - Lazy route at `/portal/admin/practice-health` with `RoleGuard` (admin only)
  - Sidebar nav: "Practice Health" with Activity icon added to `adminNav` in `PortalSidebar.tsx`
  - Upload Report button in `SummaryHeader` opens `ReportUploader` in a shadcn Dialog
  - Type-check and build pass clean

- **Practice Health Module — Step 2+3 (Report Ingestion Pipeline + KPI Engine):**
  - PHI scanner: scans column headers against 24-pattern blacklist, rejects files with patient-identifiable data
  - Report auto-detection: matches file headers against column signatures to identify report type (371.02 Charges, 36.14 Financial, 4.06 Productivity) with confidence score
  - 3 Zod validation schemas for each report type with currency/duration/date parsing transforms
  - Report parsers: unified CSV/Excel pipeline using PapaParse + xlsx, with date validation, duplicate detection, provider name normalization, service line mapping (POS codes), billability detection
  - Serverless upload API (`api/practice-health-upload.ts`): admin auth, duplicate check against DB, provider matching, RVU lookup, batch inserts (100/batch), KPI calculation and upsert into `ph_kpi_daily`
  - KPI engine: calculates volume (visits, no-shows, cancellations, televisits, new/established), financial (billed, est. collections, revenue/visit), productivity (RVU, wRVU), operational (avg duration, wait time, clinician time, schedule utilization), and clinical (diagnoses/encounter, quality codes) metrics
  - React Query hooks: `usePracticeHealthUpload` (mutation with client-side parsing + server upload), `usePracticeHealthUploads` (history query)
  - ReportUploader component: drag-and-drop (CSV/Excel), PHI rejection alert, detection badge with confidence, validation summary, data preview table, period date picker for collections reports, upload progress states
  - ReportUploadHistory component: table with status badges, report type labels, date ranges
  - Type-check and build pass clean

- **Practice Health Module — Step 1 (Database + Types + Seed Data):**
  - Created design doc with full 4-phase roadmap: `docs/plans/2026-03-05-practice-health-module-design.md`
  - SQL migration: 9 tables (`ph_uploads`, `ph_providers`, `ph_facilities`, `ph_rvu_lookup`, `ph_charges`, `ph_collections`, `ph_productivity`, `ph_kpi_daily`, `ph_ai_insights`) with indexes, RLS policies, and `updated_at` trigger
  - Seed data: 3 providers (Medical Director, NP 1, NP 2), 3 facilities (HCI Office, Elegant Care Villa, Home Visit), 35 common RVU codes (E/M, home visits, SNF, CCM, RPM, AWV, TCM)
  - TypeScript types: `src/portal/types/practice-health.ts` — all row types, UI types, upload pipeline types
  - Updated `database.ts` with 9 new table type stubs, `enums.ts` with practice health enums
  - Created `src/portal/lib/practice-health-constants.ts` — report signatures, PHI blacklist, POS mapping, benchmarks, dashboard config
  - Created `src/portal/utils/practice-health-formatters.ts` — currency, RVU, duration, percentage, trend formatters
  - Fixed `.env.local` — added `ANTHROPIC_API_KEY` variable name (was missing)
  - Type-check passes clean

### 2026-03-04
- **Feature:** Added `title` field to user profiles for admin sub-labels (Administrator, Medical Director). Role (`admin`) unchanged for permissions; `title` is display-only. Invite dialog shows a Title dropdown when Admin role is selected. Title displayed in user management table, sidebar header, and all role-label surfaces. Extensible to other roles in the future. Requires Supabase migration: `ALTER TABLE profiles ADD COLUMN title TEXT DEFAULT NULL;`

### 2026-02-25
- **Bug fix:** User deactivation status badge now updates immediately in the admin UI. Root cause: Supabase RLS policy (`is_active = true`) was filtering deactivated users out of the refetch, wiping the optimistic update. Fix: removed `invalidateQueries` from `useDeactivateUser` so the optimistic cache persists as the source of truth until page reload.
- **Feature:** Added hard-delete for deactivated users (`api/delete-user.ts`). Admin sees a Trash2 icon on inactive user rows. Deletion removes the user from Supabase Auth and profiles, while preserving audit_log history.
- **Fix:** `isMounted` guard added to `AuthContext` to prevent state updates on unmounted component during async profile fetches.
- **Docs:** Added `docs/deactivation-bug.md` with full root cause analysis and troubleshooting log.

### 2026-02-24
- **Portal Milestone 7:** Audit log viewer, print styles, HIPAA compliance polish, CLAUDE.md portal docs
- **Portal Milestone 6:** Admin dashboard with recharts (donut, bar, funnel), Supabase Realtime subscriptions, CSV export
- **Portal Milestone 5:** Broker forwarding with email (Resend API), broker portal with status updates and messaging
- **Portal Milestone 4:** Staff patient queue with search/filter/pagination, one-tap call logging with color-coded dispositions, call history timeline
- **Portal Milestone 3:** Admin project management, CSV upload with papaparse validation, staff assignment UI
- **Portal Milestone 2:** Portal shell with shadcn Sidebar, role-aware navigation (admin/staff/broker), mobile bottom nav
- **Portal Milestone 1:** Dual-path authentication (/hci-login, /partner-login), 30-min session timeout with warning, role guards
- **Portal Milestone 0:** Supabase client, TypeScript types/enums, formatters, status constants

### 2026-01-29
- Added SEO improvements, markdown blog system, and location badge

### 2026-01-28
- Updated insurance alert for Optum patients
- Improved insurance update page layout and contact info

### 2026-01-15
- Added insurance update alert banner and Regal Medical Group announcement page

### 2026-01-12
- Fixed careers form auto-submit bug on Step 5
- Fixed careers form resume requirement and early submission
- Added branded confirmation emails for contact and careers forms
- Fixed Resend email from address issues
- Updated email recipients and careers form submission

### 2026-01-11
- Added mobile UX improvements: sticky CTAs, cookie consent, collapsible menus
- Added Careers and Appointments pages
- Updated Our Story with team bios

### 2025-12-11
- Initial site build with HCI branding and core pages
