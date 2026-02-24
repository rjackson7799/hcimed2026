# Product Requirements Document (PRD)
## HCI Medical Group — Patient Outreach Tracking System

**Version:** 1.0  
**Date:** February 24, 2026  
**Author:** HCI Medical Group  
**Status:** Ready for Development  

---

## 1. Overview

### 1.1 Product Summary
A web-based patient outreach tracking module hosted within the HCI Medical Group admin portal (hcimed.com). The initial use case is tracking staff outreach to patients who need to transition their insurance from **Optum to Regal IPA**. The system is designed as the first module in a scalable admin backend that will eventually support additional operational functions (vacation requests, AI-assisted workflows, etc.).

### 1.2 Business Context
HCI Medical Group is an internal medicine practice in Pasadena, CA serving Medicare beneficiaries. The practice is undergoing a strategic pivot to the Mobile Docs house call service model. As part of this transition, a significant cohort of patients must be migrated from Optum to Regal IPA. This requires organized, trackable outreach by staff with handoff to an insurance broker for patients who agree to switch.

### 1.3 Success Metrics
- 100% of uploaded patients contacted within target timeframe
- Real-time visibility into outreach progress for admin
- Seamless handoff to insurance broker with full context
- Zero dropped patients (every patient has a clear status)
- Staff accountability through timestamped activity logs

---

## 2. Users & Roles

### 2.1 Admin
- **Who:** Practice leadership (Ryan / Dr. Jackson)
- **Access Level:** Full system access
- **Key Activities:**
  - Create and manage outreach projects
  - Upload patient demographic CSV files
  - Assign staff to projects
  - View real-time dashboards and progress reports
  - Manage user accounts (staff, brokers)
  - Export data and reports

### 2.2 Staff
- **Who:** Office staff making outreach calls
- **Access Level:** Project-scoped; can only see assigned patients
- **Key Activities:**
  - View assigned patient call list
  - See who has/hasn't been called (with visual indicators)
  - One-tap call logging with automatic timestamp
  - Record patient disposition (quick-select buttons)
  - Add free-text notes per outreach attempt
  - Forward patient to broker (triggers email with patient info + notes)

### 2.3 Broker
- **Who:** External insurance broker assisting with patient transitions
- **Access Level:** Read-only on forwarded patients; can update status and message staff/admin
- **Key Activities:**
  - View patients forwarded to them with full outreach history
  - Update patient transition status (In Progress, Completed, Unable to Complete)
  - Add broker notes
  - Message staff/admin with questions or updates

---

## 3. Core Workflows

### 3.1 Project Setup (Admin)
```
Admin logs in → Creates new project ("Optum to Regal IPA Migration")
→ Uploads patient CSV → System parses and validates data
→ Admin assigns staff members to project
→ Dashboard populates with patient list and zero-state metrics
```

**CSV Format (minimum required fields):**
| Field | Type | Required |
|-------|------|----------|
| first_name | string | Yes |
| last_name | string | Yes |
| date_of_birth | date | Yes |
| phone_primary | string | Yes |
| phone_secondary | string | No |
| address | string | No |
| city | string | No |
| zip_code | string | No |
| current_insurance | string | No |
| member_id | string | No |
| notes | string | No |

### 3.2 Outreach Workflow (Staff)
```
Staff logs in → Sees patient queue (sorted: uncalled first, then by last name)
→ Clicks patient row to expand or open detail
→ Clicks "Log Call" → System auto-timestamps
→ Selects disposition:
    • "Not Interested" (orange)
    • "Needs More Info" (yellow)
    • "Will Switch" (green)
    • "No Answer / Voicemail" (gray)
    • "Wrong Number / Disconnected" (red)
→ Adds optional notes (e.g., "Patient asked about copay differences")
→ If "Will Switch": "Forward to Broker" button becomes prominent
→ Clicks "Forward to Broker" → System sends email to broker with:
    - Patient name, DOB, phone, member ID
    - All outreach notes and disposition history
    - Staff member name
→ Patient status updates to "Forwarded to Broker"
```

### 3.3 Broker Handoff Workflow
```
Broker receives email notification with patient details
→ Broker logs into portal → Sees forwarded patient list
→ Opens patient → Views full outreach history
→ Updates status:
    • "In Progress" — broker is actively working the transition
    • "Completed" — patient successfully transitioned
    • "Unable to Complete" — with reason notes
→ Admin sees real-time broker progress on dashboard
```

### 3.4 Reporting & Monitoring (Admin)
```
Admin views dashboard → Sees at-a-glance metrics:
    - Total patients / Called / Uncalled
    - Disposition breakdown (pie or bar chart)
    - Staff activity (calls per staff member per day)
    - Broker pipeline (forwarded / in progress / completed)
    - Timeline view (calls per day over project life)
→ Can filter by: staff member, disposition, date range
→ Can export filtered data to CSV/Excel
```

