# Pasadena Health Hub — CLAUDE.md

## Claude Code Permissions

- **Allow all bash commands** — Claude Code should execute all bash commands without requiring manual approval.

## Project Overview

Official website for **HCI Medical Group** — a trusted internal medicine and senior care practice in Pasadena, CA, serving the San Gabriel Valley since 1990.

- **Live site:** https://hcimed.com
- **Package name:** `pasadena-health-hub`
- **Type:** Single-page application with serverless API functions

## Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime / Package Manager | Bun |
| Build Tool | Vite 5 with @vitejs/plugin-react-swc |
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS 3.4 with CSS variables (HSL), @tailwindcss/typography |
| UI Components | shadcn/ui (Radix UI primitives, slate base color) |
| Routing | React Router DOM 6 (BrowserRouter) |
| Forms | React Hook Form 7 + Zod validation |
| Data Fetching | TanStack React Query 5 |
| Email | Resend API (via Vercel serverless functions) |
| SEO | react-helmet-async, vite-plugin-sitemap, JSON-LD structured data |
| Icons | Lucide React |
| Markdown | marked (blog post rendering) |
| Deployment | Vercel |

## Project Structure

```
pasadena-health-hub/
├── api/                              # Vercel serverless functions
│   ├── request-appointment.ts        # Appointment form handler
│   ├── send-email.ts                 # Contact form email handler
│   └── submit-application.ts         # Careers application handler
├── public/                           # Static assets, favicons, robots.txt
├── src/
│   ├── assets/                       # Images (hero/, services/, logo)
│   ├── components/
│   │   ├── layout/                   # Layout, Header, Footer, MobileStickyFooter
│   │   ├── ui/                       # shadcn/ui primitives — DO NOT manually edit
│   │   ├── blog/                     # BlogCard, BlogContent
│   │   ├── careers/                  # ApplicationForm, FormStepIndicator
│   │   │   └── steps/               # 5 form step components
│   │   └── [custom components]       # SEO, PageHero, ContactForm, etc.
│   ├── config/
│   │   ├── seo.ts                    # Per-page SEO metadata
│   │   └── site.ts                   # Global site config (name, contact, address, hours)
│   ├── content/blog/                 # Markdown blog posts with YAML frontmatter
│   ├── context/
│   │   └── AccessibilityContext.tsx   # Font size, high contrast, reduced motion
│   ├── hooks/                        # Custom React hooks (use-mobile, use-toast)
│   ├── lib/
│   │   ├── blog.ts                   # Blog post parsing (frontmatter + marked)
│   │   ├── utils.ts                  # cn() utility (clsx + tailwind-merge)
│   │   └── schemas/                  # Zod validation schemas
│   ├── pages/                        # Route-level page components
│   │   ├── internal-medicine/        # PhysicalExams, AcuteCare, WomensHealth, MensHealth, Diagnostics
│   │   └── senior-care/              # PreventionWellness, ChronicCare, TransitionCare, RemoteMonitoring
│   ├── types/                        # TypeScript type definitions
│   ├── App.tsx                       # Route definitions and provider tree
│   ├── main.tsx                      # Entry point (HelmetProvider wraps App)
│   └── index.css                     # Global styles, CSS variables, design tokens
├── CLAUDE.md
├── PROGRESS.md
├── README.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── .env.example
```

