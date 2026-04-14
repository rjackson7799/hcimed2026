# Patient Growth & Brand Visibility — Phase 1: Quick Wins

**Date:** 2026-03-22
**Status:** Complete (implemented 2026-03-23)
**Scope:** Public site (`apps/public/`) — 5 features to improve patient acquisition, trust signals, and conversion

## Context

HCI Medical Group's website (hcimed.com) has a solid foundation: 23 pages, good SEO with JSON-LD, sitemap generation, accessible design, and appointment/contact forms. However, it lacks social proof, email capture, and rich provider profiles — all high-impact, low-effort improvements that directly increase patient acquisition. The FAQ page already has JSON-LD structured data, but service pages do not.

This is Phase 1 of a 3-phase growth initiative:
- **Phase 1 (this spec):** Conversion & trust quick wins
- **Phase 2 (future spec):** Content engine — blog system, local SEO pages, seed content
- **Phase 3 (future spec):** Advanced features — patient resource center, health topic hubs, performance optimization

## New Environment Variable

| Variable | Project | Description |
|----------|---------|-------------|
| `RESEND_AUDIENCE_ID` | Public site (hcimed.com) | Resend audience ID for the newsletter subscriber contact list |

## Goals

1. Increase appointment form submissions from existing traffic
2. Build trust with new visitors through social proof and insurance transparency
3. Capture email leads via newsletter signup across the site
4. Improve Google search appearance with structured data
5. Enrich provider profiles to build patient-provider connection before the first visit

---

## Feature 1: Patient Testimonials

### Data Model

New file: `apps/public/src/data/testimonials.ts`

```typescript
export interface Testimonial {
  id: string;
  name: string;            // First name + last initial (e.g., "Maria L.")
  rating: number;          // 1-5 stars
  text: string;            // 1-2 sentence quote
  serviceCategory: 'internal-medicine' | 'senior-care' | 'general';
  source?: string;         // "Google" | "Yelp" | "Patient"
}
```

HIPAA compliance: Only use first name + last initial. No medical details. Source from public Google/Yelp reviews or written patient consent.

**Initial data:** Use realistic placeholder testimonials (fictional names, believable quotes). Mark the file with a `// TODO: Replace with real patient testimonials` comment. The data structure is ready for easy swap-in when real reviews are available.

### Components

1. **`<TestimonialCard>`** — Single testimonial with star rating, quote, attribution
   - Location: `apps/public/src/components/testimonials/TestimonialCard.tsx`
   - Props: `testimonial: Testimonial`
   - Stars rendered with Lucide `Star` icon (filled/unfilled)
   - Card uses existing shadcn Card component from `@hci/shared/ui/card`

2. **`<TestimonialsSection>`** — Grid/carousel of testimonial cards
   - Location: `apps/public/src/components/testimonials/TestimonialsSection.tsx`
   - Props: `category?: Testimonial['serviceCategory']` (optional filter), `limit?: number` (default 3)
   - Desktop: 3-card grid. Mobile: horizontal scroll or stacked.
   - Section heading: "What Our Patients Say"
   - Footer link: "See more reviews on Google →" (URL stored in `siteConfig` at `src/config/site.ts`)

### Placement

- **Homepage:** Below services section, above footer — shows 3 `general` or mixed testimonials
- **Service pages:** Filtered by `serviceCategory` — shows 2-3 relevant testimonials
- **Provider pages:** Mixed testimonials, 2-3 cards

### Seed Data

Start with 6-8 realistic placeholder testimonials (to be replaced with real patient reviews later). Example:

```typescript
{
  id: "1",
  name: "Maria L.",
  rating: 5,
  text: "Dr. Jackson has been my doctor for over 15 years. He truly listens and takes the time to explain everything.",
  serviceCategory: "general",
  source: "Google"
}
```

---

## Feature 2: "Accepting New Patients" Banner + Insurance Trust Signals

### New Patient Banner

