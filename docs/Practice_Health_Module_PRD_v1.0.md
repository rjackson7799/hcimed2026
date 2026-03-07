# Practice Health Module
## AI-Powered Practice Analytics & Intelligence Platform
### Product Requirements Document

**HCI Medical Group | Mobile Docs Division**
**Version 1.0 | March 2026**
**CONFIDENTIAL**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Phased Development Roadmap](#3-phased-development-roadmap)
4. [Data Architecture](#4-data-architecture)
5. [Data Ingestion Pipeline](#5-data-ingestion-pipeline)
6. [KPI Engine](#6-kpi-engine)
7. [AI Insight Layer](#7-ai-insight-layer)
8. [Role-Based Access Control](#8-role-based-access-control)
9. [Dashboard Specifications](#9-dashboard-specifications)
10. [Email Digest System (Phase 2)](#10-email-digest-system-phase-2)
11. [Scenario Simulator (Phase 3)](#11-scenario-simulator-phase-3)
12. [Bonus & Incentive Framework (Phase 3)](#12-bonus--incentive-framework-phase-3)
13. [Future Extensibility & SaaS Architecture](#13-future-extensibility--saas-architecture)
14. [Technical Requirements](#14-technical-requirements)
15. [Success Metrics](#15-success-metrics)

---

## 1. Executive Summary

The Practice Health Module is an AI-powered analytics platform designed to transform raw eClinicalWorks (eCW) reporting data into actionable operational intelligence for HCI Medical Group. The module addresses a critical gap in current EMR reporting: eCW provides extensive data but lacks narrative insights, trend analysis, forecasting capabilities, and operational recommendations that practice leadership needs to make informed decisions.

The module will ingest data from three standardized eCW report exports, process it through a KPI calculation engine, and apply AI analysis to generate daily insights, productivity alerts, revenue forecasts, and scenario-based projections. A role-based access model ensures that data upload responsibilities are separated from insight consumption, maintaining both operational efficiency and data security.

While built initially to serve HCI Medical Group and its Mobile Docs division, the platform architecture is designed for future abstraction into a standalone SaaS product serving small to medium healthcare providers across specialties.

---

## 2. Product Overview

### 2.1 Problem Statement

eClinicalWorks provides over 100 pre-built reports across daily operations, month-end financials, administrative analytics, and clinical measures. However, these reports share common limitations that prevent practice leadership from using them effectively:

- Reports present raw data tables without narrative interpretation or key takeaways
- No automated trend detection, anomaly alerting, or productivity benchmarking
- No forecasting or scenario modeling capabilities
- No consolidated practice health view combining billing, collections, and operational efficiency
- Reports require manual analysis to extract actionable insights
- No role-based access to separate data entry from insight consumption

### 2.2 Solution

The Practice Health Module creates an intelligent analytics layer on top of eCW data by combining three complementary report feeds into a unified platform that calculates KPIs, applies AI-driven analysis, and delivers actionable insights to practice leadership through dashboards and automated email digests.

### 2.3 Service Line Structure

The module tracks two distinct service lines operating within HCI Medical Group, with architectural support for future entity separation:

- **HCI Office:** Traditional office-based internal medicine visits at the Health Care Institute Medical Group facility
- **Mobile Docs:** Physician house call program targeting Medicare beneficiaries in SNFs, board-and-care facilities, and homebound patients within a 25-mile radius of Pasadena (91101)

The system uses the Facility and Facility POS (Place of Service) fields from eCW data to automatically classify encounters into the appropriate service line. Service line designation is embedded at the database schema level to support clean data separation if Mobile Docs is carved out as a separate entity in the future.

### 2.4 Current Provider Roster

| Provider | Role | Employment | Schedule | Service Lines |
|----------|------|------------|----------|---------------|
| Medical Director | Physician / Practice Lead | W-2 | Full-time | HCI Office + Oversight |
| NP 1 | Nurse Practitioner | W-2 Part-time | 3 days/week | HCI Office only |
| NP 2 | Nurse Practitioner | W-2 Part-time | 3 days/week | HCI Office + Mobile Docs |

---

## 3. Phased Development Roadmap

Development follows a four-phase approach where each phase builds on the data model and infrastructure established in Phase 1. The database schema is designed from the outset to accommodate all four phases, even though features are delivered incrementally.

### 3.1 Phase 1 — Foundation (Current Scope)

Core data ingestion, KPI engine, provider-level productivity tracking, AI insight generation, and role-based dashboards.

- Smart report detection and ingestion for three eCW report types
- Data validation, duplicate prevention, and PHI rejection
- KPI calculation engine: visits/day, RVUs, wRVUs, revenue estimates, payer mix, collection rates
- Provider-level productivity tracking with part-time schedule awareness
- Service line segmentation (HCI Office vs. Mobile Docs)
- AI insight layer generating narrative takeaways and operational recommendations
- Role-based access: Upload-only (Coordinator) and Full Insights (Admin/Medical Director)
- Admin dashboard with consolidated and service-line views

### 3.2 Phase 2 — Communication & Planning

Automated reporting, alerting, and workforce planning.

- Automated daily summary emails to Medical Director and Admin
- Weekly and monthly digest variants with trend comparisons
- Productivity alerts when metrics trend below configurable thresholds
- Vacation/time-off management integrated with forecasting engine
- Schedule-adjusted productivity projections

### 3.3 Phase 3 — Optimization & Simulation

Scenario modeling, incentive tracking, and deeper AI-driven recommendations.

- Scenario simulator: add provider, increase volume, weekend hours, new services, payer mix shifts
- Bonus/incentive threshold tracking with provider-facing progress dashboards
- AI recommendations tied to financial model benchmarks
- Revenue opportunity identification based on practice composition
- What-if analysis engine with configurable parameters

### 3.4 Phase 4 — Quality, Expansion & SaaS

Patient feedback integration, multi-practice support, and standalone product abstraction.

- Patient feedback survey system (text/email, linked by provider + date, no PHI)
- Balanced scorecard: volume + revenue + quality metrics
- SaaS abstraction with multi-tenant architecture
- EMR adapter framework for practice management systems beyond eCW
- Specialty-specific benchmarking (internal medicine, mental health, therapy, dental)
- Custom upload scripts and API integrations for partner EMR systems

---

## 4. Data Architecture

### 4.1 Data Source Mapping

Three eCW reports serve as the primary data feeds, each addressing a distinct analytical layer. Together they provide a complete picture of practice health: what was billed, what was collected, and how efficiently operations ran.

| Report | eCW ID | Layer | Primary Purpose |
|--------|--------|-------|-----------------|
| Charges at CPT Level | 371.02 | Billing & Clinical | CPT codes, charges, diagnoses, provider attribution, payer mix, RVU derivation |
| Financial Analysis at Claim Level | 36.14 | Collections & Revenue Cycle | Actual payments, contractual adjustments, writeoffs, AR changes, collection rates |
| Productivity | 4.06 | Operations & Efficiency | Visit counts, scheduled vs. actual duration, wait times, no-shows, capacity utilization |

### 4.2 Report Field Specifications

#### 4.2.1 Report 371.02 — Charges at CPT Level (Primary Feed)

This is the richest data source and serves as the backbone of the KPI engine. Each row represents a single CPT line item within an encounter. One patient visit typically generates multiple rows (E/M code plus quality/supplemental codes).

| Field Name | Data Type | Include? | Purpose |
|------------|-----------|----------|---------|
| Facility | String | Yes | Service line classification (HCI Office vs. SNF facilities) |
| Facility POS | Integer | Yes | Place of Service code (11=Office, 33=Custodial, 99=Home) |
| Appointment/Servicing Provider | String | Yes | Provider attribution for productivity tracking |
| Rendering Provider Name | String | Yes | Actual provider who performed the service |
| Resource Provider Name | String | Yes | Secondary provider attribution |
| CPT Code | String | Yes | Procedure code — maps to RVU lookup table |
| CPT Description | String | Yes | Human-readable procedure description |
| CPT Group Name | String | Yes | Categorization (E/M, Home Visits, quality codes) |
| Primary Payer Name | String | Yes | Insurance carrier for payer mix analysis |
| Secondary Payer Name | String | Yes | Secondary insurance tracking |
| Service Date | Date | Yes | Date of encounter (primary date dimension) |
| Claim Date | Date | Yes | Date claim was filed (revenue cycle lag) |
| Start/End Date of Service | Date | Yes | Service period for multi-day encounters |
| Modifiers 1–4 | String | Yes | Billing modifiers affecting reimbursement |
| ICD1–ICD4 Code | String | Yes | Diagnosis codes for case complexity analysis |
| ICD1–ICD4 Name | String | Yes | Diagnosis descriptions |
| Billed Charge | Currency | Yes | Total amount billed |
| Payer Charge | Currency | Yes | Amount billed to insurance |
| Self Charge | Currency | Yes | Patient responsibility amount |
| Units | Integer | Yes | Billing units per CPT line |
| Patient Name | String | **EXCLUDE** | PHI — removed in custom report |
| Patient Acct No | String | **EXCLUDE** | PHI — removed in custom report |
| Claim No | String | **EXCLUDE** | Not needed; Encounter ID preferred |

#### 4.2.2 Report 36.14 — Financial Analysis at Claim Level

Provides the collections side of the revenue equation. While 371.02 shows what was billed, this report shows what was actually collected, adjusted, and written off. Can be run at the facility level or drill down to individual claims.

| Field Name | Data Type | Include? | Purpose |
|------------|-----------|----------|---------|
| Facility | String | Yes | Service line classification |
| Charges | Currency | Yes | Total charges for period |
| Payer Charges | Currency | Yes | Insurance-billed amount |
| Self Charges | Currency | Yes | Patient responsibility |
| Payments | Currency | Yes | Total payments received |
| Payer Payments | Currency | Yes | Insurance payments |
| Patient Payments | Currency | Yes | Patient payments |
| Contractual Adjustments | Currency | Yes | Negotiated rate reductions |
| Payer Withheld | Currency | Yes | Payer withholding amounts |
| Writeoff Adjustments | Currency | Yes | Uncollectable amounts |
| Refunds | Currency | Yes | Refund amounts |
| Claim Count | Integer | Yes | Number of claims in period |
| Patient Count | Integer | Yes | Unique patients served |
| Change in A/R | Currency | Yes | AR movement for cash flow analysis |

#### 4.2.3 Report 4.06 — Productivity

Captures the operational dimension: how time was spent, how efficiently visits were managed, and where capacity exists. Each row represents a single appointment.

| Field Name | Data Type | Include? | Purpose |
|------------|-----------|----------|---------|
| Facility | String | Yes | Service line classification |
| Appointment Date | Date | Yes | Date dimension for matching to billing data |
| Appointment Start/End Time | Time | Yes | Scheduled appointment window |
| Appointment Arrived Time | Time | Yes | Actual patient arrival (wait time calc) |
| Appointment Checked Out Time | Time | Yes | Visit completion (duration calc) |
| Is Televisit | Boolean | Yes | Telehealth vs. in-person classification |
| Visit Type | String | Yes | OV: Office Visit, HV: Home Visit, etc. |
| Visit Status | String | Yes | CHK, N/S (No Show), R/S (Rescheduled) |
| Appt Duration (Scheduled) | Duration | Yes | Planned visit length |
| Appt Duration (Actual) | Duration | Yes | Actual visit length |
| Variance | Duration | Yes | Scheduled vs. actual difference |
| Wait Time | Duration | Yes | Time from arrival to clinician |
| Time with Clinician | Duration | Yes | Provider face time |
| Patient Name | String | **EXCLUDE** | PHI — removed in custom report |
| Patient Acct No | String | **EXCLUDE** | PHI — removed in custom report |

### 4.3 Database Schema Design

The database is built in Supabase (PostgreSQL) with a schema designed to accommodate all four development phases. Core tables are created in Phase 1; future-phase tables are defined in the schema but populated later.

#### 4.3.1 Core Tables (Phase 1)

| Table | Description | Key Fields |
|-------|-------------|------------|
| uploads | Tracks every file upload with status and metadata | id, uploaded_by, upload_date, report_type, file_name, status, row_count, date_range_start, date_range_end, validation_errors |
| charges | Line-item billing data from 371.02 | id, upload_id, service_date, claim_date, facility, facility_pos, service_line, rendering_provider, cpt_code, cpt_description, cpt_group, primary_payer, icd_codes[], billed_charge, payer_charge, self_charge, units, modifiers[] |
| collections | Financial summary data from 36.14 | id, upload_id, period_start, period_end, facility, service_line, charges, payments, payer_payments, patient_payments, contractual_adj, writeoffs, refunds, claim_count, patient_count, ar_change |
| productivity | Appointment-level operational data from 4.06 | id, upload_id, appointment_date, facility, service_line, visit_type, visit_status, is_televisit, scheduled_duration, actual_duration, variance, wait_time, clinician_time |
| providers | Provider roster with schedule configurations | id, name, npi, role, employment_type, scheduled_days_per_week, service_lines[], is_active, hire_date |
| facilities | Facility registry with service line mapping | id, name, pos_code, service_line, address, is_active |
| rvu_lookup | CMS RVU fee schedule reference table | cpt_code, description, work_rvu, practice_expense_rvu, malpractice_rvu, total_rvu, conversion_factor, effective_date |
| kpi_daily | Calculated daily KPI snapshots | id, date, provider_id, facility_id, service_line, visits, rvu_total, wrvu_total, billed_amount, est_collections, no_shows, cancellations, avg_wait_time, avg_clinician_time |

#### 4.3.2 Future-Phase Tables

| Table | Phase | Description |
|-------|-------|-------------|
| email_digests | Phase 2 | Log of sent digest emails with content snapshots |
| time_off_requests | Phase 2 | Provider vacation/time-off with approval workflow |
| alerts | Phase 2 | Triggered alerts with type, severity, and resolution status |
| scenarios | Phase 3 | Saved scenario configurations and projection results |
| bonus_thresholds | Phase 3 | Incentive definitions with target metrics and payout rules |
| bonus_tracking | Phase 3 | Provider progress toward bonus thresholds |
| surveys | Phase 4 | Patient feedback responses linked to provider and date |
| tenants | Phase 4 | Multi-practice/SaaS tenant registry |
| emr_adapters | Phase 4 | EMR-specific field mapping configurations |

---

## 5. Data Ingestion Pipeline

### 5.1 Upload Workflow

The coordinator follows a simple daily workflow: run the report(s) in eCW, export as CSV or Excel 2007 Data, navigate to the Practice Health upload page, drag and drop the file, and confirm the upload result. The system handles all parsing, validation, and routing automatically.

### 5.2 Smart Report Detection

On file upload, the system reads the column headers and matches them against known signatures for each report type. This eliminates the need for the coordinator to manually identify which report they are uploading.

| Report Type | Detection Signature (Required Headers) |
|-------------|----------------------------------------|
| 371.02 Charges at CPT Level | CPT Code + Billed Charge + Rendering Provider Name + Facility POS |
| 36.14 Financial Analysis | Contractual Adjustments + Writeoff Adjustments + Change in A/R + Claim Count |
| 4.06 Productivity | Appointment Duration (scheduled) + Appointment Duration (actual) + Wait Time + Visit Status |

If the system cannot confidently identify the report type, it rejects the upload with a clear message specifying which report formats are expected.

### 5.3 Validation Rules

Every upload passes through a multi-step validation pipeline before data is written to the database.

#### 5.3.1 Structural Validation

- All required columns for the detected report type must be present
- Data types must match expected formats (dates, currency, integers)
- Row count must be greater than zero and less than a configurable maximum (default: 5,000)
- File size must not exceed 10MB

#### 5.3.2 PHI Rejection

The system scans uploaded column headers against a PHI blacklist. If any of the following columns are detected, the upload is immediately rejected with a descriptive error message directing the coordinator to use the custom report:

- Patient Name, Patient First Name, Patient Last Name
- Patient DOB, Patient Acct No, Patient SSN
- Patient Address (any variant), Patient Phone (any variant), Patient E-mail
- Insurance Subscriber No (primary or secondary)

#### 5.3.3 Data Quality Checks

- Service Date must not be in the future
- Service Date must be within the last 365 days (configurable)
- Billed Charge must be non-negative
- CPT Code must match a recognized format (5-digit numeric or alphanumeric HCPCS)
- Rendering Provider must match an active provider in the providers table, or flag for review
- Facility must match a registered facility, or flag for review

#### 5.3.4 Duplicate Prevention

The system checks for duplicate data using composite keys unique to each report type:

| Report | Composite Key | Duplicate Behavior |
|--------|---------------|-------------------|
| 371.02 | Service Date + Rendering Provider + CPT Code + Facility + Billed Charge | Reject entire file with message identifying date range overlap |
| 36.14 | Facility + Period Start + Period End | Reject entire file; Admin can authorize overwrite |
| 4.06 | Facility + Appointment Date + Appointment Start Time + Visit Type | Reject entire file with message identifying date range overlap |

Default behavior is rejection with notification. Admin users (not coordinators) can authorize an overwrite if a re-upload is genuinely needed.

### 5.4 Data Cleaning & Normalization

- Trim whitespace and normalize provider name casing (e.g., "JACKSON, ROY H" → "Jackson, Roy H")
- Strip currency symbols and commas from charge fields
- Normalize date formats to ISO 8601 (YYYY-MM-DD)
- Parse duration fields ("0 hours 30 minutes" → 30 minutes as integer)
- Flag $0.00 charge rows with quality-reporting CPT codes (G-codes) as non-billable
- Map Facility POS codes to service line designation: POS 11 = HCI Office; POS 33, 32, 99 = Mobile Docs
- Assign upload_id to every ingested row for audit trail and batch management

### 5.5 Custom eCW Report Specification

The following specification defines the custom report to be built in eCW's eBO (Business Objects) reporting engine. This report replaces the standard 371.02 export by pre-excluding PHI fields and including only the fields required by the Practice Health Module. A similar approach applies to 36.14 and 4.06 variants.

| Parameter | Value |
|-----------|-------|
| Report Name | Practice Health Export — Charges |
| Base Report | 371.02 — Charges at CPT Level |
| Export Format | Delimited Text (CSV) or Excel 2007 Data |
| Date Parameter | Service Date range (prompted at runtime) |
| Excluded Fields | Patient Name, Patient Acct No, Claim No, Patient DOB, all address/phone/email fields, Subscriber Nos |
| Included Fields | Facility, Facility POS, Rendering Provider Name, Rendering Provider NPI, CPT Code, CPT Description, CPT Group Name, Primary Payer Name, Service Date, Claim Date, Start/End DOS, Modifiers 1–4, ICD1–ICD4 Code/Name, Billed Charge, Payer Charge, Self Charge, Units |
| Filters | Payer Type: Payer Charge, Self Pay Charges (exclude void/test claims) |

---

## 6. KPI Engine

### 6.1 Overview

The KPI Engine is a calculation layer that transforms raw ingested data into standardized performance metrics. KPIs are calculated at multiple granularity levels (daily, weekly, monthly, trailing 30/60/90 days) and segmented by provider, service line, and facility. Results are stored in the kpi_daily snapshot table for fast dashboard rendering and trend analysis.

### 6.2 KPI Definitions

#### 6.2.1 Volume Metrics

| KPI | Formula | Source | Segmentation |
|-----|---------|--------|--------------|
| Visits per Day | COUNT of unique encounters (non-cancelled) per provider per day | 4.06 | Provider, Service Line, Facility |
| Visits per Week/Month | SUM of daily visit counts for period | 4.06 | Provider, Service Line, Practice |
| Patient Count | COUNT of unique patients per period | 36.14 | Facility, Service Line |
| New vs. Established Ratio | COUNT by CPT code range: 99201–99205 (new) vs. 99211–99215 (established) | 371.02 | Provider, Service Line |
| No-Show Rate | COUNT(Visit Status = N/S) / COUNT(all scheduled) × 100 | 4.06 | Provider, Service Line |
| Cancellation Rate | COUNT(Visit Status = R/S) / COUNT(all scheduled) × 100 | 4.06 | Provider, Service Line |
| Televisit Percentage | COUNT(Is Televisit = Yes) / COUNT(all visits) × 100 | 4.06 | Provider, Service Line |

#### 6.2.2 Financial Metrics

| KPI | Formula | Source | Segmentation |
|-----|---------|--------|--------------|
| Billed Charges | SUM(Billed Charge) for billable CPT rows only | 371.02 | Provider, Service Line, Payer |
| Revenue per Visit | SUM(Billed Charge for billable CPTs) / COUNT(unique encounters) | 371.02 | Provider, Service Line |
| Revenue per RVU | SUM(Billed Charge) / SUM(Total RVU) | 371.02 + RVU Lookup | Provider, Service Line |
| Collection Rate | Total Payments / Total Charges × 100 | 36.14 | Facility, Service Line |
| Net Collection Rate | (Payments) / (Charges – Contractual Adj) × 100 | 36.14 | Facility, Service Line |
| Days in AR | Change in A/R / (Charges / Days in Period) | 36.14 | Facility |
| Payer Mix | Percentage of charges by Primary Payer Name | 371.02 | Service Line, Provider |
| Revenue Cycle Lag | AVG(Claim Date – Service Date) in days | 371.02 | Provider, Facility |

#### 6.2.3 Productivity Metrics

| KPI | Formula | Source | Segmentation |
|-----|---------|--------|--------------|
| RVU per Day | SUM(Work RVU from lookup) per provider per day | 371.02 + RVU Lookup | Provider, Service Line |
| wRVU per Day | SUM(Work RVU) adjusted for provider FTE | 371.02 + Provider Schedule | Provider |
| wRVU per Month | SUM of daily wRVUs for calendar month | 371.02 + RVU Lookup | Provider |
| Average Visit Duration | AVG(Appointment Duration actual) for checked-out visits | 4.06 | Provider, Service Line |
| Average Wait Time | AVG(Wait Time) for checked-out visits | 4.06 | Provider, Facility |
| Schedule Utilization | COUNT(completed visits) / COUNT(available slots) × 100 | 4.06 | Provider, Service Line |
| Duration Variance | AVG(Actual – Scheduled duration) per visit type | 4.06 | Provider, Visit Type |

#### 6.2.4 Clinical Complexity Metrics

| KPI | Formula | Source | Segmentation |
|-----|---------|--------|--------------|
| Avg Diagnoses per Encounter | AVG(count of non-null ICD codes) per unique encounter | 371.02 | Provider, Service Line |
| E/M Level Distribution | Percentage breakdown of E/M CPT codes (99211–99215, 99341–99350) | 371.02 | Provider, Service Line |
| Quality Code Capture Rate | COUNT(encounters with G-codes) / COUNT(all encounters) × 100 | 371.02 | Provider |
| Top Diagnosis Frequency | Ranked list of ICD codes by frequency | 371.02 | Service Line, Facility |

### 6.3 RVU Calculation Logic

The RVU engine maps each billable CPT code from 371.02 to the CMS Physician Fee Schedule, which is publicly available and updated annually. The rvu_lookup reference table stores Work RVU, Practice Expense RVU, Malpractice RVU, Total RVU, and the Medicare Conversion Factor for each CPT code.

Calculation flow:

1. For each billable CPT row: look up Work RVU and Total RVU by CPT code and effective date
2. Multiply by Units if greater than 1
3. Apply modifier adjustments (e.g., Modifier 25 for separate E/M service)
4. Sum across all CPT rows for an encounter to get encounter-level RVUs
5. Sum across encounters for a day/week/month to get provider-level RVUs
6. Divide by FTE-adjusted working days to calculate wRVU rates

Non-billable rows (G-codes with $0.00 charges, quality reporting codes) are excluded from RVU calculations but tracked separately as quality metrics.

### 6.4 Part-Time Schedule Awareness

Because both NPs work 3 days per week, productivity metrics must be normalized to their actual scheduled days rather than assuming a 5-day work week. The providers table stores scheduled_days_per_week for each provider, and the KPI engine uses this to:

- Calculate visits per scheduled day (not per calendar day)
- Normalize wRVUs to FTE equivalent (3 days = 0.6 FTE)
- Compare productivity on a rate basis across providers with different schedules
- Adjust forecasts based on actual available provider-days per period

When time-off data is available (Phase 2), the engine further adjusts by subtracting approved vacation days from the denominator.

---

## 7. AI Insight Layer

### 7.1 Architecture

The AI Insight Layer sits on top of the KPI Engine and transforms calculated metrics into narrative intelligence. It uses a large language model (Claude via the Anthropic API) with structured prompts that include the current KPI snapshot, historical trend data, benchmark targets, and practice context. The AI generates three categories of output: Daily Insights, Operational Recommendations, and Trend Narratives.

### 7.2 Daily Insights

After each day's data is uploaded and KPIs are calculated, the AI generates a concise daily narrative summarizing practice performance. This narrative powers both the dashboard summary card and the daily email digest.

Example output:

> *"Tuesday Feb 10 — HCI saw 14 patients across both service lines (11 office, 3 Mobile Docs at Elegant Care Villa). Total billed charges: $2,963. NP2 handled 9 encounters across both lines, generating 12.4 wRVUs — 18% above her trailing 30-day average. Collection data from 36.14 shows $19.64 in payments posted against $973 in writeoffs, suggesting pending contractual adjustments from recent claims. One flag: the $630 in charges at Elegant Care has $0 payments posted — verify claim submission status. No operational alerts."*

### 7.3 Operational Recommendations

Beyond describing what happened, the AI proactively identifies opportunities and risks based on patterns in the data. Recommendations are categorized by type:

- **Productivity:** "NP1 averaged 4.2 visits/day this week vs. your 6.0 benchmark. Three afternoon slots went unfilled. Consider reviewing scheduling patterns or enabling same-day appointment availability."
- **Revenue:** "CCM enrollment across Mobile Docs patients is at 48%, well below the 65% target in your financial model. Achieving target would add approximately $2,800/month in recurring revenue. Recommend assigning a coordinator to audit eligible patients."
- **Coding:** "72% of NP2's office visits are coded as 99213 (low complexity). Peer benchmarks for internal medicine show 45% at 99214. Review documentation patterns to ensure visit complexity is fully captured."
- **Efficiency:** "Average wait time at HCI Office increased to 22 minutes this week (up from 14-minute baseline). Actual visit duration is within normal range, suggesting the bottleneck is pre-visit workflow, not provider time."

### 7.4 Trend Narratives

For weekly and monthly digest emails, the AI generates longer-form analysis that identifies trends, compares period-over-period performance, and contextualizes changes. These narratives reference specific data points but focus on the story behind the numbers.

### 7.5 AI Prompt Architecture

Each AI call includes a structured prompt with the following components:

- System prompt defining the AI's role as a healthcare practice analytics advisor
- Practice context: provider roster, service lines, financial model targets, benchmark assumptions
- Current period KPI data as structured JSON
- Historical comparison data (prior day, prior week same day, trailing 30-day averages)
- Active alerts or flags from validation
- Output format instructions (JSON with narrative text, alert severity, recommendation category)

The prompt architecture is designed to be extensible: as new KPIs are added in later phases (bonus progress, survey scores, scenario results), they are appended to the context payload without restructuring the core prompt.

---

## 8. Role-Based Access Control

### 8.1 Role Definitions

| Role | Users | Upload | Dashboard | AI Insights | Settings |
|------|-------|--------|-----------|-------------|----------|
| Admin | Ryan (Practice Owner) | Full access | Full access — all service lines, all providers | Full access — insights, recommendations, forecasts | Full access — benchmarks, thresholds, provider config |
| Medical Director | Medical Director | View status only | Full access — all service lines, all providers | Full access — insights, recommendations, forecasts | View only |
| Coordinator | Assigned staff member | Upload files + view status/errors | No access | No access | No access |
| Provider (Phase 3) | NP1, NP2 | No access | Own metrics only — no practice-level financials | Own productivity insights and bonus progress | No access |

### 8.2 Access Control Implementation

Role-based access is enforced at both the application layer (UI routing and component visibility) and the database layer (Supabase Row-Level Security policies). This ensures that even if a coordinator somehow navigated to a dashboard URL, the underlying data queries would return no results.

- Coordinator role: INSERT permission on uploads table only; no SELECT on kpi_daily, charges, collections, or productivity tables
- Medical Director role: SELECT on all analytics tables; no INSERT/UPDATE on configuration tables
- Admin role: Full CRUD on all tables
- Provider role (Phase 3): SELECT on kpi_daily filtered by provider_id = auth.uid(); no access to practice-level aggregations

---

## 9. Dashboard Specifications

### 9.1 Admin Dashboard

The primary dashboard for practice leadership (Admin and Medical Director roles). Provides a consolidated view of practice health with the ability to drill down by service line, provider, facility, and time period.

#### 9.1.1 Summary Header

- Date selector (single day, week, month, custom range)
- Service line toggle: All | HCI Office | Mobile Docs
- Key metric cards: Total Visits, Total Billed Charges, Estimated Collections, wRVUs, Collection Rate
- Trend indicator on each card (up/down arrow with percentage vs. prior period)

#### 9.1.2 AI Insights Panel

- Daily narrative summary (generated by AI Insight Layer)
- Active alerts with severity badges (Critical, Warning, Info)
- Operational recommendations with category tags
- Expandable detail for each insight with supporting data

#### 9.1.3 Provider Productivity View

- Provider comparison table: Visits, RVUs, wRVUs, Billed Charges, Avg Visit Duration
- Normalized to scheduled days (not calendar days)
- Sparkline trend charts for trailing 30 days
- Color-coded performance vs. benchmark (green/yellow/red)

#### 9.1.4 Financial View

- Charges vs. Collections over time (line chart)
- Payer mix breakdown (pie/donut chart)
- Revenue cycle lag trend (bar chart)
- AR aging summary

#### 9.1.5 Operational View

- Visit volume trend (bar chart by day)
- No-show and cancellation rate trend
- Wait time and visit duration averages
- Schedule utilization by provider

### 9.2 Coordinator Upload Interface

A minimal, single-purpose interface for the coordinator role:

- Drag-and-drop file upload zone
- Upload history table showing: date, report type (auto-detected), row count, status (success/error)
- Clear error messages with remediation guidance for failed uploads
- No visibility into dashboards, KPIs, financial data, or AI insights

---

## 10. Email Digest System (Phase 2)

### 10.1 Daily Digest

An automated email sent each morning to the Medical Director and Admin (Ryan) summarizing the previous day's practice performance. The email is concise and scannable, leading with alerts if any exist.

Digest structure:

1. Subject line: "Practice Health — [Date] — [Alert Count] Alerts" (or "No Alerts")
2. Alert section (if any): Critical and warning alerts with one-line descriptions
3. Key metrics: Visits, Billed Charges, Estimated Collections, wRVUs (with vs. prior day)
4. AI narrative summary (3–5 sentences)
5. Link to full dashboard: "View Full Report →"

### 10.2 Weekly Digest

Sent every Monday morning. Includes week-over-week trend comparisons, provider rankings, and a longer AI narrative with operational recommendations.

### 10.3 Monthly Digest

Sent on the 1st of each month. Comprehensive month-in-review with financial performance, provider productivity rankings, payer mix trends, collection rate analysis, and forward-looking projections for the coming month.

### 10.4 Alert Triggers

| Alert Type | Trigger Condition | Severity |
|------------|-------------------|----------|
| Low Volume | Provider visits < 60% of daily benchmark for 2+ consecutive days | Warning |
| Revenue Drop | Daily billed charges < 70% of trailing 30-day average | Warning |
| Collection Rate | Net collection rate drops below 85% for rolling 30-day period | Critical |
| No-Show Spike | No-show rate exceeds 20% for any provider in a week | Warning |
| Coding Anomaly | E/M level distribution shifts significantly from 30-day baseline | Info |
| Upload Missing | No data uploaded for a business day by 12:00 PM next day | Warning |
| AR Aging | Days in AR exceeds 45 days | Critical |

---

## 11. Scenario Simulator (Phase 3)

### 11.1 Overview

The Scenario Simulator allows practice leadership to model the financial and operational impact of strategic decisions before committing resources. It uses actual practice data as the baseline and applies user-defined parameter changes to project outcomes over configurable time horizons (30 days, 90 days, 1 year, 5 years).

### 11.2 Pre-Built Scenarios

| Scenario | Adjustable Parameters | Output Metrics |
|----------|----------------------|----------------|
| Add a Provider | Provider type (MD/NP/PA), FTE, service line, ramp-up period, compensation | Projected visits, revenue, wRVUs, breakeven timeline, EBITDA impact |
| Increase Daily Volume | Target visits/day per provider, ramp timeline | Revenue projection, capacity requirements, wait time impact |
| Weekend/Extended Hours | Days added, hours per day, expected visit volume | Incremental revenue, staffing cost, ROI timeline |
| Add Service Line | Service type (CCM, RPM, AWV, TCM), eligible patient %, enrollment ramp | Recurring revenue projection, per-provider contribution |
| Payer Mix Shift | Target MA vs. FFS percentage, PMPM rate, timeline | Revenue impact, margin change, breakeven analysis |
| Facility Expansion | New facility, expected census, visit frequency, ramp period | Revenue projection, provider allocation, travel time impact |

### 11.3 Custom Scenarios

Users can combine multiple parameter adjustments into a single scenario (e.g., "Add 1 NP + expand to weekend half-days + increase CCM enrollment to 65%") and compare the combined projection against the baseline and against individual scenarios. Scenarios can be saved, named, and revisited as actual data evolves.

### 11.4 Financial Model Integration

The simulator is pre-loaded with assumptions from the Mobile Docs financial model: $281 blended revenue per encounter, 7.1 visits/day target, 65% CCM penetration, 35% RPM penetration, $385 PMPM for MA contracts, and the five-year growth trajectory from $958K to $5.2M. As actual data accumulates, the simulator can toggle between model assumptions and actual trailing averages as the projection baseline.

---

## 12. Bonus & Incentive Framework (Phase 3)

### 12.1 Structure

The bonus framework supports configurable incentive programs tied to measurable KPIs. Admin defines bonus thresholds and payout rules; the system automatically tracks provider progress and displays it on the Provider Dashboard (visible only to the individual provider and Admin).

### 12.2 Example Incentive Structures

| Incentive Type | Metric | Threshold | Payout Example |
|----------------|--------|-----------|----------------|
| Volume Bonus | Visits per scheduled day | > 7.0 average for the month | $15 per visit above threshold |
| RVU Bonus | wRVUs per month | > 120 wRVUs (0.6 FTE adjusted) | $25 per wRVU above threshold |
| Quality Bonus | Patient survey score (Phase 4) | > 4.5/5.0 average | $500 monthly bonus |
| CCM Enrollment | % of eligible patients enrolled in CCM | > 65% enrollment rate | $1,000 quarterly bonus |
| Efficiency Bonus | Average wait time | < 15 minutes average | $250 monthly bonus |

### 12.3 Provider Dashboard View

Providers see only their own metrics: current month visits, wRVUs, trend vs. prior months, and progress bars showing distance to each bonus threshold. They do not see practice-level revenue, other providers' metrics, or financial projections. This maintains competitive motivation while protecting sensitive business information.

---

## 13. Future Extensibility & SaaS Architecture

### 13.1 Multi-Tenant Design

The database schema includes a tenant_id field on all core tables (dormant in Phase 1–3, activated in Phase 4). This enables multi-practice support where each practice's data is fully isolated via Row-Level Security policies keyed to the tenant. The SaaS platform would provide practice-level onboarding, user management, and billing.

### 13.2 EMR Adapter Framework

Different practices use different EMR systems, each with its own reporting format. The adapter framework provides a mapping layer between each EMR's export format and the Practice Health Module's standardized schema. Phase 1 ships with the eCW adapter (based on reports 371.02, 36.14, and 4.06). Future adapters would follow the same pattern:

1. Define the EMR's available export format and field names
2. Create a field mapping configuration that translates EMR fields to the standardized schema
3. Build a parser that applies the mapping and normalizes the data
4. Register the adapter in the emr_adapters table

Target EMR systems for future adapters include: athenahealth, DrChrono, Practice Fusion, SimplePractice (mental health), TherapyNotes, and Kareo.

### 13.3 Specialty-Specific Benchmarks

The standalone SaaS product would include specialty-specific benchmark libraries that provide context for AI insights. An internal medicine practice generating 5.0 wRVUs/day has different implications than a psychiatry practice generating 5.0 wRVUs/day. Benchmark libraries would cover: internal medicine, family medicine, mental health/psychiatry, physical therapy, dermatology, dental, and pediatrics.

### 13.4 API & Integration Layer

Phase 4 includes a REST API layer enabling integrations with third-party tools: accounting systems (QuickBooks, Xero) for financial reconciliation, scheduling platforms for real-time capacity data, and business intelligence tools (Tableau, PowerBI) for practices that want to build custom analytics on top of the standardized data.

---

## 14. Technical Requirements

### 14.1 Technology Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | React | Consistent with existing HCI platform modules |
| Backend / Database | Supabase (PostgreSQL) | Row-Level Security for RBAC; real-time subscriptions for upload status |
| AI Engine | Anthropic API (Claude) | Structured prompts with JSON input/output for KPI analysis |
| File Parsing | Papa Parse (CSV), SheetJS (Excel) | Client-side parsing before upload for immediate validation feedback |
| Email Service | Google Workspace (Gmail API) or Resend | Transactional emails for daily/weekly/monthly digests |
| RVU Reference Data | CMS Physician Fee Schedule | Annual update; stored in rvu_lookup table |
| Hosting | Netlify (frontend) + Supabase (backend) | Consistent with existing infrastructure |
| IDE | Cursor AI | Development environment with style guide integration |

### 14.2 HIPAA Compliance

The Practice Health Module is designed to operate without storing, transmitting, or displaying Protected Health Information (PHI). Compliance is achieved through data exclusion at the source rather than encryption of PHI at rest.

- Custom eCW reports exclude all PHI fields before export
- Upload pipeline rejects files containing PHI column headers
- No patient names, DOBs, addresses, phone numbers, SSNs, or account numbers enter the system
- Encounter-level data uses Service Date + Provider + Facility + CPT Code as identifiers
- AI prompts never include patient-identifiable information
- All data transmission uses HTTPS/TLS encryption
- Supabase Row-Level Security enforces role-based data isolation

### 14.3 Performance Requirements

- File upload and validation: < 5 seconds for files up to 5,000 rows
- KPI calculation after upload: < 10 seconds for daily recalculation
- Dashboard load time: < 2 seconds for current period view
- AI insight generation: < 15 seconds per daily analysis
- Email digest delivery: within 30 minutes of scheduled time

### 14.4 Data Retention

- Raw upload files: retained for 90 days, then archived
- Parsed data in database tables: retained indefinitely for trend analysis
- KPI snapshots: retained indefinitely
- AI-generated insights: retained for 2 years
- Upload audit trail: retained indefinitely

---

## 15. Success Metrics

The following metrics define success for the Practice Health Module at each phase.

### 15.1 Phase 1 Success Criteria

- Daily data uploads processed successfully with < 2% error rate
- KPI calculations match manual verification within 1% tolerance
- AI insights rated as actionable by Medical Director and Admin in > 80% of daily reports
- Dashboard load time under 2 seconds
- Zero PHI exposure incidents

### 15.2 Ongoing Operational Metrics

- Time savings: reduction in manual reporting effort (target: 5+ hours/week)
- Decision impact: documented instances where AI insights led to operational changes
- Data completeness: percentage of business days with all three reports uploaded
- Forecast accuracy: projected vs. actual revenue within 10% variance over rolling 90 days

---

*HCI Medical Group — Practice Health Module PRD v1.0 — March 2026*
