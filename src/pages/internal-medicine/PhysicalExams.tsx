import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PhysicalExams() {
  const services = [
    "Comprehensive health assessment",
    "Blood pressure and heart rate monitoring",
    "Vision and hearing screening",
    "Laboratory tests (blood work, urinalysis)",
    "Immunization review and updates",
    "Cancer screening recommendations",
    "Lifestyle and nutrition counseling",
    "Personalized health goals and planning"
  ];

  return (
    <Layout>
      <PageHero 
        title="Physical Exams" 
        subtitle="Comprehensive annual wellness visits to keep you healthy"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Your Annual Wellness Visit
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Regular physical exams are one of the most important steps you can take to 
              maintain your health. Our comprehensive wellness visits go beyond just checking 
              your vitals — we take the time to understand your complete health picture.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              During your visit, we'll review your medical history, assess your current health 
              status, and work with you to identify any risk factors or areas of concern. 
              Together, we'll create a personalized plan to help you achieve your health goals.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              What's Included
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
                Preparing for Your Visit
              </h3>
              <p className="text-muted-foreground mb-4">
                To make the most of your annual physical:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Fast for 8-12 hours before your appointment if bloodwork is scheduled</li>
                <li>• Bring a list of all current medications and supplements</li>
                <li>• Write down any health questions or concerns</li>
                <li>• Bring your insurance card and photo ID</li>
                <li>• Wear comfortable, loose-fitting clothing</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/contact">Schedule Your Physical</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/internal-medicine/diagnostics">Learn About Diagnostics</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}