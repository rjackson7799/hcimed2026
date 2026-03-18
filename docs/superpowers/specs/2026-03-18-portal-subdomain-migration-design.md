# Portal Subdomain Migration — Design Spec

**Date:** 2026-03-18
**Status:** Draft
**Subdomain:** `portal.hcimed.com`

---

## Context

The HCI patient outreach portal currently lives inside the public marketing site (`hcimed.com`) as a set of `/portal/*` routes in a single-page application. This creates two problems:

1. **Security:** Portal dependencies (Supabase client, auth logic) are bundled into the public site's JavaScript and shipped to every visitor, even though only <10 internal users access the portal. Note: the Supabase anon key is public-safe by design (RLS is the security boundary), but exposing the full Supabase SDK and auth flow to the public site unnecessarily increases attack surface.
2. **Performance:** Portal-specific packages (supabase-js, recharts, papaparse, leaflet, @react-pdf/renderer, @anthropic-ai/sdk) inflate the public site's dependency tree and total bundle, even with lazy loading.

Moving the portal to `portal.hcimed.com` as a separate Vercel project eliminates both issues while keeping a single Git repository for ease of maintenance.

---

## Approach: Bun Workspace Monorepo

Restructure the existing repo into a Bun workspace monorepo with two apps and one shared package:

```
pasadena-health-hub/
├── apps/
│   ├── public/                    # Marketing site → hcimed.com
│   │   ├── src/                   # Current src/ minus src/portal/
│   │   │   ├── components/        # Public components (layout, blog, careers, etc.)
│   │   │   ├── config/            # seo.ts, site.ts
│   │   │   ├── content/           # Blog markdown
│   │   │   ├── context/           # AccessibilityContext only
│   │   │   ├── hooks/             # use-mobile, use-toast
│   │   │   ├── lib/               # blog.ts, schemas/
│   │   │   ├── pages/             # Public route pages
│   │   │   ├── types/             # Public types
│   │   │   ├── App.tsx            # Public routes + portal redirects
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── api/                   # Public API functions
│   │   │   ├── request-appointment.ts
│   │   │   ├── send-email.ts
│   │   │   └── submit-application.ts
│   │   ├── public/                # Static assets, favicons, robots.txt
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── vercel.json
│   │   ├── tailwind.config.ts     # Extends @hci/shared/tailwind
│   │   ├── tsconfig.json
│   │   └── package.json           # Public-only deps (no supabase, recharts, etc.)
│   │
│   └── portal/                    # Internal portal → portal.hcimed.com
│       ├── src/
│       │   ├── components/        # All portal components (admin, auth, broker, staff, etc.)
│       │   ├── context/           # AuthContext, ProjectContext
│       │   ├── hooks/             # 38+ React Query hooks
│       │   ├── lib/               # supabase.ts, csv.ts, export.ts, parsers, constants
│       │   ├── pages/             # Portal route pages
│       │   ├── schemas/           # Zod validation schemas
│       │   ├── types/             # database.ts, enums, module types
│       │   ├── utils/             # constants.ts, formatters.ts
│       │   ├── App.tsx            # Portal-only routes
│       │   ├── main.tsx           # Portal entry point
│       │   └── index.css          # Portal styles (imports shared tokens)
│       ├── api/                   # Portal API functions
│       │   ├── send-broker-email.ts
│       │   ├── invite-user.ts
│       │   ├── delete-user.ts
│       │   ├── deactivate-user.ts
│       │   ├── audit-log.ts
│       │   ├── awv-upload.ts
│       │   ├── generate-insights.ts
│       │   ├── practice-health-summary.ts
│       │   └── cron/practice-health-report.ts
│       ├── public/                # Portal static assets (minimal)
│       ├── index.html             # No SEO tags, no GA
│       ├── vite.config.ts
│       ├── vercel.json            # HIPAA-hardened headers, noindex, cron jobs
│       ├── tailwind.config.ts     # Extends @hci/shared/tailwind
│       ├── tsconfig.json
│       └── package.json           # Portal deps (supabase, recharts, papaparse, etc.)
│
├── packages/
│   └── shared/                    # @hci/shared workspace package
│       ├── ui/                    # shadcn/ui components (Button, Card, Dialog, etc.)
│       ├── lib/
│       │   └── utils.ts           # cn() utility
│       ├── tailwind/
│       │   └── preset.ts          # Shared Tailwind preset (colors, fonts, tokens)
│       ├── tsconfig.json
│       └── package.json           # name: "@hci/shared"
│
├── package.json                   # Root: { "workspaces": ["apps/*", "packages/*"] }
├── bun.lockb
├── tsconfig.json                  # Root tsconfig with path references
├── CLAUDE.md                      # Updated for monorepo
└── docs/
```

