import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Stethoscope, Syringe, Activity, Heart, DollarSign, Shield,
  CheckCircle, Users, Phone, MapPin, Zap,
  BatteryLow, Brain, Dumbbell, Moon, Bone, Frown, Scale,
  ArrowRight,
} from "lucide-react";
import { Button } from "@hci/shared/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { ServiceFAQ } from "@/components/faq/ServiceFAQ";
import { TRTForm } from "@/components/trt/TRTForm";
import { pageSEO } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { trtFaqs } from "@/data/trt-faqs";
import trtHero from "@/assets/hero/trt-hero.png";

const medicalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "HCI Medical Group - Men's Health & TRT Program",
  description:
    "Physician-supervised testosterone replacement therapy program with in-office injection administration and comprehensive men's health management.",
  url: `${siteConfig.url}/programs/mens-health-trt`,
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
    name: "Testosterone Replacement Therapy Program",
    description:
      "Cash-pay testosterone replacement therapy with in-office injection administration, lab monitoring, and integrated men's health management.",
  },
};

const symptomCards = [
  { icon: BatteryLow, title: "Persistent Fatigue", description: "Feeling tired despite adequate sleep. Low motivation. Difficulty getting through the day without caffeine or naps." },
  { icon: Heart, title: "Low Libido & Sexual Dysfunction", description: "Decreased sex drive, difficulty achieving or maintaining erections, reduced sexual satisfaction." },
  { icon: Dumbbell, title: "Loss of Muscle Mass & Strength", description: "Difficulty building or maintaining muscle despite regular exercise. Feeling weaker than you used to." },
  { icon: Scale, title: "Increased Body Fat", description: "Weight gain — especially around the midsection — that doesn't respond to diet and exercise the way it used to." },
  { icon: Brain, title: "Brain Fog & Poor Concentration", description: "Difficulty focusing, memory lapses, feeling mentally \"slow\" or unfocused." },
  { icon: Frown, title: "Mood Changes", description: "Irritability, depressed mood, low motivation, or a general sense that something is \"off.\"" },
  { icon: Moon, title: "Poor Sleep Quality", description: "Difficulty falling asleep, staying asleep, or waking up feeling unrested." },
  { icon: Bone, title: "Decreased Bone Density", description: "Increased risk of fractures or a diagnosis of osteopenia/osteoporosis." },
];

const whyHciCards = [
  { icon: Stethoscope, title: "Physician-Supervised Care", description: "Managed by an internal medicine team — not a testosterone mill or telehealth startup. Your provider manages your complete health, not just your T levels." },
  { icon: Syringe, title: "In-Office Injections", description: "Convenient weekly testosterone injections administered by our clinical staff at every visit. No need to self-inject at home — just show up." },
  { icon: Activity, title: "Integrated Medical Management", description: "We manage the full picture — blood pressure, cholesterol, blood sugar, prostate health, and cardiovascular risk — not just testosterone." },
  { icon: Zap, title: "Lab-Driven Dose Optimization", description: "Your dose is guided by trough levels, hematocrit, PSA, estradiol, and your symptom response. We titrate carefully to your optimal range." },
  { icon: Shield, title: "Safety-First Monitoring", description: "Regular lab draws to monitor hematocrit, PSA, liver function, and metabolic health. We catch problems early." },
  { icon: DollarSign, title: "No Insurance Hassles", description: "Straightforward cash-pay pricing with medication included in your monthly fee. No prior authorizations, no claim denials, no surprise bills." },
];

const includedItems = [
  "Comprehensive men's health evaluation (30–45 minutes)",
  "Full hormone and metabolic lab panel",
  "Testosterone prescribing and dose optimization",
  "Weekly in-office testosterone injection administration",
  "Testosterone medication included in your monthly fee",
  "Ongoing lab monitoring (CBC, PSA, lipid panel, estradiol, metabolic panel)",
  "Erectile dysfunction evaluation and treatment when indicated",
  "Comorbidity management — blood pressure, cholesterol, diabetes",
  "CURES database compliance checks (controlled substance safety)",
];

const steps = [
  { num: 1, title: "Evaluate", description: "Book your initial consultation. Your provider performs a comprehensive health evaluation including symptom assessment, physical exam, and baseline lab orders." },
  { num: 2, title: "Diagnose", description: "Low testosterone is confirmed with two separate morning blood draws (fasting, before 10 AM) — per Endocrine Society guidelines. We also evaluate for underlying causes." },
  { num: 3, title: "Treat", description: "Begin weekly testosterone cypionate injections administered in our office by clinical staff. Dosing starts conservative and is adjusted based on your labs and symptom response." },
  { num: 4, title: "Optimize", description: "Ongoing lab monitoring and dose adjustments to keep you in your optimal range. Regular safety labs (hematocrit, PSA) ensure your treatment stays safe long-term." },
];

const beyondTrtItems = [
  "Low Testosterone & Hormone Optimization",
  "Erectile Dysfunction",
  "Fatigue & Energy Management",
  "Metabolic Syndrome & Weight Management",
  "Cardiovascular Risk Assessment",
  "Prostate Health Monitoring",
  "Vitamin D & Micronutrient Optimization",
  "Blood Pressure & Cholesterol Management",
];

