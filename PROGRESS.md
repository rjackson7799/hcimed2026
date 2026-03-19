# Development Progress

Tracking document for Pasadena Health Hub (hcimed.com) development.

**Last updated:** 2026-03-18

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
- [x] Vercel deployment with Bun (two projects: hcimed.com + portal.hcimed.com)
- [x] Bun workspace monorepo (apps/public, apps/portal, packages/shared)
- [x] Domain setup with redirects (hcimedgroup.com → hcimed.com)
- [x] Security headers (X-Frame-Options, XSS Protection, etc.)
- [x] Branded confirmation emails for contact and careers forms
- [x] Vercel serverless API functions (3 endpoints)
- [x] Skip-to-content keyboard navigation

### Monorepo Migration & Portal Subdomain (2026-03-18)

- [x] **Restructured to Bun workspace monorepo** — single SPA split into two Vite apps + shared package
  - `apps/public` → hcimed.com (marketing site, port 8080)
  - `apps/portal` → portal.hcimed.com (internal portal, port 8081)
  - `packages/shared` → @hci/shared (shadcn/ui components, cn(), hooks, Tailwind preset)
- [x] **Security isolation** — Supabase keys, auth logic, and portal deps (recharts, papaparse, leaflet, anthropic SDK) no longer shipped in the public site bundle
- [x] **Portal deployed to `portal.hcimed.com`** — separate Vercel project with HIPAA-hardened headers (`X-Robots-Tag: noindex`, `Referrer-Policy: same-origin`, strict CSP)
- [x] **Portal routes simplified** — dropped `/portal` prefix (now `/admin`, `/staff`, `/broker`, `/login`)
- [x] **Auth paths updated** — `getLoginPath()` returns `/login` instead of `/hci-login`, AuthGuard broker detection fixed
- [x] **CRON_SECRET security fix** — made authentication check unconditional (was previously skipped when env var missing)
- [x] **Public site CSP cleaned** — removed Supabase domains from `connect-src`
- [x] **301 redirects** — `/hci-login` → `portal.hcimed.com/login`, `/portal/*` → `portal.hcimed.com/*`
- [x] **Supabase Site URL** — updated to `https://portal.hcimed.com` with redirect URLs configured
- [x] **DNS** — `portal.hcimed.com` CNAME configured in GoDaddy, SSL cert issued by Vercel

Design spec: `docs/superpowers/specs/2026-03-18-portal-subdomain-migration-design.md`

### Patient Outreach Tracking Portal (`apps/portal/`)

- [x] **Milestone 0:** Supabase client, type foundations, enums, formatters, constants
- [x] **Milestone 1:** Dual-path auth (`/login`, `/partner-login` on portal.hcimed.com), session timeout (30 min), role-based guards
- [x] **Milestone 2:** Portal shell with shadcn Sidebar, role-aware navigation, mobile bottom nav
- [x] **Milestone 3:** Admin project CRUD, CSV upload with validation/dedup, staff assignment, user management
- [x] **Milestone 4:** Staff patient queue (search, filter, pagination), one-tap call logging with dispositions, call history
- [x] **Milestone 5:** Broker forwarding, broker portal, email notifications, messaging
- [x] **Milestone 6:** Admin dashboard with real-time charts, CSV export, staff activity tracking
- [x] **Milestone 7:** Audit log viewer, print styles, HIPAA compliance polish

### Practice Health Module (`apps/portal/`)

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
- [x] **Step 5:** AI insight layer + executive summary *(2026-03-12)*
  - AI Insights API (`api/generate-insights.ts`): fetches KPI data via shared `ph-report-data.ts` helpers, sends to Claude API (Anthropic SDK), stores structured insights in `ph_ai_insights`
  - `AiInsightsCard` component: displays AI-generated insights (highlights, opportunities, alerts) on Overview tab with regenerate button
  - `usePracticeHealthInsights` hook: `useAiInsights` (query) + `useGenerateInsights` (mutation)
  - Executive Summary API (`api/practice-health-summary.ts`): GET returns PDF download, POST emails PDF to recipients via Resend
  - PDF generation (`api/lib/ph-report-executive-pdf.ts`): income streams, provider productivity, operational summary, outreach projects, AI insights
  - Shared data layer (`api/lib/ph-report-data.ts` + `ph-report-types.ts`): reusable Supabase query helpers for KPI, provider, operational, payer, outreach, and insights data
  - `EmailSummaryModal` component: multi-recipient email dialog with auto-populated admin emails
  - `SummaryHeader` enhanced: Download Summary (PDF) + Email Summary buttons alongside Upload Report
  - `usePracticeHealthSummary` hook: `useDownloadSummary` + `useEmailSummary` mutations
- [ ] **Step 6:** End-to-end testing

Full design: `docs/plans/2026-03-05-practice-health-module-design.md`
Full PRD: `docs/Practice_Health_Module_PRD_v1.0.md`

### AWV Tracker Module (`src/portal/components/awv-tracker/`)

Patient eligibility, completion tracking, and revenue attribution for Medicare Annual Wellness Visits across HCI Office and Mobile Docs service lines. Replaces spreadsheet tracking with bulk upload from eCW, rolling 12-month eligibility calculations, two-stage workflow, and revenue dashboard.

- [x] **Phase 1:** Patient Registry + Detail Panel (Core CRUD) *(2026-03-12)*
  - Types (`awv-tracker.ts`): 7 enums/literals, CPT code mappings, 5 DB row interfaces, 4 UI types
  - Constants (`awv-tracker-constants.ts`): tab config, status color maps (eligibility + completion), service line config, Medicare status config, completion rate thresholds, eligibility reasons, PHI blacklist, upload columns, reimbursement rates, eligibility timing options
  - Mock data (`awv-tracker-mock-data.ts`): 17 patients (8 HCI Office, 8 Mobile Docs, 1 inactive), 3 providers, 8 facilities, tracking records in various states; mutable arrays for session-persistent CRUD
  - Zod schemas (`awvPatientSchema.ts`): 4 schemas — add patient (3-step with Mobile Docs facility refinement), eligibility update, schedule, complete
  - 2 React Query hooks: `useAwvRegistry` (filtered/sorted patient list with eligibility timing), `useAwvPatient`, `useAwvKpiSummary`; `useAwvTracking` with 6 mutations (add, eligibility, schedule, complete, status, notes)
  - 8 components: `AwvStatusBadge`, `AwvKpiStrip` (4 cards, revenue admin-only), `AwvFilterBar` (search + chip groups + dropdowns), `AwvPatientTable` (sortable, row click → detail), `AwvDetailPanel` (520px Sheet with eligibility/completion workflow, notes), `AddPatientDialog` (3-step form), `RegistryTab`, `AwvTrackerPage` (3 tabs: Registry, Upload placeholder, Revenue placeholder)
  - Route at `/portal/admin/awv-tracker` with `RoleGuard(['admin', 'staff'])`, lazy-loaded
  - Sidebar nav: "AWV Tracker" with ClipboardCheck icon after Mobile Docs
  - SQL migration (`docs/migrations/2026-03-awv-tracker-tables.sql`): 5 tables, indexes, RLS policies, seed data, updated_at triggers
  - 5 table stubs in `database.ts`
  - 14 new files, 3 modified files; type-check and build pass clean
