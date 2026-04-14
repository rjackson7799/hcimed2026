# Annual Wellness Visit Tracker
## Revenue Program Tracking & Patient Eligibility Management
### Product Requirements Document

**HCI Medical Group**
**Version 1.0 | March 2026**
**CONFIDENTIAL**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Data Architecture](#3-data-architecture)
4. [Patient Registry & Identification](#4-patient-registry--identification)
5. [Bulk Upload Pipeline](#5-bulk-upload-pipeline)
6. [Individual Patient Entry](#6-individual-patient-entry)
7. [Eligibility Management](#7-eligibility-management)
8. [Completion Tracking & Workflow](#8-completion-tracking--workflow)
9. [Revenue Dashboard](#9-revenue-dashboard)
10. [Provider-Level Tracking](#10-provider-level-tracking)
11. [Role-Based Access Control](#11-role-based-access-control)
12. [Dashboard Specifications](#12-dashboard-specifications)
13. [Integration with Practice Health Module](#13-integration-with-practice-health-module)
14. [Future Extensibility](#14-future-extensibility)
15. [Technical Requirements](#15-technical-requirements)
16. [Success Metrics](#16-success-metrics)

---

## 1. Executive Summary

The Annual Wellness Visit (AWV) Tracker is a standalone module within the HCI Portal that manages patient eligibility, completion tracking, and revenue attribution for Medicare Annual Wellness Visits across both HCI Office and Mobile Docs service lines. AWVs represent a significant and systematically underutilized revenue stream: every Medicare beneficiary is eligible for one AWV per rolling 12-month period, yet national completion rates hover around 50%. For a practice with 300+ Medicare patients, the gap between current capture and full penetration can represent $50,000–$150,000 in annual unrealized revenue.

The module replaces informal spreadsheet-based tracking with a structured system that supports bulk patient upload from eCW exports, individual patient entry, a two-stage eligibility and completion workflow, rolling 12-month eligibility calculations, and a revenue dashboard showing captured vs. remaining AWV revenue. It uses minimal patient identifiers (last name and eCW patient ID only) to maintain a conservative HIPAA posture consistent with the Practice Health Module's PHI-exclusion approach.

The AWV Tracker is the first implementation of what will become a family of revenue program modules (CCM, RPM, TCM). While it launches as a standalone sidebar item in the HCI Portal, the underlying data model is designed to generalize to other patient-level program tracking use cases with minimal schema changes.

---

## 2. Product Overview

### 2.1 Problem Statement

Annual Wellness Visits are a high-margin, low-complexity service that generates reliable revenue per eligible patient. However, tracking AWV eligibility and completion across a Medicare patient panel is operationally burdensome without dedicated tooling:

- No centralized view of which patients are eligible, which have completed their AWV, and which are outstanding
- Rolling 12-month eligibility windows are patient-specific, making spreadsheet tracking error-prone
- No visibility into AWV revenue captured vs. revenue remaining on the table
- No provider-level accountability for AWV completion rates
- No structured workflow for moving patients from "eligible" through "scheduled" to "completed"
- Difficult to identify patients approaching eligibility or newly eligible after a 12-month gap
- No connection between AWV completion data and the broader practice financial picture tracked in Practice Health

### 2.2 Solution

The AWV Tracker provides a patient-level registry with rolling eligibility calculations, a bulk upload pipeline for eCW patient roster imports, a two-stage status workflow (eligibility determination → completion tracking), and a revenue dashboard that quantifies the financial impact of AWV capture rates. The module is accessible to Admin and Coordinator roles, with provider-level views showing completion metrics per clinician.

### 2.3 Medicare AWV Background

Medicare covers three types of wellness visits, each with distinct eligibility rules and CPT codes:

| Visit Type | CPT Code | Eligibility | Medicare Reimbursement (Approx.) |
|-----------|----------|-------------|----------------------------------|
| Initial Preventive Physical Exam (IPPE) | G0402 | One-time only; within first 12 months of Medicare Part B enrollment | ~$175 |
| Initial AWV | G0438 | First AWV after IPPE period; 12+ months after Part B effective date | ~$270 |
| Subsequent AWV | G0439 | 12+ months after last AWV (G0438 or G0439) | ~$230 |

Key rules:
- A patient may receive one AWV per rolling 12-month period (not calendar year)
- The 12-month clock starts from the date of the last completed AWV
- IPPE and AWV are distinct benefits — a patient can have an IPPE and an Initial AWV in the same year if timing permits
- AWV does not include a physical exam; it is a health risk assessment, care plan, and screening referral visit
- Common AWV add-on services (billed same day) include: Advance Care Planning (ACP, CPT 99497/99498), depression screening (G0444), and alcohol misuse screening (G0442)

### 2.4 Service Line Applicability

AWV tracking spans both HCI service lines:

| Service Line | AWV Context |
|-------------|-------------|
| HCI Office | Traditional office-based AWVs scheduled as dedicated appointments. Higher volume, standard scheduling workflow. |
| Mobile Docs | AWVs performed during house calls at SNFs, board-and-care facilities, and homebound patient residences. Often combined with a problem-oriented E/M visit on the same day. Higher per-visit reimbursement when stacked with home visit codes. |

The service line designation is captured per patient record and enables separate tracking of AWV completion rates and revenue contribution by service line.

### 2.5 Users

| User | Primary Use Cases |
|------|-------------------|
| Ryan (Admin) | Revenue dashboard review, completion rate monitoring, provider performance tracking, bulk upload oversight, eligibility audits |
| Coordinator | Bulk patient upload, individual patient entry, eligibility status updates, completion logging, worklist management |
| Medical Director | Review provider-level completion rates, AWV scheduling prioritization |
| Provider (Future) | View own assigned patients' AWV status, mark completions (if role expanded) |

---

## 3. Data Architecture

### 3.1 Database Schema

The AWV Tracker introduces new tables to the existing Supabase (PostgreSQL) database shared with the Practice Health Module and Facility Directory. All tables follow established conventions: `tenant_id` field for future SaaS isolation, Row-Level Security for role-based access, ISO 8601 date formatting, and UUID primary keys.

#### 3.1.1 Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| awv_patients | Master patient registry with minimal identifiers | id, tenant_id, ecw_patient_id, last_name, assigned_provider_id, service_line, facility_id, payer_name, medicare_status, is_active, created_at, updated_at |
| awv_tracking | Per-patient AWV tracking records with eligibility and completion workflow | id, patient_id, eligibility_status, eligibility_reason, completion_status, completion_date, awv_type, cpt_code, billed_amount, last_awv_date, next_eligible_date, date_source, scheduled_date, notes, updated_by, created_at, updated_at |
| awv_uploads | Upload audit log for bulk imports | id, tenant_id, uploaded_by, upload_date, file_name, row_count, new_patients, updated_patients, flagged_patients, status, validation_errors, created_at |
| awv_reimbursement_rates | Reference table for AWV CPT reimbursement rates | id, cpt_code, description, expected_reimbursement, effective_date, is_current |
| awv_addons | Optional add-on services tracked alongside AWVs | id, tracking_id, cpt_code, description, billed_amount, created_at |

#### 3.1.2 Field Specifications — awv_patients

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| tenant_id | UUID | Yes | Current tenant | Multi-tenant isolation (dormant until SaaS phase) |
| ecw_patient_id | String (50) | Yes | — | eClinicalWorks patient account number; unique constraint per tenant; serves as the primary matching key for bulk uploads |
| last_name | String (100) | Yes | — | Patient last name only — no first names, DOBs, addresses, or full insurance numbers |
| assigned_provider_id | UUID | No | null | FK to providers table; the provider responsible for this patient's AWV |
| service_line | Enum | Yes | — | HCI Office, Mobile Docs |
| facility_id | UUID | No | null | FK to facilities_directory; applicable for Mobile Docs patients; null for HCI Office patients |
| payer_name | String (255) | No | null | Primary payer from eCW (e.g., "Medicare Part B", "UHC Medicare Advantage"); informational, not used for eligibility logic |
| medicare_status | Enum | Yes | Active | Active, Inactive, Unknown — reflects whether the patient is currently enrolled in Medicare |
| is_active | Boolean | No | true | Soft deactivation flag; false for deceased, disenrolled, or transferred patients |
| created_at | Timestamp | Auto | now() | Record creation |
| updated_at | Timestamp | Auto | now() | Last modification |

#### 3.1.3 Field Specifications — awv_tracking

This is the central workflow table. Each row represents a single AWV tracking cycle for a patient. When an AWV is completed, the next tracking cycle begins automatically (a new row is created with `last_awv_date` set to the just-completed AWV's `completion_date` and `next_eligible_date` calculated as `completion_date + 12 months`).

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| patient_id | UUID | Yes | — | FK to awv_patients |
| eligibility_status | Enum | Yes | Pending Review | Pending Review, Eligible, Not Eligible |
| eligibility_reason | String (255) | No | null | Required when eligibility_status = Not Eligible. Examples: "AWV completed < 12 months ago", "Not Medicare enrolled", "Medicare Part B < 12 months (IPPE eligible only)", "Patient declined", "Hospice" |
| completion_status | Enum | Yes | Not Started | Not Started, Scheduled, Completed, Refused, Unable to Complete |
| completion_date | Date | No | null | Date the AWV was performed; required when completion_status = Completed |
| awv_type | Enum | No | null | IPPE (G0402), Initial AWV (G0438), Subsequent AWV (G0439); set when completion status moves to Scheduled or Completed |
| cpt_code | String (10) | No | null | Billed CPT code; auto-populated from awv_type selection or manually overridden |
| billed_amount | Decimal (10,2) | No | null | Actual billed amount if known; defaults to expected reimbursement from awv_reimbursement_rates if not specified |
| last_awv_date | Date | No | null | Date of the patient's most recent prior AWV; used to calculate next_eligible_date. Null if no prior AWV on record (patient is eligible for Initial AWV). |
| next_eligible_date | Date | No | null | Calculated: last_awv_date + 12 months. Null if last_awv_date is null (immediately eligible). Display-only; recalculated on last_awv_date change. |
| date_source | Enum | No | Manual | Manual (entered by user), Upload (from bulk import), PHM Auto (derived from Practice Health Module charges data in future integration) |
| scheduled_date | Date | No | null | Planned AWV date; set when completion_status = Scheduled |
| notes | Text | No | null | Free-text notes for this tracking cycle (e.g., "Patient prefers morning appointments", "Needs interpreter", "Combine with home visit at Elegant Care") |
| updated_by | UUID | Yes | — | FK to auth.users; last person to modify this record |
| created_at | Timestamp | Auto | now() | Tracking record creation |
| updated_at | Timestamp | Auto | now() | Last modification |

#### 3.1.4 Field Specifications — awv_uploads

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| tenant_id | UUID | Yes | Current tenant | Multi-tenant isolation |
| uploaded_by | UUID | Yes | — | FK to auth.users |
| upload_date | Timestamp | Auto | now() | Upload timestamp |
| file_name | String (255) | Yes | — | Original file name |
| row_count | Integer | No | null | Total rows in uploaded file |
| new_patients | Integer | No | 0 | Count of new patient records created |
| updated_patients | Integer | No | 0 | Count of existing patient records updated |
| flagged_patients | Integer | No | 0 | Count of patients in system but missing from upload (potential disenrollment) |
| status | Enum | Yes | Processing | Processing, Completed, Completed with Warnings, Failed |
| validation_errors | JSONB | No | null | Array of error objects: { row, field, message } |
| created_at | Timestamp | Auto | now() | |

#### 3.1.5 Field Specifications — awv_reimbursement_rates

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| cpt_code | String (10) | Yes | — | G0402, G0438, G0439, 99497, 99498, G0444, G0442 |
| description | String (255) | Yes | — | Human-readable description |
| expected_reimbursement | Decimal (10,2) | Yes | — | Expected Medicare reimbursement amount |
| effective_date | Date | Yes | — | Date this rate became effective (for annual CMS updates) |
| is_current | Boolean | Yes | true | Only one rate per CPT code should be current at a time |

#### 3.1.6 Field Specifications — awv_addons

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| tracking_id | UUID | Yes | — | FK to awv_tracking; the AWV this add-on was billed alongside |
| cpt_code | String (10) | Yes | — | Add-on CPT code (99497, 99498, G0444, G0442, etc.) |
| description | String (255) | No | null | Auto-populated from awv_reimbursement_rates or manually entered |
| billed_amount | Decimal (10,2) | No | null | Actual or estimated billed amount |
| created_at | Timestamp | Auto | now() | |

#### 3.1.7 Relationship to Existing Tables

| AWV Table | Existing Table | Join Logic | Purpose |
|-----------|---------------|------------|---------|
| awv_patients | providers (PHM) | awv_patients.assigned_provider_id ↔ providers.id | Provider assignment and roster awareness |
| awv_patients | facilities_directory | awv_patients.facility_id ↔ facilities_directory.id | Facility attribution for Mobile Docs patients |
| awv_tracking | charges (PHM) | Via patient matching on ecw_patient_id + CPT code G0438/G0439/G0402 | Future auto-detection of AWV completions from billing data |

---

## 4. Patient Registry & Identification

### 4.1 Identification Approach

The AWV Tracker uses minimal patient identifiers to balance operational usability with HIPAA compliance:

**Stored:** eCW patient account number (primary key for matching), patient last name (for human-readable display and disambiguation)

**Not stored:** First name, date of birth, address, phone number, email, Social Security number, full Medicare Beneficiary Identifier (MBI), medical record number

This approach means the system displays patient records as "Johnson (ECW# 84720)" rather than "Sarah Johnson, DOB 03/15/1942." Staff cross-reference eCW for full patient details when needed. The trade-off is accepted: the AWV Tracker is a worklist and revenue tool, not a clinical record.

### 4.2 Patient Display Format

Throughout the interface, patient records display as:

```
[Last Name] — [eCW ID] — [Provider] — [Service Line]
```

Example: **Williams — ECW#91034 — NP2 — Mobile Docs**

This format provides enough context for operational identification without exposing protected information. For facilities with multiple patients sharing a last name, the eCW ID serves as the disambiguator.

### 4.3 Patient Deactivation

Patients are never hard-deleted. When a patient is deceased, disenrolled from Medicare, or transferred out of the practice:

1. Set `is_active = false` on the awv_patients record
2. The current awv_tracking record's completion_status is set to "Unable to Complete" with a note documenting the reason
3. The patient is excluded from default worklist views and dashboard denominators
4. The patient's historical data (prior completions, revenue captured) is retained for reporting

Admin can reactivate a patient if circumstances change (e.g., patient returns to the practice after a period of inactivity).

---

## 5. Bulk Upload Pipeline

### 5.1 Overview

Bulk upload is the primary mechanism for populating and refreshing the patient registry. The coordinator runs a custom eCW report exporting the active Medicare patient roster, uploads the file to the AWV Tracker, and the system matches records against the existing registry using eCW patient ID as the key.

### 5.2 eCW Export Specification

The following custom report should be built in eCW's eBO reporting engine to produce the upload file:

| Parameter | Value |
|-----------|-------|
| Report Name | AWV Patient Roster Export |
| Export Format | CSV or Excel 2007 Data |
| Population | Active patients with primary payer containing "Medicare" |
| Excluded Fields | Patient first name, DOB, address, phone, email, SSN, MBI, all clinical data |

**Required columns in the export:**

| Column Name | Maps To | Required | Notes |
|------------|---------|----------|-------|
| Patient Acct No | ecw_patient_id | Yes | Primary matching key |
| Patient Last Name | last_name | Yes | Display identifier |
| Rendering Provider | assigned_provider_id | Yes | Matched against providers table by name |
| Facility | facility_id | No | Matched against facilities_directory by name; null for office patients |
| Primary Payer Name | payer_name | No | Informational; confirms Medicare enrollment |
| Last AWV Date | last_awv_date | No | If available from eCW; populates initial eligibility calculation |
| Last AWV CPT | awv_type derivation | No | G0402, G0438, or G0439 — helps determine next AWV type |

If the eCW report cannot include Last AWV Date and Last AWV CPT fields, those columns are simply omitted from the export and left for manual entry or future Practice Health auto-detection.

### 5.3 Upload Validation

#### 5.3.1 Structural Validation

- File must be CSV or Excel (.xlsx) format
- Required columns (Patient Acct No, Patient Last Name, Rendering Provider) must be present
- Row count must be > 0 and < 10,000
- File size must not exceed 10MB

#### 5.3.2 PHI Rejection

The upload pipeline scans column headers against a PHI blacklist, consistent with Practice Health Module conventions. If any of the following columns are detected, the upload is rejected with a descriptive error:

- Patient First Name, Patient DOB, Patient SSN
- Patient Address (any variant), Patient Phone (any variant), Patient Email
- Medicare Beneficiary Identifier, Insurance Subscriber No
- Diagnosis codes, medication lists, clinical notes

#### 5.3.3 Data Quality Checks

- Patient Acct No must be non-empty and unique within the file
- Patient Last Name must be non-empty
- Rendering Provider must match an active provider in the providers table (or flag for review)
- Facility (if present) must match a registered facility in facilities_directory (or flag for review)
- Last AWV Date (if present) must be a valid date not in the future and within the last 24 months

### 5.4 Upsert Logic

The upload uses an upsert model keyed on `ecw_patient_id`:

| Scenario | Behavior |
|----------|----------|
| **New patient ID** (not in awv_patients) | Insert new awv_patients record. Create new awv_tracking record with eligibility_status = "Pending Review" and completion_status = "Not Started". If Last AWV Date is provided, populate last_awv_date and calculate next_eligible_date. |
| **Existing patient ID** (already in awv_patients) | Update provider assignment and facility if changed. Update payer_name if changed. Do NOT overwrite eligibility_status or completion_status on the active awv_tracking record. If Last AWV Date is provided and the existing record has no last_awv_date, populate it (but do not overwrite an existing value without Admin confirmation). |
| **Patient in system but missing from upload** | Flag as "Not in Latest Upload" in the upload results summary. Do NOT automatically deactivate — Admin reviews and decides whether to deactivate (disenrollment, death, transfer) or ignore (patient still active, just not in this export run). |

### 5.5 Upload Results Summary

After processing, the system displays a results summary:

- Total rows processed
- New patients added (with count)
- Existing patients updated (with count and list of changed fields)
- Patients flagged as missing from upload (with count and list)
- Validation warnings (e.g., unmatched provider names, unmatched facilities)
- Validation errors (if any rows were rejected)

The summary is stored in the awv_uploads table for audit purposes. If the upload status is "Completed with Warnings," the warnings are displayed inline and the coordinator can review flagged items before confirming.

### 5.6 Recommended Upload Cadence

Monthly refresh uploads are recommended. This catches new Medicare enrollees, provider reassignments, and facility changes. The upsert model ensures that monthly re-uploads are non-destructive — existing eligibility and completion data is preserved.

---

## 6. Individual Patient Entry

### 6.1 Add Patient Form

New patients can be added individually through an "Add Patient" button on the AWV dashboard. The form collects:

**Step 1 — Patient Identification**

- eCW Patient ID (required; validated as unique)
- Last Name (required)
- Medicare Status: Active, Inactive, Unknown (required; defaults to Active)
- Primary Payer Name (optional)

**Step 2 — Assignment**

- Service Line: HCI Office, Mobile Docs (required)
- Facility (conditional; required if Service Line = Mobile Docs; dropdown populated from facilities_directory where status = Active)
- Assigned Provider (required; dropdown populated from active providers table)

**Step 3 — AWV History**

- Last AWV Date (optional; date picker)
- Last AWV Type: IPPE, Initial AWV, Subsequent AWV, Unknown (optional; shown only if Last AWV Date is entered)
- Date Source: Manual, Upload (auto-set to Manual for individual entry)

On submission, the system creates the awv_patients record and an initial awv_tracking record. If Last AWV Date is provided, next_eligible_date is calculated. If no Last AWV Date is provided, the patient is treated as having no prior AWV — immediately eligible, and the AWV type defaults to Initial AWV (G0438) unless overridden.

### 6.2 Edit Patient

All patient-level fields (last name, provider assignment, service line, facility, Medicare status) are editable from the patient detail view. Changes to service line or facility update the display but do not affect active tracking records. Provider reassignment updates the current tracking record's attribution.

---

## 7. Eligibility Management

### 7.1 Two-Stage Status Model

The AWV Tracker separates eligibility determination from completion tracking into two independent status fields. This avoids ambiguous combined states and enables clean filtering.

**Stage 1 — Eligibility Status:** Answers "Can this patient receive an AWV?"

| Status | Meaning | Set By |
|--------|---------|--------|
| Pending Review | New patient; eligibility not yet assessed | System (on record creation) |
| Eligible | Patient is eligible for an AWV based on 12-month rule | Admin or Coordinator |
| Not Eligible | Patient cannot receive an AWV; reason documented | Admin or Coordinator |

**Stage 2 — Completion Status:** Answers "What is the status of this eligible patient's AWV?" (Only actionable when eligibility_status = Eligible)

| Status | Meaning | Set By |
|--------|---------|--------|
| Not Started | Eligible but no AWV scheduled or performed | System (default) |
| Scheduled | AWV appointment scheduled; date captured | Admin or Coordinator |
| Completed | AWV performed; date, type, and billing captured | Admin or Coordinator |
| Refused | Patient declined the AWV | Admin or Coordinator |
| Unable to Complete | AWV could not be performed (patient hospitalized, cognitively unable, deceased, etc.) | Admin or Coordinator |

### 7.2 Eligibility Determination Workflow

When a patient record is created (via bulk upload or individual entry), the eligibility_status defaults to "Pending Review." The Admin or Coordinator then reviews and sets the status:

**Marking as Eligible:**
- If last_awv_date is null → Eligible (no prior AWV on record; eligible for Initial AWV)
- If last_awv_date is populated and next_eligible_date ≤ today → Eligible (12-month window has passed)
- If last_awv_date is populated and next_eligible_date > today → the system displays a warning ("Patient's next eligible date is [date]") but allows the Admin/Coordinator to override and mark Eligible if they have information the system lacks

**Marking as Not Eligible:**
- Requires an eligibility_reason from a predefined list with an optional free-text override:
  - "AWV completed < 12 months ago"
  - "Not enrolled in Medicare"
  - "Medicare Part B enrollment < 12 months (IPPE only)"
  - "Hospice enrolled"
  - "Patient deceased"
  - "No longer a practice patient"
  - "Other" (free text required)

### 7.3 Rolling Eligibility Recalculation

The system supports two approaches to eligibility date management, accommodating both current manual workflows and future automation:

**Manual entry (current):** Admin or Coordinator enters the Last AWV Date when known. The system calculates next_eligible_date = last_awv_date + 12 months and displays it on the patient record.

**Future auto-detection (v2):** When integrated with the Practice Health Module, the system scans incoming 371.02 charges data for CPT codes G0402, G0438, and G0439. When a matching charge is found for a tracked patient (matched on ecw_patient_id), the system:
1. Updates the active awv_tracking record's completion_status to "Completed"
2. Sets completion_date to the service date from the charge
3. Derives awv_type from the CPT code
4. Creates a new awv_tracking record for the next cycle with last_awv_date = completion_date and next_eligible_date = completion_date + 12 months
5. Sets date_source = "PHM Auto" to distinguish from manually entered dates

Until auto-detection is implemented, all date entries are tagged with date_source = "Manual" or "Upload."

### 7.4 Eligibility Alerts

The dashboard highlights time-sensitive eligibility events:

| Alert | Trigger | Display |
|-------|---------|---------|
| Newly Eligible | next_eligible_date falls within the current month | "Becoming Eligible" badge on patient card; count in summary header |
| Overdue | Eligible + Not Started for 90+ days past next_eligible_date | "Overdue" badge in amber; sorted to top of worklist |
| Approaching Eligibility | next_eligible_date is within 30 days | "Eligible Soon" badge; enables proactive scheduling |

---

## 8. Completion Tracking & Workflow

### 8.1 Completion Flow

The standard completion workflow progresses through these states:

```
Not Started → Scheduled → Completed
                        → Refused
                        → Unable to Complete
```

Each transition is logged with the user who made the change and a timestamp (via the `updated_by` and `updated_at` fields on awv_tracking).

### 8.2 Marking as Scheduled

When an AWV is scheduled:

- Set completion_status = "Scheduled"
- Enter scheduled_date (required)
- Optionally set awv_type if known (IPPE, Initial AWV, Subsequent AWV)
- Optionally add a note (e.g., "Combine with routine home visit at Huntington")

### 8.3 Marking as Completed

When an AWV is performed:

- Set completion_status = "Completed"
- Enter completion_date (required; defaults to today)
- Select awv_type (required): IPPE (G0402), Initial AWV (G0438), Subsequent AWV (G0439)
- cpt_code auto-populates from awv_type selection
- billed_amount defaults to expected reimbursement from awv_reimbursement_rates; editable if actual billed amount differs
- Optionally add AWV add-on services (ACP, depression screening, alcohol screening) via the awv_addons table
- Optionally add a note

**On completion, the system automatically:**
1. Records the completion on the current tracking record
2. Creates a new awv_tracking record for the next cycle:
   - patient_id = same patient
   - last_awv_date = the just-completed AWV's completion_date
   - next_eligible_date = completion_date + 12 months
   - eligibility_status = "Not Eligible" (with reason "AWV completed < 12 months ago")
   - completion_status = "Not Started"
   - date_source = "Manual"
3. The new record's eligibility_status will be manually or automatically updated to "Eligible" when the 12-month window passes

This auto-cycling mechanism ensures continuous tracking without manual record creation each year.

### 8.4 Marking as Refused

When a patient declines their AWV:

- Set completion_status = "Refused"
- A note is strongly encouraged documenting the refusal context
- The patient remains in the registry and retains their eligibility status
- Refused patients appear in a "Refused" filter view and are excluded from the "outstanding" worklist
- The tracking record remains open — if the patient changes their mind within the eligibility window, the status can be reverted to "Not Started" or "Scheduled"

### 8.5 Marking as Unable to Complete

When an AWV cannot be performed due to circumstances beyond the patient's decision:

- Set completion_status = "Unable to Complete"
- A note is required documenting the reason (hospitalization, cognitive decline, deceased, etc.)
- If the reason is "Patient deceased" or "No longer a practice patient," the Admin should also deactivate the patient record (is_active = false)

### 8.6 Add-On Service Tracking

AWVs frequently include add-on billable services. The awv_addons table allows tracking these alongside the AWV completion:

| Add-On | CPT Code | Typical Scenario |
|--------|----------|-----------------|
| Advance Care Planning (initial 30 min) | 99497 | Goals-of-care conversation, advance directive review |
| Advance Care Planning (additional 30 min) | 99498 | Extended goals-of-care discussion |
| Depression Screening | G0444 | PHQ-2/PHQ-9 administration |
| Alcohol Misuse Screening | G0442 | AUDIT-C or equivalent screening tool |
| Tobacco Cessation Counseling | 99406 | Brief (3–10 min) smoking cessation counseling |

Add-ons are optional and entered at the time of AWV completion. Each add-on's billed amount contributes to the revenue dashboard's "total AWV revenue" calculation, providing a more accurate picture of the full revenue generated per AWV encounter.

---

## 9. Revenue Dashboard

### 9.1 Overview

The revenue dashboard quantifies the financial impact of AWV capture across the practice. It answers three questions: How much AWV revenue have we captured? How much is still available? What is the revenue impact of improving our completion rate?

### 9.2 Revenue Metrics

| Metric | Formula | Display |
|--------|---------|---------|
| Revenue Captured (YTD) | SUM(billed_amount) for all Completed awv_tracking records with completion_date in current year + SUM(billed_amount) for associated awv_addons | Dollar amount with trend vs. prior year same period |
| Revenue Remaining | COUNT(Eligible + Not Started or Scheduled) × avg expected reimbursement from awv_reimbursement_rates | Dollar amount representing unrealized AWV revenue |
| Total AWV Opportunity | Revenue Captured + Revenue Remaining | Total addressable AWV revenue for current eligible population |
| Capture Rate | Revenue Captured / Total AWV Opportunity × 100 | Percentage with progress bar visualization |
| Average Revenue per AWV | (SUM of billed_amount for completed AWVs + associated add-ons) / COUNT of completed AWVs | Dollar amount; indicates add-on service penetration |
| Revenue per Provider | Revenue Captured grouped by assigned_provider_id | Provider-level revenue contribution breakdown |

### 9.3 Revenue Projections

The dashboard includes a simple projection: "If current completion rate continues, projected year-end AWV revenue is $[X]. Reaching [target]% completion would generate an additional $[Y]."

The target completion rate is configurable by Admin (default: 80%). This creates a concrete dollar-value incentive for improving AWV outreach.

### 9.4 Revenue Visibility

Revenue metrics are visible to Admin and Medical Director roles only, consistent with the Practice Health Module's role-based data visibility principles. Coordinators see completion counts and rates but not dollar amounts.

---

## 10. Provider-Level Tracking

### 10.1 Provider Attribution

Each patient record has an assigned_provider_id linking to the Practice Health Module's providers table. This enables provider-level roll-ups of all AWV metrics: patients assigned, eligibility assessed, AWVs completed, completion rate, and revenue generated.

### 10.2 Provider Comparison View

The dashboard includes a provider comparison table:

| Column | Description |
|--------|-------------|
| Provider Name | From providers table |
| Assigned Patients | COUNT of active awv_patients assigned to this provider |
| Eligible Patients | COUNT where eligibility_status = Eligible |
| Completed (YTD) | COUNT where completion_status = Completed and completion_date in current year |
| Completion Rate | Completed / Eligible × 100 |
| Revenue Captured | SUM of billed_amount for completed AWVs |
| Outstanding | COUNT of Eligible + (Not Started or Scheduled) — the actionable worklist size |

### 10.3 Part-Time Schedule Awareness

Consistent with Practice Health Module conventions, provider metrics are contextualized by schedule. NP1 (3 days/week, office only) and NP2 (3 days/week, split office + Mobile Docs) are compared on rate-based metrics (completion percentage) rather than raw volume, since their available patient-facing days differ.

### 10.4 Provider Worklist

Filtering the patient table by a specific provider creates an effective worklist: "Show me all patients assigned to NP2 where eligibility = Eligible and completion = Not Started, sorted by next_eligible_date ascending." This view surfaces the most actionable patients for each provider's upcoming schedule.

---

## 11. Role-Based Access Control

### 11.1 Role Permissions — AWV Tracker

| Capability | Admin | Medical Director | Coordinator | Provider (Future) |
|-----------|-------|-----------------|-------------|-------------------|
| View AWV dashboard | Full | Full | Counts and rates only (no revenue) | Own patients only |
| View patient registry | Full | Full | Full (no revenue fields) | Own patients only |
| Add patients (individual) | Yes | No | Yes | No |
| Bulk upload patients | Yes | No | Yes | No |
| Edit patient fields | Yes | No | Yes | No |
| Update eligibility status | Yes | No | Yes | No |
| Update completion status | Yes | No | Yes | No |
| View revenue metrics | Yes | Yes | No | No |
| Configure reimbursement rates | Yes | No | No | No |
| Deactivate patients | Yes | No | No | No |
| View upload history | Yes | No | Yes (own uploads) | No |

### 11.2 Access Control Implementation

Consistent with Practice Health Module and Facility Directory:

- **Application layer**: UI components conditionally render based on user role. Revenue columns, dollar amounts, and configuration panels are hidden for Coordinator and Provider roles.
- **Database layer**: Supabase Row-Level Security policies on all AWV tables. Coordinator role has INSERT/UPDATE on awv_tracking (eligibility and completion fields only) and INSERT on awv_uploads. No SELECT on revenue-related computed views. Provider role (future) filtered by assigned_provider_id matching auth.uid().

---

## 12. Dashboard Specifications

### 12.1 Navigation

The AWV Tracker is a top-level navigation item in the HCI Portal sidebar, listed as "Annual Wellness Visits" with a clipboard/checkmark icon. It sits below "Mobile Docs" (Facility Directory) in the nav hierarchy.

### 12.2 Summary Header

The top of the dashboard displays a row of aggregate metric cards:

| Card | Value | Subtext |
|------|-------|---------|
| Eligible Patients | COUNT of eligibility_status = Eligible across active patients | "{n} pending review" |
| Completed (YTD) | COUNT of completion_status = Completed with completion_date in current year | "of {total eligible} eligible" |
| Completion Rate | Completed / Eligible × 100 | Progress bar visualization with color coding (green ≥ 70%, amber 40–69%, red < 40%) |
| Revenue Captured (Admin/MD only) | SUM of billed_amount for completed AWVs + add-ons YTD | "~${remaining} remaining" |

### 12.3 Filter Bar

Below the summary header, a horizontal filter bar:

- **Search box**: Free-text search across patient last name and eCW ID
- **Eligibility filter chips**: All | Pending Review | Eligible | Not Eligible (single-select, defaults to Eligible)
- **Completion filter chips**: All | Not Started | Scheduled | Completed | Refused | Unable (single-select, defaults to All)
- **Service line filter**: All | HCI Office | Mobile Docs
- **Provider filter**: All | [Provider dropdown]
- **Eligibility timing**: All | Newly Eligible (this month) | Eligible Soon (next 30 days) | Overdue (90+ days)

Active filters are combinable. The most common operational view is: Eligible + Not Started + specific provider = that provider's AWV worklist.

### 12.4 Patient Table

The primary view is a sortable, filterable table of patient records:

| Column | Description | Sortable |
|--------|-------------|----------|
| Patient | Last Name — eCW ID | Yes (alpha) |
| Provider | Assigned provider name | Yes |
| Service Line | HCI Office or Mobile Docs | Yes |
| Facility | Facility name (Mobile Docs only) | Yes |
| Eligibility | Status badge: Pending Review (gray), Eligible (green), Not Eligible (red) | Yes |
| Completion | Status badge: Not Started (gray), Scheduled (blue), Completed (green), Refused (amber), Unable (red) | Yes |
| Last AWV | Date of most recent prior AWV | Yes (date) |
| Next Eligible | Calculated next eligible date | Yes (date) |
| Scheduled Date | If status = Scheduled | Yes (date) |
| Completed Date | If status = Completed | Yes (date) |
| Actions | Quick-action buttons: Update Status, View Detail | — |

Default sort: Eligible patients first, sorted by next_eligible_date ascending (patients eligible longest appear first — these are the highest priority for outreach).

### 12.5 Patient Detail Panel

Clicking a patient row opens a slide-out detail panel (520px width, consistent with Facility Directory convention):

1. **Header**: Last Name, eCW ID, service line badge, provider name, Medicare status badge
2. **Eligibility Section**: Current eligibility status with reason (if Not Eligible), last AWV date, next eligible date, date source indicator (Manual / Upload / PHM Auto)
3. **Completion Section**: Current completion status with action buttons to advance the workflow (Schedule → Complete → etc.), AWV type selector, billed amount, scheduled date, completion date
4. **Add-Ons Section**: List of add-on services billed alongside the AWV (if completed); "Add Service" button
5. **Revenue Section** (Admin/MD only): Billed amount for this AWV, total AWV revenue for this patient (historical), average revenue per AWV for this patient
6. **History Section**: Chronological list of prior AWV tracking cycles for this patient — showing each cycle's completion date, AWV type, billed amount, and any add-ons. This provides at-a-glance longitudinal tracking.
7. **Notes**: Free-text notes for the current tracking cycle

### 12.6 Bulk Upload Interface

Accessible via an "Upload Patients" button on the dashboard header:

- Drag-and-drop file upload zone
- Upload processing progress indicator
- Results summary showing new, updated, flagged, and error counts
- Expandable detail for warnings and errors with remediation guidance
- Upload history table showing past uploads with date, row count, results, and status

---

## 13. Integration with Practice Health Module

### 13.1 Current Integration (v1)

In v1, integration between the AWV Tracker and Practice Health Module is limited to shared reference data:

| Integration Point | Direction | Description |
|-------------------|-----------|-------------|
| Provider roster | PHM → AWV | Provider dropdown in AWV Tracker populated from PHM providers table |
| Facility directory | Directory → AWV | Facility dropdown for Mobile Docs patients populated from facilities_directory |

AWV completion and eligibility data are managed independently in the AWV Tracker. There is no automated data flow from PHM billing data to AWV tracking records in v1.

### 13.2 Future Integration (v2)

In a future release, the AWV Tracker will consume Practice Health Module billing data to auto-detect AWV completions:

**Auto-Detection Pipeline:**
1. When PHM ingests a 371.02 charges upload containing CPT codes G0402, G0438, or G0439, trigger a cross-reference against awv_patients
2. Match on a composite key: Rendering Provider + Service Date + Facility should correspond to a patient tracked in the AWV module. Since the PHM charges data excludes patient identifiers (by design), the match would need to occur through one of the following approaches:
   - **Option A**: Modify the PHM 371.02 custom report to include the eCW Patient Account Number (a non-PHI identifier) as an additional field, enabling direct matching
   - **Option B**: Use a combination of Rendering Provider + Service Date + Facility + CPT code to identify likely AWV encounters, then present them to the Admin/Coordinator for manual confirmation against AWV Tracker records
3. On confirmed match, update the awv_tracking record: set completion_status = Completed, completion_date = service date, awv_type from CPT code, billed_amount from charges data, date_source = "PHM Auto"
4. Auto-create the next tracking cycle as described in Section 8.3

Option A is cleaner and more reliable. It requires adding one non-PHI field to the PHM charges export but avoids the ambiguity of probabilistic matching. This is the recommended approach for v2.

### 13.3 Dashboard Cross-Links

The Practice Health Module's financial dashboard can include an "AWV Revenue" card sourced from the AWV Tracker, showing AWV-specific revenue alongside overall practice financial metrics. Conversely, the AWV Tracker's revenue dashboard links to the Practice Health Module for broader financial context.

---

## 14. Future Extensibility

### 14.1 Generalized Revenue Program Framework

The AWV Tracker's data model is designed as the first instance of a reusable pattern for revenue program tracking. Future modules would follow the same structure:

| Future Module | Program | Patient Registry | Eligibility Logic | Tracking Cycle |
|--------------|---------|-----------------|-------------------|----------------|
| CCM Tracker | Chronic Care Management | Same awv_patients table (renamed to program_patients or shared patient registry) | 2+ chronic conditions, patient consent obtained | Monthly (20+ min/month clinical staff time) |
| RPM Tracker | Remote Patient Monitoring | Shared patient registry | Device-eligible condition, patient consent, device provisioned | Monthly (16+ days of readings per 30-day period) |
| TCM Tracker | Transitional Care Management | Shared patient registry | Hospital discharge within 30 days, follow-up visit completed | Per-discharge (one-time per transition) |

When the second revenue program module is built, the recommended approach is:
1. Rename awv_patients to a shared `program_patients` table (or create a shared patient registry that all program modules reference)
2. Keep program-specific tracking tables separate (awv_tracking, ccm_tracking, rpm_tracking) since eligibility rules and workflow states differ per program
3. Unify the revenue dashboard to show all revenue programs side-by-side with program-specific drill-down

### 14.2 Patient Outreach Integration

The AWV Tracker's worklist (Eligible + Not Started patients) is a natural input for outreach campaigns. A future integration with the Patient Outreach Portal could auto-generate call lists from the AWV worklist, with call dispositions flowing back to update AWV tracking records (e.g., "Scheduled" after successful outreach call, "Refused" after patient decline).

### 14.3 Automated Eligibility Refresh

A future enhancement could automatically recalculate eligibility status across all patients nightly or weekly:
- Patients whose next_eligible_date has passed → auto-update from "Not Eligible" (reason: < 12 months) to "Eligible"
- Patients with no activity for 24+ months → flag for review (possible disenrollment)
- New Medicare enrollees detected in PHM charges data → suggest for AWV Tracker addition

### 14.4 AWV Scheduling Integration

If HCI adopts an external scheduling system or builds scheduling into the Portal, the AWV Tracker's "Scheduled" status could link directly to a calendar appointment, with automated status updates when the appointment is completed or cancelled.

### 14.5 Quality Reporting

AWV completion rates are a component of several Medicare quality programs (MIPS, ACO quality measures). A future module could aggregate AWV data alongside other quality metrics for annual reporting, using the AWV Tracker as a validated data source rather than manual chart review.

### 14.6 SaaS Generalization

In the SaaS phase, the AWV Tracker generalizes to any Medicare or value-based care practice that needs to track annual or periodic patient services. The tenant_id field on all tables supports multi-practice isolation. The reimbursement rate reference table accommodates practice-specific fee schedules. The minimal identifier approach (last name + EMR ID) works across any EMR system — only the upload column mapping needs to change per EMR, following the same adapter pattern established in the Practice Health Module PRD.

---

## 15. Technical Requirements

### 15.1 Technology Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | React | Consistent with HCI Portal, Practice Health, and Facility Directory |
| Backend / Database | Supabase (PostgreSQL) | Shared instance; new tables in same schema; RLS for access control |
| File Parsing | Papa Parse (CSV), SheetJS (Excel) | Client-side parsing for immediate validation feedback on upload |
| Hosting | Netlify (frontend) + Supabase (backend) | Consistent with existing infrastructure |
| IDE | Cursor AI | Development environment with PRD integration |

### 15.2 HIPAA Compliance

The AWV Tracker stores minimal patient identifiers (last name and eCW patient ID) rather than full PHI. Compliance safeguards:

- No patient first names, DOBs, addresses, phone numbers, SSNs, Medicare Beneficiary Identifiers, or clinical data stored
- Bulk upload pipeline rejects files containing PHI column headers
- eCW patient account number is an internal system identifier, not a Medicare or insurance identifier
- Last name alone, without associated clinical or demographic data, represents a significantly reduced identification risk
- All data transmission uses HTTPS/TLS encryption
- Supabase Row-Level Security enforces role-based data isolation
- Audit trail via awv_uploads table tracks all data imports with user attribution

**Note on compliance posture:** While the minimal identifier approach reduces PHI exposure, the combination of last name + patient account number + provider + facility could be considered indirectly identifiable depending on interpretation. HCI should confirm this approach with their compliance advisor. If a stricter posture is needed, the system can be reconfigured to use eCW patient ID only (dropping last name), with last name lookups performed in eCW when needed.

### 15.3 Performance Requirements

- Dashboard load time: < 2 seconds for up to 2,000 patient records
- Bulk upload processing: < 10 seconds for files up to 5,000 rows
- Patient table filtering/sorting: < 200ms (client-side for datasets under 2,000 patients)
- Detail panel open: < 500ms
- Eligibility recalculation (batch): < 30 seconds for full patient panel

### 15.4 Data Retention

- Patient records: retained indefinitely (soft-deactivation via is_active flag)
- Tracking records: retained indefinitely for longitudinal analysis and revenue reporting
- Upload audit logs: retained indefinitely
- Reimbursement rate history: retained indefinitely (historical rates preserved via effective_date; is_current flag marks active rates)

---

## 16. Success Metrics

### 16.1 Launch Criteria

- All active Medicare patients from eCW roster successfully imported via bulk upload
- Assigned providers mapped correctly for all imported patients
- Mobile Docs patients linked to correct facilities in directory
- At least 80% of imported patients have eligibility status updated from "Pending Review" within first 2 weeks
- Revenue dashboard calculating correctly against known AWV reimbursement rates
- Coordinator able to complete full workflow (upload → eligibility → schedule → complete) without assistance

### 16.2 Ongoing Operational Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| AWV Completion Rate | ≥ 70% of eligible patients per rolling 12 months | Primary outcome metric; measures program effectiveness |
| Pending Review Clearance | < 10% of active patients in Pending Review at any time | Measures workflow discipline; patients should be assessed promptly |
| Upload Cadence | Monthly | Measures registry freshness; monthly refreshes catch new enrollees |
| Revenue Capture vs. Opportunity | ≥ 70% of total AWV opportunity captured | Financial impact metric; tracks dollars captured vs. available |
| Add-On Penetration Rate | ≥ 40% of completed AWVs include at least one add-on service | Measures revenue maximization per AWV encounter |
| Time from Eligible to Completed | < 90 days average | Measures operational velocity; eligible patients should be seen promptly |

---

*HCI Medical Group — Annual Wellness Visit Tracker PRD v1.0 — March 2026*
