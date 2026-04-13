# Medical Weight Loss Program — Webpage Build Spec

## Overview

Build a new page at `/weight-loss` (or `/medical-weight-loss`) for hcimed.com — the public-facing website for HCI Medical Group (Health Care Institute Medical Group). This is a patient-facing landing page for a cash-pay GLP-1 medical weight loss program. The page should be conversion-oriented: the primary goal is to get the visitor to call or visit the site to sign up.

**Hosting:** Netlify  
**Domain:** hcimed.com  
**Target audience:** Adults in the Pasadena, CA area interested in physician-supervised weight loss with GLP-1 medications (semaglutide, tirzepatide)

---

## Design Direction

- Clean, professional healthcare aesthetic — this is an internal medicine practice, not a med spa
- Color palette: Navy (#1A3A6B) primary, teal (#1A8A7D) accent, white backgrounds, light blue (#E8F0FA) for highlight sections
- Typography: Clean sans-serif (system fonts or similar to the main site). Headings in navy, body in dark gray (#374151)
- Layout: Single-page scroll with distinct sections. Mobile-responsive. No sidebar.
- Tone: Trustworthy, medically credible, accessible. Avoid hype language or before/after imagery
- CTA buttons: Teal background, white text, rounded corners. Primary CTA = "Call to Schedule" linking to `tel:6267924185`. Secondary CTA = anchor to contact section.
- Include the HCI Medical Group logo in the site header (consistent with the rest of hcimed.com)

---

## Page Structure & Content

### Section 1: Hero

**Layout:** Full-width hero with navy or gradient background. Program title left-aligned or centered. Optional subtle background pattern or abstract medical illustration — no stock photos of models on scales.

**Content:**

```
Headline: Medical Weight Loss Program
Subheadline: Physician-Supervised GLP-1 Weight Management
Body: Achieve lasting, meaningful weight loss with the support of a board-certified 
physician and clinical team. FDA-approved medications. Comprehensive medical oversight. 
Real internal medicine — not a med spa.
CTA Button: "Call to Schedule — (626) 792-4185"
Secondary CTA: "Learn More" (scrolls to next section)
```

---

### Section 2: What Is GLP-1 Medical Weight Loss?

**Layout:** White background. Centered text block or two-column with an icon/illustration on one side.

**Content:**

```
GLP-1 receptor agonist medications — including semaglutide (Ozempic®, Wegovy®) and 
tirzepatide (Mounjaro®, Zepbound®) — are FDA-approved treatments that help patients 
achieve significant, sustained weight loss when combined with medical supervision.

These medications work by:
- Reducing appetite and food cravings
- Slowing gastric emptying to increase fullness
- Improving blood sugar regulation
- Supporting long-term metabolic health

Our program provides the medical oversight that makes these medications safe and 
effective — including lab monitoring, dose optimization, and management of related 
conditions like high blood pressure, diabetes, and high cholesterol.
```

---

### Section 3: Why Choose HCI Medical Group?

**Layout:** Light gray or light blue background. Grid of 6 benefit cards with teal icons.

**Content:**

```
1. Physician-Supervised Care
   Managed by an experienced internal medicine team — not a med spa or telehealth startup. 
   Your provider knows your full medical history.

2. FDA-Approved Medications Only
   We prescribe brand-name GLP-1 medications proven in clinical trials to deliver 
   significant weight loss. No compounded or unregulated alternatives.

3. Integrated Medical Management
   We monitor your blood pressure, cholesterol, blood sugar, and other health markers 
   as you lose weight — adjusting your other medications as your health improves.

4. Personalized Dose Titration
   Your medication dose is carefully adjusted based on your individual response, 
   tolerance, and lab results. No one-size-fits-all protocols.

5. Convenient & Flexible
   In-person and telehealth visits available. Monthly management visits are designed 
   to fit your schedule.

6. No Insurance Hassles
   Straightforward cash-pay pricing. No prior authorizations, no claim denials, 
   no surprise bills.
```

---

### Section 4: What's Included

**Layout:** White background. Checklist-style list with teal checkmarks.

**Content:**

```
Every patient in our Medical Weight Loss Program receives:

✓ Comprehensive initial medical evaluation (30–40 minutes)
✓ Personalized treatment plan and weight loss goal setting
✓ GLP-1 medication prescribing and dose management
✓ Monthly follow-up visits (in-person or telehealth)
✓ Lab monitoring — metabolic panel, A1c, lipid panel, thyroid function
✓ Blood pressure and comorbidity management
✓ Ongoing side effect support and clinical guidance
✓ Coordination with your existing medications and conditions
```

---

### Section 5: How It Works

**Layout:** Horizontal 4-step process with numbered circles and arrows (or a vertical timeline on mobile).

**Content:**

```
Step 1: Schedule
Book your initial consultation by calling our office or requesting an appointment online.

Step 2: Evaluate
Your provider performs a full medical evaluation including health history, physical exam, 
and baseline lab work to determine if GLP-1 medication is right for you.

Step 3: Treat
Begin your personalized medication plan with careful dose titration. 
You fill your prescription at the pharmacy of your choice.

Step 4: Monitor
Monthly visits to track your progress, review labs, adjust dosing, and manage your 
overall health as you lose weight.
```

---

### Section 6: Program Pricing

**Layout:** Centered pricing card or table with light blue background. Clean and transparent.

**Content:**

```
Initial Evaluation                    $299
Monthly Management Visit              $175 / month

- Labs are billed to your insurance when medically indicated
- Medication cost is separate — you fill your prescription at your pharmacy of choice
- No hidden fees. No long-term contracts. Cancel anytime.
```

**Note below pricing:**

```
We believe in transparent pricing. Your monthly fee covers your clinical visits, 
dose management, lab interpretation, and ongoing medical oversight. 
There are no enrollment fees, membership dues, or surprise charges.
```

---

### Section 7: Is This Program Right for You?

**Layout:** White background. Short qualification section with subtle callout box.

**Content:**

```
This program may be right for you if:

- Your BMI is 30 or higher (obesity)
- Your BMI is 27 or higher with a weight-related condition such as type 2 diabetes, 
  high blood pressure, high cholesterol, or sleep apnea
- You've struggled to achieve lasting results with diet and exercise alone
- You want medical supervision — not just a prescription

Not sure if you qualify? Call us and we'll help you determine if the program is 
a good fit before you schedule.
```

---

### Section 8: Frequently Asked Questions

**Layout:** Accordion/expandable FAQ section. White background.

**Content:**

```
Q: Do I need a referral to join the program?
A: No. You can schedule directly by calling our office. No referral needed.

Q: Will my insurance cover the GLP-1 medication?
A: Some insurance plans cover GLP-1 medications for weight loss or diabetes. 
   We'll prescribe the medication and you can check coverage with your pharmacy. 
   Many patients use manufacturer savings programs or cost-plus pharmacies to 
   reduce out-of-pocket costs.

Q: What medications do you prescribe?
A: We prescribe FDA-approved brand-name GLP-1 medications: semaglutide 
   (Ozempic®, Wegovy®) and tirzepatide (Mounjaro®, Zepbound®). We do not 
   prescribe compounded versions of these medications.

Q: Do you sell or dispense the medication?
A: No. We write the prescription and you fill it at the pharmacy of your choice. 
   This keeps medication costs transparent and gives you the flexibility to shop 
   for the best price.

Q: Can I do visits via telehealth?
A: Yes. After your initial evaluation (which we recommend in-person), follow-up 
   visits can be conducted via telehealth when clinically appropriate.

Q: How much weight can I expect to lose?
A: Clinical trials have shown average weight loss of 15–20% of body weight with 
   semaglutide and up to 20–25% with tirzepatide over 12–18 months. Individual 
   results vary based on starting weight, medication adherence, and lifestyle factors.

Q: What happens if I stop the medication?
A: Weight regain is common after stopping GLP-1 medications. We'll work with you 
   on a long-term plan that may include continued low-dose maintenance, lifestyle 
   strategies, and ongoing monitoring.

Q: Is this safe for people with diabetes?
A: Yes — in fact, GLP-1 medications were originally developed for type 2 diabetes 
   management. If you're on diabetes medications, we'll coordinate your care to 
   avoid hypoglycemia and adjust your other medications as your blood sugar improves.

Q: What are the common side effects?
A: The most common side effects are GI-related: nausea, constipation, and diarrhea, 
   especially during dose titration. These are typically mild, temporary, and 
   manageable. We monitor you closely and adjust dosing to minimize side effects.
```

---

### Section 9: Meet Your Care Team (Optional)

**Layout:** Brief team mention — don't need full bios unless photos are available. Keep it credible.

**Content:**

```
Your care is led by our internal medicine team, including a board-certified physician 
medical director and experienced nurse practitioners. Every treatment plan is 
physician-supervised and tailored to your individual health profile.

HCI Medical Group has been providing comprehensive internal medicine care in 
Pasadena for over [X] years.
```

---

### Section 10: Call to Action / Contact

**Layout:** Full-width teal or navy background. Large CTA. Phone number prominent. Address and map optional.

**Content:**

```
Headline: Ready to Get Started?
Subheadline: Call us or visit our office to sign up for the Medical Weight Loss Program.

Phone: (626) 792-4185
Address: 65 N. Madison Ave. #709, Pasadena, CA 91101
Website: www.hcimed.com

CTA Button: "Call Now — (626) 792-4185"
```

**Optional:** Embed a Google Maps iframe showing the office location.

---

## SEO & Metadata

```
<title>Medical Weight Loss Program | GLP-1 Semaglutide & Tirzepatide | HCI Medical Group Pasadena</title>

<meta name="description" content="Physician-supervised GLP-1 medical weight loss program in Pasadena, CA. FDA-approved semaglutide and tirzepatide. Comprehensive medical oversight, lab monitoring, and personalized dosing. Call (626) 792-4185.">

<meta name="keywords" content="medical weight loss, GLP-1, semaglutide, tirzepatide, Ozempic, Wegovy, Mounjaro, Zepbound, weight loss doctor Pasadena, physician supervised weight loss, HCI Medical Group">
```

**Open Graph:**
```
og:title — Medical Weight Loss Program | HCI Medical Group
og:description — Physician-supervised GLP-1 weight management in Pasadena. FDA-approved medications, lab monitoring, personalized care.
og:type — website
og:url — https://www.hcimed.com/weight-loss
```

**Structured Data (JSON-LD):**

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "HCI Medical Group - Medical Weight Loss Program",
  "description": "Physician-supervised GLP-1 medical weight loss program offering semaglutide and tirzepatide management.",
  "url": "https://www.hcimed.com/weight-loss",
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
    "name": "GLP-1 Medical Weight Loss Program",
    "description": "Cash-pay medical weight management using FDA-approved GLP-1 receptor agonist medications with comprehensive physician oversight."
  }
}
```

---

## Technical Notes

- **Hosting:** Netlify (static site or SSR depending on current hcimed.com setup)
- **Responsive:** Mobile-first design. All sections stack vertically on mobile. FAQ accordion works on touch.
- **Performance:** Optimize for Core Web Vitals. No heavy images or video unless lazy-loaded. Target < 2s LCP.
- **Accessibility:** WCAG 2.1 AA minimum. Proper heading hierarchy (single H1, sequential H2s). Alt text on any images. Sufficient color contrast ratios (the navy/white and teal/white combinations pass AA).
- **Phone link:** All phone numbers use `<a href="tel:6267924185">` for tap-to-call on mobile.
- **Analytics:** Ensure page is tracked in whatever analytics is active on hcimed.com (Google Analytics, etc.). Consider event tracking on CTA button clicks.
- **Navigation:** Add "Weight Loss" or "Medical Weight Loss" to the site's main navigation menu under a "Services" dropdown if one exists, or as a top-level nav item.

---

## Legal / Compliance Notes

- Do not make specific weight loss guarantees. Use "results vary" language.
- Do not use before/after patient photos without proper consent and disclaimers.
- Ozempic®, Wegovy®, Mounjaro®, and Zepbound® are registered trademarks of their respective manufacturers. Use ® on first mention.
- Include a general medical disclaimer in the site footer: "This information is for educational purposes and does not constitute medical advice. Consult with a healthcare provider to determine if this program is appropriate for you."
- No patient testimonials without written consent and appropriate disclaimers per FTC guidelines.
