import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import infographic from "@/assets/services/seniorcare_infographic.png";
import {
  Heart,
  Shield,
  Users,
  Phone,
  UserCheck,
  Stethoscope,
  ArrowRight,
  Activity,
  Home,
  ClipboardCheck,
} from "lucide-react";

export default function SeniorCarePlus() {
  return (
    <Layout>
      <PageHero
        title="Senior Care+"
        subtitle="Comprehensive Care Management for Seniors"
      />

      {/* Program Introduction */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              What is Senior Care+?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Senior Care+ is HCI Medical Group's comprehensive care management program
              designed specifically for older adults. We integrate internal medicine expertise
              with specialized senior services to provide complete, coordinated healthcare
              that addresses every aspect of your well-being.
            </p>
            <p className="text-lg text-muted-foreground">
              With Senior Care+, you're not just a patient — you're a partner in your health journey,
              supported by a dedicated team that knows you by name.
            </p>
          </div>
        </div>
      </section>

      {/* Key Benefits Bar */}
      <section className="bg-primary py-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-secondary" aria-hidden="true" />
              <span className="text-primary-foreground font-medium text-sm md:text-base">
                Comprehensive Coordination
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <UserCheck className="h-8 w-8 text-secondary" aria-hidden="true" />
              <span className="text-primary-foreground font-medium text-sm md:text-base">
                Continuity of Care
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ClipboardCheck className="h-8 w-8 text-secondary" aria-hidden="true" />
              <span className="text-primary-foreground font-medium text-sm md:text-base">
                Medicare Expertise
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-secondary" aria-hidden="true" />
              <span className="text-primary-foreground font-medium text-sm md:text-base">
                Family Involvement
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Infographic Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Patient-Centered Senior Care
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our integrated approach puts you at the center, with four essential
              pillars of care working together to support your health.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <img
              src={infographic}
              alt="Senior Care+ program diagram showing patient-centered care at the center, connecting to four services: Prevention & Wellness (proactive health screenings and lifestyle guidance), Chronic Care (managing ongoing conditions with coordination and support), Transition of Care (seamless transfers between healthcare facilities and home), and Remote Monitoring (technology to track health data from home)"
              className="w-full h-auto rounded-xl shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Four Pillars Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Four Pillars of Senior Care+
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each component works together to provide complete, coordinated care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Prevention & Wellness */}
            <Link
              to="/senior-care/prevention-wellness"
              className="bg-card rounded-xl p-8 card-shadow card-hover-lift group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <Heart className="h-7 w-7 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-secondary transition-colors">
                  Prevention & Wellness
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Proactive health screenings, lifestyle guidance, and preventive care
                to maintain your well-being and catch issues early.
              </p>
              <span className="inline-flex items-center gap-2 text-secondary font-medium">
                Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>

            {/* Chronic Care */}
            <Link
              to="/senior-care/chronic-care"
              className="bg-card rounded-xl p-8 card-shadow card-hover-lift group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <Stethoscope className="h-7 w-7 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-secondary transition-colors">
                  Chronic Care Management
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Coordinated management of ongoing conditions with personalized care plans,
                regular check-ins, and specialist coordination.
              </p>
              <span className="inline-flex items-center gap-2 text-secondary font-medium">
                Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>

            {/* Transition of Care */}
            <Link
              to="/senior-care/transition-care"
              className="bg-card rounded-xl p-8 card-shadow card-hover-lift group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <Home className="h-7 w-7 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-secondary transition-colors">
                  Transition of Care
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Seamless, safe transfers between hospital, rehabilitation facilities,
                and home with continuous support and follow-up.
              </p>
              <span className="inline-flex items-center gap-2 text-secondary font-medium">
                Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>

            {/* Remote Monitoring */}
            <Link
              to="/senior-care/remote-monitoring"
              className="bg-card rounded-xl p-8 card-shadow card-hover-lift group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <Activity className="h-7 w-7 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-secondary transition-colors">
                  Remote Monitoring
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Advanced technology to track vital health data from the comfort of your home,
                with real-time alerts and proactive care.
              </p>
              <span className="inline-flex items-center gap-2 text-secondary font-medium">
                Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Senior Care+ Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Senior Care+?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-2">Same Provider, Every Visit</h3>
                <p className="text-muted-foreground">
                  Build a lasting relationship with providers who know your history,
                  your preferences, and your health goals. No more starting over with a new face.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-2">Medicare Specialists</h3>
                <p className="text-muted-foreground">
                  We understand Medicare programs inside and out. Our team helps you navigate
                  coverage options and maximize your benefits.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-2">Family Communication</h3>
                <p className="text-muted-foreground">
                  With your permission, we keep your family informed and involved in your care.
                  Peace of mind for you and your loved ones.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-2">Coordinated Specialist Care</h3>
                <p className="text-muted-foreground">
                  When you need a specialist, we coordinate referrals and share information
                  so nothing falls through the cracks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 hero-gradient">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Is Senior Care+ Right for You?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Schedule a consultation to learn how our comprehensive senior care program
            can support your health and independence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 min-h-[48px]"
            >
              <Link to="/contact">Schedule a Consultation</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 min-h-[48px]"
            >
              <a href="tel:626-792-4185">
                <Phone className="h-5 w-5 mr-2" aria-hidden="true" />
                Call 626-792-4185
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
