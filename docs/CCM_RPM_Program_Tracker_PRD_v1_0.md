# CCM / RPM Program Tracker
## Chronic Care Management & Remote Patient Monitoring Enrollment & Revenue Tracking
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
7. [Enrollment Management](#7-enrollment-management)
8. [RPM Device Tracking](#8-rpm-device-tracking)
9. [Monthly Reimbursement Logging](#9-monthly-reimbursement-logging)
10. [Revenue Dashboard](#10-revenue-dashboard)
11. [Provider-Level Tracking](#11-provider-level-tracking)
12. [Role-Based Access Control](#12-role-based-access-control)
13. [Dashboard Specifications](#13-dashboard-specifications)
14. [Integration with Practice Health Module & AWV Tracker](#14-integration-with-practice-health-module--awv-tracker)
15. [Future Extensibility](#15-future-extensibility)
16. [Technical Requirements](#16-technical-requirements)
17. [Success Metrics](#17-success-metrics)

---

## 1. Executive Summary

The CCM / RPM Program Tracker is a combined module within the HCI Portal that manages patient enrollment, device assignment, and revenue tracking for two closely related Medicare programs: Chronic Care Management (CCM) and Remote Patient Monitoring (RPM). Together, these programs represent the largest source of recurring monthly revenue in the Mobile Docs financial model — $6,045/month per provider in CCM and $5,355/month in RPM at target penetration — yet they require disciplined enrollment tracking and reimbursement verification to ensure the practice is actually capturing the revenue it bills.

The module provides a snapshot-style view of program enrollment across both HCI Office and Mobile Docs service lines: which patients are eligible, which are enrolled, which declined, what RPM devices are deployed, and — critically — what the practice is actually collecting per patient per month from EOB data. It is not a clinical documentation tool (time tracking, care plan management, and device readings are handled in eCW); it is a revenue assurance and enrollment management tool that answers "how effective is our CCM/RPM program, and are we getting paid?"

The module shares the same patient identification approach as the AWV Tracker (last name + eCW patient ID, no additional PHI) and uses the same bulk upload pipeline pattern, enabling future consolidation into a unified patient registry across all revenue program modules.

---

## 2. Product Overview

### 2.1 Problem Statement

CCM and RPM generate predictable monthly revenue per enrolled patient, but tracking enrollment status, device deployment, and actual reimbursement across a panel of 200+ eligible patients is operationally complex:

- No centralized view of which patients are enrolled in CCM, RPM, both, or neither
- No tracking of which patients were offered the program and declined vs. never approached
- No visibility into RPM device assignments — which patients have devices, which devices, and whether devices are active
- No structured way to log actual reimbursement from EOBs and compare against expected revenue
- Revenue leakage is invisible: a patient may be enrolled and billed but the claim denied, underpaid, or never submitted — without EOB tracking, the gap goes undetected
- No provider-level accountability for enrollment rates or revenue contribution
- Difficult to assess program effectiveness: enrollment rate, retention rate, average revenue per enrolled patient, and revenue trend over time

### 2.2 Solution

The CCM / RPM Program Tracker provides a patient enrollment registry with a simple status workflow, RPM device assignment tracking, per-patient-per-month reimbursement logging from EOBs, and a revenue dashboard that compares actual collections against expected revenue for enrolled patients. The module prioritizes simplicity and snapshot clarity over clinical depth — it is the program management layer, not the clinical delivery layer.

### 2.3 Medicare CCM / RPM Background

#### 2.3.1 Chronic Care Management (CCM)

CCM is a Medicare benefit for patients with two or more chronic conditions expected to last at least 12 months. The program pays for non-face-to-face care coordination — medication management, care plan updates, communication with specialists, and patient/caregiver check-ins — delivered by clinical staff under physician supervision.

| CPT Code | Description | Minimum Requirement | Medicare Reimbursement (Approx.) |
|----------|-------------|---------------------|----------------------------------|
| 99490 | CCM, initial 20 minutes per calendar month | 20 minutes of clinical staff time | ~$64 |
| 99439 | CCM, each additional 20 minutes | 20 additional minutes (beyond initial 20) | ~$47 |
| 99491 | Complex CCM, 60 minutes per calendar month | 60 minutes; requires substantial revision of care plan | ~$87 |

Key rules:
- Patient must have 2+ chronic conditions expected to last 12+ months
- Patient (or caregiver) must provide verbal or written consent before enrollment
- Only one provider can bill CCM per patient per calendar month
- Clinical staff time is cumulative across the month (not a single session)
- CCM is billed monthly — revenue recurs as long as the patient remains enrolled and time thresholds are met

#### 2.3.2 Remote Patient Monitoring (RPM)

RPM is a Medicare benefit for patients with acute or chronic conditions who benefit from remote physiologic monitoring. It pays for device provisioning, data transmission, and clinical monitoring of patient-reported or device-transmitted data.

| CPT Code | Description | Requirement | Medicare Reimbursement (Approx.) |
|----------|-------------|-------------|----------------------------------|
| 99453 | RPM device setup and patient education | One-time per device/episode | ~$19 |
| 99454 | Device supply and daily data transmission | 16+ days of readings per 30-day period | ~$55/month |
| 99457 | RPM treatment management, initial 20 minutes | 20 minutes of interactive communication | ~$51/month |
| 99458 | RPM treatment management, each additional 20 minutes | 20 additional minutes | ~$42/month |

Key rules:
- Patient must have a qualifying condition appropriate for remote monitoring
- Device must transmit data automatically or patient must manually record and transmit readings
- 16 or more days of data collection are required per 30-day billing period for 99454
- RPM can be billed alongside CCM for the same patient (the programs stack)
- RPM device setup (99453) is a one-time charge; ongoing codes (99454, 99457, 99458) are monthly

#### 2.3.3 Revenue Stacking

A patient enrolled in both CCM and RPM can generate significant monthly recurring revenue:

| Service | Monthly Revenue (Conservative) | Monthly Revenue (Full Capture) |
|---------|-------------------------------|-------------------------------|
| CCM (99490 only) | ~$64 | — |
| CCM (99490 + 99439) | — | ~$111 |
| RPM (99454 + 99457) | ~$106 | — |
| RPM (99454 + 99457 + 99458) | — | ~$148 |
| **Combined CCM + RPM** | **~$170** | **~$259** |

At target enrollment from the Mobile Docs financial model (65% CCM, 35% RPM), these programs contribute $11,400/month per provider in recurring revenue that requires no additional patient visits.

### 2.4 Service Line Applicability

| Service Line | CCM/RPM Context |
|-------------|-----------------|
| HCI Office | Office-based Medicare patients with qualifying chronic conditions. CCM care coordination performed by clinical staff between visits. RPM devices distributed at office visits. |
| Mobile Docs | SNF, board-and-care, and homebound Medicare patients. Higher chronic condition burden drives higher eligibility rates. CCM coordination often handled during or between house calls. RPM devices deployed during home visits — particularly valuable for homebound patients who benefit most from remote monitoring. |

Mobile Docs patients typically have higher CCM/RPM eligibility rates due to the population's acuity, making program penetration at Mobile Docs facilities especially impactful for revenue.

### 2.5 Users

| User | Primary Use Cases |
|------|-------------------|
| Ryan (Admin) | Revenue dashboard review, enrollment rate monitoring, EOB reimbursement oversight, provider performance, program strategy |
| Coordinator | Bulk patient upload, individual patient entry, enrollment status updates, device assignment tracking, monthly reimbursement logging |
| Medical Director | Review enrollment rates, provider-level program participation, clinical appropriateness oversight |
| Provider (Future) | View own enrolled patients, device status for assigned patients |

---

## 3. Data Architecture

### 3.1 Database Schema

The CCM / RPM Tracker introduces new tables to the existing Supabase (PostgreSQL) database shared with the Practice Health Module, Facility Directory, and AWV Tracker. All tables follow established conventions: `tenant_id` field for future SaaS isolation, Row-Level Security for role-based access, ISO 8601 date formatting, and UUID primary keys.

#### 3.1.1 Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| ccm_patients | Patient registry with minimal identifiers; mirrors awv_patients structure for future registry unification | id, tenant_id, ecw_patient_id, last_name, assigned_provider_id, service_line, facility_id, payer_name, medicare_status, is_active, created_at, updated_at |
| ccm_enrollment | Enrollment status and program participation per patient | id, patient_id, enrollment_status, program_type, enrollment_date, disenrollment_date, disenrollment_reason, consent_obtained, consent_date, notes, updated_by, created_at, updated_at |
| ccm_devices | RPM device assignments per patient; supports multiple devices | id, enrollment_id, device_type, device_status, assigned_date, removed_date, notes, created_at, updated_at |
| ccm_reimbursements | Per-patient per-month actual reimbursement from EOBs | id, enrollment_id, service_month, cpt_code, billed_amount, paid_amount, adjustment_amount, denial_reason, date_entered, entered_by, notes, created_at |
| ccm_uploads | Upload audit log for bulk imports | id, tenant_id, uploaded_by, upload_date, file_name, row_count, new_patients, updated_patients, flagged_patients, status, validation_errors, created_at |
| ccm_reimbursement_rates | Reference table for expected CCM/RPM reimbursement by CPT code | id, cpt_code, description, program_type, expected_reimbursement, effective_date, is_current |

#### 3.1.2 Field Specifications — ccm_patients

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| tenant_id | UUID | Yes | Current tenant | Multi-tenant isolation (dormant until SaaS phase) |
| ecw_patient_id | String (50) | Yes | — | eClinicalWorks patient account number; unique constraint per tenant; same identifier used in AWV Tracker for cross-module linking |
| last_name | String (100) | Yes | — | Patient last name only — no first names, DOBs, addresses, or full insurance numbers |
| assigned_provider_id | UUID | No | null | FK to providers table; the provider responsible for this patient's CCM/RPM program |
| service_line | Enum | Yes | — | HCI Office, Mobile Docs |
| facility_id | UUID | No | null | FK to facilities_directory; applicable for Mobile Docs patients; null for HCI Office patients |
| payer_name | String (255) | No | null | Primary payer from eCW (e.g., "Medicare Part B", "UHC Medicare Advantage"); informational |
| medicare_status | Enum | Yes | Active | Active, Inactive, Unknown |
| is_active | Boolean | No | true | Soft deactivation flag; false for deceased, disenrolled from Medicare, or transferred patients |
| created_at | Timestamp | Auto | now() | |
| updated_at | Timestamp | Auto | now() | |

#### 3.1.3 Field Specifications — ccm_enrollment

Each patient has one active enrollment record at a time. When a patient is disenrolled and later re-enrolled, the old record is closed (disenrollment_date set) and a new record is created, preserving the enrollment history.

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| patient_id | UUID | Yes | — | FK to ccm_patients |
| enrollment_status | Enum | Yes | Eligible | Eligible, Enrolled, Declined, Disenrolled, Inactive |
| program_type | Enum | No | null | CCM Only, RPM Only, CCM + RPM; set when enrollment_status = Enrolled; null when Eligible or Declined |
| enrollment_date | Date | No | null | Date patient was enrolled; required when enrollment_status = Enrolled |
| disenrollment_date | Date | No | null | Date patient was removed from program; set when enrollment_status = Disenrolled |
| disenrollment_reason | String (255) | No | null | Required when enrollment_status = Disenrolled. Examples: "Patient withdrew consent", "No longer meets criteria", "Transferred to another provider", "Deceased", "Medicare eligibility lost" |
| consent_obtained | Boolean | No | false | Whether verbal or written consent has been obtained (required for CCM billing) |
| consent_date | Date | No | null | Date consent was documented |
| notes | Text | No | null | Free-text notes about this enrollment (e.g., "Patient's daughter manages devices", "Consent obtained by NP2 during home visit 3/15") |
| updated_by | UUID | Yes | — | FK to auth.users; last person to modify this record |
| created_at | Timestamp | Auto | now() | |
| updated_at | Timestamp | Auto | now() | |

#### 3.1.4 Field Specifications — ccm_devices

Each enrolled RPM patient can have multiple devices assigned. Device records track what was deployed, when, and whether it's still active.

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| enrollment_id | UUID | Yes | — | FK to ccm_enrollment |
| device_type | Enum | Yes | — | Blood Pressure Monitor, Pulse Oximeter, Glucose Monitor, Weight Scale, Thermometer, Other |
| device_status | Enum | Yes | Active | Active, Returned, Lost, Malfunctioning |
| assigned_date | Date | Yes | — | Date device was provided to patient |
| removed_date | Date | No | null | Date device was returned or deactivated; set when device_status changes from Active |
| notes | Text | No | null | Free-text (e.g., "Omron BP 7250, serial #4821", "Patient needs large cuff") |
| created_at | Timestamp | Auto | now() | |
| updated_at | Timestamp | Auto | now() | |

#### 3.1.5 Field Specifications — ccm_reimbursements

This is the EOB-driven revenue table. Each row represents one CPT code billed for one patient for one service month. A patient enrolled in both CCM and RPM may have multiple rows per month (one for 99490, one for 99454, one for 99457, etc.).

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| enrollment_id | UUID | Yes | — | FK to ccm_enrollment |
| service_month | Date | Yes | — | First day of the service month (e.g., 2026-03-01 for March 2026); used as the period key |
| cpt_code | String (10) | Yes | — | CCM: 99490, 99439, 99491. RPM: 99453, 99454, 99457, 99458 |
| billed_amount | Decimal (10,2) | No | null | Amount submitted on the claim; optional if only tracking paid amounts |
| paid_amount | Decimal (10,2) | Yes | — | Actual payment received per EOB |
| adjustment_amount | Decimal (10,2) | No | null | Contractual adjustment or writeoff; informational |
| denial_reason | String (255) | No | null | If claim was denied or underpaid, capture the reason (e.g., "Time threshold not met", "Duplicate billing", "Patient not eligible") |
| date_entered | Timestamp | Auto | now() | When this reimbursement record was logged |
| entered_by | UUID | Yes | — | FK to auth.users |
| notes | Text | No | null | Free-text (e.g., "Partial payment — appealing", "Reprocessed after initial denial") |
| created_at | Timestamp | Auto | now() | |

#### 3.1.6 Field Specifications — ccm_uploads

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| tenant_id | UUID | Yes | Current tenant | Multi-tenant isolation |
| uploaded_by | UUID | Yes | — | FK to auth.users |
| upload_date | Timestamp | Auto | now() | |
| file_name | String (255) | Yes | — | Original file name |
| row_count | Integer | No | null | Total rows in uploaded file |
| new_patients | Integer | No | 0 | New patient records created |
| updated_patients | Integer | No | 0 | Existing patient records updated |
| flagged_patients | Integer | No | 0 | Patients in system but missing from upload |
| status | Enum | Yes | Processing | Processing, Completed, Completed with Warnings, Failed |
| validation_errors | JSONB | No | null | Array of error objects: { row, field, message } |
| created_at | Timestamp | Auto | now() | |

#### 3.1.7 Field Specifications — ccm_reimbursement_rates

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| cpt_code | String (10) | Yes | — | 99490, 99439, 99491, 99453, 99454, 99457, 99458 |
| description | String (255) | Yes | — | Human-readable description |
| program_type | Enum | Yes | — | CCM, RPM — categorizes the code for dashboard grouping |
| expected_reimbursement | Decimal (10,2) | Yes | — | Expected Medicare reimbursement |
| effective_date | Date | Yes | — | Date this rate became effective |
| is_current | Boolean | Yes | true | Only one rate per CPT code should be current |

#### 3.1.8 Relationship to Existing Tables

| CCM Table | Existing Table | Join Logic | Purpose |
|-----------|---------------|------------|---------|
| ccm_patients | providers (PHM) | ccm_patients.assigned_provider_id ↔ providers.id | Provider assignment and roster awareness |
| ccm_patients | facilities_directory | ccm_patients.facility_id ↔ facilities_directory.id | Facility attribution for Mobile Docs patients |
| ccm_patients | awv_patients | ccm_patients.ecw_patient_id ↔ awv_patients.ecw_patient_id | Cross-module patient linking; same patient tracked across AWV and CCM/RPM |
| ccm_enrollment | charges (PHM) | Via patient matching on ecw_patient_id + CCM/RPM CPT codes | Future auto-detection of billed CCM/RPM services |

---

## 4. Patient Registry & Identification

### 4.1 Identification Approach

The CCM / RPM Tracker uses the same minimal identifier approach as the AWV Tracker:

**Stored:** eCW patient account number (primary matching key), patient last name (display identifier)

**Not stored:** First name, date of birth, address, phone number, email, Social Security number, Medicare Beneficiary Identifier, medical record number, diagnosis codes, medication lists

Using the same eCW patient ID across both modules enables cross-referencing: a patient's CCM enrollment status and AWV completion status are visible in a unified context without duplicating patient records. When a shared patient registry is built in a future phase, both modules will reference a single patient table.

### 4.2 Patient Display Format

Consistent with AWV Tracker conventions:

```
[Last Name] — [eCW ID] — [Provider] — [Service Line]
```

Example: **Williams — ECW#91034 — NP2 — Mobile Docs**

### 4.3 Cross-Module Patient Visibility

When a patient exists in both the AWV Tracker and CCM / RPM Tracker (matched on ecw_patient_id), the CCM detail panel displays a cross-reference indicator: "Also tracked in AWV" with a link to the patient's AWV record. This provides at-a-glance context without requiring navigation between modules.

### 4.4 Patient Deactivation

Consistent with AWV Tracker:

1. Set `is_active = false` on the ccm_patients record
2. Close the active enrollment record (set enrollment_status = Inactive or Disenrolled with reason)
3. Active RPM devices are marked as Returned or Lost
4. Patient excluded from default dashboard views and enrollment denominators
5. Historical enrollment and reimbursement data retained for reporting

---

## 5. Bulk Upload Pipeline

### 5.1 Overview

Bulk upload populates and refreshes the patient registry with eligible Medicare patients. The coordinator runs a custom eCW report exporting patients with 2+ chronic conditions and Medicare coverage, uploads the file, and the system matches records against the existing registry using eCW patient ID.

### 5.2 eCW Export Specification

| Parameter | Value |
|-----------|-------|
| Report Name | CCM/RPM Eligible Patient Roster Export |
| Export Format | CSV or Excel 2007 Data |
| Population | Active patients with primary payer containing "Medicare" AND 2+ active chronic condition diagnoses |
| Excluded Fields | Patient first name, DOB, address, phone, email, SSN, MBI, diagnosis details, medication lists |

**Required columns in the export:**

| Column Name | Maps To | Required | Notes |
|------------|---------|----------|-------|
| Patient Acct No | ecw_patient_id | Yes | Primary matching key; same as AWV Tracker |
| Patient Last Name | last_name | Yes | Display identifier |
| Rendering Provider | assigned_provider_id | Yes | Matched against providers table by name |
| Facility | facility_id | No | Matched against facilities_directory; null for office patients |
| Primary Payer Name | payer_name | No | Confirms Medicare enrollment |

Note: The bulk upload establishes eligibility only. It does not set enrollment status — that is a manual step performed by the Admin or Coordinator after upload, reflecting the operational reality that enrollment requires patient consent and a deliberate clinical decision.

### 5.3 Upload Validation

#### 5.3.1 Structural Validation

- File must be CSV or Excel (.xlsx) format
- Required columns (Patient Acct No, Patient Last Name, Rendering Provider) must be present
- Row count must be > 0 and < 10,000
- File size must not exceed 10MB

#### 5.3.2 PHI Rejection

Column header scan against the same PHI blacklist used by Practice Health Module and AWV Tracker. Upload rejected if any of the following are detected:

- Patient First Name, Patient DOB, Patient SSN
- Patient Address (any variant), Patient Phone (any variant), Patient Email
- Medicare Beneficiary Identifier, Insurance Subscriber No
- Diagnosis codes, medication lists, clinical notes

#### 5.3.3 Data Quality Checks

- Patient Acct No must be non-empty and unique within the file
- Patient Last Name must be non-empty
- Rendering Provider must match an active provider in the providers table (or flag for review)
- Facility (if present) must match a registered facility in facilities_directory (or flag for review)

### 5.4 Upsert Logic

Keyed on `ecw_patient_id`, consistent with AWV Tracker:

| Scenario | Behavior |
|----------|----------|
| **New patient ID** | Insert ccm_patients record. Create ccm_enrollment record with enrollment_status = "Eligible" and program_type = null. |
| **Existing patient ID** | Update provider assignment and facility if changed. Update payer_name if changed. Do NOT overwrite enrollment_status or program_type — enrollment decisions are manual. |
| **Patient in system but missing from upload** | Flag as "Not in Latest Upload" in results summary. Admin reviews for potential deactivation. No automatic changes. |

### 5.5 Upload Results Summary

After processing, the system displays:

- Total rows processed
- New patients added
- Existing patients updated (with changed fields)
- Patients flagged as missing from upload
- Validation warnings and errors

### 5.6 Recommended Upload Cadence

Quarterly refresh uploads are recommended. CCM eligibility changes less frequently than AWV eligibility (chronic conditions are persistent by definition). Quarterly refreshes catch new Medicare enrollees and provider reassignments while avoiding unnecessary upload frequency.

---

## 6. Individual Patient Entry

### 6.1 Add Patient Form

**Step 1 — Patient Identification**

- eCW Patient ID (required; validated as unique)
- Last Name (required)
- Medicare Status: Active, Inactive, Unknown (required; defaults to Active)
- Primary Payer Name (optional)

**Step 2 — Assignment**

- Service Line: HCI Office, Mobile Docs (required)
- Facility (conditional; required if Service Line = Mobile Docs; dropdown from active facilities_directory)
- Assigned Provider (required; dropdown from active providers table)

**Step 3 — Initial Enrollment (optional)**

- Enrollment Status: Eligible, Enrolled, Declined (defaults to Eligible)
- If Enrolled: Program Type (CCM Only, RPM Only, CCM + RPM), enrollment date, consent obtained (yes/no), consent date
- If Enrolled with RPM: option to add initial device(s) immediately
- Notes (optional)

On submission, the system creates the ccm_patients record and a ccm_enrollment record. If enrollment status is set to Enrolled with RPM, any devices specified are also created in ccm_devices.

### 6.2 Edit Patient

All patient-level fields are editable from the patient detail view. Provider reassignment updates the display but does not affect enrollment or reimbursement history.

---

## 7. Enrollment Management

### 7.1 Status Model

Unlike the AWV Tracker's two-stage model (eligibility + completion), the CCM / RPM Tracker uses a single enrollment status field. This reflects the simpler workflow: patients are either eligible, enrolled (ongoing), or out of the program.

| Status | Meaning | Set By |
|--------|---------|--------|
| Eligible | Patient meets criteria (2+ chronic conditions, Medicare) but not yet enrolled | System (on upload/creation) or Admin/Coordinator |
| Enrolled | Patient has consented and is actively receiving CCM and/or RPM services | Admin or Coordinator |
| Declined | Patient was offered the program and refused participation | Admin or Coordinator |
| Disenrolled | Patient was previously enrolled but removed from the program | Admin or Coordinator |
| Inactive | Patient is deceased, transferred, or lost Medicare eligibility | Admin or Coordinator |

### 7.2 Program Type

When a patient's status is set to Enrolled, the program_type field captures their level of participation:

| Program Type | Meaning | Revenue Implication |
|-------------|---------|---------------------|
| CCM Only | Enrolled in Chronic Care Management; no RPM devices | CCM CPT codes only (99490, 99439, 99491) |
| RPM Only | Enrolled in Remote Patient Monitoring; no CCM billing | RPM CPT codes only (99453, 99454, 99457, 99458) |
| CCM + RPM | Enrolled in both programs simultaneously | Full revenue stack — CCM + RPM CPT codes |

Program type can be changed over time. A patient might start as CCM Only and later add RPM when a device becomes appropriate. The enrollment record's program_type is updated and the change is reflected in the updated_at timestamp.

### 7.3 Enrollment Workflow

**Marking as Enrolled:**
- Set enrollment_status = "Enrolled"
- Select program_type (required)
- Enter enrollment_date (required; defaults to today)
- Set consent_obtained = true and enter consent_date (strongly recommended; required for billing compliance)
- If program_type includes RPM, system prompts to add device(s)
- Optionally add a note

**Marking as Declined:**
- Set enrollment_status = "Declined"
- A note is encouraged documenting the refusal context
- Patient remains in the registry at Declined status
- Declined patients are excluded from the "unenrolled eligible" worklist but can be revisited

**Marking as Disenrolled:**
- Set enrollment_status = "Disenrolled"
- Enter disenrollment_date (required)
- Enter disenrollment_reason from predefined list (required):
  - "Patient withdrew consent"
  - "No longer meets clinical criteria"
  - "Transferred to another provider"
  - "Non-compliant with program requirements"
  - "Insurance coverage changed"
  - "Other" (free text required)
- Active RPM devices are prompted for status update (Returned, Lost)
- The current enrollment record is closed; if the patient re-enrolls later, a new enrollment record is created

**Re-enrollment:**
- A Declined or Disenrolled patient can be re-enrolled
- This creates a new ccm_enrollment record (the old record is preserved for history)
- Fresh enrollment_date, consent tracking, and device assignment

### 7.4 Consent Tracking

Medicare requires patient consent before CCM billing can begin. The enrollment record tracks consent with two fields: `consent_obtained` (boolean) and `consent_date`. While the system does not block enrollment without consent (some practices document consent retroactively), the dashboard flags enrolled patients without consent as a compliance warning.

---

## 8. RPM Device Tracking

### 8.1 Device Model

RPM device tracking is designed as a lightweight inventory snapshot — not a full asset management system. Each device assignment is a row in ccm_devices linked to the patient's enrollment record. The goal is to answer: "Which patients have which devices, and are they active?"

### 8.2 Device Types

| Device Type | Common Use Case | Typical Condition Monitored |
|------------|----------------|---------------------------|
| Blood Pressure Monitor | Most common RPM device; daily BP readings | Hypertension, heart failure, CKD |
| Pulse Oximeter | SpO2 and heart rate monitoring | COPD, heart failure, post-COVID |
| Glucose Monitor | Blood sugar readings (fingerstick or CGM) | Diabetes (Type 1 and Type 2) |
| Weight Scale | Daily weight monitoring | Heart failure (fluid retention tracking) |
| Thermometer | Temperature monitoring | Post-surgical, immunocompromised |
| Other | Custom or specialty devices | Free-text description in notes |

### 8.3 Device Status

| Status | Meaning |
|--------|---------|
| Active | Device is deployed and patient is actively using it |
| Returned | Device has been returned to the practice |
| Lost | Device is lost or unaccounted for |
| Malfunctioning | Device is not functioning properly; pending replacement or repair |

### 8.4 Device Assignment Workflow

Devices are added from the patient detail panel when the patient is Enrolled with RPM:

- Select device_type (required)
- Enter assigned_date (required; defaults to today)
- Optionally enter notes (device model, serial number, special instructions)
- device_status defaults to Active

Multiple devices can be assigned to a single patient (e.g., blood pressure monitor + weight scale for a heart failure patient).

When a device's status changes from Active, the removed_date field is populated. This creates a clean history of device deployment per patient.

### 8.5 Device Summary on Dashboard

The dashboard displays aggregate device metrics:
- Total active devices deployed
- Device type breakdown (count per type)
- Patients with active devices vs. RPM-enrolled patients (device coverage rate)
- Devices in non-Active status (flagged for follow-up)

---

## 9. Monthly Reimbursement Logging

### 9.1 Overview

The reimbursement log is the revenue verification layer. When EOBs arrive from Medicare, the Admin or Coordinator enters the actual paid amounts per patient per month per CPT code. This creates a ground-truth revenue record that the dashboard compares against expected reimbursement to surface revenue leakage.

### 9.2 Entry Workflow

Reimbursement entries are made from the patient detail panel under a "Reimbursement" section, or via a batch entry interface (described in Section 9.4).

**Per-entry fields:**
- Service month (required; month/year picker)
- CPT code (required; dropdown filtered to CCM and RPM codes relevant to the patient's program_type)
- Billed amount (optional; the claim amount submitted)
- Paid amount (required; the actual payment from the EOB)
- Adjustment amount (optional; contractual adjustment or writeoff)
- Denial reason (optional; if the claim was denied or underpaid)
- Notes (optional; e.g., "Appealing denial", "Reprocessed claim")

### 9.3 Expected vs. Actual Revenue

For each enrolled patient per month, the system calculates:

- **Expected revenue**: based on program_type and the ccm_reimbursement_rates table. A CCM + RPM patient's expected monthly revenue = SUM of expected reimbursement for applicable CPT codes
- **Actual revenue**: SUM of paid_amount from ccm_reimbursements for that patient and month
- **Variance**: Expected – Actual; positive variance = revenue leakage

The dashboard aggregates these calculations across all enrolled patients to show practice-level expected vs. actual revenue, collection rate, and leakage.

### 9.4 Batch Entry Interface

Processing EOBs individually per patient is tedious. The batch entry interface allows the Coordinator to enter reimbursement data for multiple patients in a single session:

- Select service month (applies to all entries in the batch)
- Table view of all enrolled patients for that month
- Each row shows: Patient (Last Name — eCW ID), Provider, Program Type, CPT code dropdown, paid amount input
- "Add Row" button to add multiple CPT codes per patient (e.g., 99490 + 99454 + 99457)
- Submit all entries at once
- Rows with $0 paid or blank fields are flagged but not required — not all patients will have EOB data every month

### 9.5 Revenue Entry Cadence

Monthly, after EOBs are received and processed. Typical lag: 30–60 days after the service month (claims submission → adjudication → EOB → data entry). The dashboard accounts for this lag by distinguishing between months with reimbursement data entered and months still pending.

---

## 10. Revenue Dashboard

### 10.1 Overview

The revenue dashboard provides the snapshot view Ryan described: how effective is the CCM/RPM program, and are we getting paid? It combines enrollment metrics with actual reimbursement data to surface both program penetration and revenue accuracy.

### 10.2 Revenue Metrics

| Metric | Formula | Display |
|--------|---------|---------|
| Monthly Revenue (Actual) | SUM(paid_amount) from ccm_reimbursements for the selected month | Dollar amount; trend sparkline for trailing 6 months |
| Monthly Revenue (Expected) | COUNT(enrolled patients by program_type) × expected rates from ccm_reimbursement_rates | Dollar amount representing what should be collected if all claims pay at expected rates |
| Collection Rate | Actual / Expected × 100 | Percentage; color-coded (green ≥ 90%, amber 75–89%, red < 75%) |
| Revenue Leakage | Expected – Actual for months with reimbursement data entered | Dollar amount of unrealized revenue due to denials, underpayments, or missed billing |
| Revenue per Enrolled Patient | Actual monthly revenue / COUNT(enrolled patients) | Dollar amount; indicates average yield per patient |
| CCM Revenue vs. RPM Revenue | SUM(paid_amount) grouped by program_type (CCM codes vs. RPM codes) | Side-by-side comparison; shows relative contribution of each program |
| YTD Revenue | SUM(paid_amount) for all months in current year | Dollar amount with trend vs. prior year |

### 10.3 Enrollment Metrics

| Metric | Formula | Display |
|--------|---------|---------|
| Total Eligible | COUNT of active ccm_patients | Total population in registry |
| Enrolled | COUNT where enrollment_status = Enrolled | With breakdown by program_type |
| Enrollment Rate | Enrolled / Total Eligible × 100 | Percentage with progress bar |
| Declined | COUNT where enrollment_status = Declined | Patients who refused; opportunity for re-engagement |
| CCM + RPM Dual Enrollment | COUNT where program_type = "CCM + RPM" / COUNT Enrolled × 100 | Percentage of enrolled patients on the full revenue stack |

### 10.4 Financial Model Comparison

The dashboard includes a comparison to the Mobile Docs financial model targets:

- Financial model assumes 65% CCM enrollment and 35% RPM enrollment
- Actual enrollment rates displayed alongside targets
- Dollar impact of the gap: "Current enrollment generates ~$X/month. At target penetration, the program would generate ~$Y/month — a gap of ~$Z."

This directly connects the tracker to the strategic financial planning in the Mobile Docs executive summary and financial model.

### 10.5 Revenue Visibility

Revenue metrics visible to Admin and Medical Director only. Coordinators see enrollment counts, rates, and device metrics but not dollar amounts — consistent with Practice Health Module and AWV Tracker access principles.

---

## 11. Provider-Level Tracking

### 11.1 Provider Attribution

Each patient's assigned_provider_id enables provider-level roll-ups of enrollment and revenue metrics.

### 11.2 Provider Comparison View

| Column | Description |
|--------|-------------|
| Provider Name | From providers table |
| Assigned Patients | COUNT of active ccm_patients assigned to this provider |
| Enrolled | COUNT where enrollment_status = Enrolled |
| Enrollment Rate | Enrolled / Assigned × 100 |
| CCM Only | COUNT where program_type = CCM Only |
| CCM + RPM | COUNT where program_type = CCM + RPM |
| RPM Only | COUNT where program_type = RPM Only |
| Monthly Revenue (Actual) | SUM of paid_amount for latest month with data |
| Revenue per Enrolled Patient | Monthly Revenue / Enrolled count |
| Declined | COUNT where enrollment_status = Declined |

### 11.3 Part-Time Schedule Awareness

Consistent with Practice Health Module and AWV Tracker: provider metrics are compared on rate-based metrics (enrollment percentage, revenue per enrolled patient) rather than raw volume, since NP1 and NP2 have different schedule configurations.

### 11.4 Provider Worklist

Filtering the patient table by provider + enrollment_status = Eligible creates an actionable enrollment worklist: "Show me all eligible patients assigned to NP2 who have not yet been enrolled or declined." This supports targeted outreach during house calls or office visits.

---

## 12. Role-Based Access Control

### 12.1 Role Permissions — CCM / RPM Tracker

| Capability | Admin | Medical Director | Coordinator | Provider (Future) |
|-----------|-------|-----------------|-------------|-------------------|
| View CCM/RPM dashboard | Full | Full | Counts and rates only (no revenue) | Own patients only |
| View patient registry | Full | Full | Full (no revenue fields) | Own patients only |
| Add patients (individual) | Yes | No | Yes | No |
| Bulk upload patients | Yes | No | Yes | No |
| Edit patient fields | Yes | No | Yes | No |
| Update enrollment status | Yes | No | Yes | No |
| Manage RPM devices | Yes | No | Yes | No |
| Enter reimbursement data | Yes | No | Yes | No |
| View revenue metrics | Yes | Yes | No | No |
| Configure reimbursement rates | Yes | No | No | No |
| Deactivate patients | Yes | No | No | No |
| View upload history | Yes | No | Yes (own uploads) | No |

### 12.2 Access Control Implementation

Consistent with all other HCI Portal modules:

- **Application layer**: Revenue columns, dollar amounts, and rate configuration hidden for Coordinator and Provider roles.
- **Database layer**: Supabase Row-Level Security on all CCM tables. Coordinator role restricted from revenue-related computed views. Provider role (future) filtered by assigned_provider_id.

---

## 13. Dashboard Specifications

### 13.1 Navigation

The CCM / RPM Tracker is a top-level navigation item in the HCI Portal sidebar, listed as "CCM / RPM" with a heart-pulse icon. It sits below "Annual Wellness Visits" in the nav hierarchy.

Sidebar order:
1. Practice Health
2. Mobile Docs (Facility Directory)
3. Annual Wellness Visits
4. CCM / RPM

### 13.2 Summary Header

The top of the dashboard displays a row of aggregate metric cards:

| Card | Value | Subtext |
|------|-------|---------|
| Enrolled Patients | COUNT of enrollment_status = Enrolled | "{n} eligible not yet enrolled" |
| Enrollment Rate | Enrolled / Total Eligible × 100 | Progress bar; color coded vs. 65% target |
| Active RPM Devices | COUNT of ccm_devices where device_status = Active | "{n} patients with devices" |
| Monthly Revenue (Admin/MD only) | SUM of paid_amount for most recent month with data | "Expected: ${expected}" |

### 13.3 Filter Bar

- **Search box**: Free-text search across patient last name and eCW ID
- **Enrollment filter chips**: All | Eligible | Enrolled | Declined | Disenrolled | Inactive (single-select, defaults to All)
- **Program type filter**: All | CCM Only | RPM Only | CCM + RPM
- **Service line filter**: All | HCI Office | Mobile Docs
- **Provider filter**: All | [Provider dropdown]
- **Device filter**: All | Has Active Devices | No Devices

Active filters are combinable. Most common operational views:
- Eligible (not yet enrolled) + specific provider = enrollment worklist
- Enrolled + CCM + RPM = full-stack patients (highest-value)
- Enrolled + No Devices = RPM patients missing device assignments

### 13.4 Patient Table

| Column | Description | Sortable |
|--------|-------------|----------|
| Patient | Last Name — eCW ID | Yes (alpha) |
| Provider | Assigned provider name | Yes |
| Service Line | HCI Office or Mobile Docs | Yes |
| Facility | Facility name (Mobile Docs only) | Yes |
| Status | Enrollment status badge: Eligible (gray), Enrolled (green), Declined (amber), Disenrolled (red), Inactive (muted) | Yes |
| Program | Program type badge: CCM Only (blue), RPM Only (teal), CCM + RPM (purple); blank if not enrolled | Yes |
| Devices | Count of active RPM devices with device type icons; "—" if none | Yes |
| Consent | Checkmark if consent_obtained = true; warning icon if enrolled without consent | Yes |
| Enrolled Since | enrollment_date | Yes (date) |
| Last Reimbursement | Most recent service_month with a ccm_reimbursements entry | Yes (date) |
| Actions | Quick-action buttons: Update Status, View Detail | — |

Default sort: Enrolled patients first (highest-value), then Eligible (actionable), sorted by last name.

### 13.5 Patient Detail Panel

Slide-out panel (520px width, consistent with Facility Directory and AWV Tracker):

1. **Header**: Last Name, eCW ID, service line badge, provider name, Medicare status badge
2. **Cross-Module Indicator**: "Also tracked in AWV" link if patient exists in awv_patients (matched on ecw_patient_id)
3. **Enrollment Section**: Current enrollment status with action buttons, program type selector, enrollment date, consent status with date, disenrollment reason (if applicable)
4. **RPM Devices Section** (visible when program_type includes RPM): List of assigned devices with type, status, assigned date; "Add Device" button; status change buttons (Return, Lost, Malfunction)
5. **Reimbursement History** (Admin/MD only): Table of ccm_reimbursements rows for this patient, sorted by service_month descending. Columns: Month, CPT Code, Billed, Paid, Adjustment, Denial Reason. "Add Reimbursement" button. Running total of all-time revenue from this patient.
6. **Revenue Summary** (Admin/MD only): Total revenue collected for this patient, average monthly revenue, months enrolled, expected vs. actual comparison
7. **Notes**: Free-text notes from the enrollment record; editable

### 13.6 Batch Reimbursement Entry

Accessible via a "Log Reimbursements" button on the dashboard header:

- Month selector at top (defaults to most recent complete month)
- Table of all enrolled patients for the selected month
- Each row: Patient, Provider, Program Type, CPT code dropdown, Billed amount input, Paid amount input, Denial reason (optional)
- "Add Line" to add multiple CPT codes per patient
- Pre-populated CPT code suggestions based on program_type (CCM Only patients see CCM codes pre-filled; CCM + RPM patients see both)
- Submit all entries at once
- Results summary: total entries logged, total revenue recorded, any flagged items

### 13.7 Bulk Upload Interface

Identical pattern to AWV Tracker:
- "Upload Patients" button on dashboard header
- Drag-and-drop file upload zone
- Processing progress indicator
- Results summary with new, updated, flagged, and error counts
- Upload history table

---

## 14. Integration with Practice Health Module & AWV Tracker

### 14.1 Current Integration (v1)

| Integration Point | Direction | Description |
|-------------------|-----------|-------------|
| Provider roster | PHM → CCM | Provider dropdown populated from PHM providers table |
| Facility directory | Directory → CCM | Facility dropdown populated from facilities_directory |
| AWV cross-reference | AWV ↔ CCM | Patients matched on ecw_patient_id; cross-module indicator on detail panels |

### 14.2 Future Integration (v2)

**Practice Health Auto-Detection:**
When PHM ingests 371.02 charges containing CCM/RPM CPT codes (99490, 99439, 99491, 99453, 99454, 99457, 99458), the system cross-references against ccm_patients to:
- Confirm billing occurred for enrolled patients (expected)
- Flag billing for patients not enrolled in CCM/RPM Tracker (possible data gap)
- Auto-suggest reimbursement entries when matched charges are found (reducing manual EOB entry)

This requires the same approach discussed in the AWV Tracker PRD: adding eCW Patient Account Number to the PHM 371.02 custom report for direct matching.

**Facility Directory Census Integration:**
The Facility Directory's census snapshots include ccm_enrolled and rpm_enrolled fields. These could be auto-calculated from the CCM / RPM Tracker's enrollment data per facility, replacing manual census updates for these specific fields.

### 14.3 Shared Patient Registry (Future)

When the third revenue program module is built (likely TCM), the recommended approach is to consolidate ccm_patients and awv_patients into a shared `program_patients` table. Both modules would reference this single registry, eliminating duplicate patient records and upload cycles. A single bulk upload of the Medicare roster would populate the shared registry, and each module's tracking tables (awv_tracking, ccm_enrollment, tcm_tracking) would reference it via foreign key.

### 14.4 Dashboard Cross-Links

The Practice Health Module's financial dashboard can include a "CCM/RPM Revenue" card sourced from the CCM / RPM Tracker, showing program revenue alongside overall practice financials. The Facility Directory's detail panel can show enrollment counts per facility sourced from CCM data.

---

## 15. Future Extensibility

### 15.1 TCM Tracker

Transitional Care Management (TCM) is the next logical revenue program module. TCM tracks per-discharge events rather than ongoing enrollment, but it shares the same patient population and provider attribution model. The shared patient registry (Section 14.3) would support TCM without a new patient table.

### 15.2 Automated Reimbursement Import

A future enhancement could parse ERA (Electronic Remittance Advice) files or structured EOB exports to auto-populate ccm_reimbursements entries, reducing manual data entry. This depends on the practice's clearinghouse capabilities and ERA format access.

### 15.3 Program Effectiveness Analytics

Beyond the snapshot dashboard, a future analytics layer could track:
- Enrollment retention rate (percentage of patients still enrolled after 3, 6, 12 months)
- Revenue trend per enrolled patient over time (are we billing more CPT codes per patient as the program matures?)
- Denial rate trends by CPT code (are certain codes being denied more frequently?)
- Facility-level enrollment penetration (which Mobile Docs facilities have the highest CCM/RPM adoption?)
- Time-to-enrollment (how long from eligible to enrolled; identifies workflow bottlenecks)

### 15.4 Patient Outreach Integration

The Eligible-but-not-Enrolled worklist is a natural input for outreach campaigns. Integration with the Patient Outreach Portal could generate call lists for CCM/RPM enrollment outreach, with call dispositions updating enrollment status (Enrolled after consent obtained, Declined after patient refusal).

### 15.5 SaaS Generalization

In the SaaS phase, the CCM / RPM Tracker generalizes to any practice managing chronic care or remote monitoring programs. The tenant_id field supports multi-practice isolation. The reimbursement rates table accommodates practice-specific fee schedules. The device tracking model applies to any RPM vendor's devices. The minimal identifier approach (last name + EMR ID) works across EMR systems following the adapter pattern from the Practice Health Module.

---

## 16. Technical Requirements

### 16.1 Technology Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | React | Consistent with all HCI Portal modules |
| Backend / Database | Supabase (PostgreSQL) | Shared instance; new tables in same schema; RLS for access control |
| File Parsing | Papa Parse (CSV), SheetJS (Excel) | Client-side parsing for upload validation |
| Hosting | Netlify (frontend) + Supabase (backend) | Consistent with existing infrastructure |
| IDE | Cursor AI | Development environment with PRD integration |

### 16.2 HIPAA Compliance

The CCM / RPM Tracker follows the same minimal identifier approach as the AWV Tracker:

- No patient first names, DOBs, addresses, phone numbers, SSNs, MBIs, diagnosis codes, medication lists, or clinical data stored
- Bulk upload pipeline rejects files containing PHI column headers
- eCW patient account number is an internal system identifier, not a Medicare or insurance identifier
- Device tracking stores device type and status only — no patient physiologic data (readings, vitals) enters the system
- All data transmission uses HTTPS/TLS encryption
- Supabase Row-Level Security enforces role-based data isolation
- Audit trails via ccm_uploads and ccm_reimbursements track all data inputs with user attribution

**Compliance note:** Same advisory as AWV Tracker — the combination of last name + patient account number + provider + facility could be considered indirectly identifiable. Confirm approach with compliance advisor.

### 16.3 Performance Requirements

- Dashboard load time: < 2 seconds for up to 2,000 patient records
- Bulk upload processing: < 10 seconds for files up to 5,000 rows
- Patient table filtering/sorting: < 200ms (client-side for datasets under 2,000 patients)
- Detail panel open: < 500ms
- Batch reimbursement entry submission: < 5 seconds for up to 200 line items

### 16.4 Data Retention

- Patient records: retained indefinitely (soft-deactivation via is_active)
- Enrollment records: retained indefinitely for longitudinal enrollment history
- Device records: retained indefinitely for deployment history
- Reimbursement records: retained indefinitely for revenue analysis and audit
- Upload audit logs: retained indefinitely

---

## 17. Success Metrics

### 17.1 Launch Criteria

- All eligible Medicare patients with 2+ chronic conditions imported via bulk upload
- Provider assignments mapped correctly
- Mobile Docs patients linked to correct facilities
- At least 50% of known enrolled patients have enrollment_status updated from "Eligible" to "Enrolled" within first 2 weeks
- RPM devices assigned for all known RPM patients
- At least one month of reimbursement data entered for enrolled patients
- Revenue dashboard calculating correctly against known reimbursement rates

### 17.2 Ongoing Operational Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| CCM Enrollment Rate | ≥ 65% of eligible patients enrolled | Aligns with Mobile Docs financial model assumption |
| RPM Enrollment Rate | ≥ 35% of eligible patients enrolled (RPM Only or CCM + RPM) | Aligns with Mobile Docs financial model assumption |
| Dual Enrollment Rate | ≥ 50% of enrolled patients on CCM + RPM | Maximizes per-patient revenue via stacking |
| Collection Rate | ≥ 90% of expected revenue actually collected per EOB data | Measures billing accuracy and payer compliance |
| Reimbursement Data Currency | Reimbursement entries logged within 60 days of service month | Measures operational discipline in EOB processing |
| Device Coverage | 100% of RPM-enrolled patients have ≥ 1 active device assigned | Ensures RPM billing is supported by actual device deployment |
| Denial Rate | < 10% of submitted CCM/RPM claims denied | Measures billing quality; high denial rates indicate documentation or eligibility issues |
| Revenue per Enrolled Patient | ≥ $100/month average across all enrolled patients | Composite metric indicating program depth (higher = more CPT codes billed per patient) |

---

*HCI Medical Group — CCM / RPM Program Tracker PRD v1.0 — March 2026*
