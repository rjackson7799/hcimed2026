# Medical Weight Loss Page — Design Spec

## Context

HCI Medical Group is launching a cash-pay GLP-1 medical weight loss program and needs a conversion-oriented landing page at `/programs/medical-weight-loss` on hcimed.com. This is the first page under a new "Programs" navigation dropdown that will later include TRT (Testosterone Replacement Therapy). The page must capture enrollment leads via a sticky sidebar form while presenting comprehensive program information. The original content spec lives at `docs/Medical_Weight_Loss_Webpage_Spec.md`.

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Navigation placement | New top-level "Programs" dropdown | Separates cash-pay specialty programs from core Internal Medicine. Scales for TRT and future programs. |
| URL path | `/programs/medical-weight-loss` | Groups under `/programs/` for consistency with future program pages. |
| Page layout | Sticky sidebar form (option C) | Conversion-oriented — form always visible on desktop. This is a sales page for auxiliary services. |
| Form behavior | Single form with intent dropdown | "Enrolling in the program" / "Getting more information" — staff triages based on selection. |
| Form submission | Email notification via Resend | Consistent with existing appointment/contact flow. Email to staff + confirmation to patient. |
| Form height | Compact with expand toggle | 4 core fields visible (intent, name, phone, email) + submit. "More options" reveals current patient status + message. Submit button always visible. |
| Color scheme | Existing site design system | Keep consistent with hcimed.com — primary blues, secondary accents, same typography. |
| Imagery | Abstract medical SVG illustrations | Custom SVG icons and illustrations (heartbeat motifs, medical icons). No stock photos, no before/after images. |
| Care team section | Brief mention with link | Light card style with icon, team description, "since 1990" badge, and link to providers page. |
| Hero CTAs | Call + Enroll Online + Learn More | "Call to Schedule" (tel link), "Enroll Online" (scrolls to form), "Learn More" (scrolls to content). |

---

## Page Architecture

### Route: `/programs/medical-weight-loss`

**Layout:** Two-column on desktop (content left, sticky form right). Single-column on mobile (form below hero, repeated above final CTA).

**Grid:** `grid-template-columns: 1fr 360px` with `gap: 48px` at `lg` breakpoint. Below `lg`, single column.

### Section Order (Content Column)

1. **Hero** — Full-width gradient (above the two-column grid)
2. **What Is GLP-1 Medical Weight Loss?** — Explanation + 4 benefit cards (2x2 grid)
3. **Why HCI Medical Group?** — 6 benefit cards (2x2 grid wrapping to 3 rows)
4. **What's Included** — 8-item checklist with green check icons
5. **How It Works** — 4-step vertical timeline with numbered circles and connecting lines
6. **Program Pricing** — Bordered pricing card ($299 initial / $175/mo) with transparency note
7. **Is This Program Right for You?** — Blue accent callout box with eligibility criteria
8. **Frequently Asked Questions** — 9-item accordion with JSON-LD structured data
9. **Meet Your Care Team** — Light card with icon, team description, "since 1990" badge, providers link
10. **Full-width CTA footer** — Gradient bar with phone number and address (below the two-column grid)

### Sidebar (Sticky Form)

- Sticks to viewport at `top: 80px` (below header)
- **Compact state (default):** Intent dropdown, first/last name (side-by-side row), phone, email, submit button, "or" divider, phone CTA, no-obligation note
- **Expanded state:** "+ More options" toggle reveals current patient dropdown + optional message textarea
- On mobile: renders as full-width card below the hero, then repeated above the final CTA section

---

## Navigation Changes

### New "Programs" Dropdown

Add a fourth dropdown to the main navigation between "Senior Care" and "FAQ":

```typescript
// nav-data.ts addition
{
  title: "Programs",
  links: [
    {
      title: "Medical Weight Loss",
      href: "/programs/medical-weight-loss",
      description: "Physician-supervised GLP-1 weight management program",
      icon: Scale, // or Activity from lucide-react
    },
  ],
}
```

**Future:** TRT page will be added as a second item in this dropdown.

Update both `Header.tsx` (desktop NavigationMenu) and `MobileNav.tsx` (accordion) to render the new Programs group.

---

## Files to Create

| File | Purpose |
|------|---------|
| `apps/public/src/pages/programs/MedicalWeightLoss.tsx` | Main page component |
| `apps/public/src/components/weight-loss/WeightLossForm.tsx` | Sticky sidebar enrollment form (compact/expanded states) |
| `apps/public/src/lib/schemas/weightLossSchema.ts` | Zod validation schema for the enrollment form |
| `apps/public/api/weight-loss-inquiry.ts` | Vercel serverless function — sends email via Resend |
| `apps/public/src/data/weight-loss-faqs.ts` | FAQ data array (9 items from spec) |

## Files to Modify

| File | Change |
|------|--------|
| `apps/public/src/components/layout/nav-data.ts` | Add "Programs" nav group with Medical Weight Loss link |
| `apps/public/src/components/layout/Header.tsx` | Render new Programs dropdown in desktop nav |
| `apps/public/src/components/layout/MobileNav.tsx` | Render new Programs accordion in mobile nav |
| `apps/public/src/App.tsx` | Add lazy route for `/programs/medical-weight-loss` |
| `apps/public/src/config/seo.ts` | Add `medicalWeightLoss` page SEO metadata |
| `apps/public/src/config/site.ts` | No changes needed — site config is already complete |
| `apps/public/vite.config.ts` | Add `/programs/medical-weight-loss` to `dynamicRoutes` for sitemap |

---

## Form Specification

### Fields