---

## Routing

### Portal Routes (portal.hcimed.com)

Routes drop the `/portal` prefix since the entire app is the portal:

| Route | Role | Component |
|-------|------|-----------|
| `/login` | Public | LoginPage (staff/admin/provider) |
| `/partner-login` | Public | PartnerLoginPage (broker) |
| `/` | Auth | PortalRedirect (role-based) |
| `/admin` | Admin | AdminDashboardPage |
| `/admin/projects` | Admin | AdminProjectsPage |
| `/admin/projects/:id` | Admin | AdminProjectDetailPage |
| `/admin/users` | Admin | AdminUsersPage |
| `/admin/audit-log` | Admin | AuditLogPage |
| `/admin/practice-health` | Admin | PracticeHealthPage |
| `/admin/mobile-docs` | Admin | MobileDocsPage |
| `/admin/awv-tracker` | Admin, Staff | AwvTrackerPage |
| `/admin/ccm-rpm` | Admin, Staff | CcmRpmPage |
| `/staff` | Admin, Staff, Provider | PatientQueuePage |
| `/broker` | Broker | BrokerDashboardPage |

### Public Site Redirects (hcimed.com)

301 permanent redirects in public `vercel.json`:

| Old URL | New URL |
|---------|---------|
| `/hci-login` | `https://portal.hcimed.com/login` |
| `/partner-login` | `https://portal.hcimed.com/partner-login` |
| `/portal` | `https://portal.hcimed.com` |
| `/portal/:path*` | `https://portal.hcimed.com/:path*` (strip `/portal` prefix) |

Concrete `vercel.json` redirect entries for the public app:
```json
{
  "redirects": [
    { "source": "/hci-login", "destination": "https://portal.hcimed.com/login", "permanent": true },
    { "source": "/partner-login", "destination": "https://portal.hcimed.com/partner-login", "permanent": true },
    { "source": "/portal", "destination": "https://portal.hcimed.com", "permanent": true },
    { "source": "/portal/:path*", "destination": "https://portal.hcimed.com/:path*", "permanent": true }
  ]
}
```

---

## Authentication

### Auth — What Stays the Same

Supabase auth is project-scoped (tied to the Supabase project URL), not domain-scoped. These remain unchanged:

- Supabase client config (autoRefreshToken, persistSession, detectSessionInUrl)
- SessionTimeoutWarning.tsx (HIPAA compliance)
- RLS policies (unchanged, server-side)

### Required Auth Code Changes

1. **`AuthContext.tsx` — `getLoginPath()` function:** Currently returns `/hci-login` or `/partner-login`. Update to `/login` and `/partner-login` respectively.
2. **`AuthContext.tsx` — `signOut()` method:** Uses `getLoginPath()` — will work after the above fix.
3. **`AuthGuard.tsx` — broker path detection:** Currently checks `location.pathname.startsWith('/portal/broker')` to decide login redirect. After migration, the broker route is `/broker` (no `/portal` prefix). Update to `location.pathname.startsWith('/broker')`.
4. **`AuthGuard.tsx` — login redirect:** Update fallback from `/hci-login` to `/login`.

### Required Supabase Dashboard Updates

