import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Clock, Activity, Shield, Heart,
  Stethoscope, DollarSign, Calendar, CheckCircle,
  Users, Phone, MapPin, Scale, Syringe, ArrowRight,
} from "lucide-react";
import { Button } from "@hci/shared/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { ServiceFAQ } from "@/components/faq/ServiceFAQ";
import { WeightLossForm } from "@/components/weight-loss/WeightLossForm";
import { pageSEO } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { weightLossFaqs } from "@/data/weight-loss-faqs";

const medicalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "HCI Medical Group - Medical Weight Loss Program",
  description:
    "Physician-supervised GLP-1 medical weight loss program offering semaglutide and tirzepatide management.",
  url: `${siteConfig.url}/programs/medical-weight-loss`,
  telephone: "+1-626-792-4185",
  address: {
    "@type": "PostalAddress",
    streetAddress: "65 N. Madison Ave. #709",
    addressLocality: "Pasadena",
    addressRegion: "CA",
    postalCode: "91101",
    addressCountry: "US",
  },
  medicalSpecialty: "Internal Medicine",
  availableService: {
    "@type": "MedicalTherapy",
    name: "GLP-1 Medical Weight Loss Program",
    description:
      "Cash-pay medical weight management using FDA-approved GLP-1 receptor agonist medications with comprehensive physician oversight.",
  },
};

const glp1Benefits = [
  { icon: Clock, title: "Reduces Appetite", description: "Decreases food cravings and hunger signals naturally" },
  { icon: Activity, title: "Metabolic Health", description: "Improves blood sugar regulation and long-term health" },
  { icon: Shield, title: "Increases Fullness", description: "Slows gastric emptying so you feel satisfied longer" },
  { icon: Heart, title: "Medical Oversight", description: "Lab monitoring, dose optimization, and comorbidity management" },
];

const whyHciCards = [
  { icon: Stethoscope, title: "Physician-Supervised Care", description: "Managed by an experienced internal medicine team — not a med spa or telehealth startup. Your provider knows your full medical history." },
  { icon: Shield, title: "FDA-Approved Medications Only", description: "We prescribe brand-name GLP-1 medications proven in clinical trials to deliver significant weight loss. No compounded or unregulated alternatives." },
  { icon: Activity, title: "Integrated Medical Management", description: "We monitor your blood pressure, cholesterol, blood sugar, and other health markers as you lose weight — adjusting your other medications as your health improves." },
  { icon: Heart, title: "Personalized Dose Titration", description: "Your medication dose is carefully adjusted based on your individual response, tolerance, and lab results. No one-size-fits-all protocols." },
  { icon: Calendar, title: "Convenient & Flexible", description: "In-person and telehealth visits available. Monthly management visits are designed to fit your schedule." },
  { icon: DollarSign, title: "No Insurance Hassles", description: "Straightforward cash-pay pricing. No prior authorizations, no claim denials, no surprise bills." },
];

const includedItems = [
  "Comprehensive initial medical evaluation (30–40 minutes)",
  "Personalized treatment plan and weight loss goal setting",
  "GLP-1 medication prescribing and dose management",
  "Monthly follow-up visits (in-person or telehealth)",
  "Lab monitoring — metabolic panel, A1c, lipid panel, thyroid function",
  "Blood pressure and comorbidity management",
  "Ongoing side effect support and clinical guidance",
  "Coordination with your existing medications and conditions",
];

const steps = [
  { num: 1, title: "Schedule", description: "Book your initial consultation by calling our office or submitting the form on this page." },
  { num: 2, title: "Evaluate", description: "Your provider performs a full medical evaluation including health history, physical exam, and baseline lab work to determine if GLP-1 medication is right for you." },
  { num: 3, title: "Treat", description: "Begin your personalized medication plan with careful dose titration. You fill your prescription at the pharmacy of your choice." },
  { num: 4, title: "Monitor", description: "Monthly visits to track your progress, review labs, adjust dosing, and manage your overall health as you lose weight." },
];

const eligibilityCriteria = [
  "Your BMI is 30 or higher (obesity)",
  "Your BMI is 27 or higher with a weight-related condition such as type 2 diabetes, high blood pressure, high cholesterol, or sleep apnea",
  "You've struggled to achieve lasting results with diet and exercise alone",
  "You want medical supervision — not just a prescription",
];

