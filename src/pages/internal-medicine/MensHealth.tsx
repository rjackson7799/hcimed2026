import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function MensHealth() {
  const services = [
    "Annual wellness exams",
    "Prostate health screening (PSA testing)",
    "Cardiovascular risk assessment",
    "Diabetes screening and management",
    "Cholesterol and lipid management",
    "Testosterone level evaluation",
    "Colorectal cancer screening",
    "Mental health and stress management"
  ];

  return (
    <Layout>
      <PageHero 
        title="Men's Health" 
        subtitle="Proactive care for men at every stage of life"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Take Charge of Your Health
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Men often put off healthcare visits, but regular check-ups are essential for 
              catching problems early and maintaining long-term health. At HCI Medical Group, 
              we make it easy to stay on top of your health with comprehensive, efficient care.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              Our men's health services address the specific health challenges men face, 
              from heart disease and prostate health to managing stress and maintaining 
              energy levels. We're here to help you live your healthiest life.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Our Men's Health Services
            </h3>
            <ul className="space-y-3 mb-8">
              {services.map((service, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{service}</span>
                </li>
              ))}
            </ul>

            <div className="bg-muted rounded-xl p-8 mb-8">
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                Know Your Numbers
              </h3>
              <p className="text-muted-foreground">
                Understanding key health metrics — like blood pressure, cholesterol levels, 
                blood sugar, and PSA — gives you power over your health. We'll help you 
                understand what these numbers mean and what steps you can take to improve them.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/contact">Schedule an Appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/internal-medicine/diagnostics">Diagnostic Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}