- [x] **Phase 2:** CSV Upload Tab + Detail Enhancements *(2026-03-12)*
  - Zod schema (`awvUploadSchema.ts`): CSV row validation (required/optional columns, date range checks, CPT code enum), `validateUploadHeaders()` with PHI blacklist rejection and required column check
  - Mock data expansion (`awv-tracker-mock-data.ts`): 3 seed add-on services (depression screening, ACP pair), `processMockUpload()` upsert engine (match by ecw_patient_id, create new patients + tracking, update existing, flag missing, duplicate detection, provider/facility name matching), `getMockAddons()`, `addMockAddon()`, `getMockTrackingHistory()`
  - 5 React Query hooks (`useAwvUpload.ts`): `useAwvUpload` (upload mutation with 500ms simulated latency), `useAwvUploadHistory` (sorted upload log), `useAwvAddons` (per-tracking addons), `useAddAwvAddon` (addon mutation), `useAwvTrackingHistory` (all cycles per patient)
  - `UploadDropZone`: drag-and-drop file input with `onDragOver`/`onDragLeave`/`onDrop` handlers, file size (10MB) and type (.csv/.xlsx) validation, visual drag-over state
  - `UploadTab`: 7-state machine (idle → parsing → phi_error / preview → uploading → success / error), PapaParse CSV parsing, PHI header scan, row-level Zod validation with valid/invalid counts, data preview table (first 10 rows × 6 columns), recognized column highlighting
  - `UploadResultsSummary`: 4 color-coded metric cards (New/Updated/Flagged/Errors), expandable warnings list with "Show all" toggle
  - `UploadHistoryTable`: past uploads table with date, filename, row counts, color-coded status badges (Completed/Warnings/Failed/Processing)
  - `AwvAddonsSection`: add-on services list in detail panel, "Add Service" inline form (CPT dropdown filtering out AWV codes, auto-populated billed amount from rates), only enabled when completion_status = Completed
  - `AwvHistorySection`: chronological tracking cycles per patient, current cycle highlighted with primary border, status badges, AWV type/CPT, billed amounts, notes excerpt, prior AWV dates
  - `AwvTrackerPage` modified: Upload tab placeholder replaced with `<UploadTab />`
  - `AwvDetailPanel` modified: Add-ons/History placeholders replaced with `<AwvAddonsSection />` and `<AwvHistorySection />`
  - 8 new files, 3 modified files; type-check and build pass clean
- [x] **Phase 3:** Revenue Dashboard + Provider Tracking *(2026-03-12)*
  - Types (`awv-tracker.ts`): `AwvMonthlyRevenuePoint` (12-month trend data), `AwvServiceLineSplit` (HCI Office vs Mobile Docs breakdown)
  - Constants (`awv-tracker-constants.ts`): `SERVICE_LINE_CHART_COLORS` hex map for recharts (violet = HCI Office, blue = Mobile Docs)
  - Mock data expansion (`awv-tracker-mock-data.ts`): 3 revenue data generators — `getMockAwvRevenueMetrics()` (aggregated KPIs + per-provider breakdown using completed tracking + addon billed amounts), `getMockAwvMonthlyRevenue()` (12-month bucketed by completion_date), `getMockAwvServiceLineSplit()` (grouped by service_line)
  - 4 React Query hooks (`useAwvRevenue.ts`): `useAwvRevenueMetrics`, `useAwvProviderMetrics`, `useAwvMonthlyRevenue`, `useAwvServiceLineSplit` — all `['awv', 'revenue', ...]` keys, `staleTime: 30_000`
  - `RevenueTab`: main container with role-gated KPI strip (4 cards for admin: Revenue Captured YTD, Revenue Remaining, Total Opportunity, Capture Rate; 3 cards for staff: Completed, Outstanding, Capture Rate), revenue projection banner (year-end projection + 80% target incentive), charts row, provider breakdown section
  - `RevenueTrendChart`: recharts `ComposedChart` with dual Y-axes — violet bars (revenue) + emerald line (AWV count), custom tooltip with revenue/addon/count breakdown
  - `ServiceLineSplitChart`: recharts donut (`PieChart`) with center overlay (total revenue or count based on role), color-coded legend with amounts and percentages
  - `ProviderCompletionTable`: shadcn Table with 7 columns (Provider, Assigned, Eligible, Completed, Completion Rate with colored progress bar, Revenue, Outstanding — last 2 admin-only), sorted by completion rate descending
  - `AwvRevenueSection`: detail panel section (admin-only) showing AWV billed amount, per-addon line items, total, reimbursement reference table; muted placeholder when not completed
  - Modified `AwvTrackerPage` (Revenue tab swap), `AwvDetailPanel` (Revenue section swap)
  - 6 new files, 5 modified files; type-check and build pass clean
- [ ] **Phase 4:** Supabase Integration + Role Refinement — NEXT

Full PRD: `docs/AWV_Tracker_PRD_v1_0.md`

### CCM / RPM Program Tracker (`apps/portal/src/components/ccm-rpm/`)

Combined module for Chronic Care Management and Remote Patient Monitoring enrollment, device tracking, and monthly reimbursement verification. Revenue assurance tool comparing actual EOB collections against expected revenue per enrolled patient.

- [x] **Phase 1:** Foundation — Types, Constants, Page Shell, Routing, Sidebar *(2026-03-13)*
  - Types (`ccm-rpm.ts`): 8 enums/literals, CPT code mappings with bidirectional lookup, 6 DB row interfaces, 8 UI/dashboard types, `getCptCodesForProgram()` helper
  - Constants (`ccm-rpm-constants.ts`): 4-tab config, 5 status color maps (enrollment, program type, device type, device status, service line, Medicare), CPT reimbursement rates (7 codes), collection rate thresholds, enrollment rate targets, disenrollment reasons, PHI blacklist, upload columns
  - `CcmRpmPage`: 4-tab shell (Registry, Enrollment & Devices, Revenue, Upload) with placeholder content
  - Route at `/portal/admin/ccm-rpm` with `RoleGuard(['admin', 'staff'])`, lazy-loaded
  - Sidebar nav: "CCM / RPM" with HeartPulse icon after AWV Tracker
  - 6 table stubs in `database.ts` (ccm_patients, ccm_enrollment, ccm_devices, ccm_reimbursements, ccm_uploads, ccm_reimbursement_rates)
  - 3 new files, 3 modified files; build passes clean
