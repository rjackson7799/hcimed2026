# Staff Calendar & Time-Off Management — Design Spec

**Date:** 2026-03-22
**Status:** Draft
**Module prefix:** `cal_`

## Problem

HCI Medical Group has a small team (under 10) including two part-time NPs with different schedules:
- **Bap** — Monday, Thursday, Friday
- **Apple Evangelista** — Tuesday, Wednesday, Thursday

The practice has no visibility into daily staffing or coverage gaps in the portal. Time-off requests are handled informally. The admin needs a centralized view of who's working when, and a structured approval workflow for vacation/PTO requests requiring sign-off from both Admin and Medical Director (Dr. Jackson).

## Scope

**In scope:**
- Recurring weekly schedule management (admin sets which days each person works)
- Monthly calendar view showing daily staffing
- "Who's In Today?" quick-reference card
- Coverage gap detection (days with zero provider coverage)
- One-off schedule overrides (working extra days, out for holidays)
- Time-off request submission with dual approval (Admin + Medical Director)
- Email notifications for request submission and decisions
- Request withdrawal by the requester (while still pending)
- HIPAA audit logging for all schedule changes

**Out of scope:**
- Individual patient appointments (stays in eClinicalWorks)
- Service line block scheduling (e.g., "AM = Mobile Docs, PM = Office")
- Integration with external calendar systems (Google Calendar, Outlook)
- Patient-facing scheduling or booking
- Partial-day time off (half days) — may be added in a future iteration
- PTO balance tracking

## Database Schema

Three new Supabase tables using the `cal_` prefix.

### `cal_staff_schedules`

Recurring weekly schedule per staff member.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| profile_id | uuid | FK → profiles, NOT NULL |
| day_of_week | smallint | 0-6 (Sun-Sat), NOT NULL |
| is_working | boolean | default true |
| start_time | time | default '08:00' |
| end_time | time | default '17:00' |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

- UNIQUE on (profile_id, day_of_week)
- INDEX on (profile_id)
- RLS: all authenticated SELECT; admin-only INSERT/UPDATE/DELETE

### `cal_time_off_requests`

Time-off requests with dual-approval columns.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| requester_id | uuid | FK → profiles, NOT NULL |
| start_date | date | NOT NULL |
| end_date | date | NOT NULL, >= start_date |
| time_off_type | enum | vacation, sick, personal, cme |
| notes | text | optional |
| status | enum | pending, approved, denied, withdrawn; default pending |
| admin_status | enum | pending/approved/denied, default pending |
| admin_reviewed_by | uuid | FK → profiles, nullable |
| admin_reviewed_at | timestamptz | nullable |
| admin_notes | text | nullable |
| director_status | enum | pending/approved/denied, default pending |
| director_reviewed_by | uuid | FK → profiles, nullable |
| director_reviewed_at | timestamptz | nullable |
| director_notes | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

- INDEX on (start_date, end_date)
- INDEX on (requester_id)
- RLS: all authenticated SELECT; users INSERT own; users UPDATE own rows ONLY when status='pending' AND only the `status` column (to 'withdrawn'); admins and users with title='Medical Director' can UPDATE approval columns

### `cal_schedule_overrides`

One-off changes to the recurring schedule.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| profile_id | uuid | FK → profiles, NOT NULL |
| override_date | date | NOT NULL |
| is_working | boolean | NOT NULL |
| reason | text | optional |
| created_by | uuid | FK → profiles, NOT NULL |
| created_at | timestamptz | default now() |

- UNIQUE on (profile_id, override_date)
- INDEX on (override_date)
- RLS: all authenticated SELECT; admin-only mutations

### Database View: `v_cal_time_off_effective`

A view that computes effective status from the dual-approval columns, used by all queries:

```sql
CREATE VIEW v_cal_time_off_effective AS
SELECT *,
  CASE
    WHEN status = 'withdrawn' THEN 'withdrawn'
    WHEN admin_status = 'denied' OR director_status = 'denied' THEN 'denied'
    WHEN admin_status = 'approved' AND director_status = 'approved' THEN 'approved'
    ELSE 'pending'
  END AS effective_status
FROM cal_time_off_requests;
```

This centralizes the approval logic so all components and queries use the same calculation.

## Medical Director Identification

The existing `profiles` table has a `title` field. The `USER_TITLE` enum in `enums.ts` already includes `'Medical Director'`. Dr. Jackson's profile has `title = 'Medical Director'`.

**Authorization rule:** Users with `profile.title = 'Medical Director'` can:
- See the "Pending Approvals" tab
- Write the `director_status`, `director_reviewed_by`, `director_reviewed_at`, `director_notes` columns
- Receive email notifications for new time-off requests

This avoids adding a new role to the system and uses existing data.

## User Interface

### Route: `/admin/calendar`
Follows existing portal convention where multi-role pages live under `/admin/*` (like `/admin/awv-tracker`). Accessible to admin, staff, provider roles via RoleGuard.