**Component:** `<NewPatientBanner>`
- Location: `apps/public/src/components/trust/NewPatientBanner.tsx`
- Renders a colored announcement strip (secondary/accent color background)
- Text: "Now Accepting New Patients — Schedule Your Visit Today"
- CTA button: "Request Appointment" → `/appointments`
- Dismissible via localStorage key (`hci-banner-dismissed`) — stores ISO timestamp of dismissal, re-shows after 7 days
- Placed between header and page content on homepage only (not sticky, not intrusive)

### Insurance Logo Strip

**Component:** `<InsuranceLogos>`
- Location: `apps/public/src/components/trust/InsuranceLogos.tsx`
- Horizontal row of insurance provider logos with alt text
- Logos stored in `apps/public/src/assets/insurance/` (SVG or PNG)
- Initial set: Medicare, Aetna, Blue Cross Blue Shield, Cigna, United Healthcare, Regal Medical Group
- **Fallback approach:** Start with styled text badges (insurer name in a rounded pill) — no logo licensing needed. Swap in SVG logos later if/when sourced.
- Text above: "We Accept Most Major Insurance Plans"
- Muted/grayscale styling with subtle hover color effect
- Responsive: wraps to 2 rows on mobile

### Placement

- **Homepage:** Insurance logos below the hero section
- **Appointments page:** Insurance logos above the appointment form
- **Footer:** Optional compact version (text list of accepted insurers)

### New Patient Experience Callout

**Component:** `<NewPatientSteps>`
- Location: `apps/public/src/components/trust/NewPatientSteps.tsx`
- 3-step visual on the appointment page:
  1. "Request" (Calendar icon) — Fill out our simple form
  2. "Confirm" (Phone icon) — We'll call to confirm your appointment
  3. "Visit" (Heart icon) — Meet your provider and start your care
- Uses Lucide icons, horizontal on desktop, vertical on mobile

---

## Feature 3: Newsletter Signup Across the Site

### Component

**`<NewsletterSignup>`**
- Location: `apps/public/src/components/newsletter/NewsletterSignup.tsx`
- **Note:** This directory already contains 4 components (`NewsletterSection`, `NewsletterIssueView`, `NewsletterArchive`, `SocialShare`) for rendering newsletter content. `NewsletterSignup` is a separate concern — email capture, not content display.
- Props: `variant: 'inline' | 'section' | 'compact'`
  - `inline`: Full-width section with heading, description, and form (for homepage)
  - `section`: Card-style with heading (for blog post bottoms)
  - `compact`: Just email input + button (for footer)
- Fields: Email input + "Subscribe" button
- Validation: Zod email validation, same pattern as existing forms
- Success state: "Thanks! You're subscribed." with checkmark
- Honeypot field for spam prevention (matches existing contact form pattern)

### API Endpoint

**`apps/public/api/newsletter-subscribe.ts`**
- Vercel serverless function
- Accepts POST with `{ email: string }`
- Validation: Zod email check
- Storage: Resend Contacts API (`resend.contacts.create`) — adds to a "Newsletter" audience
- **Environment variable:** `RESEND_AUDIENCE_ID` — must be added to the public site's Vercel project (Resend audience ID for the newsletter contact list)
- Returns 200 on success, 400 on validation error, 409 if already subscribed
- Rate limiting: IP-based Map tracker (5 requests/minute) — matches existing pattern in `api/send-email.ts`

### Placement

- **Footer:** `compact` variant in the contact column — all pages get this automatically
- **Homepage:** `inline` variant — dedicated "Stay Informed" section between testimonials and footer
  - Heading: "Stay Informed About Your Health"
  - Subtext: "Monthly health tips, practice updates, and Medicare guidance — delivered to your inbox."
- **Blog post pages:** `section` variant — **replaces** the existing "Have Questions About Your Health?" CTA block at the bottom of `BlogPost.tsx` (lines ~109-127). The newsletter signup is a higher-value CTA than the generic contact prompt.
  - Heading: "Enjoyed this article?"
  - Subtext: "Subscribe for more health insights from HCI Medical Group."
