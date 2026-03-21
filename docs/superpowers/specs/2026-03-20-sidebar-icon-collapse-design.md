# Sidebar Icon-Collapse Optimization

**Date:** 2026-03-20
**Status:** Approved
**Scope:** Portal sidebar (`apps/portal/src/components/layout/PortalSidebar.tsx`)

## Problem

The portal sidebar uses shadcn's default `collapsible="offcanvas"` mode, which slides the sidebar completely off-screen when collapsed. This wastes space and removes all navigation affordance — users lose visual orientation and must re-open the sidebar to navigate.

## Solution

Switch to shadcn's built-in `collapsible="icon"` mode, which collapses the sidebar to a 48px icon rail showing only navigation icons, the HCI logo badge, and the user avatar.

## Changes

### 1. Sidebar Collapsible Mode

**File:** `apps/portal/src/components/layout/PortalSidebar.tsx`

Change `<Sidebar className="border-r-0">` to `<Sidebar collapsible="icon" className="border-r-0">`.

This enables:
- Collapsed state shrinks sidebar to 48px (`SIDEBAR_WIDTH_ICON = "3rem"`)
- Nav item labels auto-hide (built into `SidebarMenuButton` — text clips inside fixed `!size-8` button)
- Group labels ("Administration", "Staff View") animate out via `-mt-8` + `opacity-0` (built into `SidebarGroupLabel`)
- Toggle via `Ctrl+B` / `SidebarTrigger` button continues to work
- Cookie-based state persistence continues to work
- Mobile sheet (offcanvas drawer) behavior is unaffected

**Tooltips:** `SidebarMenuButton` only renders tooltips when the `tooltip` prop is explicitly passed. Add `tooltip={item.title}` to every `SidebarMenuButton` in `renderNavGroup`, and `tooltip="Sign Out"` to the Sign Out button in the footer.

### 2. Header — Collapsed State

**File:** `apps/portal/src/components/layout/PortalSidebar.tsx`

Wrap the header text elements with `group-data-[collapsible=icon]:hidden` so only the HCI badge (32x32 square) remains visible when collapsed:

- **Admin/Staff/Provider:** Hide "HCI Portal" and role subtitle; keep the `HCI` badge visible and centered
- **Broker:** Hide "Broker Access" text; constrain the broker `<img>` to `w-8 h-8 object-contain` in collapsed state via `group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8` so it fits the 48px rail

### 3. Footer — Collapsed State

**File:** `apps/portal/src/components/layout/PortalSidebar.tsx`

Wrap the footer text elements with `group-data-[collapsible=icon]:hidden`:

- **User avatar** (circle with first initial): stays visible, centers in rail
- **Name and email text:** hidden via `group-data-[collapsible=icon]:hidden`
- **Sign Out button:** icon stays visible (label auto-hides since it's inside `SidebarMenuButton`)

## Files Modified

| File | Change |
|------|--------|
| `apps/portal/src/components/layout/PortalSidebar.tsx` | Add `collapsible="icon"`, add `tooltip` props to nav buttons, add hide classes to header/footer text, constrain broker logo |

## Files NOT Modified

- `packages/shared/ui/sidebar.tsx` — no changes (shadcn auto-generated, icon mode already built in)
- `apps/portal/src/components/layout/AppShell.tsx` — no changes needed
- `apps/portal/src/components/layout/TopBar.tsx` — `SidebarTrigger` works with icon mode as-is
- `apps/portal/src/components/layout/MobileNav.tsx` — unaffected (mobile-only)

## Behavior Summary

| State | Sidebar Width | Header | Nav Items | Footer |
|-------|--------------|--------|-----------|--------|
| Expanded | 256px | HCI badge + "HCI Portal" + role | Icon + label | Avatar + name + email + Sign Out |
| Collapsed | 48px | HCI badge only | Icon only (tooltip on hover) | Avatar + Sign Out icon |
| Mobile | Sheet overlay (288px) | Same as expanded | Same as expanded | Same as expanded |
