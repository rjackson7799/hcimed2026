import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PreventionWellness() {
  const services = [
    "Annual wellness visits and Medicare wellness exams",
    "Age-appropriate cancer screenings",
    "Immunizations (flu, pneumonia, shingles)",
    "Fall risk assessment and prevention",
    "Cognitive health screening",
    "Nutrition and exercise counseling",
    "Medication review and management",
    "Advanced care planning discussions"
  ];

  return (
    <Layout>
      <SEO {...pageSEO.preventionWellness} />
      <PageHero
        title="Prevention & Wellness" 
        subtitle="Proactive care to help seniors live their healthiest lives"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Staying Healthy as You Age
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Prevention is especially important as we age. Regular screenings and wellness 
              visits can catch health issues early, when they're easier to treat, and help 
              you maintain your independence and quality of life.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              Our senior wellness program takes a comprehensive approach to healthy aging. 
              We don't just treat illness — we work with you to prevent problems before 
              they start and help you feel your best every day.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Our Prevention & Wellness Services
            </h3>
            <ul className="space-y-3 mb-8">
              {services.map((service, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{service}</span>
                </li>
              ))}
            </ul>

            <div className="bg-secondary/10 rounded-xl p-8 mb-8">
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                Medicare Annual Wellness Visits
              </h3>
              <p className="text-muted-foreground mb-4">
                If you have Medicare, you're entitled to an annual wellness visit at no cost
                to you. This visit focuses on creating a personalized prevention plan,
                reviewing your health risks, and making sure you're up to date on recommended
                screenings and immunizations.
              </p>
              <p className="text-muted-foreground font-medium">
                We accept Medicare and all covered preventive services. Call us at 626-792-4185
                to schedule your annual wellness visit.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/contact">Schedule a Wellness Visit</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/senior-care/chronic-care">Chronic Care Management</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}