1. **Site URL:** Change from `https://hcimed.com` to `https://portal.hcimed.com` (affects password reset emails, magic links)
2. **Redirect URLs:** Add `https://portal.hcimed.com/**` to the allowed list, remove old `hcimed.com` portal entries

**Cutover order:** Update Supabase Site URL and redirect URLs **before** the portal subdomain goes live. If the old Site URL is still in place during deployment, password reset emails will redirect to `hcimed.com` where the auth flow no longer exists.

---

## Security Headers (Portal vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "Referrer-Policy", "value": "same-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.anthropic.com; font-src 'self'; frame-ancestors 'none'" }
      ]
    }
  ]
}
```

Key differences from public site:
- `X-Robots-Tag: noindex, nofollow` — never indexed
- `Referrer-Policy: same-origin` — stricter than public
- `Content-Security-Policy` — scoped to Supabase + Resend + Anthropic only (no GA, no external scripts)
- `frame-ancestors 'none'` — cannot be embedded

**Known CSP limitation:** `script-src 'unsafe-inline'` is required because Vite injects an inline module preload script in production builds. This weakens XSS protection. A future improvement would be to use CSP nonces via Vercel Edge Middleware, but this is out of scope for the initial migration.

**Public site CSP cleanup:** After migration, remove `https://*.supabase.co` and `wss://*.supabase.co` from the public site's CSP `connect-src` directive since no Supabase code will exist in the public bundle.

---

## Shared Package (@hci/shared)

### Contents

| Directory | Contents | Used By |
|-----------|----------|---------|
| `ui/` | All shadcn/ui components from current `src/components/ui/` | Both apps |
| `lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) | Both apps |
| `tailwind/preset.ts` | Shared Tailwind preset: HSL color tokens, font config, container sizes | Both apps |

### Import Pattern

Both apps import shared code as:
```typescript
import { Button } from "@hci/shared/ui/button";
import { cn } from "@hci/shared/lib/utils";
```

### shadcn CLI Update

After migration, shadcn CLI should target `packages/shared/ui/` for new component additions. Create a `components.json` in `packages/shared/` pointing to the shared paths. Each app may also need its own `components.json` if app-specific components are added.

### TypeScript Configuration

Each app's `tsconfig.json` needs path aliases for the shared package:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@hci/shared/*": ["../../packages/shared/*"]
    }
  }
}
```