export default function MedicalWeightLoss() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Focus the first input after scroll
    setTimeout(() => {
      const firstInput = formRef.current?.querySelector<HTMLInputElement>("input[name='firstName']");
      firstInput?.focus();
    }, 600);
  };

  return (
    <Layout>
      <SEO
        {...pageSEO.medicalWeightLoss}
        structuredData={medicalBusinessSchema}
      />
      <Helmet>
        <meta
          name="keywords"
          content="medical weight loss, GLP-1, semaglutide, tirzepatide, Ozempic, Wegovy, Mounjaro, Zepbound, weight loss doctor Pasadena, physician supervised weight loss, HCI Medical Group"
        />
      </Helmet>

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden py-16 md:py-24">
        {/* Decorative SVG illustration */}
        <svg
          className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 hidden md:block"
          width="320"
          height="320"
          viewBox="0 0 320 320"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="160" cy="160" r="140" stroke="white" strokeWidth="2" opacity="0.4" />
          <circle cx="160" cy="160" r="95" stroke="white" strokeWidth="1.5" opacity="0.25" />
          <path d="M60 160 L120 160 L140 105 L160 215 L180 130 L200 160 L260 160" stroke="white" strokeWidth="3" fill="none" opacity="0.5" />
          <circle cx="160" cy="160" r="6" fill="white" opacity="0.4" />
        </svg>

        <div className="container relative z-10">
          <p className="text-sm text-primary-foreground/70 font-medium tracking-wide uppercase mb-3 animate-fade-in">
            HCI Medical Group — Pasadena, CA
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 animate-fade-in stagger-1">
            Medical Weight Loss
            <br />
            Program
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 font-light mb-2 animate-fade-in stagger-2">
            Physician-Supervised GLP-1 Weight Management
          </p>
          <p className="text-base text-primary-foreground/75 max-w-xl mb-8 animate-fade-in stagger-3">
            Achieve lasting, meaningful weight loss with the support of a board-certified
            physician and clinical team. FDA-approved medications. Comprehensive medical
            oversight. Real internal medicine — not a med spa.
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-in stagger-4">
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-base px-6 min-h-[48px] transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <a href={`tel:${siteConfig.contact.phoneRaw}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call to Schedule — {siteConfig.contact.phone}
              </a>
            </Button>
            <Button
              size="lg"
              onClick={scrollToForm}
              className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary text-base px-6 min-h-[48px] transition-all duration-300 hover:scale-105"
            >
              <Scale className="h-4 w-4 mr-2" />
              Enroll Online
            </Button>
            <Button
              asChild
              variant="link"
              className="text-primary-foreground/80 hover:text-primary-foreground text-base"
            >
              <a href="#glp1-info">Learn More ↓</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Two-column layout: content + sticky sidebar */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-12 items-start">

          {/* Left: Content Column */}
          <div className="space-y-16">

            {/* Mobile form placement — shown only on mobile, above content */}
            <div className="lg:hidden" ref={formRef}>
              <WeightLossForm />
            </div>

            {/* What Is GLP-1? */}
            <section id="glp1-info">
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Understanding the Treatment</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                What Is GLP-1 Medical Weight Loss?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                GLP-1 receptor agonist medications — including semaglutide (Ozempic®, Wegovy®)
                and tirzepatide (Mounjaro®, Zepbound®) — are FDA-approved treatments that help
                patients achieve significant, sustained weight loss when combined with medical supervision.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {glp1Benefits.map((benefit) => (
                  <div key={benefit.title} className="bg-card rounded-xl p-5 card-shadow border border-border">
                    <div className="w-11 h-11 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                      <benefit.icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Why Choose HCI? */}
            <section>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Why Choose Us</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                Why HCI Medical Group?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whyHciCards.map((card) => (
                  <div key={card.title} className="bg-card rounded-xl p-5 card-shadow border border-border">
                    <div className="w-11 h-11 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                      <card.icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{card.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* What's Included */}
            <section>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Program Details</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                What's Included
              </h2>
              <p className="text-muted-foreground mb-4">
                Every patient in our Medical Weight Loss Program receives:
              </p>
              <ul className="space-y-0">
                {includedItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" aria-hidden="true" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* How It Works */}
            <section>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Getting Started</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                How It Works
              </h2>
              <div className="space-y-0">
                {steps.map((step, i) => (
                  <div key={step.num} className="flex gap-4 relative">
                    {/* Connector line */}
                    {i < steps.length - 1 && (
                      <div className="absolute left-[19px] top-[48px] bottom-0 w-0.5 bg-border" aria-hidden="true" />
                    )}
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0 relative z-10">
                      {step.num}
                    </div>
                    <div className="pb-8">
                      <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing */}
            <section>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Transparent Pricing</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Program Pricing
              </h2>
              <div className="bg-card rounded-xl card-shadow border-2 border-secondary overflow-hidden">
                <div className="bg-accent px-6 py-4">
                  <h3 className="font-display text-lg font-semibold text-foreground">Simple, Transparent Pricing</h3>
                </div>
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-foreground">Initial Evaluation</span>
                    <span className="text-xl font-bold text-primary">$299</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-foreground">Monthly Management Visit</span>
                    <span className="text-xl font-bold text-primary">
                      $175<span className="text-sm font-normal text-muted-foreground"> / month</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border leading-relaxed">
                    Labs are billed to your insurance when medically indicated. Medication cost is separate — you fill
                    your prescription at the pharmacy of your choice. No hidden fees. No long-term contracts. Cancel anytime.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                We believe in transparent pricing. Your monthly fee covers your clinical visits,
                dose management, lab interpretation, and ongoing medical oversight.
                There are no enrollment fees, membership dues, or surprise charges.
              </p>
            </section>

            {/* Is This Right for You? */}
            <section>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Eligibility</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Is This Program Right for You?
              </h2>
              <div className="bg-accent rounded-xl p-6 border-l-4 border-secondary">
                <p className="font-medium text-foreground mb-3">This program may be right for you if:</p>
                <ul className="space-y-2">
                  {eligibilityCriteria.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-secondary font-bold mt-0.5">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Not sure if you qualify? Call us at{" "}
                  <a href={`tel:${siteConfig.contact.phoneRaw}`} className="font-semibold text-foreground hover:text-secondary transition-colors">
                    {siteConfig.contact.phone}
                  </a>{" "}
                  and we'll help you determine if the program is a good fit before you schedule.
                </p>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Common Questions</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Frequently Asked Questions
              </h2>
              <ServiceFAQ faqs={weightLossFaqs} title="" />
            </section>

            {/* Care Team */}
            <section>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Your Providers</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Meet Your Care Team
              </h2>
              <div className="bg-card rounded-xl card-shadow border border-border p-6 flex gap-5 items-start">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-7 w-7 text-secondary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    Experienced Internal Medicine Team
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Your care is led by our internal medicine team, including a board-certified physician
                    medical director and experienced nurse practitioners. Every treatment plan is
                    physician-supervised and tailored to your individual health profile.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-md text-xs font-semibold text-secondary mb-3">
                    <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
                    Serving Pasadena since 1990 — 35+ years
                  </div>
                  <p>
                    <Link to="/providers" className="text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors">
                      Meet our providers →
                    </Link>
                  </p>
                </div>
              </div>
            </section>

            {/* Cross-promotion: TRT */}
            <section className="bg-accent/50 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Syringe className="h-6 w-6 text-secondary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Also offering: Men's Health & TRT Program</p>
                <p className="text-xs text-muted-foreground">Physician-supervised testosterone replacement therapy with in-office injections.</p>
              </div>
              <Link
                to="/programs/mens-health-trt"
                className="flex items-center gap-1 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors flex-shrink-0"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            {/* Mobile: repeat form above CTA */}
            <div className="lg:hidden">
              <WeightLossForm id="weight-loss-form-bottom" />
            </div>
          </div>

          {/* Right: Sticky Sidebar Form (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-[120px]" ref={formRef}>
              <WeightLossForm />
            </div>
          </div>
        </div>
      </div>

      {/* Full-width CTA Footer */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-foreground/85 mb-8 max-w-lg mx-auto">
            Call us or visit our office to sign up for the Medical Weight Loss Program.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 min-h-[52px] transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <a href={`tel:${siteConfig.contact.phoneRaw}`}>
                <Phone className="h-5 w-5 mr-2" />
                Call Now — {siteConfig.contact.phone}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 min-h-[52px] transition-all duration-300 hover:scale-105"
            >
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.state} ${siteConfig.address.zip}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="h-5 w-5 mr-2" />
                {siteConfig.address.street}, {siteConfig.address.city}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Medical Disclaimer */}
      <div className="bg-primary py-4">
        <p className="container text-center text-xs text-primary-foreground/60">
          This information is for educational purposes and does not constitute medical advice.
          Consult with a healthcare provider to determine if this program is appropriate for you.
          Individual results vary. Ozempic®, Wegovy®, Mounjaro®, and Zepbound® are registered trademarks of their respective manufacturers.
        </p>
      </div>
    </Layout>
  );
}
