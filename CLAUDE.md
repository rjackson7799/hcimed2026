# Pasadena Health Hub — CLAUDE.md

## Claude Code Permissions

- **Allow all bash commands** — Claude Code should execute all bash commands without requiring manual approval.

## Project Overview

Official website for **HCI Medical Group** — a trusted internal medicine and senior care practice in Pasadena, CA, serving the San Gabriel Valley since 1990.

- **Live site:** https://hcimed.com
- **Portal:** https://portal.hcimed.com
- **Type:** Bun workspace monorepo with two Vite apps and a shared package

## Monorepo Structure

```
pasadena-health-hub/
├── apps/
│   ├── public/                        # Marketing site → hcimed.com
│   │   ├── src/                       # Public site source
│   │   │   ├── assets/                # Images (hero/, services/, logo)
│   │   │   ├── components/            # Layout, blog, careers, SEO, etc.
│   │   │   ├── config/                # seo.ts, site.ts
│   │   │   ├── content/blog/          # Markdown blog posts
│   │   │   ├── context/               # AccessibilityContext
│   │   │   ├── lib/                   # blog.ts, schemas/
│   │   │   ├── pages/                 # Route-level page components
│   │   │   ├── types/                 # TypeScript types
│   │   │   ├── App.tsx                # Public routes
│   │   │   ├── main.tsx               # Entry point
│   │   │   └── index.css              # Global styles, CSS variables
│   │   ├── api/                       # Public API functions (contact, appointments, careers)
│   │   ├── public/                    # Static assets, favicons, robots.txt
│   │   ├── index.html
│   │   ├── vite.config.ts             # Port 8080
│   │   ├── vercel.json                # Public headers, portal redirects
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── portal/                        # Internal portal → portal.hcimed.com
│       ├── src/
│       │   ├── components/            # admin, auth, broker, staff, mobile-docs, awv, ccm
│       │   ├── context/               # AuthContext, ProjectContext
│       │   ├── hooks/                 # 38+ React Query hooks
│       │   ├── lib/                   # supabase.ts, csv.ts, export.ts, parsers
│       │   ├── pages/                 # Portal route pages
│       │   ├── schemas/               # Zod validation schemas
│       │   ├── types/                 # database.ts, enums, module types
│       │   ├── utils/                 # constants.ts, formatters.ts
│       │   ├── App.tsx                # Portal-only routes (no /portal prefix)
│       │   ├── main.tsx               # Portal entry point
│       │   └── index.css              # Portal styles
│       ├── api/                       # Portal API functions (broker email, user mgmt, cron)
│       ├── index.html                 # No SEO tags, no GA
│       ├── vite.config.ts             # Port 8081
│       ├── vercel.json                # HIPAA-hardened headers, noindex, cron jobs
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                        # @hci/shared — shared between both apps
│       ├── ui/                        # shadcn/ui components — DO NOT manually edit
│       ├── lib/utils.ts               # cn() utility (clsx + tailwind-merge)
│       ├── hooks/                     # use-mobile, use-toast
│       ├── tailwind/preset.ts         # Shared Tailwind preset (colors, fonts, tokens)
│       ├── tsconfig.json
│       └── package.json
│
├── package.json                       # Root workspace config
├── tsconfig.json                      # Root tsconfig with project references
├── CLAUDE.md
├── docs/                              # Shared docs, schemas, specs
└── scripts/                           # Seed scripts
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime / Package Manager | Bun (workspace monorepo) |
| Build Tool | Vite 5 with @vitejs/plugin-react-swc |
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS 3.4 with CSS variables (HSL), @tailwindcss/typography |
| UI Components | shadcn/ui (Radix UI, in `packages/shared/ui/`) |
| Routing | React Router DOM 6 (BrowserRouter) |
| Forms | React Hook Form 7 + Zod validation |
| Data Fetching | TanStack React Query 5 |
| Email | Resend API (via Vercel serverless functions) |
| SEO | react-helmet-async, vite-plugin-sitemap, JSON-LD (public app only) |
| Icons | Lucide React |
| Deployment | Vercel (two projects, one repo) |

## Development Commands

```bash
bun install              # Install all workspace dependencies (from root)

# Public site (hcimed.com)
bun run dev:public       # Start public dev server (http://localhost:8080)
bun run build:public     # Build public app

# Portal (portal.hcimed.com)
bun run dev:portal       # Start portal dev server (http://localhost:8081)
bun run build:portal     # Build portal app