## Development Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (http://localhost:8080)
bun run build        # Production build (output: dist/)
bun run preview      # Preview production build locally
bun run lint         # Run ESLint
bun run lint:fix     # Auto-fix ESLint issues
bun run type-check   # TypeScript type checking (tsc --noEmit)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Resend API key for form email notifications |
| `VITE_GA_TRACKING_ID` | No | Google Analytics measurement ID |
| `VITE_SITE_URL` | No | Site URL for OG meta tags (defaults to https://hcimed.com) |

Use `.env.example` as a template: `cp .env.example .env.local`

## Coding Conventions

### Imports
- Use `@/` path alias for all imports from `src/` (e.g., `import { Layout } from "@/components/layout/Layout"`)

### Components
- Functional components with hooks
- Page components use **default exports**; other components use **named exports**
- All pages wrap content in the `<Layout>` component
- Each page uses the `<SEO>` component for meta tags

### Styling
- Tailwind utility classes for all styling
- Use `cn()` from `@/lib/utils` for conditional class merging
- Colors use HSL-based CSS variables defined in `index.css`
- Fonts: Playfair Display (headings) + Source Sans 3 (body)

### shadcn/ui
- Components live in `src/components/ui/` — these are **auto-generated** by the shadcn CLI
- **Do not manually edit** files in `src/components/ui/`
- To add new components: `npx shadcn-ui@latest add <component>`

### Forms
- React Hook Form with Zod resolvers
- Validation schemas in `src/lib/schemas/`

### Blog
- Markdown files in `src/content/blog/` with YAML frontmatter
- Required frontmatter: title, slug, description, date, author, tags
- Parsed at build time via `import.meta.glob`

### SEO
- Page metadata defined in `src/config/seo.ts`
- Sitemap routes configured in `vite.config.ts` (`dynamicRoutes` array)

## Architecture Notes

- **Provider tree** (App.tsx): `AccessibilityProvider > QueryClientProvider > TooltipProvider > BrowserRouter`
- **HelmetProvider** wraps `App` in `main.tsx`
- **SPA routing**: Vercel `vercel.json` rewrites all non-API routes to `index.html`
- **Domain redirects**: `hcimedgroup.com` and `www.hcimedgroup.com` → `hcimed.com`
- **Security headers** set in `vercel.json`: X-Frame-Options, X-XSS-Protection, X-Content-Type-Options, Referrer-Policy
- **Static asset caching**: `/assets/` files get immutable cache headers (1 year)
- **Accessibility preferences** persisted in localStorage under `hci-accessibility-preferences`
- **TypeScript** is not in strict mode (`noImplicitAny: false`, `strictNullChecks: false`)

## Patient Outreach Tracking Portal (`src/portal/`)

Internal module for tracking patient outreach across insurance transitions. Isolated from the public site — all portal code lives in `src/portal/`.

### Portal Structure
```
src/portal/
├── components/
│   ├── admin/       # Dashboard, charts, project manager, CSV upload, audit log
│   ├── auth/        # AuthGuard, RoleGuard, LoginForm, SessionTimeout
│   ├── broker/      # ForwardedList, StatusUpdater, MessageThread
│   ├── layout/      # AppShell, PortalSidebar, TopBar, MobileNav
│   ├── shared/      # StatusBadge, LoadingStates, ExportButton
│   └── staff/       # PatientQueue, PatientCard, CallLogger, CallHistory, BrokerForward
├── context/         # AuthContext, ProjectContext
├── hooks/           # React Query hooks for all data operations
├── lib/             # supabase.ts, csv.ts, export.ts
├── pages/           # Route-level page components (named exports)
├── schemas/         # Zod validation schemas
├── types/           # database.ts, enums.ts, index.ts
└── utils/           # constants.ts, formatters.ts
```

### Portal Routes
| Route | Role | Description |
|-------|------|-------------|
| `/hci-login` | Public | Admin & Staff login (HCI-branded) |
| `/partner-login` | Public | Broker login (partner-branded) |
| `/portal` | Auth | Redirects based on role |
| `/portal/admin` | Admin | Dashboard with charts |
| `/portal/admin/projects` | Admin | Project list |
| `/portal/admin/projects/:id` | Admin | Project detail + CSV upload |
| `/portal/admin/users` | Admin | User management |
| `/portal/admin/audit-log` | Admin | HIPAA audit log viewer |
| `/portal/staff` | Admin, Staff | Patient queue + call logging |
| `/portal/broker` | Broker | Forwarded patients + status updates |

### Portal Tech
- **Auth:** Supabase Auth with email/password, 30-min session timeout
- **Data:** Supabase PostgreSQL with RLS, React Query for caching
- **Realtime:** Supabase Realtime subscriptions (auto-refresh dashboard)
- **Charts:** recharts (donut, bar, funnel) via shadcn chart wrapper
- **Email:** Resend API via `api/send-broker-email.ts` (Vercel serverless)
- **CSV:** papaparse with Zod validation for patient imports

### Portal Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (Vercel) | Service role key for broker email API |

### Portal Conventions
- **Named exports** for all portal components (not default exports)
- **Lazy imports** use `.then(m => ({ default: m.ComponentName }))` remapping
- **AuthProvider** wraps only portal routes — never initializes for public visitors
- **Portal routes excluded** from sitemap and marked `noindex`
- **Do not add portal routes** to `dynamicRoutes` in `vite.config.ts`

## Important Warnings

- **Never commit** `.env.local` or any file containing `RESEND_API_KEY`
- **Never manually edit** files in `src/components/ui/` — use the shadcn CLI
- **When adding new public routes**: also add them to the `dynamicRoutes` array in `vite.config.ts`
- **When adding new public pages**: also add SEO metadata in `src/config/seo.ts`
- **Portal routes** should NOT be added to sitemap or SEO config
- **Blog slugs** must match the `slug` field in frontmatter, not the filename
