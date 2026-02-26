# Development Progress

Tracking document for Pasadena Health Hub (hcimed.com) development.

**Last updated:** 2026-02-25

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

### Known Issues / Recent Fixes

- Fixed careers form auto-submit bug on Step 5 (2026-01-12)
- Fixed careers form resume requirement and early submission (2026-01-12)
- Fixed Resend email from address to use verified domain (2026-01-12)
- Fixed user deactivation status not updating in UI (2026-02-25) — RLS policy + optimistic cache fix
- Added hard-delete for inactive users with audit log preservation (2026-02-25)

---

## Upcoming Development Tasks

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