The shared package needs its own `tsconfig.json` with `composite: true` for project references:

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["ui/**/*", "lib/**/*", "tailwind/**/*"]
}
```

### Vercel Install Command

Both Vercel projects need a custom install command that runs from the monorepo root (where `bun.lockb` lives):

```
cd ../.. && bun install
```

Set this in each Vercel project's Settings → General → Install Command. Without this, Vercel will try to install from the app's root directory and fail to find the lockfile.

### Dev Server Ports

- Public app: port 8080 (existing)
- Portal app: port 8081

Configure in each app's `vite.config.ts`.

---

## Vercel Deployment

### Two Vercel Projects

| Project | Domain | Root Directory | Env Vars |
|---------|--------|----------------|----------|
| `pasadena-health-hub` | `hcimed.com` | `apps/public` | RESEND_API_KEY, VITE_GA_TRACKING_ID, VITE_SITE_URL |
| `hci-portal` | `portal.hcimed.com` | `apps/portal` | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ANTHROPIC_API_KEY, CRON_SECRET |

**Note:** `CRON_SECRET` is required for the portal project — the cron endpoint at `/api/cron/practice-health-report` validates this. The existing conditional check that skips auth when `CRON_SECRET` is missing should be fixed to always require it.

### DNS

Add CNAME record for `portal.hcimed.com` → `cname.vercel-dns.com` (or use Vercel Domains to auto-configure).

### Cron Jobs

Move cron config from root `vercel.json` to `apps/portal/vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/practice-health-report?type=weekly", "schedule": "0 14 * * 1" },
    { "path": "/api/cron/practice-health-report?type=monthly", "schedule": "0 14 1 * *" }
  ]
}
```

---

## Migration Phases

### Phase 1: Monorepo Scaffolding
- Create directory structure (`apps/`, `packages/`)
- Set up root `package.json` with Bun workspaces
- Extract shadcn/ui + cn() + Tailwind preset into `packages/shared`
- Configure shared package.json and tsconfig

### Phase 2: Public App Extraction
- Move public site files into `apps/public/`
- Create public-only package.json (remove portal deps)
- Update imports from `@/components/ui/` → `@hci/shared/ui/`
- Update imports from `@/lib/utils` → `@hci/shared/lib/utils`
- Remove all portal routes, imports, lazy-loads from App.tsx
- Add 301 redirects for old portal URLs
- Verify build + dev server

### Phase 3: Portal App Extraction
- Move `src/portal/` into `apps/portal/src/`
- Create portal entry point (main.tsx, index.html, App.tsx)
- Create portal vite.config.ts (port 8081), vercel.json, tailwind.config.ts
- Create portal package.json with portal-specific deps
- Update all shared imports to `@hci/shared/`
- Simplify routes (drop `/portal` prefix)
- Update `AuthContext.getLoginPath()`: `/hci-login` → `/login`
- Update `AuthGuard`: `/portal/broker` path check → `/broker`
- Fix cron endpoint: make `CRON_SECRET` check unconditional (remove the `if (cronSecret)` guard)
- Move portal API functions to `apps/portal/api/`
- Verify build + dev server

### Phase 4: Vercel Deployment
- **Before going live:** Update Supabase Site URL to `https://portal.hcimed.com` and add redirect URLs (do this FIRST to avoid broken password reset links during the transition window)
- Create new Vercel project for portal (root dir: `apps/portal`)
- Set install command on both projects: `cd ../.. && bun install`
- Configure env vars on both projects (including `CRON_SECRET` on portal)
- Add portal.hcimed.com domain/DNS
- Update existing project root directory to `apps/public`
- Deploy both projects
- Remove old `hcimed.com` entries from Supabase redirect URLs

### Phase 5: Verification & Cleanup
- Test public site: all pages, contact form, appointments, blog
- Test portal: login (all roles), dashboard, CRUD operations, CSV upload, reports
- Test redirects: old portal URLs → new subdomain
- Verify portal is not indexed (check X-Robots-Tag header)
- Remove old `src/portal/` directory from apps/public
- Update CLAUDE.md for monorepo structure

---

## Verification Plan

### Public Site (hcimed.com)
- [ ] All public pages render correctly
- [ ] Contact, appointment, and career forms submit successfully
- [ ] Blog posts load and render
- [ ] SEO meta tags and sitemap are correct
- [ ] No Supabase or portal code in production bundle
- [ ] Old portal URLs (e.g., /hci-login) redirect to portal.hcimed.com

### Portal (portal.hcimed.com)
- [ ] Login works for all roles (admin, staff, provider, broker)
- [ ] Session timeout fires at 30 minutes
- [ ] Role-based routing and guards work correctly
- [ ] Dashboard charts and data load
- [ ] CSV upload and patient management work
- [ ] Practice health reports generate
- [ ] AWV tracker and CCM/RPM modules function
- [ ] Mobile Docs facility directory works
- [ ] Broker email forwarding works
- [ ] Cron jobs fire on schedule
- [ ] `X-Robots-Tag: noindex` header is present
- [ ] Supabase keys are NOT in the public site's bundle

### Cross-Cutting
- [ ] Shared shadcn/ui components render identically in both apps
- [ ] Tailwind tokens (colors, fonts) are consistent
- [ ] Both apps build independently with `bun run build`
- [ ] Both dev servers run independently (`bun run dev` on ports 8080 and 8081)
- [ ] `tsc --noEmit` passes in both apps (TypeScript path resolution works)
- [ ] Public site CSP no longer includes Supabase domains
