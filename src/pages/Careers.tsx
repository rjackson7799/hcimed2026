import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import {
  Heart,
  Users,
  TrendingUp,
  Clock,
  Briefcase,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  {
    icon: Heart,
    title: "Patient-Centered Care",
    description:
      "Join a practice where you have time to truly know your patients and make a lasting impact on their health.",
  },
  {
    icon: Users,
    title: "Collaborative Team",
    description:
      "Work alongside experienced healthcare professionals in a supportive, team-oriented environment.",
  },
  {
    icon: TrendingUp,
    title: "Professional Growth",
    description:
      "Access continuing education opportunities and develop your skills in a growing practice.",
  },
  {
    icon: Clock,
    title: "Work-Life Balance",
    description:
      "Enjoy reasonable schedules and a culture that respects your time outside of work.",
  },
];

const JOB_POSITIONS = [
  {
    id: "medical-assistant",
    title: "Medical Assistant",
    icon: Briefcase,
    description:
      "Join our clinical team as a Medical Assistant and play a vital role in delivering exceptional patient care. You'll work directly with our providers to ensure every patient receives personalized, compassionate attention.",
    responsibilities: [
      "Prepare patients for examinations and procedures",
      "Record vital signs and medical history in EHR",
      "Assist physicians during examinations",
      "Perform routine laboratory tests and EKGs",
      "Administer medications as directed",
      "Coordinate patient scheduling and follow-up care",
    ],
    qualifications: [
      "Medical Assistant certification (CMA, RMA, or CCMA)",
      "CPR/BLS certification required",
      "1+ years of clinical experience preferred",
      "Proficiency with electronic health records",
      "Excellent communication skills",
      "Bilingual (English/Spanish) a plus",
    ],
  },
  {
    id: "provider",
    title: "Healthcare Provider",
    subtitle: "NP, PA, MD, DO",
    icon: Stethoscope,
    description:
      "We're seeking experienced healthcare providers who share our commitment to relationship-based medicine. Join a practice where you can truly know your patients and provide continuity of care that makes a difference.",
    responsibilities: [
      "Conduct comprehensive patient examinations",
      "Diagnose and treat acute and chronic conditions",
      "Order and interpret diagnostic tests",
      "Develop treatment plans in collaboration with patients",
      "Manage chronic disease patients (CCM, RPM programs)",
      "Collaborate with specialists for coordinated care",
    ],
    qualifications: [
      "Active California medical license (NP, PA, MD, or DO)",
      "Board certification in Internal Medicine or Family Medicine",
      "DEA registration required",
      "3+ years of clinical experience preferred",
      "Experience with geriatric populations a plus",
      "Strong EHR documentation skills",
    ],
  },
];

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Heart;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/20 mb-4">
        <Icon className="h-7 w-7 text-secondary" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function JobCard({
  title,
  subtitle,
  icon: Icon,
  description,
  responsibilities,
  qualifications,
}: {
  title: string;
  subtitle?: string;
  icon: typeof Briefcase;
  description: string;
  responsibilities: string[];
  qualifications: string[];
}) {
  return (
    <div className="bg-card rounded-xl p-6 md:p-8 card-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
          <Icon className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-secondary font-medium">{subtitle}</p>
          )}
        </div>
      </div>

      <p className="text-muted-foreground mb-6">{description}</p>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">
            Key Responsibilities
          </h4>
          <ul className="space-y-1.5">
            {responsibilities.slice(0, 4).map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2">Qualifications</h4>
          <ul className="space-y-1.5">
            {qualifications.slice(0, 4).map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Careers() {
  return (
    <Layout>
      <SEO {...pageSEO.careers} />
      <PageHero
        title="Join Our Team"
        subtitle="Build a rewarding career in compassionate healthcare with HCI Medical Group"
      />

      {/* Why Work With Us */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Work With Us
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              At HCI Medical Group, we believe in creating an environment where
              healthcare professionals can thrive while making a meaningful
              difference in patients' lives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <BenefitCard key={benefit.title} {...benefit} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-secondary/10">
        <div className="container text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Join Our Team?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            We're looking for passionate healthcare professionals who share our
            commitment to compassionate patient care.
          </p>
          <Button
            size="lg"
            onClick={() =>
              document
                .getElementById("application-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Apply Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're always looking for talented individuals who share our passion
              for patient-centered care. Explore our current openings below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {JOB_POSITIONS.map((position) => (
              <JobCard key={position.id} {...position} />
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Apply Now
              </h2>
              <p className="text-muted-foreground">
                Ready to join our team? Complete the application below. All
                fields marked with <span className="text-destructive">*</span>{" "}
                are required.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 md:p-8 card-shadow">
              <ApplicationForm />
            </div>
          </div>
        </div>
      </section>

      {/* Equal Opportunity Statement */}
      <section className="py-12 bg-muted">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-display text-lg font-semibold text-foreground mb-3">
              Equal Opportunity Employer
            </h3>
            <p className="text-sm text-muted-foreground">
              HCI Medical Group is an equal opportunity employer. We celebrate
              diversity and are committed to creating an inclusive environment
              for all employees. All qualified applicants will receive
              consideration for employment without regard to race, color,
              religion, gender, gender identity or expression, sexual
              orientation, national origin, genetics, disability, age, or veteran
              status.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