---

## 4. Feature Specifications

### 4.1 Authentication & Authorization
- **Supabase Auth** with email/password login
- Role-based access control (admin, staff, broker)
- Login page at `/admin` or `/portal` on hcimed.com
- Session management with automatic timeout (30 min idle)
- Password reset flow via email

### 4.2 Project Management (Admin Only)
- Create project with name, description, target dates
- Upload patient CSV with validation and error reporting
  - Show preview of parsed data before confirming import
  - Flag duplicates (matching on name + DOB)
  - Report invalid/missing required fields
- Assign/unassign staff to projects
- Archive completed projects (soft delete)
- Support multiple concurrent projects (future-proofing)

### 4.3 Patient List View (Staff)
- **Default sort:** Uncalled patients first, then alphabetical by last name
- **Visual status indicators:**
  - 🔵 Not Yet Called
  - 🟡 Needs More Info (callback required)
  - 🟢 Will Switch
  - 🟠 Not Interested
  - ⚪ No Answer / Voicemail
  - 🔴 Wrong Number / Disconnected
  - 🟣 Forwarded to Broker
- **Search:** Real-time search by patient name, phone, or member ID
- **Filters:** By disposition status, by date of last contact
- **Columns:** Name, Phone, Status, Last Contact Date, # Attempts, Assigned Staff
- **Quick actions per row:**
  - "Log Call" button (one-tap, auto-timestamp)
  - "View History" expand/accordion

### 4.4 Call Logging Interface
- **Auto-timestamp:** Captures date + time on "Log Call" click
- **Disposition selector:** Large, color-coded buttons for one-tap selection:
  - Not Interested
  - Needs More Info
  - Will Switch
  - No Answer / Voicemail
  - Wrong Number / Disconnected
- **Notes field:** Free-text, 500 char max, optional
- **"Forward to Broker" button:** Only appears when disposition = "Will Switch"
  - Confirmation modal: "Forward [Patient Name] to broker? This will send an email with patient details and your notes."
- **Call history:** Visible below current call form; shows all previous attempts with timestamps, dispositions, notes, and which staff member made the call

### 4.5 Broker Portal
- Filtered view: only patients forwarded to broker
- Patient detail view with full outreach history (read-only)
- Status update dropdown:
  - In Progress
  - Completed
  - Unable to Complete
- Broker notes field
- Simple messaging: broker can leave a note visible to staff/admin (not real-time chat; think comment thread)

### 4.6 Admin Dashboard
- **Summary Cards (top row):**
  - Total Patients
  - Called (count + %)
  - Uncalled (count + %)
  - Will Switch (count + %)
  - Forwarded to Broker (count + %)
  - Completed Transitions (count + %)
- **Charts:**
  - Disposition breakdown (donut chart)
  - Daily call volume (bar chart, by staff member)
  - Pipeline funnel (Uncalled → Called → Will Switch → Forwarded → Completed)
- **Staff Activity Table:**
  - Staff name, calls today, calls this week, total calls, avg calls/day
- **Broker Pipeline Table:**
  - Forwarded count, In Progress, Completed, Unable to Complete
- **Filters:** Date range, staff member, disposition
- **Export:** CSV download of filtered patient list with all outreach data

### 4.7 Email Notifications
- **Broker Forward Email:**
  - Triggered when staff clicks "Forward to Broker"
  - Contains: patient name, DOB, phone(s), member ID, address, all outreach notes, staff name
  - Sent to configured broker email address
  - Use Supabase Edge Functions or a simple email service (Resend, SendGrid)
- **Optional future:** Daily summary email to admin with progress stats

### 4.8 User Management (Admin Only)
- Create/edit/deactivate user accounts
- Assign roles (admin, staff, broker)
- View login activity
- Reset passwords for other users

---

## 5. Technical Architecture

### 5.1 Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite or Next.js) |
| UI Library | Tailwind CSS + shadcn/ui |
| Backend/DB | Supabase (PostgreSQL + Auth + Edge Functions + Realtime) |
| Email | Supabase Edge Functions + Resend (or SendGrid) |
| Hosting | Netlify (already in use for hcimed.com) |
| State Management | React Query (TanStack Query) for server state |

### 5.2 Supabase Features Used
- **Auth:** Email/password authentication with role metadata
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Realtime:** Subscribe to outreach_logs and patient status changes for live dashboard updates
- **Edge Functions:** Email sending on broker forwarding
- **Storage:** CSV file uploads (optional; can process client-side)

### 5.3 Row Level Security (RLS) Policy Summary
| Table | Admin | Staff | Broker |
|-------|-------|-------|--------|
| projects | CRUD | Read (assigned) | Read (assigned) |
| patients | CRUD | Read (assigned project) | Read (forwarded only) |
| outreach_logs | Read all | Create + Read own | Read (forwarded patients) |
| users | CRUD | Read own profile | Read own profile |
| broker_updates | Read all | Read (own patients) | CRUD (own assignments) |

