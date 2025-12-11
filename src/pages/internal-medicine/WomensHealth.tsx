import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function WomensHealth() {
  const services = [
    "Annual well-woman exams",
    "Breast health and mammogram coordination",
    "Cervical cancer screening (Pap smears)",
    "Bone density screening and osteoporosis prevention",
    "Menopause management and hormone health",
    "Thyroid disorder screening and treatment",
    "Heart health assessment for women",
    "Mental health and wellness support"
  ];

  return (
    <Layout>
      <PageHero 
        title="Women's Health" 
        subtitle="Comprehensive care tailored to women's unique health needs"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Healthcare Designed for Women
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Women have unique health needs that change throughout life. At HCI Medical Group, 
              we provide compassionate, comprehensive care that addresses every aspect of 
              women's health — from preventive screenings to managing complex conditions.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              Our approach combines the latest medical knowledge with personalized attention. 
              We take time to understand your concerns, answer your questions, and develop 
              care plans that fit your lifestyle and goals.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Our Women's Health Services
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
                Preventive Care is Key
              </h3>
              <p className="text-muted-foreground">
                Regular screenings can detect many health issues early when they're most 
                treatable. We'll work with you to create a personalized screening schedule 
                based on your age, health history, and risk factors. Don't wait until 
                something feels wrong — prevention is the best medicine.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/contact">Schedule an Appointment</Link>
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