- [x] **Phase 2:** Patient Registry — Mock Data, Hooks, Table, Filters, KPI Strip *(2026-03-13)*
  - Mock data (`ccm-rpm-mock-data.ts`): 18 patients (8 HCI Office, 9 Mobile Docs, 1 inactive), 18 enrollments (8 Enrolled, 5 Eligible, 2 Declined, 2 Disenrolled, 1 Inactive), 8 RPM devices, 32 reimbursement entries, 2 upload records; 24 exported functions (getters, mutations, aggregations, AWV cross-ref)
  - 5 shared ecw_patient_ids with AWV mock data for cross-module linking
  - Zod schemas (`ccmPatientSchema.ts`): 3-step add patient validation with conditional facility (Mobile Docs) and program type (Enrolled) requirements
  - React Query hooks (`useCcmRegistry.ts`): `useCcmRegistry` (6-dimension filtering + enrollment priority sort), `useCcmPatient`, `useCcmKpiSummary`
  - 7 components: `CcmStatusBadge` (enrollment + program badges), `CcmRpmKpiStrip` (4 cards with progress bar), `CcmRpmFilterBar` (search + chips + 4 dropdowns), `CcmPatientTable` (8-column sortable table), `AddCcmPatientDialog` (3-step form), `RegistryTab` (orchestrator), updated `CcmRpmPage`
  - 8 new files, 1 modified file; build passes clean (CcmRpmPage chunk: 47.18 kB / 9.17 kB gzip)
- [x] **Phase 3:** Detail Panel + Enrollment Management *(2026-03-12)*
  - `CcmDetailPanel`: 520px right Sheet slide-out with Header (service line + Medicare badges), AWV cross-ref indicator, Enrollment, Devices, Reimbursement, Notes sections
  - `EnrollmentSection`: enrollment workflow UI with status display, context-sensitive action buttons, inline forms for enroll/decline/disenroll/re-enroll
  - Zod schemas (`ccmEnrollmentSchema.ts`): enrollment update, device add, device status change with conditional refinements
  - React Query hooks (`useCcmEnrollment.ts`): `useCcmUpdateEnrollment`, `useCcmAddPatient`, `useCcmDevices`, `useCcmAddDevice`, `useCcmUpdateDeviceStatus`
  - AWV cross-reference: checks shared ecw_patient_id values, shows "Also tracked in AWV Tracker" indicator
  - 4 new files, 2 modified files; build passes clean
- [x] **Phase 4:** RPM Device Tracking *(2026-03-12)*
  - `DeviceSection`: RPM device list with type/status badges, action buttons (Return, Lost, Malfunction), conditional on RPM program type
  - `AddDeviceDialog`: device type selector (6 types), assigned date, notes
  - Mock data additions: 8 devices for RPM-enrolled patients, `getMockDevices()`, `addMockDevice()`, `updateMockDeviceStatus()`
  - 2 new files; build passes clean
- [x] **Phase 5:** Reimbursement Logging (Individual + Batch) *(2026-03-12)*
  - `ReimbursementSection`: per-patient reimbursement history table with running total, service month, CPT code, billed/paid/adjustment amounts, denial reasons
  - `AddReimbursementDialog`: single reimbursement entry form with CPT code filtered by program type
  - Zod schemas (`ccmReimbursementSchema.ts`): individual + batch reimbursement entry validation
  - React Query hooks (`useCcmReimbursement.ts`): `useCcmReimbursements`, `useCcmAddReimbursement`, `useCcmBatchPatients`, `useCcmBatchReimbursement`
  - Mock data: 32 reimbursement entries, `getMockReimbursements()`, `addMockReimbursement()`, batch functions
  - 3 new files; build passes clean (CcmRpmPage chunk: 70.47 kB / 13.82 kB gzip)
- [x] **Phase 6:** Revenue Dashboard + Provider Comparison *(2026-03-12)*
  - `RevenueTab`: main orchestrator with loading skeletons, YTD summary banner, 2-column chart grid, provider table, financial model comparison
  - `RevenueMetricsCards`: 4 KPI cards (Monthly Actual, Monthly Expected, Collection Rate with threshold progress bar, Revenue Leakage)
  - `RevenueTrendChart`: ComposedChart with stacked areas (CCM blue, RPM teal) + expected revenue dashed line, custom tooltip
  - `ProgramSplitChart`: CCM vs RPM program comparison with enrolled counts, revenue, percentage bars
  - `ProviderComparisonTable`: 10-column table (Provider, Assigned, Enrolled, Rate%, CCM Only, Dual, RPM Only, Declined, Monthly Revenue, Rev/Enrolled)
  - `FinancialModelComparison`: actual vs target (65% CCM / 35% RPM) penetration with dollar gap ($34,200/month target for 3 providers)
  - React Query hooks (`useCcmRevenue.ts`): `useCcmRevenueMetrics`, `useCcmMonthlyRevenue`, `useCcmProviderMetrics`, `useCcmProgramSplit`
  - 7 new files, 1 modified file; build passes clean (CcmRpmPage chunk: 85.93 kB / 17.23 kB gzip)
- [x] **Phase 7:** Bulk Upload Pipeline *(2026-03-12)*
  - `UploadTab`: full state machine (idle, parsing, phi_error, preview, uploading, success, error), CSV preview table, PHI guard
  - `UploadDropZone`: drag-and-drop file input with 10MB limit, CSV/XLSX filter
  - `UploadResultsSummary`: 4 stat cards (new/updated/flagged/errors) + expandable error list
  - `UploadHistoryTable`: upload audit log with color-coded status badges
  - Zod schema (`ccmUploadSchema.ts`): row validation + `validateCcmUploadHeaders()` for PHI detection
  - React Query hooks (`useCcmUpload.ts`): `useCcmUpload` mutation (1.2s simulated delay), `useCcmUploadHistory` query
  - 6 new files, 1 modified file; build passes clean (CcmRpmPage chunk: 102.04 kB / 21.26 kB gzip)
- [x] **Phase 8:** Enrollment & Devices Tab + Polish + Final Integration *(2026-03-12)*
  - `EnrollmentDevicesTab`: 3-section tab (Enrollment Worklist, Device Inventory, Consent Compliance)
  - Enrollment Worklist: eligible patients grouped by provider with ECW IDs, service line, status badges
  - Device Inventory: 4 summary cards (Active, Non-Active, Coverage Rate, RPM Enrolled) + type breakdown grid
  - Consent Compliance: flags enrolled patients missing consent, shows consent stats (total/with/missing)
  - All 4 tabs fully functional, all placeholders replaced
  - Final build: CcmRpmPage chunk 109.71 kB / 22.39 kB gzip; zero errors
  - 1 new file, 1 modified file; build passes clean

Full PRD: `docs/CCM_RPM_Program_Tracker_PRD_v1_0.md`

### Mobile Docs Facility Directory (`apps/portal/src/components/mobile-docs/`)

Operational management system for all Mobile Docs care locations (SNFs, board-and-care homes, homebound patients). Replaces spreadsheet tracking with a structured directory, census management, contact lifecycle, pipeline tracking, geographic intelligence, and revenue attribution.

