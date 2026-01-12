import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, Phone } from "lucide-react";

export default function AcuteCare() {
  const conditions = [
    "Coughs, colds, and flu",
    "Sore throat and ear infections",
    "Sinus infections and congestion",
    "Urinary tract infections (UTIs)",
    "Skin rashes and minor infections",
    "Minor cuts, sprains, and strains",
    "Allergic reactions",
    "Fever and body aches",
    "Stomach issues (nausea, diarrhea)",
    "Headaches and migraines"
  ];

  return (
    <Layout>
      <PageHero
        title="Acute Care"
        subtitle="Prompt treatment for illness, infections, and minor injuries"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Feeling Under the Weather?
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              When you're not feeling well, you shouldn't have to wait weeks to see a doctor
              or spend hours at an urgent care clinic. At HCI Medical Group, we reserve
              appointment slots specifically for patients who need to be seen quickly.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              Whether it's a persistent cough, a painful ear infection, or a minor injury,
              our team is here to diagnose and treat you — often on the same day or within
              the same week you call.
            </p>

            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Same-Week Appointments Available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We understand that illness doesn't wait. Call us when you're sick and
                    we'll work to get you in as soon as possible.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Conditions We Treat
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
                When to Seek Emergency Care
              </h3>
              <p className="text-muted-foreground mb-4">
                Our office treats non-emergency illnesses and injuries. Please call 911
                or go to your nearest emergency room for:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Chest pain or difficulty breathing</li>
                <li>• Signs of stroke (facial drooping, arm weakness, speech difficulty)</li>
                <li>• Severe allergic reactions (anaphylaxis)</li>
                <li>• Uncontrolled bleeding or deep wounds</li>
                <li>• High fever with confusion or stiff neck</li>
                <li>• Serious injuries from accidents or falls</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 card-shadow mb-8">
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                Need to Be Seen Today?
              </h3>
              <p className="text-muted-foreground mb-4">
                Call our office to check same-day availability. Let us know your symptoms
                and we'll do our best to fit you in.
              </p>
              <a
                href="tel:626-792-4185"
                className="inline-flex items-center gap-2 text-secondary hover:underline font-medium"
              >
                <Phone className="h-5 w-5" />
                (626) 792-4185
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/appointments">Request Appointment</Link>
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
