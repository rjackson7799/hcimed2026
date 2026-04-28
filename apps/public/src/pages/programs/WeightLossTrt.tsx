import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  UserPlus,
  Check,
  ArrowRight,
  ChevronDown,
  Heart,
  Stethoscope,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@hci/shared/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { ProgramsInquiryForm } from "@/components/programs/ProgramsInquiryForm";
import { FriendsFamilyPopup } from "@/components/programs/FriendsFamilyPopup";
import { FriendsFamilyBubble } from "@/components/programs/FriendsFamilyBubble";
import { pageSEO } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { cn } from "@hci/shared/lib/utils";

const FF_DEADLINE = "May 31, 2026";

const trustItems = [
  { icon: Stethoscope, label: "Physician-Supervised" },
  { icon: Heart, label: "Personalized Plans" },
  { icon: Gift, label: "HCI Patient Savings — F&F 15%" },
  { icon: UserPlus, label: "Accepting New Patients" },
];

const weightLossBenefits = [
  "FDA-approved medications including GLP-1 / Semaglutide",
  "Personalized nutrition and metabolic planning",
  "Regular physician check-ins and lab monitoring",
  "Sustainable, long-term weight management",
  "Support for weight-related conditions",
];

const trtBenefits = [
  "Comprehensive hormone and lab panel testing",
  "Customized TRT dosing and delivery method",
  "Improved energy, focus, and mental clarity",
  "Increased lean muscle and reduced body fat",
  "Ongoing monitoring and dose adjustments",
];

const referralSteps = [
  {
    icon: Stethoscope,
    title: "You're an HCI Patient",
    description:
      "Any current HCI Medical Group patient automatically qualifies — no enrollment required.",
  },
  {
    icon: Gift,
    title: "Share 15% Off the New Programs",
    description:
      "Extend the discount to yourself, your family members, and your friends.",
  },
  {
    icon: Users,
    title: "You & Loved Ones Save",
    description:
      "Everyone saves 15% on Medical Weight Loss and TRT program enrollment.",
  },
];

type FaqTab = "weight-loss" | "trt" | "friends-family";

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

