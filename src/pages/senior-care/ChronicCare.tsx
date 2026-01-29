import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function ChronicCare() {
  const conditions = [
    "Diabetes (Type 1 and Type 2)",
    "Hypertension (high blood pressure)",
    "Heart disease and heart failure",
    "COPD and respiratory conditions",
    "Arthritis and joint disorders",
    "Kidney disease",
    "Thyroid disorders",
    "Depression and anxiety"
  ];

  return (
    <Layout>
      <SEO {...pageSEO.chronicCare} />
      <PageHero
        title="Chronic Care Management" 
        subtitle="Comprehensive support for managing long-term health conditions"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Living Well with Chronic Conditions
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Managing chronic health conditions requires ongoing attention and a team 
              approach. At HCI Medical Group, we partner with you to create a comprehensive 
              care plan that helps you manage your conditions effectively while maintaining 
              your quality of life.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              Our chronic care management program provides regular monitoring, medication 
              management, lifestyle guidance, and coordination with specialists when needed. 
              We're with you every step of the way.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Conditions We Manage
            </h3>
            <ul className="space-y-3 mb-8">
              {conditions.map((condition, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{condition}</span>
                </li>
              ))}
            </ul>

            <div className="bg-muted rounded-xl p-8 mb-8">
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                Our Approach to Chronic Care
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><strong>Regular monitoring:</strong> Frequent check-ins to track your condition</li>
                <li><strong>Medication management:</strong> Ensuring your medications work together effectively</li>
                <li><strong>Lifestyle coaching:</strong> Guidance on diet, exercise, and daily habits</li>
                <li><strong>Care coordination:</strong> Working with specialists and other providers</li>
                <li><strong>Patient education:</strong> Helping you understand and manage your health</li>
              </ul>
            </div>

            <div className="bg-secondary/10 rounded-xl p-8 mb-8">
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                Medicare Chronic Care Management
              </h3>
              <p className="text-muted-foreground">
                We accept Medicare and participate in Medicare's Chronic Care Management program.
                If you have two or more chronic conditions, you may qualify for additional care
                coordination services covered by Medicare. Ask us how this program can help you
                better manage your health.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/contact">Start Your Care Plan</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/senior-care/remote-monitoring">Remote Monitoring</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}