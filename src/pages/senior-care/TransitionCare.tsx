import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function TransitionCare() {
  const services = [
    "Post-hospital discharge follow-up",
    "Medication reconciliation",
    "Care plan review and updates",
    "Communication with hospital providers",
    "Scheduling follow-up appointments",
    "Home care coordination",
    "Family and caregiver education",
    "Preventing readmission"
  ];

  return (
    <Layout>
      <PageHero 
        title="Transition of Care" 
        subtitle="Seamless support when moving between care settings"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Safe Transitions, Better Outcomes
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              The period after a hospital stay or change in care setting is a critical time. 
              Without proper coordination, patients are at higher risk for complications, 
              medication errors, and readmission. Our transition of care services ensure 
              you have the support you need during these vulnerable times.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              We work closely with hospitals, skilled nursing facilities, and home health 
              agencies to ensure continuity of care. Our team reviews your discharge 
              instructions, reconciles your medications, and schedules timely follow-up 
              visits to keep you on track.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Our Transition Services Include
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
                After Your Hospital Stay
              </h3>
              <p className="text-muted-foreground mb-4">
                If you or a loved one has been hospitalized, please contact our office as
                soon as possible. We recommend scheduling a follow-up appointment within
                7 days of discharge to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Review your hospital care and discharge instructions</li>
                <li>• Ensure all medications are correct and working together</li>
                <li>• Address any new symptoms or concerns</li>
                <li>• Connect you with any additional services you may need</li>
              </ul>
            </div>

            <div className="bg-secondary/10 rounded-xl p-6 mb-8">
              <p className="text-muted-foreground">
                <strong>Medicare patients:</strong> Transition care services are an important
                part of preventing hospital readmissions. We accept Medicare and work to ensure
                you receive all covered post-discharge care. Call us at 626-792-4185 after any
                hospital stay.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/contact">Schedule Follow-Up Care</Link>
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