const faqContent: Record<FaqTab, FaqItem[]> = {
  "weight-loss": [
    {
      q: "What makes HCI's Medical Weight Loss program different from commercial diets?",
      a: "Our program is supervised by licensed internal medicine physicians who treat obesity as a chronic medical condition. We use FDA-approved medications (including GLP-1 therapies like Semaglutide), lab work, and metabolic analysis to build a plan tailored to your body — not a one-size-fits-all approach.",
    },
    {
      q: "Am I a candidate for GLP-1 / Semaglutide therapy?",
      a: "GLP-1 medications are typically indicated for adults with a BMI of 27 or higher, especially those with weight-related conditions like type 2 diabetes, hypertension, or high cholesterol. During your initial consultation, our physician will review your medical history, lab results, and goals to determine whether GLP-1 therapy is appropriate for you.",
    },
    {
      q: "How much weight can I expect to lose, and how quickly?",
      a: "Results vary based on your individual health profile, starting weight, medication response, and adherence to the program. Many patients lose 1–2 lbs per week during active treatment. Clinical studies on GLP-1 therapies show average weight loss of 15–20% of body weight over 12–18 months.",
    },
    {
      q: "What does the program cost, and does insurance cover it?",
      a: (
        <>
          Program pricing depends on your individualized treatment plan. We work with you
          to maximize any applicable insurance coverage and provide transparent pricing
          before you commit to anything. For full pricing, see the{" "}
          <Link
            to="/programs/medical-weight-loss"
            className="text-secondary font-semibold hover:underline"
          >
            Medical Weight Loss program page
          </Link>
          .
        </>
      ),
    },
  ],
  trt: [
    {
      q: "How do I know if I have low testosterone?",
      a: "Common signs of low testosterone include persistent fatigue, reduced sex drive, difficulty concentrating, mood changes, increased body fat, decreased muscle mass, and poor sleep. The only way to confirm is through a blood test measuring your total and free testosterone levels — included in your initial evaluation.",
    },
    {
      q: "Is Testosterone Replacement Therapy safe?",
      a: "When administered under proper physician supervision with regular lab monitoring, TRT is considered safe and effective for men with clinically low testosterone. Our program includes ongoing bloodwork to monitor hematocrit, PSA, and other key markers.",
    },
    {
      q: "What delivery methods are available for TRT?",
      a: "We offer multiple delivery options based on your preference, lifestyle, and clinical needs — including injectable testosterone, topical gels or creams, and other forms. During your consultation, your physician will recommend the method best suited to you.",
    },
    {
      q: "How long before I notice results from TRT?",
      a: (
        <>
          Most men notice improvements in energy and mood within 3–6 weeks. Sexual
          function and libido often improve within 1–3 months. Body composition changes
          typically appear over 3–6 months. See the{" "}
          <Link
            to="/programs/mens-health-trt"
            className="text-secondary font-semibold hover:underline"
          >
            full TRT program page
          </Link>{" "}
          for details.
        </>
      ),
    },
  ],
  "friends-family": [
    {
      q: "Do I need to be enrolled in a program to qualify for the 15% discount?",
      a: "No. Any current HCI Medical Group patient — or a member of their household — qualifies for the 15% Friends & Family discount on the new programs. You don't need to be enrolled in Medical Weight Loss or TRT yourself.",
    },
    {
      q: "What's the deadline?",
      a: (
        <>
          New patients must register by{" "}
          <strong className="text-foreground">{FF_DEADLINE}</strong> to claim the
          Friends & Family discount. After that date, the introductory pricing is no
          longer available.
        </>
      ),
    },
    {
      q: "Who counts as family or a friend?",
      a: "Anyone you'd like to share the discount with — spouses, parents, adult children, siblings, in-laws, neighbors, coworkers, close friends. There's no formal household-relationship requirement.",
    },
    {
      q: "How does the 15% discount apply?",
      a: "The discount applies to new enrollments in our Medical Weight Loss and TRT programs. It applies to program enrollment fees and does not stack with other promotions. Mention the Friends & Family program when our care team contacts you.",
    },
  ],
};

const faqTabs: Array<{ id: FaqTab; label: string }> = [
  { id: "weight-loss", label: "Medical Weight Loss" },
  { id: "trt", label: "Men's Health & TRT" },
  { id: "friends-family", label: "Friends & Family" },
];

