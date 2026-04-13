# Men's Health TRT Program — Webpage Build Spec

## Overview

Build a new page at `/mens-health` (or `/trt`) for hcimed.com — the public-facing website for HCI Medical Group (Health Care Institute Medical Group). This is a patient-facing landing page for a cash-pay testosterone replacement therapy program with in-office injection administration. The page should be conversion-oriented: the primary goal is to get the visitor to call or visit the site to sign up.

**Hosting:** Netlify  
**Domain:** hcimed.com  
**Target audience:** Men in the Pasadena, CA area experiencing symptoms of low testosterone — fatigue, low libido, loss of muscle mass, brain fog, mood changes — who want physician-supervised treatment within a real medical practice.

---

## Design Direction

- Clean, professional healthcare aesthetic — this is an internal medicine practice, not a testosterone mill or anti-aging clinic
- Color palette: Navy (#1A3A6B) primary, teal (#1A8A7D) accent, white backgrounds, light blue (#E8F0FA) for highlight sections — consistent with the Medical Weight Loss page and overall hcimed.com branding
- Typography: Clean sans-serif (system fonts or matching the main site). Headings in navy, body in dark gray (#374151)
- Layout: Single-page scroll with distinct sections. Mobile-responsive. No sidebar. Mirrors the structure of the Medical Weight Loss page for brand consistency.
- Tone: Confident, medically credible, straightforward. Speak to men directly without hype or "biohacking" language. Avoid shirtless stock photos or bodybuilding imagery.
- CTA buttons: Teal background, white text, rounded corners. Primary CTA = "Call to Schedule" linking to `tel:6267924185`. Secondary CTA = anchor to contact section.
- Include the HCI Medical Group logo in the site header (consistent with the rest of hcimed.com)

---

## Page Structure & Content

### Section 1: Hero

**Layout:** Full-width hero with navy or gradient background. Program title left-aligned or centered. Optional subtle abstract illustration — no stock photos of muscular men or gym imagery.

**Content:**

```
Headline: Men's Health & Testosterone Replacement Therapy
Subheadline: Physician-Supervised TRT with In-Office Injections
Body: Restore your energy, strength, and vitality with testosterone replacement therapy 
managed by an experienced internal medicine team. Comprehensive evaluation, in-office 
injections, and ongoing lab monitoring — all under one roof.
CTA Button: "Call to Schedule — (626) 792-4185"
Secondary CTA: "Learn More" (scrolls to next section)
```

---

### Section 2: What Is Testosterone Replacement Therapy?

**Layout:** White background. Centered text block or two-column with an icon/illustration on one side.

**Content:**

```
Testosterone is the primary male sex hormone responsible for energy, muscle mass, 
bone density, libido, mood, and cognitive function. Testosterone levels naturally 
decline with age — roughly 1–2% per year after age 30 — but for many men, levels 
drop below the threshold where symptoms become significant.

Low testosterone (hypogonadism) is a clinically recognized medical condition, 
not just a normal part of aging. When confirmed by lab testing, testosterone 
replacement therapy can restore hormone levels to a healthy range and relieve 
symptoms that affect daily quality of life.

Our program goes beyond simply prescribing testosterone. As an internal medicine 
practice, we evaluate and manage your complete health picture — cardiovascular risk, 
metabolic health, prostate safety, and blood counts — ensuring your treatment is 
both effective and safe for the long term.
```

---

### Section 3: Common Signs of Low Testosterone

**Layout:** Light gray or light blue background. Grid of symptom cards with icons — 2 or 3 columns.

**Content:**

```
Could low testosterone be affecting you? Common signs include:

1. Persistent Fatigue
   Feeling tired despite adequate sleep. Low motivation. Difficulty getting 
   through the day without caffeine or naps.

2. Low Libido & Sexual Dysfunction
   Decreased sex drive, difficulty achieving or maintaining erections, 
   reduced sexual satisfaction.

3. Loss of Muscle Mass & Strength
   Difficulty building or maintaining muscle despite regular exercise. 
   Feeling weaker than you used to.

4. Increased Body Fat
   Weight gain — especially around the midsection — that doesn't respond 
   to diet and exercise the way it used to.

5. Brain Fog & Poor Concentration
   Difficulty focusing, memory lapses, feeling mentally "slow" or unfocused.

6. Mood Changes
   Irritability, depressed mood, low motivation, or a general sense 
   that something is "off."

7. Poor Sleep Quality
   Difficulty falling asleep, staying asleep, or waking up feeling unrested.

8. Decreased Bone Density
   Increased risk of fractures or a diagnosis of osteopenia/osteoporosis.
```

**Below the grid:**

```
If you're experiencing several of these symptoms, a simple morning blood test can 
determine whether low testosterone is a contributing factor. We'll evaluate your 
full health picture before recommending any treatment.
```

---

### Section 4: Why Choose HCI Medical Group?

**Layout:** White background. Grid of 6 benefit cards with teal icons. Same layout pattern as the weight loss page.

**Content:**

```
1. Physician-Supervised Care
   Managed by an internal medicine team — not a testosterone mill or telehealth 
   startup. Your provider manages your complete health, not just your T levels.

2. In-Office Injections
   Convenient weekly testosterone injections administered by our clinical staff 
   at every visit. No need to self-inject at home — just show up.

3. Integrated Medical Management
   We manage the full picture — blood pressure, cholesterol, blood sugar, 
   prostate health, and cardiovascular risk — not just testosterone.

4. Lab-Driven Dose Optimization
   Your dose is guided by trough levels, hematocrit, PSA, estradiol, and your 
   symptom response. We titrate carefully to your optimal range — not a 
   one-size-fits-all protocol.

5. Safety-First Monitoring
   Regular lab draws to monitor hematocrit (blood thickness), PSA (prostate marker), 
   liver function, and metabolic health. We catch problems early.

6. No Insurance Hassles
   Straightforward cash-pay pricing with medication included in your monthly fee. 
   No prior authorizations, no claim denials, no surprise bills.
```

---

### Section 5: What's Included

**Layout:** White or light background. Checklist-style list with teal checkmarks.

**Content:**

```
Every patient in our Men's Health TRT Program receives:

✓ Comprehensive men's health evaluation (30–45 minutes)
✓ Full hormone and metabolic lab panel
✓ Testosterone prescribing and dose optimization
✓ Weekly in-office testosterone injection administration
✓ Testosterone medication included in your monthly fee
✓ Ongoing lab monitoring (CBC, PSA, lipid panel, estradiol, metabolic panel)
✓ Erectile dysfunction evaluation and treatment when indicated
✓ Comorbidity management — blood pressure, cholesterol, diabetes
✓ CURES database compliance checks (controlled substance safety)
```

---

### Section 6: How It Works

**Layout:** Horizontal 4-step process with numbered circles and arrows (vertical timeline on mobile). Same component as the weight loss page.

**Content:**

```
Step 1: Evaluate
Book your initial consultation. Your provider performs a comprehensive health 
evaluation including symptom assessment, physical exam, and baseline lab orders.

Step 2: Diagnose
Low testosterone is confirmed with two separate morning blood draws (fasting, 
before 10 AM) — per Endocrine Society guidelines. We also evaluate for 
underlying causes.

Step 3: Treat
Begin weekly testosterone cypionate injections administered in our office 
by clinical staff. Dosing starts conservative and is adjusted based on your 
labs and symptom response.

Step 4: Optimize
Ongoing lab monitoring and dose adjustments to keep you in your optimal range. 
Regular safety labs (hematocrit, PSA) ensure your treatment stays safe long-term.
```

---

### Section 7: Program Pricing

**Layout:** Centered pricing card or table with light blue background. Two-tier pricing clearly explained.

**Content:**

```
Initial Men's Health Evaluation                       $349
Monthly TRT — In-Office Injections                    $249 / month
Monthly TRT — Self-Injection (monitoring only)        $150 / month

What's included in the monthly injection fee:
- Weekly in-office testosterone cypionate injections
- Testosterone medication (included — no separate Rx cost)
- Clinical oversight, dose management, and side effect monitoring

Additional notes:
- Labs are billed to your insurance when medically indicated
- No hidden fees. No long-term contracts. Cancel anytime.
```

**Note below pricing:**

```
Most patients choose the in-office injection plan — it's the most convenient option 
and ensures you never miss a dose. For patients who prefer to self-inject at home, 
we provide training and a prescription, with regular monitoring visits to keep 
your treatment on track.
```

---

### Section 8: Frequently Asked Questions

**Layout:** Accordion/expandable FAQ section. White background.

**Content:**

```
Q: How do I know if I have low testosterone?
A: Low testosterone is diagnosed with a blood test. We require two separate morning 
   fasting blood draws (before 10 AM) showing total testosterone below 300 ng/dL, 
   along with symptoms consistent with hypogonadism. A single low reading is not 
   enough to diagnose — we follow Endocrine Society guidelines.

Q: Do I need a referral?
A: No. You can schedule directly by calling our office. No referral is needed.

Q: What type of testosterone do you use?
A: We administer testosterone cypionate, the most widely prescribed and studied 
   form of injectable testosterone. It's an FDA-approved, brand-name medication — 
   not a compounded or experimental formulation.

Q: Does it hurt?
A: Most patients describe the injection as a brief pinch. We offer both intramuscular 
   and subcutaneous injection options. Subcutaneous uses a smaller needle and is 
   generally more comfortable. Our clinical staff administers the injection — you 
   don't have to do it yourself.

Q: How often do I need to come in?
A: For the in-office injection plan, you'll visit weekly for your injection 
   (about 10–15 minutes). You'll also have more in-depth clinical check-ins 
   monthly during the first 6 months, then every 6–8 weeks once stable.

Q: Is testosterone safe?
A: Testosterone replacement therapy is safe when properly monitored. The key risks 
   we watch for are elevated hematocrit (blood thickening), changes in PSA 
   (prostate marker), and cardiovascular effects. That's why we require regular 
   lab monitoring — it's not optional in our program. Our team monitors your labs 
   closely and adjusts treatment proactively.

Q: Will TRT affect my fertility?
A: Yes — testosterone therapy suppresses sperm production and can significantly 
   reduce fertility. If you're planning to have children, we'll discuss this in 
   detail before starting treatment. Alternative approaches (such as hCG or 
   clomiphene) may be considered for men who want to preserve fertility.

Q: Will my insurance cover testosterone?
A: Our program is cash-pay, meaning we don't bill insurance for the visits or 
   injections. However, testosterone medication is included in your monthly 
   injection fee at no additional cost. Labs ordered for medical evaluation 
   can typically be billed to your insurance.

Q: Can I switch from another TRT provider?
A: Yes. We'll need your recent lab work and will perform our own evaluation 
   before continuing treatment. We can usually transition you without a gap 
   in therapy.

Q: What about erectile dysfunction?
A: ED evaluation and treatment (including PDE5 inhibitors like sildenafil or 
   tadalafil) is available as part of the program. Many men find that ED improves 
   with testosterone optimization, but we can prescribe additional medications 
   when needed.

Q: What happens if I stop TRT?
A: Testosterone levels will return to their pre-treatment baseline over several 
   weeks. Symptoms of low T will likely return. For some men, the body's natural 
   testosterone production may take time to recover. We'll guide you through 
   a supervised taper if you decide to discontinue.
```

---

### Section 9: What We Treat Beyond TRT (Optional — Broader Men's Health)

**Layout:** Simple icon list or horizontal card strip. Positions the program as comprehensive men's health, not just a testosterone service.

**Content:**

```
Our Men's Health Program addresses the full spectrum of men's health concerns:

- Low Testosterone & Hormone Optimization
- Erectile Dysfunction
- Fatigue & Energy Management
- Metabolic Syndrome & Weight Management
- Cardiovascular Risk Assessment
- Prostate Health Monitoring
- Vitamin D & Micronutrient Optimization
- Blood Pressure & Cholesterol Management

Every visit is an opportunity to address your complete health — 
not just one number on a lab report.
```

---

### Section 10: Call to Action / Contact

**Layout:** Full-width teal or navy background. Large CTA. Phone number prominent. Same component as the weight loss page.

**Content:**

```
Headline: Ready to Take the Next Step?
Subheadline: Call us or visit our office to schedule your Men's Health evaluation.

Phone: (626) 792-4185
Address: 65 N. Madison Ave. #709, Pasadena, CA 91101
Website: www.hcimed.com

CTA Button: "Call Now — (626) 792-4185"
```

**Optional:** Embed a Google Maps iframe showing the office location (shared component with weight loss page).

---

## SEO & Metadata

```
<title>Men's Health & TRT Program | Testosterone Replacement Therapy | HCI Medical Group Pasadena</title>

<meta name="description" content="Physician-supervised testosterone replacement therapy in Pasadena, CA. In-office injections, lab monitoring, and comprehensive men's health management. Testosterone included in monthly fee. Call (626) 792-4185.">

<meta name="keywords" content="testosterone replacement therapy, TRT, low testosterone, low T, men's health, testosterone injections, testosterone doctor Pasadena, HCI Medical Group, hypogonadism, erectile dysfunction, hormone therapy">
```

**Open Graph:**
```
og:title — Men's Health & TRT Program | HCI Medical Group
og:description — Physician-supervised testosterone replacement therapy in Pasadena. In-office injections, lab monitoring, comprehensive men's health care.
og:type — website
og:url — https://www.hcimed.com/mens-health
```

**Structured Data (JSON-LD):**

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "HCI Medical Group - Men's Health & TRT Program",
  "description": "Physician-supervised testosterone replacement therapy program with in-office injection administration and comprehensive men's health management.",
  "url": "https://www.hcimed.com/mens-health",
  "telephone": "+1-626-792-4185",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "65 N. Madison Ave. #709",
    "addressLocality": "Pasadena",
    "addressRegion": "CA",
    "postalCode": "91101",
    "addressCountry": "US"
  },
  "medicalSpecialty": "Internal Medicine",
  "availableService": {
    "@type": "MedicalTherapy",
    "name": "Testosterone Replacement Therapy Program",
    "description": "Cash-pay testosterone replacement therapy with in-office injection administration, lab monitoring, and integrated men's health management."
  }
}
```

---

## Technical Notes

- **Hosting:** Netlify (consistent with hcimed.com)
- **Shared components with Weight Loss page:** Hero layout, benefit card grid, how-it-works stepper, pricing card, FAQ accordion, CTA footer, Google Maps embed. These should be built as reusable components.
- **Responsive:** Mobile-first design. All sections stack vertically on mobile. FAQ accordion works on touch. Symptom grid collapses to single column.
- **Performance:** Optimize for Core Web Vitals. No heavy images or video unless lazy-loaded. Target < 2s LCP.
- **Accessibility:** WCAG 2.1 AA minimum. Proper heading hierarchy (single H1, sequential H2s). Alt text on any images. Sufficient color contrast ratios.
- **Phone link:** All phone numbers use `<a href="tel:6267924185">` for tap-to-call on mobile.
- **Analytics:** Ensure page is tracked in whatever analytics is active on hcimed.com. Consider event tracking on CTA button clicks. Track which page (weight loss vs. TRT) drives more calls.
- **Navigation:** Add "Men's Health" or "TRT Program" to the site's main navigation menu alongside the "Weight Loss" link — either under a "Services" dropdown or as a top-level nav item.
- **Cross-linking:** Add a subtle cross-promotion at the bottom of each service page. On the TRT page: "Also offering: Medical Weight Loss Program →". On the Weight Loss page: "Also offering: Men's Health & TRT Program →". This keeps patients on the site if they came in looking for one service but are interested in another.

---

## Legal / Compliance Notes

- Testosterone is a Schedule III controlled substance — do not use language that minimizes this or implies casual use
- Do not make specific performance, body composition, or libido guarantees. Use "results vary" and "individual response" language.
- Do not use before/after patient photos without proper consent and disclaimers
- Include a general medical disclaimer in the site footer: "This information is for educational purposes and does not constitute medical advice. Consult with a healthcare provider to determine if this program is appropriate for you."
- Fertility warning should be clearly stated on the page (Section 8 FAQ covers this), not buried in fine print
- No patient testimonials without written consent and appropriate disclaimers per FTC guidelines
- Ozempic®, Wegovy®, Mounjaro®, and Zepbound® referenced in cross-promotion should use ® on first mention
