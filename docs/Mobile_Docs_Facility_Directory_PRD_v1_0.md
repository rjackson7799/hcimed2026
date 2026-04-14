# Mobile Docs Facility Directory
## Operational Intelligence & Partnership Pipeline Management
### Product Requirements Document

**HCI Medical Group | Mobile Docs Division**
**Version 1.0 | March 2026**
**CONFIDENTIAL**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Data Architecture](#3-data-architecture)
4. [Facility Registry](#4-facility-registry)
5. [Patient Census Tracking](#5-patient-census-tracking)
6. [Contact Management](#6-contact-management)
7. [Notes & Activity Log](#7-notes--activity-log)
8. [Partnership Pipeline](#8-partnership-pipeline)
9. [Map & Geographic Intelligence](#9-map--geographic-intelligence)
10. [Provider Assignment & Scheduling](#10-provider-assignment--scheduling)
11. [Revenue Attribution](#11-revenue-attribution)
12. [Role-Based Access Control](#12-role-based-access-control)
13. [Dashboard Specifications](#13-dashboard-specifications)
14. [Integration with Practice Health Module](#14-integration-with-practice-health-module)
15. [Future Extensibility](#15-future-extensibility)
16. [Technical Requirements](#16-technical-requirements)
17. [Success Metrics](#17-success-metrics)

---

## 1. Executive Summary

The Mobile Docs Facility Directory is an operational management module within the HCI Portal that serves as the central system of record for all locations where Mobile Docs delivers care. It replaces ad-hoc spreadsheets and informal tracking with a structured, queryable directory of skilled nursing facilities (SNFs), board-and-care homes, and homebound patients — complete with patient census data, facility contacts, provider assignments, visit scheduling, partnership status, and geographic intelligence.

Unlike the Practice Health Module (which answers "how is the practice performing?"), the Facility Directory answers "where do we work, who do we serve there, and where should we grow next?" It is the operational backbone of Mobile Docs' facility-first acquisition strategy, providing visibility into the partnership pipeline from cold outreach through active service delivery.

The module is designed as a new top-level navigation item within the HCI Portal, sitting alongside Practice Health in the sidebar. While the two modules serve distinct purposes, they share underlying data connections: facility-level charges and visit data from Practice Health flow into the Directory's revenue attribution and visit tracking, creating a unified view of both operational logistics and financial performance at each location.

---

## 2. Product Overview

### 2.1 Problem Statement

Mobile Docs' growth strategy depends on facility partnerships. Each SNF, board-and-care, and homebound patient relationship has its own contact person, visit cadence, patient census, provider assignment, and partnership history. Currently this information lives across spreadsheets, text messages, email threads, and institutional memory. This creates several operational risks:

- No single source of truth for which facilities are active, onboarding, or prospecting
- No visibility into patient census or bed penetration at each facility
- Contact information scattered across personal phones and email
- No structured tracking of outreach history or partnership pipeline status
- No geographic intelligence for route optimization or coverage gap analysis
- No connection between facility-level operations and financial performance data
- Difficult to onboard new coordinators or providers without institutional knowledge transfer

### 2.2 Solution

The Facility Directory provides a structured, role-aware platform that consolidates all facility-related operational data into a single module. It supports two primary views — a card-based grid for browsing and filtering, and a geographic map for spatial analysis — with a slide-out detail panel for deep-diving into any individual facility. A pipeline workflow tracks each facility relationship from initial outreach through active partnership, and a notes system captures institutional knowledge with provider attribution and timestamps.

### 2.3 Facility Types

Mobile Docs serves three distinct location types, each with different operational characteristics:

| Type | Description | Typical Census | Visit Model | Density Advantage |
|------|-------------|----------------|-------------|-------------------|
| SNF (Skilled Nursing Facility) | Licensed facilities with 30–120+ beds, professional nursing staff, Medicare/Medicaid certified | 8–30 patients per facility | Weekly rounds, 6–10 visits per facility day | High — clustered patients enable 8+ visits/day at a single location |
| Board & Care | Residential care homes with 4–6 beds, owner-operated, personal care level | 2–6 patients per facility | Biweekly to monthly, 2–6 visits per facility day | Medium — fewer patients but zero travel between visits within facility |
| Homebound | Individual patients in private residences, typically with family caregiver involvement | 1 patient per location | Monthly to quarterly, 1 visit per location | Low — scattered locations requiring individual travel, but often high-acuity and high per-visit reimbursement |

The facility type classification drives default visit cadence suggestions, map visualization (pin color and size), and penetration rate calculations (applicable to SNFs and Board & Care, not to homebound patients).

### 2.4 Users

| User | Primary Use Cases |
|------|-------------------|
| Ryan (Admin) | Pipeline management, geographic expansion planning, revenue attribution analysis, facility partnership strategy |
| Medical Director | Provider assignment review, visit cadence oversight, clinical notes review |
| Coordinator | Contact information lookup, visit scheduling, note entry, census updates |
| Provider (Future) | View assigned facilities, route for the day, facility-specific notes and patient context |

---

## 3. Data Architecture

### 3.1 Database Schema

The Facility Directory introduces new tables to the existing Supabase (PostgreSQL) database. These tables follow the same conventions established in the Practice Health Module PRD: tenant_id field on all tables (dormant until SaaS phase), Row-Level Security for role-based access, and ISO 8601 date formatting throughout.

#### 3.1.1 Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| facilities_directory | Master registry of all locations where Mobile Docs delivers or may deliver care | id, tenant_id, name, type (enum: SNF, Board & Care, Homebound), status (enum: Prospecting, Onboarding, Active, Inactive), address_line1, address_line2, city, state, zip, latitude, longitude, phone, total_beds, pos_code, distance_miles, drive_minutes, visit_cadence, assigned_provider_id, created_at, updated_at, is_archived |
| facility_contacts | Contact persons associated with each facility, supporting multiple contacts per facility | id, facility_id, name, role, title, phone, email, is_primary, contact_type (enum: Administrative, Clinical, Caregiver, Referral), notes, created_at, updated_at |
| facility_notes | Timestamped activity log and notes per facility with author attribution | id, facility_id, author_id, author_name, note_type (enum: General, Visit Summary, Outreach, Partnership, Clinical, Administrative), content, is_pinned, created_at |
| facility_census | Point-in-time patient census snapshots per facility | id, facility_id, snapshot_date, active_patients, new_admissions, discharges, ccm_enrolled, rpm_enrolled, awv_eligible, updated_by |
| facility_pipeline | Pipeline stage transition log for audit trail | id, facility_id, from_status, to_status, changed_by, change_reason, changed_at |

#### 3.1.2 Relationship to Existing Tables

The Facility Directory connects to the existing Practice Health Module schema through facility-level joins:

| Directory Table | PHM Table | Join Logic | Purpose |
|----------------|-----------|------------|---------|
| facilities_directory | facilities (PHM) | facilities_directory.name ↔ facilities.name OR facilities_directory.pos_code ↔ facilities.pos_code | Link directory entries to billing/productivity data |
| facilities_directory | charges (PHM) | Via facilities join on facility name | Revenue attribution per directory facility |
| facilities_directory | productivity (PHM) | Via facilities join on facility name | Visit volume and operational metrics per facility |
| facilities_directory | providers (PHM) | facilities_directory.assigned_provider_id ↔ providers.id | Provider assignment and schedule awareness |

This join architecture allows the Facility Directory to display revenue and visit data from Practice Health without duplicating the underlying billing data. If no Practice Health data exists for a facility (e.g., a Prospecting facility with no visits yet), the directory gracefully displays zero values.

#### 3.1.3 Field Specifications — facilities_directory

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| tenant_id | UUID | Yes | Current tenant | Multi-tenant isolation (dormant until SaaS phase) |
| name | String (255) | Yes | — | Facility display name; for homebound patients, format: "Patient Last Name Residence" or caregiver-approved alias |
| type | Enum | Yes | — | SNF, Board & Care, Homebound |
| status | Enum | Yes | Prospecting | Prospecting, Onboarding, Active, Inactive |
| address_line1 | String (255) | Yes | — | Street address |
| address_line2 | String (255) | No | null | Suite, unit, building |
| city | String (100) | Yes | — | City |
| state | String (2) | Yes | CA | State abbreviation |
| zip | String (10) | Yes | — | ZIP code (5 or 9 digit) |
| latitude | Decimal (10,7) | Yes | — | Geocoded latitude for map rendering |
| longitude | Decimal (10,7) | Yes | — | Geocoded longitude for map rendering |
| phone | String (20) | No | null | Primary facility phone number |
| total_beds | Integer | No | null | Licensed bed count; null for Homebound type |
| pos_code | Integer | No | null | CMS Place of Service code (11=Office, 32=Nursing Facility, 33=Custodial Care, 99=Other/Home) — used to link to eCW billing data |
| distance_miles | Decimal (5,1) | Auto | — | Calculated distance from HCI base (91101); recalculated on address change |
| drive_minutes | Integer | Auto | — | Estimated drive time from HCI base; recalculated on address change |
| visit_cadence | String (50) | No | TBD | Expected visit frequency: Weekly, Biweekly, Monthly, Quarterly, As Needed, TBD |
| assigned_provider_id | UUID | No | null | FK to providers table; null if Unassigned |
| created_at | Timestamp | Auto | now() | Record creation |
| updated_at | Timestamp | Auto | now() | Last modification |
| is_archived | Boolean | No | false | Soft delete; archived facilities excluded from default views |

#### 3.1.4 Field Specifications — facility_contacts

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| facility_id | UUID | Yes | — | FK to facilities_directory |
| name | String (255) | Yes | — | Contact full name |
| role | String (100) | Yes | — | Functional role: DON, Administrator, Owner, Discharge Planner, Social Worker, Caregiver, MA Plan Coordinator |
| title | String (100) | No | null | Formal title if different from role |
| phone | String (20) | No | null | Direct phone |
| email | String (255) | No | null | Email address |
| is_primary | Boolean | No | false | Primary contact flag; exactly one per facility |
| contact_type | Enum | Yes | Administrative | Administrative, Clinical, Caregiver, Referral |
| notes | Text | No | null | Free-text notes about this contact (e.g., "Prefers text over email", "Available Tue/Thu only") |
| created_at | Timestamp | Auto | now() | |
| updated_at | Timestamp | Auto | now() | |

#### 3.1.5 Field Specifications — facility_notes

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| facility_id | UUID | Yes | — | FK to facilities_directory |
| author_id | UUID | Yes | — | FK to auth.users; the person who wrote the note |
| author_name | String (100) | Yes | — | Denormalized author display name for fast rendering |
| note_type | Enum | Yes | General | General, Visit Summary, Outreach, Partnership, Clinical, Administrative |
| content | Text | Yes | — | Note body; supports plain text, no rich formatting in v1 |
| is_pinned | Boolean | No | false | Pinned notes appear at top of timeline regardless of date |
| created_at | Timestamp | Auto | now() | Note creation timestamp; notes are append-only (no edit/delete in v1) |

#### 3.1.6 Field Specifications — facility_census

| Field | Data Type | Required | Default | Notes |
|-------|-----------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | Primary key |
| facility_id | UUID | Yes | — | FK to facilities_directory |
| snapshot_date | Date | Yes | — | Date of census count |
| active_patients | Integer | Yes | 0 | Current Mobile Docs patients at this facility |
| new_admissions | Integer | No | 0 | New patients added since last snapshot |
| discharges | Integer | No | 0 | Patients discharged since last snapshot |
| ccm_enrolled | Integer | No | 0 | Patients enrolled in Chronic Care Management |
| rpm_enrolled | Integer | No | 0 | Patients enrolled in Remote Patient Monitoring |
| awv_eligible | Integer | No | 0 | Patients eligible for Annual Wellness Visit |
| updated_by | UUID | Yes | — | FK to auth.users |

### 3.2 Geocoding & Distance Calculation

Facility addresses are geocoded on creation and on address update using the Google Geocoding API. The resulting latitude/longitude coordinates power the map visualization and enable distance/drive-time calculations.

Distance and drive time are calculated from the HCI base address (91101, Pasadena) to the facility address. These values are stored as denormalized fields on the facilities_directory table for fast rendering and sorting, and recalculated whenever the facility address changes.

Calculation approach:

1. On facility creation or address update, call Google Geocoding API to convert address to lat/lng
2. Store lat/lng on the facilities_directory record
3. Call Google Distance Matrix API to calculate driving distance (miles) and estimated drive time (minutes) from 91101 to the facility address
4. Store distance_miles and drive_minutes as denormalized fields
5. If Google APIs are unavailable, calculate straight-line distance using the Haversine formula as a fallback (with a 1.3x multiplier to approximate driving distance)

---

## 4. Facility Registry

### 4.1 Facility Creation

New facilities are added through a multi-step form accessible via the "Add Facility" button on the directory dashboard. The form collects information in a logical sequence:

**Step 1 — Location & Type**

- Facility name (required)
- Facility type: SNF, Board & Care, Homebound (required)
- Address fields: street, city, state, ZIP (required)
- Phone number (optional)
- Total beds (required for SNF and Board & Care; hidden for Homebound)
- Place of Service code (auto-suggested based on type: SNF → 32, Board & Care → 33, Homebound → 99; editable)

**Step 2 — Primary Contact**

- Contact name (required)
- Role (required; dropdown with common roles: DON, Administrator, Owner, Discharge Planner, Social Worker, Family Caregiver, MA Plan Coordinator, Other)
- Phone (optional)
- Email (optional)
- Contact type: Administrative, Clinical, Caregiver, Referral (required)

**Step 3 — Operations**

- Initial status: Prospecting, Onboarding, Active (required; defaults to Prospecting)
- Assigned provider (optional; dropdown populated from active providers table)
- Visit cadence: Weekly, Biweekly, Monthly, Quarterly, As Needed, TBD (optional; defaults to TBD)
- Initial patient census (optional; defaults to 0)
- Initial note (optional; free-text field for first partnership note)

On submission, the system geocodes the address, calculates distance/drive time, creates the facility record, creates the primary contact record, optionally creates the first census snapshot and note, and logs the initial pipeline status in facility_pipeline.

### 4.2 Facility Editing

All facility fields are editable from the detail panel. Address changes trigger re-geocoding and distance recalculation. Status changes trigger a pipeline log entry with optional change reason. Bed count changes recalculate penetration rate.

### 4.3 Facility Archiving

Facilities are never hard-deleted. The "Archive" action sets is_archived = true, which excludes the facility from default directory views and map rendering. Archived facilities remain accessible through an "Archived" filter toggle and retain all historical data (notes, census snapshots, pipeline history) for audit purposes.

### 4.4 Homebound Patient Handling

Homebound patients are modeled as facilities with type = Homebound. This keeps the data model consistent while accommodating the one-patient-per-location nature of homebound care. Specific adaptations:

- total_beds is null and hidden from the UI
- Penetration rate is not calculated (not applicable)
- The "name" field uses a privacy-safe format: patient last name + "Residence" (e.g., "Williams Residence") or a caregiver-approved alias — no patient first names, DOBs, or medical details
- The primary contact is typically the family caregiver rather than a facility administrator
- Map pins use a distinct icon and color to differentiate from facility-based locations

---

## 5. Patient Census Tracking

### 5.1 Census Model

Patient census is tracked as point-in-time snapshots rather than individual patient records. This avoids storing PHI (patient names, conditions, identifiers) while still providing operationally useful aggregate data at the facility level. Each snapshot captures the number of active Mobile Docs patients at a facility on a given date, along with movement data (admissions and discharges since the last snapshot).

### 5.2 Census Update Workflow

Census updates are manual in v1. The coordinator or admin navigates to a facility's detail panel and clicks "Update Census." The update form shows the last recorded values and allows editing:

- Active patients (required)
- New admissions since last update (optional)
- Discharges since last update (optional)
- CCM enrolled count (optional)
- RPM enrolled count (optional)
- AWV eligible count (optional)

On submission, a new row is inserted into facility_census. The active_patients count on the directory summary cards and map pin sizing update immediately.

### 5.3 Penetration Rate Calculation

For SNF and Board & Care facilities, penetration rate is calculated as:

```
penetration_rate = (active_patients / total_beds) × 100
```

This metric is displayed on facility cards, in the detail panel, and as a filterable/sortable column. It directly indicates growth opportunity: a 120-bed SNF with 15 Mobile Docs patients (12.5% penetration) represents a larger expansion opportunity than a 6-bed Board & Care with 5 patients (83.3% penetration).

Penetration rate is not calculated for Homebound facilities (always displays "—").

### 5.4 Ancillary Service Enrollment Tracking

Census snapshots include CCM, RPM, and AWV enrollment counts because these ancillary services represent significant recurring revenue per the Mobile Docs financial model ($6,045/month CCM and $5,355/month RPM per provider at target penetration). Tracking enrollment at the facility level enables:

- Identification of facilities below CCM/RPM enrollment targets
- AI-generated recommendations (via Practice Health integration) to focus enrollment efforts on underperforming facilities
- Revenue projection accuracy by linking actual enrollment data to the financial model's assumptions

### 5.5 Future: Automated Census via eCW Data

In a future phase, census counts could be automatically derived from Practice Health Module data by counting unique patients per facility per period from the 371.02 charges data or 4.06 productivity data. This would replace manual census updates with data-driven counts, while still preserving the manual override capability for corrections.

---

## 6. Contact Management

### 6.1 Multi-Contact Model

Each facility supports multiple contacts, reflecting the reality that Mobile Docs interacts with different people at each location for different purposes. A SNF might have an administrator for partnership discussions, a DON for clinical coordination, and a discharge planner for referrals. Each contact is tagged with a contact_type to clarify their function.

### 6.2 Contact Types

| Contact Type | Typical Roles | Use Case |
|-------------|---------------|----------|
| Administrative | Administrator, Owner, Executive Director, Office Manager | Partnership agreements, billing issues, facility access, contract renewals |
| Clinical | DON, Charge Nurse, Medical Director Liaison, Attending Physician | Patient care coordination, clinical concerns, medication management, care conferences |
| Caregiver | Family Caregiver, Legal Guardian, Power of Attorney | Homebound patient coordination, consent, scheduling preferences |
| Referral | Discharge Planner, Social Worker, Case Manager, MA Plan Coordinator | New patient referrals, transitions of care, hospital discharge coordination |

### 6.3 Primary Contact Designation

Exactly one contact per facility is designated as the primary contact (is_primary = true). The primary contact's name and role appear on the facility card in the grid view and at the top of the detail panel's contact section. Additional contacts are visible only within the detail panel.

### 6.4 Contact Display Rules

Contact information (phone, email) is visible to Admin, Medical Director, and Coordinator roles. Provider role (future phase) sees contact names and roles but not phone numbers or email addresses — providers coordinate through the coordinator rather than contacting facility staff directly, unless explicitly authorized.

---

## 7. Notes & Activity Log

### 7.1 Note Model

The notes system provides a timestamped, append-only activity log for each facility. Notes serve as institutional memory — capturing partnership conversations, visit observations, operational decisions, and clinical context that would otherwise live only in someone's head or scattered across text messages.

### 7.2 Note Types

| Note Type | Purpose | Typical Authors |
|-----------|---------|-----------------|
| General | Default catch-all for any facility-related information | Any role |
| Visit Summary | Post-visit observations, patient status updates, facility conditions | Provider, Coordinator |
| Outreach | Cold outreach attempts, follow-up calls, marketing materials sent | Admin, Coordinator |
| Partnership | Contract discussions, agreement terms, renewal dates, expansion plans | Admin |
| Clinical | Patient care concerns, medication issues, care conference summaries | Provider, Medical Director |
| Administrative | Billing issues, access credentials, parking instructions, facility policies | Coordinator, Admin |

### 7.3 Note Entry

Notes are entered through the detail panel's notes section. The form includes:

- Note type selector (dropdown; defaults to General)
- Content field (plain text; no rich formatting in v1)
- Submit button

Author and timestamp are automatically captured from the authenticated user session. Notes are append-only in v1: no editing or deletion after creation. This preserves the integrity of the activity log as a historical record.

### 7.4 Pinned Notes

Admin users can pin important notes to the top of a facility's timeline. Pinned notes appear above the chronological feed regardless of age. Common use cases for pinned notes: partnership agreement terms, special access instructions, key relationship context for new providers.

### 7.5 Note Display

Notes display in reverse chronological order (newest first) with pinned notes at the top. Each note shows: author name, timestamp, note type badge, and content. The note type badge uses color coding consistent with the type's purpose (e.g., Partnership notes in blue, Clinical notes in teal, Outreach notes in amber).

### 7.6 Future: Note Tagging & Assignments

A future enhancement will support tagging other users in notes (e.g., "@NP2 please follow up on TCM for the 2 post-discharge patients") and assigning action items from notes. This transforms the notes system from a passive log into an active task management layer.

---

## 8. Partnership Pipeline

### 8.1 Pipeline Stages

Every facility relationship progresses through a defined lifecycle. The pipeline tracks this progression with clear stage definitions, enabling Mobile Docs to manage its acquisition funnel with the same rigor applied to sales pipelines in other industries.

| Stage | Definition | Entry Criteria | Exit Criteria | Typical Duration |
|-------|-----------|----------------|---------------|------------------|
| Prospecting | Initial identification and outreach; no patients, no agreement | Facility created in directory | First in-person meeting scheduled or facility declines | 2–8 weeks |
| Onboarding | Agreement in principle or signed; setting up operations, initial patient intake | Meeting completed, partnership terms discussed | First billable patient visit completed | 1–4 weeks |
| Active | Facility has one or more active Mobile Docs patients with ongoing visit cadence | First patient visit billed | All patients discharged or partnership terminated | Indefinite |
| Inactive | No active patients; partnership dormant or terminated | Zero active patients for 60+ consecutive days, or explicit termination | Facility re-enters Prospecting or Onboarding if re-engaged | Indefinite |

### 8.2 Pipeline Transitions

Status changes are logged in the facility_pipeline table with the following fields: from_status, to_status, changed_by, change_reason, and timestamp. This creates a full audit trail of each facility's partnership history.

Transition rules:

- Prospecting → Onboarding: Admin or Coordinator initiates; requires a note documenting the first meeting or agreement
- Onboarding → Active: Automatic when first patient visit is recorded (via Practice Health data integration) OR manual by Admin/Coordinator
- Active → Inactive: Manual by Admin; system prompts for a reason (e.g., "Partnership terminated," "All patients discharged," "Facility closed")
- Inactive → Prospecting: Manual by Admin; used for re-engagement attempts
- Inactive → Active: Manual by Admin; used when patients are re-admitted or new patients added at a previously inactive facility
- Any stage → Archived: Admin only; soft-removes from default views

Reverse transitions (e.g., Onboarding → Prospecting) are permitted for Admin role only, with a required change reason.

### 8.3 Pipeline Dashboard View

The pipeline is visualized in two ways:

1. **Filter chips** on the main directory view — users can filter to see only facilities in a specific stage
2. **Pipeline progress bar** on the facility detail panel — shows the current stage highlighted within the full stage sequence (Prospecting → Onboarding → Active → Inactive), providing at-a-glance context for each facility's relationship maturity

### 8.4 Pipeline Metrics

The summary stats bar on the directory dashboard includes pipeline-specific metrics:

- Active Facilities: count of facilities with status = Active
- Pipeline count: count of facilities with status = Prospecting or Onboarding
- Conversion rate (future): percentage of Prospecting facilities that reached Active within 90 days

---

## 9. Map & Geographic Intelligence

### 9.1 Map Overview

The map view renders all non-archived facilities as interactive pins on an SVG-based map (v1) or embedded Google Map (v2). The map serves three operational purposes: route planning awareness, coverage gap identification, and density analysis for expansion decisions.

### 9.2 Pin Visualization

Each pin encodes three dimensions of information through visual properties:

| Visual Property | Encodes | Mapping |
|----------------|---------|---------|
| Color | Facility type | SNF: deep blue (#0f4c75), Board & Care: green (#1a7a5c), Homebound: purple (#7c5cbf) |
| Size | Active patient count | Radius scales from 6px (0 patients) to 18px (22+ patients) |
| Border style | Pipeline status | Active: solid fill; Onboarding: solid with reduced opacity; Prospecting: dashed border ring; Inactive: faded (30% opacity) |

### 9.3 Service Radius

A 25-mile radius ring centered on HCI base (91101, Pasadena) is rendered as a dashed circle on the map, matching the Mobile Docs service area defined in the executive summary and financial model. The HCI base location is marked with a distinct pin labeled "HCI Base (91101)."

### 9.4 Map Interactions

- **Hover**: Displays a tooltip with facility name, type, patient count, distance, and drive time
- **Click**: Opens the facility detail slide-out panel
- **Legend**: Persistent legend at bottom showing type color mapping and size explanation

### 9.5 Future: Route Optimization View

A future enhancement would add a "Today's Route" view showing only the facilities scheduled for visits on a given date, with driving directions and optimized visit order. This connects to the Mobile Docs Admin Platform's route optimization capability described in HCI's broader platform roadmap.

### 9.6 Future: Coverage Gap Analysis

An advanced map layer would overlay census data from CMS (publicly available SNF and nursing home directories) to show all licensed facilities within the 25-mile radius, with Mobile Docs partner facilities highlighted. Non-partner facilities represent acquisition targets and would display as gray pins with bed count and contact information for outreach planning.

---

## 10. Provider Assignment & Scheduling

### 10.1 Provider Assignment

Each facility has an optional assigned_provider_id linking to the providers table from the Practice Health Module. Assignment indicates which provider is the primary clinician for that facility. In the current roster, NP2 handles all Mobile Docs facilities since NP1 is office-only.

Assignment is managed by Admin and Coordinator roles through the facility detail panel. The assigned provider's name appears on the facility card in the grid view and in the detail panel's provider section.

### 10.2 Visit Cadence

Each facility has a configured visit_cadence field indicating the expected visit rhythm. This is informational in v1 — it displays on facility cards and in the detail panel but does not trigger automated scheduling or alerts.

| Cadence | Typical Use |
|---------|-------------|
| Weekly | High-census SNFs where patient volume justifies a weekly presence |
| Biweekly | Medium-census Board & Care or lower-acuity SNFs |
| Monthly | Homebound patients, low-census or stable facilities |
| Quarterly | Very stable homebound patients, maintenance-only relationships |
| As Needed | Facilities with unpredictable visit patterns |
| TBD | New or prospecting facilities without established cadence |

### 10.3 Last Visit & Next Visit Tracking

The detail panel displays:

- **Last visit date**: derived from the most recent checked-out visit at this facility in Practice Health productivity data (4.06 report), or manually entered if Practice Health data is not yet available
- **Next scheduled visit**: manually entered date representing the next planned visit; displayed on the facility card for at-a-glance scheduling awareness

### 10.4 Future: Visit Cadence Alerts

A future integration with the Practice Health Module's alert system would trigger warnings when a facility's actual visit pattern falls behind its configured cadence. For example, if a facility with "Weekly" cadence has no visit recorded for 10+ days, the system would generate a "Missed Cadence" alert visible on both the Facility Directory and Practice Health dashboards.

---

## 11. Revenue Attribution

### 11.1 Facility-Level Financial Data

The Facility Directory pulls financial metrics from the Practice Health Module to display revenue attribution at the facility level. This connects operational decisions (which facilities to prioritize, where to assign providers) to financial outcomes.

Displayed metrics per facility:

| Metric | Source | Calculation |
|--------|--------|-------------|
| Monthly Charges | PHM charges table (371.02) | SUM(billed_charge) for the current calendar month where facility matches |
| Trailing 30-Day Charges | PHM charges table (371.02) | SUM(billed_charge) for the 30 days ending today where facility matches |
| Visit Count (Month) | PHM productivity table (4.06) | COUNT of completed visits at this facility for the current calendar month |
| Revenue per Visit | Derived | Monthly Charges / Visit Count for the period |
| Revenue per Patient | Derived | Monthly Charges / active_patients from latest census snapshot |

### 11.2 Revenue Display

Revenue data appears in the facility detail panel under a "Revenue" section, visible only to Admin and Medical Director roles. Coordinator and Provider roles do not see financial data, consistent with the Practice Health Module's role-based data visibility principles.

### 11.3 Revenue Ranking

The grid view supports sorting facilities by monthly charges (descending), enabling Admin to quickly identify the highest-value and lowest-value facilities. This sorting option appears alongside the default name-based sort.

---

## 12. Role-Based Access Control

### 12.1 Role Permissions — Facility Directory

| Capability | Admin | Medical Director | Coordinator | Provider (Future) |
|-----------|-------|-----------------|-------------|-------------------|
| View facility directory (grid + map) | Full | Full | Full | Assigned facilities only |
| View facility detail panel | Full | Full | Full (no financials) | Assigned facilities only (no financials) |
| Add new facility | Yes | No | Yes | No |
| Edit facility fields | Yes | No | Yes (non-financial) | No |
| Change facility status | Yes | No | Yes | No |
| Archive facility | Yes | No | No | No |
| View contact details (phone, email) | Yes | Yes | Yes | Name and role only |
| Add/edit contacts | Yes | No | Yes | No |
| Add notes | Yes | Yes | Yes | Yes (own facilities) |
| Pin/unpin notes | Yes | No | No | No |
| Update census | Yes | No | Yes | No |
| View revenue attribution | Yes | Yes | No | No |
| Sort/filter by revenue | Yes | Yes | No | No |

### 12.2 Access Control Implementation

Consistent with the Practice Health Module, access control is enforced at both application and database layers:

- **Application layer**: UI components conditionally render based on user role. Financial columns, revenue sections, and archiving buttons are hidden for unauthorized roles.
- **Database layer**: Supabase Row-Level Security policies on all directory tables. Coordinator and Provider roles have SELECT restricted to non-financial views. Provider role additionally filtered by assigned_provider_id matching auth.uid().

---

## 13. Dashboard Specifications

### 13.1 Navigation

The Facility Directory is a top-level navigation item in the HCI Portal sidebar, listed under the "Administration" section as "Mobile Docs" with a map pin icon. It sits below "Practice Health" in the nav hierarchy.

### 13.2 Summary Header

The top of the directory view displays a row of aggregate metric cards:

| Card | Value | Subtext |
|------|-------|---------|
| Active Facilities | Count of status = Active | "{n} in pipeline" (count of Prospecting + Onboarding) |
| Total Patients | SUM of active_patients across all facilities | "across all locations" |
| Avg Penetration | MEAN of penetration_rate for Active facilities with total_beds > 0 | "of available beds" |
| Monthly Charges | SUM of current month charges across all facilities | "all active facilities" |

### 13.3 Filter Bar

Below the summary header, a horizontal filter bar provides:

- **Search box**: Free-text search across facility name and address
- **Type filter chips**: All | SNF | Board & Care | Homebound (single-select, defaults to All)
- **Status filter chips**: All | Prospecting | Onboarding | Active | Inactive (single-select, defaults to All)
- **View toggle**: Grid | Map (right-aligned)

Active filters are visually highlighted. All filters are combinable (e.g., SNF + Active + search term).

### 13.4 Grid View

Facilities display as cards in a responsive grid (auto-fill, minimum 380px per card). Each card contains:

- **Header**: Type badge (colored), status badge (with dot indicator), facility name, truncated address
- **Metrics row**: Active patients, total beds (or "—" for Homebound), distance in miles
- **Footer**: Assigned provider name, visit cadence, "View →" link

Cards have hover elevation effects and are clickable to open the detail panel. Inactive facilities render at reduced opacity (70%).

### 13.5 Map View

Full-width map container (500px height) with interactive pins as described in Section 9. Includes legend and service radius ring. Pins are clickable to open the detail panel.

### 13.6 Detail Slide-Out Panel

Clicking any facility (from grid or map) opens a slide-out panel from the right edge (520px width). The panel contains the following sections in order:

1. **Header**: Type badge, status badge, facility name, full address, close button
2. **Pipeline progress bar**: Visual indicator of current stage within the four-stage pipeline
3. **Facility Metrics**: 3-column grid (Patients, Beds, Penetration) + 4-column grid (Monthly Charges, Distance, Drive Time, Cadence)
4. **Provider & Schedule**: Assigned provider, next scheduled visit, last visit date
5. **Facility Contact**: Primary contact card with avatar, name, role, phone, email; expandable list of additional contacts
6. **Revenue** (Admin/Medical Director only): Monthly charges, trailing 30-day charges, visit count, revenue per visit, revenue per patient
7. **Notes**: Reverse-chronological timeline with author, date, type badge, and content; "Add Note" button; pinned notes at top

The panel has a semi-transparent overlay behind it and closes on overlay click, close button click, or Escape key press.

---

## 14. Integration with Practice Health Module

### 14.1 Data Flow

The Facility Directory is a consumer of Practice Health Module data, not a producer. Data flows one direction: from PHM → Directory.

| Data Point | Source in PHM | Used in Directory |
|-----------|--------------|-------------------|
| Visit dates per facility | productivity table (4.06) | Last Visit Date display |
| Visit counts per facility | productivity table (4.06) | Revenue Attribution calculations |
| Billed charges per facility | charges table (371.02) | Monthly Charges, Revenue per Visit |
| Provider roster | providers table | Assigned Provider dropdown population |
| Facility registry | facilities table | Linking directory entries to billing data |

### 14.2 Facility Name Matching

The key integration challenge is matching facility names between the Directory (manually entered) and Practice Health data (derived from eCW exports). The matching logic uses a multi-step approach:

1. Exact match on POS code (pos_code in directory ↔ facility_pos in charges/productivity)
2. Fuzzy match on facility name (Levenshtein distance ≤ 3 or containment match)
3. Manual mapping table for facilities where names differ significantly between eCW and the directory (e.g., eCW exports "Huntington Sr Living" while the directory uses "Huntington Senior Living")

Admin can configure manual mappings through a settings interface accessible from the facility detail panel.

### 14.3 AI Insight Integration

When the Practice Health Module's AI Insight Layer generates facility-specific observations (e.g., "Charges at Elegant Care Villa have $0 payments posted — verify claim submission status"), these insights can reference the Facility Directory for additional context. In a future phase, AI insights could incorporate directory data such as census trends, pipeline status, and penetration rates to generate richer recommendations like: "Huntington Senior Living has 86 beds but only 22 Mobile Docs patients (25.6% penetration). Based on the $8,930/month revenue at current census, reaching 35% penetration would add approximately $3,400/month. Recommend scheduling a partnership expansion meeting with Dr. Alvarez."

---

## 15. Future Extensibility

### 15.1 CMS Facility Overlay

The publicly available CMS Nursing Home Compare dataset contains name, address, bed count, quality ratings, and ownership information for every Medicare/Medicaid-certified nursing facility in the United States. Importing this data for the 25-mile service area and overlaying it on the map would instantly show every potential partner facility — with non-partner facilities displayed as gray pins. This transforms the map from an operational tool into a strategic acquisition planning surface.

### 15.2 Referral Source Tracking

Extend the contact model to track which contacts have referred patients to Mobile Docs, with referral counts and dates. This surfaces the highest-value referral relationships and helps prioritize relationship maintenance. Referral sources include: SNF discharge planners, hospital case managers, MA plan care coordinators, family caregivers, and PCP offices.

### 15.3 Facility Scorecarding

Combine Practice Health financial data, census penetration rates, visit cadence compliance, and referral volumes into a composite "Facility Health Score" for each location. The score would rank facilities on a spectrum from "high-value, well-managed partnership" to "underperforming, needs intervention," enabling Admin to allocate attention to the facilities with the highest ROI potential.

### 15.4 Document Management

Attach files to facility records: partnership agreements, credentialing documents, facility policies, parking instructions, access codes. This centralizes operational reference material that currently lives in email attachments or personal folders.

### 15.5 Mobile Provider View

A mobile-optimized view for providers in the field showing today's assigned facilities, driving directions between stops, facility-specific notes and patient context, and one-tap note entry for post-visit summaries. This connects to the Uber-style provider interface described in the Mobile Docs Admin Platform roadmap.

### 15.6 SaaS Generalization

In the SaaS phase (Practice Health Module Phase 4), the Facility Directory generalizes to support any multi-location healthcare practice: home health agencies, mobile dental clinics, traveling therapy groups, and community health programs. The core data model (location + contacts + census + pipeline + notes) is universal across these use cases. Tenant isolation via tenant_id and Row-Level Security is already built into the schema.

---

## 16. Technical Requirements

### 16.1 Technology Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | React | Consistent with HCI Portal and Practice Health Module |
| Backend / Database | Supabase (PostgreSQL) | Shared instance with Practice Health Module; new tables in same schema |
| Geocoding | Google Geocoding API | Address → lat/lng conversion on facility creation/update |
| Distance Calculation | Google Distance Matrix API | Driving distance and time from HCI base; Haversine fallback |
| Map Rendering | SVG-based (v1), Google Maps embed (v2) | v1 uses lightweight SVG for fast rendering; v2 upgrades to interactive tile map |
| Hosting | Netlify (frontend) + Supabase (backend) | Consistent with existing infrastructure |
| IDE | Cursor AI | Development environment with PRD integration |

### 16.2 HIPAA Compliance

The Facility Directory does not store Protected Health Information. Specific safeguards:

- No patient names, DOBs, diagnoses, or medical record numbers are stored in any directory table
- Homebound patient locations use last-name-only aliases ("Williams Residence"), not full patient names
- Census data is aggregate counts only — no individual patient identifiers
- Notes system explicitly prohibits entry of patient-identifiable information; a UI warning reminds users to "avoid including patient names, DOBs, or medical details in notes"
- Contact records contain facility staff and caregiver information, not patient information
- All data transmission uses HTTPS/TLS encryption
- Supabase Row-Level Security enforces role-based data isolation

### 16.3 Performance Requirements

- Directory load time (grid view): < 1.5 seconds for up to 200 facilities
- Map render time: < 2 seconds for up to 200 pins
- Geocoding on facility creation: < 3 seconds
- Detail panel open: < 500ms
- Search/filter response: < 200ms (client-side filtering for datasets under 500 facilities)

### 16.4 Data Retention

- Facility records: retained indefinitely (soft-delete via archive)
- Contact records: retained indefinitely; editable
- Notes: retained indefinitely; append-only
- Census snapshots: retained indefinitely for trend analysis
- Pipeline transition logs: retained indefinitely for audit trail
- Geocoding cache: refreshed on address change; no expiration

---

## 17. Success Metrics

### 17.1 Launch Criteria

- All active Mobile Docs facilities and homebound patients migrated from existing spreadsheets into the directory
- Primary contact information verified for all active facilities
- Current patient census entered for all active facilities
- At least one note per active facility capturing key partnership context
- Map view rendering all facilities with correct geocoding
- Revenue attribution displaying correctly for facilities with Practice Health data

### 17.2 Ongoing Operational Metrics

- **Directory completeness**: percentage of active facilities with complete data (contact, census, assigned provider, visit cadence)
- **Note activity**: average notes per facility per month (target: ≥ 2 for active facilities)
- **Census freshness**: percentage of active facilities with census updated in the last 30 days (target: > 90%)
- **Pipeline velocity**: average days from Prospecting → Active for facilities that convert
- **Coverage utilization**: percentage of facilities within 25-mile radius that are Mobile Docs partners (vs. total licensed facilities in area)
- **Penetration growth**: month-over-month change in average penetration rate across active SNF and Board & Care facilities

---

*HCI Medical Group — Mobile Docs Facility Directory PRD v1.0 — March 2026*