| Field | Type | Required | Compact | Expanded |
|-------|------|----------|---------|----------|
| Interest | Select: "Enrolling in the program" / "Getting more information" | Yes | ✓ | ✓ |
| First Name | Text | Yes | ✓ | ✓ |
| Last Name | Text | Yes | ✓ | ✓ |
| Phone | Tel | Yes | ✓ | ✓ |
| Email | Email | Yes | ✓ | ✓ |
| Current Patient | Select: "No — I'm a new patient" / "Yes — I'm an existing patient" | No | | ✓ |
| Message | Textarea | No | | ✓ |

### Validation (Zod Schema)

- `interest`: enum, required
- `firstName`: string, min 1, max 50
- `lastName`: string, min 1, max 50
- `phone`: regex for US phone format
- `email`: valid email format
- `isCurrentPatient`: optional enum
- `message`: optional string, max 500

### Submission Flow

1. Client-side Zod validation via React Hook Form
2. `POST /api/weight-loss-inquiry` with JSON body
3. Server: rate limit (5 req/min per IP), validate, send email via Resend
4. Staff email to `EMAIL_RECIPIENTS_WEIGHTLOSS` env var (fallback to `EMAIL_RECIPIENTS_APPOINTMENTS`)
5. Confirmation email to patient
6. Client: toast success, reset form

### Spam Protection

- Honeypot field (hidden input, reject if filled)
- Rate limiting on API endpoint

---

## SEO & Structured Data

### Page Meta (`seo.ts` entry)

```typescript
medicalWeightLoss: {
  title: "Medical Weight Loss Program | GLP-1 Semaglutide & Tirzepatide",
  description: "Physician-supervised GLP-1 medical weight loss program in Pasadena, CA. FDA-approved semaglutide and tirzepatide. Comprehensive medical oversight, lab monitoring, and personalized dosing. Call (626) 792-4185.",
  canonical: "/programs/medical-weight-loss",
  ogType: "website",
}
```

### JSON-LD Structured Data

Two structured data blocks on the page:

1. **MedicalBusiness** schema (from spec) — practice + program details
2. **FAQPage** schema — auto-generated via existing `ServiceFAQ` component's `generateFaqSchema()`

### Open Graph

- `og:title`: "Medical Weight Loss Program | HCI Medical Group"
- `og:description`: "Physician-supervised GLP-1 weight management in Pasadena. FDA-approved medications, lab monitoring, personalized care."
- `og:url`: "https://hcimed.com/programs/medical-weight-loss"

---

## Hero Section

- Full-width gradient background (`hero-gradient` class)
- Abstract SVG illustration (heartbeat/circles motif) positioned right, low opacity
- Content: section label, H1 "Medical Weight Loss Program", subtitle, description paragraph
- Three CTAs:
  - **"Call to Schedule — (626) 792-4185"** — `tel:` link, primary button (secondary bg)
  - **"Enroll Online"** — smooth-scrolls to sidebar form and auto-expands it, secondary button (ghost style)
  - **"Learn More"** — scrolls to first content section, text link or tertiary button

---

## Mobile Responsive Behavior

- **< 1024px (lg breakpoint):** Grid collapses to single column
- Sidebar form renders as full-width card below the hero section
- Form appears again above the final CTA footer section
- Steps timeline remains vertical (same as desktop)
- Benefit cards stack to single column below `md`
- First/last name fields stack vertically on very small screens (< 400px)
- FAQ accordion works via touch
- All phone numbers are `<a href="tel:">` for tap-to-call

---

## Accessibility

- WCAG 2.1 AA compliance
- Single H1 ("Medical Weight Loss Program"), sequential H2s for each section
- Proper form labels on all inputs
- Focus management: "Enroll Online" CTA sets focus on the form's first field
- Sufficient color contrast (primary/white and secondary/white pass AA)
- `aria-expanded` on FAQ accordion triggers
- `aria-hidden="true"` on decorative SVG illustrations
- Skip-to-content link (provided by Layout component)
- Min 44px touch targets on all interactive elements

---

## Legal/Compliance

- No specific weight loss guarantees — use "results vary" language
- No before/after patient photos
- Registered trademark symbols (®) on first mention of Ozempic, Wegovy, Mounjaro, Zepbound
- Medical disclaimer in footer: "This information is for educational purposes and does not constitute medical advice."
- No patient testimonials without consent

---

## Content Source

All section copy comes from `docs/Medical_Weight_Loss_Webpage_Spec.md` with these adjustments:
- "over [X] years" → "over 35 years" (founded 1990)
- Hero CTAs updated to include "Enroll Online" scroll-to-form
- Section 9 (Care Team) uses light card style, not dark gradient

---

## Verification Plan

1. **Dev server:** `bun run dev:public` — navigate to `http://localhost:8080/programs/medical-weight-loss`
2. **Navigation:** Verify "Programs" dropdown appears in both desktop and mobile nav with correct link
3. **Sticky form:** Scroll content column — form stays fixed on desktop. Submit button visible without scrolling.
4. **Form validation:** Test empty submission, invalid email, invalid phone — errors display correctly
5. **Form expand/collapse:** Click "More options" — additional fields animate in. Click again — they collapse.
6. **"Enroll Online" CTA:** Clicking in hero smooth-scrolls to form and auto-expands it
7. **Form submission:** Submit with valid data — check that toast appears, form resets
8. **API endpoint:** Verify email is sent to staff and confirmation to patient (check Resend dashboard or logs)
9. **Mobile:** Resize to mobile — form appears below hero as full-width card, content is single column
10. **FAQ accordion:** Click items to expand/collapse. Verify only one open at a time.
11. **SEO:** Check page title, meta description, canonical URL, JSON-LD blocks in page source
12. **Accessibility:** Tab through all interactive elements, verify focus order and labels
13. **Sitemap:** Run build and verify `/programs/medical-weight-loss` appears in generated sitemap
14. **Phone links:** Verify all `(626) 792-4185` instances are clickable tel links on mobile
