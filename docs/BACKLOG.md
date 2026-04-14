# Backlog

Deferred features, improvements, and known issues — tracked here to keep [PROGRESS.md](../PROGRESS.md) focused on active work.

**Last updated:** 2026-03-12

---

## Portal — Mobile Responsiveness

The admin dashboard layout (sidebar, charts, cards) is mobile-friendly, but several tables and components need work for phone-sized screens. The medical director frequently views the dashboard on mobile.

- [ ] **AdminUsersPage table overflow** (High) — `src/portal/pages/AdminUsersPage.tsx`
  - No `overflow-x-auto` wrapper and no responsive column hiding — table overflows off-screen on phones
  - Fix: add scroll wrapper + hide less-critical columns (Phone, Company, Joined) with `hidden sm:table-cell` / `hidden md:table-cell`

- [ ] **StaffActivityTable — no column hiding** (Medium) — `src/portal/components/admin/StaffActivityTable.tsx`
  - Has `overflow-x-auto` but shows all 6 columns on every screen size
  - Fix: hide secondary columns on mobile breakpoints

- [ ] **AuditLogViewer table density** (Medium) — `src/portal/components/admin/AuditLogViewer.tsx`
  - Only hides 1 column (`hidden lg:table-cell` on Details), still shows 5+ columns on small screens
  - Fix: hide Record ID and Table columns on small breakpoints

- [ ] **Summary cards cramped on small phones** (Low) — `src/portal/components/admin/SummaryCards.tsx`
  - 2-column grid for 6 cards gets tight on screens < 360px
  - Fix: switch to single-column grid below `xs` or reduce card padding

- [ ] **Fixed chart heights** (Low) — `src/portal/components/admin/DispositionChart.tsx`, `DailyCallChart.tsx`
  - Both use fixed `height={280}` — works but feels cramped in landscape orientation
  - Fix: use responsive height or reduce on mobile

---

## Portal — General Enhancements

- [ ] _Add tasks here_

---

## Public Site

- [ ] _Add tasks here_

---

## Practice Health Module

- [ ] _Add tasks here_

---

## Content & Blog

- [ ] _Add tasks here_

---

## Infrastructure / DevOps

- [ ] _Add tasks here_