- [x] **Phase 1:** Health Dashboard — read-only executive dashboard *(2026-03-12)*
  - 18 TypeScript types, constants file, 14 mock data functions (canonical 14-facility roster)
  - 4 React Query hooks: `useMobileDocsKpi`, `useMobileDocsRevenue`, `useMobileDocsPipeline`, `useMobileDocsOperations`
  - 16 components: KPI strip (5 metric cards), Revenue section (trend chart with 30d/90d/12m toggle, per-visit/per-patient/ancillary metrics, sortable facility revenue table), Growth tab (pipeline funnel, facility growth chart, type mix donut, activity feed), Operations tab (penetration rates, census trend + enrollment cards, cadence compliance, attention alerts)
  - Route at `/portal/admin/mobile-docs` with `RoleGuard` (admin only), lazy-loaded
  - Sidebar nav: "Mobile Docs" with MapPin icon below Practice Health
  - Design spec: `docs/superpowers/specs/2026-03-12-mobile-docs-health-dashboard-design.md`
- [x] **Phase 2:** Database Foundation — 5 Supabase tables + RLS + TypeScript types *(2026-03-12)*
  - SQL migration (`docs/migrations/2026-03-12-mobile-docs-tables.sql`): 5 tables (`facilities_directory`, `facility_contacts`, `facility_notes`, `facility_census`, `facility_pipeline`)
  - 12 indexes, RLS policies (admin-only) on all 5 tables, shared `update_fd_updated_at()` trigger
  - Seed data: 16 facilities (8 active, 3 prospecting, 3 onboarding, 2 inactive), 16 primary contacts, 8 census snapshots, 6 pipeline transitions
  - 3 new enum types + 5 DB row interfaces in `src/portal/types/mobile-docs.ts`
  - 5 table stubs (Row/Insert/Update) in `src/portal/types/database.ts`
- [x] **Phase 3:** Facility Directory Core — grid view with search/filter, detail slide-out panel (520px), multi-step create form, edit, soft-archive *(2026-03-12)*
  - Zod schemas (`facilitySchema.ts`): facility (with conditional beds validation), contact, note schemas with inferred FormData types
  - Mock data expansion: 16 facilities, 16 contacts, 10 notes, 8 census snapshots with mutable in-memory store for CRUD
  - 5 React Query hooks (`useFacilities.ts`): `useFacilities` (list with search/filter/sort), `useFacility`, `useFacilityContacts`, `useFacilityNotes`, `useFacilityCensus` + 5 mutations (`useCreateFacility`, `useUpdateFacility`, `useArchiveFacility`, `useCreateContact`, `useCreateNote`)
  - `FacilityDirectory` — main view with 4 summary metric cards (Active Facilities, Total Patients, Avg Penetration, Monthly Charges), responsive card grid (1/2/3 columns), empty/loading states
  - `FacilityFilters` — debounced search, type filter chips (SNF/Board & Care/Homebound), status filter chips (Prospecting/Onboarding/Active/Inactive), sort dropdown (name/patients/distance/recent)
  - `FacilityCard` — type badge, status dot, name, address, metrics row (patients/beds/distance), provider/cadence footer, inactive opacity
  - `FacilityDetailPanel` — 520px right Sheet slide-out with facility header, action buttons (Edit/Archive), metrics grid, provider section, collapsible contacts list, notes timeline with type badges and relative dates, inline Add Contact and Add Note dialogs
  - `CreateFacilityForm` — 3-step Dialog (Facility Info → Primary Contact → Operations) with progress indicator, per-step validation, conditional beds field for Homebound
  - `EditFacilityForm` — single-step Dialog with pre-populated fields, status change reason prompt
  - Constants: Directory tab added to `MOBILE_DOCS_TABS` (default tab), status dot colors, sort options, note type colors
  - MobileDocsPage restructured: Directory tab is now default; KPI strip and Revenue section moved into Growth & Operations tabs
  - 7 new files, 4 modified files; type-check, lint, build all pass clean
- [x] **Phase 4:** Contact & Notes Management — edit/delete/primary swap for contacts, contact search, note pin toggle (optimistic), note type filter chips, expandable note content, note count badge, census update dialog *(2026-03-12)*
  - Zod schema: `censusSchema` with 6 fields (active_patients required, rest optional) + `CensusFormData` type
  - 5 mock mutation helpers: `updateMockContact`, `deleteMockContact`, `setMockPrimaryContact` (atomic primary swap), `toggleMockNotePin`, `addMockCensus`
  - 5 React Query mutation hooks: `useUpdateContact`, `useDeleteContact`, `useSetPrimaryContact`, `useToggleNotePin` (optimistic update with rollback), `useCreateCensus`
  - `ContactCard` enhanced: Edit (pencil), Delete (trash with AlertDialog confirmation, disabled on primary), Make Primary (star) action buttons
  - Contact search: text input filters by name/role/phone/email (shown when 3+ contacts), auto-expands collapsible
  - `EditContactDialog`: pre-filled form via useEffect, calls useUpdateContact
  - Notes: count badge on section header, type filter chips (All + 6 types), clickable Pin icon on every note (amber=pinned, muted=unpinned)
  - `NoteContent`: line-clamp-3 with "Show more/less" toggle for notes > 200 chars
  - `CensusDialog`: 6 numeric fields in 2-column grid, pre-filled from latest census, creates new census snapshot
  - 4 modified files; type-check, lint, build all pass clean
- [x] **Phase 5:** Census Tracking & Pipeline Management — historical census trends, penetration rate charts, enrollment breakdown, pipeline audit trail with timeline, ChangeStatusDialog *(2026-03-12)*
  - Expanded `seedCensus()` with 40 historical snapshots (Oct 2025–Feb 2026) for all 8 active facilities showing gradual patient growth
  - New `_pipeline` lazy-init store with `seedPipeline()`: 41 entries covering full lifecycle for all 16 facilities (Active: 3 transitions, Onboarding: 2, Prospecting: 1, Inactive: 4)
  - 3 mock data accessors: `getMockFacilityCensusTrend(facilityId)`, `getMockFacilityPipelineHistory(facilityId)`, `addMockPipelineTransition(facilityId, from, to, reason)`
  - 3 React Query hooks (`useFacilityCensus.ts`): `useFacilityCensusTrend`, `useFacilityPipelineHistory`, `useChangeFacilityStatus` (atomic: updates facility status + creates pipeline entry)
  - `FacilityCensusTrendChart`: recharts AreaChart with emerald gradient showing active_patients over 6 months
  - `PenetrationTrendChart`: recharts AreaChart with dynamic color (emerald/blue/amber by threshold), SNF/Board & Care only
  - `EnrollmentBreakdownCard`: 3 mini metric cards (CCM/RPM/AWV) with percentage of active patients
  - `PipelineHistoryTimeline`: vertical timeline with colored dots, status badges, transition reasons, dates
  - `ChangeStatusDialog`: status selector (excludes current) + required reason textarea, reusable from both detail panel and edit form
  - `FacilityDetailPanel` enhanced: "Census Trends" collapsible section (chart + penetration + enrollment), "Pipeline History" collapsible section (timeline + Change Status button)
  - `EditFacilityForm` updated: status field disabled (read-only), "Change Status" button opens ChangeStatusDialog, cosmetic textarea removed — all status changes now create pipeline audit entries
  - 6 new files, 3 modified files; type-check, lint (0 new errors), build all pass clean