- **Newsletter archive page:** `inline` variant at the top

---

## Feature 4: Enhanced Provider Profiles

### Additions to Existing Provider Pages

The 3 provider pages already exist at `apps/public/src/pages/providers/`. Enhance each with:

1. **Philosophy statement** — 2-3 sentence highlighted callout about care approach
   - Stored inline in each provider page component (not a separate data file — content is unique per provider)
   - Note: Dr. Jackson's page already has extensive bio paragraphs. The philosophy statement is a separate, visually distinct callout (e.g., blockquote or Card) — not a replacement for the existing bio.

2. **Credentials section** — Structured display of:
   - Board certifications
   - Education (medical school, residency)
   - Years of experience
   - Languages spoken
   - Professional memberships

3. **"Areas of Focus" tags** — Visual chips/badges:
   - Dr. Jackson: Medicare Wellness, Diabetes Management, Hypertension, Preventive Care, Senior Health
   - Apple Evangelista: Internal Medicine, Women's Health, Chronic Care, Patient Education
   - Marileth Tan: Internal Medicine, Men's Health, Acute Care, Geriatric Care

4. **Professional headshot area** — Styled placeholder (avatar with initials) ready for real photos
   - Uses `<Avatar>` from `@hci/shared/ui/avatar`
   - Fallback: initials on brand-colored background

5. **Physician JSON-LD** — Structured data on each provider page:
   ```json
   {
     "@type": "Physician",
     "name": "Dr. Roy H. Jackson",
     "medicalSpecialty": "InternalMedicine",
     "memberOf": { "@type": "MedicalOrganization", "name": "HCI Medical Group" },
     "address": { ... },
     "telephone": "(626) 792-4185"
   }
   ```

### Component

**`<ProviderCredentials>`**
- Location: `apps/public/src/components/providers/ProviderCredentials.tsx`
- Props: credentials object with education, certifications, languages, experience
- Renders a clean 2-column grid of credential items with icons

**`<FocusAreaTags>`**
- Location: `apps/public/src/components/providers/FocusAreaTags.tsx`
- Props: `areas: string[]`
- Renders horizontal chips using shadcn Badge component

---

## Feature 5: FAQ Schema Markup

### FAQ Page Refactor

**Current:** `apps/public/src/pages/FAQ.tsx` already has 15 FAQ entries with working `FAQPage` JSON-LD schema (generated inline and passed via `<SEO structuredData={...}>`).

**Refactor (for reuse, not new functionality):**
- Extract the 15 existing FAQ entries into `apps/public/src/data/faq-data.ts` (array of `{ question, answer, category }` objects)
- **All 15 existing entries and the JSON-LD schema generation must be preserved exactly** — this is a data extraction, not a rewrite
- The FAQ page imports from `faq-data.ts` and renders identically to today
- This extraction enables `<ServiceFAQ>` to share the same data format and JSON-LD generation pattern

### Service Page FAQs

Add 3-5 relevant FAQs to **3 high-traffic service pages** in Phase 1 (remaining pages in Phase 2):

- **Physical Exams** (`/internal-medicine/physical-exams`): "How often should I get a physical?", "What does a physical exam include?", "Is a physical covered by insurance?"
- **Senior Care+** (`/senior-care-plus`): "What is an Annual Wellness Visit?", "Is the AWV covered by Medicare?", "What's the difference between a physical and an AWV?"
- **Chronic Care** (`/senior-care/chronic-care`): "What is Chronic Care Management?", "Who qualifies for CCM?", "Is CCM covered by Medicare?"

