import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function RemoteMonitoring() {
  const services = [
    "Video telehealth appointments",
    "Remote blood pressure monitoring",
    "Blood glucose tracking",
    "Weight monitoring",
    "Pulse oximetry",
    "Symptom tracking and reporting",
    "Medication reminders",
    "24/7 data monitoring by care team"
  ];

  return (
    <Layout>
      <PageHero 
        title="Remote Monitoring" 
        subtitle="Advanced care from the comfort of your home"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Connected Care, Anywhere
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Remote patient monitoring allows us to keep a close eye on your health 
              between office visits. Using easy-to-use devices and telehealth technology, 
              we can track your vital signs, detect changes early, and provide timely 
              interventions — all from the comfort of your home.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              This technology is especially valuable for patients managing chronic conditions 
              like heart disease, diabetes, and hypertension. It gives you peace of mind 
              knowing that your healthcare team is always connected and ready to help.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Our Remote Care Services
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
                How It Works
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>1. Setup:</strong> We provide you with easy-to-use monitoring devices
                  and show you how to use them.
                </p>
                <p>
                  <strong>2. Daily Readings:</strong> You take your readings at home — it only
                  takes a few minutes each day.
                </p>
                <p>
                  <strong>3. Continuous Monitoring:</strong> Your data is securely transmitted
                  to our care team for review.
                </p>
                <p>
                  <strong>4. Proactive Care:</strong> If we notice any concerning changes,
                  we reach out to you right away.
                </p>
              </div>
            </div>

            <div className="bg-secondary/10 rounded-xl p-6 mb-8">
              <p className="text-muted-foreground">
                <strong>Medicare patients:</strong> Remote Patient Monitoring may be covered
                by Medicare for qualifying conditions. We accept Medicare and can help you
                determine if this service is right for you. Call us at 626-792-4185 to learn more.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/contact">Learn More About Remote Care</Link>
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