export default function WeightLossTrt() {
  const formRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<FaqTab>("weight-loss");
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});
  const [defaultIsHciPatient, setDefaultIsHciPatient] = useState<
    "yes" | "no" | undefined
  >(undefined);
  const [popupOpen, setPopupOpen] = useState(false);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const firstInput =
        formRef.current?.querySelector<HTMLInputElement>("input[name='firstName']");
      firstInput?.focus();
    }, 600);
  }

  function handleFFClaim() {
    setDefaultIsHciPatient("yes");
    scrollToForm();
  }

  function toggleFaq(tab: FaqTab, idx: number) {
    const key = `${tab}-${idx}`;
    setOpenFaqs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Layout>
      <SEO {...pageSEO.weightLossTrt} />

      {/* HERO */}
      <section className="hero-gradient text-primary-foreground py-16 md:py-20">
        <div className="container max-w-4xl text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-secondary-foreground/80 mb-4">
            HCI Medical Group · New Programs
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
            Real Results.
            <br />
            <span className="text-white/95">Physician-Guided</span> Programs.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/85 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
            Unlock lasting change with our Medical Weight Loss and Men's Health &
            Testosterone Therapy programs — evidence-based care tailored to you.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              size="lg"
              onClick={scrollToForm}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-base px-7 min-h-[52px] font-semibold"
            >
              Get Started Today
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white text-base px-7 min-h-[52px] font-semibold"
            >
              <a href="#programs">Learn About the Programs</a>
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-primary border-t border-white/10 py-4">
        <div className="container max-w-4xl">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {trustItems.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-primary-foreground/80 text-xs md:text-sm font-semibold tracking-wide"
              >
                <item.icon className="h-4 w-4 text-secondary-foreground" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* PROGRAMS */}
      <section id="programs" className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-secondary mb-2">
            Our Programs
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Two Programs. Life-Changing Results.
          </h2>
          <p className="text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Both programs are physician-led, individualized, and designed to deliver
            measurable outcomes — not just temporary fixes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Loss */}
            <article className="bg-card rounded-xl border border-border card-shadow flex flex-col overflow-hidden">
              <header className="bg-primary text-primary-foreground p-6">
                <span className="inline-block bg-secondary text-secondary-foreground text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded mb-3">
                  Medical Weight Loss
                </span>
                <h3 className="font-display text-xl font-bold leading-snug mb-1.5">
                  Physician-Led Medical Weight Loss
                </h3>
                <p className="text-sm text-primary-foreground/75 leading-relaxed">
                  A clinically supervised program that goes beyond dieting — treating
                  weight as the medical condition it is.
                </p>
              </header>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Combines prescription medications (including GLP-1 therapies),
                  metabolic testing, nutritional coaching, and ongoing physician
                  oversight for sustainable results.
                </p>
                <ul className="space-y-2.5 mb-5 flex-1">
                  {weightLossBenefits.map((b) => (
                    <li key={b} className="flex gap-2.5 items-start text-sm text-foreground">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-secondary-foreground" />
                      </span>
                      <span className="leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/programs/medical-weight-loss"
                  className="text-sm font-bold text-secondary hover:text-secondary/80 transition-colors inline-flex items-center gap-1.5"
                >
                  View Full Program Details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            {/* TRT */}
            <article className="bg-card rounded-xl border border-border card-shadow flex flex-col overflow-hidden">
              <header className="bg-primary text-primary-foreground p-6">
                <span className="inline-block bg-secondary text-secondary-foreground text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded mb-3">
                  Men's Health & TRT
                </span>
                <h3 className="font-display text-xl font-bold leading-snug mb-1.5">
                  Testosterone Replacement Therapy
                </h3>
                <p className="text-sm text-primary-foreground/75 leading-relaxed">
                  Restore energy, strength, and vitality with a personalized men's
                  hormone health program.
                </p>
              </header>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Starts with comprehensive lab testing and delivers individualized
                  therapy to restore optimal hormone balance safely and effectively.
                </p>
                <ul className="space-y-2.5 mb-5 flex-1">
                  {trtBenefits.map((b) => (
                    <li key={b} className="flex gap-2.5 items-start text-sm text-foreground">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-secondary-foreground" />
                      </span>
                      <span className="leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/programs/mens-health-trt"
                  className="text-sm font-bold text-secondary hover:text-secondary/80 transition-colors inline-flex items-center gap-1.5"
                >
                  View Full Program Details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* FRIENDS & FAMILY */}
      <section className="hero-gradient text-primary-foreground py-16 md:py-20">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-secondary-foreground/85">
              Friends &amp; Family Program
            </p>
            <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded">
              <Clock className="h-3 w-3" /> Limited Time
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            A Special Gift for Our HCI Patients
          </h2>
          <p className="text-base md:text-lg text-primary-foreground/85 max-w-2xl leading-relaxed mb-2">
            As a thank-you to our HCI patients, we're offering an exclusive{" "}
            <strong className="text-white">15% discount</strong> on our new Medical
            Weight Loss and TRT programs — for you, your family, and your friends.
          </p>
          <p className="text-sm text-primary-foreground/75 mb-9">
            New patients must register by{" "}
            <strong className="text-white">{FF_DEADLINE}</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {referralSteps.map((step, i) => (
              <div
                key={step.title}
                className="bg-white/[0.07] border border-white/10 rounded-lg p-6 text-center"
              >
                <div className="font-display text-4xl font-bold text-secondary-foreground/90 mb-2">
                  {i + 1}
                </div>
                <h3 className="text-base font-bold mb-2">{step.title}</h3>
                <p className="text-xs text-primary-foreground/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white/[0.05] border border-white/10 border-l-4 border-l-secondary rounded p-4 text-xs text-primary-foreground/80 leading-relaxed max-w-2xl">
            <strong className="text-white">Program Terms:</strong> The Friends &amp;
            Family discount applies to new enrollments in our Medical Weight Loss and
            TRT programs only. Any current HCI Medical Group patient (or someone in
            their household) qualifies — no formal program enrollment required to
            extend the discount. New patients must register by {FF_DEADLINE}. Discount
            applies to program enrollment fees and does not stack with other
            promotions. Ask our care team for details.
          </div>

          <div className="mt-8">
            <Button
              size="lg"
              onClick={scrollToForm}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-7 min-h-[52px] font-semibold"
            >
              Claim Your 15%
            </Button>
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section className="bg-accent/40 py-16 md:py-20" ref={formRef}>
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-secondary mb-2">
              Take the First Step
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Fill out the form below and a member of our care team will reach out to
              answer your questions and guide you through the next steps.
            </p>
          </div>
          <ProgramsInquiryForm defaultIsHciPatient={defaultIsHciPatient} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-secondary mb-2">
            Frequently Asked Questions
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
            Answers to Common Questions
          </h2>

          <div className="flex flex-wrap gap-1 border-b-2 border-border mb-8 -mb-[2px]">
            {faqTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 md:px-6 py-3 text-sm font-bold transition-colors border-b-2 -mb-[2px]",
                  activeTab === tab.id
                    ? "text-foreground border-secondary"
                    : "text-muted-foreground border-transparent hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-0">
            {faqContent[activeTab].map((item, i) => {
              const key = `${activeTab}-${i}`;
              const open = !!openFaqs[key];
              return (
                <div key={key} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => toggleFaq(activeTab, i)}
                    className="w-full py-4 flex justify-between items-start gap-4 text-left text-foreground hover:text-secondary transition-colors"
                    aria-expanded={open}
                  >
                    <span className="font-bold text-sm md:text-base leading-snug">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 flex-shrink-0 mt-0.5 transition-transform",
                        open && "rotate-180 text-secondary",
                      )}
                    />
                  </button>
                  {open && (
                    <div className="pb-5 pr-8 text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-5 bg-accent border border-secondary/30 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Still have questions?
              </p>
              <p className="text-xs text-muted-foreground">
                Our care team is happy to help — no commitment required.
              </p>
            </div>
            <Button
              onClick={scrollToForm}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold whitespace-nowrap"
            >
              Ask Us Anything
            </Button>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-primary text-primary-foreground py-14 md:py-16 text-center">
        <div className="container max-w-2xl">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-secondary-foreground/80 mb-3">
            HCI Medical Group
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 leading-tight">
            Your Health Journey Starts Here.
          </h2>
          <p className="text-base text-primary-foreground/75 max-w-md mx-auto mb-7 leading-relaxed">
            Don't wait for the right moment. Take the first step toward lasting health
            today.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              size="lg"
              onClick={scrollToForm}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-7 min-h-[52px] font-semibold"
            >
              Request Information →
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white px-7 min-h-[52px] font-semibold"
            >
              <a href={`tel:${siteConfig.contact.phoneRaw}`}>
                Call {siteConfig.contact.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <FriendsFamilyPopup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        onClaim={handleFFClaim}
      />
      <FriendsFamilyBubble onClick={() => setPopupOpen(true)} />
    </Layout>
  );
}
