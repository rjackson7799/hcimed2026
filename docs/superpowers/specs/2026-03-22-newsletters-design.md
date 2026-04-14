# Newsletters Feature — Design Spec

## Context

HCI Medical Group wants a newsletters section on hcimed.com to share practice updates with existing patients and improve SEO. Newsletters will be published monthly (or more frequently). The first issue covers: Dr. Jackson's welcome message, introduction of new NPs (Apple & Bap), Optum-to-Regal insurance transition, and a call to schedule annual physicals.

## Decisions

| Decision | Choice |
|----------|--------|
| Content structure | Single markdown file per issue, multi-section with visual cards |
| Layout | Stacked cards — full-width cards per section, vertically stacked |
| Landing page | `/newsletters` shows latest issue in full; "Past Issues" section below |
| Archive | `/newsletters/:slug` shows any specific issue |
| Social sharing | Facebook + Email (mailto) share buttons |
| Email/subscription | None — web archive only |
| Navigation | Footer "Quick Links" — add "Newsletters" link |

## Prerequisite: YAML Parser

The existing `parseFrontmatter()` in `blog.ts` is a hand-rolled parser that only handles flat key-value pairs and flat arrays. Newsletter frontmatter requires an **array of objects** (the `sections` field), which the current parser cannot handle.

**Solution:** Install `js-yaml` as a dependency and create a shared `parseFrontmatter()` utility in `apps/public/src/lib/frontmatter.ts` that both `blog.ts` and `newsletters.ts` import. This replaces the hand-rolled parser with a proper YAML parser. The blog system continues to work identically — `js-yaml` is a superset of the current parser's capabilities.

## Content Structure

Each newsletter is a markdown file in `apps/public/src/content/newsletters/`. The frontmatter defines metadata and section configuration. The markdown body uses `## headings` to delimit sections, which are parsed and paired with their frontmatter config to render as individual stacked cards.

### Frontmatter Schema

```yaml
---
title: "HCI Health & Wellness Update"
slug: "2026-march"
description: "Meet our new providers, insurance updates, and scheduling reminders"
date: "2026-03-01"
issue: 1
author: "HCI Medical Group"
sections:
  - id: "dr-jackson-message"
    title: "A Message from Dr. Jackson"
    type: "message"
  - id: "meet-providers"
    title: "Meet Our New Providers"
    type: "feature"
    cta_text: "Meet Our Team"
    cta_link: "/providers"
  - id: "optum-regal"
    title: "Insurance Update: Optum to Regal"
    type: "alert"
    cta_text: "Learn More"
    cta_link: "/insurance-update"
  - id: "annual-physical"
    title: "Schedule Your Annual Physical"
    type: "feature"
    cta_text: "Book an Appointment"
    cta_link: "/appointments"
---
```

### Section Types

| Type | Visual Treatment |
|------|-----------------|
| `message` | Personal/editorial — subtle background, no CTA button needed |
| `feature` | Standard card with optional CTA button (secondary color) |
| `alert` | Highlighted card with accent border/background for urgent items |

### Markdown Body

The body uses `## Heading` delimiters. Each `## heading` maps to a section by order (1st heading = 1st section in frontmatter array, etc.). Standard markdown within each section (paragraphs, lists, bold, links, images).

**Validation:** `parseNewsletter()` must verify that the number of `## headings` matches the number of entries in the `sections` array and log a warning if they differ, falling back to rendering sections without metadata for any unmatched content.

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `apps/public/src/lib/frontmatter.ts` | Shared YAML frontmatter parser (js-yaml) |
| `apps/public/src/content/newsletters/2026-march.md` | First newsletter issue |
| `apps/public/src/types/newsletter.ts` | TypeScript interfaces |
| `apps/public/src/lib/newsletters.ts` | Content loader (mirrors `blog.ts` pattern) |
| `apps/public/src/pages/Newsletters.tsx` | Landing page — latest issue + archive |
| `apps/public/src/pages/NewsletterIssue.tsx` | Individual issue page |
| `apps/public/src/components/newsletter/NewsletterSection.tsx` | Single section card |
| `apps/public/src/components/newsletter/NewsletterIssueView.tsx` | Full issue renderer (header + sections + share) |
| `apps/public/src/components/newsletter/NewsletterArchive.tsx` | Past issues list |
| `apps/public/src/components/newsletter/SocialShare.tsx` | Facebook + Email share buttons |

### Modified Files

| File | Change |
|------|--------|
| `apps/public/src/lib/blog.ts` | Replace hand-rolled parser with import from new `frontmatter.ts` |
| `apps/public/src/App.tsx` | Add `lazyWithRetry` imports + routes for `/newsletters` and `/newsletters/:slug` |
| `apps/public/src/config/seo.ts` | Add `newsletters` entry to `pageSEO` |
| `apps/public/vite.config.ts` | Add `getNewsletterSlugs()` + `/newsletters` to `dynamicRoutes` |
| `apps/public/src/components/layout/Footer.tsx` | Add "Newsletters" link to Quick Links |

Note: Header/MobileNav navigation is intentionally left unchanged — newsletters are linked only from the footer.

### TypeScript Interfaces (`types/newsletter.ts`)