- [x] **Phase 6:** Map & Geographic Intelligence — react-leaflet interactive map with facility pins (color=type, size=patients, opacity/border=status), 25-mile service radius ring, HCI base marker, hover tooltips, click-to-detail-panel, persistent legend, dark theme CSS overrides
  - `FacilityMap`: react-leaflet MapContainer with OpenStreetMap tiles, CircleMarker per facility (3 visual dimensions), Circle for 25-mile service radius, divIcon HCI base marker
  - `FacilityMapTooltip`: hover content showing name, type, patients, distance, drive time
  - `FacilityMapLegend`: persistent overlay with type colors, size scale, status border styles
  - `MapTab`: data wrapper fetching facilities + census, wiring click-to-detail-panel via existing FacilityDetailPanel
  - Constants: `HCI_BASE_LOCATION`, `SERVICE_RADIUS_METERS`, `MAP_PIN_COLORS`, `MAP_PIN_SIZE`; map tab added to `MOBILE_DOCS_TABS`
  - Dark theme: CSS filter inversion on tile-pane, themed tooltips/zoom controls in `index.css`
  - Lazy-loaded MapTab (161KB chunk, 47KB gzipped — includes leaflet)
  - 4 new files, 3 modified files; type-check, lint (0 new errors), build all pass clean
- [ ] **Phase 7:** Practice Health Integration — swap mock → real Supabase queries, facility matching, revenue attribution
- [ ] **Phase 8:** Polish & Future — role expansion, performance, data migration, v2 features

Full PRD: `docs/Mobile_Docs_Facility_Directory_PRD_v1_0.md`
Full roadmap: See plan file or `docs/superpowers/specs/2026-03-12-mobile-docs-health-dashboard-design.md`

### Known Issues / Recent Fixes

- Fixed careers form auto-submit bug on Step 5 (2026-01-12)
- Fixed careers form resume requirement and early submission (2026-01-12)
- Fixed Resend email from address to use verified domain (2026-01-12)
- Fixed user deactivation status not updating in UI (2026-02-25) — RLS policy + optimistic cache fix
- Added hard-delete for inactive users with audit log preservation (2026-02-25)

---

## Upcoming Development Tasks

### Mobile Docs Facility Directory
- [x] Phase 1: Health Dashboard (COMPLETE)
- [x] Phase 2: Database Foundation (COMPLETE)
- [x] Phase 3: Facility Directory Core (COMPLETE)
- [x] Phase 4: Contact & Notes Management (COMPLETE)
- [x] Phase 5: Census Tracking & Pipeline Management (COMPLETE)
- [x] Phase 6: Map & Geographic Intelligence (COMPLETE)
- [ ] Phase 7: Practice Health Integration (mock → real data) — NEXT
- [ ] Phase 8: Polish & Future (roles, performance, data migration)

### Practice Health Module
- [x] Phase 1: Foundation — Steps 1-5 complete (COMPLETE)
- [ ] Phase 1: Step 6 — End-to-end testing
- [ ] Phase 2: Communication & Planning — email digests, alerts, vacation management
- [ ] Phase 3: Optimization & Simulation — scenario simulator, bonus/incentive tracking
- [ ] Phase 4: Quality, Expansion & SaaS — patient surveys, multi-tenant, EMR adapters

### AWV Tracker
- [x] Phase 1: Patient Registry + Detail Panel (COMPLETE)
- [x] Phase 2: CSV Upload Tab + Detail Enhancements (COMPLETE)
- [x] Phase 3: Revenue Dashboard + Provider Tracking (COMPLETE)
- [ ] Phase 4: Supabase Integration + Role Refinement — NEXT

### CCM / RPM Program Tracker
- [x] Phase 1: Foundation — Types, Constants, Page Shell, Routing, Sidebar (COMPLETE)
- [x] Phase 2: Patient Registry (COMPLETE)
- [x] Phase 3: Detail Panel + Enrollment Management (COMPLETE)
- [x] Phase 4: RPM Device Tracking (COMPLETE)
- [x] Phase 5: Reimbursement Logging (COMPLETE)
- [x] Phase 6: Revenue Dashboard + Provider Comparison (COMPLETE)
- [x] Phase 7: Bulk Upload Pipeline (COMPLETE)
- [x] Phase 8: Enrollment & Devices Tab + Polish + Final Integration (COMPLETE)

### Patient Outreach Portal
- [x] All 8 milestones complete (MVP feature-complete)
- [ ] Phase 2: Dark mode, notification bell, bulk actions, keyboard shortcuts
- [ ] Phase 2: Offline-resilient logging, data anonymization, cross-project search

### Backlog & Deferred Items
See `docs/BACKLOG.md` for mobile responsiveness fixes, portal enhancements, and other deferred work.

---

## Changelog

