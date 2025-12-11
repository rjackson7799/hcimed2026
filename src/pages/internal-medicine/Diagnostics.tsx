import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function Diagnostics() {
  const services = [
    "Complete blood count (CBC)",
    "Comprehensive metabolic panel",
    "Lipid profile (cholesterol testing)",
    "Thyroid function tests",
    "Hemoglobin A1C (diabetes screening)",
    "Urinalysis",
    "EKG / Electrocardiogram",
    "Referrals for imaging (X-ray, MRI, CT)"
  ];

  return (
    <Layout>
      <PageHero 
        title="Diagnostics" 
        subtitle="In-office testing and laboratory services for accurate diagnoses"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Accurate Diagnosis, Better Care
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Accurate diagnosis is the foundation of effective treatment. Our diagnostic 
              services help us understand exactly what's going on with your health so we 
              can develop the right treatment plan for you.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              We offer a range of in-office testing capabilities for your convenience, 
              and we coordinate with trusted laboratories and imaging centers when 
              additional tests are needed.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Our Diagnostic Services
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
                What to Expect
              </h3>
              <p className="text-muted-foreground mb-4">
                Many diagnostic tests can be performed during your regular office visit. 
                For blood tests, you may need to fast beforehand — we'll let you know 
                when you schedule your appointment.
              </p>
              <p className="text-muted-foreground">
                Results are typically available within a few days. We'll contact you to 
                discuss your results and any recommended next steps.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/contact">Schedule Testing</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/internal-medicine/physical-exams">Annual Physical Exams</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}