```typescript
export interface NewsletterSectionMeta {
  id: string;
  title: string;
  type: 'message' | 'feature' | 'alert';
  cta_text?: string;
  cta_link?: string;
}

export interface NewsletterFrontmatter {
  title: string;
  slug: string;
  description: string;
  date: string;
  issue: number;
  author: string;
  sections: NewsletterSectionMeta[];
}

export interface NewsletterSection extends NewsletterSectionMeta {
  content: string; // HTML for this section
}

export interface Newsletter extends Omit<NewsletterFrontmatter, 'sections'> {
  sections: NewsletterSection[]; // sections with parsed HTML content
}

// For archive listing — only the fields needed to render a list item
export type NewsletterMeta = Pick<NewsletterFrontmatter, 'title' | 'slug' | 'description' | 'date' | 'issue' | 'author'>;
```

### Shared Frontmatter Parser (`lib/frontmatter.ts`)

New shared utility that replaces the hand-rolled YAML parser:
- Uses `js-yaml` to parse frontmatter between `---` delimiters
- Returns `{ data: Record<string, unknown>; content: string }`
- `blog.ts` updated to import from here instead of its inline parser

### Content Loader (`lib/newsletters.ts`)

Follows `blog.ts` pattern:
- `import.meta.glob('../content/newsletters/*.md', { query: '?raw', import: 'default', eager: true })`
- Imports `parseFrontmatter()` from `lib/frontmatter.ts`
- Custom `parseNewsletter()`: splits markdown body by `## heading` regex, converts each section to HTML via `marked`, pairs with frontmatter sections array by index, validates count match
- Exports: `getAllNewsletters(): NewsletterMeta[]`, `getLatestNewsletter(): Newsletter`, `getNewsletterBySlug(slug): Newsletter | null`

### Pages

**`Newsletters.tsx`** (`/newsletters`):
- `<Layout>` + `<SEO>` + `<ArticleSchema>`
- Calls `getLatestNewsletter()` to render full current issue via `<NewsletterIssueView>`
- Below: `<NewsletterArchive>` showing older issues (if any exist)
- Default export for lazy loading

**`NewsletterIssue.tsx`** (`/newsletters/:slug`):
- `<Layout>` + `<SEO>` + `<ArticleSchema>`
- Uses `useParams` to get slug, calls `getNewsletterBySlug(slug)`
- Renders via `<NewsletterIssueView>`
- Redirects to `/newsletters` if not found
- Default export for lazy loading

### Components

**`NewsletterSection.tsx`**:
- Props: `section: NewsletterSection`
- Renders a card with:
  - Section title as card header
  - HTML content via `BlogContent` component (reuse existing — it's just a DOMPurify + prose wrapper)
  - Conditional CTA button (Link or anchor) if `cta_text` and `cta_link` present
  - Visual variant based on `type`: `message` gets subtle bg, `alert` gets accent border, `feature` is standard

**`NewsletterIssueView.tsx`**:
- Props: `newsletter: Newsletter`
- Issue header: title, formatted date, issue number
- `<SocialShare>` bar
- Maps `newsletter.sections` to `<NewsletterSection>` cards
- `<SocialShare>` bar repeated at bottom

**`NewsletterArchive.tsx`**:
- Props: `newsletters: NewsletterMeta[]`, `currentSlug?: string`
- Filters out current issue
- Renders list of past issues with date, title, description, and link to `/newsletters/:slug`
- Returns null if no past issues

**`SocialShare.tsx`**:
- Props: `url: string`, `title: string`
- Facebook: `https://www.facebook.com/sharer/sharer.php?u={encodedUrl}` — opens in new tab
- Email: `mailto:?subject={encodedTitle}&body={encodedUrl}` — opens email client
- Uses Lucide icons (`Facebook`, `Mail`)
- Accessible labels, opens in new tab for Facebook

## SEO

- Add to `pageSEO` in `seo.ts`:
  ```typescript
  newsletters: {
    title: 'Newsletters',
    description: 'Monthly health updates, practice news, and wellness tips from HCI Medical Group in Pasadena.',
    canonical: `${siteConfig.url}/newsletters`,
  }
  ```
- Each issue page gets `<SEO>` with `ogType="article"` and article metadata
- Each issue gets `<ArticleSchema>` JSON-LD
- Sitemap: add `/newsletters` + dynamic slugs via `getNewsletterSlugs()` in `vite.config.ts`

## Navigation

Add "Newsletters" to Footer Quick Links between "Health Resources" and "Careers":
```tsx
<li><Link to="/newsletters" className="...">Newsletters</Link></li>
```

## First Issue Content

The March 2026 newsletter (`2026-march.md`) contains:

1. **A Message from Dr. Jackson** — Welcome to the first newsletter, spring updates, commitment to patient care
2. **Meet Our New Providers** — Introduction of Evelind "Apple" Evangelista and Marileth "Bap" (NPs), brief backgrounds, CTA to providers page
3. **Insurance Update: Optum to Regal** — Announcement of the transition, what patients need to know, CTA to insurance update page
4. **Schedule Your Annual Physical** — Importance of annual physicals, warm tone for patients who haven't had one recently ("Haven't had a physical in a while? No judgment — just good care."), CTA to appointments page

## Verification

1. `bun run dev:public` — site starts without errors
2. Navigate to `/newsletters` — latest issue displays with all 4 sections as stacked cards
3. Each section card shows correct type styling (message/feature/alert)
4. CTA buttons link to correct pages (`/providers`, `/insurance-update`, `/appointments`)
5. Social share buttons work (Facebook opens sharer, Email opens mailto)
6. Footer shows "Newsletters" link that navigates to `/newsletters`
7. `bun run build:public` — builds without errors, sitemap includes `/newsletters` and `/newsletters/2026-march`
8. View page source — SEO meta tags and JSON-LD present