# Both
bun run build            # Build both apps
```

## Environment Variables

### Public Site (hcimed.com)
| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Resend API key for form email notifications |
| `VITE_GA_TRACKING_ID` | No | Google Analytics measurement ID |
| `VITE_SITE_URL` | No | Site URL for OG meta tags (defaults to https://hcimed.com) |

### Portal (portal.hcimed.com)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key for server-side operations |
| `RESEND_API_KEY` | Yes | Resend API key for broker emails |
| `ANTHROPIC_API_KEY` | Yes | Claude API key for AI insights |
| `CRON_SECRET` | Yes | Secret for authenticating cron job requests |

## Coding Conventions

### Imports
- Public app: `@/` alias → `apps/public/src/`
- Portal app: `@/` alias → `apps/portal/src/`
- Shared: `@hci/shared/ui/*`, `@hci/shared/lib/utils`, `@hci/shared/hooks/*`

### Components
- Functional components with hooks
- Public page components use **default exports**; portal components use **named exports**
- Public pages wrap content in `<Layout>` component and use `<SEO>` for meta tags

### Styling
- Tailwind utility classes for all styling
- Use `cn()` from `@hci/shared/lib/utils` for conditional class merging
- Colors use HSL-based CSS variables defined in `index.css`
- Fonts: Playfair Display (headings) + Source Sans 3 (body)

### shadcn/ui
- Components live in `packages/shared/ui/` — **auto-generated** by shadcn CLI
- **Do not manually edit** files in `packages/shared/ui/`
- Hooks live in `packages/shared/hooks/`

### Forms
- React Hook Form with Zod resolvers
- Public schemas: `apps/public/src/lib/schemas/`
- Portal schemas: `apps/portal/src/schemas/`

## Public Site Architecture

- **Provider tree** (App.tsx): `AccessibilityProvider > QueryClientProvider > TooltipProvider > BrowserRouter`
- **HelmetProvider** wraps `App` in `main.tsx`
- **SPA routing**: `vercel.json` rewrites all non-API routes to `index.html`
- **Domain redirects**: `hcimedgroup.com` → `hcimed.com`
- **Portal redirects**: `/hci-login` → `portal.hcimed.com/login`, `/portal/*` → `portal.hcimed.com/*`

## Portal Architecture

- **Deployed to:** `portal.hcimed.com` (separate Vercel project, same Git repo)
- **Auth:** Supabase Auth with email/password, 30-min session timeout
- **Data:** Supabase PostgreSQL with RLS, React Query for caching
- **Realtime:** Supabase Realtime subscriptions
- **Charts:** recharts via shadcn chart wrapper
- **CSV:** papaparse with Zod validation

### Portal Routes (on portal.hcimed.com)
| Route | Role | Description |
|-------|------|-------------|
| `/login` | Public | Admin & Staff login |
| `/partner-login` | Public | Broker login |
| `/` | Auth | Redirects based on role |
| `/admin` | Admin | Dashboard |
| `/admin/projects` | Admin | Project list |
| `/admin/projects/:id` | Admin | Project detail + CSV upload |
| `/admin/users` | Admin | User management |
| `/admin/audit-log` | Admin | HIPAA audit log |
| `/admin/practice-health` | Admin | Practice health reports |
| `/admin/mobile-docs` | Admin | Facility directory |
| `/admin/awv-tracker` | Admin, Staff | AWV tracking |
| `/admin/ccm-rpm` | Admin, Staff | CCM/RPM tracking |
| `/staff` | Admin, Staff, Provider | Patient queue |
| `/broker` | Broker | Forwarded patients |

## Vercel Deployment

| Project | Domain | Root Directory | Install Command |
|---------|--------|----------------|-----------------|
| `pasadena-health-hub` | `hcimed.com` | `apps/public` | `cd ../.. && bun install` |
| `hci-portal` | `portal.hcimed.com` | `apps/portal` | `cd ../.. && bun install` |

Both projects point to the same Git repository with different root directories.

## Important Warnings

- **Never commit** `.env.local` or any file containing API keys
- **Never manually edit** files in `packages/shared/ui/` — use the shadcn CLI
- **When adding new public routes**: add to `dynamicRoutes` in `apps/public/vite.config.ts`
- **When adding new public pages**: add SEO metadata in `apps/public/src/config/seo.ts`
- **Portal routes** should NOT be added to sitemap or SEO config
- **Portal is noindexed** via both `X-Robots-Tag` header and `<meta>` tag
- **Supabase env vars** exist ONLY on the portal Vercel project — never on public