**Component:** `<ServiceFAQ>`
- Location: `apps/public/src/components/faq/ServiceFAQ.tsx`
- Props: `faqs: Array<{ question: string; answer: string }>`
- Renders collapsible accordion (shadcn Accordion)
- Injects FAQPage JSON-LD for the included questions
- Placed at the bottom of each service page, above the CTA

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/data/testimonials.ts` | Testimonial seed data |
| `src/data/faq-data.ts` | FAQ data extracted from FAQ page + new service FAQs |
| `src/components/testimonials/TestimonialCard.tsx` | Single testimonial card |
| `src/components/testimonials/TestimonialsSection.tsx` | Testimonial grid/section |
| `src/components/trust/NewPatientBanner.tsx` | Accepting new patients banner |
| `src/components/trust/InsuranceLogos.tsx` | Insurance logo strip |
| `src/components/trust/NewPatientSteps.tsx` | 3-step new patient visual |
| `src/components/newsletter/NewsletterSignup.tsx` | Reusable email signup form |
| `src/components/providers/ProviderCredentials.tsx` | Credentials display |
| `src/components/providers/FocusAreaTags.tsx` | Specialty tag chips |
| `src/components/faq/ServiceFAQ.tsx` | Service page FAQ accordion + schema |
| `api/newsletter-subscribe.ts` | Serverless email subscription endpoint |
| `src/assets/insurance/` | Insurance provider logos (6 SVGs) |

All paths relative to `apps/public/`.

**Convention note:** `src/data/` is a new directory for static typed data arrays (testimonials, FAQs). This is distinct from `src/config/` (app configuration like SEO, site settings) and `src/content/` (markdown content files for blog/newsletters).

**No new routes needed.** All features are additions to existing pages. No changes to `dynamicRoutes` in `vite.config.ts` or `App.tsx` routing.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add TestimonialsSection, InsuranceLogos, NewPatientBanner, NewsletterSignup sections |
| `src/pages/FAQ.tsx` | Extract data to faq-data.ts (preserve all 15 existing entries + JSON-LD) |
| `src/pages/Appointments.tsx` | Add InsuranceLogos, NewPatientSteps |
| `src/pages/providers/DrJackson.tsx` | Add philosophy, ProviderCredentials, FocusAreaTags, Physician JSON-LD |
| `src/pages/providers/AppleEvangelista.tsx` | Same as above |
| `src/pages/providers/MarilethTan.tsx` | Same as above |
| `src/pages/BlogPost.tsx` | Replace existing bottom CTA with NewsletterSignup |
| `src/pages/Newsletters.tsx` | Add NewsletterSignup at top |
| `src/components/layout/Footer.tsx` | Add compact NewsletterSignup |
| `src/config/seo.ts` | No changes needed — existing entries cover all pages |
| 3 service pages (Physical Exams, Senior Care+, Chronic Care) | Add ServiceFAQ section |

## Verification

1. **Visual check:** Run `bun run dev:public` and verify each new section renders correctly on homepage, appointment page, provider pages, service pages, blog posts, and footer
2. **Schema validation:** Use Google Rich Results Test (https://search.google.com/test/rich-results) on FAQPage and Physician schemas
3. **Responsive:** Check mobile (375px), tablet (768px), and desktop (1280px) breakpoints
4. **Accessibility:** Verify keyboard navigation on accordion FAQs, screen reader announces testimonial ratings, newsletter form has proper labels
5. **Newsletter API:** Test subscribe endpoint with valid email, invalid email, and duplicate email
6. **Banner dismiss:** Verify localStorage persistence — banner stays hidden after dismissal
7. **Build:** `bun run build:public` succeeds with no TypeScript errors
8. **Sitemap check:** Verify sitemap output hasn't changed (no accidental route additions)
9. **FAQ regression:** Confirm FAQ page still renders all 15 original entries with JSON-LD intact

## Out of Scope

- Real-time online booking integration (Phase 3+)
- Blog category/tag system (Phase 2)
- Local SEO neighborhood pages (Phase 2)
- Patient resource center (Phase 3)
- Google Business Profile setup (external, not code)
- Social media integration (future consideration)
