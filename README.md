# Pasadena Health Hub

Official website for **HCI Medical Group** — a trusted internal medicine and senior care practice serving Pasadena and the San Gabriel Valley since 1990.

**Live site:** [hcimed.com](https://hcimed.com)

## Features

- Internal Medicine service pages (physical exams, acute care, women's & men's health, diagnostics)
- Senior Care Plus program with specialized service pages
- Online appointment request system with email notifications
- Multi-step career application form
- Health blog with markdown-based content
- Accessibility controls (font sizing, high contrast, reduced motion)
- SEO optimization with structured data and auto-generated sitemap
- Mobile-first responsive design with sticky CTAs
- Cookie consent management

## Tech Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3.4** + **shadcn/ui**
- **React Router 6** (client-side routing)
- **React Hook Form** + **Zod** (form validation)
- **TanStack React Query** (data fetching)
- **Resend** (email API)
- **marked** (markdown rendering)
- **Vercel** (deployment with Bun)

## Prerequisites

- [Bun](https://bun.sh/) (recommended)
- Node.js 18+ (alternative)

## Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd pasadena-health-hub

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your RESEND_API_KEY

# Start the development server
bun run dev
# Opens at http://localhost:8080
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | API key from [Resend](https://resend.com) for form email notifications |
| `VITE_GA_TRACKING_ID` | No | Google Analytics measurement ID |
| `VITE_SITE_URL` | No | Site URL for OG meta tags (defaults to https://hcimed.com) |

## Project Structure

```
src/
  components/       # UI components (layout, shadcn/ui, blog, careers, custom)
  pages/            # Route-level page components
  content/blog/     # Markdown blog posts with frontmatter
  config/           # Site configuration and SEO metadata
  context/          # React contexts (accessibility)
  lib/              # Utilities, blog parser, Zod schemas
  hooks/            # Custom React hooks
  types/            # TypeScript type definitions
api/                # Vercel serverless functions (appointments, contact, careers)
public/             # Static assets, favicons, robots.txt
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server (port 8080) |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build locally |
| `bun run lint` | Run ESLint |
| `bun run lint:fix` | Auto-fix ESLint issues |
| `bun run type-check` | Run TypeScript type checking |

## Adding Blog Posts

1. Create a new `.md` file in `src/content/blog/`
2. Add required frontmatter at the top of the file:

```yaml
---
title: "Your Post Title"
slug: "your-post-slug"
description: "Brief description of the post"
date: "2026-02-24"
author: "Author Name"
tags: ["tag1", "tag2"]
featured: false
---
```

3. Write your content in standard Markdown below the frontmatter
4. The post will appear automatically on the `/blog` page

## Deployment

- Hosted on **Vercel** using Bun as the build runtime
- Build command: `bun run build`
- Output directory: `dist`
- Serverless functions in `api/` are auto-deployed as Vercel functions
- Primary domain: `hcimed.com`
- Legacy domain `hcimedgroup.com` redirects to `hcimed.com`

## License

All rights reserved. Copyright HCI Medical Group.
