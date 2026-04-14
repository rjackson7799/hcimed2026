# Practice Health — Unified Income Streams Integration

**Date:** 2026-03-20
**Status:** Approved

## Problem

Practice Health currently shows analytics only from eCW report uploads (charges, collections, productivity). Three new modules — AWV Tracker, CCM/RPM, and Mobile Docs — each track their own revenue independently. The practice needs a unified revenue picture across all income streams without duplicating detail already in each module's dashboard.

## Design

### Income Streams KPI Row

Add a second row of 4 KPI cards below the existing `SummaryHeader` (5 eCW cards):

| Card | Data Source | Calculation |
|------|------------|-------------|
| AWV Revenue | `awv_tracking` joined to `awv_patients` | Sum `billed_amount` where `completion_status = 'Completed'` and `completion_date` in range |
| CCM Revenue | `ccm_reimbursement` joined to `ccm_enrollment` + `ccm_patients` | Sum `paid_amount` where CPT in (99490, 99439, 99491) and `service_month` in range |
| RPM Revenue | `ccm_reimbursement` joined to `ccm_enrollment` + `ccm_patients` | Sum `paid_amount` where CPT in (99453, 99454, 99457, 99458) and `service_month` in range |
| Total Practice Revenue | All sources | eCW Est. Collections + AWV + CCM + RPM |

Each card shows current period value + trend vs prior period, matching existing `KpiMetricCard` style.

All cards respect the existing date range and service line filters.

### Data Hook: `useIncomeStreams(filters)`

Returns `{ awv, ccm, rpm, total, isLoading }` where each stream has `{ current, previous, trend }`.

- AWV service line filter: `awv_patients.service_line` matches 'HCI Office' / 'Mobile Docs'
- CCM/RPM service line filter: `ccm_patients.service_line` matches 'HCI Office' / 'Mobile Docs'
- eCW collections: reused from `useKpiData` hook's `estCollections`

### AI Insights Enhancement

Expand the `generate-insights` API to query AWV/CCM/RPM summary data and append it to the Claude prompt. No schema changes — existing insight types/categories cover income stream analysis naturally.

## Files

| File | Action |
|------|--------|
| `apps/portal/src/types/practice-health.ts` | Add `IncomeStreamData` type |
| `apps/portal/src/hooks/useIncomeStreams.ts` | New hook |
| `apps/portal/src/components/practice-health/IncomeStreamsRow.tsx` | New component |
| `apps/portal/src/pages/PracticeHealthPage.tsx` | Wire in new row |
| `apps/portal/api/generate-insights.ts` | Add income stream data to prompt |