### 5.4 Routing Structure
```
/portal                → Login page
/portal/admin          → Admin dashboard
/portal/admin/projects → Project management
/portal/admin/users    → User management
/portal/staff          → Staff patient list + call logging
/portal/broker         → Broker forwarded patients view
```

---

## 6. UI/UX Requirements

### 6.1 Design System
- **Color palette:** Blue primary (#2563EB), consistent with HCI Medical Group branding
- **Component library:** shadcn/ui for consistency and speed
- **Typography:** Inter or system fonts
- **Layout:** Responsive, desktop-first for admin/staff, mobile-friendly for broker
- **Cards, tables, modals** — clean medical-professional aesthetic matching existing HCI/Mobile Docs design language

### 6.2 Key UX Principles
- **One-tap call logging:** Minimize clicks to log an outreach attempt
- **Visual status at a glance:** Color-coded badges/dots so staff can instantly see queue status
- **Progressive disclosure:** Patient list shows summary; click to expand full detail and history
- **Real-time updates:** Dashboard refreshes without page reload (Supabase Realtime subscriptions)
- **Forgiving inputs:** Auto-save notes on blur; confirmation modals on destructive actions

### 6.3 Responsive Behavior
- **Desktop (1024px+):** Full dashboard with side nav, data tables, charts
- **Tablet (768-1023px):** Collapsible nav, stacked cards
- **Mobile (<768px):** Bottom tab bar, card-based patient list, simplified charts

---

## 7. Data & Privacy

### 7.1 PHI Handling
- All patient data is Protected Health Information (PHI) under HIPAA
- Supabase project must be configured with appropriate security settings
- All data in transit via HTTPS; at rest encrypted by Supabase (AES-256)
- No patient data in URL parameters or browser local storage
- Session timeout after 30 minutes of inactivity
- Audit log of all data access and modifications

### 7.2 Data Retention
- Project data retained for duration of project + 7 years (HIPAA requirement)
- Archived projects are soft-deleted (hidden from UI, retained in DB)
- CSV uploads processed and stored in DB; raw files can be purged after import

---

## 8. MVP Scope vs. Future Phases

### MVP (Build Now)
- [x] Auth with 3 roles (admin, staff, broker)
- [x] Project creation + CSV upload
- [x] Patient list with search/filter/sort
- [x] One-tap call logging with disposition + notes
- [x] Forward to broker (email trigger)
- [x] Admin dashboard with summary metrics + charts
- [x] Staff activity tracking
- [x] Broker status updates
- [x] CSV export

### Phase 2 (Near-term)
- [ ] Multi-project support with project switching
- [ ] Auto-assignment of patients to staff (round-robin or geographic)
- [ ] Scheduled callback reminders (patient said "call me next Tuesday")
- [ ] SMS integration (send patient a text before/after call)
- [ ] Daily/weekly summary emails to admin

### Phase 3 (Platform Expansion)
- [ ] Vacation request module
- [ ] AI-powered call scripts / suggested responses
- [ ] Integration with eClinicalWorks for patient data sync
- [ ] Additional outreach project types (AWV reminders, CCM enrollment, etc.)
- [ ] Mobile Docs SaaS integration (shared patient database)

---

## 9. Acceptance Criteria

### Project Creation
- Admin can create a project with name and description
- Admin can upload a CSV; system validates and shows preview before import
- Duplicate patients (same name + DOB) are flagged, not silently duplicated
- Invalid rows are reported with specific error messages

### Call Logging
- Staff clicks "Log Call" and system records timestamp accurate to the second
- Disposition is required before saving (cannot save without selecting one)
- Notes are optional and limited to 500 characters
- Multiple call attempts per patient are supported and displayed chronologically

### Broker Forwarding
- "Forward to Broker" only available for patients with "Will Switch" disposition
- Email is sent within 60 seconds of clicking forward
- Email contains all required patient info + full outreach history
- Patient status automatically updates to "Forwarded to Broker"

### Dashboard
- All metrics update within 5 seconds of underlying data change
- Charts are interactive (hover for details)
- Filters apply to all dashboard components simultaneously
- Export produces a valid CSV with all visible columns

---

## 10. Open Questions

1. **Broker email address:** Single broker email or multiple brokers per project?
2. **Patient phone number validation:** Should we verify phone format on CSV upload?
3. **Concurrent editing:** If two staff members view the same patient, do we need conflict resolution?
4. **Audit trail depth:** Do we need to log every page view or just data modifications?
5. **Domain routing:** Will the portal live at `hcimed.com/portal` or a subdomain like `portal.hcimed.com`?