### 2026-03-12
- **AWV Tracker Module — Phase 3 (Revenue Dashboard + Provider Tracking):**
  - Types: `AwvMonthlyRevenuePoint` (month/revenue/addonRevenue/awvCount/cumulativeRevenue), `AwvServiceLineSplit` (serviceLine/completedCount/revenue/percentage) in `awv-tracker.ts`
  - Constants: `SERVICE_LINE_CHART_COLORS` (HCI Office #7c3aed violet, Mobile Docs #3b82f6 blue) in `awv-tracker-constants.ts`
  - Mock data: `getMockAwvRevenueMetrics()` aggregates completed tracking + addon billed_amounts into `AwvRevenueMetrics` with per-provider breakdown, `getMockAwvMonthlyRevenue()` buckets by completion_date month with cumulative running total, `getMockAwvServiceLineSplit()` groups by service_line with percentage
  - `useAwvRevenue.ts`: 4 hooks — `useAwvRevenueMetrics` (AwvRevenueMetrics), `useAwvProviderMetrics` (AwvProviderMetrics[]), `useAwvMonthlyRevenue` (AwvMonthlyRevenuePoint[]), `useAwvServiceLineSplit` (AwvServiceLineSplit[]) — all `['awv', 'revenue', ...]` keys
  - `RevenueTab`: role-gated KPI strip (admin sees 4 revenue cards with DollarSign/TrendingUp/Target icons; staff sees 3 count-based cards), revenue projection banner ("projected year-end $X, reaching 80% would add $Y"), 2-column chart grid, provider table
  - `RevenueTrendChart`: recharts `ComposedChart` with dual YAxis — `Bar` (revenue, violet fill, radius top corners) on left axis with `formatCurrency(v, true)`, `Line` (awvCount, emerald stroke, dot markers) on right axis; custom tooltip with month/revenue/addon/count
  - `ServiceLineSplitChart`: recharts `PieChart` donut (innerRadius 55, outerRadius 85, paddingAngle 2) with Cell colors from `SERVICE_LINE_CHART_COLORS`, absolute center overlay showing total revenue (admin) or AWV count (staff), inline legend with colored dots + amounts + percentages; accepts `showDollars` prop
  - `ProviderCompletionTable`: shadcn Table (TableHeader/TableBody/TableRow/TableCell), 7 columns with conditional Revenue/Outstanding (gated by `showRevenue` prop), completion rate column rendered as h-1.5 rounded progress bar with `getCompletionRateColor()` threshold coloring (green/amber/red), sorted descending by completionRate
  - `AwvRevenueSection`: detail panel section matching `border-b border-border p-5` convention, shows AWV billed + per-addon line items + total when Completed, "Revenue details available after AWV is completed" italic text otherwise, reimbursement reference table with all 7 CPT rates from `DEFAULT_REIMBURSEMENT_RATES`
  - Modified `AwvTrackerPage` (import + Revenue tab placeholder → `<RevenueTab />`), `AwvDetailPanel` (import + Phase 3 placeholder → `<AwvRevenueSection trackingId={...} billedAmount={...} completionStatus={...} />`)
  - 6 new files, 5 modified files; `bun run type-check` passes (0 errors), `bun run build` succeeds (AwvTrackerPage chunk: 85.87 kB / 19.12 kB gzip)

- **AWV Tracker Module — Phase 2 (CSV Upload Tab + Detail Enhancements):**
  - `awvUploadSchema.ts`: Zod row schema for CSV validation (Patient Acct No, Last Name, Rendering Provider required; Facility, Payer, Last AWV Date, Last AWV CPT optional with date range and CPT enum refinements), `validateUploadHeaders()` for PHI blacklist + required column checks
  - Mock data: 3 seed add-on services (G0444 depression screening on awv-t-06, 99497+99498 ACP pair on awv-t-15), `processMockUpload()` upsert engine with ecw_patient_id matching, new patient + tracking creation, provider/facility name matching with warnings, duplicate detection, active patient flagging
  - `useAwvUpload.ts`: 5 hooks — `useAwvUpload` (mutation), `useAwvUploadHistory` (query), `useAwvAddons` (query), `useAddAwvAddon` (mutation), `useAwvTrackingHistory` (query) — all following `['awv', ...]` key prefix and `staleTime: 30_000` patterns
  - `UploadDropZone`: drag-and-drop with visual hover state, file size/type validation, hidden file input pattern matching ReportUploader
  - `UploadTab`: 7-state machine (idle/parsing/phi_error/preview/uploading/success/error), PapaParse integration, PHI column scan, per-row Zod validation with counts, data preview table, column recognition highlighting
  - `UploadResultsSummary`: 4 metric cards (New green, Updated blue, Flagged amber, Errors red) + expandable error/warning list
  - `UploadHistoryTable`: past uploads with status badges, date/filename/counts columns
  - `AwvAddonsSection`: in detail panel, lists add-on CPTs with billed amounts, inline add form with CPT dropdown (filters out AWV codes), auto-populated default amounts, gated on Completed status
  - `AwvHistorySection`: all tracking cycles per patient, newest first, current cycle highlighted, status badges, type/CPT/amount/notes display
  - Modified `AwvTrackerPage` (Upload tab swap), `AwvDetailPanel` (Add-ons + History swap)
  - 8 new files, 3 modified files; type-check and build pass clean

- **Mobile Docs Facility Directory — Phase 6 (Map & Geographic Intelligence):**
  - Installed `leaflet` + `react-leaflet` + `@types/leaflet` for interactive map rendering
  - `FacilityMap.tsx`: react-leaflet `MapContainer` with OpenStreetMap tiles, `CircleMarker` per facility with 3 visual dimensions (color by type via `MAP_PIN_COLORS`, radius by active patient count scaled 6–18px, opacity/dashArray by pipeline status), `Circle` for 25-mile service radius (dashed indigo ring, 40,233m), custom `L.divIcon` HCI base marker (red circle with "HCI" label)
  - `FacilityMapTooltip.tsx`: hover content in Leaflet `Tooltip` showing facility name, type badge, active patients, distance (mi), drive time (min) — grid layout with muted labels
  - `FacilityMapLegend.tsx`: absolute-positioned overlay (z-1000) with 3 sections: type color dots, size scale (3 circles: 0/~10/22+), status styles (solid/reduced opacity/dashed/faded)
  - `MapTab.tsx`: tab wrapper fetching facilities via `useFacilities()`, building `censusMap` via `getMockFacilityCensus()`, wiring `onFacilityClick` → `FacilityDetailPanel` (reused without modification)
  - Constants in `mobile-docs-constants.ts`: `HCI_BASE_LOCATION` (34.1478°N, 118.1445°W, Pasadena 91101), `SERVICE_RADIUS_METERS` (40,233), `MAP_PIN_COLORS` (SNF deep blue, B&C green, Homebound purple — PRD §9.2 hex values), `MAP_PIN_SIZE` (min 6, max 18, maxPatients 22)
  - Map tab added to `MOBILE_DOCS_TABS` as 4th tab; `MobileDocsTabId` auto-updates via `typeof` derivation
  - `MobileDocsPage.tsx`: lazy-loaded `MapTab` with `Suspense` fallback skeleton
  - Dark theme CSS in `index.css`: tile-pane filter inversion (brightness→invert→contrast→hue-rotate→saturate→brightness), `#1e293b` background, marker/overlay panes excluded from filter, tooltips themed with `--card`/`--border` CSS vars, zoom controls themed
  - 4 new files, 3 modified files; `bun run type-check` (0 errors), `bun run lint` (0 new errors), `bun run build` succeeds (MapTab chunk: 161KB / 47KB gzip)

- **Mobile Docs Facility Directory — Phase 5 (Census Tracking & Pipeline Management):**
  - Expanded `seedCensus()` from 8 entries to 48: 5 additional months (Oct 2025–Feb 2026) per active facility with gradual patient growth and proportional CCM/RPM/AWV enrollment
  - New `_pipeline` lazy-init mutable store with 41 seed entries: full lifecycle transitions for all 16 facilities (null→Prospecting→Onboarding→Active for active, Active→Inactive for inactive)
  - 3 new mock data accessors: `getMockFacilityCensusTrend`, `getMockFacilityPipelineHistory`, `addMockPipelineTransition`; bumped `_nextId` to 100
  - New hooks file `useFacilityCensus.ts`: `useFacilityCensusTrend(facilityId)` (query), `useFacilityPipelineHistory(facilityId)` (query), `useChangeFacilityStatus()` (mutation: updates status + appends pipeline entry + invalidates 3 query keys)
  - `FacilityCensusTrendChart`: recharts AreaChart with emerald gradient, 180px height, custom tooltip, date formatted as 'MMM YY'
  - `PenetrationTrendChart`: recharts AreaChart with threshold-based color (emerald ≥50%, blue ≥20%, amber <20%), 160px height, percentage tooltip; conditionally rendered for SNF/Board & Care only
  - `EnrollmentBreakdownCard`: 3-column grid of `EnrollmentMiniCard` sub-components (CCM violet, RPM pink, AWV amber) with count + percentage of active patients
  - `PipelineHistoryTimeline`: vertical timeline with `PIPELINE_STATUS_COLORS` dots, connecting lines, status badges (from→to or initial), change reasons, formatted dates; empty/loading states
  - `ChangeStatusDialog`: shadcn Dialog with current status badge, Select (excluding current), required Textarea reason, `useChangeFacilityStatus` mutation, toast notifications; reusable from both detail panel and edit form
  - `FacilityDetailPanel` enhanced: new "Census Trends" Collapsible section (TrendingUp icon, census chart + penetration chart conditional + enrollment card), new "Pipeline History" Collapsible section (GitBranch icon, timeline + Change Status ghost button)
  - `EditFacilityForm` updated: status Select disabled (read-only), amber warning box replaced with border box + "Change Status" button, `statusChanged` variable removed, Textarea import removed, return wrapped in Fragment for sibling ChangeStatusDialog
  - 6 new files, 3 modified files; `bun run type-check` passes (0 errors), `bun run lint` (0 new errors), `bun run build` succeeds (12.5s)

- **AWV Tracker Module — Phase 1 (Patient Registry + Detail Panel):**
  - 7 type literals (`AwvEligibilityStatus`, `AwvCompletionStatus`, `AwvType`, `MedicareStatus`, `AwvDateSource`, `AwvServiceLine`, `AwvUploadStatus`), CPT code bi-directional maps, 5 DB row interfaces, 4 UI types in `awv-tracker.ts`
  - Constants: tab config, eligibility/completion status badge configs (bg/text/dot Tailwind classes), service line colors, Medicare status colors, completion rate thresholds (green >= 70%, amber >= 40%), eligibility reasons list, PHI blacklist, upload column specs, default reimbursement rates
  - Mock data: 17 patients across HCI Office (8) and Mobile Docs (8) + 1 inactive, matching 3 providers (Dr. Chen, NP1, NP2) and 8 facilities from existing modules; mutable `let` arrays with getter/setter functions for session-persistent CRUD
  - 4 Zod schemas: `awvPatientSchema` (3-step with `.refine()` for Mobile Docs facility requirement), `awvEligibilityUpdateSchema` (reason required for Not Eligible), `awvScheduleSchema`, `awvCompleteSchema`
  - `useAwvRegistry` hook: client-side filtering (search, eligibility, completion, service line, provider, eligibility timing with Newly Eligible/Eligible Soon/Overdue logic) + priority sorting (Eligible > Pending > Not Eligible, then by next_eligible_date ascending)
  - 6 mutation hooks in `useAwvTracking`: add patient, update eligibility, schedule, complete (with auto-cycle creation via `createNextTrackingCycle`), update status (Refused/Unable), update notes
  - `AwvStatusBadge`: renders colored dot + text from constants config maps
  - `AwvKpiStrip`: 4 KPI cards (Eligible Patients, Completed YTD, Completion Rate with progress bar, Revenue Captured admin-only) with loading skeletons
  - `AwvFilterBar`: search input, eligibility/completion chip groups via generic `ChipGroup<T>`, service line/provider/timing select dropdowns, Add Patient button
  - `AwvPatientTable`: sortable columns via `SortableHeader` (ArrowUpDown icon), columns for Patient/Provider/Service Line/Eligibility/Completion/Last AWV/Next Eligible/Actions, amber highlight for overdue next_eligible_date, loading skeleton and empty state
  - `AwvDetailPanel`: 520px Sheet with Header (name, eCW ID, service line badge, Medicare badge, provider/facility/payer info), Eligibility section (status badge, dates, change form with reason select), Completion section (state machine with contextual workflow buttons, inline Schedule/Complete forms with date pickers and AWV type selects), Notes section (display/edit toggle with textarea), placeholder sections for Add-ons/Revenue/History
  - `AddPatientDialog`: 3-step form (Patient ID → Assignment → AWV History) with step indicators, per-step validation via `trigger()`, conditional facility dropdown for Mobile Docs
  - `RegistryTab`: composes KpiStrip + FilterBar + PatientTable + DetailPanel + AddPatientDialog with filter/selection state
  - `AwvTrackerPage`: page shell with 3 shadcn Tabs (Registry, Upload placeholder, Revenue placeholder)
  - Route: `/portal/admin/awv-tracker` with `RoleGuard(['admin', 'staff'])`, lazy-loaded via `lazyWithRetry`
  - Sidebar: "AWV Tracker" with `ClipboardCheck` icon added to `adminNav` array after Mobile Docs
  - `database.ts`: imported 5 AWV types, added 5 table stubs (awv_patients, awv_tracking, awv_uploads, awv_reimbursement_rates, awv_addons)
  - SQL migration: 5 tables with CHECK constraints, 10 indexes, RLS policies (read: authenticated, write: admin+staff, rates: admin-only), seed reimbursement rates, updated_at triggers
  - 14 new files, 3 modified files; type-check passes (0 errors), production build succeeds (48.31 kB chunk, 10.22 kB gzipped)

- **Practice Health Module — Step 5 (AI Insights + Executive Summary):**
  - AI Insights API (`api/generate-insights.ts`): Claude API integration via Anthropic SDK, fetches KPI/provider/operational/payer data, generates structured insights (highlights, opportunities, alerts), stores in `ph_ai_insights`
  - Shared data layer: `api/lib/ph-report-data.ts` (reusable Supabase query helpers) + `api/lib/ph-report-types.ts` (TypeScript types)
  - `AiInsightsCard` component on Overview tab: displays latest insights with category icons, regenerate button
  - Executive Summary API (`api/practice-health-summary.ts`): GET → PDF download, POST → email PDF to recipients via Resend
  - PDF generation (`api/lib/ph-report-executive-pdf.ts`): income streams, provider productivity, operational summary, outreach projects, AI insights sections
  - `SummaryHeader` enhanced: Download Summary + Email Summary buttons added alongside Upload Report
  - `EmailSummaryModal`: multi-recipient dialog with auto-populated admin emails from profiles table
  - 2 new hooks: `usePracticeHealthInsights` (query + mutation), `usePracticeHealthSummary` (download + email mutations)

- **New PRDs authored:**
  - `docs/AWV_Tracker_PRD_v1_0.md` — Annual Wellness Visit Tracker: patient eligibility registry, bulk eCW upload, rolling 12-month eligibility, completion workflow, revenue dashboard
  - `docs/CCM_RPM_Program_Tracker_PRD_v1_0.md` — CCM/RPM Program Tracker: enrollment management, RPM device tracking, monthly reimbursement logging, revenue assurance dashboard

- **docs/BACKLOG.md created** — deferred items (mobile responsiveness fixes for portal tables, chart heights, card layouts)

- **Mobile Docs Facility Directory — Phase 4 (Contact & Notes Management):**
  - `censusSchema` added to `facilitySchema.ts`: 6 numeric fields with `z.coerce.number()`, `active_patients` required, rest optional with `default(0)`
  - 5 mock mutation helpers in `mobile-docs-mock-data.ts`: `updateMockContact` (partial update), `deleteMockContact` (splice), `setMockPrimaryContact` (atomic swap: unset old + set new), `toggleMockNotePin` (flip boolean), `addMockCensus` (append snapshot)
  - 5 React Query hooks in `useFacilities.ts`: `useUpdateContact`, `useDeleteContact`, `useSetPrimaryContact`, `useToggleNotePin` (optimistic update via `onMutate` with rollback on error), `useCreateCensus`
  - `ContactCard` expanded: action buttons (Edit/Delete/Make Primary) with AlertDialog delete confirmation, disabled delete on primary contacts ("Reassign primary first" tooltip)
  - Contact search input in contacts section header (renders when 3+ contacts), filters by name/role/phone/email, auto-expands collapsible when searching
  - `EditContactDialog`: mirrors AddContactDialog layout, pre-fills form from contact data via `useEffect`, calls `useUpdateContact`
  - Notes section: count badge (pill) on header, type filter chip buttons (All + 6 note types), clickable Pin icon on every note (amber when pinned, muted otherwise)
  - `NoteContent` sub-component: `line-clamp-3` CSS truncation for notes > 200 chars with "Show more" / "Show less" toggle
  - `CensusDialog`: 6 labeled numeric inputs in 2-column grid, pre-filled from latest census via `useEffect`, active_patients full-width and required, creates new `facility_census` row
  - 4 modified files; type-check, lint (modified files clean), build all pass

- **Mobile Docs Facility Directory — Phase 3 (Facility Directory Core):**
  - Zod schemas: `facilitySchema` (with `.refine()` for conditional beds requirement), `contactSchema`, `noteSchema` in `src/portal/schemas/facilitySchema.ts`
  - Mock data expanded: 16 `Facility` objects matching SQL seed, 16 `FacilityContact`, 10 `FacilityNote` (varied types: Visit Summary, Partnership, Clinical, General, Outreach, Administrative), 8 `FacilityCensus` snapshots — all with mutable in-memory store for mock mutations
  - React Query hooks (`src/portal/hooks/useFacilities.ts`): 5 queries with client-side filtering/sorting/search + 5 mutations with cache invalidation (`useCreateFacility`, `useUpdateFacility`, `useArchiveFacility`, `useCreateContact`, `useCreateNote`)
  - `FacilityDirectory`: 4 summary KPI cards, responsive card grid (1/2/3 cols), empty state, loading skeletons
  - `FacilityFilters`: debounced search (300ms), type chips with color coding, status chips with dot indicators, sort dropdown (5 options)
  - `FacilityCard`: type badge (colored), status dot, metrics row (patients/beds/distance), provider/cadence footer, inactive opacity, hover effects
  - `FacilityDetailPanel`: 520px right Sheet slide-out, facility header with badges, Edit/Archive actions, metrics grid, provider section, collapsible contacts with primary indicator, notes timeline (pinned first, relative dates, type badges), inline Add Contact and Add Note dialogs
  - `CreateFacilityForm`: 3-step Dialog with progress indicator (Facility Info → Primary Contact → Operations), per-step `trigger()` validation, conditional beds field, Skip option for contact step
  - `EditFacilityForm`: single-step Dialog, pre-populated from facility data, status change reason prompt
  - Constants updated: `MOBILE_DOCS_TABS` now includes `'directory'` as first tab, added `FACILITY_STATUS_DOT_COLORS`, `SORT_OPTIONS`, `NOTE_TYPE_COLORS`
  - `MobileDocsPage` restructured: Directory tab is default; KPI strip and Revenue section nested into Growth & Operations tabs
  - 7 new files, 4 modified files; type-check, lint, build all pass clean

- **Mobile Docs Facility Directory — Phase 2 (Database Foundation):**
  - SQL migration: 5 tables (`facilities_directory`, `facility_contacts`, `facility_notes`, `facility_census`, `facility_pipeline`) with CHECK constraints for all enums (facility type, status, visit cadence, contact role/type, note type)
  - 12 indexes across all tables for common query patterns (tenant, provider, status+archived, facility+date composites)
  - RLS policies: admin-only full CRUD on all 5 tables, matching Practice Health pattern
  - Shared `update_fd_updated_at()` trigger for `facilities_directory` and `facility_contacts`
  - Seed data: 16 facilities with realistic Pasadena/SGV addresses and lat/lng (8 active, 3 prospecting, 3 onboarding, 2 inactive), 16 primary contacts, 8 census snapshots matching mock dashboard patient counts, 6 pipeline transitions matching mock activity feed
  - TypeScript: 3 enum types (`ContactRole`, `ContactType`, `NoteType`) + 5 DB row interfaces (`Facility`, `FacilityContact`, `FacilityNote`, `FacilityCensus`, `FacilityPipelineEntry`) in `mobile-docs.ts`
  - 5 table stubs with Row/Insert/Update patterns in `database.ts` (append-only tables use `Update: never`)
  - Type-check, lint, build all pass clean

- **Mobile Docs Health Dashboard — Phase 1 (complete):**
  - New top-level portal page at `/portal/admin/mobile-docs` (admin only, lazy-loaded)
  - 19 new files: 1 type file, 2 lib files (constants + mock data with 14-facility roster), 4 React Query hooks, 16 components
  - KPI strip: 5 metric cards (Monthly Revenue, Revenue/Visit, Active Facilities, Total Patients, In Pipeline) with trend indicators
  - Revenue section (always visible): area chart with 30d/90d/12m toggle, per-visit/per-patient/ancillary metrics, sortable facility revenue table with type badges
  - Growth & Pipeline tab: pipeline status distribution bars, facility growth stacked area chart, type mix donut, pipeline activity feed
  - Operations & Coverage tab: penetration rate progress bars, census trend + enrollment mini-cards, cadence compliance traffic-light list, attention alert cards
  - Sidebar: "Mobile Docs" nav entry with MapPin icon below Practice Health
  - 2 modified files: `App.tsx` (lazy import + route), `PortalSidebar.tsx` (nav entry)
  - All mock data — hooks designed for seamless swap to Supabase queries in Phase 7
  - Design spec: `docs/superpowers/specs/2026-03-12-mobile-docs-health-dashboard-design.md`
  - Type-check, lint, build all pass clean

- **Portal auth/session reliability hardening (admin + staff login loading):**
  - Updated `AuthContext` to make audit logging non-blocking during login (`/api/audit-log` now fire-and-forget with timeout) so `LoginForm` navigation is not blocked on slow serverless responses.
  - Added profile hydration on `INITIAL_SESSION` in `onAuthStateChange` to reduce login-to-portal race conditions when portal `AuthProvider` mounts after login page unmount.
  - Added broker-aware login path resolver for invalid-session/sign-out redirects so broker context correctly routes to `/partner-login` (instead of always `/hci-login`).
  - Removed stale closure risk in token refresh handling by reading profile from a ref during auth event handling.
  - Added explicit Supabase query timeouts (`AbortController`) to `useProjects`, `useProject`, and `useMyProjects` so dashboard loading states fail fast instead of hanging indefinitely.
  - Hardened `api/audit-log.ts` env handling (`SUPABASE_URL`-first with fallbacks), added explicit misconfiguration logging, and now throws on failed `audit_log` inserts.
  - Validation: `bun run type-check` passes; targeted lint on modified files passes with one pre-existing Fast Refresh warning in `AuthContext`.

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