### Page Layout: Tabs

| Tab | Visible To | Content |
|-----|-----------|---------|
| Calendar | All | TodayStaffCard + CoverageGapAlert + MonthlyCalendar + DayDetail |
| My Time Off | All | TimeOffRequestList + "Request Time Off" button + withdraw option |
| Pending Approvals | Admin + Medical Director (by title) | PendingApprovalsTable with approve/deny actions |
| Manage Schedules | Admin only | WeeklyScheduleEditor per staff member |

### Components

| Component | Description |
|-----------|-------------|
| MonthlyCalendar | Month grid; day cells show initials of working staff, red highlight for coverage gaps |
| DayDetail | Side panel for selected day: who's working (with times), who's off (with reason) |
| TodayStaffCard | Card at top: today's working staff with name and role badge |
| CoverageGapAlert | Warning banner for upcoming days with no provider coverage |
| WeeklyScheduleEditor | Admin: Mon-Fri checkboxes + time pickers per staff member |
| ScheduleOverrideDialog | Admin: add one-off override for a specific date |
| TimeOffRequestForm | Date range, type dropdown, notes textarea |
| TimeOffRequestList | Table of own requests with effective status badges, withdraw button for pending |
| PendingApprovalsTable | Pending requests with requester name, dates, type, approve/deny buttons |
| ApprovalDialog | Confirmation with optional notes field |
| CalendarLegend | Color key: working (default), time off (yellow), coverage gap (red) |

## Time-Off Approval Workflow

1. Staff submits request → creates row with status=pending, admin_status=pending, director_status=pending
2. API sends email to all admin-role users + users with title='Medical Director' via Resend
3. Admin and Medical Director review independently in "Pending Approvals" tab
4. Each sets their status column to approved/denied with optional notes
5. Effective status (computed by DB view):
   - `withdrawn` → withdrawn (requester cancelled)
   - Either denied → **denied**
   - Both approved → **approved** (shows on calendar)
   - Otherwise → **pending**
6. Only fully-approved requests appear as time-off on the calendar
7. Email notification to requester on each decision

### Edge Cases

- **Requester withdraws:** Requester can set `status = 'withdrawn'` on their own pending requests. This is a soft delete — the row stays for audit trail.
- **Request date passes while pending:** Stale requests are NOT auto-expired. Admin can deny manually. The "Pending Approvals" tab sorts oldest-first so stale requests are visible.
- **Admin edits an approved request:** Not supported in v1. If dates need to change, the request must be withdrawn and a new one submitted. This avoids complex re-approval logic.

## API Functions

| Endpoint | Trigger | Action |
|----------|---------|--------|
| `api/time-off-notify.ts` | Request submitted | Email approvers via Resend |
| `api/time-off-decision.ts` | Request approved/denied | Email requester, log to audit_log |

Both follow the pattern established in `api/send-broker-email.ts`.

## Audit Logging

All mutations logged to existing `audit_log` table:
- SCHEDULE_UPDATED, SCHEDULE_OVERRIDE_CREATED
- TIME_OFF_REQUESTED, TIME_OFF_WITHDRAWN, TIME_OFF_APPROVED, TIME_OFF_DENIED

## Validation

Zod schema at `schemas/timeOffRequestSchema.ts`:
- start_date, end_date (YYYY-MM-DD strings)
- time_off_type (vacation | sick | personal | cme)
- notes (optional, max 500 chars)
- Constraint: end_date >= start_date

## File Inventory

| Path | Action |
|------|--------|
| `docs/migrations/2026-03-staff-calendar-tables.sql` | New: SQL migration |
| `apps/portal/src/types/staff-calendar.ts` | New: TypeScript types |
| `apps/portal/src/types/database.ts` | Modify: add cal_ tables |
| `apps/portal/src/schemas/timeOffRequestSchema.ts` | New: Zod schema |
| `apps/portal/src/hooks/useStaffCalendar.ts` | New: query hooks |
| `apps/portal/src/hooks/useStaffCalendarMutations.ts` | New: mutation hooks |
| `apps/portal/api/time-off-notify.ts` | New: email API |
| `apps/portal/api/time-off-decision.ts` | New: decision email API |
| `apps/portal/src/components/staff-calendar/*.tsx` | New: 11 components |
| `apps/portal/src/pages/StaffCalendarPage.tsx` | New: page component |
| `apps/portal/src/App.tsx` | Modify: add /admin/calendar route |
| `apps/portal/src/components/layout/PortalSidebar.tsx` | Modify: add nav item |

## Future Considerations (not in this spec)

- Service line block scheduling (AM/PM assignments)
- Partial-day time off (half days)
- Patient-facing scheduling integration
- Google Calendar / Outlook sync
- PTO balance tracking
- Recurring time-off (e.g., every other Friday)
- Auto-expiry of stale pending requests