export default function MensHealthTRT() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const firstInput = formRef.current?.querySelector<HTMLInputElement>("input[name='firstName']");
      firstInput?.focus();
    }, 600);
  };

  return (
    <Layout>
      <SEO
        {...pageSEO.mensHealthTrt}
        structuredData={medicalBusinessSchema}
      />
      <Helmet>
        <meta
          name="keywords"
          content="testosterone replacement therapy, TRT, low testosterone, low T, men's health, testosterone injections, testosterone doctor Pasadena, HCI Medical Group, hypogonadism, erectile dysfunction, hormone therapy"
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${trtHero})` }}
          aria-hidden="true"
        />
        {/* Gradient overlay \u2014 darker on left for text contrast */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/50"
          aria-hidden="true"
        />

        <div className="container relative z-10">
          <p className="text-sm text-primary-foreground/70 font-medium tracking-wide uppercase mb-3 animate-fade-in">
            HCI Medical Group — Pasadena, CA
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 animate-fade-in stagger-1">
            Men's Health &
            <br />
            Testosterone Therapy
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 font-light mb-2 animate-fade-in stagger-2">
            Physician-Supervised TRT with In-Office Injections
          </p>
          <p className="text-base text-primary-foreground/75 max-w-xl mb-8 animate-fade-in stagger-3">
            Restore your energy, strength, and vitality with testosterone replacement therapy
            managed by an experienced internal medicine team. Comprehensive evaluation, in-office
            injections, and ongoing lab monitoring — all under one roof.
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
              <Syringe className="h-4 w-4 mr-2" />
              Enroll Online
            </Button>
            <Button
              asChild
              variant="link"
              className="text-primary-foreground/80 hover:text-primary-foreground text-base"
            >
              <a href="#trt-info">Learn More ↓</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Two-column layout */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-12 items-start">

          <div className="space-y-16">

            {/* Mobile form */}
            <div className="lg:hidden" ref={formRef}>
              <TRTForm />
            </div>

            {/* What Is TRT? */}
            <section id="trt-info">
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Understanding the Treatment</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                What Is Testosterone Replacement Therapy?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Testosterone is the primary male sex hormone responsible for energy, muscle mass,
                  bone density, libido, mood, and cognitive function. Testosterone levels naturally
                  decline with age — roughly 1–2% per year after age 30 — but for many men, levels
                  drop below the threshold where symptoms become significant.
                </p>
                <p>
                  Low testosterone (hypogonadism) is a clinically recognized medical condition,
                  not just a normal part of aging. When confirmed by lab testing, testosterone
                  replacement therapy can restore hormone levels to a healthy range and relieve
                  symptoms that affect daily quality of life.
                </p>
                <p>
                  Our program goes beyond simply prescribing testosterone. As an internal medicine
                  practice, we evaluate and manage your complete health picture — cardiovascular risk,
                  metabolic health, prostate safety, and blood counts — ensuring your treatment is
                  both effective and safe for the long term.
                </p>
              </div>
            </section>

            {/* Symptoms */}
            <section className="bg-accent/50 -mx-4 px-4 py-12 rounded-xl sm:-mx-6 sm:px-6">
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Recognize the Signs</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Common Signs of Low Testosterone
              </h2>
              <p className="text-muted-foreground mb-6">Could low testosterone be affecting you?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {symptomCards.map((card) => (
                  <div key={card.title} className="bg-card rounded-xl p-5 card-shadow border border-border">
                    <div className="w-11 h-11 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                      <card.icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{card.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-6 leading-relaxed">
                If you're experiencing several of these symptoms, a simple morning blood test can
                determine whether low testosterone is a contributing factor. We'll evaluate your
                full health picture before recommending any treatment.
              </p>
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
                Every patient in our Men's Health TRT Program receives:
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
                    <span className="text-foreground">Initial Men's Health Evaluation</span>
                    <span className="text-xl font-bold text-primary">$349</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <span className="text-foreground">Monthly TRT — In-Office Injections</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Includes medication & weekly injections</p>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      $249<span className="text-sm font-normal text-muted-foreground"> / mo</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-foreground">Monthly TRT — Self-Injection</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Monitoring only — you inject at home</p>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      $150<span className="text-sm font-normal text-muted-foreground"> / mo</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border leading-relaxed">
                    Labs are billed to your insurance when medically indicated. No hidden fees.
                    No long-term contracts. Cancel anytime.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                Most patients choose the in-office injection plan — it's the most convenient option
                and ensures you never miss a dose. For patients who prefer to self-inject at home,
                we provide training and a prescription, with regular monitoring visits to keep
                your treatment on track.
              </p>
            </section>

            {/* FAQ */}
            <section>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Common Questions</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Frequently Asked Questions
              </h2>
              <ServiceFAQ faqs={trtFaqs} title="" />
            </section>

            {/* Beyond TRT */}
            <section>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Comprehensive Care</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                What We Treat Beyond TRT
              </h2>
              <p className="text-muted-foreground mb-4">
                Our Men's Health Program addresses the full spectrum of men's health concerns:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {beyondTrtItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                Every visit is an opportunity to address your complete health —
                not just one number on a lab report.
              </p>
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

            {/* Cross-promotion: Weight Loss */}
            <section className="bg-accent/50 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Scale className="h-6 w-6 text-secondary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Also offering: Medical Weight Loss Program</p>
                <p className="text-xs text-muted-foreground">Physician-supervised GLP-1 weight management with semaglutide & tirzepatide.</p>
              </div>
              <Link
                to="/programs/medical-weight-loss"
                className="flex items-center gap-1 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors flex-shrink-0"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            {/* Mobile: repeat form */}
            <div className="lg:hidden">
              <TRTForm id="trt-form-bottom" />
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-[120px]" ref={formRef}>
              <TRTForm />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-lg text-primary-foreground/85 mb-8 max-w-lg mx-auto">
            Call us or visit our office to schedule your Men's Health evaluation.
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
          Individual results vary. Testosterone is a Schedule III controlled substance prescribed only when clinically indicated.
        </p>
      </div>
    </Layout>
  );
}
